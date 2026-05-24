import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export const runtime = "nodejs";

const recurringFrequencies = ["varje vecka", "every week", "weekly", "varannan vecka", "every other week", "biweekly", "bi-weekly", "varje månad", "every month", "monthly"];

type RenewPayload = { bookingIds?: unknown };
type BookingRow = {
  id: string;
  user_id: string | null;
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
};

type Plan = { count: number; stepDays?: number; stepMonths?: number; label: string };

function getAdminClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !serviceKey) return null;
  return createClient(url, serviceKey, { auth: { persistSession: false, autoRefreshToken: false } });
}

function getAdminEmails() {
  return (process.env.ADMIN_EMAILS || "ibbo.abdoli@gmail.com").split(",").map((email) => email.trim().toLowerCase()).filter(Boolean);
}

function cleanText(value: unknown, max = 3000) {
  return String(value ?? "").replace(/[<>]/g, "").trim().slice(0, max);
}

function normalizeIds(value: unknown) {
  if (!Array.isArray(value)) return [];
  return [...new Set(value.map((item) => cleanText(item, 80)).filter(Boolean))].slice(0, 100);
}

function parseDate(dateValue: string | null) {
  if (!dateValue) return null;
  const date = new Date(`${dateValue}T12:00:00`);
  return Number.isNaN(date.getTime()) ? null : date;
}

function formatDate(date: Date) {
  return date.toISOString().slice(0, 10);
}

function addMonths(date: Date, months: number) {
  const next = new Date(date);
  const day = next.getDate();
  next.setMonth(next.getMonth() + months);
  if (next.getDate() < day) next.setDate(0);
  return next;
}

function getPlan(frequency: string | null): Plan | null {
  const value = cleanText(frequency).toLowerCase();
  if (["varje vecka", "every week", "weekly"].includes(value)) return { count: 8, stepDays: 7, label: "weekly" };
  if (["varannan vecka", "every other week", "biweekly", "bi-weekly"].includes(value)) return { count: 6, stepDays: 14, label: "every_other_week" };
  if (["varje månad", "every month", "monthly"].includes(value)) return { count: 6, stepMonths: 1, label: "monthly" };
  return null;
}

function buildNextDates(lastDate: string, plan: Plan) {
  const base = parseDate(lastDate);
  if (!base) return [];
  const dates: string[] = [];
  for (let index = 1; index <= plan.count; index += 1) {
    if (plan.stepMonths) dates.push(formatDate(addMonths(base, index * plan.stepMonths)));
    else dates.push(formatDate(new Date(base.getTime() + index * (plan.stepDays || 0) * 24 * 60 * 60 * 1000)));
  }
  return dates;
}

function stripRecurringBlock(notes: string | null) {
  return cleanText(notes).replace(/\n*--- Recurring visit ---[\s\S]*$/i, "").trim();
}

function visitNumber(booking: BookingRow) {
  const match = cleanText(booking.notes).match(/Visit:\s*(\d+)\s*of\s*(\d+)/i);
  return match ? Number(match[1]) : 0;
}

function isRecurring(frequency: string | null) {
  return recurringFrequencies.includes(cleanText(frequency).toLowerCase());
}

async function verifyAdmin(request: Request) {
  const supabase = getAdminClient();
  if (!supabase) return { ok: false as const, status: 500, message: "Missing Supabase admin environment variables." };

  const token = (request.headers.get("authorization") || "").replace(/^Bearer\s+/i, "").trim();
  if (!token) return { ok: false as const, status: 401, message: "Missing access token." };

  const { data, error } = await supabase.auth.getUser(token);
  const email = data.user?.email?.toLowerCase();
  if (error || !email) return { ok: false as const, status: 401, message: "Invalid session." };

  const { data: roles, error: roleError } = await supabase.from("user_roles").select("role, active").eq("email", email).limit(1);
  if (roleError) return { ok: false as const, status: 500, message: roleError.message };

  const isAdminByRole = Boolean((roles || []).find((row) => row.active && row.role === "admin"));
  const isAdminByEnv = getAdminEmails().includes(email);
  if (!isAdminByRole && !isAdminByEnv) return { ok: false as const, status: 403, message: "Admin access required." };
  return { ok: true as const, supabase };
}

