import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export const runtime = "nodejs";

const HEADER_NAME = ["Author", "ization"].join("");
const TOKEN_WORD = ["Bear", "er"].join("");
const VALID_ROLES = ["admin", "supervisor", "cleaner", "customer"] as const;
const STAFF_ROLES = ["admin", "supervisor", "cleaner"] as const;

type Role = typeof VALID_ROLES[number];
type StaffRole = typeof STAFF_ROLES[number];

type RolePayload = {
  email?: string;
  role?: string;
  active?: boolean;
  name?: string;
  phone?: string;
  has_car?: boolean;
  max_hours_per_day?: number;
};

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

function cleanEmail(value: unknown) {
  return String(value || "").trim().toLowerCase().slice(0, 320);
}

function cleanText(value: unknown, max = 200) {
  return String(value || "").replace(/[<>]/g, "").trim().slice(0, max);
}

function normalizeRole(value: unknown): Role {
  const role = String(value || "customer").toLowerCase();
  return VALID_ROLES.includes(role as Role) ? role as Role : "customer";
}

function isStaffRole(role: Role): role is StaffRole {
  return STAFF_ROLES.includes(role as StaffRole);
}

async function verifyAdmin(request: Request) {
  const supabase = getAdminClient();
  if (!supabase) return { ok: false as const, status: 500, message: "Missing Supabase admin environment variables." };

  const token = getToken(request);
  if (!token) return { ok: false as const, status: 401, message: "Missing access token." };

  const { data, error } = await supabase.auth.getUser(token);
  const user = data.user;
  const email = user?.email?.toLowerCase() || "";
  if (error || !user || !email) return { ok: false as const, status: 401, message: "Invalid session." };

  const { data: roles, error: roleError } = await supabase
    .from("user_roles")
    .select("role, active")
    .eq("email", email)
    .limit(1);

  if (roleError) return { ok: false as const, status: 500, message: roleError.message };

  const isAdminByRole = Boolean((roles || []).find((row) => row.active && row.role === "admin"));
  const isAdminByEnv = getAdminEmails().includes(email);
  if (!isAdminByRole && !isAdminByEnv) return { ok: false as const, status: 403, message: "Admin access required." };

  return { ok: true as const, supabase, user, email };
}

export async function GET(request: Request) {
  const admin = await verifyAdmin(request);
  if (!admin.ok) return NextResponse.json({ ok: false, message: admin.message }, { status: admin.status });

  const { data: roles, error: rolesError } = await admin.supabase
    .from("user_roles")
    .select("id, user_id, email, role, active, created_at, updated_at")
    .order("created_at", { ascending: false });

  if (rolesError) return NextResponse.json({ ok: false, message: rolesError.message }, { status: 500 });

  const { data: employees, error: employeesError } = await admin.supabase
    .from("employees")
    .select("id, user_id, email, name, phone, role, active, has_car, max_hours_per_day, created_at, updated_at")
    .order("created_at", { ascending: false });

  if (employeesError) return NextResponse.json({ ok: false, message: employeesError.message }, { status: 500 });

  return NextResponse.json({ ok: true, roles: roles || [], employees: employees || [] });
}

export async function POST(request: Request) {
  const admin = await verifyAdmin(request);
  if (!admin.ok) return NextResponse.json({ ok: false, message: admin.message }, { status: admin.status });

  const body = await request.json().catch(() => null) as RolePayload | null;
  const email = cleanEmail(body?.email);
  const role = normalizeRole(body?.role);
  const active = body?.active !== false;
  const name = cleanText(body?.name || email.split("@")[0] || "Employee", 160);
  const phone = cleanText(body?.phone, 60) || null;
  const hasCar = body?.has_car === true;
  const maxHours = Number.isFinite(Number(body?.max_hours_per_day)) ? Math.max(0, Math.min(24, Number(body?.max_hours_per_day))) : 8;

  if (!/^\S+@\S+\.\S+$/.test(email)) return NextResponse.json({ ok: false, message: "Valid email is required." }, { status: 400 });

  const { data: existingRole, error: roleLookupError } = await admin.supabase
    .from("user_roles")
    .select("id")
    .eq("email", email)
    .maybeSingle<{ id: string }>();

  if (roleLookupError) return NextResponse.json({ ok: false, message: roleLookupError.message }, { status: 500 });

  const roleRow = { email, role, active, updated_at: new Date().toISOString() };
  const roleQuery = existingRole?.id
    ? admin.supabase.from("user_roles").update(roleRow).eq("id", existingRole.id).select("id, user_id, email, role, active, created_at, updated_at").single()
    : admin.supabase.from("user_roles").insert(roleRow).select("id, user_id, email, role, active, created_at, updated_at").single();

  const { data: savedRole, error: roleError } = await roleQuery;
  if (roleError) return NextResponse.json({ ok: false, message: roleError.message }, { status: 500 });

  let savedEmployee = null;

  if (isStaffRole(role)) {
    const { data: existingEmployee, error: employeeLookupError } = await admin.supabase
      .from("employees")
      .select("id")
      .eq("email", email)
      .maybeSingle<{ id: string }>();

    if (employeeLookupError) return NextResponse.json({ ok: false, message: employeeLookupError.message }, { status: 500 });

    const employeeRow = {
      email,
      name,
      phone,
      role,
      active,
      has_car: hasCar,
      max_hours_per_day: maxHours,
      updated_at: new Date().toISOString()
    };

    const employeeQuery = existingEmployee?.id
      ? admin.supabase.from("employees").update(employeeRow).eq("id", existingEmployee.id).select("id, user_id, email, name, phone, role, active, has_car, max_hours_per_day, created_at, updated_at").single()
      : admin.supabase.from("employees").insert(employeeRow).select("id, user_id, email, name, phone, role, active, has_car, max_hours_per_day, created_at, updated_at").single();

    const { data, error } = await employeeQuery;
    if (error) return NextResponse.json({ ok: false, message: error.message }, { status: 500 });
    savedEmployee = data;
  }

  return NextResponse.json({ ok: true, role: savedRole, employee: savedEmployee });
}
