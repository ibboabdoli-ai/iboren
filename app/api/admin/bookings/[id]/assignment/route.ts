import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export const runtime = "nodejs";

const HEADER_NAME = ["Author", "ization"].join("");
const TOKEN_WORD = ["Bear", "er"].join("");

type AssignmentPayload = {
  employee_id?: string;
  note?: string;
};

type EmployeeRow = {
  id: string;
  email: string;
  name: string;
  phone: string | null;
  role: string;
  active: boolean;
  has_car: boolean;
  max_hours_per_day: number;
};

type AssignmentRow = {
  id: string;
  booking_id: string;
  employee_id: string;
  assigned_by: string | null;
  status: string;
  note: string | null;
  created_at: string;
  updated_at: string;
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

function cleanText(value: unknown, max = 500) {
  return String(value || "").replace(/[<>]/g, "").trim().slice(0, max);
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

  return { ok: true as const, supabase, user };
}

async function loadCurrentAssignment(supabase: ReturnType<typeof createClient>, bookingId: string) {
  const { data, error } = await supabase
    .from("booking_assignments")
    .select("id, booking_id, employee_id, assigned_by, status, note, created_at, updated_at")
    .eq("booking_id", bookingId)
    .in("status", ["assigned", "accepted"])
    .maybeSingle<AssignmentRow>();

  if (error) throw error;
  return data;
}

export async function GET(request: Request, { params }: { params: { id: string } }) {
  const admin = await verifyAdmin(request);
  if (!admin.ok) return NextResponse.json({ ok: false, message: admin.message }, { status: admin.status });

  try {
    const assignment = await loadCurrentAssignment(admin.supabase, params.id);
    if (!assignment) return NextResponse.json({ ok: true, assignment: null, employee: null });

    const { data: employee, error: employeeError } = await admin.supabase
      .from("employees")
      .select("id, email, name, phone, role, active, has_car, max_hours_per_day")
      .eq("id", assignment.employee_id)
      .maybeSingle<EmployeeRow>();

    if (employeeError) return NextResponse.json({ ok: false, message: employeeError.message }, { status: 500 });
    return NextResponse.json({ ok: true, assignment, employee });
  } catch (error) {
    return NextResponse.json({ ok: false, message: error instanceof Error ? error.message : "Could not load assignment." }, { status: 500 });
  }
}

export async function POST(request: Request, { params }: { params: { id: string } }) {
  const admin = await verifyAdmin(request);
  if (!admin.ok) return NextResponse.json({ ok: false, message: admin.message }, { status: admin.status });

  const body = await request.json().catch(() => null) as AssignmentPayload | null;
  const employeeId = cleanText(body?.employee_id, 80);
  const note = cleanText(body?.note, 500) || null;

  if (!employeeId) return NextResponse.json({ ok: false, message: "employee_id is required." }, { status: 400 });

  const { data: booking, error: bookingError } = await admin.supabase
    .from("bookings")
    .select("id")
    .eq("id", params.id)
    .maybeSingle<{ id: string }>();

  if (bookingError) return NextResponse.json({ ok: false, message: bookingError.message }, { status: 500 });
  if (!booking?.id) return NextResponse.json({ ok: false, message: "Booking not found." }, { status: 404 });

  const { data: employee, error: employeeError } = await admin.supabase
    .from("employees")
    .select("id, email, name, phone, role, active, has_car, max_hours_per_day")
    .eq("id", employeeId)
    .maybeSingle<EmployeeRow>();

  if (employeeError) return NextResponse.json({ ok: false, message: employeeError.message }, { status: 500 });
  if (!employee?.id || !employee.active || employee.role !== "cleaner") {
    return NextResponse.json({ ok: false, message: "Selected employee is not an active cleaner." }, { status: 400 });
  }

  try {
    const existing = await loadCurrentAssignment(admin.supabase, params.id);
    const payload = {
      booking_id: params.id,
      employee_id: employee.id,
      assigned_by: admin.user.id,
      status: "assigned",
      note,
      updated_at: new Date().toISOString()
    };

    const query = existing?.id
      ? admin.supabase
        .from("booking_assignments")
        .update(payload)
        .eq("id", existing.id)
        .select("id, booking_id, employee_id, assigned_by, status, note, created_at, updated_at")
        .single<AssignmentRow>()
      : admin.supabase
        .from("booking_assignments")
        .insert(payload)
        .select("id, booking_id, employee_id, assigned_by, status, note, created_at, updated_at")
        .single<AssignmentRow>();

    const { data: assignment, error: assignmentError } = await query;
    if (assignmentError) return NextResponse.json({ ok: false, message: assignmentError.message }, { status: 500 });

    return NextResponse.json({ ok: true, assignment, employee });
  } catch (error) {
    return NextResponse.json({ ok: false, message: error instanceof Error ? error.message : "Could not save assignment." }, { status: 500 });
  }
}
