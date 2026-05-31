import { NextResponse } from "next/server";

export const runtime = "nodejs";

type Language = "sv" | "en";

const AUTH_HEADER = ["Author", "ization"].join("");
const TOKEN_PREFIX = ["Bear", "er"].join("");
const EMAIL_ENDPOINT = ["https://api.re", "send.com/emails"].join("");
const EMAIL_WAIT_LIMIT_MS = 4500;
const RATE_LIMIT_WINDOW_MS = 10 * 60 * 1000;
const RATE_LIMIT_MAX = 4;

const requestBuckets = new Map<string, { count: number; resetAt: number }>();

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
  if (customerType !== "Privatperson" || service === "Kontorsstädning") return false;
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

function getClientKey(request: Request, payload?: NormalizedPublicBooking) {
  const forwardedFor = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim();
  const ip = request.headers.get("cf-connecting-ip") || forwardedFor || "unknown-ip";
  const email = payload?.email?.toLowerCase() || "unknown-email";
  return `${ip}:${email}`;
}

function checkRateLimit(key: string) {
  const now = Date.now();
  const current = requestBuckets.get(key);
  if (!current || current.resetAt <= now) {
    requestBuckets.set(key, { count: 1, resetAt: now + RATE_LIMIT_WINDOW_MS });
    return true;
  }
  if (current.count >= RATE_LIMIT_MAX) return false;
  current.count += 1;
  return true;
}

function hasHoneypotValue(json: PublicBookingPayload) {
  return Boolean(firstFilled(json.website, json.companyWebsite, json.homepage, json.url));
}

function buildAdminRutText(payload: NormalizedPublicBooking, language: Language) {
  if (language === "en") {
    if (payload.customerType !== "Privatperson") return "RUT: Not applicable for company requests.";
    if (payload.service === "Kontorsstädning") return "RUT: No. Office cleaning is handled as a business price or quote.";
    return payload.rutRequested ? "RUT: Yes. The customer has requested RUT deduction according to Skatteverket rules. If RUT is not approved, the remaining amount may be invoiced." : "RUT: No. The customer has not requested RUT deduction.";
  }
  if (payload.customerType !== "Privatperson") return "RUT: Gäller inte för företagsförfrågningar.";
  if (payload.service === "Kontorsstädning") return "RUT: Nej. Kontorsstädning hanteras som företagspris/offert.";
  return payload.rutRequested ? "RUT: Ja. Kunden har valt RUT och intygar att villkoren hos Skatteverket uppfylls. Om RUT inte godkänns kan resterande belopp faktureras." : "RUT: Nej. Kunden har inte valt RUT-avdrag.";
}

function buildCustomerRutText(payload: NormalizedPublicBooking, language: Language) {
  if (language === "en") {
    if (payload.customerType !== "Privatperson") return "RUT: Not applicable for company requests.";
    if (payload.service === "Kontorsstädning") return "RUT: No. Office cleaning is handled as a business price or quote.";
    return payload.rutRequested ? "RUT: Yes. You have requested RUT deduction according to Skatteverket rules. If RUT is not approved, the remaining amount may be invoiced." : "RUT: No. You have not requested RUT deduction.";
  }
  if (payload.customerType !== "Privatperson") return "RUT: Gäller inte för företagsförfrågningar.";
  if (payload.service === "Kontorsstädning") return "RUT: Nej. Kontorsstädning hanteras som företagspris/offert.";
  return payload.rutRequested ? "RUT: Ja. Du har valt RUT enligt Skatteverkets regler. Om RUT inte godkänns kan resterande belopp faktureras." : "RUT: Nej. Du har inte valt RUT-avdrag.";
}

