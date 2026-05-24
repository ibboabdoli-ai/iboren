import { NextResponse } from "next/server";
import { createClient, User } from "@supabase/supabase-js";

export const runtime = "nodejs";

type Language = "sv" | "en";

const AUTH_HEADER = ["Author", "ization"].join("");
const TOKEN_PREFIX = ["Bear", "er"].join("");
const EMAIL_ENDPOINT = ["https://api.re", "send.com/emails"].join("");

type BookingPayload = {
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
  rutRequested?: boolean;
  language?: string;
};

type NormalizedBookingPayload = {
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

type AuthContext = { user: User; token: string };
type SaveBookingResult = { id: string; duplicate: boolean; date: string };
type RecurringPlan = { count: number; stepDays?: number; stepMonths?: number; label: string };

class DuplicateBookingError extends Error {
  constructor() {
    super("Den här bokningen finns redan. Ändra datum, tid eller uppgifter om du vill skapa en ny bokning.");
    this.name = "DuplicateBookingError";
  }
}

class BookingValidationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "BookingValidationError";
  }
}

const required: Array<keyof NormalizedBookingPayload> = ["service", "area", "address", "size", "date", "name", "email", "phone"];
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
const EMAIL_WAIT_LIMIT_MS = 4500;

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

function english(value: string) { return englishLabels[value] || value; }

