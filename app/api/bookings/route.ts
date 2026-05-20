import { NextResponse } from "next/server";
import { createClient, User } from "@supabase/supabase-js";

export const runtime = "nodejs";

type BookingPayload = {
  service?: string;
  area?: string;
  address?: string;
  size?: string;
  frequency?: string;
  date?: string;
  timeWindow?: string;
  name?: string;
  email?: string;
  phone?: string;
  notes?: string;
};

type AuthContext = {
  user: User;
  token: string;
};

type SaveBookingResult = {
  id: string;
  duplicate: boolean;
};

class DuplicateBookingError extends Error {
  constructor() {
    super("Den här bokningen finns redan. Ändra datum, tid eller uppgifter om du vill skapa en ny bokning.");
    this.name = "DuplicateBookingError";
  }
}

const required: Array<keyof BookingPayload> = ["service", "area", "address", "size", "date", "name", "email", "phone"];

function sanitize(value: unknown) {
  return String(value ?? "").replace(/[<>]/g, "").trim().slice(0, 3000);
}

function isUniqueDuplicateError(error: unknown) {
  const candidate = error as { code?: string; message?: string; details?: string } | null;
  const text = `${candidate?.message || ""} ${candidate?.details || ""}`.toLowerCase();
  return candidate?.code === "23505" || text.includes("bookings_unique_active_request_idx") || text.includes("duplicate key value violates unique constraint");
}

function getSupabase(token?: string) {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !key) return null;
  return createClient(url, key, {
    auth: {
      persistSession: false,
      autoRefreshToken: false
    },
    global: token ? { headers: { Authorization: `Bearer ${token}` } } : undefined
  });
}

async function getAuthContext(request: Request): Promise<AuthContext | null> {
  const authHeader = request.headers.get("authorization") || "";
  const token = authHeader.toLowerCase().startsWith("bearer ") ? authHeader.slice(7).trim() : "";
  if (!token) return null;

  const supabase = getSupabase();
  if (!supabase) return null;

  const { data, error } = await supabase.auth.getUser(token);
  if (error || !data.user) return null;
  return { user: data.user, token };
}

function buildAdminText(payload: Required<BookingPayload>, user: User, bookingId: string) {
  return [
    "New Iboren booking request",
    "",
    `Booking ID: ${bookingId}`,
    `Authenticated user: ${user.email || user.id}`,
    "",
    `Service: ${payload.service}`,
    `Area: ${payload.area}`,
    `Address: ${payload.address || "Not provided"}`,
    `Size: ${payload.size} kvm`,
    `Frequency: ${payload.frequency}`,
    `Date: ${payload.date}`,
    `Time window: ${payload.timeWindow}`,
    "",
    `Name: ${payload.name}`,
    `Email: ${payload.email}`,
    `Phone: ${payload.phone || "Not provided"}`,
    "",
    `Notes: ${payload.notes || "-"}`
  ].join("\n");
}

function buildCustomerText(payload: Required<BookingPayload>, bookingId: string) {
  return [
    `Hej ${payload.name},`,
    "",
    "Tack för din bokningsförfrågan till Iboren. Vi har tagit emot den och återkommer så snart som möjligt.",
    "",
    "Din sammanfattning:",
    `Boknings-ID: ${bookingId}`,
    `Tjänst: ${payload.service}`,
    `Område: ${payload.area}`,
    `Adress: ${payload.address}`,
    `Storlek: ${payload.size} kvm`,
    `Frekvens: ${payload.frequency}`,
    `Datum: ${payload.date}`,
    `Tid: ${payload.timeWindow}`,
    "",
    "Om något inte stämmer kan du svara på det här mejlet eller kontakta oss på hej@iboren.se.",
    "",
    "Vänliga hälsningar,",
    "Iboren"
  ].join("\n");
}

async function saveBooking(payload: Required<BookingPayload>, auth: AuthContext): Promise<SaveBookingResult> {
  const supabase = getSupabase(auth.token);
  if (!supabase) throw new Error("Supabase saknas.");

  const size = Number.parseInt(payload.size, 10);
  const sizeSqm = Number.isFinite(size) ? size : null;

  const { data: existing, error: lookupError } = await supabase
    .from("bookings")
    .select("id")
    .eq("user_id", auth.user.id)
    .eq("service", payload.service)
    .eq("address", payload.address)
    .eq("preferred_date", payload.date)
    .eq("size_sqm", sizeSqm)
    .eq("frequency", payload.frequency)
    .eq("time_window", payload.timeWindow)
    .eq("customer_email", payload.email)
    .neq("status", "cancelled")
    .limit(1)
    .maybeSingle();

  if (lookupError) throw new Error(`Kunde inte kontrollera tidigare bokning: ${lookupError.message}`);
  if (existing?.id) return { id: existing.id as string, duplicate: true };

  const { data, error } = await supabase.from("bookings").insert({
    user_id: auth.user.id,
    service: payload.service,
    area: payload.area,
    address: payload.address || null,
    size_sqm: sizeSqm,
    frequency: payload.frequency,
    preferred_date: payload.date,
    time_window: payload.timeWindow,
    customer_name: payload.name,
    customer_email: payload.email,
    customer_phone: payload.phone || null,
    notes: payload.notes || null,
    status: "new"
  }).select("id").single();

  if (error) {
    if (isUniqueDuplicateError(error)) throw new DuplicateBookingError();
    throw new Error(`Kunde inte spara bokningen i databasen: ${error.message}`);
  }
  return { id: data.id as string, duplicate: false };
}

