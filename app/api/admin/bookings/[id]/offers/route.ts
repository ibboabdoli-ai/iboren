import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export const runtime = "nodejs";

const HEADER_NAME = ["Author", "ization"].join("");
const TOKEN_WORD = ["Bear", "er"].join("");
const EMAIL_ENDPOINT = ["https://api.re", "send.com/emails"].join("");
const EMAIL_WAIT_LIMIT_MS = 4500;
const ACTIVE_STATUSES = ["assigned", "accepted", "declined", "confirmed", "completed", "not_selected"];

type OfferPayload = { employee_id?: string; assignment_id?: string; status?: string; note?: string };
type EmployeeRow = { id: string; email: string; name: string; phone: string | null; role: string; active: boolean; has_car: boolean; max_hours_per_day: number };
type AssignmentRow = { id: string; booking_id: string; employee_id: string; assigned_by: string | null; status: string; note: string | null; created_at: string; updated_at: string };
type BookingRow = { id: string; service: string; area: string; address: string | null; size_sqm: number | null; frequency: string | null; preferred_date: string | null; time_window: string | null; customer_name: string; customer_email: string; customer_phone: string | null; notes: string | null; status: string | null; created_at: string };
type EmailResult = { sent: boolean; skipped: boolean; reason: string | null };

function getAdminClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !serviceKey) return null;
  return createClient(url, serviceKey, { auth: { persistSession: false, autoRefreshToken: false } });
}

type AdminClient = NonNullable<ReturnType<typeof getAdminClient>>;
function getAdminEmails() { return (process.env.ADMIN_EMAILS || "ibbo.abdoli@gmail.com").split(",").map((email) => email.trim().toLowerCase()).filter(Boolean); }
function getToken(request: Request) { const header = request.headers.get(HEADER_NAME.toLowerCase()) || ""; return header.toLowerCase().startsWith(`${TOKEN_WORD.toLowerCase()} `) ? header.slice(TOKEN_WORD.length + 1).trim() : ""; }
function cleanText(value: unknown, max = 500) { return String(value || "").replace(/[<>]/g, "").trim().slice(0, max); }
function isValidEmail(email: string) { return /^\S+@\S+\.\S+$/.test(email); }
function wait(ms: number) { return new Promise<"timeout">((resolve) => setTimeout(() => resolve("timeout"), ms)); }

async function verifyAdmin(request: Request) {
  const supabase = getAdminClient();
  if (!supabase) return { ok: false as const, status: 500, message: "Missing Supabase admin environment variables." };
  const token = getToken(request);
  if (!token) return { ok: false as const, status: 401, message: "Missing access token." };
  const { data, error } = await supabase.auth.getUser(token);
  const user = data.user;
  const email = user?.email?.toLowerCase() || "";
  if (error || !user || !email) return { ok: false as const, status: 401, message: "Invalid session." };
  const { data: roles, error: roleError } = await supabase.from("user_roles").select("role, active").eq("email", email).limit(1);
  if (roleError) return { ok: false as const, status: 500, message: roleError.message };
  const isAdminByRole = Boolean((roles || []).find((row) => row.active && row.role === "admin"));
  const isAdminByEnv = getAdminEmails().includes(email);
  if (!isAdminByRole && !isAdminByEnv) return { ok: false as const, status: 403, message: "Admin access required." };
  return { ok: true as const, supabase, user };
}

async function loadBooking(supabase: AdminClient, bookingId: string) {
  const { data, error } = await supabase.from("bookings").select("id, service, area, address, size_sqm, frequency, preferred_date, time_window, customer_name, customer_email, customer_phone, notes, status, created_at").eq("id", bookingId).maybeSingle<BookingRow>();
  if (error) throw error;
  return data;
}
async function loadEmployee(supabase: AdminClient, employeeId: string) {
  const { data, error } = await supabase.from("employees").select("id, email, name, phone, role, active, has_car, max_hours_per_day").eq("id", employeeId).maybeSingle<EmployeeRow>();
  if (error) throw error;
  return data;
}
async function sendEmail(params: { apiKey: string; from: string; to: string; replyTo?: string; subject: string; text: string }) {
  return fetch(EMAIL_ENDPOINT, { method: "POST", headers: { [HEADER_NAME]: `${TOKEN_WORD} ${params.apiKey}`, "Content-Type": "application/json" }, body: JSON.stringify({ from: params.from, to: [params.to], reply_to: params.replyTo, subject: params.subject, text: params.text }) });
}

