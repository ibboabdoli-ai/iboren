import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export const runtime = "nodejs";

type TimeEntry = { employee_id: string; worked_minutes: number; break_minutes: number; travel_minutes: number; mileage_km: number };
type Employee = { id: string; email: string; name: string; phone: string | null };
type Summary = { employee_id: string; employee_name: string; employee_email: string; approved_entries: number; worked_minutes: number; break_minutes: number; travel_minutes: number; mileage_km: number };

function getAdminEmails() { return (process.env.ADMIN_EMAILS || "ibbo.abdoli@gmail.com").split(",").map((email) => email.trim().toLowerCase()).filter(Boolean); }
function getAdminClient() { const url = process.env.NEXT_PUBLIC_SUPABASE_URL; const key = process.env.SUPABASE_SERVICE_ROLE_KEY; if (!url || !key) return null; return createClient(url, key, { auth: { persistSession: false, autoRefreshToken: false } }); }
function validDate(value: string) { return /^\d{4}-\d{2}-\d{2}$/.test(value) && !Number.isNaN(new Date(`${value}T12:00:00`).getTime()); }
function dateString(date: Date) { return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`; }
function monthStart() { const now = new Date(); return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-01`; }
function monthEnd(start: string) { const date = new Date(`${start}T12:00:00`); date.setMonth(date.getMonth() + 1); date.setDate(0); return dateString(date); }
function nextDay(value: string) { const date = new Date(`${value}T12:00:00`); date.setDate(date.getDate() + 1); return dateString(date); }
function migrationMissing(error: { code?: string; message?: string } | null) { const text = String(error?.message || "").toLowerCase(); return error?.code === "42P01" || text.includes("time_entries") || text.includes("does not exist"); }
function hours(minutes: number) { return Math.round((Number(minutes || 0) / 60) * 100) / 100; }
function csv(value: unknown) { return `"${String(value ?? "").replace(/"/g, '""')}"`; }
function toCsv(start: string, end: string, summaries: Summary[]) { const header = ["period_start", "period_end", "employee_name", "employee_email", "approved_entries", "worked_hours", "break_minutes", "travel_minutes", "mileage_km"]; const rows = summaries.map((item) => [start, end, item.employee_name, item.employee_email, item.approved_entries, hours(item.worked_minutes), item.break_minutes, item.travel_minutes, item.mileage_km]); return [header, ...rows].map((row) => row.map(csv).join(",")).join("\n"); }

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
  const exclusiveEnd = nextDay(end);
  const format = (url.searchParams.get("format") || "json").toLowerCase();
  if (!validDate(start) || !validDate(end)) return NextResponse.json({ ok: false, message: "Use start/end as YYYY-MM-DD." }, { status: 400 });

  const { data: entries, error } = await admin.supabase.from("time_entries").select("employee_id, worked_minutes, break_minutes, travel_minutes, mileage_km").eq("status", "approved").gte("work_date", start).lt("work_date", exclusiveEnd).returns<TimeEntry[]>();
  if (error) {
    if (migrationMissing(error)) return NextResponse.json({ ok: true, needsMigration: true, start, end, summaries: [], message: "Run Step 25A SQL in Supabase first." });
    return NextResponse.json({ ok: false, message: error.message }, { status: 500 });
  }

  const employeeIds = [...new Set((entries || []).map((entry) => entry.employee_id))];
  const { data: employees } = employeeIds.length ? await admin.supabase.from("employees").select("id, email, name, phone").in("id", employeeIds).returns<Employee[]>() : { data: [] as Employee[] };
  const employeeMap = new Map((employees || []).map((employee) => [employee.id, employee]));
  const grouped = new Map<string, Summary>();

  for (const entry of entries || []) {
    const employee = employeeMap.get(entry.employee_id);
    const current = grouped.get(entry.employee_id) || { employee_id: entry.employee_id, employee_name: employee?.name || "Cleaner", employee_email: employee?.email || "", approved_entries: 0, worked_minutes: 0, break_minutes: 0, travel_minutes: 0, mileage_km: 0 };
    current.approved_entries += 1;
    current.worked_minutes += Number(entry.worked_minutes || 0);
    current.break_minutes += Number(entry.break_minutes || 0);
    current.travel_minutes += Number(entry.travel_minutes || 0);
    current.mileage_km += Number(entry.mileage_km || 0);
    grouped.set(entry.employee_id, current);
  }

  const summaries = [...grouped.values()].sort((a, b) => a.employee_name.localeCompare(b.employee_name, "sv"));
  if (format === "csv") return new Response(toCsv(start, end, summaries), { headers: { "Content-Type": "text/csv; charset=utf-8", "Content-Disposition": `attachment; filename="iboren-payroll-basis-${start}-to-${end}.csv"` } });
  return NextResponse.json({ ok: true, needsMigration: false, start, end, summaries });
}
