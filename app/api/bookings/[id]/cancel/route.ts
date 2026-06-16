import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { brandedTextEmail } from "../../../../lib/email/html";

export const runtime = "nodejs";

const EMAIL_WAIT_LIMIT_MS = 4500;
const CANCELLATION_CUTOFF_HOURS = 48;

type CancelledBooking = {
  id: string;
  service: string | null;
  area: string | null;
  address: string | null;
  size_sqm: number | null;
  frequency: string | null;
  preferred_date: string | null;
  time_window: string | null;
  customer_name: string | null;
  customer_email: string | null;
  customer_phone: string | null;
  notes: string | null;
  status: string | null;
  created_at: string | null;
};

function getAdminClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !serviceKey) return null;

  return createClient(url, serviceKey, {
    auth: { persistSession: false, autoRefreshToken: false }
  });
}

async function getUserFromRequest(request: Request) {
  const supabase = getAdminClient();
  if (!supabase) {
    return { ok: false as const, status: 500, message: "Missing Supabase service role key." };
  }

  const authHeader = request.headers.get("authorization") || "";
  const token = authHeader.replace(/^Bearer\s+/i, "").trim();

  if (!token) {
    return { ok: false as const, status: 401, message: "Missing access token." };
  }

  const { data, error } = await supabase.auth.getUser(token);

  if (error || !data.user) {
    return { ok: false as const, status: 401, message: "Invalid session." };
  }

  return { ok: true as const, supabase, user: data.user };
}

function valueOrDash(value: string | number | null | undefined) {
  return value === null || value === undefined || value === "" ? "-" : String(value);
}

function scheduledStart(value: string | null) {
  if (!value) return null;
  const date = new Date(`${value}T08:00:00`);
  return Number.isNaN(date.getTime()) ? null : date;
}

function cancellationBlocked(booking: CancelledBooking) {
  if (booking.status === "completed") return "Completed bookings cannot be cancelled.";
  if (booking.status === "cancelled") return "Booking is already cancelled.";
  const scheduled = scheduledStart(booking.preferred_date);
  if (!scheduled) return null;
  const hoursLeft = (scheduled.getTime() - Date.now()) / (60 * 60 * 1000);
  if (hoursLeft <= CANCELLATION_CUTOFF_HOURS) {
    return "Avbokning online är stängd mindre än 48 timmar före bokat datum. Kontakta Iboren på hej@iboren.se.";
  }
  return null;
}

function buildAdminCancelText(booking: CancelledBooking, userEmail: string | undefined) {
  return [
    "Iboren booking cancelled",
    "",
    `Booking ID: ${booking.id}`,
    `Authenticated user: ${userEmail || "-"}`,
    "",
    `Service: ${valueOrDash(booking.service)}`,
    `Area: ${valueOrDash(booking.area)}`,
    `Address: ${valueOrDash(booking.address)}`,
    `Size: ${valueOrDash(booking.size_sqm)} kvm`,
    `Frequency: ${valueOrDash(booking.frequency)}`,
    `Date: ${valueOrDash(booking.preferred_date)}`,
    `Time window: ${valueOrDash(booking.time_window)}`,
    "",
    `Name: ${valueOrDash(booking.customer_name)}`,
    `Email: ${valueOrDash(booking.customer_email)}`,
    `Phone: ${valueOrDash(booking.customer_phone)}`,
    "",
    `Notes: ${valueOrDash(booking.notes)}`,
    "",
    `New status: ${valueOrDash(booking.status)}`
  ].join("\n");
}

function buildCustomerCancelText(booking: CancelledBooking) {
  return [
    `Hej ${booking.customer_name || ""},`.trim(),
    "",
    "Din bokningsförfrågan hos Iboren är nu avbokad.",
    "",
    "Sammanfattning:",
    `Boknings-ID: ${booking.id}`,
    `Tjänst: ${valueOrDash(booking.service)}`,
    `Område: ${valueOrDash(booking.area)}`,
    `Adress: ${valueOrDash(booking.address)}`,
    `Datum: ${valueOrDash(booking.preferred_date)}`,
    `Tid: ${valueOrDash(booking.time_window)}`,
    "",
    "Om detta inte stämmer kan du svara på det här mejlet eller kontakta oss på hej@iboren.se.",
    "",
    "Vänliga hälsningar,",
    "Iboren"
  ].join("\n");
}