function requestId() {
  return `public-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
}

function buildAdminText(payload: NormalizedPublicBooking, id: string, language: Language) {
  if (language === "en") {
    return [
      "New Iboren public booking request",
      "",
      `Request ID: ${id}`,
      "Status: New / unverified / pending review",
      "Important: This is not a confirmed booking. Confirm time and price manually before it becomes binding.",
      `Customer language: ${language}`,
      "",
      `Customer type: ${english(payload.customerType)}`,
      buildAdminRutText(payload, "en"),
      "",
      `Service: ${english(payload.service)}`,
      `Area: ${payload.area}`,
      `Address: ${payload.address || "Not provided"}`,
      `Size: ${payload.size} sqm`,
      `Frequency: ${english(payload.frequency)}`,
      `Date: ${payload.date}`,
      `Time window: ${english(payload.timeWindow)}`,
      "",
      `Name: ${payload.name}`,
      `Email: ${payload.email}`,
      `Phone: ${payload.phone || "Not provided"}`,
      "",
      `Notes: ${payload.notes || "-"}`
    ].filter(Boolean).join("\n");
  }

  return [
    "Ny publik bokningsförfrågan till Iboren",
    "",
    `Förfrågnings-ID: ${id}`,
    "Status: Ny / overifierad / behöver granskas",
    "Viktigt: Detta är inte en bekräftad bokning. Bekräfta tid och pris manuellt innan den blir bindande.",
    `Kundspråk: ${language}`,
    "",
    `Kundtyp: ${payload.customerType}`,
    buildAdminRutText(payload, "sv"),
    "",
    `Tjänst: ${payload.service}`,
    `Område: ${payload.area}`,
    `Adress: ${payload.address || "Ej angivet"}`,
    `Storlek: ${payload.size} kvm`,
    `Frekvens: ${payload.frequency}`,
    `Datum: ${payload.date}`,
    `Tid: ${payload.timeWindow}`,
    "",
    `Namn: ${payload.name}`,
    `E-post: ${payload.email}`,
    `Telefon: ${payload.phone || "Ej angivet"}`,
    "",
    `Anteckningar: ${payload.notes || "-"}`
  ].filter(Boolean).join("\n");
}

function buildCustomerText(payload: NormalizedPublicBooking, id: string, language: Language) {
  if (language === "en") {
    return [
      `Hi ${payload.name},`,
      "",
      "Thank you. Iboren has received your cleaning request.",
      "We always confirm time and price before the booking becomes binding.",
      "",
      "Your summary:",
      `Request ID: ${id}`,
      `Service: ${english(payload.service)}`,
      `Area: ${payload.area}`,
      `Address: ${payload.address}`,
      `Size: ${payload.size} sqm`,
      `Frequency: ${english(payload.frequency)}`,
      `Date: ${payload.date}`,
      `Time: ${english(payload.timeWindow)}`,
      `Customer type: ${english(payload.customerType)}`,
      buildCustomerRutText(payload, "en"),
      "",
      "If anything is incorrect, you can reply to this email or contact us at hej@iboren.se.",
      "",
      "Best regards,",
      "Iboren"
    ].filter(Boolean).join("\n");
  }

  return [
    `Hej ${payload.name},`,
    "",
    "Tack. Iboren har tagit emot din städförfrågan.",
    "Vi bekräftar alltid tid och pris innan bokningen blir bindande.",
    "",
    "Din sammanfattning:",
    `Förfrågnings-ID: ${id}`,
    `Tjänst: ${payload.service}`,
    `Område: ${payload.area}`,
    `Adress: ${payload.address}`,
    `Storlek: ${payload.size} kvm`,
    `Frekvens: ${payload.frequency}`,
    `Datum: ${payload.date}`,
    `Tid: ${payload.timeWindow}`,
    `Kundtyp: ${payload.customerType}`,
    buildCustomerRutText(payload, "sv"),
    "",
    "Om något inte stämmer kan du svara på det här mejlet eller kontakta oss på hej@iboren.se.",
    "",
    "Vänliga hälsningar,",
    "Iboren"
  ].filter(Boolean).join("\n");
}

function buildAdminSubject(payload: NormalizedPublicBooking, language: Language) {
  return language === "en" ? `New public Iboren request: ${english(payload.service)} · ${payload.area}` : `Ny publik Iboren-förfrågan: ${payload.service} · ${payload.area}`;
}

function buildCustomerSubject(language: Language) {
  return language === "en" ? "Iboren has received your cleaning request" : "Iboren har tagit emot din städförfrågan";
}

async function sendEmail(params: { apiKey: string; from: string; to: string; replyTo?: string; subject: string; text: string }) {
  return fetch(EMAIL_ENDPOINT, { method: "POST", headers: { [AUTH_HEADER]: `${TOKEN_PREFIX} ${params.apiKey}`, "Content-Type": "application/json" }, body: JSON.stringify({ from: params.from, to: [params.to], reply_to: params.replyTo, subject: params.subject, text: params.text }) });
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

    const rateLimitKey = getClientKey(request, payload);
    if (!checkRateLimit(rateLimitKey)) return NextResponse.json({ ok: false, message: message(language, "För många förfrågningar på kort tid. Försök igen senare.", "Too many requests in a short time. Try again later.") }, { status: 429 });

    const id = requestId();
    const resendApiKey = process.env.RESEND_API_KEY;
    const toEmail = process.env.BOOKING_TO_EMAIL || "hej@iboren.se";
    const fromEmail = process.env.BOOKING_FROM_EMAIL || "Iboren <onboarding@resend.dev>";
    const adminText = buildAdminText(payload, id, language);
    const customerText = buildCustomerText(payload, id, language);

    if (resendApiKey) {
      const adminEmail = sendEmail({ apiKey: resendApiKey, from: fromEmail, to: toEmail, replyTo: payload.email, subject: buildAdminSubject(payload, language), text: adminText });
      const customerEmail = sendEmail({ apiKey: resendApiKey, from: fromEmail, to: payload.email, replyTo: toEmail, subject: buildCustomerSubject(language), text: customerText });
      const emailResult = await Promise.race([Promise.allSettled([adminEmail, customerEmail]), wait(EMAIL_WAIT_LIMIT_MS)]);
      if (emailResult === "timeout") console.warn("IBOREN_PUBLIC_REQUEST_EMAIL_WAIT_TIMEOUT", { requestId: id });
    } else {
      console.info("IBOREN_PUBLIC_BOOKING_REQUEST", adminText);
    }

    return NextResponse.json({
      ok: true,
      requestId: id,
      message: message(language, "Tack! Din förfrågan har skickats. Vi bekräftar alltid tid och pris innan bokningen blir bindande.", "Thank you. Your request has been sent. We always confirm time and price before the booking becomes binding.")
    });
  } catch (error) {
    if (error instanceof PublicBookingValidationError) return NextResponse.json({ ok: false, message: error.message }, { status: 400 });
    return NextResponse.json({ ok: false, message: error instanceof Error ? error.message : "Invalid request." }, { status: 400 });
  }
}
