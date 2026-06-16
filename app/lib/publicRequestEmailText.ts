import { displayArea, greetingName, publicRequestSnapshotLines } from "./publicRequestEmailSnapshot";

type Language = "sv" | "en";

type PublicEmailPayload = {
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
  "Var fjärde vecka": "Every month",
  Morgon: "Morning",
  Förmiddag: "Late morning",
  Eftermiddag: "Afternoon",
  Kväll: "Evening",
  Flexibel: "Flexible",
  Privatperson: "Private customer",
  Företag: "Company"
};

function english(value: string) {
  return englishLabels[value] || value;
}

function adminRutText(payload: PublicEmailPayload, language: Language) {
  if (language === "en") {
    if (payload.customerType !== "Privatperson") return "RUT: Not applicable for company requests.";
    if (payload.service === "Kontorsstädning" || payload.service === "Office cleaning") return "RUT: No. Office cleaning is handled as a business price or quote.";
    return payload.rutRequested ? "RUT: Yes. The customer has requested RUT deduction according to Skatteverket rules. If RUT is not approved, the remaining amount may be invoiced." : "RUT: No. The customer has not requested RUT deduction.";
  }

  if (payload.customerType !== "Privatperson") return "RUT: Gäller inte för företagsförfrågningar.";
  if (payload.service === "Kontorsstädning" || payload.service === "Office cleaning") return "RUT: Nej. Kontorsstädning hanteras som företagspris/offert.";
  return payload.rutRequested ? "RUT: Ja. Kunden har valt RUT och intygar att villkoren hos Skatteverket uppfylls. Om RUT inte godkänns kan resterande belopp faktureras." : "RUT: Nej. Kunden har inte valt RUT-avdrag.";
}

function customerRutText(payload: PublicEmailPayload, language: Language) {
  if (language === "en") {
    if (payload.customerType !== "Privatperson") return "RUT: Not applicable for company requests.";
    if (payload.service === "Kontorsstädning" || payload.service === "Office cleaning") return "RUT: No. Office cleaning is handled as a business price or quote.";
    return payload.rutRequested ? "RUT: Yes. You have requested RUT deduction according to Skatteverket rules. If RUT is not approved, the remaining amount may be invoiced." : "RUT: No. You have not requested RUT deduction.";
  }

  if (payload.customerType !== "Privatperson") return "RUT: Gäller inte för företagsförfrågningar.";
  if (payload.service === "Kontorsstädning" || payload.service === "Office cleaning") return "RUT: Nej. Kontorsstädning hanteras som företagspris/offert.";
  return payload.rutRequested ? "RUT: Ja. Du har valt RUT enligt Skatteverkets regler. Om RUT inte godkänns kan resterande belopp faktureras." : "RUT: Nej. Du har inte valt RUT-avdrag.";
}

function requestReferenceLines(id: string, language: Language, bookingNumber?: string | null, includeReceivedStatus = true) {
  if (language === "en") {
    return [
      `Request ID: ${id}`,
      bookingNumber ? `Booking number: ${bookingNumber}` : null,
      includeReceivedStatus ? "Status: Request received" : null
    ].filter(Boolean) as string[];
  }

  return [
    `Förfrågnings-ID: ${id}`,
    bookingNumber ? `Bokningsnummer: ${bookingNumber}` : null,
    includeReceivedStatus ? "Status: Förfrågan mottagen" : null
  ].filter(Boolean) as string[];
}

