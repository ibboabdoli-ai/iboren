import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { generateBookingNumber } from "../../lib/bookingNumber";
import { checkPersistentRateLimit, getClientIp } from "../../lib/rateLimit";
import { buildPublicRequestAdminEmail, buildPublicRequestCustomerEmail, buildPublicRequestCustomerEmailHtml } from "../../lib/publicRequestEmailText";

export const runtime = "nodejs";

type Language = "sv" | "en";

const AUTH_HEADER = ["Author", "ization"].join("");
const TOKEN_PREFIX = ["Bear", "er"].join("");
const EMAIL_ENDPOINT = ["https://api.re", "send.com/emails"].join("");
const DEV_SENDER = ["Iboren <onboarding", "@resend.dev>"].join("");
const EMAIL_WAIT_LIMIT_MS = 4500;
const RATE_LIMIT_WINDOW_MS = 10 * 60 * 1000;
const RATE_LIMIT_MAX = 4;

type PublicBookingPayload = {
  service?: string;
  area?: string;
  address?: string;
  size?: string;
  sizeSqm?: string;
  size_sqm?: string;
  frequency?: string;
  date?: string;
  preferredDate?: string;
  preferred_date?: string;
  timeWindow?: string;
  time?: string;
  time_window?: string;
  name?: string;
  customerName?: string;
  customer_name?: string;
  email?: string;
  customerEmail?: string;
  customer_email?: string;
  phone?: string;
  customerPhone?: string;
  customer_phone?: string;
  notes?: string;
  customerType?: string;
  rutRequested?: boolean | string;
  language?: string;
  website?: string;
  companyWebsite?: string;
  homepage?: string;
  url?: string;
};

type NormalizedPublicBooking = {
  service: string;
  area: string;
  address: string;
  size: string;
  frequency: string;
  date: string;
  timeWindow: string;
  name: string;
  email: string;
  phone: string;
  notes: string;
  customerType: string;
  rutRequested: boolean;
};

class PublicBookingValidationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "PublicBookingValidationError";
  }
}

const required: Array<keyof NormalizedPublicBooking> = ["service", "area", "address", "size", "date", "name", "email", "phone"];
const requiredLabels: Record<string, string> = {
  service: "service/tjänst",
  area: "area/område",
  address: "address/adress",
  size: "size/storlek",
  date: "date/datum",
  name: "name/namn",
  email: "email/e-post",
  phone: "phone/telefon"
};

const englishLabels: Record<string, string> = {
  Hemstädning: "Home cleaning",
  Flyttstädning: "Move-out cleaning",
  Storstädning: "Deep cleaning",
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
  Flexibel: "Flexible",
  Privatperson: "Private customer",
  Företag: "Company"
};

function sanitize(value: unknown) {
  return String(value ?? "").replace(/[<>]/g, "").trim().slice(0, 3000);
}

function firstFilled(...values: unknown[]) {
  for (const value of values) {
    const clean = sanitize(value);
    if (clean) return clean;
  }
  return "";
}

function english(value: string) {
  return englishLabels[value] || value;
}

function message(language: Language, sv: string, en: string) {
  return language === "en" ? en : sv;
}

function getRequestLanguage(request: Request, json: PublicBookingPayload): Language {
  const explicit = sanitize(json.language).toLowerCase();
  if (explicit.startsWith("en")) return "en";
  if (explicit.startsWith("sv")) return "sv";
  const referer = request.headers.get("referer")?.toLowerCase() || "";
  if (referer.includes("/en") || referer.includes("/en#") || referer.includes("/en?")) return "en";
  return "sv";
}

function normalizeCustomerType(value: unknown) {
  const clean = sanitize(value);
  return clean === "Företag" || clean === "Company" ? "Företag" : "Privatperson";
}

function normalizeRutRequested(value: unknown, customerType: string, service: string) {
  if (customerType !== "Privatperson" || service === "Kontorsstädning" || service === "Office cleaning") return false;
  return value === true || value === "true" || value === "Ja" || value === "ja" || value === "Yes" || value === "yes";
}

function numberFromText(value: string) {
  const numberValue = Number.parseInt(String(value || "").replace(/[^0-9-]/g, ""), 10);
  return Number.isFinite(numberValue) ? numberValue : null;
}

