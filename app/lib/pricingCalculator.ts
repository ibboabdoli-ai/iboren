import { estimateBookingWorkload } from "./bookingWorkload";

export type PricingService = "Hemstädning" | "Flyttstädning" | "Storstädning" | "Kontorsstädning" | "Fönsterputs";
export type PricingFrequency = "Engång" | "Varje vecka" | "Varannan vecka" | "Var fjärde vecka";
export type PricingAddOn = "Fönsterputs" | "Ugn" | "Kyl/frys" | "Balkong" | "Grovstädning" | "Skåp/lådor" | "Garage";
export type PricingCustomerType = "Privatperson" | "Företag";
export type PricingCondition = "Normal" | "Smutsigt" | "Mycket smutsigt";
export type PricingYesNo = "Ja" | "Nej";
export type PricingFurnished = "Tom bostad" | "Möblerad";
export type PricingAccess = "Normal" | "Svår åtkomst";
export type PricingWindowSide = "Båda sidor" | "Endast insida" | "Endast utsida";
export type PricingBalconyGlass = "Nej" | "Liten" | "Stor";
export type PricingRiskLevel = "Grön" | "Gul" | "Röd";

export type PricingEstimateInput = {
  service: PricingService;
  sqm: number;
  frequency: PricingFrequency;
  bathrooms: number;
  rooms: number;
  windows: number;
  officeVisits: number;
  officeToilets: number;
  condition: PricingCondition;
  furnished: PricingFurnished;
  pets: PricingYesNo;
  floor: number;
  elevator: PricingYesNo;
  parking: PricingYesNo;
  access: PricingAccess;
  shortNotice: PricingYesNo;
  weekend: PricingYesNo;
  windowSide: PricingWindowSide;
  balconyGlass: PricingBalconyGlass;
  kitchen: PricingYesNo;
  selectedAddOns: PricingAddOn[];
  useRut: boolean;
  /**
   * Reserved for future material, travel, equipment or administrative costs.
   * These amounts must never receive a RUT deduction.
   */
  nonRutAmount?: number;
};

export type PricingEstimate = {
  title: string;
  beforeRut: number;
  afterRut: number;
  rutEligibleLaborBeforeRut: number;
  nonRutAmount: number;
  rutDeduction: number;
  hours?: number;
  monthly?: boolean;
  addOnsBeforeRut: number;
  riskLevel: PricingRiskLevel;
  factors: string[];
  note: string;
};

export function formatSek(value: number) {
  return new Intl.NumberFormat("sv-SE", { style: "currency", currency: "SEK", maximumFractionDigits: 0 }).format(Math.round(value));
}

export function normalizePricingService(service: string): PricingService {
  if (service === "Home cleaning") return "Hemstädning";
  if (service === "Move-out cleaning") return "Flyttstädning";
  if (service === "Deep cleaning") return "Storstädning";
  if (service === "Office cleaning") return "Kontorsstädning";
  if (service === "Window cleaning") return "Fönsterputs";
  if (["Hemstädning", "Flyttstädning", "Storstädning", "Kontorsstädning", "Fönsterputs"].includes(service)) return service as PricingService;
  return "Hemstädning";
}

export function normalizePricingFrequency(frequency: string): PricingFrequency {
  if (frequency === "One-time") return "Engång";
  if (frequency === "Every week") return "Varje vecka";
  if (frequency === "Every other week") return "Varannan vecka";
  if (frequency === "Every month" || frequency === "Varje månad") return "Var fjärde vecka";
  if (["Engång", "Varje vecka", "Varannan vecka", "Var fjärde vecka"].includes(frequency)) return frequency as PricingFrequency;
  return "Engång";
}

export function normalizePricingYesNo(value: string | boolean | undefined): PricingYesNo {
  return value === true || value === "Ja" || value === "Yes" || value === "true" ? "Ja" : "Nej";
}

export function normalizePricingAddOn(addOn: string): PricingAddOn | null {
  const map: Record<string, PricingAddOn> = {
    "Window cleaning": "Fönsterputs",
    Oven: "Ugn",
    "Fridge/freezer": "Kyl/frys",
    Balcony: "Balkong",
    "Deep cleaning": "Grovstädning",
    "Cabinets/drawers": "Skåp/lådor",
    Garage: "Garage",
    "Garage cleaning": "Garage",
    Fönsterputs: "Fönsterputs",
    Ugn: "Ugn",
    "Kyl/frys": "Kyl/frys",
    Balkong: "Balkong",
    Grovstädning: "Grovstädning",
    "Skåp/lådor": "Skåp/lådor"
  };
  return map[addOn] || null;
}

