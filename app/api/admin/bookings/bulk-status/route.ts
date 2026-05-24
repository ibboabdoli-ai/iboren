import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export const runtime = "nodejs";

const allowedStatuses = ["new", "confirmed", "completed", "cancelled"] as const;
type AllowedStatus = typeof allowedStatuses[number];

type BulkStatusPayload = {
  bookingIds?: unknown;
  status?: unknown;
};

type BookingRow = {
  id: string;
  status: string | null;
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

function normalizeBookingIds(value: unknown) {
  if (!Array.isArray(value)) return [];
  return [...new Set(value.map((item) => String(item || "").trim()).filter(Boolean))].slice(0, 100);
}

function normalizeStatus(value: unknown): AllowedStatus | null {
  const status = String(value || "").trim().toLowerCase();
  return allowedStatuses.includes(status as AllowedStatus) ? status as AllowedStatus : null;
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

export async function PATCH(request: Request) {
  const admin = await verifyAdmin(request);
  if (!admin.ok) return NextResponse.json({ ok: false, message: admin.message }, { status: admin.status });

  const body = await request.json().catch(() => null) as BulkStatusPayload | null;
  const bookingIds = normalizeBookingIds(body?.bookingIds);
  const status = normalizeStatus(body?.status);

  if (!bookingIds.length) return NextResponse.json({ ok: false, message: "bookingIds is required." }, { status: 400 });
  if (!status) return NextResponse.json({ ok: false, message: "Invalid status." }, { status: 400 });

  const { data: beforeRows, error: beforeError } = await admin.supabase
    .from("bookings")
    .select("id, status")
    .in("id", bookingIds)
    .returns<BookingRow[]>();

  if (beforeError) return NextResponse.json({ ok: false, message: beforeError.message }, { status: 500 });

  const editableIds = (beforeRows || [])
    .filter((row) => (row.status || "new") !== status)
    .map((row) => row.id);

  if (!editableIds.length) {
    return NextResponse.json({ ok: true, status, updatedIds: [], count: 0, message: "No bookings needed update." });
  }

  const { data: updatedRows, error: updateError } = await admin.supabase
    .from("bookings")
    .update({ status })
    .in("id", editableIds)
    .select("id, status")
    .returns<BookingRow[]>();

  if (updateError) return NextResponse.json({ ok: false, message: updateError.message }, { status: 500 });

  const updatedIds = (updatedRows || []).map((row) => row.id);
  return NextResponse.json({ ok: true, status, updatedIds, count: updatedIds.length, email: { skipped: true, reason: "bulk_no_customer_email" } });
}
