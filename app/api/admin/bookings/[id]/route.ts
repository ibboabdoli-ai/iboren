import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export const runtime = "nodejs";

const allowedStatuses = ["new", "confirmed", "completed", "cancelled"];

type BookingRow = {
  id: string;
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

function sanitize(value: unknown) {
  return String(value ?? "").replace(/[<>]/g, "").trim().slice(0, 1200);
}

function bookingSummary(booking: BookingRow) {
  const service = sanitize(booking.service);
  const area = sanitize(booking.area);
  const address = sanitize(booking.address || "");
  const date = sanitize(booking.preferred_date || "");
  const timeWindow = sanitize(booking.time_window || "");
  const size = booking.size_sqm ? `${booking.size_sqm} kvm` : "Ej angivet";

  return [
    `Boknings-ID: ${booking.id}`,
    `Tjänst: ${service}`,
    `Område: ${area}`,
    `Adress: ${address || "Ej angiven"}`,
    `Storlek: ${size}`,
    `Datum: ${date || "Ej angivet"}`,
    `Tid: ${timeWindow || "Ej angivet"}`
  ].join("\n");
}

function statusEmailContent(status: string, booking: BookingRow) {
  const service = sanitize(booking.service);
  const name = sanitize(booking.customer_name || "");
  const greeting = `Hej ${name || "kund"},`;
  const summary = bookingSummary(booking);

  if (status === "confirmed") {
    return {
      subject: `Din bokning är bekräftad – ${service}`,
      text: [
        greeting,
        "",
        "Din bokning hos Iboren är bekräftad.",
        "",
        summary,
        "",
        "Vi återkommer om vi behöver kompletterande information inför städningen.",
        "",
        "Vänliga hälsningar,",
        "Iboren"
      ].join("\n")
    };
  }

  if (status === "cancelled") {
    return {
      subject: `Din bokning är avbokad – ${service}`,
      text: [
        greeting,
        "",
        "Din bokning hos Iboren är markerad som avbokad.",
        "",
        summary,
        "",
        "Kontakta oss på hej@iboren.se om något inte stämmer eller om du vill boka en ny tid.",
        "",
        "Vänliga hälsningar,",
        "Iboren"
      ].join("\n")
    };
  }

  if (status === "completed") {
    return {
      subject: `Tack – din städning är markerad som klar`,
      text: [
        greeting,
        "",
        "Tack! Din bokning hos Iboren är markerad som klar.",
        "",
        summary,
        "",
        "Tack för att du valde Iboren.",
        "",
        "Vänliga hälsningar,",
        "Iboren"
      ].join("\n")
    };
  }

  return null;
}

async function sendStatusEmail(status: string, booking: BookingRow) {
  const content = statusEmailContent(status, booking);
  const resendApiKey = process.env.RESEND_API_KEY;
  const fromEmail = process.env.BOOKING_FROM_EMAIL || "Iboren <onboarding@resend.dev>";
  const replyTo = process.env.BOOKING_TO_EMAIL || "hej@iboren.se";
  const toEmail = sanitize(booking.customer_email);

  if (!content || !resendApiKey || !toEmail || !/^\S+@\S+\.\S+$/.test(toEmail)) {
    return { sent: false, skipped: true };
  }

  const response = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: { Authorization: `Bearer ${resendApiKey}`, "Content-Type": "application/json" },
    body: JSON.stringify({
      from: fromEmail,
      to: [toEmail],
      reply_to: replyTo,
      subject: content.subject,
      text: content.text
    })
  });

  if (!response.ok) return { sent: false, skipped: false };
  return { sent: true, skipped: false };
}

async function verifyAdmin(request: Request) {
  const supabase = getAdminClient();
  if (!supabase) {
    return { ok: false as const, status: 500, message: "Missing Supabase admin environment variables." };
  }

  const authHeader = request.headers.get("authorization") || "";
  const token = authHeader.replace(/^Bearer\s+/i, "").trim();

  if (!token) return { ok: false as const, status: 401, message: "Missing access token." };

  const { data, error } = await supabase.auth.getUser(token);
  const email = data.user?.email?.toLowerCase();

  if (error || !email) return { ok: false as const, status: 401, message: "Invalid session." };
  if (!getAdminEmails().includes(email)) return { ok: false as const, status: 403, message: "Admin access required." };

  return { ok: true as const, supabase, user: data.user };
}

export async function PATCH(request: Request, { params }: { params: { id: string } }) {
  const admin = await verifyAdmin(request);
  if (!admin.ok) {
    return NextResponse.json({ ok: false, message: admin.message }, { status: admin.status });
  }

  const body = await request.json().catch(() => null) as { status?: string; admin_notes?: string } | null;
  const update: { status?: string; admin_notes?: string | null } = {};
  let shouldSendStatusEmail = false;

  if (typeof body?.status === "string") {
    if (!allowedStatuses.includes(body.status)) {
      return NextResponse.json({ ok: false, message: "Invalid status." }, { status: 400 });
    }

    const { data: previous, error: previousError } = await admin.supabase
      .from("bookings")
      .select("status")
      .eq("id", params.id)
      .single<{ status: string | null }>();

    if (previousError) {
      return NextResponse.json({ ok: false, message: previousError.message }, { status: 500 });
    }

    const previousStatus = previous.status || "new";
    update.status = body.status;
    shouldSendStatusEmail = body.status !== "new" && body.status !== previousStatus;
  }

  if (typeof body?.admin_notes === "string") {
    update.admin_notes = sanitize(body.admin_notes) || null;
  }

  if (!Object.keys(update).length) {
    return NextResponse.json({ ok: false, message: "No valid update fields." }, { status: 400 });
  }

  const { data, error } = await admin.supabase
    .from("bookings")
    .update(update)
    .eq("id", params.id)
    .select("id, service, area, address, size_sqm, frequency, preferred_date, time_window, customer_name, customer_email, customer_phone, notes, admin_notes, status, created_at")
    .single<BookingRow>();

  if (error) {
    return NextResponse.json({ ok: false, message: error.message }, { status: 500 });
  }

  const email = shouldSendStatusEmail && update.status ? await sendStatusEmail(update.status, data) : { sent: false, skipped: true };

  return NextResponse.json({ ok: true, booking: data, email });
}
