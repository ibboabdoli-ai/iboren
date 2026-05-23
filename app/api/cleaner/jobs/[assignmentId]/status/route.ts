import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export const runtime = "nodejs";

const HEADER_NAME = ["Author", "ization"].join("");
const TOKEN_WORD = ["Bear", "er"].join("");
const EMAIL_ENDPOINT = ["https://api.re", "send.com/emails"].join("");
const EMAIL_WAIT_LIMIT_MS = 4500;
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

type AdminClient = NonNullable<ReturnType<typeof getAdminClient>>;

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

function statusLabel(status: AllowedStatus) {
  return status === "accepted" ? "accepted the job" : "declined the job";
}

function buildAdminStatusEmailText(params: { assignment: AssignmentRow; booking: BookingRow | null; employee: EmployeeRow; status: AllowedStatus }) {
  const { assignment, booking, employee, status } = params;
  return [
    "Iboren cleaner job status update",
    "",
    `Cleaner: ${employee.name}`,
    `Cleaner email: ${employee.email}`,
    `Cleaner phone: ${employee.phone || "-"}`,
    `Status: ${statusLabel(status)}`,
    "",
    `Assignment ID: ${assignment.id}`,
    `Booking ID: ${assignment.booking_id}`,
    "",
    booking ? `Service: ${booking.service}` : "Service: -",
    booking ? `Area: ${booking.area}` : "Area: -",
    booking ? `Address: ${booking.address || "-"}` : "Address: -",
    booking ? `Date: ${booking.preferred_date || "-"}` : "Date: -",
    booking ? `Time window: ${booking.time_window || "-"}` : "Time window: -",
    "",
    booking ? `Customer: ${booking.customer_name}` : "Customer: -",
    booking ? `Customer email: ${booking.customer_email}` : "Customer email: -",
    booking ? `Customer phone: ${booking.customer_phone || "-"}` : "Customer phone: -",
    "",
    `Updated at: ${assignment.updated_at}`
  ].join("\n");
}

async function sendEmail(params: { apiKey: string; from: string; to: string; replyTo?: string; subject: string; text: string }) {
  return fetch(EMAIL_ENDPOINT, {
    method: "POST",
    headers: { [HEADER_NAME]: `${TOKEN_WORD} ${params.apiKey}`, "Content-Type": "application/json" },
    body: JSON.stringify({ from: params.from, to: [params.to], reply_to: params.replyTo, subject: params.subject, text: params.text })
  });
}

function wait(ms: number) {
  return new Promise<"timeout">((resolve) => setTimeout(() => resolve("timeout"), ms));
}

async function notifyAdminAboutStatus(params: { supabase: AdminClient; assignment: AssignmentRow; employee: EmployeeRow; status: AllowedStatus }) {
  const resendApiKey = process.env.RESEND_API_KEY;
  const toEmail = process.env.BOOKING_TO_EMAIL || "hej@iboren.se";
  const fromEmail = process.env.BOOKING_FROM_EMAIL || "Iboren <onboarding@resend.dev>";

  const { data: booking } = await params.supabase
    .from("bookings")
    .select("id, service, area, address, size_sqm, frequency, preferred_date, time_window, customer_name, customer_email, customer_phone, notes, status, created_at")
    .eq("id", params.assignment.booking_id)
    .maybeSingle<BookingRow>();

  const text = buildAdminStatusEmailText({ assignment: params.assignment, booking: booking || null, employee: params.employee, status: params.status });
  const subject = `Iboren: Cleaner ${params.status} job · ${booking?.service || "booking"}`;

  if (!resendApiKey) {
    console.info("IBOREN_CLEANER_STATUS_EMAIL", text);
    return;
  }

  const emailResult = await Promise.race([
    sendEmail({ apiKey: resendApiKey, from: fromEmail, to: toEmail, replyTo: params.employee.email, subject, text }),
    wait(EMAIL_WAIT_LIMIT_MS)
  ]);

  if (emailResult === "timeout") console.warn("IBOREN_CLEANER_STATUS_EMAIL_TIMEOUT", { assignmentId: params.assignment.id });
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

  try {
    await notifyAdminAboutStatus({ supabase: staff.supabase, assignment: updatedAssignment, employee: staff.employee, status });
  } catch (error) {
    console.warn("IBOREN_CLEANER_STATUS_EMAIL_FAILED", error);
  }

  return NextResponse.json({ ok: true, assignment: updatedAssignment });
}