async function sendEmail(params: { apiKey: string; from: string; to: string; replyTo?: string; subject: string; text: string }) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 6000);

  try {
    return await fetch("https://api.resend.com/emails", {
      method: "POST",
      signal: controller.signal,
      headers: { Authorization: `Bearer ${params.apiKey}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        from: params.from,
        to: [params.to],
        reply_to: params.replyTo,
        subject: params.subject,
        text: params.text
      })
    });
  } finally {
    clearTimeout(timeout);
  }
}

export async function POST(request: Request) {
  try {
    const auth = await getAuthContext(request);
    if (!auth) {
      return NextResponse.json({ ok: false, message: "Du behöver logga in för att skicka en bokningsförfrågan." }, { status: 401 });
    }

    const json = (await request.json()) as BookingPayload;
    const payload = {
      service: sanitize(json.service),
      area: sanitize(json.area),
      address: sanitize(json.address),
      size: sanitize(json.size),
      frequency: sanitize(json.frequency || "Engång"),
      date: sanitize(json.date),
      timeWindow: sanitize(json.timeWindow || "Flexibel"),
      name: sanitize(json.name),
      email: sanitize(json.email),
      phone: sanitize(json.phone),
      notes: sanitize(json.notes)
    } satisfies Required<BookingPayload>;

    const missing = required.filter((key) => !payload[key]);
    if (missing.length) {
      return NextResponse.json({ ok: false, message: `Missing required fields: ${missing.join(", ")}` }, { status: 400 });
    }

    if (!/^\S+@\S+\.\S+$/.test(payload.email)) {
      return NextResponse.json({ ok: false, message: "Invalid email address." }, { status: 400 });
    }

    if (auth.user.email && payload.email.toLowerCase() !== auth.user.email.toLowerCase()) {
      return NextResponse.json({ ok: false, message: "Bokningens e-post måste matcha ditt inloggade konto." }, { status: 403 });
    }

    const booking = await saveBooking(payload, auth);

    if (booking.duplicate) {
      return NextResponse.json({ ok: false, duplicate: true, bookingId: booking.id, message: "Den här bokningen finns redan. Ändra datum, tid eller uppgifter om du vill skapa en ny bokning." }, { status: 409 });
    }

    const resendApiKey = process.env.RESEND_API_KEY;
    const toEmail = process.env.BOOKING_TO_EMAIL || "hej@iboren.se";
    const fromEmail = process.env.BOOKING_FROM_EMAIL || "Iboren <onboarding@resend.dev>";
    const adminText = buildAdminText(payload, auth.user, booking.id);
    const customerText = buildCustomerText(payload, booking.id);

    if (resendApiKey) {
      let adminOk = false;

      try {
        const adminResponse = await sendEmail({
          apiKey: resendApiKey,
          from: fromEmail,
          to: toEmail,
          replyTo: payload.email,
          subject: `New Iboren booking: ${payload.service} · ${payload.area}`,
          text: adminText
        });
        adminOk = adminResponse.ok;
      } catch (error) {
        console.error("IBOREN_ADMIN_EMAIL_FAILED", { bookingId: booking.id, error });
      }

      sendEmail({
        apiKey: resendApiKey,
        from: fromEmail,
        to: payload.email,
        replyTo: toEmail,
        subject: `Iboren har tagit emot din bokning · ${payload.service}`,
        text: customerText
      }).catch((error) => console.error("IBOREN_CUSTOMER_EMAIL_FAILED", { bookingId: booking.id, error }));

      return NextResponse.json({
        ok: true,
        bookingId: booking.id,
        message: adminOk
          ? "Tack! Din bokningsförfrågan är sparad. Iboren återkommer så snart som möjligt."
          : "Bokningen är sparad. Om bekräftelsemejl saknas följer Iboren upp förfrågan."
      }, { status: adminOk ? 200 : 202 });
    }

    console.info("IBOREN_BOOKING_REQUEST", adminText);
    return NextResponse.json({ ok: true, bookingId: booking.id, message: "Bokningen är sparad. Demo-läge: lägg till RESEND_API_KEY i Vercel för riktig e-post." });
  } catch (error) {
    if (error instanceof DuplicateBookingError) {
      return NextResponse.json({ ok: false, duplicate: true, message: error.message }, { status: 409 });
    }
    return NextResponse.json({ ok: false, message: error instanceof Error ? error.message : "Invalid request." }, { status: 400 });
  }
}
