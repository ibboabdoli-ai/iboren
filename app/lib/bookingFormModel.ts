import {
  estimatePrice,
  formatSek,
  normalizePricingAddOn,
  normalizePricingFrequency,
  normalizePricingService,
  normalizePricingYesNo,
  type PricingAccess,
  type PricingAddOn,
  type PricingBalconyGlass,
  type PricingCondition,
  type PricingEstimateInput,
  type PricingFurnished,
  type PricingWindowSide,
  type PricingYesNo
} from "./pricingCalculator";

export type BookingFormLanguage = "sv" | "en";

export type BookingFormDraft = {
  service: string;
  customerType: string;
  rutRequested: boolean;
  area: string;
  postalCode: string;
  address: string;
  size: string;
  propertyType: string;
  rooms: string;
  bathrooms: string;
  pets: string;
  floor: string;
  elevator: string;
  parking: string;
  condition: string;
  access: string;
  shortNotice: string;
  weekend: string;
  extras: string[];
  windows: string;
  windowSide: string;
  balconyGlass: string;
  frequency: string;
  date: string;
  timeWindow: string;
  name: string;
  email: string;
  phone: string;
  notes: string;
  website: string;
};

export type BookingFormVisibility = {
  isOffice: boolean;
  showMoveFields: boolean;
  showWindowFields: boolean;
  showBalconyFields: boolean;
  showAddOns: boolean;
  rutEligible: boolean;
};

export type BookingFormSummaryLabels = {
  service: string;
  customerType: string;
  rut: string;
  area: string;
  postalCode: string;
  address: string;
  size: string;
  propertyType: string;
  rooms: string;
  bathrooms: string;
  pets: string;
  floor: string;
  elevator: string;
  parking: string;
  condition: string;
  access: string;
  shortNotice: string;
  weekend: string;
  extras: string;
  windows: string;
  windowSide: string;
  balconyGlass: string;
  beforeRut: string;
  afterRut: string;
  estimatedTime: string;
  yes: string;
  no: string;
  notFilled: string;
  noSelection: string;
};

export const bookingFormSummaryLabels: Record<BookingFormLanguage, BookingFormSummaryLabels> = {
  sv: {
    service: "Tjänst",
    customerType: "Kundtyp",
    rut: "RUT-avdrag",
    area: "Område / stad",
    postalCode: "Postnummer",
    address: "Adress",
    size: "Storlek kvm",
    propertyType: "Typ av objekt",
    rooms: "Antal rum",
    bathrooms: "Antal badrum",
    pets: "Husdjur",
    floor: "Våning",
    elevator: "Hiss",
    parking: "Parkering",
    condition: "Skick",
    access: "Åtkomst",
    shortNotice: "Kort varsel",
    weekend: "Helg/kväll",
    extras: "Extra tjänster",
    windows: "Antal fönster",
    windowSide: "Fönsterputs",
    balconyGlass: "Inglasad balkong",
    beforeRut: "Före RUT",
    afterRut: "Efter RUT",
    estimatedTime: "Uppskattad tid",
    yes: "Ja",
    no: "Nej",
    notFilled: "Ej ifyllt",
    noSelection: "Inga valda"
  },
  en: {
    service: "Service",
    customerType: "Customer type",
    rut: "RUT deduction",
    area: "Area / city",
    postalCode: "Postal code",
    address: "Address",
    size: "Size sqm",
    propertyType: "Property type",
    rooms: "Rooms",
    bathrooms: "Bathrooms",
    pets: "Pets",
    floor: "Floor",
    elevator: "Elevator",
    parking: "Parking",
    condition: "Condition",
    access: "Access",
    shortNotice: "Short notice",
    weekend: "Weekend/evening",
    extras: "Extra services",
    windows: "Number of windows",
    windowSide: "Window cleaning",
    balconyGlass: "Balcony glass",
    beforeRut: "Before RUT",
    afterRut: "After RUT",
    estimatedTime: "Estimated time",
    yes: "Yes",
    no: "No",
    notFilled: "Not filled in",
    noSelection: "None selected"
  }
};

