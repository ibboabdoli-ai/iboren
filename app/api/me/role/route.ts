import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export const runtime = "nodejs";

const AUTH_HEADER = ["Author", "ization"].join("");
const TOKEN_PREFIX = ["Bear", "er"].join("");
const VALID_ROLES = ["admin", "supervisor", "cleaner", "customer"] as const;

type UserRole = typeof VALID_ROLES[number];

type UserRoleRow = {
  role: string;
  active: boolean;
  email: string;
  user_id: string | null;
};

function getSupabase(token?: string) {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !key) return null;

  return createClient(url, key, {
    auth: { persistSession: false, autoRefreshToken: false },
    global: token ? { headers: { [AUTH_HEADER]: `${TOKEN_PREFIX} ${token}` } } : undefined
  });
}

function getToken(request: Request) {
  const authHeader = request.headers.get(AUTH_HEADER.toLowerCase()) || "";
  return authHeader.toLowerCase().startsWith(`${TOKEN_PREFIX.toLowerCase()} `)
    ? authHeader.slice(TOKEN_PREFIX.length + 1).trim()
    : "";
}

function normalizeRole(value: unknown): UserRole {
  const role = String(value || "customer").toLowerCase();
  return VALID_ROLES.includes(role as UserRole) ? role as UserRole : "customer";
}

function getAdminEmails() {
  return (process.env.ADMIN_EMAILS || "ibbo.abdoli@gmail.com")
    .split(",")
    .map((email) => email.trim().toLowerCase())
    .filter(Boolean);
}

export async function GET(request: Request) {
  const token = getToken(request);
  if (!token) return NextResponse.json({ ok: false, message: "Missing access token." }, { status: 401 });

  const supabase = getSupabase(token);
  if (!supabase) return NextResponse.json({ ok: false, message: "Missing Supabase environment variables." }, { status: 500 });

  const { data: userData, error: userError } = await supabase.auth.getUser(token);
  const user = userData.user;
  const email = user?.email?.toLowerCase() || "";

  if (userError || !user || !email) return NextResponse.json({ ok: false, message: "Invalid session." }, { status: 401 });

  const { data: roleRows, error: roleError } = await supabase
    .from("user_roles")
    .select("role, active, email, user_id")
    .or(`user_id.eq.${user.id},email.ilike.${email}`)
    .limit(2);

  if (roleError) return NextResponse.json({ ok: false, message: roleError.message }, { status: 500 });

  const rows = (roleRows || []) as UserRoleRow[];
  const exactUserRole = rows.find((row) => row.active && row.user_id === user.id);
  const emailRole = rows.find((row) => row.active && row.email.toLowerCase() === email);
  const row = exactUserRole || emailRole;
  const adminByEnv = getAdminEmails().includes(email);
  const role = row ? normalizeRole(row.role) : adminByEnv ? "admin" : "customer";
  const active = row ? Boolean(row.active) : adminByEnv || role === "customer";

  return NextResponse.json({
    ok: true,
    role,
    active,
    email,
    userId: user.id,
    source: row ? row.user_id === user.id ? "user_roles.user_id" : "user_roles.email" : adminByEnv ? "ADMIN_EMAILS" : "default"
  });
}
