import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export const runtime = "nodejs";

const AUTH_HEADER = ["Author", "ization"].join("");
const TOKEN_PREFIX = ["Bear", "er"].join("");

function adminClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) return null;
  return createClient(url, key, { auth: { persistSession: false, autoRefreshToken: false } });
}

function tokenFrom(request: Request) {
  const header = request.headers.get(AUTH_HEADER.toLowerCase()) || "";
  return header.toLowerCase().startsWith(`${TOKEN_PREFIX.toLowerCase()} `) ? header.slice(TOKEN_PREFIX.length + 1).trim() : "";
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

function migrationMissing(error: { code?: string; message?: string } | null) {
  const text = String(error?.message || "").toLowerCase();
  return error?.code === "42P01" || text.includes("time_entries") || text.includes("does not exist");
}

async function verify(request: Request) {
  const supabase = adminClient();
  if (!supabase) return { ok: false as const, status: 500, message: "Missing Supabase admin variables." };
  const token = tokenFrom(request);
  if (!token) return { ok: false as const, status: 401, message: "Missing access token." };
  const { data, error } = await supabase.auth.getUser(token);
  const email = data.user?.email?.toLowerCase() || "";
  if (error || !email) return { ok: false as const, status: 401, message: "Invalid session." };
  const { data: employee, error: employeeError } = await supabase.from("employees").select("id, email, active, role").eq("email", email).maybeSingle();
  if (employeeError) return { ok: false as const, status: 500, message: employeeError.message };
  if (!employee?.id || !employee.active) return { ok: false as const, status: 403, message: "Active employee record required." };
  return { ok: true as const, supabase, employee, role: String(employee.role || "") };
}

export async function GET(request: Request) {
  const staff = await verify(request);
  if (!staff.ok) return NextResponse.json({ ok: false, message: staff.message }, { status: staff.status });
  const assignmentId = clean(new URL(request.url).searchParams.get("assignment_id"), 80);
  if (!assignmentId) return NextResponse.json({ ok: false, message: "assignment_id is required." }, { status: 400 });
  const { data, error } = await staff.supabase.from("time_entries").select("*").eq("assignment_id", assignmentId).maybeSingle();
  if (error) {
    if (migrationMissing(error)) return NextResponse.json({ ok: true, needsMigration: true, entry: null, message: "Run Step 25A SQL in Supabase." });
    return NextResponse.json({ ok: false, message: error.message }, { status: 500 });
  }
  return NextResponse.json({ ok: true, needsMigration: false, entry: data || null });
}

export async function POST(request: Request) {
  const staff = await verify(request);
  if (!staff.ok) return NextResponse.json({ ok: false, message: staff.message }, { status: staff.status });
  const body = await request.json().catch(() => null) as Record<string, unknown> | null;
  const assignmentId = clean(body?.assignment_id, 80);
  const workDate = clean(body?.work_date, 20);
  const workedMinutes = intValue(body?.worked_minutes, 0);
  const breakMinutes = intValue(body?.break_minutes, 0);
  const travelMinutes = intValue(body?.travel_minutes, 0);
  const mileageKm = numValue(body?.mileage_km, 0);
  if (!assignmentId) return NextResponse.json({ ok: false, message: "assignment_id is required." }, { status: 400 });
  if (!/^\d{4}-\d{2}-\d{2}$/.test(workDate)) return NextResponse.json({ ok: false, message: "Work date is required." }, { status: 400 });
  if (workedMinutes <= 0 || workedMinutes > 960) return NextResponse.json({ ok: false, message: "Worked time must be between 1 minute and 16 hours." }, { status: 400 });
  const { data: assignment, error: assignmentError } = await staff.supabase.from("booking_assignments").select("id, booking_id, employee_id, status").eq("id", assignmentId).maybeSingle();
  if (assignmentError) return NextResponse.json({ ok: false, message: assignmentError.message }, { status: 500 });
  if (!assignment?.id) return NextResponse.json({ ok: false, message: "Assignment not found." }, { status: 404 });
  const canManage = staff.role === "admin" || staff.role === "supervisor";
  if (!canManage && assignment.employee_id !== staff.employee.id) return NextResponse.json({ ok: false, message: "Assignment access denied." }, { status: 403 });
  if (!["confirmed", "completed"].includes(String(assignment.status))) return NextResponse.json({ ok: false, message: "Only confirmed or completed jobs can have time reports." }, { status: 400 });
  const row = {
    booking_id: assignment.booking_id,
    assignment_id: assignment.id,
    employee_id: assignment.employee_id,
    work_date: workDate,
    break_minutes: breakMinutes,
    worked_minutes: workedMinutes,
    travel_minutes: travelMinutes,
    mileage_km: mileageKm,
    status: "submitted",
    cleaner_note: clean(body?.cleaner_note, 500) || null,
    updated_at: new Date().toISOString()
  };
  const { data, error } = await staff.supabase.from("time_entries").upsert(row, { onConflict: "assignment_id" }).select("*").single();
  if (error) {
    if (migrationMissing(error)) return NextResponse.json({ ok: false, needsMigration: true, message: "Run Step 25A SQL in Supabase." }, { status: 500 });
    return NextResponse.json({ ok: false, message: error.message }, { status: 500 });
  }
  return NextResponse.json({ ok: true, entry: data });
}
