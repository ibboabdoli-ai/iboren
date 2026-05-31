import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export const runtime = "nodejs";

const allowedStatuses = ["new", "reviewed", "rejected", "converted"];

type AdminPublicRequest = {
  id: string;
  external_id: string;
  status: string | null;
  language: string | null;
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
  customer_type: string | null;
  rut_requested: boolean | null;
  notes: string | null;
  admin_notes: string | null;
  converted_booking_id: string | null;
  source: string | null;
  created_at: string;
  updated_at: string | null;
};

function getAdminEmails() {
  return (process.env.ADMIN_EMAILS || "ibbo.abdoli@gmail.com")
    .split(",")
    .map((email) => email.trim().toLowerCase())
    .filter(Boolean);
}

function getAdminClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !serviceKey) return null;
  return createClient(url, serviceKey, { auth: { persistSession: false, autoRefreshToken: false } });
}

async function verifyAdmin(request: Request) {
  const supabase = getAdminClient();
  if (!supabase) return { ok: false as const, status: 500, message: "Missing Supabase admin environment variables." };

  const authHeader = request.headers.get("authorization") || "";
  const token = authHeader.replace(/^Bearer\s+/i, "").trim();
  if (!token) return { ok: false as const, status: 401, message: "Missing access token." };

  const { data, error } = await supabase.auth.getUser(token);
  const email = data.user?.email?.toLowerCase();
  if (error || !email) return { ok: false as const, status: 401, message: "Invalid session." };
  if (!getAdminEmails().includes(email)) return { ok: false as const, status: 403, message: "Admin access required." };

  return { ok: true as const, supabase, user: data.user };
}

function statusCount(requests: AdminPublicRequest[], status: string) {
  return requests.filter((request) => (request.status || "new") === status).length;
}

export async function GET(request: Request) {
  const admin = await verifyAdmin(request);
  if (!admin.ok) return NextResponse.json({ ok: false, message: admin.message }, { status: admin.status });

  const { data, error } = await admin.supabase
    .from("public_booking_requests")
    .select("id, external_id, status, language, service, area, address, size_sqm, frequency, preferred_date, time_window, customer_name, customer_email, customer_phone, customer_type, rut_requested, notes, admin_notes, converted_booking_id, source, created_at, updated_at")
    .order("created_at", { ascending: false })
    .limit(200);

  if (error) return NextResponse.json({ ok: false, message: error.message }, { status: 500 });

  const requests = (data ?? []) as AdminPublicRequest[];
  return NextResponse.json({
    ok: true,
    requests,
    rawCount: requests.length,
    statuses: allowedStatuses,
    counts: {
      new: statusCount(requests, "new"),
      reviewed: statusCount(requests, "reviewed"),
      rejected: statusCount(requests, "rejected"),
      converted: statusCount(requests, "converted")
    }
  });
}
