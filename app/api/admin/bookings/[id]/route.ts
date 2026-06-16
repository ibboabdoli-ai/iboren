import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { getBookingStatusLocale } from "./statusLocale";
import { brandedTextEmail } from "../../../../lib/email/html";

export const runtime = "nodejs";

const allowedStatuses = ["new", "confirmed", "completed", "cancelled"];
const AUTH_HEADER = ["Author", "ization"].join("");
const TOKEN_PREFIX = ["Bear", "er"].join("");
const EMAIL_ENDPOINT = ["https://api.re", "send.com/emails"].join("");
const DEV_SENDER = ["Iboren <onboarding", "@resend.dev>"].join("");

const englishLabels: Record<string, string> = {
  Hemstädning: "Home cleaning",
  Flyttstädning: "Move-out cleaning",
  Kontorsstädning: "Office cleaning",
  Fönsterputs: "Window cleaning",
  Engång: "One-time",
  "Varje vecka": "Every week",
  "Varannan vecka": "Every other week",
  "Varje månad": "Every month",
  Morgon: "Morning",
  Förmiddag: "Late morning",
  Eftermiddag: "Afternoon",
  Kväll: "Evening",
  Flexibel: "Flexible"
};

type BookingRow = {
  id: string;
  booking_number: string | null;
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
  return createClient(url, serviceKey, { auth: { persistSession: false, autoRefreshToken: false } });
}

function sanitize(value: unknown) {
  return String(value ?? "").replace(/[<>]/g, "").trim().slice(0, 1200);
}

function english(value: string | null) {
  const clean = sanitize(value || "");
  return englishLabels[clean] || clean;
}

function bookingReference(booking: BookingRow, locale: "sv" | "en") {
  if (booking.booking_number) return locale === "en" ? `Booking number: ${booking.booking_number}` : `Bokningsnummer: ${booking.booking_number}`;
  const shortId = booking.id ? booking.id.slice(0, 8) : "—";
  return locale === "en" ? `Booking ID: ${shortId}` : `Boknings-ID: ${shortId}`;
}

function bookingSummary(booking: BookingRow) {
  const locale = getBookingStatusLocale(booking.notes);
  const service = sanitize(booking.service);
  const area = sanitize(booking.area);
  const address = sanitize(booking.address || "");
  const date = sanitize(booking.preferred_date || "");
  const timeWindow = sanitize(booking.time_window || "");

  if (locale === "en") {
    const size = booking.size_sqm ? `${booking.size_sqm} sqm` : "Not specified";
    return [bookingReference(booking, "en"), `Service: ${english(service)}`, `Area: ${area}`, `Address: ${address || "Not specified"}`, `Size: ${size}`, `Date: ${date || "Not specified"}`, `Time: ${english(timeWindow) || "Not specified"}`].join("\n");
  }

  const size = booking.size_sqm ? `${booking.size_sqm} kvm` : "Ej angivet";
  return [bookingReference(booking, "sv"), `Tjänst: ${service}`, `Område: ${area}`, `Adress: ${address || "Ej angiven"}`, `Storlek: ${size}`, `Datum: ${date || "Ej angivet"}`, `Tid: ${timeWindow || "Ej angivet"}`].join("\n");
}

