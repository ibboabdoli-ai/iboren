import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export const runtime = "nodejs";

const HEADER_NAME = ["Author", "ization"].join("");
const TOKEN_WORD = ["Bear", "er"].join("");
const STAFF_ROLES = ["admin", "supervisor", "cleaner"] as const;
type StaffRole = typeof STAFF_ROLES[number];

type EmployeeRow = { id: string; email: string; name: string; phone: string | null; role: StaffRole; active: boolean };
type AssignmentRow = { id: string; booking_id: string; employee_id: string; status: string; note: string | null; created_at: string; updated_at: string };
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
  return header.toLowerCase().startsWith(`${TOKEN_WORD.toLowerCase()} `) ? header.slice(TOKEN_WORD.length + 1).trim() : "";
}

function cleanText(value: unknown, max = 500) {
  return String(value || "").replace(/[<>]/g, "").trim().slice(0, max);
}

function isStaffRole(value: unknown): value is StaffRole {
  return STAFF_ROLES.includes(String(value || "") as StaffRole);
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

  const { data: roleRows, error: roleError } = await supabase.from("user_roles").select("role, active").eq("email", email).limit(1);
  if (roleError) return { ok: false as const, status: 500, message: roleError.message };

  const roleRow = (roleRows || [])[0];
  if (!roleRow?.active || !isStaffRole(roleRow.role)) return { ok: false as const, status: 403, message: "Staff access required." };

  const { data: employee, error: employeeError } = await supabase
    .from("employees")
    .select("id, email, name, phone, role, active")
    .eq("email", email)
    .maybeSingle<EmployeeRow>();

  if (employeeError) return { ok: false as const, status: 500, message: employeeError.message };
  if (!employee?.id) return { ok: false as const, status: 404, message: "Employee profile not found." };
  if (!employee.active) return { ok: false as const, status: 403, message: "Employee is inactive." };

  return { ok: true as const, supabase, role: roleRow.role as StaffRole, employee };
}

function pad(value: number) {
  return String(value).padStart(2, "0");
}

function timeRange(timeWindow: string | null) {
  const value = cleanText(timeWindow).toLowerCase();
  if (value.includes("morgon") || value.includes("morning")) return { start: "080000", end: "120000" };
  if (value.includes("förmiddag") || value.includes("late morning")) return { start: "100000", end: "130000" };
  if (value.includes("eftermiddag") || value.includes("afternoon")) return { start: "130000", end: "170000" };
  if (value.includes("kväll") || value.includes("evening")) return { start: "170000", end: "200000" };
  return { start: "090000", end: "120000" };
}

function icsDate(dateValue: string, hhmmss: string) {
  const date = new Date(`${dateValue}T12:00:00`);
  if (Number.isNaN(date.getTime())) return null;
  return `${date.getFullYear()}${pad(date.getMonth() + 1)}${pad(date.getDate())}T${hhmmss}`;
}

function utcStamp() {
  const now = new Date();
  return now.toISOString().replace(/[-:]/g, "").replace(/\.\d{3}Z$/, "Z");
}

function escapeIcs(value: unknown) {
  return cleanText(value, 1800).replace(/\\/g, "\\\\").replace(/;/g, "\\;").replace(/,/g, "\\,").replace(/\r?\n/g, "\\n");
}

function buildIcs(params: { assignment: AssignmentRow; booking: BookingRow; employee: EmployeeRow }) {
  const { assignment, booking, employee } = params;
  const range = timeRange(booking.time_window);
  const start = booking.preferred_date ? icsDate(booking.preferred_date, range.start) : null;
  const end = booking.preferred_date ? icsDate(booking.preferred_date, range.end) : null;
  if (!start || !end) return null;

  const summary = `Iboren · ${booking.service}`;
  const location = [booking.address, booking.area].filter(Boolean).join(", ");
  const description = [
    `Service: ${booking.service}`,
    `Customer: ${booking.customer_name}`,
    `Phone: ${booking.customer_phone || "-"}`,
    `Size: ${booking.size_sqm ? `${booking.size_sqm} sqm` : "-"}`,
    `Frequency: ${booking.frequency || "-"}`,
    `Time window: ${booking.time_window || "Flexible"}`,
    assignment.note ? `Admin note: ${assignment.note}` : "",
    booking.notes ? `Notes: ${booking.notes}` : "",
    "Open cleaner panel: https://iboren.se/cleaner"
  ].filter(Boolean).join("\n");

  return [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//Iboren//Cleaner Job//SV",
    "CALSCALE:GREGORIAN",
    "METHOD:PUBLISH",
    "BEGIN:VTIMEZONE",
    "TZID:Europe/Stockholm",
    "END:VTIMEZONE",
    "BEGIN:VEVENT",
    `UID:iboren-${assignment.id}@iboren.se`,
    `DTSTAMP:${utcStamp()}`,
    `DTSTART;TZID=Europe/Stockholm:${start}`,
    `DTEND;TZID=Europe/Stockholm:${end}`,
    `SUMMARY:${escapeIcs(summary)}`,
    `LOCATION:${escapeIcs(location || booking.area)}`,
    `DESCRIPTION:${escapeIcs(description)}`,
    `ORGANIZER;CN=Iboren:MAILTO:${process.env.BOOKING_TO_EMAIL || "hej@iboren.se"}`,
    `ATTENDEE;CN=${escapeIcs(employee.name)};ROLE=REQ-PARTICIPANT:MAILTO:${employee.email}`,
    "STATUS:CONFIRMED",
    "END:VEVENT",
    "END:VCALENDAR"
  ].join("\r\n");
}

export async function GET(request: Request, { params }: { params: { assignmentId: string } }) {
  const staff = await verifyStaff(request);
  if (!staff.ok) return NextResponse.json({ ok: false, message: staff.message }, { status: staff.status });

  const { data: assignment, error: assignmentError } = await staff.supabase
    .from("booking_assignments")
    .select("id, booking_id, employee_id, status, note, created_at, updated_at")
    .eq("id", params.assignmentId)
    .maybeSingle<AssignmentRow>();

  if (assignmentError) return NextResponse.json({ ok: false, message: assignmentError.message }, { status: 500 });
  if (!assignment?.id) return NextResponse.json({ ok: false, message: "Assignment not found." }, { status: 404 });
  if (staff.role === "cleaner" && assignment.employee_id !== staff.employee.id) return NextResponse.json({ ok: false, message: "Not your assignment." }, { status: 403 });

  const { data: booking, error: bookingError } = await staff.supabase
    .from("bookings")
    .select("id, service, area, address, size_sqm, frequency, preferred_date, time_window, customer_name, customer_email, customer_phone, notes, status, created_at")
    .eq("id", assignment.booking_id)
    .maybeSingle<BookingRow>();

  if (bookingError) return NextResponse.json({ ok: false, message: bookingError.message }, { status: 500 });
  if (!booking?.id) return NextResponse.json({ ok: false, message: "Booking not found." }, { status: 404 });

  const ics = buildIcs({ assignment, booking, employee: staff.employee });
  if (!ics) return NextResponse.json({ ok: false, message: "Booking has no valid date." }, { status: 400 });

  return new Response(ics, {
    status: 200,
    headers: {
      "Content-Type": "text/calendar; charset=utf-8",
      "Content-Disposition": `attachment; filename="iboren-job-${assignment.id}.ics"`,
      "Cache-Control": "no-store"
    }
  });
}