function frequencyDiscount(frequency: PricingFrequency) {
  if (frequency === "Varje vecka") return 0.1;
  if (frequency === "Varannan vecka") return 0.05;
  return 0;
}

function addOnBeforeRutPrice(addOn: PricingAddOn) {
  if (addOn === "Fönsterputs") return 700;
  if (addOn === "Ugn") return 350;
  if (addOn === "Kyl/frys") return 350;
  if (addOn === "Balkong") return 450;
  if (addOn === "Grovstädning") return 650;
  if (addOn === "Skåp/lådor") return 450;
  if (addOn === "Garage") return 650;
  return 0;
}

function conditionMultiplier(condition: PricingCondition) {
  if (condition === "Smutsigt") return 1.15;
  if (condition === "Mycket smutsigt") return 1.35;
  return 1;
}

function accessMultiplier(input: PricingEstimateInput) {
  let multiplier = 1;
  if (input.access === "Svår åtkomst") multiplier += 0.15;
  if (input.parking === "Nej") multiplier += 0.05;
  if (input.floor > 2 && input.elevator === "Nej") multiplier += 0.1;
  if (input.floor > 5 && input.elevator === "Nej") multiplier += 0.1;
  if (input.shortNotice === "Ja") multiplier += 0.12;
  if (input.weekend === "Ja") multiplier += 0.15;
  return multiplier;
}

function riskLevel(input: PricingEstimateInput): PricingRiskLevel {
  if (input.service === "Kontorsstädning" || input.condition === "Mycket smutsigt" || input.shortNotice === "Ja" || input.access === "Svår åtkomst") return "Röd";
  if (input.service === "Flyttstädning" && input.sqm > 180) return "Röd";
  if (input.floor > 4 && input.elevator === "Nej") return "Röd";
  if (input.service === "Fönsterputs" && input.windows > 25) return "Röd";
  if (input.condition === "Smutsigt" || input.weekend === "Ja" || input.parking === "Nej" || input.balconyGlass !== "Nej") return "Gul";
  if (input.selectedAddOns.includes("Garage")) return "Gul";
  if (input.service === "Flyttstädning" || input.windows > 15) return "Gul";
  return "Grön";
}

function workloadNotes(input: PricingEstimateInput, selectedAddOns: PricingAddOn[]) {
  return [
    `Skick: ${input.condition}`,
    `Rooms: ${input.rooms}`,
    `Bathrooms: ${input.bathrooms}`,
    `Husdjur: ${input.pets}`,
    `Våning: ${input.floor}`,
    `Floor: ${input.floor}`,
    `Hiss: ${input.elevator}`,
    `Elevator: ${input.elevator === "Ja" ? "Yes" : "No"}`,
    `Parkering: ${input.parking}`,
    `Parking: ${input.parking === "Ja" ? "Yes" : "No"}`,
    `Åtkomst: ${input.access}`,
    `Access: ${input.access === "Svår åtkomst" ? "Difficult access" : "Normal"}`,
    `Kort varsel: ${input.shortNotice}`,
    `Short notice: ${input.shortNotice === "Ja" ? "Yes" : "No"}`,
    `Helg/kväll: ${input.weekend}`,
    `Weekend/evening: ${input.weekend === "Ja" ? "Yes" : "No"}`,
    `Antal fönster: ${input.windows}`,
    `Number of windows: ${input.windows}`,
    `Fönsterputs: ${input.windowSide}`,
    `Window cleaning: ${input.windowSide}`,
    `Inglasad balkong: ${input.balconyGlass}`,
    `Balcony glass: ${input.balconyGlass}`,
    `Extra services: ${selectedAddOns.join(", ")}`,
    `Tillval: ${selectedAddOns.join(", ")}`
  ].join("\n");
}