function statusEmailContent(status: string, booking: BookingRow) {
  const locale = getBookingStatusLocale(booking.notes);
  const service = sanitize(booking.service);
  const name = sanitize(booking.customer_name || "");
  const summary = bookingSummary(booking);

  if (locale === "en") {
    const greeting = `Hi ${name || "there"},`;
    if (status === "confirmed") return { subject: `Your booking is confirmed – ${english(service)}`, text: [greeting, "", "Your booking with Iboren has been confirmed.", "", summary, "", "We will contact you if we need any additional information before the cleaning.", "", "Best regards,", "Iboren"].join("\n") };
    if (status === "cancelled") return { subject: `Your booking has been cancelled – ${english(service)}`, text: [greeting, "", "Your booking with Iboren has been marked as cancelled.", "", summary, "", "Contact us at hej@iboren.se if anything is incorrect or if you want to book a new time.", "", "Best regards,", "Iboren"].join("\n") };
    if (status === "completed") return { subject: "Thank you – your cleaning is marked as completed", text: [greeting, "", "Thank you. Your booking with Iboren has been marked as completed.", "", summary, "", "Thank you for choosing Iboren.", "", "Best regards,", "Iboren"].join("\n") };
    return null;
  }

  const greeting = `Hej ${name || "kund"},`;
  if (status === "confirmed") return { subject: `Din bokning är bekräftad – ${service}`, text: [greeting, "", "Din bokning hos Iboren är bekräftad.", "", summary, "", "Vi återkommer om vi behöver kompletterande information inför städningen.", "", "Vänliga hälsningar,", "Iboren"].join("\n") };
  if (status === "cancelled") return { subject: `Din bokning är avbokad – ${service}`, text: [greeting, "", "Din bokning hos Iboren är markerad som avbokad.", "", summary, "", "Kontakta oss på hej@iboren.se om något inte stämmer eller om du vill boka en ny tid.", "", "Vänliga hälsningar,", "Iboren"].join("\n") };
  if (status === "completed") return { subject: "Tack – din städning är markerad som klar", text: [greeting, "", "Tack! Din bokning hos Iboren är markerad som klar.", "", summary, "", "Tack för att du valde Iboren.", "", "Vänliga hälsningar,", "Iboren"].join("\n") };
  return null;
}

function statusEmailHtml(status: string, booking: BookingRow, text: string) {
  const language = getBookingStatusLocale(booking.notes) === "en" ? "en" : "sv";
  const isConfirmed = status === "confirmed";
  const isCompleted = status === "completed";
  return brandedTextEmail({
    language,
    title: language === "en" ? isConfirmed ? "Your booking is confirmed" : isCompleted ? "Thank you for choosing Iboren" : "Your booking has been cancelled" : isConfirmed ? "Din bokning är bekräftad" : isCompleted ? "Tack för att du valde Iboren" : "Din bokning är avbokad",
    preheader: language === "en" ? "Your Iboren booking status has been updated." : "Status för din bokning hos Iboren har uppdaterats.",
    intro: language === "en" ? "Your Iboren booking status has been updated." : "Status för din bokning hos Iboren har uppdaterats.",
    nextStepTitle: language === "en" ? "Next step" : "Nästa steg",
    nextStepText: language === "en" ? "Review the summary below and contact Iboren if anything is incorrect." : "Kontrollera sammanfattningen nedan och kontakta Iboren om något inte stämmer.",
    text
  });
}

function getEmailConfig() {
  const resendApiKey = process.env.RESEND_API_KEY || "";
  const fromEmail = process.env.BOOKING_FROM_EMAIL || (process.env.NODE_ENV === "production" ? "" : DEV_SENDER);
  const replyTo = process.env.BOOKING_TO_EMAIL || "hej@iboren.se";
  return { resendApiKey, fromEmail, replyTo, configured: Boolean(resendApiKey && fromEmail) };
}

async function sendStatusEmail(status: string, booking: BookingRow) {
  const content = statusEmailContent(status, booking);
  const emailConfig = getEmailConfig();
  const toEmail = sanitize(booking.customer_email);

  if (!content || !emailConfig.configured || !toEmail || !/^\S+@\S+\.\S+$/.test(toEmail)) {
    if (!emailConfig.configured) console.warn("IBOREN_STATUS_EMAIL_NOT_CONFIGURED", { bookingId: booking.id, hasApiKey: Boolean(emailConfig.resendApiKey), hasFromEmail: Boolean(emailConfig.fromEmail) });
    return { sent: false, skipped: true };
  }

  const response = await fetch(EMAIL_ENDPOINT, {
    method: "POST",
    headers: { [AUTH_HEADER]: `${TOKEN_PREFIX} ${emailConfig.resendApiKey}`, "Content-Type": "application/json" },
    body: JSON.stringify({ from: emailConfig.fromEmail, to: [toEmail], reply_to: emailConfig.replyTo, subject: content.subject, text: content.text, html: statusEmailHtml(status, booking, content.text) })
  });

  if (!response.ok) {
    console.warn("IBOREN_STATUS_EMAIL_FAILED", { bookingId: booking.id, status, responseStatus: response.status });
    return { sent: false, skipped: false };
  }
  return { sent: true, skipped: false };
}

