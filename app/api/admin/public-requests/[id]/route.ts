import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export const runtime = "nodejs";

const allowedStatuses = ["new", "reviewed", "rejected"];

type RouteContext = {
  params: {
    id: string;
  };
};

type PublicRequestRow = {
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

function sanitize(value: unknown) {
  return String(value ?? "").replace(/[<>]/g, "").trim().slice(0, 3000);
}

function bookingNotes(row: PublicRequestRow, adminEmail: string) {
  return [
    row.notes || "",
    "",
    "--- Public request conversion ---",
    `Public request ID: ${row.external_id}`,
    `Converted by: ${adminEmail}`,
    `Customer type: ${row.customer_type || "-"}`,
    `RUT requested: ${row.rut_requested ? "Ja" : "Nej"}`,
    `Language: ${row.language || "sv"}`,
    row.admin_notes ? `Admin notes: ${row.admin_notes}` : ""
  ].filter(Boolean).join("\n").trim();
}

export async function PATCH(request: Request, context: RouteContext) {
  const admin = await verifyAdmin(request);
  if (!admin.ok) return NextResponse.json({ ok: false, message: admin.message }, { status: admin.status });

  const id = sanitize(context.params.id);
  if (!id) return NextResponse.json({ ok: false, message: "Missing request id." }, { status: 400 });

  const json = await request.json().catch(() => ({})) as { status?: string; admin_notes?: string; adminNotes?: string };
  const status = sanitize(json.status || "");
  const adminNotes = sanitize(json.admin_notes ?? json.adminNotes ?? "");

  const update: Record<string, string | null> = {};
  if (status) {
    if (!allowedStatuses.includes(status)) return NextResponse.json({ ok: false, message: "Invalid status." }, { status: 400 });
    update.status = status;
  }
  if ("admin_notes" in json || "adminNotes" in json) update.admin_notes = adminNotes || null;

  if (!Object.keys(update).length) return NextResponse.json({ ok: false, message: "Nothing to update." }, { status: 400 });

  const { data, error } = await admin.supabase
    .from("public_booking_requests")
    .update(update)
    .eq("id", id)
    .select("id, status, admin_notes, updated_at")
    .single();

  if (error) return NextResponse.json({ ok: false, message: error.message }, { status: 500 });
  return NextResponse.json({ ok: true, request: data });
}

export async function POST(request: Request, context: RouteContext) {
  const admin = await verifyAdmin(request);
  if (!admin.ok) return NextResponse.json({ ok: false, message: admin.message }, { status: admin.status });

  const id = sanitize(context.params.id);
  if (!id) return NextResponse.json({ ok: false, message: "Missing request id." }, { status: 400 });

  const { data: row, error: readError } = await admin.supabase
    .from("public_booking_requests")
    .select("id, external_id, status, language, service, area, address, size_sqm, frequency, preferred_date, time_window, customer_name, customer_email, customer_phone, customer_type, rut_requested, notes, admin_notes, converted_booking_id, source, created_at")
    .eq("id", id)
    .single();

  if (readError || !row) return NextResponse.json({ ok: false, message: readError?.message || "Public request not found." }, { status: 404 });

  const publicRequest = row as PublicRequestRow;
  if (publicRequest.converted_booking_id) {
    return NextResponse.json({ ok: true, alreadyConverted: true, bookingId: publicRequest.converted_booking_id, request: publicRequest });
  }
  if ((publicRequest.status || "new") === "rejected") {
    return NextResponse.json({ ok: false, message: "Rejected requests cannot be converted. Mark it as reviewed/new first." }, { status: 400 });
  }

  const { data: booking, error: insertError } = await admin.supabase
    .from("bookings")
    .insert({
      user_id: null,
      service: publicRequest.service,
      area: publicRequest.area,
      address: publicRequest.address || null,
      size_sqm: publicRequest.size_sqm,
      frequency: publicRequest.frequency || "Engång",
      preferred_date: publicRequest.preferred_date,
      time_window: publicRequest.time_window || "Flexibel",
      customer_name: publicRequest.customer_name,
      customer_email: publicRequest.customer_email,
      customer_phone: publicRequest.customer_phone || null,
      notes: bookingNotes(publicRequest, admin.user.email || admin.user.id),
      status: "new"
    })
    .select("id")
    .single();

  if (insertError || !booking?.id) return NextResponse.json({ ok: false, message: insertError?.message || "Could not create booking." }, { status: 500 });

  const bookingId = booking.id as string;
  const { data: updatedRequest, error: updateError } = await admin.supabase
    .from("public_booking_requests")
    .update({ status: "converted", converted_booking_id: bookingId })
    .eq("id", id)
    .select("id, status, converted_booking_id, updated_at")
    .single();

  if (updateError) return NextResponse.json({ ok: false, bookingId, message: `Booking created, but public request was not marked converted: ${updateError.message}` }, { status: 500 });

  return NextResponse.json({ ok: true, bookingId, request: updatedRequest });
}
