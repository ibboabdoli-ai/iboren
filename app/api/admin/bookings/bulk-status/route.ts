import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { getBookingStatusLocale } from "../[id]/statusLocale";
import { brandedTextEmail } from "../../../../lib/email/html";
import { createReviewInvitation, sendReviewInvitation } from "../../../../lib/reviews";

export const runtime = "nodejs";

const allowedStatuses = ["new", "confirmed", "completed", "cancelled"] as const;
type AllowedStatus = typeof allowedStatuses[number];
const EMAIL_ENDPOINT = ["https://api.re", "send.com/emails"].join("");
const EMAIL_WAIT_LIMIT_MS = 4500;

type BulkStatusPayload = { bookingIds?: unknown; status?: unknown };
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
type BulkEmailResult = { sent: boolean; skipped: boolean; reason: string | null };

const englishLabels: Record<string, string> = {
  Hemstädning: "Home cleaning",
  Flyttstädning: "Move-out cleaning",
  Kontorsstädning: "Office cleaning",
  Fönsterputs: "Window cleaning",
  Engång: "One-time",
  "Varje vecka": "Every week",
  "Varannan vecka": "Every other week",
  "Varje månad": "Every month",
  Flexibel: "Flexible"
};

function cleanText(value: unknown, max = 1200) {
  return String(value ?? "").replace(/[<>]/g, "").trim().slice(0, max);
}
function english(value: string | null) {
  const clean = cleanText(value || "");
  return englishLabels[clean] || clean;
}
function getAdminEmails() {
  return (process.env.ADMIN_EMAILS || "ibbo.abdoli@gmail.com").split(",").map((email) => email.trim().toLowerCase()).filter(Boolean);
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
function isValidEmail(email: string) {
  return /^\S+@\S+\.\S+$/.test(email);
}
function wait(ms: number) {
  return new Promise<"timeout">((resolve) => setTimeout(() => resolve("timeout"), ms));
}

async function verifyAdmin(request: Request) {
  const supabase = getAdminClient();
  if (!supabase) return { ok: false as const, status: 500, message: "Missing Supabase admin environment variables." };
  const token = (request.headers.get("authorization") || "").replace(/^Bearer\s+/i, "").trim();
  if (!token) return { ok: false as const, status: 401, message: "Missing access token." };
  const { data, error } = await supabase.auth.getUser(token);
  const email = data.user?.email?.toLowerCase();
  if (error || !email) return { ok: false as const, status: 401, message: "Invalid session." };
  if (!getAdminEmails().includes(email)) return { ok: false as const, status: 403, message: "Admin access required." };
  return { ok: true as const, supabase, user: data.user };
}

function sortByDate(bookings: BookingRow[]) {
  return [...bookings].sort((a, b) => String(a.preferred_date || "9999-12-31").localeCompare(String(b.preferred_date || "9999-12-31")));
}
function statusTextSv(status: AllowedStatus) {
  if (status === "confirmed") return "bekräftade";
  if (status === "completed") return "markerade som klara";
  if (status === "cancelled") return "avbokade";
  return "uppdaterade";
}
function statusTextEn(status: AllowedStatus) {
  if (status === "confirmed") return "confirmed";
  if (status === "completed") return "marked as completed";
  if (status === "cancelled") return "cancelled";
  return "updated";
}
function continuationTextSv(status: AllowedStatus) {
  if (status === "confirmed") return "Din återkommande städning är bekräftad och fortsätter enligt vald frekvens tills du ber oss stoppa eller ändra upplägget.";
  if (status === "cancelled") return "Din återkommande städning är avbokad för de planerade besöken nedan. Kontakta oss om du vill starta den igen.";
  return "Din återkommande städning har uppdaterats för de planerade besöken nedan.";
}
function continuationTextEn(status: AllowedStatus) {
  if (status === "confirmed") return "Your recurring cleaning service is confirmed and will continue according to the selected frequency until you ask us to stop it or change the setup.";
  if (status === "cancelled") return "Your recurring cleaning service has been cancelled for the planned visits below. Contact us if you would like to start it again.";
  return "Your recurring cleaning service has been updated for the planned visits below.";
}

function buildBulkSummaryEmail(status: AllowedStatus, bookings: BookingRow[]) {
  const sorted = sortByDate(bookings);
  const first = sorted[0];
  const locale = getBookingStatusLocale(first?.notes || null);
  const dates = sorted.map((booking) => `${booking.preferred_date || "-"} · ${locale === "en" ? english(booking.time_window || "") || "Flexible" : booking.time_window || "Flexibel"}`).join("\n");
  const count = sorted.length;

  if (locale === "en") {
    const action = statusTextEn(status);
    const subject = status === "confirmed" ? "Iboren: your recurring cleaning is confirmed" : `Iboren: planned visits ${action}`;
    return { subject, text: [
      `Hi ${cleanText(first.customer_name) || "there"},`,
      "",
      continuationTextEn(status),
      "",
      `Service: ${english(first.service)}`,
      `Area: ${first.area}`,
      `Address: ${first.address || "-"}`,
      `Frequency: ${english(first.frequency || "") || "-"}`,
      "",
      `First planned visits (${count}):`,
      dates,
      "",
      "If anything is incorrect, please reply to this email or contact us at hej@iboren.se.",
      "",
      "Best regards,",
      "Iboren"
    ].join("\n") };
  }

  const action = statusTextSv(status);
  const subject = status === "confirmed" ? "Iboren: din återkommande städning är bekräftad" : `Iboren: planerade besök ${action}`;
  return { subject, text: [
    `Hej ${cleanText(first.customer_name) || "kund"},`,
    "",
    continuationTextSv(status),
    "",
    `Tjänst: ${first.service}`,
    `Område: ${first.area}`,
    `Adress: ${first.address || "-"}`,
    `Frekvens: ${first.frequency || "-"}`,
    "",
    `Första planerade besök (${count}):`,
    dates,
    "",
    "Om något inte stämmer kan du svara på det här mejlet eller kontakta oss på hej@iboren.se.",
    "",
    "Vänliga hälsningar,",
    "Iboren"
  ].join("\n") };
}

async function sendBulkSummaryEmail(status: AllowedStatus, bookings: BookingRow[]): Promise<BulkEmailResult> {
  const sorted = sortByDate(bookings);
  const first = sorted[0];
  const resendApiKey = process.env.RESEND_API_KEY;
  const fromEmail = process.env.BOOKING_FROM_EMAIL || "Iboren <onboarding@resend.dev>";
  const replyTo = process.env.BOOKING_TO_EMAIL || "hej@iboren.se";
  const toEmail = cleanText(first?.customer_email || "").toLowerCase();
  if (!sorted.length) return { sent: false, skipped: true, reason: "no_updated_bookings" };
  if (!isValidEmail(toEmail)) return { sent: false, skipped: true, reason: "invalid_customer_email" };
  if (!resendApiKey) return { sent: false, skipped: true, reason: "missing_resend_api_key" };

  const content = buildBulkSummaryEmail(status, sorted);
  const language = getBookingStatusLocale(first?.notes || null) === "en" ? "en" : "sv";
  const html = brandedTextEmail({
    language,
    title: language === "en" ? "Your recurring cleaning has been updated" : "Din återkommande städning har uppdaterats",
    preheader: language === "en" ? "Iboren has updated your planned recurring cleaning visits." : "Iboren har uppdaterat dina planerade återkommande städningar.",
    intro: language === "en" ? "Iboren has updated your planned recurring cleaning visits." : "Iboren har uppdaterat dina planerade återkommande städningar.",
    nextStepTitle: language === "en" ? "Next step" : "Nästa steg",
    nextStepText: language === "en" ? "Review the planned visits below and contact Iboren if anything is incorrect." : "Kontrollera de planerade besöken nedan och kontakta Iboren om något inte stämmer.",
    text: content.text
  });
  const emailResult = await Promise.race([
    fetch(EMAIL_ENDPOINT, {
      method: "POST",
      headers: { Authorization: `Bearer ${resendApiKey}`, "Content-Type": "application/json" },
      body: JSON.stringify({ from: fromEmail, to: [toEmail], reply_to: replyTo, subject: content.subject, text: content.text, html })
    }),
    wait(EMAIL_WAIT_LIMIT_MS)
  ]);
  if (emailResult === "timeout") return { sent: false, skipped: false, reason: "timeout" };
  return { sent: emailResult.ok, skipped: false, reason: emailResult.ok ? null : "resend_error" };
}

async function sendBulkReviewInvitations(supabase: NonNullable<ReturnType<typeof getAdminClient>>, bookings: BookingRow[]) {
  const oneBookingPerCustomer = new Map<string, BookingRow>();
  for (const booking of sortByDate(bookings).reverse()) {
    const email = cleanText(booking.customer_email || "").toLowerCase();
    if (email && !oneBookingPerCustomer.has(email)) oneBookingPerCustomer.set(email, booking);
  }
  let sent = 0;
  for (const booking of oneBookingPerCustomer.values()) {
    const invitation = await createReviewInvitation(supabase, booking);
    if (invitation?.created) {
      const result = await sendReviewInvitation(booking, invitation.token);
      if (result.sent) sent += 1;
    }
  }
  return sent;
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
    .select("id, service, area, address, size_sqm, frequency, preferred_date, time_window, customer_name, customer_email, customer_phone, notes, status, created_at")
    .in("id", bookingIds)
    .returns<BookingRow[]>();
  if (beforeError) return NextResponse.json({ ok: false, message: beforeError.message }, { status: 500 });

  const editableIds = (beforeRows || []).filter((row) => (row.status || "new") !== status).map((row) => row.id);
  if (!editableIds.length) return NextResponse.json({ ok: true, status, updatedIds: [], count: 0, message: "No bookings needed update.", email: { sent: false, skipped: true, reason: "no_changes" } });

  const { data: updatedRows, error: updateError } = await admin.supabase
    .from("bookings")
    .update({ status })
    .in("id", editableIds)
    .select("id, service, area, address, size_sqm, frequency, preferred_date, time_window, customer_name, customer_email, customer_phone, notes, status, created_at")
    .returns<BookingRow[]>();
  if (updateError) return NextResponse.json({ ok: false, message: updateError.message }, { status: 500 });

  const updatedBookings = (updatedRows || []) as BookingRow[];
  const updatedIds = updatedBookings.map((row) => row.id);
  let email: BulkEmailResult = { sent: false, skipped: true, reason: "not_attempted" };
  try {
    email = await sendBulkSummaryEmail(status, updatedBookings);
  } catch (error) {
    console.warn("IBOREN_BULK_SUMMARY_EMAIL_FAILED", error);
    email = { sent: false, skipped: false, reason: "exception" };
  }
  let reviewInvitations = 0;
  if (status === "completed") {
    try { reviewInvitations = await sendBulkReviewInvitations(admin.supabase, updatedBookings); } catch (error) { console.warn("IBOREN_BULK_REVIEW_INVITATIONS_FAILED", error); }
  }
  return NextResponse.json({ ok: true, status, updatedIds, count: updatedIds.length, email, reviewInvitations });
}
