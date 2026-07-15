import { NextResponse } from "next/server";
import { getReviewAdminClient } from "../../lib/reviews";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const revalidate = 0;

const allowedEvents = new Set([
  "page_view",
  "quote_cta_click",
  "booking_cta_click",
  "booking_form_started",
  "booking_request_submitted"
]);
const noStoreHeaders = { "Cache-Control": "no-store, max-age=0" };

function cleanPath(value: unknown) {
  const path = String(value || "").trim();
  return path.startsWith("/") && path.length <= 160 ? path : null;
}

export async function POST(request: Request) {
  const body = await request.json().catch(() => null) as { event?: unknown; path?: unknown; language?: unknown } | null;
  const event = String(body?.event || "");
  const path = cleanPath(body?.path);
  const language = body?.language === "en" ? "en" : "sv";
  if (!allowedEvents.has(event) || !path) return NextResponse.json({ ok: false }, { status: 400, headers: noStoreHeaders });

  const supabase = getReviewAdminClient();
  if (!supabase) return NextResponse.json({ ok: false }, { status: 503, headers: noStoreHeaders });

  const { error } = await supabase.from("site_events").insert({ event_name: event, path, language });
  if (error) {
    console.warn("IBOREN_ANALYTICS_EVENT_FAILED", { code: error.code });
    return NextResponse.json({ ok: false }, { status: 503, headers: noStoreHeaders });
  }
  return NextResponse.json({ ok: true }, { headers: noStoreHeaders });
}