function workloadHours(input: PricingEstimateInput, selectedAddOns: PricingAddOn[]) {
  return estimateBookingWorkload({
    size_sqm: input.sqm,
    service: input.service,
    frequency: input.frequency,
    notes: workloadNotes(input, selectedAddOns)
  }).estimated_hours;
}

function safeHourlyBeforeRut(input: PricingEstimateInput) {
  if (input.service === "Hemstädning") return input.frequency === "Engång" ? 560 : 510;
  if (input.service === "Storstädning") return 590;
  if (input.service === "Flyttstädning") return 560;
  if (input.service === "Fönsterputs") return 560;
  return 520;
}

function serviceMinimumBeforeRut(input: PricingEstimateInput) {
  if (input.service === "Hemstädning") return input.frequency === "Engång" ? 1180 : 1040;
  if (input.service === "Storstädning") return 1770;
  if (input.service === "Flyttstädning") return 2900;
  if (input.service === "Fönsterputs") return 1390;
  if (input.service === "Kontorsstädning") return 1500;
  return 1000;
}

function applyWorkloadPriceFloor(input: PricingEstimateInput, calculatedBeforeRut: number, displayHours: number) {
  if (!displayHours || input.service === "Kontorsstädning") return Math.max(calculatedBeforeRut, serviceMinimumBeforeRut(input));
  const safetyFloor = displayHours * safeHourlyBeforeRut(input);
  return Math.max(calculatedBeforeRut, safetyFloor, serviceMinimumBeforeRut(input));
}

function priceWithRut(input: PricingEstimateInput, laborBeforeRut: number, nonRutAmount = input.nonRutAmount ?? 0) {
  // The current service model only prices cleaning labour. Keeping this split
  // explicit prevents future non-labour charges from being RUT-discounted.
  const nonRut = Math.max(0, nonRutAmount);
  const rutEligibleLaborBeforeRut = input.service === "Kontorsstädning" ? 0 : laborBeforeRut;
  const rutDeduction = input.useRut ? rutEligibleLaborBeforeRut * 0.5 : 0;
  const beforeRut = laborBeforeRut + nonRut;

  return {
    beforeRut,
    afterRut: beforeRut - rutDeduction,
    rutEligibleLaborBeforeRut,
    nonRutAmount: nonRut,
    rutDeduction,
  };
}

