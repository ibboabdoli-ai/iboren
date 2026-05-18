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

const required: Array<keyof BookingPayload> = ["service", "area", "address", "size", "date", "name", "email", "phone"];

function sanitize(value: unknown) {
  return String(value ?? "").replace(/[<>]/g, "").trim().slice(0, 3000);
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

function buildText(payload: Required<BookingPayload>, user: User) {
  return [
    "New Iboren booking request",
    "",
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

async function saveBooking(payload: Required<BookingPayload>, auth: AuthContext) {
  const supabase = getSupabase(auth.token);
  if (!supabase) throw new Error("Supabase saknas.");

  const size = Number.parseInt(payload.size, 10);
  const sizeSqm = Number.isFinite(size) ? size : null;

  const { data: existing, error: lookupError } = await supabase
    .from("bookings")
    .select("id")
    .eq("user_id", auth.user.id)
    .eq("service", payload.service)
    .eq("address", payload.address || "")
    .eq("preferred_date", payload.date)
    .eq("customer_email", payload.email)
    .limit(1)
    .maybeSingle();

  if (lookupError) throw new Error(`Kunde inte kontrollera tidigare bokning: ${lookupError.message}`);
  if (existing?.id) return existing.id as string;

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

  if (error) throw new Error(`Kunde inte spara bokningen i databasen: ${error.message}`);
  return data.id as string;
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

    const bookingId = await saveBooking(payload, auth);

    const resendApiKey = process.env.RESEND_API_KEY;
    const toEmail = process.env.BOOKING_TO_EMAIL || "hej@iboren.se";
    const fromEmail = process.env.BOOKING_FROM_EMAIL || "Iboren <onboarding@resend.dev>";
    const bookingText = `${buildText(payload, auth.user)}\n\nBooking ID: ${bookingId}`;

    if (resendApiKey) {
      const response = await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: { Authorization: `Bearer ${resendApiKey}`, "Content-Type": "application/json" },
        body: JSON.stringify({
          from: fromEmail,
          to: [toEmail],
          reply_to: payload.email,
          subject: `New Iboren booking: ${payload.service} · ${payload.area}`,
          text: bookingText
        })
      });

      if (!response.ok) {
        return NextResponse.json({ ok: true, message: "Bokningen är sparad, men e-post kunde inte skickas. Kontrollera Resend-inställningar." }, { status: 202 });
      }
      return NextResponse.json({ ok: true, message: "Tack! Din bokningsförfrågan är sparad och skickad till Iboren." });
    }

    console.info("IBOREN_BOOKING_REQUEST", bookingText);
    return NextResponse.json({ ok: true, message: "Bokningen är sparad. Demo-läge: lägg till RESEND_API_KEY i Vercel för riktig e-post." });
  } catch (error) {
    return NextResponse.json({ ok: false, message: error instanceof Error ? error.message : "Invalid request." }, { status: 400 });
  }
}
