"use client";

import { useEffect } from "react";

type Lang = "sv" | "en";

type Input = {
  service: string;
  customerType: string;
  rutRequested: boolean;
  size: number;
  rooms: number;
  bathrooms: number;
  floor: number;
  elevator: string;
  parking: string;
  pets: string;
  frequency: string;
  extras: string[];
};

const PUBLIC_PATHS = ["/boka-utan-konto", "/en/boka-utan-konto"];

function isPublicPath() {
  const path = window.location.pathname.replace(/\/$/, "") || "/";
  return PUBLIC_PATHS.includes(path);
}

function lang(): Lang {
  return window.location.pathname.startsWith("/en/") ? "en" : "sv";
}

function numberFromText(value: string | null | undefined, fallback: number) {
  const parsed = Number.parseInt(String(value || "").replace(/[^0-9]/g, ""), 10);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : fallback;
}

function formatMoney(value: number, language: Lang) {
  return `${Math.round(value).toLocaleString(language === "sv" ? "sv-SE" : "en-US")} kr`;
}

function normalizeService(value: string) {
  if (value === "Home cleaning") return "Hemstädning";
  if (value === "Move-out cleaning") return "Flyttstädning";
  if (value === "Deep cleaning") return "Storstädning";
  if (value === "Office cleaning") return "Kontorsstädning";
  if (value === "Window cleaning") return "Fönsterputs";
  return value;
}

function normalizeFrequency(value: string) {
  if (value === "One-time") return "Engång";
  if (value === "Every week") return "Varje vecka";
  if (value === "Every other week") return "Varannan vecka";
  if (value === "Every month" || value === "Varje månad") return "Var fjärde vecka";
  return value;
}

function normalizeYesNo(value: string) {
  return value === "Ja" || value === "Yes" ? "Ja" : "Nej";
}

function normalizeAddOn(value: string) {
  const map: Record<string, string> = {
    "Window cleaning": "Fönsterputs",
    Oven: "Ugn",
    "Fridge/freezer": "Kyl/frys",
    Balcony: "Balkong",
    "Deep cleaning": "Grovstädning",
    "Cabinets/drawers": "Skåp/lådor"
  };
  return map[value] || value;
}

function addOnPrice(addOn: string) {
  if (addOn === "Fönsterputs") return 700;
  if (addOn === "Ugn") return 350;
  if (addOn === "Kyl/frys") return 350;
  if (addOn === "Balkong") return 450;
  if (addOn === "Grovstädning") return 650;
  if (addOn === "Skåp/lådor") return 450;
  return 0;
}

function frequencyDiscount(frequency: string) {
  if (frequency === "Varje vecka") return 0.1;
  if (frequency === "Varannan vecka") return 0.05;
  return 0;
}

function accessMultiplier(input: Input) {
  let multiplier = 1;
  if (normalizeYesNo(input.parking) === "Nej") multiplier += 0.05;
  if (input.floor > 2 && normalizeYesNo(input.elevator) === "Nej") multiplier += 0.1;
  if (input.floor > 5 && normalizeYesNo(input.elevator) === "Nej") multiplier += 0.1;
  return multiplier;
}