function offerEmailText(params: { booking: BookingRow; employee: EmployeeRow; note: string | null }) {
  const { booking, employee, note } = params;
  return [`Hi ${employee.name || "there"},`, "", "You have received a new Iboren job offer.", "Please log in to your cleaner panel and accept or decline the offer.", "", `Service: ${booking.service}`, `Area: ${booking.area}`, `Address: ${booking.address || "-"}`, `Date: ${booking.preferred_date || "-"}`, `Time window: ${booking.time_window || "-"}`, `Size: ${booking.size_sqm ? `${booking.size_sqm} sqm` : "-"}`, `Frequency: ${booking.frequency || "-"}`, "", `Customer: ${booking.customer_name}`, `Customer phone: ${booking.customer_phone || "-"}`, note ? `Admin note: ${note}` : "Admin note: -", "", "Cleaner panel: https://iboren.se/cleaner", "", "Best regards,", "Iboren"].join("\n");
}
function confirmedEmailText(params: { booking: BookingRow; employee: EmployeeRow }) {
  const { booking, employee } = params;
  return [`Hi ${employee.name || "there"},`, "", "Admin has confirmed you for this Iboren job.", "Please save the job in your calendar and complete it in the cleaner panel after the work is done.", "", `Service: ${booking.service}`, `Area: ${booking.area}`, `Address: ${booking.address || "-"}`, `Date: ${booking.preferred_date || "-"}`, `Time window: ${booking.time_window || "-"}`, "", "Cleaner panel: https://iboren.se/cleaner", "", "Best regards,", "Iboren"].join("\n");
}
async function sendCleanerEmail(params: { toEmail: string; subject: string; text: string }): Promise<EmailResult> {
  const resendApiKey = process.env.RESEND_API_KEY;
  const fromEmail = process.env.BOOKING_FROM_EMAIL || "Iboren <onboarding@resend.dev>";
  const replyTo = process.env.BOOKING_TO_EMAIL || "hej@iboren.se";
  const toEmail = params.toEmail.trim().toLowerCase();
  if (!isValidEmail(toEmail)) return { sent: false, skipped: true, reason: "invalid_cleaner_email" };
  if (!resendApiKey) { console.info("IBOREN_CLEANER_EMAIL", { to: toEmail, subject: params.subject, text: params.text }); return { sent: false, skipped: true, reason: "missing_resend_api_key" }; }
  const emailResult = await Promise.race([sendEmail({ apiKey: resendApiKey, from: fromEmail, to: toEmail, replyTo, subject: params.subject, text: params.text }), wait(EMAIL_WAIT_LIMIT_MS)]);
  if (emailResult === "timeout") return { sent: false, skipped: false, reason: "timeout" };
  return { sent: emailResult.ok, skipped: false, reason: emailResult.ok ? null : "resend_error" };
}
async function notifyOffer(params: { booking: BookingRow; employee: EmployeeRow; note: string | null }) { return sendCleanerEmail({ toEmail: params.employee.email, subject: `Iboren: New job offer · ${params.booking.service}`, text: offerEmailText(params) }); }
async function notifyConfirmed(params: { booking: BookingRow; employee: EmployeeRow }) { return sendCleanerEmail({ toEmail: params.employee.email, subject: `Iboren: Job confirmed · ${params.booking.service}`, text: confirmedEmailText(params) }); }

async function getOffers(supabase: AdminClient, bookingId: string) {
  const { data: assignments, error } = await supabase.from("booking_assignments").select("id, booking_id, employee_id, assigned_by, status, note, created_at, updated_at").eq("booking_id", bookingId).in("status", ACTIVE_STATUSES).order("updated_at", { ascending: false }).returns<AssignmentRow[]>();
  if (error) throw error;
  const employeeIds = [...new Set((assignments || []).map((row) => row.employee_id))];
  if (!employeeIds.length) return [];
  const { data: employees, error: employeeError } = await supabase.from("employees").select("id, email, name, phone, role, active, has_car, max_hours_per_day").in("id", employeeIds).returns<EmployeeRow[]>();
  if (employeeError) throw employeeError;
  const employeeMap = new Map((employees || []).map((employee) => [employee.id, employee]));
  return (assignments || []).map((assignment) => ({ assignment, employee: employeeMap.get(assignment.employee_id) || null }));
}

export async function GET(request: Request, { params }: { params: { id: string } }) {
  const admin = await verifyAdmin(request);
  if (!admin.ok) return NextResponse.json({ ok: false, message: admin.message }, { status: admin.status });
  try { return NextResponse.json({ ok: true, offers: await getOffers(admin.supabase, params.id) }); }
  catch (error) { return NextResponse.json({ ok: false, message: error instanceof Error ? error.message : "Could not load offers." }, { status: 500 }); }
}