function escapeHtml(value: unknown) {
  return String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function summaryRow(label: string, value: string) {
  return `
    <tr>
      <td style="padding:12px 0;border-bottom:1px solid #e3ebe5;color:#5e6b64;font-size:14px;line-height:20px;vertical-align:top;width:38%;">${escapeHtml(label)}</td>
      <td style="padding:12px 0;border-bottom:1px solid #e3ebe5;color:#173b2d;font-size:15px;line-height:22px;font-weight:600;vertical-align:top;">${escapeHtml(value || "-")}</td>
    </tr>`;
}

function snapshotHtml(lines: string[]) {
  const cleanLines = lines.map((line) => line.trim()).filter(Boolean);
  if (!cleanLines.length) return "";

  return `
    <div style="margin:24px 0 0 0;padding:18px 20px;background:#f4f8f5;border:1px solid #dce8df;border-radius:18px;">
      ${cleanLines
        .map((line) => {
          const isHeading = line.endsWith(":");
          return `<p style="margin:${isHeading ? "14px 0 6px 0" : "0 0 6px 0"};color:${isHeading ? "#173b2d" : "#33443b"};font-size:${isHeading ? "15px" : "14px"};line-height:21px;font-weight:${isHeading ? "700" : "400"};">${escapeHtml(line)}</p>`;
        })
        .join("")}
    </div>`;
}

export function buildPublicRequestAdminEmail(payload: PublicEmailPayload, id: string, language: Language, saved: boolean, bookingNumber?: string | null) {
  const area = displayArea(payload.area);
  const snapshot = publicRequestSnapshotLines(payload, language, { includeWarnings: true });

  if (language === "en") {
    return [
      "New Iboren public booking request",
      "",
      ...requestReferenceLines(id, "en", bookingNumber, false),
      `Saved in admin queue: ${saved ? "Yes" : "No - check Supabase public_booking_requests setup"}`,
      "Status: New / unverified / pending review",
      "Important: This is not a confirmed booking. Confirm time and price manually before it becomes binding.",
      `Customer language: ${language}`,
      "",
      `Customer type: ${english(payload.customerType)}`,
      adminRutText(payload, "en"),
      "",
      `Service: ${english(payload.service)}`,
      `Area: ${area}`,
      `Address: ${payload.address || "Not provided"}`,
      `Size: ${payload.size} sqm`,
      `Frequency: ${english(payload.frequency)}`,
      `Date: ${payload.date}`,
      `Time window: ${english(payload.timeWindow)}`,
      "",
      `Name: ${payload.name}`,
      `Email: ${payload.email}`,
      `Phone: ${payload.phone || "Not provided"}`,
      ...snapshot,
      snapshot.length ? "" : `Notes: ${payload.notes || "-"}`
    ].join("\n");
  }

  return [
    "Ny publik bokningsförfrågan till Iboren",
    "",
    ...requestReferenceLines(id, "sv", bookingNumber, false),
    `Sparad i admin-kö: ${saved ? "Ja" : "Nej - kontrollera Supabase public_booking_requests"}`,
    "Status: Ny / overifierad / behöver granskas",
    "Viktigt: Detta är inte en bekräftad bokning. Bekräfta tid och pris manuellt innan den blir bindande.",
    `Kundspråk: ${language}`,
    "",
    `Kundtyp: ${payload.customerType}`,
    adminRutText(payload, "sv"),
    "",
    `Tjänst: ${payload.service}`,
    `Område: ${area}`,
    `Adress: ${payload.address || "Ej angivet"}`,
    `Storlek: ${payload.size} kvm`,
    `Frekvens: ${payload.frequency}`,
    `Datum: ${payload.date}`,
    `Tid: ${payload.timeWindow}`,
    "",
    `Namn: ${payload.name}`,
    `E-post: ${payload.email}`,
    `Telefon: ${payload.phone || "Ej angivet"}`,
    ...snapshot,
    snapshot.length ? "" : `Anteckningar: ${payload.notes || "-"}`
  ].join("\n");
}

export function buildPublicRequestCustomerEmail(payload: PublicEmailPayload, id: string, language: Language, bookingNumber?: string | null) {
  const area = displayArea(payload.area);
  const snapshot = publicRequestSnapshotLines(payload, language, { includeWarnings: false });

  if (language === "en") {
    return [
      `Hi${greetingName(payload.name)},`,
      "",
      "Thank you. Iboren has received your cleaning request.",
      "We always confirm time and price before the booking becomes binding.",
      "",
      "Your summary:",
      ...requestReferenceLines(id, "en", bookingNumber),
      `Service: ${english(payload.service)}`,
      `Area: ${area}`,
      `Address: ${payload.address}`,
      `Size: ${payload.size} sqm`,
      `Frequency: ${english(payload.frequency)}`,
      `Date: ${payload.date}`,
      `Time: ${english(payload.timeWindow)}`,
      `Customer type: ${english(payload.customerType)}`,
      customerRutText(payload, "en"),
      ...snapshot,
      "",
      "Note: The price is an estimate. Iboren always confirms final price and time before the booking becomes binding.",
      "",
      "If anything is incorrect, you can reply to this email or contact us at hej@iboren.se.",
      "",
      "Best regards,",
      "Iboren"
    ].join("\n");
  }

  return [
    `Hej${greetingName(payload.name)},`,
    "",
    "Tack. Iboren har tagit emot din städförfrågan.",
    "Vi bekräftar alltid tid och pris innan bokningen blir bindande.",
    "",
    "Din sammanfattning:",
    ...requestReferenceLines(id, "sv", bookingNumber),
    `Tjänst: ${payload.service}`,
    `Område: ${area}`,
    `Adress: ${payload.address}`,
    `Storlek: ${payload.size} kvm`,
    `Frekvens: ${payload.frequency}`,
    `Datum: ${payload.date}`,
    `Tid: ${payload.timeWindow}`,
    `Kundtyp: ${payload.customerType}`,
    customerRutText(payload, "sv"),
    ...snapshot,
    "",
    "OBS: Priset är en uppskattning. Iboren bekräftar alltid slutligt pris och tid innan bokningen blir bindande.",
    "",
    "Om något inte stämmer kan du svara på det här mejlet eller kontakta oss på hej@iboren.se.",
    "",
    "Vänliga hälsningar,",
    "Iboren"
  ].join("\n");
}

export function buildPublicRequestCustomerEmailHtml(payload: PublicEmailPayload, id: string, language: Language, bookingNumber?: string | null) {
  const area = displayArea(payload.area);
  const snapshot = publicRequestSnapshotLines(payload, language, { includeWarnings: false });
  const service = language === "en" ? english(payload.service) : payload.service;
  const frequency = language === "en" ? english(payload.frequency) : payload.frequency;
  const timeWindow = language === "en" ? english(payload.timeWindow) : payload.timeWindow;
  const customerType = language === "en" ? english(payload.customerType) : payload.customerType;
  const rutText = customerRutText(payload, language);
  const rows: Array<[string, string]> = [];

  if (language === "en") {
    rows.push(
      ["Request ID", id],
      ...(bookingNumber ? [["Booking number", bookingNumber] as [string, string]] : []),
      ["Status", "Request received"],
      ["Service", service],
      ["Area", area],
      ["Address", payload.address],
      ["Size", `${payload.size} sqm`],
      ["Frequency", frequency],
      ["Date", payload.date],
      ["Time", timeWindow],
      ["Customer type", customerType],
      ["RUT", rutText.replace(/^RUT:\s*/i, "")]
    );

    return `<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width,initial-scale=1">
    <meta name="x-apple-disable-message-reformatting">
    <title>Iboren has received your cleaning request</title>
  </head>
  <body style="margin:0;padding:0;background:#eef3ef;font-family:Arial,Helvetica,sans-serif;">
    <div style="display:none;max-height:0;overflow:hidden;opacity:0;color:transparent;">Iboren has received your cleaning request. We always confirm time and price before the booking becomes binding.</div>
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#eef3ef;">
      <tr>
        <td align="center" style="padding:24px 12px;">
          <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:640px;background:#ffffff;border-radius:24px;overflow:hidden;border:1px solid #dbe7df;">
            <tr>
              <td style="padding:34px 28px;background:#dfeae2;text-align:center;">
                <div style="font-size:34px;line-height:38px;font-weight:800;letter-spacing:0.08em;color:#12372a;">IBOREN</div>
                <div style="margin-top:8px;font-size:13px;line-height:18px;font-weight:700;letter-spacing:0.14em;color:#456255;text-transform:uppercase;">Cleaning in Södertälje & Stockholm</div>
              </td>
            </tr>
            <tr>
              <td style="padding:34px 28px 28px 28px;">
                <h1 style="margin:0 0 14px 0;color:#12372a;font-size:30px;line-height:36px;">Hi${escapeHtml(greetingName(payload.name))},</h1>
                <p style="margin:0 0 16px 0;color:#26362f;font-size:17px;line-height:26px;">Thank you. Iboren has received your cleaning request.</p>
                <p style="margin:0 0 22px 0;color:#47584f;font-size:15px;line-height:24px;">We always confirm time and price before the booking becomes binding.</p>

                <div style="padding:16px 18px;background:#f7faf7;border-left:4px solid #12372a;border-radius:14px;margin:0 0 24px 0;">
                  <p style="margin:0;color:#173b2d;font-size:15px;line-height:23px;font-weight:700;">Next step</p>
                  <p style="margin:6px 0 0 0;color:#33443b;font-size:15px;line-height:23px;">We review your request and contact you with final price and available time.</p>
                </div>

                <h2 style="margin:0 0 12px 0;color:#12372a;font-size:21px;line-height:28px;">Your summary</h2>
                <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="border-collapse:collapse;">
                  ${rows.map(([label, value]) => summaryRow(label, value)).join("")}
                </table>

                ${snapshotHtml(snapshot)}

                <div style="margin:28px 0 0 0;text-align:center;">
                  <a href="mailto:hej@iboren.se" style="display:inline-block;background:#12372a;color:#ffffff;text-decoration:none;border-radius:999px;padding:14px 24px;font-size:15px;line-height:20px;font-weight:700;">Contact Iboren</a>
                </div>

                <p style="margin:24px 0 0 0;color:#5e6b64;font-size:13px;line-height:20px;">If anything is incorrect, you can reply to this email or contact us at hej@iboren.se.</p>
              </td>
            </tr>
            <tr>
              <td style="padding:24px 28px;background:#dfeae2;text-align:center;">
                <p style="margin:0;color:#12372a;font-size:15px;line-height:22px;font-weight:700;">Iboren</p>
                <p style="margin:6px 0 0 0;color:#456255;font-size:13px;line-height:20px;">Cleaning services in Södertälje and Stockholm</p>
                <p style="margin:10px 0 0 0;color:#456255;font-size:13px;line-height:20px;">hej@iboren.se · iboren.se</p>
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  </body>
</html>`;
  }

  rows.push(
    ["Förfrågnings-ID", id],
    ...(bookingNumber ? [["Bokningsnummer", bookingNumber] as [string, string]] : []),
    ["Status", "Förfrågan mottagen"],
    ["Tjänst", service],
    ["Område", area],
    ["Adress", payload.address],
    ["Storlek", `${payload.size} kvm`],
    ["Frekvens", frequency],
    ["Datum", payload.date],
    ["Tid", timeWindow],
    ["Kundtyp", customerType],
    ["RUT", rutText.replace(/^RUT:\s*/i, "")]
  );

  return `<!doctype html>
