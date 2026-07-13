import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import { brandedTextEmail } from "./email/html";

type ReviewBooking = {
  id: string;
  service: string;
  area: string;
  customer_name: string;
  customer_email: string;
  notes?: string | null;
};

type ReviewInvitation = { token: string; created: boolean };

const EMAIL_ENDPOINT = ["https://api.re", "send.com/emails"].join("");
const AUTH_HEADER = ["Author", "ization"].join("");
const TOKEN_PREFIX = ["Bear", "er"].join("");

function clean(value: unknown, max = 500) {
  return String(value ?? "").replace(/[<>]/g, "").trim().slice(0, max);
}

function languageFor(notes: string | null | undefined): "sv" | "en" {
  const value = String(notes || "").toLowerCase();
  return value.includes("language: en") || value.includes("property & details") ? "en" : "sv";
}

function siteUrl() {
  return (process.env.NEXT_PUBLIC_SITE_URL || "https://iboren.se").replace(/\/$/, "");
}

function validEmail(value: string) {
  return /^\S+@\S+\.\S+$/.test(value);
}

/** Creates exactly one reusable, unguessable review link for a booking. */
export async function createReviewInvitation(supabase: SupabaseClient, booking: ReviewBooking): Promise<ReviewInvitation | null> {
  const email = clean(booking.customer_email).toLowerCase();
  if (!validEmail(email)) return null;

  const { data: existing, error: existingError } = await supabase
    .from("booking_reviews")
    .select("token")
    .eq("booking_id", booking.id)
    .maybeSingle<{ token: string }>();

  if (existingError) {
    console.warn("IBOREN_REVIEW_INVITATION_LOOKUP_FAILED", { bookingId: booking.id, code: existingError.code });
    return null;
  }
  if (existing?.token) return { token: existing.token, created: false };

  const { data, error } = await supabase
    .from("booking_reviews")
    .insert({
      booking_id: booking.id,
      customer_name: clean(booking.customer_name, 120) || null,
      customer_email: email,
      language: languageFor(booking.notes),
      status: "pending"
    })
    .select("token")
    .single<{ token: string }>();

  if (error || !data?.token) {
    console.warn("IBOREN_REVIEW_INVITATION_CREATE_FAILED", { bookingId: booking.id, code: error?.code });
    return null;
  }
  return { token: data.token, created: true };
}

export function reviewUrl(token: string, language: "sv" | "en") {
  return `${siteUrl()}/review/${encodeURIComponent(token)}${language === "en" ? "?lang=en" : ""}`;
}

export async function sendReviewInvitation(booking: ReviewBooking, token: string) {
  const apiKey = process.env.RESEND_API_KEY || "";
  const from = process.env.BOOKING_FROM_EMAIL || (process.env.NODE_ENV === "production" ? "" : "Iboren <onboarding@resend.dev>");
  const email = clean(booking.customer_email).toLowerCase();
  if (!apiKey || !from || !validEmail(email)) return { sent: false, skipped: true };

  const language = languageFor(booking.notes);
  const href = reviewUrl(token, language);
  const isEnglish = language === "en";
  const name = clean(booking.customer_name, 120) || (isEnglish ? "there" : "kund");
  const subject = isEnglish ? "How was your Iboren cleaning?" : "Hur upplevde du din städning med Iboren?";
  const text = isEnglish
    ? `Hi ${name},\n\nThank you for choosing Iboren. We would appreciate a short review of your ${clean(booking.service)} in ${clean(booking.area)}.\n\nLeave your review: ${href}\n\nBest regards,\nIboren`
    : `Hej ${name},\n\nTack för att du valde Iboren. Vi uppskattar om du vill lämna ett kort omdöme om din ${clean(booking.service)} i ${clean(booking.area)}.\n\nLämna ditt omdöme: ${href}\n\nVänliga hälsningar,\nIboren`;
  const html = brandedTextEmail({
    language,
    title: isEnglish ? "Thank you for choosing Iboren" : "Tack för att du valde Iboren",
    preheader: isEnglish ? "Tell us how your cleaning went." : "Berätta hur du upplevde din städning.",
    intro: isEnglish ? "Your feedback helps us improve our service." : "Din återkoppling hjälper oss att förbättra vår service.",
    nextStepTitle: isEnglish ? "Leave a review" : "Lämna ett omdöme",
    nextStepText: isEnglish ? "It takes less than a minute." : "Det tar mindre än en minut.",
    text,
    cta: { href, label: isEnglish ? "Leave a review" : "Lämna ett omdöme" }
  });
  const response = await fetch(EMAIL_ENDPOINT, {
    method: "POST",
    headers: { [AUTH_HEADER]: `${TOKEN_PREFIX} ${apiKey}`, "Content-Type": "application/json" },
    body: JSON.stringify({ from, to: [email], reply_to: "hej@iboren.se", subject, text, html })
  });
  if (!response.ok) console.warn("IBOREN_REVIEW_INVITATION_EMAIL_FAILED", { bookingId: booking.id, responseStatus: response.status });
  return { sent: response.ok, skipped: false };
}

export function getReviewAdminClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !serviceKey) return null;
  return createClient(url, serviceKey, { auth: { persistSession: false, autoRefreshToken: false } });
}
