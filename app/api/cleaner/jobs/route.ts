import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export const runtime = "nodejs";

const HEADER_NAME = ["Author", "ization"].join("");
const TOKEN_WORD = ["Bear", "er"].join("");
const STAFF_ROLES = ["admin", "supervisor", "cleaner"] as const;

type StaffRole = typeof STAFF_ROLES[number];

type EmployeeRow = {
  id: string;
  email: string;
  name: string;
  phone: string | null;
  role: StaffRole;
  active: boolean;
};

type AssignmentRow = {
  id: string;
  booking_id: string;
  employee_id: string;
  status: string;
  note: string | null;
  created_at: string;
  updated_at: string;
};

type BookingRow = {
  id: string;
  service: string;
  area: string;
  address: string | null;
  size_sqm: number | null;
  frequency: string | null;
  preferred_date: string | null;
  time_window: string | null;
  customer_name: string;
  customer_email: string;
  customer_phone: string | null;
  notes: string | null;
  status: string | null;
  created_at: string;
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

function isStaffRole(value: unknown): value is StaffRole {
  return STAFF_ROLES.includes(String(value || "") as StaffRole);
}

function metadataName(user: { email?: string; user_metadata?: Record<string, unknown> }) {
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
  if (!roleRow?.active || !isStaffRole(roleRow.role)) {
    return { ok: false as const, status: 403, message: "Staff access required." };
  }

  const { data: employee, error: employeeError } = await supabase
    .from("employees")
    .select("id, email, name, phone, role, active")
    .eq("email", email)
    .maybeSingle<EmployeeRow>();

  if (employeeError) return { ok: false as const, status: 500, message: employeeError.message };
  if (employee?.id) return { ok: true as const, supabase, user, email, role: roleRow.role as StaffRole, employee };

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
    .select("id, email, name, phone, role, active")
    .single<EmployeeRow>();

  if (createError) return { ok: false as const, status: 500, message: createError.message };
  return { ok: true as const, supabase, user, email, role: roleRow.role as StaffRole, employee: createdEmployee };
}

export async function GET(request: Request) {
  const staff = await verifyStaff(request);
  if (!staff.ok) return NextResponse.json({ ok: false, message: staff.message }, { status: staff.status });

  let assignmentQuery = staff.supabase
    .from("booking_assignments")
    .select("id, booking_id, employee_id, status, note, created_at, updated_at")
    .in("status", ["assigned", "accepted"])
    .order("created_at", { ascending: false });

  if (staff.role === "cleaner") assignmentQuery = assignmentQuery.eq("employee_id", staff.employee.id);

  const { data: assignmentsData, error: assignmentsError } = await assignmentQuery;
  if (assignmentsError) return NextResponse.json({ ok: false, message: assignmentsError.message }, { status: 500 });

  const assignments = (assignmentsData || []) as AssignmentRow[];
  const bookingIds = [...new Set(assignments.map((assignment) => assignment.booking_id))];
  const employeeIds = [...new Set(assignments.map((assignment) => assignment.employee_id))];

  if (!assignments.length || !bookingIds.length) {
    return NextResponse.json({ ok: true, role: staff.role, employee: staff.employee, jobs: [] });
  }

  const { data: bookingsData, error: bookingsError } = await staff.supabase
    .from("bookings")
    .select("id, service, area, address, size_sqm, frequency, preferred_date, time_window, customer_name, customer_email, customer_phone, notes, status, created_at")
    .in("id", bookingIds);

  if (bookingsError) return NextResponse.json({ ok: false, message: bookingsError.message }, { status: 500 });

  const { data: employeesData, error: employeesError } = await staff.supabase
    .from("employees")
    .select("id, email, name, phone, role, active")
    .in("id", employeeIds);

  if (employeesError) return NextResponse.json({ ok: false, message: employeesError.message }, { status: 500 });

  const bookings = new Map((bookingsData || []).map((booking: BookingRow) => [booking.id, booking]));
  const employees = new Map((employeesData || []).map((employee: EmployeeRow) => [employee.id, employee]));

  const jobs = assignments.map((assignment) => ({
    assignment,
    booking: bookings.get(assignment.booking_id) || null,
    employee: employees.get(assignment.employee_id) || null
  })).filter((job) => Boolean(job.booking));

  return NextResponse.json({ ok: true, role: staff.role, employee: staff.employee, jobs });
}