export function estimatePrice(input: PricingEstimateInput): PricingEstimate {
  const selectedAddOns = input.service === "Kontorsstädning" ? [] : input.service === "Fönsterputs" ? input.selectedAddOns.filter((item) => item !== "Fönsterputs") : input.selectedAddOns;
  const addOnsBeforeRut = selectedAddOns.reduce((sum, item) => sum + addOnBeforeRutPrice(item), 0);
  const complexity = conditionMultiplier(input.condition);
  const access = accessMultiplier(input);
  const displayHours = workloadHours(input, selectedAddOns);
  const factors = [
    `Skick: ${input.condition}`,
    input.floor > 0 ? `Våning: ${input.floor}${input.elevator === "Ja" ? " med hiss" : " utan hiss"}` : "",
    input.parking === "Nej" ? "Parkering saknas" : "",
    input.shortNotice === "Ja" ? "Kort varsel" : "",
    input.weekend === "Ja" ? "Helg/kväll" : "",
    selectedAddOns.length ? `Tillval: ${selectedAddOns.join(", ")}` : ""
  ].filter(Boolean);

  if (input.service === "Hemstädning") {
    const petHours = input.pets === "Ja" ? 0.25 : 0;
    const priceHours = Math.max(2, input.sqm / 38 + Math.max(0, input.bathrooms - 1) * 0.35 + Math.max(0, input.rooms - 3) * 0.08 + petHours) * complexity;
    const hourlyBeforeRut = input.frequency === "Engång" ? 590 : 520;
    const subtotal = priceHours * hourlyBeforeRut * (1 - frequencyDiscount(input.frequency)) + addOnsBeforeRut;
    const calculatedBeforeRut = Math.max(input.frequency === "Engång" ? 1180 : 1040, subtotal * access);
    const price = priceWithRut(input, applyWorkloadPriceFloor(input, calculatedBeforeRut, displayHours));
    return { title: "Uppskattat pris för hemstädning", ...price, hours: displayHours, addOnsBeforeRut, riskLevel: riskLevel(input), factors, note: "Prisindikation baserad på yta, badrum, rum, skick, åtkomst, frekvens och tillval. Slutligt pris bekräftas innan förfrågan blir bindande." };
  }

  if (input.service === "Flyttstädning") {
    const perSqm = input.sqm <= 50 ? 52 : input.sqm <= 80 ? 48 : input.sqm <= 120 ? 45 : 42;
    const bathroomAddonBeforeRut = Math.max(0, input.bathrooms - 1) * 400;
    const furnishedFactor = input.furnished === "Möblerad" ? 1.2 : 1;
    const calculatedBeforeRut = Math.max(2900, (input.sqm * perSqm + bathroomAddonBeforeRut + addOnsBeforeRut) * complexity * furnishedFactor * access);
    const price = priceWithRut(input, applyWorkloadPriceFloor(input, calculatedBeforeRut, displayHours));
    return { title: "Uppskattat pris för flyttstädning", ...price, hours: displayHours, addOnsBeforeRut, riskLevel: riskLevel(input), factors: [...factors, input.furnished], note: "Flyttstädning påverkas starkt av skick, om bostaden är tömd, fönster, balkong och åtkomst. Större eller mycket smutsiga objekt bör alltid kontrolleras manuellt." };
  }

  if (input.service === "Storstädning") {
    const petHours = input.pets === "Ja" ? 0.35 : 0;
    const priceHours = Math.max(3, input.sqm / 27 + Math.max(0, input.bathrooms - 1) * 0.45 + petHours) * complexity;
    const calculatedBeforeRut = Math.max(1770, (priceHours * 590 + addOnsBeforeRut) * access);
    const price = priceWithRut(input, applyWorkloadPriceFloor(input, calculatedBeforeRut, displayHours));
    return { title: "Uppskattat pris för storstädning", ...price, hours: displayHours, addOnsBeforeRut, riskLevel: riskLevel(input), factors, note: "Storstädning räknas med högre tidsåtgång än återkommande hemstädning eftersom bostadens skick påverkar mer." };
  }

  if (input.service === "Kontorsstädning") {
    const visitsPerMonth = Math.max(1, input.officeVisits) * 4.33;
    const kitchenHours = input.kitchen === "Ja" ? 0.25 : 0;
    const hoursPerVisit = Math.max(1.5, input.sqm / 60 + Math.max(0, input.officeToilets) * 0.2 + kitchenHours + (input.access === "Svår åtkomst" ? 0.15 : 0));
    const hourly = input.weekend === "Ja" ? 560 : 520;
    const monthly = Math.max(1500, hoursPerVisit * visitsPerMonth * hourly);
    const price = priceWithRut(input, monthly);
    return { title: "Prisindikation för kontorsstädning", ...price, hours: hoursPerVisit, monthly: true, addOnsBeforeRut: 0, riskLevel: riskLevel(input), factors: [...factors, `${input.officeVisits} besök/vecka`, `${input.officeToilets} toaletter`, input.kitchen === "Ja" ? "Kök/pentry" : ""].filter(Boolean), note: "Kontorsstädning visas som månadsindikation exklusive RUT. Slutlig offert bör bekräftas efter access, larm, nyckelhantering och städomfattning." };
  }

  const sideFactor = input.windowSide === "Båda sidor" ? 1 : 0.65;
  const balconyExtra = input.balconyGlass === "Stor" ? 1200 : input.balconyGlass === "Liten" ? 700 : 0;
  const windowBase = input.windows * 85 * sideFactor + balconyExtra;
  const calculatedBeforeRut = Math.max(1390, (windowBase + addOnsBeforeRut) * access);
  const price = priceWithRut(input, applyWorkloadPriceFloor(input, calculatedBeforeRut, displayHours));
  return { title: "Uppskattat pris för fönsterputs", ...price, hours: displayHours, addOnsBeforeRut, riskLevel: riskLevel(input), factors: [...factors, `${input.windows} fönster`, input.windowSide, input.balconyGlass !== "Nej" ? `Inglasad balkong: ${input.balconyGlass}` : ""].filter(Boolean), note: "Fönsterputs beräknas främst på antal fönster, sida/sidor, balkongglas och åtkomst. Höga våningar eller svår åtkomst kräver manuell kontroll." };
}
