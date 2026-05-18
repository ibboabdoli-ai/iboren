import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export const runtime = "nodejs";

const allowedStatuses = ["new", "confirmed", "completed", "cancelled"];

type AdminBooking = {
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
  admin_notes: string | null;
  status: string | null;
  created_at: string;
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

function duplicateKey(booking: AdminBooking) {
  return [
    booking.user_id || "no-user",
    booking.service || "",
    booking.address || "",
    booking.size_sqm ?? "",
    booking.frequency || "",
    booking.preferred_date || "",
    booking.time_window || "",
    booking.customer_email || ""
  ].map((value) => String(value).trim().toLowerCase()).join("|");
}

function collapseDuplicateBookings(bookings: AdminBooking[]) {
  const kept = new Map<string, AdminBooking>();
  let duplicateCount = 0;

  for (const booking of bookings) {
    if ((booking.status || "new") === "cancelled") {
      kept.set(`cancelled:${booking.id}`, booking);
      continue;
    }

    const key = duplicateKey(booking);
    const existing = kept.get(key);

    if (!existing) {
      kept.set(key, booking);
      continue;
    }

    duplicateCount += 1;

    const existingTime = new Date(existing.created_at).getTime();
    const bookingTime = new Date(booking.created_at).getTime();
    if (bookingTime > existingTime) {
      kept.set(key, booking);
    }
  }

  return { bookings: Array.from(kept.values()), duplicateCount };
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

  const rawBookings = (data ?? []) as AdminBooking[];
  const collapsed = collapseDuplicateBookings(rawBookings);

  return NextResponse.json({
    ok: true,
    bookings: collapsed.bookings,
    rawCount: rawBookings.length,
    duplicateCount: collapsed.duplicateCount,
    statuses: allowedStatuses
  });
}
