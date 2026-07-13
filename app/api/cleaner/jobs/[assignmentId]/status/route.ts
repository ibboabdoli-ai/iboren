import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { createReviewInvitation, sendReviewInvitation } from "../../../../../lib/reviews";

export const runtime = "nodejs";

const HEADER_NAME = ["Author", "ization"].join("");
const TOKEN_WORD = ["Bear", "er"].join("");
const EMAIL_ENDPOINT = ["https://api.re", "send.com/emails"].join("");
const STAFF_ROLES = ["admin", "supervisor", "cleaner"] as const;
const ALLOWED_STATUSES = ["accepted", "declined", "completed"] as const;

type StaffRole = typeof STAFF_ROLES[number];
type AllowedStatus = typeof ALLOWED_STATUSES[number];
type EmployeeRow = { id: string; email: string; name: string; phone: string | null; role: StaffRole; active: boolean };
type AssignmentRow = { id: string; booking_id: string; employee_id: string; assigned_by: string | null; status: string; note: string | null; created_at: string; updated_at: string };
type BookingRow = { id: string; service: string; area: string; address: string | null; preferred_date: string | null; time_window: string | null; customer_name: string; customer_email: string; customer_phone: string | null; notes: string | null; status: string | null };

function getAdminClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !serviceKey) return null;
  return createClient(url, serviceKey, { auth: { persistSession: false, autoRefreshToken: false } });
}

type AdminClient = NonNullable<ReturnType<typeof getAdminClient>>;

function getToken(request: Request) {
  const header = request.headers.get(HEADER_NAME.toLowerCase()) || "";
  return header.toLowerCase().startsWith(`${TOKEN_WORD.toLowerCase()} `) ? header.slice(TOKEN_WORD.length + 1).trim() : "";
}
function cleanText(value: unknown, max = 500) { return String(value || "").replace(/[<>]/g, "").trim().slice(0, max); }
function isStaffRole(value: unknown): value is StaffRole { return STAFF_ROLES.includes(String(value || "") as StaffRole); }
function normalizeStatus(value: unknown): AllowedStatus | null { const status = String(value || "").toLowerCase(); return ALLOWED_STATUSES.includes(status as AllowedStatus) ? status as AllowedStatus : null; }

async function verifyStaff(request: Request) {
  const supabase = getAdminClient();
  if (!supabase) return { ok: false as const, status: 500, message: "Missing Supabase admin environment variables." };
  const token = getToken(request);
  if (!token) return { ok: false as const, status: 401, message: "Missing access token." };
  const { data, error } = await supabase.auth.getUser(token);
  const email = data.user?.email?.toLowerCase() || "";
  if (error || !email) return { ok: false as const, status: 401, message: "Invalid session." };
  const { data: roleRows, error: roleError } = await supabase.from("user_roles").select("role, active").eq("email", email).limit(1);
  if (roleError) return { ok: false as const, status: 500, message: roleError.message };
  const roleRow = (roleRows || [])[0];
  if (!roleRow?.active || !isStaffRole(roleRow.role)) return { ok: false as const, status: 403, message: "Staff access required." };
  const { data: employee, error: employeeError } = await supabase.from("employees").select("id, email, name, phone, role, active").eq("email", email).maybeSingle<EmployeeRow>();
  if (employeeError) return { ok: false as const, status: 500, message: employeeError.message };
  if (!employee?.id || !employee.active) return { ok: false as const, status: 403, message: "Active employee record required." };
  return { ok: true as const, supabase, role: roleRow.role as StaffRole, employee };
}

async function loadBooking(supabase: AdminClient, bookingId: string) {
  const { data } = await supabase.from("bookings").select("id, service, area, address, preferred_date, time_window, customer_name, customer_email, customer_phone, notes, status").eq("id", bookingId).maybeSingle<BookingRow>();
  return data || null;
}

