import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export const runtime = "nodejs";

type Row = {
  id: string;
  employee_id: string;
  work_date: string;
  worked_minutes: number;
  break_minutes: number;
  travel_minutes: number;
  mileage_km: number;
  cleaner_note: string | null;
};
type Employee = { id: string; email: string; name: string };

function getAdminEmails() {
  return (process.env.ADMIN_EMAILS || "ibbo.abdoli@gmail.com").split(",").map((email) => email.trim().toLowerCase()).filter(Boolean);
}
function getAdminClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) return null;
  return createClient(url, key, { auth: { persistSession: false, autoRefreshToken: false } });
}
function validDate(value: string) {
  return /^\d{4}-\d{2}-\d{2}$/.test(value) && !Number.isNaN(new Date(`${value}T12:00:00`).getTime());
}
function dateString(date: Date) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
}
function nextDay(value: string) {
  const date = new Date(`${value}T12:00:00`);
  date.setDate(date.getDate() + 1);
  return dateString(date);
}
function monthStart() {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-01`;
}
function monthEnd(start: string) {
  const date = new Date(`${start}T12:00:00`);
  date.setMonth(date.getMonth() + 1);
  date.setDate(0);
  return dateString(date);
}
async function verifyAdmin(request: Request) {
  const supabase = getAdminClient();
  if (!supabase) return { ok: false as const, status: 500, message: "Missing Supabase admin variables." };
  const token = (request.headers.get("authorization") || "").replace(/^Bearer\s+/i, "").trim();
  if (!token) return { ok: false as const, status: 401, message: "Missing access token." };
  const { data, error } = await supabase.auth.getUser(token);
  const email = data.user?.email?.toLowerCase() || "";
  if (error || !email) return { ok: false as const, status: 401, message: "Invalid session." };
  if (!getAdminEmails().includes(email)) return { ok: false as const, status: 403, message: "Admin access required." };
  return { ok: true as const, supabase };
}

export async function GET(request: Request) {
  const admin = await verifyAdmin(request);
  if (!admin.ok) return NextResponse.json({ ok: false, message: admin.message }, { status: admin.status });

  const url = new URL(request.url);
  const start = url.searchParams.get("start") || monthStart();
  const end = url.searchParams.get("end") || monthEnd(start);
  if (!validDate(start) || !validDate(end)) return NextResponse.json({ ok: false, message: "Use start/end as YYYY-MM-DD." }, { status: 400 });

  const { data, error } = await admin.supabase
    .from("time_entries")
    .select("id, employee_id, work_date, worked_minutes, break_minutes, travel_minutes, mileage_km, cleaner_note")
    .eq("status", "paid")
    .gte("work_date", start)
    .lt("work_date", nextDay(end))
    .order("work_date", { ascending: true })
    .returns<Row[]>();

  if (error) return NextResponse.json({ ok: false, message: error.message }, { status: 500 });
  const employeeIds = [...new Set((data || []).map((row) => row.employee_id))];
  const { data: employees } = employeeIds.length ? await admin.supabase.from("employees").select("id, email, name").in("id", employeeIds).returns<Employee[]>() : { data: [] as Employee[] };
  const employeeMap = new Map((employees || []).map((employee) => [employee.id, employee]));
  const entries = (data || []).map((row) => {
    const employee = employeeMap.get(row.employee_id);
    return { ...row, employee_name: employee?.name || "Cleaner", employee_email: employee?.email || "" };
  });
  return NextResponse.json({ ok: true, start, end, entries });
}