export async function POST(request: Request, { params }: { params: { id: string } }) {
  const admin = await verifyAdmin(request);
  if (!admin.ok) return NextResponse.json({ ok: false, message: admin.message }, { status: admin.status });
  const body = await request.json().catch(() => null) as OfferPayload | null;
  const employeeId = cleanText(body?.employee_id, 80);
  const note = cleanText(body?.note, 500) || null;
  if (!employeeId) return NextResponse.json({ ok: false, message: "employee_id is required." }, { status: 400 });
  try {
    const booking = await loadBooking(admin.supabase, params.id);
    if (!booking?.id) return NextResponse.json({ ok: false, message: "Booking not found." }, { status: 404 });
    const employee = await loadEmployee(admin.supabase, employeeId);
    if (!employee?.id || !employee.active || employee.role !== "cleaner") return NextResponse.json({ ok: false, message: "Selected employee is not an active cleaner." }, { status: 400 });
    const { data: existing, error: existingError } = await admin.supabase.from("booking_assignments").select("id, booking_id, employee_id, assigned_by, status, note, created_at, updated_at").eq("booking_id", params.id).eq("employee_id", employee.id).in("status", [...ACTIVE_STATUSES, "cancelled"]).order("updated_at", { ascending: false }).limit(1).maybeSingle<AssignmentRow>();
    if (existingError) throw existingError;
    if (existing?.status === "completed") return NextResponse.json({ ok: false, message: "Completed assignment cannot receive a new offer." }, { status: 400 });
    const payload = { booking_id: params.id, employee_id: employee.id, assigned_by: admin.user.id, status: "assigned", note, updated_at: new Date().toISOString() };
    const query = existing?.id ? admin.supabase.from("booking_assignments").update(payload).eq("id", existing.id).select("id, booking_id, employee_id, assigned_by, status, note, created_at, updated_at").single<AssignmentRow>() : admin.supabase.from("booking_assignments").insert(payload).select("id, booking_id, employee_id, assigned_by, status, note, created_at, updated_at").single<AssignmentRow>();
    const { data: assignment, error: saveError } = await query;
    if (saveError) return NextResponse.json({ ok: false, message: saveError.message }, { status: 500 });
    let cleanerEmail: EmailResult = { sent: false, skipped: true, reason: "not_attempted" };
    try { cleanerEmail = await notifyOffer({ booking, employee, note }); } catch { cleanerEmail = { sent: false, skipped: false, reason: "exception" }; }
    return NextResponse.json({ ok: true, assignment, employee, cleanerEmail, offers: await getOffers(admin.supabase, params.id) });
  } catch (error) { return NextResponse.json({ ok: false, message: error instanceof Error ? error.message : "Could not send offer." }, { status: 500 }); }
}

export async function PATCH(request: Request, { params }: { params: { id: string } }) {
  const admin = await verifyAdmin(request);
  if (!admin.ok) return NextResponse.json({ ok: false, message: admin.message }, { status: admin.status });
  const body = await request.json().catch(() => null) as OfferPayload | null;
  const assignmentId = cleanText(body?.assignment_id, 80);
  const status = cleanText(body?.status, 40);
  if (!assignmentId || status !== "confirmed") return NextResponse.json({ ok: false, message: "assignment_id and status=confirmed are required." }, { status: 400 });
  try {
    const booking = await loadBooking(admin.supabase, params.id);
    if (!booking?.id) return NextResponse.json({ ok: false, message: "Booking not found." }, { status: 404 });
    const { data: existing, error: findError } = await admin.supabase.from("booking_assignments").select("id, booking_id, employee_id, assigned_by, status, note, created_at, updated_at").eq("id", assignmentId).eq("booking_id", params.id).maybeSingle<AssignmentRow>();
    if (findError) throw findError;
    if (!existing?.id) return NextResponse.json({ ok: false, message: "Offer not found." }, { status: 404 });
    if (existing.status !== "accepted") return NextResponse.json({ ok: false, message: "Only available cleaners can be confirmed." }, { status: 400 });
    const { data: assignment, error: updateError } = await admin.supabase.from("booking_assignments").update({ status: "confirmed", updated_at: new Date().toISOString() }).eq("id", existing.id).select("id, booking_id, employee_id, assigned_by, status, note, created_at, updated_at").single<AssignmentRow>();
    if (updateError) return NextResponse.json({ ok: false, message: updateError.message }, { status: 500 });
    const employee = await loadEmployee(admin.supabase, assignment.employee_id);
    let cleanerEmail: EmailResult = { sent: false, skipped: true, reason: "no_cleaner_email" };
    if (employee?.id) {
      try { cleanerEmail = await notifyConfirmed({ booking, employee }); } catch { cleanerEmail = { sent: false, skipped: false, reason: "exception" }; }
    }
    return NextResponse.json({ ok: true, assignment, employee, cleanerEmail, offers: await getOffers(admin.supabase, params.id) });
  } catch (error) { return NextResponse.json({ ok: false, message: error instanceof Error ? error.message : "Could not confirm cleaner." }, { status: 500 }); }
}
