import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export const runtime = "nodejs";

const APPROVAL_STATUSES = ["submitted", "approved", "rejected", "paid"] as const;
type ApprovalStatus = typeof APPROVAL_STATUSES[number];

type TimeEntryRow = {
  id: string;
  booking_id: string;
  assignment_id: string;
  employee_id: string;
  work_date: string;
  break_minutes: number;
  worked_minutes: number;
  travel_minutes: number;
  mileage_km: number;
  status: ApprovalStatus;
  cleaner_note: string | null;
  admin_note: string | null;
  approved_by: string | null;
  approved_at: string | null;
  created_at: string;
  updated_at: string;
};

type EmployeeRow = { id: string; email: string; name: string; phone: string | null };
type BookingRow = { id: string; service: string; area: string; address: string | null; preferred_date: string | null; customer_name: string; customer_email: string; customer_phone: string | null };

type PatchBody = {
  id?: string;
  status?: string;
  admin_note?: string;
  worked_minutes?: unknown;
  break_minutes?: unknown;
  travel_minutes?: unknown;
  mileage_km?: unknown;
};

function getAdminEmails() {
  return (process.env.ADMIN_EMAILS || "ibbo.abdoli@gmail.com").split(",").map((email) => email.trim().toLowerCase()).filter(Boolean);
}

function getAdminClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) return null;
  return createClient(url, key, { auth: { persistSession: false, autoRefreshToken: false } });
}

function clean(value: unknown, max = 500) {
  return String(value || "").replace(/[<>]/g, "").trim().slice(0, max);
}

function intValue(value: unknown, fallback = 0) {
  const parsed = Number.parseInt(String(value ?? fallback), 10);
  return Number.isFinite(parsed) ? parsed : fallback;
}

function numValue(value: unknown, fallback = 0) {
  const parsed = Number.parseFloat(String(value ?? fallback).replace(",", "."));
  return Number.isFinite(parsed) ? parsed : fallback;
}

function validStatus(value: unknown): ApprovalStatus | null {
  const status = String(value || "").toLowerCase();
  return APPROVAL_STATUSES.includes(status as ApprovalStatus) ? status as ApprovalStatus : null;
}

function migrationMissing(error: { code?: string; message?: string } | null) {
  const text = String(error?.message || "").toLowerCase();
  return error?.code === "42P01" || text.includes("time_entries") || text.includes("does not exist");
}

async function verifyAdmin(request: Request) {
  const supabase = getAdminClient();
  if (!supabase) return { ok: false as const, status: 500, message: "Missing Supabase admin variables." };
  const header = request.headers.get("authorization") || "";
  const token = header.replace(/^Bearer\s+/i, "").trim();
  if (!token) return { ok: false as const, status: 401, message: "Missing access token." };
  const { data, error } = await supabase.auth.getUser(token);
  const email = data.user?.email?.toLowerCase() || "";
  if (error || !data.user || !email) return { ok: false as const, status: 401, message: "Invalid session." };
  if (!getAdminEmails().includes(email)) return { ok: false as const, status: 403, message: "Admin access required." };
  return { ok: true as const, supabase, user: data.user, email };
}

export async function GET(request: Request) {
  const admin = await verifyAdmin(request);
  if (!admin.ok) return NextResponse.json({ ok: false, message: admin.message }, { status: admin.status });

  const { data: entries, error } = await admin.supabase
    .from("time_entries")
    .select("id, booking_id, assignment_id, employee_id, work_date, break_minutes, worked_minutes, travel_minutes, mileage_km, status, cleaner_note, admin_note, approved_by, approved_at, created_at, updated_at")
    .order("created_at", { ascending: false })
    .limit(100)
    .returns<TimeEntryRow[]>();

  if (error) {
    if (migrationMissing(error)) return NextResponse.json({ ok: true, needsMigration: true, entries: [], employees: {}, bookings: {}, message: "Run Step 25A SQL in Supabase first." });
    return NextResponse.json({ ok: false, message: error.message }, { status: 500 });
  }

  const employeeIds = [...new Set((entries || []).map((entry) => entry.employee_id))];
  const bookingIds = [...new Set((entries || []).map((entry) => entry.booking_id))];

  const { data: employeesData } = employeeIds.length
    ? await admin.supabase.from("employees").select("id, email, name, phone").in("id", employeeIds).returns<EmployeeRow[]>()
    : { data: [] as EmployeeRow[] };

  const { data: bookingsData } = bookingIds.length
    ? await admin.supabase.from("bookings").select("id, service, area, address, preferred_date, customer_name, customer_email, customer_phone").in("id", bookingIds).returns<BookingRow[]>()
    : { data: [] as BookingRow[] };

  const employees = Object.fromEntries((employeesData || []).map((employee) => [employee.id, employee]));
  const bookings = Object.fromEntries((bookingsData || []).map((booking) => [booking.id, booking]));

  return NextResponse.json({ ok: true, needsMigration: false, entries: entries || [], employees, bookings });
}

export async function PATCH(request: Request) {
  const admin = await verifyAdmin(request);
  if (!admin.ok) return NextResponse.json({ ok: false, message: admin.message }, { status: admin.status });

  const body = await request.json().catch(() => null) as PatchBody | null;
  const id = clean(body?.id, 80);
  const status = validStatus(body?.status);
  if (!id) return NextResponse.json({ ok: false, message: "id is required." }, { status: 400 });
  if (!status) return NextResponse.json({ ok: false, message: "status must be submitted, approved, rejected or paid." }, { status: 400 });

  const workedMinutes = intValue(body?.worked_minutes, 0);
  const breakMinutes = intValue(body?.break_minutes, 0);
  const travelMinutes = intValue(body?.travel_minutes, 0);
  const mileageKm = numValue(body?.mileage_km, 0);
  if (workedMinutes <= 0 || workedMinutes > 960) return NextResponse.json({ ok: false, message: "Worked time must be between 1 minute and 16 hours." }, { status: 400 });
  if (breakMinutes < 0 || breakMinutes > 480) return NextResponse.json({ ok: false, message: "Break must be 0–480 minutes." }, { status: 400 });
  if (travelMinutes < 0 || travelMinutes > 480) return NextResponse.json({ ok: false, message: "Travel must be 0–480 minutes." }, { status: 400 });
  if (mileageKm < 0 || mileageKm > 1000) return NextResponse.json({ ok: false, message: "Mileage must be 0–1000 km." }, { status: 400 });

  const update = {
    status,
    worked_minutes: workedMinutes,
    break_minutes: breakMinutes,
    travel_minutes: travelMinutes,
    mileage_km: mileageKm,
    admin_note: clean(body?.admin_note, 500) || null,
    approved_by: status === "approved" ? admin.user.id : null,
    approved_at: status === "approved" ? new Date().toISOString() : null,
    updated_at: new Date().toISOString()
  };

  const { data, error } = await admin.supabase
    .from("time_entries")
    .update(update)
    .eq("id", id)
    .select("id, booking_id, assignment_id, employee_id, work_date, break_minutes, worked_minutes, travel_minutes, mileage_km, status, cleaner_note, admin_note, approved_by, approved_at, created_at, updated_at")
    .single<TimeEntryRow>();

  if (error) {
    if (migrationMissing(error)) return NextResponse.json({ ok: false, needsMigration: true, message: "Run Step 25A SQL in Supabase first." }, { status: 500 });
    return NextResponse.json({ ok: false, message: error.message }, { status: 500 });
  }

  return NextResponse.json({ ok: true, entry: data });
}