<html lang="sv">
  <head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width,initial-scale=1">
    <meta name="x-apple-disable-message-reformatting">
    <title>Iboren har tagit emot din städförfrågan</title>
  </head>
  <body style="margin:0;padding:0;background:#eef3ef;font-family:Arial,Helvetica,sans-serif;">
    <div style="display:none;max-height:0;overflow:hidden;opacity:0;color:transparent;">Iboren har tagit emot din städförfrågan. Vi bekräftar alltid tid och pris innan bokningen blir bindande.</div>
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#eef3ef;">
      <tr>
        <td align="center" style="padding:24px 12px;">
          <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:640px;background:#ffffff;border-radius:24px;overflow:hidden;border:1px solid #dbe7df;">
            <tr>
              <td style="padding:34px 28px;background:#dfeae2;text-align:center;">
                <div style="font-size:34px;line-height:38px;font-weight:800;letter-spacing:0.08em;color:#12372a;">IBOREN</div>
                <div style="margin-top:8px;font-size:13px;line-height:18px;font-weight:700;letter-spacing:0.14em;color:#456255;text-transform:uppercase;">Städning i Södertälje & Stockholm</div>
              </td>
            </tr>
            <tr>
              <td style="padding:34px 28px 28px 28px;">
                <h1 style="margin:0 0 14px 0;color:#12372a;font-size:30px;line-height:36px;">Hej${escapeHtml(greetingName(payload.name))},</h1>
                <p style="margin:0 0 16px 0;color:#26362f;font-size:17px;line-height:26px;">Tack. Iboren har tagit emot din städförfrågan.</p>
                <p style="margin:0 0 22px 0;color:#47584f;font-size:15px;line-height:24px;">Vi bekräftar alltid tid och pris innan bokningen blir bindande.</p>

                <div style="padding:16px 18px;background:#f7faf7;border-left:4px solid #12372a;border-radius:14px;margin:0 0 24px 0;">
                  <p style="margin:0;color:#173b2d;font-size:15px;line-height:23px;font-weight:700;">Nästa steg</p>
                  <p style="margin:6px 0 0 0;color:#33443b;font-size:15px;line-height:23px;">Vi granskar din förfrågan och återkommer med slutligt pris och möjlig tid.</p>
                </div>

                <h2 style="margin:0 0 12px 0;color:#12372a;font-size:21px;line-height:28px;">Din sammanfattning</h2>
                <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="border-collapse:collapse;">
                  ${rows.map(([label, value]) => summaryRow(label, value)).join("")}
                </table>

                ${snapshotHtml(snapshot)}

                <div style="margin:28px 0 0 0;text-align:center;">
                  <a href="mailto:hej@iboren.se" style="display:inline-block;background:#12372a;color:#ffffff;text-decoration:none;border-radius:999px;padding:14px 24px;font-size:15px;line-height:20px;font-weight:700;">Kontakta Iboren</a>
                </div>

                <p style="margin:24px 0 0 0;color:#5e6b64;font-size:13px;line-height:20px;">Om något inte stämmer kan du svara på det här mejlet eller kontakta oss på hej@iboren.se.</p>
              </td>
            </tr>
            <tr>
              <td style="padding:24px 28px;background:#dfeae2;text-align:center;">
                <p style="margin:0;color:#12372a;font-size:15px;line-height:22px;font-weight:700;">Iboren</p>
                <p style="margin:6px 0 0 0;color:#456255;font-size:13px;line-height:20px;">Städtjänster i Södertälje och Stockholm</p>
                <p style="margin:10px 0 0 0;color:#456255;font-size:13px;line-height:20px;">hej@iboren.se · iboren.se</p>
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  </body>
</html>`;
}