function getRequestLanguage(request: Request, json: BookingPayload): Language {
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

function isUniqueDuplicateError(error: unknown) {
  const candidate = error as { code?: string; message?: string; details?: string } | null;
  const text = `${candidate?.message || ""} ${candidate?.details || ""}`.toLowerCase();
  return candidate?.code === "23505" || text.includes("bookings_unique_active_request_idx") || text.includes("duplicate key value violates unique constraint");
}

function parseDate(dateValue: string) {
  const date = new Date(`${dateValue}T12:00:00`);
  return Number.isNaN(date.getTime()) ? null : date;
}

function formatDate(date: Date) { return date.toISOString().slice(0, 10); }

function addMonths(date: Date, months: number) {
  const next = new Date(date);
  const day = next.getDate();
  next.setMonth(next.getMonth() + months);
  if (next.getDate() < day) next.setDate(0);
  return next;
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

function message(language: Language, sv: string, en: string) { return language === "en" ? en : sv; }

function validateBookingPayload(payload: NormalizedBookingPayload, language: Language) {
  const size = numberFromText(payload.size);
  if (!size || size < 10 || size > 500) {
    throw new BookingValidationError(message(language, "Storlek måste vara mellan 10 och 500 kvm.", "Size must be between 10 and 500 sqm."));
  }

  const rooms = detailNumber(payload.notes, ["Antal rum", "Rooms", "Number of rooms"]);
  if (rooms !== null && (rooms < 1 || rooms > 20)) {
    throw new BookingValidationError(message(language, "Antal rum verkar fel. Ange ett värde mellan 1 och 20.", "Number of rooms looks incorrect. Use a value between 1 and 20."));
  }

  const bathrooms = detailNumber(payload.notes, ["Antal badrum", "Bathrooms", "Number of bathrooms"]);
  if (bathrooms !== null && (bathrooms < 1 || bathrooms > 10)) {
    throw new BookingValidationError(message(language, "Antal badrum verkar fel. Ange ett värde mellan 1 och 10.", "Number of bathrooms looks incorrect. Use a value between 1 and 10."));
  }

  const floor = detailNumber(payload.notes, ["Våning", "Floor"]);
  if (floor !== null && (floor < 0 || floor > 60)) {
    throw new BookingValidationError(message(language, "Våning verkar fel. Ange ett värde mellan 0 och 60.", "Floor looks incorrect. Use a value between 0 and 60."));
  }

  const phoneDigits = payload.phone.replace(/\D/g, "");
  if (phoneDigits.length < 7 || phoneDigits.length > 15) {
    throw new BookingValidationError(message(language, "Telefonnummer verkar fel. Kontrollera numret.", "Phone number looks incorrect. Please check it."));
  }

  if (payload.address.length < 5 || !/[0-9]/.test(payload.address)) {
    throw new BookingValidationError(message(language, "Adress måste innehålla gata och nummer.", "Address must include street and number."));
  }

  const bookingDate = parseDate(payload.date);
  if (!bookingDate) {
    throw new BookingValidationError(message(language, "Datum är inte giltigt.", "Date is not valid."));
  }

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  bookingDate.setHours(0, 0, 0, 0);
  if (bookingDate.getTime() < today.getTime()) {
    throw new BookingValidationError(message(language, "Datum kan inte vara bakåt i tiden.", "Date cannot be in the past."));
  }
}

function getRecurringPlan(frequency: string): RecurringPlan {
  const clean = frequency.toLowerCase().trim();
  if (["varje vecka", "every week", "weekly"].includes(clean)) return { count: 8, stepDays: 7, label: "weekly" };
  if (["varannan vecka", "every other week", "biweekly", "bi-weekly"].includes(clean)) return { count: 6, stepDays: 14, label: "every_other_week" };
  if (["varje månad", "every month", "monthly"].includes(clean)) return { count: 6, stepMonths: 1, label: "monthly" };
  return { count: 1, label: "one_time" };
}

function buildVisitDates(startDate: string, frequency: string) {
  const start = parseDate(startDate);
  if (!start) return [startDate];
  const plan = getRecurringPlan(frequency);
  const dates: string[] = [];
  for (let index = 0; index < plan.count; index += 1) {
    if (plan.stepMonths) dates.push(formatDate(addMonths(start, index * plan.stepMonths)));
    else dates.push(formatDate(new Date(start.getTime() + index * (plan.stepDays || 0) * 24 * 60 * 60 * 1000)));
  }
  return dates;
}

function withVisitDate(payload: NormalizedBookingPayload, date: string, visitIndex: number, visitCount: number) {
  const recurringText = visitCount > 1 ? [payload.notes || "", "", "--- Recurring visit ---", `Visit: ${visitIndex + 1} of ${visitCount}`, `Original start date: ${payload.date}`, `Frequency: ${payload.frequency}`].join("\n").trim() : payload.notes;
  return { ...payload, date, notes: recurringText };
}

function getSupabase(token?: string) {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !key) return null;
  return createClient(url, { auth: { persistSession: false, autoRefreshToken: false }, global: token ? { headers: { [AUTH_HEADER]: `${TOKEN_PREFIX} ${token}` } } : undefined } as never);
}

async function getAuthContext(request: Request): Promise<AuthContext | null> {
  const authHeader = request.headers.get(AUTH_HEADER.toLowerCase()) || "";
  const token = authHeader.toLowerCase().startsWith(`${TOKEN_PREFIX.toLowerCase()} `) ? authHeader.slice(TOKEN_PREFIX.length + 1).trim() : "";
  if (!token) return null;
  const supabase = getSupabase();
  if (!supabase) return null;
  const { data, error } = await supabase.auth.getUser(token);
  if (error || !data.user) return null;
  return { user: data.user, token };
}

function buildRutText(payload: NormalizedBookingPayload, language: Language) {
  if (language === "en") {
    if (payload.customerType !== "Privatperson") return "Customer type: Company. RUT does not apply.";
    if (payload.service === "Kontorsstädning") return "RUT: No. Office cleaning is handled as a business price or quote.";
    return payload.rutRequested ? "RUT: Yes. The customer has requested RUT deduction according to Skatteverket rules. If RUT is not approved, the remaining amount may be invoiced." : "RUT: No. The customer has not requested RUT deduction.";
  }
  if (payload.customerType !== "Privatperson") return "Kundtyp: Företag. RUT gäller inte.";
  if (payload.service === "Kontorsstädning") return "RUT: Nej. Kontorsstädning hanteras som företagspris/offert.";
  return payload.rutRequested ? "RUT: Ja. Kunden har valt RUT och intygar att villkoren hos Skatteverket uppfylls. Om RUT inte godkänns kan resterande belopp faktureras." : "RUT: Nej. Kunden har inte valt RUT-avdrag.";
}

function buildAdminText(payload: NormalizedBookingPayload, user: User, bookingId: string, language: Language, recurring?: { total: number; dates: string[] }) {
  return ["New Iboren booking request", "", `Booking ID: ${bookingId}`, recurring && recurring.total > 1 ? `Recurring visits created: ${recurring.total}` : "Recurring visits created: 1", recurring && recurring.total > 1 ? `Visit dates: ${recurring.dates.join(", ")}` : "", `Authenticated user: ${user.email || user.id}`, `Customer language: ${language}`, "", `Customer type: ${english(payload.customerType)}`, buildRutText(payload, "en"), "", `Service: ${english(payload.service)}`, `Area: ${payload.area}`, `Address: ${payload.address || "Not provided"}`, `Size: ${payload.size} sqm`, `Frequency: ${english(payload.frequency)}`, `Date: ${payload.date}`, `Time window: ${english(payload.timeWindow)}`, "", `Name: ${payload.name}`, `Email: ${payload.email}`, `Phone: ${payload.phone || "Not provided"}`, "", `Notes: ${payload.notes || "-"}`].filter(Boolean).join("\n");
}

function buildCustomerTextSv(payload: NormalizedBookingPayload, bookingId: string, recurring?: { total: number; dates: string[] }) {
  return [`Hej ${payload.name},`, "", "Tack för din bokningsförfrågan till Iboren. Vi har tagit emot den och återkommer så snart som möjligt.", recurring && recurring.total > 1 ? `Vi har skapat ${recurring.total} kommande besök utifrån din valda frekvens.` : "", recurring && recurring.total > 1 ? `Datum: ${recurring.dates.join(", ")}` : "", "", "Din sammanfattning:", `Boknings-ID: ${bookingId}`, `Tjänst: ${payload.service}`, `Område: ${payload.area}`, `Adress: ${payload.address}`, `Storlek: ${payload.size} kvm`, `Frekvens: ${payload.frequency}`, `Startdatum: ${payload.date}`, `Tid: ${payload.timeWindow}`, `Kundtyp: ${payload.customerType}`, buildRutText(payload, "sv"), "", "Om något inte stämmer kan du svara på det här mejlet eller kontakta oss på hej@iboren.se.", "", "Vänliga hälsningar,", "Iboren"].filter(Boolean).join("\n");
}

function buildCustomerTextEn(payload: NormalizedBookingPayload, bookingId: string, recurring?: { total: number; dates: string[] }) {
  return [`Hi ${payload.name},`, "", "Thank you for your booking request to Iboren. We have received it and will get back to you as soon as possible.", recurring && recurring.total > 1 ? `We have created ${recurring.total} upcoming visits based on your selected frequency.` : "", recurring && recurring.total > 1 ? `Dates: ${recurring.dates.join(", ")}` : "", "", "Your summary:", `Booking ID: ${bookingId}`, `Service: ${english(payload.service)}`, `Area: ${payload.area}`, `Address: ${payload.address}`, `Size: ${payload.size} sqm`, `Frequency: ${english(payload.frequency)}`, `Start date: ${payload.date}`, `Time: ${english(payload.timeWindow)}`, `Customer type: ${english(payload.customerType)}`, buildRutText(payload, "en"), "", "If anything is incorrect, you can reply to this email or contact us at hej@iboren.se.", "", "Best regards,", "Iboren"].filter(Boolean).join("\n");
}

function buildCustomerText(payload: NormalizedBookingPayload, bookingId: string, language: Language, recurring?: { total: number; dates: string[] }) { return language === "en" ? buildCustomerTextEn(payload, bookingId, recurring) : buildCustomerTextSv(payload, bookingId, recurring); }
function buildCustomerSubject(payload: NormalizedBookingPayload, language: Language) { return language === "en" ? `Iboren has received your booking request · ${english(payload.service)}` : `Iboren har tagit emot din bokning · ${payload.service}`; }

async function saveBooking(payload: NormalizedBookingPayload, auth: AuthContext, language: Language): Promise<SaveBookingResult> {
  const supabase = getSupabase(auth.token);
  if (!supabase) throw new Error("Supabase saknas.");
  const size = Number.parseInt(payload.size, 10);
  const sizeSqm = Number.isFinite(size) ? size : null;

  const { data: existing, error: lookupError } = await supabase.from("bookings").select("id").eq("user_id", auth.user.id).eq("service", payload.service).eq("address", payload.address).eq("preferred_date", payload.date).eq("size_sqm", sizeSqm).eq("frequency", payload.frequency).eq("time_window", payload.timeWindow).eq("customer_email", payload.email).neq("status", "cancelled").limit(1).maybeSingle();
  if (lookupError) throw new Error(`Kunde inte kontrollera tidigare bokning: ${lookupError.message}`);
  if (existing?.id) return { id: existing.id as string, duplicate: true, date: payload.date };

  const notesWithRut = [payload.notes || "", "", "--- Kundtyp & RUT ---", `Kundtyp: ${payload.customerType}`, `RUT önskas: ${payload.rutRequested ? "Ja" : "Nej"}`, `Språk / Language: ${language}`].join("\n").trim();

  const { data, error } = await supabase.from("bookings").insert({ user_id: auth.user.id, service: payload.service, area: payload.area, address: payload.address || null, size_sqm: sizeSqm, frequency: payload.frequency, preferred_date: payload.date, time_window: payload.timeWindow, customer_name: payload.name, customer_email: payload.email, customer_phone: payload.phone || null, notes: notesWithRut || null, status: "new" }).select("id").single();
  if (error) {
    if (isUniqueDuplicateError(error)) throw new DuplicateBookingError();
    throw new Error(`Kunde inte spara bokningen i databasen: ${error.message}`);
  }
  return { id: data.id as string, duplicate: false, date: payload.date };
}

async function saveRecurringBookings(payload: NormalizedBookingPayload, auth: AuthContext, language: Language) {
  const dates = buildVisitDates(payload.date, payload.frequency);
  const results: SaveBookingResult[] = [];
  for (let index = 0; index < dates.length; index += 1) {
    const visitPayload = withVisitDate(payload, dates[index], index, dates.length);
    results.push(await saveBooking(visitPayload, auth, language));
  }
  const created = results.filter((result) => !result.duplicate);
  const duplicates = results.filter((result) => result.duplicate);
  const first = created[0] || results[0];
  return { first, results, created, duplicates, dates };
}

async function sendEmail(params: { apiKey: string; from: string; to: string; replyTo?: string; subject: string; text: string }) {
  return fetch(EMAIL_ENDPOINT, { method: "POST", headers: { [AUTH_HEADER]: `${TOKEN_PREFIX} ${params.apiKey}`, "Content-Type": "application/json" }, body: JSON.stringify({ from: params.from, to: [params.to], reply_to: params.replyTo, subject: params.subject, text: params.text }) });
}

function wait(ms: number) { return new Promise<"timeout">((resolve) => setTimeout(() => resolve("timeout"), ms)); }

export async function POST(request: Request) {
  try {
    const auth = await getAuthContext(request);
    if (!auth) return NextResponse.json({ ok: false, message: "Du behöver logga in för att skicka en bokningsförfrågan." }, { status: 401 });

    const json = (await request.json()) as BookingPayload;
    const language = getRequestLanguage(request, json);
    const customerType = normalizeCustomerType(json.customerType);
    const service = firstFilled(json.service);
    const payload: NormalizedBookingPayload = { service, area: firstFilled(json.area), address: firstFilled(json.address), size: firstFilled(json.size, json.sizeSqm, json.size_sqm), frequency: firstFilled(json.frequency) || "Engång", date: firstFilled(json.date, json.preferredDate, json.preferred_date), timeWindow: firstFilled(json.timeWindow, json.time, json.time_window) || "Flexibel", name: firstFilled(json.name, json.customerName, json.customer_name), email: firstFilled(json.email, json.customerEmail, json.customer_email), phone: firstFilled(json.phone, json.customerPhone, json.customer_phone), notes: firstFilled(json.notes), customerType, rutRequested: normalizeRutRequested(json.rutRequested, customerType, service) };

    const missing = required.filter((key) => !payload[key]);
    if (missing.length) {
      const readableMissing = missing.map((key) => requiredLabels[key] || key).join(", ");
      return NextResponse.json({ ok: false, missing, message: language === "en" ? `Missing required fields: ${readableMissing}.` : `Saknade obligatoriska fält / Missing required fields: ${readableMissing}.` }, { status: 400 });
    }

    validateBookingPayload(payload, language);

    if (!/^\S+@\S+\.\S+$/.test(payload.email)) return NextResponse.json({ ok: false, message: "Invalid email address." }, { status: 400 });
    if (auth.user.email && payload.email.toLowerCase() !== auth.user.email.toLowerCase()) return NextResponse.json({ ok: false, message: language === "en" ? "The booking email must match your logged-in account." : "Bokningens e-post måste matcha ditt inloggade konto." }, { status: 403 });

    const bookingSet = await saveRecurringBookings(payload, auth, language);
    if (!bookingSet.created.length && bookingSet.first?.duplicate) return NextResponse.json({ ok: false, duplicate: true, bookingId: bookingSet.first.id, message: language === "en" ? "This booking already exists. Change the date, time or details if you want to create a new booking." : "Den här bokningen finns redan. Ändra datum, tid eller uppgifter om du vill skapa en ny bokning." }, { status: 409 });

    const recurring = { total: bookingSet.results.length, dates: bookingSet.dates };
    const bookingId = bookingSet.first.id;
    const resendApiKey = process.env.RESEND_API_KEY;
    const toEmail = process.env.BOOKING_TO_EMAIL || "hej@iboren.se";
    const fromEmail = process.env.BOOKING_FROM_EMAIL || "Iboren <onboarding@resend.dev>";
    const adminText = buildAdminText(payload, auth.user, bookingId, language, recurring);
    const customerText = buildCustomerText(payload, bookingId, language, recurring);
    const customerSubject = buildCustomerSubject(payload, language);

    if (resendApiKey) {
      const adminEmail = sendEmail({ apiKey: resendApiKey, from: fromEmail, to: toEmail, replyTo: payload.email, subject: `New Iboren booking: ${english(payload.service)} · ${payload.area}`, text: adminText });
      const customerEmail = sendEmail({ apiKey: resendApiKey, from: fromEmail, to: payload.email, replyTo: toEmail, subject: customerSubject, text: customerText });
      const emailResult = await Promise.race([Promise.allSettled([adminEmail, customerEmail]), wait(EMAIL_WAIT_LIMIT_MS)]);
      if (emailResult === "timeout") console.warn("IBOREN_BOOKING_EMAIL_WAIT_TIMEOUT", { bookingId });
      return NextResponse.json({ ok: true, bookingId, bookingIds: bookingSet.created.map((item) => item.id), visitDates: bookingSet.dates, duplicates: bookingSet.duplicates.length, message: language === "en" ? "Thank you. Your booking request has been saved. Iboren will get back to you as soon as possible." : "Tack! Din bokningsförfrågan är sparad. Iboren återkommer så snart som möjligt." });
    }

    console.info("IBOREN_BOOKING_REQUEST", adminText);
    return NextResponse.json({ ok: true, bookingId, bookingIds: bookingSet.created.map((item) => item.id), visitDates: bookingSet.dates, duplicates: bookingSet.duplicates.length, message: language === "en" ? "The booking has been saved. Demo mode: add RESEND_API_KEY in Vercel for real email." : "Bokningen är sparad. Demo-läge: lägg till RESEND_API_KEY i Vercel för riktig e-post." });
  } catch (error) {
    if (error instanceof DuplicateBookingError) return NextResponse.json({ ok: false, duplicate: true, message: error.message }, { status: 409 });
    if (error instanceof BookingValidationError) return NextResponse.json({ ok: false, message: error.message }, { status: 400 });
    return NextResponse.json({ ok: false, message: error instanceof Error ? error.message : "Invalid request." }, { status: 400 });
  }
}
