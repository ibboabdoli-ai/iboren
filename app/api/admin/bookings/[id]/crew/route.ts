import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export const runtime = "nodejs";

const HEADER_NAME = ["Author", "ization"].join("");
const TOKEN_WORD = ["Bear", "er"].join("");

type CrewPayload = { cleaners_needed?: unknown };
type BookingCrewRow = { id: string; cleaners_needed: number | null; size_sqm: number | null; service: string | null; frequency: string | null; notes: string | null };

function getAdminClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !serviceKey) return null;
  return createClient(url, serviceKey, { auth: { persistSession: false, autoRefreshToken: false } });
}

function getAdminEmails() {
  return (process.env.ADMIN_EMAILS || "ibbo.abdoli@gmail.com").split(",").map((email) => email.trim().toLowerCase()).filter(Boolean);
}

function getToken(request: Request) {
  const header = request.headers.get(HEADER_NAME.toLowerCase()) || "";
  return header.toLowerCase().startsWith(`${TOKEN_WORD.toLowerCase()} `) ? header.slice(TOKEN_WORD.length + 1).trim() : "";
}

function parseNeeded(value: unknown) {
  const numberValue = Number(value);
  if (!Number.isInteger(numberValue) || numberValue < 1 || numberValue > 20) return null;
  return numberValue;
}

function roundHalf(value: number) {
  return Math.max(1, Math.round(value * 2) / 2);
}

function estimateCrew(booking: BookingCrewRow | null) {
  const size = Number(booking?.size_sqm || 0);
  const notes = String(booking?.notes || "").toLowerCase();
  const frequency = String(booking?.frequency || "").toLowerCase();
  const service = String(booking?.service || "").toLowerCase();

  let hours = Math.max(2, size > 0 ? size / 30 : 2);
  if (notes.includes("husdjur") || notes.includes("pet") || notes.includes("hund") || notes.includes("katt")) hours += 0.5;
  if (notes.includes("första") || notes.includes("first") || notes.includes("engång") || notes.includes("one-time")) hours += 1;
  if (frequency.includes("engång") || frequency.includes("one-time") || frequency.includes("once")) hours += 0.5;
  if (service.includes("flytt") || service.includes("moving")) hours = Math.max(hours, size > 0 ? size / 18 : 4);
  if (service.includes("fönster") || service.includes("window")) hours = Math.max(2, hours * 0.75);

  const estimatedHours = roundHalf(hours);
  const suggestedCleaners = Math.min(20, Math.max(1, Math.ceil(estimatedHours / 4)));
  const hoursPerCleaner = roundHalf(estimatedHours / suggestedCleaners);
  return { estimated_hours: estimatedHours, suggested_cleaners: suggestedCleaners, hours_per_cleaner: hoursPerCleaner };
}

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

function missingColumnMessage() {
  return "Database column cleaners_needed is missing. Run the Step 18F SQL in Supabase.";
}

export async function GET(request: Request, { params }: { params: { id: string } }) {
  const admin = await verifyAdmin(request);
  if (!admin.ok) return NextResponse.json({ ok: false, message: admin.message }, { status: admin.status });

  const { data, error } = await admin.supabase
    .from("bookings")
    .select("id, cleaners_needed, size_sqm, service, frequency, notes")
    .eq("id", params.id)
    .maybeSingle<BookingCrewRow>();

  if (error) {
    const missingColumn = error.message?.toLowerCase().includes("cleaners_needed") || error.code === "42703";
    return NextResponse.json({ ok: true, cleaners_needed: 1, needsMigration: missingColumn, message: missingColumn ? missingColumnMessage() : error.message, ...estimateCrew(null) }, { status: missingColumn ? 200 : 500 });
  }

  if (!data?.id) return NextResponse.json({ ok: false, message: "Booking not found." }, { status: 404 });
  return NextResponse.json({ ok: true, cleaners_needed: data.cleaners_needed || 1, needsMigration: false, ...estimateCrew(data) });
}

export async function PATCH(request: Request, { params }: { params: { id: string } }) {
  const admin = await verifyAdmin(request);
  if (!admin.ok) return NextResponse.json({ ok: false, message: admin.message }, { status: admin.status });

  const body = await request.json().catch(() => null) as CrewPayload | null;
  const cleanersNeeded = parseNeeded(body?.cleaners_needed);
  if (!cleanersNeeded) return NextResponse.json({ ok: false, message: "cleaners_needed must be a whole number between 1 and 20." }, { status: 400 });

  const { data, error } = await admin.supabase
    .from("bookings")
    .update({ cleaners_needed: cleanersNeeded })
    .eq("id", params.id)
    .select("id, cleaners_needed, size_sqm, service, frequency, notes")
    .maybeSingle<BookingCrewRow>();

  if (error) {
    const missingColumn = error.message?.toLowerCase().includes("cleaners_needed") || error.code === "42703";
    return NextResponse.json({ ok: false, message: missingColumn ? missingColumnMessage() : error.message }, { status: 500 });
  }

  if (!data?.id) return NextResponse.json({ ok: false, message: "Booking not found." }, { status: 404 });
  return NextResponse.json({ ok: true, cleaners_needed: data.cleaners_needed || cleanersNeeded, ...estimateCrew(data) });
}
