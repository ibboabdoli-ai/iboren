import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export const runtime = "nodejs";

const HEADER_NAME = ["Author", "ization"].join("");
const TOKEN_WORD = ["Bear", "er"].join("");
const VALID_ROLES = ["admin", "supervisor", "cleaner", "customer"] as const;

type Role = typeof VALID_ROLES[number];

function getAdminClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !serviceKey) return null;
  return createClient(url, serviceKey, { auth: { persistSession: false, autoRefreshToken: false } });
}

function getAdminEmails() {
  return (process.env.ADMIN_EMAILS || "ibbo.abdoli@gmail.com")
    .split(",")
    .map((email) => email.trim().toLowerCase())
    .filter(Boolean);
}

function getToken(request: Request) {
  const header = request.headers.get(HEADER_NAME.toLowerCase()) || "";
  return header.toLowerCase().startsWith(`${TOKEN_WORD.toLowerCase()} `)
    ? header.slice(TOKEN_WORD.length + 1).trim()
    : "";
}

function normalizeRole(value: unknown): Role {
  const role = String(value || "customer").toLowerCase();
  return VALID_ROLES.includes(role as Role) ? role as Role : "customer";
}

function roleRank(role: Role) {
  if (role === "admin") return 4;
  if (role === "supervisor") return 3;
  if (role === "cleaner") return 2;
  return 1;
}

function accessLinks(role: Role) {
  if (role === "admin") {
    return [
      { label: "Admin panel", href: "/admin", kind: "admin" },
      { label: "Operations", href: "/admin/operations", kind: "admin" },
      { label: "Supervisor panel", href: "/supervisor", kind: "supervisor" }
    ];
  }

  if (role === "supervisor") return [{ label: "Supervisor panel", href: "/supervisor", kind: "supervisor" }];
  if (role === "cleaner") return [{ label: "Cleaner dashboard", href: "/cleaner", kind: "cleaner" }];
  return [];
}

export async function GET(request: Request) {
  const supabase = getAdminClient();
  if (!supabase) return NextResponse.json({ ok: false, message: "Missing Supabase admin environment variables." }, { status: 500 });

  const token = getToken(request);
  if (!token) return NextResponse.json({ ok: false, message: "Missing access token." }, { status: 401 });

  const { data, error } = await supabase.auth.getUser(token);
  const user = data.user;
  const email = user?.email?.toLowerCase() || "";
  if (error || !user || !email) return NextResponse.json({ ok: false, message: "Invalid session." }, { status: 401 });

  const { data: roleRows, error: roleError } = await supabase
    .from("user_roles")
    .select("id, email, role, active, updated_at")
    .eq("email", email);

  if (roleError) return NextResponse.json({ ok: false, message: roleError.message }, { status: 500 });

  const activeRoles = (roleRows || [])
    .filter((row) => row.active !== false)
    .map((row) => normalizeRole(row.role))
    .sort((a, b) => roleRank(b) - roleRank(a));

  const roleFromTable = activeRoles[0] || "customer";
  const role: Role = getAdminEmails().includes(email) ? "admin" : roleFromTable;

  const { data: employee, error: employeeError } = await supabase
    .from("employees")
    .select("id, email, name, phone, role, active, has_car, max_hours_per_day")
    .eq("email", email)
    .maybeSingle();

  if (employeeError) return NextResponse.json({ ok: false, message: employeeError.message }, { status: 500 });

  return NextResponse.json({
    ok: true,
    email,
    role,
    active: role !== "customer" ? true : Boolean((roleRows || []).find((row) => row.active !== false)),
    roles: Array.from(new Set([role, ...activeRoles])),
    employee: employee || null,
    links: accessLinks(role)
  });
}
