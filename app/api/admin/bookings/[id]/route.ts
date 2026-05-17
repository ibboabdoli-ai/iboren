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

function statusEmailContent(status: string, booking: BookingRow) {
  const service = sanitize(booking.service);
  const area = sanitize(booking.area);
  const address = sanitize(booking.address || "");
  const date = sanitize(booking.preferred_date || "");
  const timeWindow = sanitize(booking.time_window || "");
  const name = sanitize(booking.customer_name || "");

  if (status === "confirmed") {
    return {
      subject: `Din bokning är bekräftad – ${service}`,
      text: [
        `Hej ${name || ""},`,
        "",
        "Din bokning hos Iboren är bekräftad.",
        "",
        `Tjänst: ${service}`,
        `Område: ${area}`,
        `Adress: ${address || "Ej angiven"}`,
        `Datum: ${date || "Ej angivet"}`,
        `Tid: ${timeWindow || "Ej angivet"}`,
        "",
        "Tack för din bokning.",
        "Iboren"
      ].join("\n")
    };
  }

  if (status === "cancelled") {
    return {
      subject: `Din bokning är avbokad – ${service}`,
      text: [
        `Hej ${name || ""},`,
        "",
        "Din bokning hos Iboren är markerad som avbokad.",
        "",
        `Tjänst: ${service}`,
        `Område: ${area}`,
        `Adress: ${address || "Ej angiven"}`,
        `Datum: ${date || "Ej angivet"}`,
        `Tid: ${timeWindow || "Ej angivet"}`,
        "",
        "Kontakta Iboren om du har frågor.",
        "Iboren"
      ].join("\n")
    };
  }

  if (status === "completed") {
    return {
      subject: `Tack – din städning är markerad som klar`,
      text: [
        `Hej ${name || ""},`,
        "",
        "Tack! Din bokning hos Iboren är markerad som klar.",
        "",
        `Tjänst: ${service}`,
        `Område: ${area}`,
        `Adress: ${address || "Ej angiven"}`,
        `Datum: ${date || "Ej angivet"}`,
        "",
        "Tack för att du valde Iboren.",
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
      subject: content.subject,
      text: content.text
    })
  });

  if (!response.ok) {
    return { sent: false, skipped: false };
  }

  return { sent: true, skipped: false };
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

export async function PATCH(request: Request, { params }: { params: { id: string } }) {
  const admin = await verifyAdmin(request);
  if (!admin.ok) {
    return NextResponse.json({ ok: false, message: admin.message }, { status: admin.status });
  }

  const body = await request.json().catch(() => null) as { status?: string } | null;
  const status = body?.status;

  if (!status || !allowedStatuses.includes(status)) {
    return NextResponse.json({ ok: false, message: "Invalid status." }, { status: 400 });
  }

  const { data, error } = await admin.supabase
    .from("bookings")
    .update({ status })
    .eq("id", params.id)
    .select("id, service, area, address, size_sqm, frequency, preferred_date, time_window, customer_name, customer_email, customer_phone, notes, status, created_at")
    .single<BookingRow>();

  if (error) {
    return NextResponse.json({ ok: false, message: error.message }, { status: 500 });
  }

  const email = await sendStatusEmail(status, data);

  return NextResponse.json({ ok: true, booking: data, email });
}