function calculate(input: Input, language: Lang) {
  const service = normalizeService(input.service);
  const frequency = normalizeFrequency(input.frequency);
  const addOns = service === "Kontorsstädning" ? [] : service === "Fönsterputs" ? input.extras.map(normalizeAddOn).filter((item) => item !== "Fönsterputs") : input.extras.map(normalizeAddOn);
  const addOnsBeforeRut = addOns.reduce((sum, item) => sum + addOnPrice(item), 0);
  const rut = input.rutRequested && input.customerType !== "Företag" && input.customerType !== "Company" && service !== "Kontorsstädning";
  const access = accessMultiplier(input);
  const unit = language === "sv" ? "tim" : "h";

  if (service === "Hemstädning") {
    const petHours = normalizeYesNo(input.pets) === "Ja" ? 0.25 : 0;
    const hours = Math.max(2, input.size / 38 + Math.max(0, input.bathrooms - 1) * 0.35 + Math.max(0, input.rooms - 3) * 0.08 + petHours);
    const hourly = frequency === "Engång" ? 590 : 520;
    const before = Math.max(frequency === "Engång" ? 1180 : 1040, (hours * hourly * (1 - frequencyDiscount(frequency)) + addOnsBeforeRut) * access);
    return { before, after: before * (rut ? 0.5 : 1), hours: `${Math.round(hours * 10) / 10} ${unit}` };
  }

  if (service === "Flyttstädning") {
    const perSqm = input.size <= 50 ? 52 : input.size <= 80 ? 48 : input.size <= 120 ? 45 : 42;
    const before = Math.max(2900, (input.size * perSqm + Math.max(0, input.bathrooms - 1) * 400 + addOnsBeforeRut) * access);
    return { before, after: before * (rut ? 0.5 : 1), hours: language === "sv" ? "Kontrolleras" : "Manual check" };
  }

  if (service === "Storstädning") {
    const petHours = normalizeYesNo(input.pets) === "Ja" ? 0.35 : 0;
    const hours = Math.max(3, input.size / 27 + Math.max(0, input.bathrooms - 1) * 0.45 + petHours);
    const before = Math.max(1770, (hours * 590 + addOnsBeforeRut) * access);
    return { before, after: before * (rut ? 0.5 : 1), hours: `${Math.round(hours * 10) / 10} ${unit}` };
  }

  if (service === "Kontorsstädning") {
    const hoursPerVisit = Math.max(1.5, input.size / 60 + Math.max(0, input.bathrooms) * 0.2);
    const monthly = Math.max(1500, hoursPerVisit * 4.33 * 520);
    return { before: monthly, after: monthly, hours: `${Math.round(hoursPerVisit * 10) / 10} ${unit}/${language === "sv" ? "besök" : "visit"}` };
  }

  const windows = Math.max(8, Math.round(input.size / 10));
  const before = Math.max(1390, (windows * 85 + addOnsBeforeRut) * access);
  return { before, after: before * (rut ? 0.5 : 1), hours: language === "sv" ? "Kontrolleras" : "Manual check" };
}

function fieldByLabel(form: HTMLFormElement, labels: string[]) {
  const normalizedLabels = labels.map((item) => item.toLowerCase());
  const label = Array.from(form.querySelectorAll("label")).find((item) => {
    const text = (item.textContent || "").toLowerCase();
    return normalizedLabels.some((labelText) => text.includes(labelText));
  });
  const control = label?.querySelector("input, select, textarea") as HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement | null;
  return control?.value || "";
}

function selectedExtras(form: HTMLFormElement) {
  const labels = ["Fönsterputs", "Ugn", "Kyl/frys", "Balkong", "Grovstädning", "Skåp/lådor", "Window cleaning", "Oven", "Fridge/freezer", "Balcony", "Deep cleaning", "Cabinets/drawers"];
  return Array.from(form.querySelectorAll<HTMLButtonElement>('button[type="button"]'))
    .filter((button) => button.className.includes("bg-burgundy"))
    .map((button) => (button.textContent || "").trim())
    .filter((text) => labels.includes(text));
}

function readFormInput(form: HTMLFormElement): Input {
  return {
    service: fieldByLabel(form, ["Tjänst", "Service"]),
    customerType: fieldByLabel(form, ["Kundtyp", "Customer type"]),
    rutRequested: ["Ja", "Yes"].includes(fieldByLabel(form, ["RUT", "RUT deduction"])),
    size: numberFromText(fieldByLabel(form, ["Storlek", "Size"]), 0),
    rooms: numberFromText(fieldByLabel(form, ["Antal rum", "Rooms"]), 3),
    bathrooms: numberFromText(fieldByLabel(form, ["Antal badrum", "Bathrooms"]), 1),
    floor: numberFromText(fieldByLabel(form, ["Våning", "Floor"]), 0),
    elevator: fieldByLabel(form, ["Hiss", "Elevator"]),
    parking: fieldByLabel(form, ["Parkering", "Parking"]),
    pets: fieldByLabel(form, ["Husdjur", "Pets"]),
    frequency: fieldByLabel(form, ["Frekvens", "Frequency"]),
    extras: selectedExtras(form)
  };
}

function replaceLine(notes: string, labels: string[], value: string) {
  const lines = notes.split("\n");
  const index = lines.findIndex((line) => labels.some((label) => line.trim().toLowerCase().startsWith(label.toLowerCase())));
  if (index >= 0) lines[index] = `${labels[0]} ${value}`;
  return lines.join("\n");
}

