import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export const runtime = "nodejs";

const HEADER_NAME = ["Author", "ization"].join("");
const TOKEN_WORD = ["Bear", "er"].join("");

type BookingRow = {
  id: string;
  service: string;
  area: string;
  preferred_date: string | null;
  time_window: string | null;
};

type EmployeeRow = {
  id: string;
  email: string;
  name: string;
  phone: string | null;
  role: string;
  active: boolean;
  has_car: boolean;
  max_hours_per_day: number;
};

type AvailabilityRow = {
  id: string;
  employee_id: string;
  weekday: number;
  start_time: string;
  end_time: string;
  available: boolean;
};

type SkillRow = {
  employee_id: string;
  service: string;
};

type AreaRow = {
  employee_id: string;
  area: string;
};

const serviceAliases: Record<string, string[]> = {
  Hemstädning: ["Hemstädning", "Home cleaning"],
  "Home cleaning": ["Hemstädning", "Home cleaning"],
  Flyttstädning: ["Flyttstädning", "Move-out cleaning"],
  "Move-out cleaning": ["Flyttstädning", "Move-out cleaning"],
  Kontorsstädning: ["Kontorsstädning", "Office cleaning"],
  "Office cleaning": ["Kontorsstädning", "Office cleaning"],
  Fönsterputs: ["Fönsterputs", "Window cleaning"],
  "Window cleaning": ["Fönsterputs", "Window cleaning"]
};

function getAdminClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !serviceKey) return null;
  return createClient(url, serviceKey, { auth: { persistSession: false, autoRefreshToken: false } });
}

function getAdminEmails() {
  return (process.env.ADMIN_EMAILS || "ibbo.abdoli@gmail.com")
    .split(",")
    .map((email) => email.trim().toLowerCase())
    .filter(Boolean);
}

function getToken(request: Request) {
  const header = request.headers.get(HEADER_NAME.toLowerCase()) || "";
  return header.toLowerCase().startsWith(`${TOKEN_WORD.toLowerCase()} `)
    ? header.slice(TOKEN_WORD.length + 1).trim()
    : "";
}

function clean(value: unknown) {
  return String(value || "").trim();
}

function isoWeekday(dateValue: string) {
  const date = new Date(`${dateValue}T12:00:00`);
  if (Number.isNaN(date.getTime())) return null;
  const day = date.getDay();
  return day === 0 ? 7 : day;
}

function minutes(value: string) {
  const cleanValue = clean(value).slice(0, 5);
  const [h, m] = cleanValue.split(":").map(Number);
  if (!Number.isFinite(h) || !Number.isFinite(m)) return null;
  return h * 60 + m;
}

function requestedWindow(timeWindow: string | null) {
  const value = clean(timeWindow).toLowerCase();
  if (!value || value.includes("flex")) return null;
  if (value.includes("morgon") || value.includes("morning")) return { start: 8 * 60, end: 12 * 60 };
  if (value.includes("förmiddag") || value.includes("late morning")) return { start: 10 * 60, end: 13 * 60 };
  if (value.includes("eftermiddag") || value.includes("afternoon")) return { start: 13 * 60, end: 17 * 60 };
  if (value.includes("kväll") || value.includes("evening")) return { start: 17 * 60, end: 20 * 60 };
  return null;
}

function slotMatchesWindow(slot: AvailabilityRow, timeWindow: string | null) {
  const window = requestedWindow(timeWindow);
  if (!window) return true;
  const start = minutes(slot.start_time);
  const end = minutes(slot.end_time);
  if (start === null || end === null) return false;
  return start < window.end && end > window.start;
}

function serviceMatches(employeeSkills: SkillRow[], employeeId: string, bookingService: string) {
  const skills = employeeSkills.filter((skill) => skill.employee_id === employeeId);
  if (!skills.length) return true;
  const accepted = serviceAliases[bookingService] || [bookingService];
  return skills.some((skill) => accepted.includes(skill.service));
}

function areaMatches(employeeAreas: AreaRow[], employeeId: string, bookingArea: string) {
  const areas = employeeAreas.filter((area) => area.employee_id === employeeId);
  if (!areas.length) return true;
  const requested = bookingArea.toLowerCase().trim();
  return areas.some((area) => area.area.toLowerCase().trim() === requested);
}