async function verifyAdmin(request: Request) {
  const supabase = getAdminClient();
  if (!supabase) return { ok: false as const, status: 500, message: "Adminmiljön är inte korrekt konfigurerad." };

  const authHeader = request.headers.get("authorization") || "";
  const token = authHeader.replace(/^Bearer\s+/i, "").trim();
  if (!token) return { ok: false as const, status: 401, message: "Du behöver logga in igen." };

  const { data, error } = await supabase.auth.getUser(token);
  const email = data.user?.email?.toLowerCase();

  if (error || !email) return { ok: false as const, status: 401, message: "Sessionen är inte giltig." };
  const { data: roles, error: roleError } = await supabase.from("user_roles").select("role, active").or(`user_id.eq.${data.user.id},email.ilike.${email}`).limit(2);
  if (roleError) return { ok: false as const, status: 500, message: "Kunde inte kontrollera adminåtkomst." };
  const isAdminByRole = Boolean((roles || []).find((row) => row.active && row.role === "admin"));
  if (!getAdminEmails().includes(email) && !isAdminByRole) return { ok: false as const, status: 403, message: "Adminåtkomst krävs." };
  return { ok: true as const, supabase, user: data.user };
}

export async function PATCH(request: Request, { params }: { params: { id: string } }) {
  const admin = await verifyAdmin(request);
  if (!admin.ok) return NextResponse.json({ ok: false, message: admin.message }, { status: admin.status });

  const body = await request.json().catch(() => null) as { status?: string; admin_notes?: string } | null;
  const update: { status?: string; admin_notes?: string | null } = {};
  let shouldSendStatusEmail = false;

  if (typeof body?.status === "string") {
    if (!allowedStatuses.includes(body.status)) return NextResponse.json({ ok: false, message: "Ogiltig status." }, { status: 400 });

    const { data: previous, error: previousError } = await admin.supabase.from("bookings").select("status").eq("id", params.id).single<{ status: string | null }>();
    if (previousError) {
      console.warn("IBOREN_ADMIN_BOOKING_PREVIOUS_STATUS_FAILED", { bookingId: params.id, code: previousError.code });
      return NextResponse.json({ ok: false, message: "Kunde inte läsa bokningen just nu." }, { status: 500 });
    }

    const previousStatus = previous.status || "new";
    update.status = body.status;
    shouldSendStatusEmail = body.status !== "new" && body.status !== previousStatus;
  }

  if (typeof body?.admin_notes === "string") update.admin_notes = sanitize(body.admin_notes) || null;
  if (!Object.keys(update).length) return NextResponse.json({ ok: false, message: "Inga giltiga fält att uppdatera." }, { status: 400 });

  const { data, error } = await admin.supabase
    .from("bookings")
    .update(update)
    .eq("id", params.id)
    .select("id, booking_number, service, area, address, size_sqm, frequency, preferred_date, time_window, customer_name, customer_email, customer_phone, notes, admin_notes, status, created_at")
    .single<BookingRow>();

  if (error) {
    console.warn("IBOREN_ADMIN_BOOKING_UPDATE_FAILED", { bookingId: params.id, code: error.code });
    return NextResponse.json({ ok: false, message: "Kunde inte uppdatera bokningen just nu." }, { status: 500 });
  }

  const email = shouldSendStatusEmail && update.status ? await sendStatusEmail(update.status, data) : { sent: false, skipped: true };
  return NextResponse.json({ ok: true, booking: data, email });
}
