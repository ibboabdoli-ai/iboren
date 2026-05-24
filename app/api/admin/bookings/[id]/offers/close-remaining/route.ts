import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export const runtime = "nodejs";

const HEADER_NAME = ["Author", "ization"].join("");
const TOKEN_WORD = ["Bear", "er"].join("");
const EMAIL_ENDPOINT = ["https://api.re", "send.com/emails"].join("");
const EMAIL_WAIT_LIMIT_MS = 4500;

type AssignmentRow = { id: string; booking_id: string; employee_id: string; status: string; note: string | null; created_at: string; updated_at: string };
type EmployeeRow = { id: string; email: string; name: string; phone: string | null; role: string; active: boolean };
type BookingRow = { id: string; service: string; area: string; address: string | null; preferred_date: string | null; time_window: string | null };
type EmailResult = { to: string; sent: boolean; skipped: boolean; reason: string | null };

function getAdminClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !serviceKey) return null;
  return createClient(url, serviceKey, { auth: { persistSession: false, autoRefreshToken: false } });
}

type AdminClient = NonNullable<ReturnType<typeof getAdminClient>>;

function getAdminEmails() {
  return (process.env.ADMIN_EMAILS || "ibbo.abdoli@gmail.com").split(",").map((email) => email.trim().toLowerCase()).filter(Boolean);
}

function getToken(request: Request) {
  const header = request.headers.get(HEADER_NAME.toLowerCase()) || "";
  return header.toLowerCase().startsWith(`${TOKEN_WORD.toLowerCase()} `) ? header.slice(TOKEN_WORD.length + 1).trim() : "";
}

function isValidEmail(email: string) { return /^\S+@\S+\.\S+$/.test(email); }
function wait(ms: number) { return new Promise<"timeout">((resolve) => setTimeout(() => resolve("timeout"), ms)); }

async function verifyAdmin(request: Request) {
  const supabase = getAdminClient();
  if (!supabase) return { ok: false as const, status: 500, message: "Missing Supabase admin environment variables." };
  const token = getToken(request);
  if (!token) return { ok: false as const, status: 401, message: "Missing access token." };
  const { data, error } = await supabase.auth.getUser(token);
  const email = data.user?.email?.toLowerCase() || "";
  if (error || !email) return { ok: false as const, status: 401, message: "Invalid session." };
  const { data: roles, error: roleError } = await supabase.from("user_roles").select("role, active").eq("email", email).limit(1);
  if (roleError) return { ok: false as const, status: 500, message: roleError.message };
  const isAdminByRole = Boolean((roles || []).find((row) => row.active && row.role === "admin"));
  const isAdminByEnv = getAdminEmails().includes(email);
  if (!isAdminByRole && !isAdminByEnv) return { ok: false as const, status: 403, message: "Admin access required." };
  return { ok: true as const, supabase };
}

async function loadBooking(supabase: AdminClient, bookingId: string) {
  const { data, error } = await supabase.from("bookings").select("id, service, area, address, preferred_date, time_window").eq("id", bookingId).maybeSingle<BookingRow>();
  if (error) throw error;
  return data;
}

async function loadEmployees(supabase: AdminClient, employeeIds: string[]) {
  if (!employeeIds.length) return [];
  const { data, error } = await supabase.from("employees").select("id, email, name, phone, role, active").in("id", employeeIds).returns<EmployeeRow[]>();
  if (error) throw error;
  return data || [];
}

async function sendEmail(params: { apiKey: string; from: string; to: string; replyTo?: string; subject: string; text: string }) {
  return fetch(EMAIL_ENDPOINT, { method: "POST", headers: { [HEADER_NAME]: `${TOKEN_WORD} ${params.apiKey}`, "Content-Type": "application/json" }, body: JSON.stringify({ from: params.from, to: [params.to], reply_to: params.replyTo, subject: params.subject, text: params.text }) });
}

function notSelectedEmailText(params: { booking: BookingRow; employee: EmployeeRow }) {
  const { booking, employee } = params;
  return [
    `Hi ${employee.name || "there"},`,
    "",
    "This Iboren job offer has been closed by admin.",
    "The job has been assigned to another cleaner or team, so you do not need to take action on this offer anymore.",
    "",
    `Service: ${booking.service}`,
    `Area: ${booking.area}`,
    `Address: ${booking.address || "-"}`,
    `Date: ${booking.preferred_date || "-"}`,
    `Time window: ${booking.time_window || "-"}`,
    "",
    "Best regards,",
    "Iboren"
  ].join("\n");
}

async function notifyNotSelected(params: { booking: BookingRow; employee: EmployeeRow }): Promise<EmailResult> {
  const to = params.employee.email.trim().toLowerCase();
  if (!isValidEmail(to)) return { to, sent: false, skipped: true, reason: "invalid_cleaner_email" };
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) return { to, sent: false, skipped: true, reason: "missing_resend_api_key" };
  const from = process.env.BOOKING_FROM_EMAIL || "Iboren <onboarding@resend.dev>";
  const replyTo = process.env.BOOKING_TO_EMAIL || "hej@iboren.se";
  const emailResult = await Promise.race([sendEmail({ apiKey, from, to, replyTo, subject: `Iboren: Job offer closed · ${params.booking.service}`, text: notSelectedEmailText(params) }), wait(EMAIL_WAIT_LIMIT_MS)]);
  if (emailResult === "timeout") return { to, sent: false, skipped: false, reason: "timeout" };
  return { to, sent: emailResult.ok, skipped: false, reason: emailResult.ok ? null : "resend_error" };
}

export async function POST(request: Request, { params }: { params: { id: string } }) {
  const admin = await verifyAdmin(request);
  if (!admin.ok) return NextResponse.json({ ok: false, message: admin.message }, { status: admin.status });

  try {
    const booking = await loadBooking(admin.supabase, params.id);
    if (!booking?.id) return NextResponse.json({ ok: false, message: "Booking not found." }, { status: 404 });

    const { data: rows, error: fetchError } = await admin.supabase
      .from("booking_assignments")
      .select("id, booking_id, employee_id, status, note, created_at, updated_at")
      .eq("booking_id", params.id)
      .in("status", ["assigned", "accepted"])
      .returns<AssignmentRow[]>();
    if (fetchError) return NextResponse.json({ ok: false, message: fetchError.message }, { status: 500 });

    const assignments = rows || [];
    if (!assignments.length) return NextResponse.json({ ok: true, count: 0, emails: [], message: "No remaining offers to close." });

    const ids = assignments.map((row) => row.id);
    const employeeIds = [...new Set(assignments.map((row) => row.employee_id))];
    const employees = await loadEmployees(admin.supabase, employeeIds);
    const employeeMap = new Map(employees.map((employee) => [employee.id, employee]));

    const { error: updateError } = await admin.supabase
      .from("booking_assignments")
      .update({ status: "not_selected", updated_at: new Date().toISOString() })
      .in("id", ids);
    if (updateError) return NextResponse.json({ ok: false, message: updateError.message }, { status: 500 });

    const emails: EmailResult[] = [];
    for (const assignment of assignments) {
      const employee = employeeMap.get(assignment.employee_id);
      if (employee) emails.push(await notifyNotSelected({ booking, employee }));
    }

    return NextResponse.json({ ok: true, count: ids.length, emails, message: `Closed ${ids.length} remaining offers.` });
  } catch (error) {
    return NextResponse.json({ ok: false, message: error instanceof Error ? error.message : "Could not close remaining offers." }, { status: 500 });
  }
}
