import { NextResponse } from "next/server";

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

const required: Array<keyof BookingPayload> = ["service", "area", "size", "date", "name", "email"];

function sanitize(value: unknown) {
  return String(value ?? "").replace(/[<>]/g, "").trim().slice(0, 1000);
}

function buildText(payload: Required<BookingPayload>) {
  return [
    "New Iboren booking request",
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

    const resendApiKey = process.env.RESEND_API_KEY;
    const toEmail = process.env.BOOKING_TO_EMAIL || "hej@iboren.se";
    const fromEmail = process.env.BOOKING_FROM_EMAIL || "Iboren <onboarding@resend.dev>";
    const bookingText = buildText(payload);

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
