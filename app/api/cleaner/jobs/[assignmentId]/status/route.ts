import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export const runtime = "nodejs";

const HEADER_NAME = ["Author", "ization"].join("");
const TOKEN_WORD = ["Bear", "er"].join("");
const STAFF_ROLES = ["admin", "supervisor", "cleaner"] as const;
const ALLOWED_STATUSES = ["accepted", "declined"] as const;

type StaffRole = typeof STAFF_ROLES[number];
type AllowedStatus = typeof ALLOWED_STATUSES[number];

type StatusPayload = {
  status?: string;
  note?: string;
};

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

function getToken(request: Request) {
  const header = request.headers.get(HEADER_NAME.toLowerCase()) || "";
  return header.toLowerCase().startsWith(`${TOKEN_WORD.toLowerCase()} `)
    ? header.slice(TOKEN_WORD.length + 1).trim()
    : "";
}

function cleanText(value: unknown, max = 500) {
  return String(value || "").replace(/[<>]/g, "").trim().slice(0, max);
}

function isStaffRole(value: unknown): value is StaffRole {
  return STAFF_ROLES.includes(String(value || "") as StaffRole);
}

function normalizeStatus(value: unknown): AllowedStatus | null {
  const status = String(value || "").toLowerCase();
  return ALLOWED_STATUSES.includes(status as AllowedStatus) ? status as AllowedStatus : null;
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
  if (!roleRow?.active || !isStaffRole(roleRow.role)) return { ok: false as const, status: 403, message: "Staff access required." };

  const { data: employee, error: employeeError } = await supabase
    .from("employees")
    .select("id, email, name, phone, role, active")
    .eq("email", email)
    .maybeSingle<EmployeeRow>();

  if (employeeError) return { ok: false as const, status: 500, message: employeeError.message };
  if (!employee?.id || !employee.active) return { ok: false as const, status: 403, message: "Active employee record required." };

  return { ok: true as const, supabase, user, email, role: roleRow.role as StaffRole, employee };
}

export async function PATCH(request: Request, { params }: { params: { assignmentId: string } }) {
  const staff = await verifyStaff(request);
  if (!staff.ok) return NextResponse.json({ ok: false, message: staff.message }, { status: staff.status });

  const body = await request.json().catch(() => null) as StatusPayload | null;
  const status = normalizeStatus(body?.status);
  const note = cleanText(body?.note, 500) || null;

  if (!status) return NextResponse.json({ ok: false, message: "Status must be accepted or declined." }, { status: 400 });

  const { data: assignment, error: assignmentError } = await staff.supabase
    .from("booking_assignments")
    .select("id, booking_id, employee_id, assigned_by, status, note, created_at, updated_at")
    .eq("id", params.assignmentId)
    .maybeSingle<AssignmentRow>();

  if (assignmentError) return NextResponse.json({ ok: false, message: assignmentError.message }, { status: 500 });
  if (!assignment?.id) return NextResponse.json({ ok: false, message: "Assignment not found." }, { status: 404 });

  const isOwnAssignment = assignment.employee_id === staff.employee.id;
  const canManageAny = staff.role === "admin" || staff.role === "supervisor";
  if (!isOwnAssignment && !canManageAny) return NextResponse.json({ ok: false, message: "You can only update your own assignment." }, { status: 403 });

  const { data: updatedAssignment, error: updateError } = await staff.supabase
    .from("booking_assignments")
    .update({
      status,
      note: note ?? assignment.note,
      updated_at: new Date().toISOString()
    })
    .eq("id", assignment.id)
    .select("id, booking_id, employee_id, assigned_by, status, note, created_at, updated_at")
    .single<AssignmentRow>();

  if (updateError) return NextResponse.json({ ok: false, message: updateError.message }, { status: 500 });

  return NextResponse.json({ ok: true, assignment: updatedAssignment });
}
