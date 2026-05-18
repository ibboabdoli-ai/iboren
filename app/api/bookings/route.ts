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

const required: Array<keyof BookingPayload> = ["service", "area", "address", "size", "date", "name", "email", "phone"];

function sanitize(value: unknown) {
  return String(value ?? "").replace(/[<>]/g, "").trim().slice(0, 1000);
}

function getSupabase() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !key) return null;
  return createClient(url, key, {
    auth: {
      persistSession: false,
      autoRefreshToken: false
    }
  });
}

async function getAuthenticatedUser(request: Request): Promise<User | null> {
  const authHeader = request.headers.get("authorization") || "";
  const token = authHeader.toLowerCase().startsWith("bearer ") ? authHeader.slice(7).trim() : "";
  if (!token) return null;

  const supabase = getSupabase();
  if (!supabase) return null;

  const { data, error } = await supabase.auth.getUser(token);
  if (error || !data.user) return null;
  return data.user;
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

export async function POST(request: Request) {
  try {
    const user = await getAuthenticatedUser(request);
    if (!user) {
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

    if (user.email && payload.email.toLowerCase() !== user.email.toLowerCase()) {
      return NextResponse.json({ ok: false, message: "Bokningens e-post måste matcha ditt inloggade konto." }, { status: 403 });
    }

    const resendApiKey = process.env.RESEND_API_KEY;
    const toEmail = process.env.BOOKING_TO_EMAIL || "hej@iboren.se";
    const fromEmail = process.env.BOOKING_FROM_EMAIL || "Iboren <onboarding@resend.dev>";
    const bookingText = buildText(payload, user);

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
        return NextResponse.json({ ok: false, message: "Booking received, but email delivery failed. Check Resend settings." }, { status: 502 });
      }
      return NextResponse.json({ ok: true, message: "Tack! Din bokningsförfrågan har skickats till Iboren." });
    }

    console.info("IBOREN_BOOKING_REQUEST", bookingText);
    return NextResponse.json({ ok: true, message: "Demo-läge: bokningen validerades. Lägg till RESEND_API_KEY i Vercel för riktig e-post." });
  } catch {
    return NextResponse.json({ ok: false, message: "Invalid request." }, { status: 400 });
  }
}