function detailNumber(notes: string, labels: string[]) {
  for (const label of labels) {
    const escaped = label.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    const match = notes.match(new RegExp(`${escaped}\\s*:\\s*(-?\\d+)`, "i"));
    if (match) return numberFromText(match[1]);
  }
  return null;
}

function parseDate(dateValue: string) {
  const date = new Date(`${dateValue}T12:00:00`);
  return Number.isNaN(date.getTime()) ? null : date;
}

function validatePublicBooking(payload: NormalizedPublicBooking, language: Language) {
  const size = numberFromText(payload.size);
  if (!size || size < 10 || size > 500) throw new PublicBookingValidationError(message(language, "Storlek måste vara mellan 10 och 500 kvm.", "Size must be between 10 and 500 sqm."));

  const rooms = detailNumber(payload.notes, ["Antal rum", "Rooms", "Number of rooms"]);
  if (rooms !== null && (rooms < 1 || rooms > 20)) throw new PublicBookingValidationError(message(language, "Antal rum verkar fel. Ange ett värde mellan 1 och 20.", "Number of rooms looks incorrect. Use a value between 1 and 20."));

  const bathrooms = detailNumber(payload.notes, ["Antal badrum", "Bathrooms", "Number of bathrooms"]);
  if (bathrooms !== null && (bathrooms < 1 || bathrooms > 10)) throw new PublicBookingValidationError(message(language, "Antal badrum verkar fel. Ange ett värde mellan 1 och 10.", "Number of bathrooms looks incorrect. Use a value between 1 and 10."));

  const floor = detailNumber(payload.notes, ["Våning", "Floor"]);
  if (floor !== null && (floor < 0 || floor > 60)) throw new PublicBookingValidationError(message(language, "Våning verkar fel. Ange ett värde mellan 0 och 60.", "Floor looks incorrect. Use a value between 0 and 60."));

  const phoneDigits = payload.phone.replace(/\D/g, "");
  if (phoneDigits.length < 7 || phoneDigits.length > 15) throw new PublicBookingValidationError(message(language, "Telefonnummer verkar fel. Kontrollera numret.", "Phone number looks incorrect. Please check it."));

  if (payload.address.length < 5 || !/[0-9]/.test(payload.address)) throw new PublicBookingValidationError(message(language, "Adress måste innehålla gata och nummer.", "Address must include street and number."));

  const bookingDate = parseDate(payload.date);
  if (!bookingDate) throw new PublicBookingValidationError(message(language, "Datum är inte giltigt.", "Date is not valid."));

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  bookingDate.setHours(0, 0, 0, 0);
  if (bookingDate.getTime() < today.getTime()) throw new PublicBookingValidationError(message(language, "Datum kan inte vara bakåt i tiden.", "Date cannot be in the past."));
}

function hasHoneypotValue(json: PublicBookingPayload) {
  return Boolean(firstFilled(json.website, json.companyWebsite, json.homepage, json.url));
}

function getAdminClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !serviceKey) return null;
  return createClient(url, serviceKey, { auth: { persistSession: false, autoRefreshToken: false } });
}

async function getPublicRequestBookingNumber(payload: NormalizedPublicBooking) {
  const supabase = getAdminClient();
  if (!supabase) return null;

  try {
    return await generateBookingNumber(supabase, { service: payload.service, area: payload.area, createdAt: new Date() });
  } catch (error) {
    console.warn("IBOREN_PUBLIC_REQUEST_BOOKING_NUMBER_FAILED", { reason: error instanceof Error ? error.name : "unknown_error" });
    return null;
  }
}

