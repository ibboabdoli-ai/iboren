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

function requestReferenceLines(id: string, language: Language, bookingNumber?: string | null) {
  if (language === "en") {
    return [
      `Request ID: ${id}`,
      bookingNumber ? `Booking number: ${bookingNumber}` : null,
      "Status: Request received"
    ].filter(Boolean) as string[];
  }

  return [
    `Förfrågnings-ID: ${id}`,
    bookingNumber ? `Bokningsnummer: ${bookingNumber}` : null,
    "Status: Förfrågan mottagen"
  ].filter(Boolean) as string[];
}

export function buildPublicRequestAdminEmail(payload: PublicEmailPayload, id: string, language: Language, saved: boolean, bookingNumber?: string | null) {
  const area = displayArea(payload.area);
  const snapshot = publicRequestSnapshotLines(payload, language);

  if (language === "en") {
    return [
      "New Iboren public booking request",
      "",
      ...requestReferenceLines(id, "en", bookingNumber),
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
    ...requestReferenceLines(id, "sv", bookingNumber),
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
  const snapshot = publicRequestSnapshotLines(payload, language);

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
