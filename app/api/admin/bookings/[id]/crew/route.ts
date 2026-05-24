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

function getAdminEmails() { return (process.env.ADMIN_EMAILS || "ibbo.abdoli@gmail.com").split(",").map((email) => email.trim().toLowerCase()).filter(Boolean); }
function getToken(request: Request) { const header = request.headers.get(HEADER_NAME.toLowerCase()) || ""; return header.toLowerCase().startsWith(`${TOKEN_WORD.toLowerCase()} `) ? header.slice(TOKEN_WORD.length + 1).trim() : ""; }
function parseNeeded(value: unknown) { const numberValue = Number(value); return Number.isInteger(numberValue) && numberValue >= 1 && numberValue <= 20 ? numberValue : null; }
function roundHalf(value: number) { return Math.max(1, Math.round(value * 2) / 2); }
function has(text: string, words: string[]) { return words.some((word) => text.includes(word)); }

function baseHoursBySize(size: number) {
  if (!size || size <= 0) return 2;
  if (size <= 50) return 2;
  if (size <= 80) return 2.5;
  if (size <= 110) return 3.5;
  if (size <= 140) return 4.5;
  if (size <= 170) return 5.5;
  return 5.5 + Math.ceil((size - 170) / 30);
}

function frequencyFactor(frequency: string) {
  if (has(frequency, ["varje vecka", "weekly", "every week"])) return 0.95;
  if (has(frequency, ["varannan", "biweekly", "every other"])) return 1;
  if (has(frequency, ["månad", "monthly", "every month"])) return 1.1;
  if (has(frequency, ["engång", "one-time", "once"])) return 1.2;
  return 1;
}

function estimateCrew(booking: BookingCrewRow | null) {
  const size = Number(booking?.size_sqm || 0);
  const text = `${booking?.service || ""}\n${booking?.frequency || ""}\n${booking?.notes || ""}`.toLowerCase();
  const service = String(booking?.service || "").toLowerCase();
  const frequency = String(booking?.frequency || "").toLowerCase();

  let base = baseHoursBySize(size) * frequencyFactor(frequency);
  let extras = 0;

  if (has(text, ["husdjur", "pet", "hund", "katt"])) extras += 0.25;
  if (has(text, ["första", "first", "förstagång"])) extras += 0.75;
  if (has(text, ["grovstädning", "deep cleaning", "heavy cleaning"])) extras += Math.max(1, baseHoursBySize(size) * 0.35);
  if (has(text, ["fönsterputs", "window cleaning"])) extras += 1;
  if (has(text, ["balkong", "balcony"])) extras += 0.5;
  if (has(text, ["ugn", "oven"])) extras += 0.5;
  if (has(text, ["kyl", "frys", "fridge", "freezer"])) extras += 0.5;
  if (has(text, ["skåp", "lådor", "cabinet", "drawers"])) extras += 0.5;
  if (has(text, ["hiss: nej", "no elevator"]) && has(text, ["våning: 3", "floor: 3", "våning: 4", "floor: 4", "våning: 5", "floor: 5"])) extras += 0.25;

  let hours = base + extras;
  if (service.includes("flytt") || service.includes("moving")) hours = Math.max(hours, size > 0 ? size / 18 : 4);
  if (service.includes("fönster") || service.includes("window")) hours = Math.max(2, size > 0 ? size / 40 : 2);

  const estimatedHours = roundHalf(hours);
  const suggestedCleaners = estimatedHours <= 4 ? 1 : estimatedHours <= 8 ? 2 : estimatedHours <= 12 ? 3 : Math.min(20, Math.ceil(estimatedHours / 4));
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

function missingColumnMessage() { return "Database column cleaners_needed is missing. Run the Step 18F SQL in Supabase."; }

export async function GET(request: Request, { params }: { params: { id: string } }) {
  const admin = await verifyAdmin(request);
  if (!admin.ok) return NextResponse.json({ ok: false, message: admin.message }, { status: admin.status });

  const { data, error } = await admin.supabase.from("bookings").select("id, cleaners_needed, size_sqm, service, frequency, notes").eq("id", params.id).maybeSingle<BookingCrewRow>();

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

  const { data, error } = await admin.supabase.from("bookings").update({ cleaners_needed: cleanersNeeded }).eq("id", params.id).select("id, cleaners_needed, size_sqm, service, frequency, notes").maybeSingle<BookingCrewRow>();

  if (error) {
    const missingColumn = error.message?.toLowerCase().includes("cleaners_needed") || error.code === "42703";
    return NextResponse.json({ ok: false, message: missingColumn ? missingColumnMessage() : error.message }, { status: 500 });
  }

  if (!data?.id) return NextResponse.json({ ok: false, message: "Booking not found." }, { status: 404 });
  return NextResponse.json({ ok: true, cleaners_needed: data.cleaners_needed || cleanersNeeded, ...estimateCrew(data) });
}