export function createBookingFormDraft(language: BookingFormLanguage): BookingFormDraft {
  return {
    service: language === "sv" ? "Hemstädning" : "Home cleaning",
    customerType: language === "sv" ? "Privatperson" : "Private customer",
    rutRequested: true,
    area: "Södertälje",
    postalCode: "151 46",
    address: "",
    size: "",
    propertyType: language === "sv" ? "Lägenhet" : "Apartment",
    rooms: "",
    bathrooms: "",
    pets: language === "sv" ? "Nej" : "No",
    floor: "0",
    elevator: language === "sv" ? "Ja" : "Yes",
    parking: language === "sv" ? "Ja" : "Yes",
    condition: "Normal",
    access: "Normal",
    shortNotice: language === "sv" ? "Nej" : "No",
    weekend: language === "sv" ? "Nej" : "No",
    extras: [],
    windows: "8",
    windowSide: language === "sv" ? "Båda sidor" : "Both sides",
    balconyGlass: language === "sv" ? "Nej" : "No",
    frequency: language === "sv" ? "Engång" : "One-time",
    date: "",
    timeWindow: language === "sv" ? "Flexibel" : "Flexible",
    name: "",
    email: "",
    phone: "",
    notes: "",
    website: ""
  };
}

export function parseBookingNumber(value: string, fallback: number) {
  const parsed = Number.parseInt(value.replace(/[^0-9]/g, ""), 10);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : fallback;
}

export function isBusinessCustomer(draft: BookingFormDraft) {
  return draft.customerType === "Företag" || draft.customerType === "Company";
}

export function isOfficeBooking(draft: BookingFormDraft) {
  return draft.service === "Kontorsstädning" || draft.service === "Office cleaning" || isBusinessCustomer(draft);
}

export function normalizeBookingAddOns(extras: string[]): PricingAddOn[] {
  return extras.map(normalizePricingAddOn).filter(Boolean) as PricingAddOn[];
}

export function bookingFormVisibility(draft: BookingFormDraft): BookingFormVisibility {
  const normalizedService = normalizePricingService(draft.service);
  const normalizedAddOns = normalizeBookingAddOns(draft.extras);
  const isOffice = normalizedService === "Kontorsstädning" || isOfficeBooking(draft);
  return {
    isOffice,
    showMoveFields: normalizedService === "Flyttstädning",
    showWindowFields: normalizedService === "Fönsterputs" || normalizedAddOns.includes("Fönsterputs"),
    showBalconyFields: normalizedAddOns.includes("Balkong"),
    showAddOns: !isOffice,
    rutEligible: !isOffice && normalizedService !== "Kontorsstädning"
  };
}

export function normalizeBookingCondition(value: string): PricingCondition {
  if (value === "Dirty") return "Smutsigt";
  if (value === "Very dirty") return "Mycket smutsigt";
  if (value === "Smutsigt" || value === "Mycket smutsigt") return value;
  return "Normal";
}

export function normalizeBookingAccess(value: string): PricingAccess {
  if (value === "Difficult access" || value === "Svår åtkomst") return "Svår åtkomst";
  return "Normal";
}

export function normalizeBookingFurnished(value: string): PricingFurnished {
  if (value === "Furnished" || value === "Möblerad") return "Möblerad";
  return "Tom bostad";
}

export function normalizeBookingWindowSide(value: string): PricingWindowSide {
  if (value === "Inside only" || value === "Endast insida") return "Endast insida";
  if (value === "Outside only" || value === "Endast utsida") return "Endast utsida";
  return "Båda sidor";
}

export function normalizeBookingBalconyGlass(value: string): PricingBalconyGlass {
  if (value === "Small" || value === "Liten") return "Liten";
  if (value === "Large" || value === "Stor") return "Stor";
  return "Nej";
}

export function buildBookingPricingInput(draft: BookingFormDraft): PricingEstimateInput {
  const service = normalizePricingService(draft.service);
  const visibility = bookingFormVisibility(draft);
  return {
    service,
    sqm: parseBookingNumber(draft.size, 0),
    frequency: normalizePricingFrequency(draft.frequency),
    bathrooms: parseBookingNumber(draft.bathrooms, 1),
    rooms: parseBookingNumber(draft.rooms, 3),
    windows: parseBookingNumber(draft.windows, Math.max(8, Math.round(parseBookingNumber(draft.size, 75) / 10))),
    officeVisits: 1,
    officeToilets: parseBookingNumber(draft.bathrooms, 1),
    condition: normalizeBookingCondition(draft.condition),
    furnished: normalizeBookingFurnished(draft.propertyType),
    pets: normalizePricingYesNo(draft.pets),
    floor: parseBookingNumber(draft.floor, 0),
    elevator: normalizePricingYesNo(draft.elevator),
    parking: normalizePricingYesNo(draft.parking),
    access: normalizeBookingAccess(draft.access),
    shortNotice: normalizePricingYesNo(draft.shortNotice),
    weekend: normalizePricingYesNo(draft.weekend),
    windowSide: normalizeBookingWindowSide(draft.windowSide),
    balconyGlass: normalizeBookingBalconyGlass(draft.balconyGlass),
    kitchen: "Nej" as PricingYesNo,
    selectedAddOns: visibility.showAddOns ? normalizeBookingAddOns(draft.extras) : [],
    useRut: draft.rutRequested && visibility.rutEligible
  };
}

