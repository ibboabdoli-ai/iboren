import { NextResponse } from "next/server";

export const runtime = "nodejs";

type JobApplicationBody = {
  name?: string;
  email?: string;
  phone?: string;
  area?: string;
  experience?: string;
  availability?: string;
  languages?: string;
  resume?: string;
  message?: string;
};

function clean(value: unknown) {
  return String(value ?? "").replace(/[<>]/g, "").trim().slice(0, 1600);
}

function validEmail(value: string) {
  return /^\S+@\S+\.\S+$/.test(value);
}

export async function POST(request: Request) {
  const body = await request.json().catch(() => null) as JobApplicationBody | null;
  if (!body) return NextResponse.json({ ok: false, message: "Ogiltig ansökan." }, { status: 400 });

  const name = clean(body.name);
  const email = clean(body.email).toLowerCase();
  const phone = clean(body.phone);
  const area = clean(body.area);
  const experience = clean(body.experience);
  const availability = clean(body.availability);
  const languages = clean(body.languages);
  const resume = clean(body.resume);
  const message = clean(body.message);

  if (!name || !validEmail(email) || !phone || !area) {
    return NextResponse.json({ ok: false, message: "Fyll i namn, e-post, telefon och område." }, { status: 400 });
  }

  const resendApiKey = process.env.RESEND_API_KEY;
  const fromEmail = process.env.BOOKING_FROM_EMAIL || "Iboren <onboarding@resend.dev>";
  const toEmail = process.env.BOOKING_TO_EMAIL || "hej@iboren.se";

  if (!resendApiKey) {
    return NextResponse.json({ ok: false, message: "E-post är inte konfigurerad." }, { status: 500 });
  }

  const text = [
    "New job application for Iboren",
    "",
    `Name: ${name}`,
    `Email: ${email}`,
    `Phone: ${phone}`,
    `Area: ${area}`,
    `Experience: ${experience || "Ej angivet"}`,
    `Availability: ${availability || "Ej angivet"}`,
    `Languages: ${languages || "Ej angivet"}`,
    `Resume/profile: ${resume || "Ej angivet"}`,
    "",
    "Message:",
    message || "Ej angivet"
  ].join("\n");

  const response = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: { Authorization: `Bearer ${resendApiKey}`, "Content-Type": "application/json" },
    body: JSON.stringify({ from: fromEmail, to: [toEmail], reply_to: email, subject: `Job application: ${name}`, text })
  });

  if (!response.ok) return NextResponse.json({ ok: false, message: "Kunde inte skicka ansökan just nu." }, { status: 500 });
  return NextResponse.json({ ok: true, message: "Tack! Din ansökan är skickad." });
}