async function verifyAdmin(request: Request) {
  const supabase = getAdminClient();
  if (!supabase) return { ok: false as const, status: 500, message: "Missing Supabase admin environment variables." };

  const token = getToken(request);
  if (!token) return { ok: false as const, status: 401, message: "Missing access token." };

  const { data, error } = await supabase.auth.getUser(token);
  const user = data.user;
  const email = user?.email?.toLowerCase() || "";
  if (error || !user || !email) return { ok: false as const, status: 401, message: "Invalid session." };

  const { data: roles, error: roleError } = await supabase
    .from("user_roles")
    .select("role, active")
    .eq("email", email)
    .limit(1);

  if (roleError) return { ok: false as const, status: 500, message: roleError.message };

  const isAdminByRole = Boolean((roles || []).find((row) => row.active && row.role === "admin"));
  const isAdminByEnv = getAdminEmails().includes(email);
  if (!isAdminByRole && !isAdminByEnv) return { ok: false as const, status: 403, message: "Admin access required." };

  return { ok: true as const, supabase };
}

export async function GET(request: Request, { params }: { params: { id: string } }) {
  const admin = await verifyAdmin(request);
  if (!admin.ok) return NextResponse.json({ ok: false, message: admin.message }, { status: admin.status });

  const { data: booking, error: bookingError } = await admin.supabase
    .from("bookings")
    .select("id, service, area, preferred_date, time_window")
    .eq("id", params.id)
    .single<BookingRow>();

  if (bookingError || !booking) return NextResponse.json({ ok: false, message: bookingError?.message || "Booking not found." }, { status: 404 });
  if (!booking.preferred_date) return NextResponse.json({ ok: true, booking, suggestions: [], message: "Booking has no preferred date." });

  const weekday = isoWeekday(booking.preferred_date);
  if (!weekday) return NextResponse.json({ ok: true, booking, suggestions: [], message: "Invalid booking date." });

  const { data: employees, error: employeeError } = await admin.supabase
    .from("employees")
    .select("id, email, name, phone, role, active, has_car, max_hours_per_day")
    .eq("active", true)
    .eq("role", "cleaner")
    .order("name", { ascending: true });

  if (employeeError) return NextResponse.json({ ok: false, message: employeeError.message }, { status: 500 });

  const employeeRows = (employees || []) as EmployeeRow[];
  const employeeIds = employeeRows.map((employee) => employee.id);
  if (!employeeIds.length) return NextResponse.json({ ok: true, booking, weekday, suggestions: [] });

  const { data: availability, error: availabilityError } = await admin.supabase
    .from("employee_availability")
    .select("id, employee_id, weekday, start_time, end_time, available")
    .in("employee_id", employeeIds)
    .eq("weekday", weekday)
    .eq("available", true)
    .order("start_time", { ascending: true });

  if (availabilityError) return NextResponse.json({ ok: false, message: availabilityError.message }, { status: 500 });

  const { data: skills, error: skillsError } = await admin.supabase
    .from("employee_skills")
    .select("employee_id, service")
    .in("employee_id", employeeIds);

  if (skillsError) return NextResponse.json({ ok: false, message: skillsError.message }, { status: 500 });

  const { data: areas, error: areasError } = await admin.supabase
    .from("employee_areas")
    .select("employee_id, area")
    .in("employee_id", employeeIds);

  if (areasError) return NextResponse.json({ ok: false, message: areasError.message }, { status: 500 });

  const availabilityRows = (availability || []) as AvailabilityRow[];
  const skillRows = (skills || []) as SkillRow[];
  const areaRows = (areas || []) as AreaRow[];

  const suggestions = employeeRows
    .map((employee) => {
      const slots = availabilityRows
        .filter((slot) => slot.employee_id === employee.id)
        .filter((slot) => slotMatchesWindow(slot, booking.time_window));

      const hasService = serviceMatches(skillRows, employee.id, booking.service);
      const hasArea = areaMatches(areaRows, employee.id, booking.area);

      return {
        employee,
        slots,
        matchesService: hasService,
        matchesArea: hasArea,
        score: slots.length + (hasService ? 1 : 0) + (hasArea ? 1 : 0)
      };
    })
    .filter((suggestion) => suggestion.slots.length > 0 && suggestion.matchesService && suggestion.matchesArea)
    .sort((a, b) => b.score - a.score || a.employee.name.localeCompare(b.employee.name, "sv"));

  return NextResponse.json({ ok: true, booking, weekday, suggestions });
}