export function formatBookingHours(hours: number | undefined, language: BookingFormLanguage, monthly?: boolean) {
  if (!hours) return language === "sv" ? "Kontrolleras" : "Manual check";
  const rounded = Math.round(hours * 10) / 10;
  const value = language === "sv" ? String(rounded).replace(".", ",") : String(rounded);
  if (monthly) return `${value} ${language === "sv" ? "tim/besök" : "h/visit"}`;
  return `${value} ${language === "sv" ? "tim" : "h"}`;
}

function displayValue(value: string, labels: BookingFormSummaryLabels) {
  return value && value.trim() ? value : labels.notFilled;
}

export function buildBookingSummary(draft: BookingFormDraft, language: BookingFormLanguage) {
  const labels = bookingFormSummaryLabels[language];
  const pricingInput = buildBookingPricingInput(draft);
  const visibility = bookingFormVisibility(draft);
  const estimate = estimatePrice(pricingInput);
  const lines = [
    `${labels.service}: ${displayValue(draft.service, labels)}`,
    `${labels.customerType}: ${displayValue(draft.customerType, labels)}`,
    `${labels.rut}: ${draft.rutRequested ? labels.yes : labels.no}`,
    `${labels.area}: ${displayValue(draft.area, labels)}`,
    `${labels.postalCode}: ${displayValue(draft.postalCode, labels)}`,
    `${labels.address}: ${displayValue(draft.address, labels)}`,
    `${labels.size}: ${displayValue(draft.size, labels)}`,
    language === "sv" ? "--- Objekt & detaljer ---" : "--- Property & details ---",
    `${labels.propertyType}: ${displayValue(draft.propertyType, labels)}`,
    `${labels.rooms}: ${displayValue(draft.rooms, labels)}`,
    `${labels.bathrooms}: ${displayValue(draft.bathrooms, labels)}`,
    `${labels.pets}: ${displayValue(draft.pets, labels)}`,
    `${labels.floor}: ${displayValue(draft.floor, labels)}`,
    `${labels.elevator}: ${displayValue(draft.elevator, labels)}`,
    `${labels.parking}: ${displayValue(draft.parking, labels)}`,
    `${labels.condition}: ${displayValue(draft.condition, labels)}`,
    `${labels.access}: ${displayValue(draft.access, labels)}`,
    `${labels.shortNotice}: ${displayValue(draft.shortNotice, labels)}`,
    `${labels.weekend}: ${displayValue(draft.weekend, labels)}`,
    `${labels.extras}: ${draft.extras.length ? draft.extras.join(", ") : labels.noSelection}`,
    visibility.showWindowFields ? `${labels.windows}: ${displayValue(draft.windows, labels)}` : "",
    visibility.showWindowFields ? `${labels.windowSide}: ${displayValue(draft.windowSide, labels)}` : "",
    visibility.showBalconyFields ? `${labels.balconyGlass}: ${displayValue(draft.balconyGlass, labels)}` : "",
    "",
    language === "sv" ? "--- Prisindikation ---" : "--- Price indication ---",
    `${labels.beforeRut}: ${formatSek(estimate.beforeRut)}`,
    `${labels.afterRut}: ${formatSek(estimate.afterRut)}`,
    `${labels.estimatedTime}: ${formatBookingHours(estimate.hours, language, estimate.monthly)}`,
    "",
    language === "sv" ? "--- Kundens önskemål ---" : "--- Customer notes ---",
    draft.notes || "-"
  ].filter((line) => line !== "");

  return { lines, text: lines.join("\n"), pricingInput, estimate };
}

export function applyBookingServiceSideEffects(draft: BookingFormDraft, language: BookingFormLanguage): BookingFormDraft {
  const service = normalizePricingService(draft.service);
  if (service !== "Kontorsstädning") return draft;
  return {
    ...draft,
    customerType: language === "sv" ? "Företag" : "Company",
    rutRequested: false,
    propertyType: language === "sv" ? "Kontor" : "Office"
  };
}