async function sendEmail(params: { apiKey: string; from: string; to: string; replyTo?: string; subject: string; text: string; html?: string }) {
  return fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: { Authorization: `Bearer ${params.apiKey}`, "Content-Type": "application/json" },
    body: JSON.stringify({
      from: params.from,
      to: [params.to],
      reply_to: params.replyTo,
      subject: params.subject,
      text: params.text,
      ...(params.html ? { html: params.html } : {})
    })
  });
}

function wait(ms: number) {
  return new Promise<"timeout">((resolve) => setTimeout(() => resolve("timeout"), ms));
}

export async function PATCH(request: Request, { params }: { params: { id: string } }) {
  const auth = await getUserFromRequest(request);
  if (!auth.ok) {
    return NextResponse.json({ ok: false, message: auth.message }, { status: auth.status });
  }

  const { data: existing, error: readError } = await auth.supabase
    .from("bookings")
    .select("id, service, area, address, size_sqm, frequency, preferred_date, time_window, customer_name, customer_email, customer_phone, notes, status, created_at")
    .eq("id", params.id)
    .eq("user_id", auth.user.id)
    .single();

  if (readError) {
    return NextResponse.json({ ok: false, message: readError.message }, { status: 500 });
  }

  const blockedReason = cancellationBlocked(existing as CancelledBooking);
  if (blockedReason) {
    return NextResponse.json({ ok: false, message: blockedReason }, { status: 409 });
  }

  const { data, error } = await auth.supabase
    .from("bookings")
    .update({ status: "cancelled" })
    .eq("id", params.id)
    .eq("user_id", auth.user.id)
    .select("id, service, area, address, size_sqm, frequency, preferred_date, time_window, customer_name, customer_email, customer_phone, notes, status, created_at")
    .single();

  if (error) {
    return NextResponse.json({ ok: false, message: error.message }, { status: 500 });
  }

  const booking = data as CancelledBooking;
  const resendApiKey = process.env.RESEND_API_KEY;
  const toEmail = process.env.BOOKING_TO_EMAIL || "hej@iboren.se";
  const fromEmail = process.env.BOOKING_FROM_EMAIL || "Iboren <onboarding@resend.dev>";

  if (resendApiKey) {
    const adminEmail = sendEmail({
      apiKey: resendApiKey,
      from: fromEmail,
      to: toEmail,
      replyTo: booking.customer_email || undefined,
      subject: `Iboren booking cancelled: ${booking.service || "Bokning"} · ${booking.area || ""}`,
      text: buildAdminCancelText(booking, auth.user.email)
    });

    const customerText = buildCustomerCancelText(booking);
    const customerEmail = booking.customer_email ? sendEmail({
      apiKey: resendApiKey,
      from: fromEmail,
      to: booking.customer_email,
      replyTo: toEmail,
      subject: `Din bokning hos Iboren är avbokad · ${booking.service || "Bokning"}`,
      text: customerText,
      html: brandedTextEmail({
        language: "sv",
        title: "Din bokning är avbokad",
        preheader: "Din bokningsförfrågan hos Iboren är avbokad.",
        intro: "Din bokningsförfrågan hos Iboren är nu avbokad.",
        nextStepTitle: "Nästa steg",
        nextStepText: "Om detta inte stämmer kan du svara på mejlet eller kontakta Iboren.",
        text: customerText
      })
    }) : Promise.resolve(null);

    const emailResult = await Promise.race([
      Promise.allSettled([adminEmail, customerEmail]),
      wait(EMAIL_WAIT_LIMIT_MS)
    ]);

    if (emailResult === "timeout") {
      console.warn("IBOREN_CANCEL_EMAIL_WAIT_TIMEOUT", { bookingId: booking.id });
    }
  } else {
    console.info("IBOREN_BOOKING_CANCELLED", buildAdminCancelText(booking, auth.user.email));
  }

  return NextResponse.json({ ok: true, booking });
}
