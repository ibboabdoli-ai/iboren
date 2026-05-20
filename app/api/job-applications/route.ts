import { NextResponse } from "next/server";

export const runtime = "nodejs";

const MAX_CV_SIZE_BYTES = 5 * 1024 * 1024;
const allowedCvTypes = new Set([
  "application/pdf",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "text/plain"
]);
const allowedCvExtensions = new Set(["pdf", "doc", "docx", "txt"]);

type EmailParams = {
  apiKey: string;
  from: string;
  to: string;
  replyTo?: string;
  subject: string;
  text: string;
  attachments?: Array<{ filename: string; content: string }>;
};

function clean(value: unknown, maxLength = 1600) {
  return String(value ?? "").replace(/[<>]/g, "").trim().slice(0, maxLength);
}

function validEmail(value: string) {
  return /^\S+@\S+\.\S+$/.test(value);
}

function getString(formData: FormData, key: string) {
  const value = formData.get(key);
  return typeof value === "string" ? value : "";
}

function getCvFile(formData: FormData) {
  const value = formData.get("cv");
  if (!(value instanceof File) || !value.name || value.size === 0) return null;
  return value;
}

function getFileExtension(fileName: string) {
  return fileName.split(".").pop()?.toLowerCase() || "";
}

async function buildAttachment(file: File) {
  const arrayBuffer = await file.arrayBuffer();
  return {
    filename: clean(file.name, 180) || "cv",
    content: Buffer.from(arrayBuffer).toString("base64")
  };
}

async function sendEmail(params: EmailParams) {
  return fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: { Authorization: `Bearer ${params.apiKey}`, "Content-Type": "application/json" },
    body: JSON.stringify({
      from: params.from,
      to: [params.to],
      reply_to: params.replyTo,
      subject: params.subject,
      text: params.text,
      ...(params.attachments?.length ? { attachments: params.attachments } : {})
    })
  });
}

export async function POST(request: Request) {
  const formData = await request.formData().catch(() => null);
  if (!formData) return NextResponse.json({ ok: false, message: "Ogiltig ansökan." }, { status: 400 });

  const name = clean(getString(formData, "name"));
  const email = clean(getString(formData, "email")).toLowerCase();
  const phone = clean(getString(formData, "phone"));
  const area = clean(getString(formData, "area"));
  const experience = clean(getString(formData, "experience"));
  const availability = clean(getString(formData, "availability"));
  const drivingLicense = clean(getString(formData, "drivingLicense"));
  const hasCar = clean(getString(formData, "hasCar"));
  const canWorkSodertalje = clean(getString(formData, "canWorkSodertalje"));
  const canWorkStockholm = clean(getString(formData, "canWorkStockholm"));
  const availableDays = clean(getString(formData, "availableDays"));
  const availableTimes = clean(getString(formData, "availableTimes"));
  const languages = clean(getString(formData, "languages"));
  const resume = clean(getString(formData, "resume"), 2000);
  const message = clean(getString(formData, "message"), 3000);
  const cv = getCvFile(formData);

  if (!name || !validEmail(email) || !phone || !area) {
    return NextResponse.json({ ok: false, message: "Fyll i namn, e-post, telefon och område." }, { status: 400 });
  }

  if (cv && cv.size > MAX_CV_SIZE_BYTES) {
    return NextResponse.json({ ok: false, message: "CV-filen är för stor. Max 5 MB." }, { status: 400 });
  }

  if (cv) {
    const extension = getFileExtension(cv.name);
    if (!allowedCvExtensions.has(extension) || (cv.type && !allowedCvTypes.has(cv.type))) {
      return NextResponse.json({ ok: false, message: "CV måste vara PDF, DOC, DOCX eller TXT." }, { status: 400 });
    }
  }

  const resendApiKey = process.env.RESEND_API_KEY;
  const fromEmail = process.env.BOOKING_FROM_EMAIL || "Iboren <onboarding@resend.dev>";
  const toEmail = process.env.CAREER_TO_EMAIL || process.env.BOOKING_TO_EMAIL || "ibbo.abdoli@gmail.com";

  if (!resendApiKey) {
    return NextResponse.json({ ok: false, message: "E-post är inte konfigurerad." }, { status: 500 });
  }

  const adminText = [
    "New job application for Iboren",
    "",
    `Name: ${name}`,
    `Email: ${email}`,
    `Phone: ${phone}`,
    `Area: ${area}`,
    `Experience: ${experience || "Ej angivet"}`,
    `Availability: ${availability || "Ej angivet"}`,
    `Driving license: ${drivingLicense || "Ej angivet"}`,
    `Access to car: ${hasCar || "Ej angivet"}`,
    `Can work in Södertälje: ${canWorkSodertalje || "Ej angivet"}`,
    `Can work in Stockholm: ${canWorkStockholm || "Ej angivet"}`,
    `Available days: ${availableDays || "Ej angivet"}`,
    `Available times: ${availableTimes || "Ej angivet"}`,
    `Languages: ${languages || "Ej angivet"}`,
    `Resume/profile link: ${resume || "Ej angivet"}`,
    `CV uploaded: ${cv ? `${cv.name} (${Math.round(cv.size / 1024)} KB)` : "Nej"}`,
    "",
    "Message:",
    message || "Ej angivet"
  ].join("\n");

  const applicantText = [
    `Hej ${name},`,
    "",
    "Tack för din intresseanmälan till Iboren.",
    "Vi har tagit emot din ansökan och återkommer om din profil matchar våra kommande uppdrag i Södertälje eller Stockholm.",
    "",
    "Sammanfattning:",
    `Namn: ${name}`,
    `Telefon: ${phone}`,
    `Stad/område: ${area}`,
    `Erfarenhet: ${experience || "Ej angivet"}`,
    `Tillgänglighet: ${availability || "Ej angivet"}`,
    `Körkort: ${drivingLicense || "Ej angivet"}`,
    `Tillgång till bil: ${hasCar || "Ej angivet"}`,
    "",
    "Vänliga hälsningar,",
    "Iboren"
  ].join("\n");

  const attachments = cv ? [await buildAttachment(cv)] : [];

  const adminEmail = sendEmail({
    apiKey: resendApiKey,
    from: fromEmail,
    to: toEmail,
    replyTo: email,
    subject: `Job application: ${name}`,
    text: adminText,
    attachments
  });

  const applicantEmail = sendEmail({
    apiKey: resendApiKey,
    from: fromEmail,
    to: email,
    replyTo: toEmail,
    subject: "Iboren har tagit emot din ansökan",
    text: applicantText
  });

  const results = await Promise.allSettled([adminEmail, applicantEmail]);
  const failed = results.some((result) => result.status === "rejected");
  if (failed) {
    console.error("IBOREN_JOB_APPLICATION_EMAIL_REJECTED", results);
    return NextResponse.json({ ok: false, message: "Kunde inte skicka ansökan just nu." }, { status: 500 });
  }

  const [adminResponse, applicantResponse] = results.map((result) => result.status === "fulfilled" ? result.value : null);
  if (!adminResponse?.ok || !applicantResponse?.ok) {
    const adminError = adminResponse ? await adminResponse.text().catch(() => "") : "";
    const applicantError = applicantResponse ? await applicantResponse.text().catch(() => "") : "";
    console.error("IBOREN_JOB_APPLICATION_EMAIL_FAILED", { adminError, applicantError });
    return NextResponse.json({ ok: false, message: "Kunde inte skicka ansökan just nu." }, { status: 500 });
  }

  return NextResponse.json({ ok: true, message: "Tack! Din ansökan är skickad. En bekräftelse har skickats till din e-post." });
}