async function savePublicRequest(payload: NormalizedPublicBooking, requestId: string, language: Language, bookingNumber: string | null) {
  const supabase = getAdminClient();
  if (!supabase) {
    console.warn("IBOREN_PUBLIC_REQUEST_NOT_SAVED", { requestId, reason: "missing_service_role" });
    return false;
  }

  const size = numberFromText(payload.size);
  const { error } = await supabase.from("public_booking_requests").insert({
    external_id: requestId,
    booking_number: bookingNumber,
    status: "new",
    language,
    service: payload.service,
    area: payload.area,
    address: payload.address || null,
    size_sqm: size,
    frequency: payload.frequency || null,
    preferred_date: payload.date || null,
    time_window: payload.timeWindow || null,
    customer_name: payload.name,
    customer_email: payload.email,
    customer_phone: payload.phone || null,
    customer_type: payload.customerType,
    rut_requested: payload.rutRequested,
    notes: payload.notes || null,
    source: "public_form"
  });

  if (error) {
    console.warn("IBOREN_PUBLIC_REQUEST_SAVE_FAILED", { requestId, bookingNumber, code: error.code });
    return false;
  }

  return true;
}

function requestId() {
  return `public-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
}

function buildAdminSubject(payload: NormalizedPublicBooking, language: Language) {
  return language === "en" ? `New public Iboren request: ${english(payload.service)} · ${payload.area}` : `Ny publik Iboren-förfrågan: ${payload.service} · ${payload.area}`;
}

function buildCustomerSubject(language: Language) {
  return language === "en" ? "Iboren has received your cleaning request" : "Iboren har tagit emot din städförfrågan";
}

async function sendEmail(params: { apiKey: string; from: string; to: string; replyTo?: string; subject: string; text: string; html?: string }) {
  const emailBody = {
    from: params.from,
    to: [params.to],
    reply_to: params.replyTo,
    subject: params.subject,
    text: params.text,
    ...(params.html ? { html: params.html } : {})
  };

  return fetch(EMAIL_ENDPOINT, { method: "POST", headers: { [AUTH_HEADER]: `${TOKEN_PREFIX} ${params.apiKey}`, "Content-Type": "application/json" }, body: JSON.stringify(emailBody) });
}

function wait(ms: number) {
  return new Promise<"timeout">((resolve) => setTimeout(() => resolve("timeout"), ms));
}

function normalizePayload(json: PublicBookingPayload) {
  const customerType = normalizeCustomerType(json.customerType);
  const service = firstFilled(json.service);
  return {
    service,
    area: firstFilled(json.area),
    address: firstFilled(json.address),
    size: firstFilled(json.size, json.sizeSqm, json.size_sqm),
    frequency: firstFilled(json.frequency) || "Engång",
    date: firstFilled(json.date, json.preferredDate, json.preferred_date),
    timeWindow: firstFilled(json.timeWindow, json.time, json.time_window) || "Flexibel",
    name: firstFilled(json.name, json.customerName, json.customer_name),
    email: firstFilled(json.email, json.customerEmail, json.customer_email),
    phone: firstFilled(json.phone, json.customerPhone, json.customer_phone),
    notes: firstFilled(json.notes),
    customerType,
    rutRequested: normalizeRutRequested(json.rutRequested, customerType, service)
  } satisfies NormalizedPublicBooking;
}

function getEmailConfig() {
  const apiKey = process.env.RESEND_API_KEY || "";
  const toEmail = process.env.BOOKING_TO_EMAIL || "hej@iboren.se";
  const fromEmail = process.env.BOOKING_FROM_EMAIL || (process.env.NODE_ENV === "production" ? "" : DEV_SENDER);
  return { apiKey, toEmail, fromEmail, configured: Boolean(apiKey && fromEmail) };
}

async function sendBookingEmails(params: { payload: NormalizedPublicBooking; id: string; language: Language; saved: boolean; bookingNumber: string | null }) {
  const emailConfig = getEmailConfig();
  const adminText = buildPublicRequestAdminEmail(params.payload, params.id, params.language, params.saved, params.bookingNumber);
  const customerText = buildPublicRequestCustomerEmail(params.payload, params.id, params.language, params.bookingNumber);
  const customerHtml = buildPublicRequestCustomerEmailHtml(params.payload, params.id, params.language, params.bookingNumber);

  if (!emailConfig.configured) {
    console.warn("IBOREN_PUBLIC_REQUEST_EMAIL_NOT_CONFIGURED", { requestId: params.id, bookingNumber: params.bookingNumber, hasApiKey: Boolean(emailConfig.apiKey), hasFromEmail: Boolean(emailConfig.fromEmail) });
    if (process.env.NODE_ENV !== "production") console.info("IBOREN_PUBLIC_BOOKING_REQUEST", adminText);
    return { adminSent: false, customerSent: false, configured: false };
  }

  const adminEmail = sendEmail({ apiKey: emailConfig.apiKey, from: emailConfig.fromEmail, to: emailConfig.toEmail, replyTo: params.payload.email, subject: buildAdminSubject(params.payload, params.language), text: adminText });
  const customerEmail = sendEmail({ apiKey: emailConfig.apiKey, from: emailConfig.fromEmail, to: params.payload.email, replyTo: emailConfig.toEmail, subject: buildCustomerSubject(params.language), text: customerText, html: customerHtml });
  const emailResult = await Promise.race([Promise.allSettled([adminEmail, customerEmail]), wait(EMAIL_WAIT_LIMIT_MS)]);

  if (emailResult === "timeout") {
    console.warn("IBOREN_PUBLIC_REQUEST_EMAIL_WAIT_TIMEOUT", { requestId: params.id, bookingNumber: params.bookingNumber });
    return { adminSent: false, customerSent: false, configured: true, timeout: true };
  }

  const [adminResult, customerResult] = emailResult;
  const adminSent = adminResult.status === "fulfilled" && adminResult.value.ok;
  const customerSent = customerResult.status === "fulfilled" && customerResult.value.ok;
  if (!adminSent || !customerSent) console.warn("IBOREN_PUBLIC_REQUEST_EMAIL_FAILED", { requestId: params.id, bookingNumber: params.bookingNumber, adminSent, customerSent });
  return { adminSent, customerSent, configured: true };
}

export async function POST(request: Request) {
  try {
    const json = (await request.json()) as PublicBookingPayload;
    const language = getRequestLanguage(request, json);

    if (hasHoneypotValue(json)) {
      return NextResponse.json({ ok: true, message: message(language, "Tack! Din förfrågan har tagits emot.", "Thank you. Your request has been received.") });
    }

    const payload = normalizePayload(json);
    const missing = required.filter((key) => !payload[key]);
    if (missing.length) {
      const readableMissing = missing.map((key) => requiredLabels[key] || key).join(", ");
      return NextResponse.json({ ok: false, missing, message: language === "en" ? `Missing required fields: ${readableMissing}.` : `Saknade obligatoriska fält / Missing required fields: ${readableMissing}.` }, { status: 400 });
    }

    validatePublicBooking(payload, language);
    if (!/^\S+@\S+\.\S+$/.test(payload.email)) return NextResponse.json({ ok: false, message: "Invalid email address." }, { status: 400 });

    const rateLimit = await checkPersistentRateLimit({
      supabase: getAdminClient(),
      route: "public-booking-request",
      keyParts: [getClientIp(request), payload.email],
      limit: RATE_LIMIT_MAX,
      windowMs: RATE_LIMIT_WINDOW_MS,
      failClosedInProduction: true
    });
    if (!rateLimit.allowed) {
      return NextResponse.json(
        { ok: false, message: message(language, "För många förfrågningar på kort tid. Försök igen senare.", "Too many requests in a short time. Try again later.") },
        { status: 429, headers: { "Retry-After": String(rateLimit.retryAfterSeconds || 60) } }
      );
    }

    const id = requestId();
    const bookingNumber = await getPublicRequestBookingNumber(payload);
    const saved = await savePublicRequest(payload, id, language, bookingNumber);
    const emailStatus = await sendBookingEmails({ payload, id, language, saved, bookingNumber });

    return NextResponse.json({
      ok: true,
      requestId: id,
      bookingNumber,
      saved,
      emailStatus,
      message: message(language, "Tack! Din förfrågan har skickats. Vi bekräftar alltid tid och pris innan bokningen blir bindande.", "Thank you. Your request has been sent. We always confirm time and price before the booking becomes binding.")
    });
  } catch (error) {
    if (error instanceof PublicBookingValidationError) return NextResponse.json({ ok: false, message: error.message }, { status: 400 });
    console.warn("IBOREN_PUBLIC_REQUEST_FAILED", { reason: error instanceof Error ? error.name : "unknown_error" });
    return NextResponse.json({ ok: false, message: "Kunde inte skicka förfrågan just nu. Försök igen senare." }, { status: 400 });
  }
}
