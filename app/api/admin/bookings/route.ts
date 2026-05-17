import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export const runtime = "nodejs";

const allowedStatuses = ["new", "confirmed", "completed", "cancelled"];

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

  return createClient(url, serviceKey, {
    auth: { persistSession: false, autoRefreshToken: false }
  });
}

async function verifyAdmin(request: Request) {
  const supabase = getAdminClient();
  if (!supabase) {
    return { ok: false as const, status: 500, message: "Missing Supabase admin environment variables." };
  }

  const authHeader = request.headers.get("authorization") || "";
  const token = authHeader.replace(/^Bearer\s+/i, "").trim();

  if (!token) {
    return { ok: false as const, status: 401, message: "Missing access token." };
  }

  const { data, error } = await supabase.auth.getUser(token);
  const email = data.user?.email?.toLowerCase();

  if (error || !email) {
    return { ok: false as const, status: 401, message: "Invalid session." };
  }

  if (!getAdminEmails().includes(email)) {
    return { ok: false as const, status: 403, message: "Admin access required." };
  }

  return { ok: true as const, supabase, user: data.user };
}

export async function GET(request: Request) {
  const admin = await verifyAdmin(request);
  if (!admin.ok) {
    return NextResponse.json({ ok: false, message: admin.message }, { status: admin.status });
  }

  const { data, error } = await admin.supabase
    .from("bookings")
    .select("id, user_id, service, area, address, size_sqm, frequency, preferred_date, time_window, customer_name, customer_email, customer_phone, notes, admin_notes, status, created_at")
    .order("created_at", { ascending: false });

  if (error) {
    return NextResponse.json({ ok: false, message: error.message }, { status: 500 });
  }

  return NextResponse.json({ ok: true, bookings: data ?? [], statuses: allowedStatuses });
}