async function sendAdminEmail(params: { assignment: AssignmentRow; employee: EmployeeRow; booking: BookingRow | null; status: AllowedStatus }) {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) return;
  const toEmail = process.env.BOOKING_TO_EMAIL || "hej@iboren.se";
  const fromEmail = process.env.BOOKING_FROM_EMAIL || "Iboren <onboarding@resend.dev>";
  const statusText = params.status === "completed" ? "marked the job as completed" : params.status === "accepted" ? "accepted the job" : "declined the job";
  const lines = ["Iboren cleaner job status update", "", `Cleaner: ${params.employee.name}`, `Cleaner email: ${params.employee.email}`, `Status: ${statusText}`, "", `Booking ID: ${params.assignment.booking_id}`, `Assignment ID: ${params.assignment.id}`, "", `Service: ${params.booking?.service || "-"}`, `Address: ${params.booking?.address || "-"}`, `Date: ${params.booking?.preferred_date || "-"}`, `Customer: ${params.booking?.customer_name || "-"}`];
  await fetch(EMAIL_ENDPOINT, { method: "POST", headers: { [HEADER_NAME]: `${TOKEN_WORD} ${apiKey}`, "Content-Type": "application/json" }, body: JSON.stringify({ from: fromEmail, to: [toEmail], reply_to: params.employee.email, subject: `Iboren: Cleaner ${params.status} job`, text: lines.join("\n") }) });
}

async function syncBookingCompleted(supabase: AdminClient, bookingId: string) {
  const { data, error } = await supabase.from("booking_assignments").select("id, status").eq("booking_id", bookingId).in("status", ["confirmed", "completed"]);
  if (error) throw error;
  const activeCrew = data || [];
  if (!activeCrew.length) return false;
  const allCompleted = activeCrew.every((row) => row.status === "completed");
  if (!allCompleted) return false;
  const { error: bookingError } = await supabase.from("bookings").update({ status: "completed" }).eq("id", bookingId);
  if (bookingError) throw bookingError;
  return true;
}

export async function PATCH(request: Request, { params }: { params: { assignmentId: string } }) {
  const staff = await verifyStaff(request);
  if (!staff.ok) return NextResponse.json({ ok: false, message: staff.message }, { status: staff.status });
  const body = await request.json().catch(() => null) as { status?: string; note?: string } | null;
  const status = normalizeStatus(body?.status);
  const note = cleanText(body?.note, 500) || null;
  if (!status) return NextResponse.json({ ok: false, message: "Status must be accepted, declined or completed." }, { status: 400 });

  const { data: assignment, error: assignmentError } = await staff.supabase.from("booking_assignments").select("id, booking_id, employee_id, assigned_by, status, note, created_at, updated_at").eq("id", params.assignmentId).maybeSingle<AssignmentRow>();
  if (assignmentError) return NextResponse.json({ ok: false, message: assignmentError.message }, { status: 500 });
  if (!assignment?.id) return NextResponse.json({ ok: false, message: "Assignment not found." }, { status: 404 });

  const isOwnAssignment = assignment.employee_id === staff.employee.id;
  const canManageAny = staff.role === "admin" || staff.role === "supervisor";
  if (!isOwnAssignment && !canManageAny) return NextResponse.json({ ok: false, message: "You can only update your own assignment." }, { status: 403 });
  if (status === "completed" && assignment.status !== "confirmed" && !canManageAny) return NextResponse.json({ ok: false, message: "Only confirmed jobs can be marked completed." }, { status: 400 });

  const { data: updatedAssignment, error: updateError } = await staff.supabase.from("booking_assignments").update({ status, note: note ?? assignment.note, updated_at: new Date().toISOString() }).eq("id", assignment.id).select("id, booking_id, employee_id, assigned_by, status, note, created_at, updated_at").single<AssignmentRow>();
  if (updateError) return NextResponse.json({ ok: false, message: updateError.message }, { status: 500 });

  let bookingCompleted = false;
  if (status === "completed") {
    try { bookingCompleted = await syncBookingCompleted(staff.supabase, updatedAssignment.booking_id); } catch (error) { console.warn("IBOREN_BOOKING_STATUS_SYNC_FAILED", error); }
  }

  if (bookingCompleted) {
    try {
      const booking = await loadBooking(staff.supabase, updatedAssignment.booking_id);
      if (booking) {
        const invitation = await createReviewInvitation(staff.supabase, booking);
        if (invitation?.created) await sendReviewInvitation(booking, invitation.token);
      }
    } catch (error) { console.warn("IBOREN_REVIEW_INVITATION_AFTER_CLEANER_COMPLETION_FAILED", error); }
  }

  try { await sendAdminEmail({ assignment: updatedAssignment, employee: staff.employee, booking: await loadBooking(staff.supabase, updatedAssignment.booking_id), status }); } catch (error) { console.warn("IBOREN_CLEANER_STATUS_EMAIL_FAILED", error); }
  return NextResponse.json({ ok: true, assignment: updatedAssignment, bookingCompleted });
}
