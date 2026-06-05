import { createHash } from "crypto";
import type { SupabaseClient } from "@supabase/supabase-js";

export type RateLimitResult = {
  allowed: boolean;
  remaining: number;
  resetAt: string;
  retryAfterSeconds?: number;
  reason?: "limited" | "store_unavailable" | "store_error";
};

type RateLimitOptions = {
  supabase: SupabaseClient | null;
  route: string;
  keyParts: Array<string | null | undefined>;
  limit: number;
  windowMs: number;
  failClosedInProduction?: boolean;
};

type RateLimitRow = {
  count: number;
  reset_at: string;
};

const devFallbackBuckets = new Map<string, { count: number; resetAt: number }>();

function isProduction() {
  return process.env.NODE_ENV === "production";
}

function hashValue(value: string) {
  return createHash("sha256").update(value).digest("hex").slice(0, 48);
}

function stableKey(route: string, keyParts: Array<string | null | undefined>) {
  const cleanParts = keyParts.map((part) => String(part || "unknown").trim().toLowerCase()).join("|");
  return `${route}:${hashValue(cleanParts)}`;
}

function retryAfterSeconds(resetAt: string) {
  const diffMs = new Date(resetAt).getTime() - Date.now();
  return Math.max(1, Math.ceil(diffMs / 1000));
}

function devFallbackRateLimit(key: string, limit: number, windowMs: number): RateLimitResult {
  const now = Date.now();
  const current = devFallbackBuckets.get(key);
  const resetAtMs = current?.resetAt && current.resetAt > now ? current.resetAt : now + windowMs;

  if (!current || current.resetAt <= now) {
    devFallbackBuckets.set(key, { count: 1, resetAt: resetAtMs });
    return { allowed: true, remaining: Math.max(0, limit - 1), resetAt: new Date(resetAtMs).toISOString() };
  }

  if (current.count >= limit) {
    return {
      allowed: false,
      remaining: 0,
      resetAt: new Date(current.resetAt).toISOString(),
      retryAfterSeconds: Math.max(1, Math.ceil((current.resetAt - now) / 1000)),
      reason: "limited"
    };
  }

  current.count += 1;
  return { allowed: true, remaining: Math.max(0, limit - current.count), resetAt: new Date(current.resetAt).toISOString() };
}

export function getClientIp(request: Request) {
  const forwardedFor = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim();
  return request.headers.get("cf-connecting-ip") || forwardedFor || "unknown-ip";
}

export async function checkPersistentRateLimit(options: RateLimitOptions): Promise<RateLimitResult> {
  const key = stableKey(options.route, options.keyParts);
  const now = new Date();
  const resetAt = new Date(now.getTime() + options.windowMs).toISOString();

  if (!options.supabase) {
    if (options.failClosedInProduction && isProduction()) {
      return { allowed: false, remaining: 0, resetAt, retryAfterSeconds: Math.ceil(options.windowMs / 1000), reason: "store_unavailable" };
    }

    return devFallbackRateLimit(key, options.limit, options.windowMs);
  }

  const { data, error } = await options.supabase
    .from("rate_limits")
    .select("count, reset_at")
    .eq("key", key)
    .maybeSingle<RateLimitRow>();

  if (error) {
    console.warn("IBOREN_RATE_LIMIT_READ_FAILED", { route: options.route, code: error.code });
    if (options.failClosedInProduction && isProduction()) {
      return { allowed: false, remaining: 0, resetAt, retryAfterSeconds: Math.ceil(options.windowMs / 1000), reason: "store_error" };
    }

    return devFallbackRateLimit(key, options.limit, options.windowMs);
  }

  if (!data || new Date(data.reset_at).getTime() <= now.getTime()) {
    const { error: upsertError } = await options.supabase
      .from("rate_limits")
      .upsert({ key, route: options.route, count: 1, reset_at: resetAt, updated_at: now.toISOString() }, { onConflict: "key" });

    if (upsertError) {
      console.warn("IBOREN_RATE_LIMIT_UPSERT_FAILED", { route: options.route, code: upsertError.code });
      if (options.failClosedInProduction && isProduction()) {
        return { allowed: false, remaining: 0, resetAt, retryAfterSeconds: Math.ceil(options.windowMs / 1000), reason: "store_error" };
      }

      return devFallbackRateLimit(key, options.limit, options.windowMs);
    }

    return { allowed: true, remaining: Math.max(0, options.limit - 1), resetAt };
  }

  if (data.count >= options.limit) {
    return { allowed: false, remaining: 0, resetAt: data.reset_at, retryAfterSeconds: retryAfterSeconds(data.reset_at), reason: "limited" };
  }

  const nextCount = data.count + 1;
  const { error: updateError } = await options.supabase
    .from("rate_limits")
    .update({ count: nextCount, updated_at: now.toISOString() })
    .eq("key", key);

  if (updateError) {
    console.warn("IBOREN_RATE_LIMIT_UPDATE_FAILED", { route: options.route, code: updateError.code });
    if (options.failClosedInProduction && isProduction()) {
      return { allowed: false, remaining: 0, resetAt: data.reset_at, retryAfterSeconds: retryAfterSeconds(data.reset_at), reason: "store_error" };
    }

    return devFallbackRateLimit(key, options.limit, options.windowMs);
  }

  return { allowed: true, remaining: Math.max(0, options.limit - nextCount), resetAt: data.reset_at };
}