export async function POST(request: Request) {
  const admin = await verifyAdmin(request);
  if (!admin.ok) return NextResponse.json({ ok: false, message: admin.message }, { status: admin.status });

  const body = await request.json().catch(() => null) as RenewPayload | null;
  const bookingIds = normalizeIds(body?.bookingIds);
  if (!bookingIds.length) return NextResponse.json({ ok: false, message: "bookingIds is required." }, { status: 400 });

  const { data: rows, error: fetchError } = await admin.supabase
    .from("bookings")
    .select("id, user_id, service, area, address, size_sqm, frequency, preferred_date, time_window, customer_name, customer_email, customer_phone, notes, status")
    .in("id", bookingIds)
    .returns<BookingRow[]>();
  if (fetchError) return NextResponse.json({ ok: false, message: fetchError.message }, { status: 500 });

  const bookings = (rows || []).filter((booking) => isRecurring(booking.frequency) && booking.preferred_date);
  if (!bookings.length) return NextResponse.json({ ok: false, message: "No recurring bookings found in this group." }, { status: 400 });

  const sorted = [...bookings].sort((a, b) => String(a.preferred_date || "").localeCompare(String(b.preferred_date || "")));
  const template = sorted[sorted.length - 1];
  const plan = getPlan(template.frequency);
  if (!plan || !template.preferred_date) return NextResponse.json({ ok: false, message: "Unsupported recurring frequency." }, { status: 400 });

  const nextDates = buildNextDates(template.preferred_date, plan);
  const { data: existingRows, error: existingError } = await admin.supabase
    .from("bookings")
    .select("preferred_date")
    .eq("customer_email", template.customer_email)
    .eq("service", template.service)
    .eq("address", template.address)
    .eq("frequency", template.frequency)
    .in("preferred_date", nextDates)
    .neq("status", "cancelled");
  if (existingError) return NextResponse.json({ ok: false, message: existingError.message }, { status: 500 });

  const existingDates = new Set((existingRows || []).map((row: { preferred_date: string }) => row.preferred_date));
  const datesToCreate = nextDates.filter((date) => !existingDates.has(date));
  if (!datesToCreate.length) return NextResponse.json({ ok: true, count: 0, dates: [], message: "No new visits needed. The next dates already exist." });

  const baseNotes = stripRecurringBlock(template.notes);
  const currentMaxVisit = Math.max(...bookings.map(visitNumber), bookings.length);
  const totalAfterRenew = currentMaxVisit + datesToCreate.length;
  const rowsToInsert = datesToCreate.map((date, index) => ({
    user_id: template.user_id,
    service: template.service,
    area: template.area,
    address: template.address,
    size_sqm: template.size_sqm,
    frequency: template.frequency,
    preferred_date: date,
    time_window: template.time_window,
    customer_name: template.customer_name,
    customer_email: template.customer_email,
    customer_phone: template.customer_phone,
    notes: [
      baseNotes,
      "",
      "--- Recurring visit ---",
      `Visit: ${currentMaxVisit + index + 1} of ${totalAfterRenew}`,
      `Original start date: ${sorted[0].preferred_date}`,
      `Frequency: ${template.frequency}`,
      "Renewed by admin"
    ].filter(Boolean).join("\n").trim(),
    status: "new"
  }));

  const { data: inserted, error: insertError } = await admin.supabase.from("bookings").insert(rowsToInsert).select("id, preferred_date");
  if (insertError) return NextResponse.json({ ok: false, message: insertError.message }, { status: 500 });

  return NextResponse.json({ ok: true, count: (inserted || []).length, dates: datesToCreate, message: `Renewed ${datesToCreate.length} visits.` });
}
