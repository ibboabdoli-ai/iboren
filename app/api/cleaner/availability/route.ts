import { NextResponse } from "next/server";
import { createClient, User } from "@supabase/supabase-js";

export const runtime = "nodejs";

const HEADER_NAME = ["Author", "ization"].join("");
const TOKEN_WORD = ["Bear", "er"].join("");
const ALLOWED_ROLES = ["admin", "supervisor", "cleaner"] as const;

type StaffRole = typeof ALLOWED_ROLES[number];

type AvailabilitySlot = {
  weekday: number;
  start_time: string;
  end_time: string;
  available: boolean;
};

type AvailabilityPayload = {
  slots?: AvailabilitySlot[];
};

type EmployeeRow = {
  id: string;
  email: string;
  name: string;
  role: StaffRole;
  active: boolean;
};

function getAdminClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !serviceKey) return null;
  return createClient(url, serviceKey, { auth: { persistSession: false, autoRefreshToken: false } });
}

function getToken(request: Request) {
  const header = request.headers.get(HEADER_NAME.toLowerCase()) || "";
  return header.toLowerCase().startsWith(`${TOKEN_WORD.toLowerCase()} `)
    ? header.slice(TOKEN_WORD.length + 1).trim()
    : "";
}

function cleanText(value: unknown, max = 200) {
  return String(value || "").replace(/[<>]/g, "").trim().slice(0, max);
}

function isAllowedRole(role: unknown): role is StaffRole {
  return ALLOWED_ROLES.includes(String(role || "") as StaffRole);
}

function isValidTime(value: string) {
  return /^([01]\d|2[0-3]):[0-5]\d$/.test(value);
}

function normalizeSlot(slot: AvailabilitySlot) {
  const weekday = Number(slot.weekday);
  const start = cleanText(slot.start_time, 5);
  const end = cleanText(slot.end_time, 5);
  const available = slot.available !== false;

  if (!Number.isInteger(weekday) || weekday < 1 || weekday > 7) return null;
  if (!isValidTime(start) || !isValidTime(end)) return null;
  if (start >= end) return null;

  return { weekday, start_time: start, end_time: end, available };
}

function metadataName(user: User) {
  return cleanText(user.user_metadata?.full_name || user.user_metadata?.name || user.email?.split("@")[0] || "Employee", 160);
}

async function verifyStaff(request: Request) {
  const supabase = getAdminClient();
  if (!supabase) return { ok: false as const, status: 500, message: "Missing Supabase admin environment variables." };

  const token = getToken(request);
  if (!token) return { ok: false as const, status: 401, message: "Missing access token." };

  const { data, error } = await supabase.auth.getUser(token);
  const user = data.user;
  const email = user?.email?.toLowerCase() || "";
  if (error || !user || !email) return { ok: false as const, status: 401, message: "Invalid session." };

  const { data: roleRows, error: roleError } = await supabase
    .from("user_roles")
    .select("role, active")
    .eq("email", email)
    .limit(1);

  if (roleError) return { ok: false as const, status: 500, message: roleError.message };

  const roleRow = (roleRows || [])[0];
  if (!roleRow?.active || !isAllowedRole(roleRow.role)) return { ok: false as const, status: 403, message: "Cleaner, supervisor or admin access required." };

  const { data: employee, error: employeeError } = await supabase
    .from("employees")
    .select("id, email, name, role, active")
    .eq("email", email)
    .maybeSingle<EmployeeRow>();

  if (employeeError) return { ok: false as const, status: 500, message: employeeError.message };

  if (employee?.id) {
    if (!employee.active) return { ok: false as const, status: 403, message: "Employee is inactive." };
    return { ok: true as const, supabase, user, email, role: roleRow.role as StaffRole, employee };
  }

  const { data: createdEmployee, error: createError } = await supabase
    .from("employees")
    .insert({
      email,
      name: metadataName(user),
      role: roleRow.role,
      active: true,
      has_car: false,
      max_hours_per_day: 8
    })
    .select("id, email, name, role, active")
    .single<EmployeeRow>();

  if (createError) return { ok: false as const, status: 500, message: createError.message };
  return { ok: true as const, supabase, user, email, role: roleRow.role as StaffRole, employee: createdEmployee };
}

export async function GET(request: Request) {
  const staff = await verifyStaff(request);
  if (!staff.ok) return NextResponse.json({ ok: false, message: staff.message }, { status: staff.status });

  const { data, error } = await staff.supabase
    .from("employee_availability")
    .select("id, weekday, start_time, end_time, available, created_at, updated_at")
    .eq("employee_id", staff.employee.id)
    .order("weekday", { ascending: true })
    .order("start_time", { ascending: true });

  if (error) return NextResponse.json({ ok: false, message: error.message }, { status: 500 });

  return NextResponse.json({ ok: true, employee: staff.employee, role: staff.role, slots: data || [] });
}

export async function POST(request: Request) {
  const staff = await verifyStaff(request);
  if (!staff.ok) return NextResponse.json({ ok: false, message: staff.message }, { status: staff.status });

  const body = await request.json().catch(() => null) as AvailabilityPayload | null;
  const slots = Array.isArray(body?.slots) ? body.slots.map(normalizeSlot).filter(Boolean) as Array<ReturnType<typeof normalizeSlot> & {}> : [];

  if (slots.length > 21) return NextResponse.json({ ok: false, message: "Maximum 21 availability slots are allowed." }, { status: 400 });

  const { error: deleteError } = await staff.supabase
    .from("employee_availability")
    .delete()
    .eq("employee_id", staff.employee.id);

  if (deleteError) return NextResponse.json({ ok: false, message: deleteError.message }, { status: 500 });

  if (slots.length) {
    const rows = slots.map((slot) => ({ ...slot, employee_id: staff.employee.id }));
    const { error: insertError } = await staff.supabase.from("employee_availability").insert(rows);
    if (insertError) return NextResponse.json({ ok: false, message: insertError.message }, { status: 500 });
  }

  const { data, error } = await staff.supabase
    .from("employee_availability")
    .select("id, weekday, start_time, end_time, available, created_at, updated_at")
    .eq("employee_id", staff.employee.id)
    .order("weekday", { ascending: true })
    .order("start_time", { ascending: true });

  if (error) return NextResponse.json({ ok: false, message: error.message }, { status: 500 });

  return NextResponse.json({ ok: true, employee: staff.employee, role: staff.role, slots: data || [] });
}