function updateEstimateText(form: HTMLFormElement) {
  const language = lang();
  const estimate = calculate(readFormInput(form), language);
  const root = form.parentElement;
  const labels = language === "sv"
    ? ["Före RUT:", "Efter RUT:", "Uppskattad tid:"]
    : ["Before RUT:", "After RUT:", "Estimated time:"];
  const values = [formatMoney(estimate.before, language), formatMoney(estimate.after, language), estimate.hours];
  const paragraphs = Array.from(root?.querySelectorAll<HTMLParagraphElement>("aside p") || []);

  labels.forEach((label, index) => {
    const paragraph = paragraphs.find((item) => (item.textContent || "").trim().startsWith(label));
    if (paragraph) paragraph.innerHTML = `<b>${label}</b> ${values[index]}`;
  });

  const summary = root?.querySelector("aside pre");
  if (summary?.textContent) {
    let text = summary.textContent;
    text = replaceLine(text, [labels[0]], values[0]);
    text = replaceLine(text, [labels[1]], values[1]);
    text = replaceLine(text, [labels[2]], values[2]);
    summary.textContent = text;
  }
}

function parseNotesInput(notes: string, payload: any): Input {
  const valueFor = (labels: string[], fallback = "") => {
    for (const label of labels) {
      const match = notes.match(new RegExp(`${label.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}\\s*:\\s*([^\\n]+)`, "i"));
      if (match?.[1]) return match[1].trim();
    }
    return fallback;
  };

  return {
    service: payload.service || valueFor(["Tjänst", "Service"]),
    customerType: payload.customerType || valueFor(["Kundtyp", "Customer type"], "Privatperson"),
    rutRequested: payload.rutRequested === true || /RUT[^\n]*:\s*(Ja|Yes|true)/i.test(notes),
    size: numberFromText(payload.size || valueFor(["Storlek kvm", "Size sqm", "Storlek", "Size"]), 0),
    rooms: numberFromText(valueFor(["Antal rum", "Rooms"]), 3),
    bathrooms: numberFromText(valueFor(["Antal badrum", "Bathrooms"]), 1),
    floor: numberFromText(valueFor(["Våning", "Floor"]), 0),
    elevator: valueFor(["Hiss", "Elevator"], "Ja"),
    parking: valueFor(["Parkering", "Parking"], "Ja"),
    pets: valueFor(["Husdjur", "Pets"], "Nej"),
    frequency: payload.frequency || valueFor(["Frekvens", "Frequency"], "Engång"),
    extras: valueFor(["Extra tjänster", "Extra services"], "").split(",").map((item) => item.trim()).filter(Boolean)
  };
}

function patchNotes(payload: any, language: Lang) {
  if (!payload?.notes) return payload;
  const estimate = calculate(parseNotesInput(payload.notes, payload), language);
  const labels = language === "sv"
    ? ["Före RUT:", "Efter RUT:", "Uppskattad tid:"]
    : ["Before RUT:", "After RUT:", "Estimated time:"];
  let notes = payload.notes;
  notes = replaceLine(notes, [labels[0]], formatMoney(estimate.before, language));
  notes = replaceLine(notes, [labels[1]], formatMoney(estimate.after, language));
  notes = replaceLine(notes, [labels[2]], estimate.hours);
  return { ...payload, notes };
}

export default function PublicBookingRequestCalculatorEnhancer() {
  useEffect(() => {
    if (!isPublicPath()) return;

    const updateAll = () => document.querySelectorAll<HTMLFormElement>("form").forEach(updateEstimateText);
    const interval = window.setInterval(updateAll, 350);
    const observer = new MutationObserver(updateAll);
    observer.observe(document.body, { childList: true, subtree: true, characterData: true, attributes: true });
    updateAll();

    const originalFetch = window.fetch.bind(window);
    window.fetch = (input: RequestInfo | URL, init?: RequestInit) => {
      const url = typeof input === "string" ? input : input instanceof URL ? input.toString() : input.url;
      if (url.includes("/api/public-booking-request") && init?.body && typeof init.body === "string") {
        try {
          const payload = JSON.parse(init.body);
          const patched = patchNotes(payload, payload.language === "en" ? "en" : "sv");
          return originalFetch(input, { ...init, body: JSON.stringify(patched) });
        } catch {
          return originalFetch(input, init);
        }
      }
      return originalFetch(input, init);
    };

    return () => {
      window.clearInterval(interval);
      observer.disconnect();
      window.fetch = originalFetch;
    };
  }, []);

  return null;
}
