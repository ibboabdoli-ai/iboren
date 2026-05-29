"use client";

import { useEffect } from "react";

const STORAGE_KEY = "iboren:calculatorEstimate:v1";

type CalculatorEstimate = {
  inputs?: Record<string, string>;
  selectedButtons?: string[];
  result?: {
    title?: string;
    riskLabel?: string;
    priceBeforeRut?: string;
    priceAfterRut?: string;
    estimatedTime?: string;
  };
};

function cleanText(value: unknown) {
  return String(value ?? "").replace(/\s+/g, " ").trim();
}

function normalize(value: unknown) {
  return cleanText(value).toLowerCase();
}

function escapeRegex(value: string) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function readEstimate(): CalculatorEstimate | null {
  try {
    const raw = window.sessionStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) as CalculatorEstimate : null;
  } catch {
    return null;
  }
}

function readControlValue(control: Element) {
  if (control instanceof HTMLInputElement) {
    if (control.type === "checkbox") return control.checked ? "Yes" : "No";
    return control.value;
  }
  if (control instanceof HTMLSelectElement) return control.value;
  if (control instanceof HTMLTextAreaElement) return control.value;
  return "";
}

function labelName(label: HTMLLabelElement) {
  const spanText = cleanText(label.querySelector("span")?.textContent);
  const fullText = cleanText(label.textContent);
  if (fullText.includes("RUT") && (fullText.includes("Skatteverkets") || fullText.includes("conditions") || fullText.includes("Gäller endast"))) return "RUT";
  return spanText || fullText;
}

function extractAfterLabel(text: string, labels: string[]) {
  for (const label of labels) {
    const match = text.match(new RegExp(`${escapeRegex(label)}\\s*([0-9][0-9\\s]*(?:kr|SEK)?(?:\\/(?:mån|month))?)`, "i"));
    if (match?.[1]) return cleanText(match[1]);
  }
  return "";
}

function extractEstimatedTime(text: string) {
  const match = text.match(/(?:Uppskattad tid: cirka|Estimated time: about)\s*([0-9,.]+\s*(?:timmar|hours)(?:\s*(?:per besök|per visit))?)/i);
  return cleanText(match?.[1]);
}

function extractRiskLabel(text: string) {
  const labels = ["Bra prisunderlag", "Behöver kontrolleras", "Manuell offert behövs", "Good estimate basis", "Needs review", "Manual quote needed"];
  return labels.find((label) => text.includes(label)) || "";
}

function captureCalculator(calculator: HTMLElement): CalculatorEstimate {
  const inputs: Record<string, string> = {};
  calculator.querySelectorAll("label").forEach((labelNode) => {
    const label = labelNode as HTMLLabelElement;
    const control = label.querySelector("input, select, textarea");
    const name = labelName(label);
    if (!control || !name) return;
    inputs[name] = readControlValue(control);
  });

  const nonAddOns = new Set(["privatperson", "private customer", "företag", "company"]);
  const selectedButtons = Array.from(calculator.querySelectorAll("button"))
    .filter((button) => cleanText(button.className).includes("bg-burgundy"))
    .map((button) => cleanText(button.textContent))
    .filter((value) => value && !nonAddOns.has(normalize(value)));

  const resultCard = Array.from(calculator.querySelectorAll("div"))
    .find((element) => {
      const className = cleanText(element.getAttribute("class"));
      const text = cleanText(element.textContent);
      return className.includes("bg-burgundy") && className.includes("text-porcelain") && (text.includes("RUT") || text.includes("estimate") || text.includes("pris"));
    }) as HTMLElement | undefined;

  const resultText = cleanText(resultCard?.textContent);

  return {
    inputs,
    selectedButtons,
    result: {
      title: cleanText(resultCard?.querySelector("p")?.textContent),
      riskLabel: extractRiskLabel(resultText),
      priceBeforeRut: extractAfterLabel(resultText, ["Före RUT / totalpris", "Before RUT / total price"]),
      priceAfterRut: extractAfterLabel(resultText, ["Efter RUT / kundpris", "After RUT / customer price", "Kundpris utan RUT", "Customer price without RUT", "Prisindikation", "Monthly estimate"]),
      estimatedTime: extractEstimatedTime(resultText)
    }
  };
}

function getInput(estimate: CalculatorEstimate, labels: string[]) {
  const wanted = labels.map(normalize);
  const entry = Object.entries(estimate.inputs || {}).find(([key, value]) => cleanText(value) && wanted.some((label) => normalize(key).includes(label)));
  return cleanText(entry?.[1]);
}

function nativeSetValue(element: HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement, value: string) {
  const prototype = Object.getPrototypeOf(element);
  const setter = Object.getOwnPropertyDescriptor(prototype, "value")?.set;
  setter?.call(element, value);
  element.dispatchEvent(new Event("input", { bubbles: true }));
  element.dispatchEvent(new Event("change", { bubbles: true }));
}

function labelElement(form: HTMLElement, labels: string[]) {
  const wanted = labels.map(normalize);
  return Array.from(form.querySelectorAll<HTMLLabelElement>("label")).find((label) => {
    const labelText = normalize(label.textContent);
    return wanted.some((wantedLabel) => labelText === wantedLabel || labelText.startsWith(wantedLabel));
  }) || null;
}

function fieldControl(form: HTMLElement, labels: string[]) {
  const label = labelElement(form, labels);
  return label?.querySelector("input, textarea, select") as HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement | null;
}

function setField(form: HTMLElement, labels: string[], value: string) {
  if (!cleanText(value)) return;
  const control = fieldControl(form, labels);
  if (control instanceof HTMLInputElement || control instanceof HTMLTextAreaElement) nativeSetValue(control, value);
}

function mappedSelectValue(value: string) {
  const key = normalize(value);
  const map: Record<string, string> = {
    "yes": "Ja",
    "no": "Nej",
    "not sure": "Vet ej",
    "ja": "Ja",
    "nej": "Nej",
    "vet ej": "Vet ej",
    "one-time": "Engång",
    "every week": "Varje vecka",
    "every other week": "Varannan vecka",
    "every fourth week": "Varje månad",
    "engång": "Engång",
    "varje vecka": "Varje vecka",
    "varannan vecka": "Varannan vecka",
    "var fjärde vecka": "Varje månad"
  };
  return map[key] || value;
}

function setSelect(form: HTMLElement, labels: string[], value: string) {
  if (!cleanText(value)) return;
  const control = fieldControl(form, labels);
  if (!(control instanceof HTMLSelectElement)) return;
  const mapped = mappedSelectValue(value);
  const option = Array.from(control.options).find((item) => normalize(item.value) === normalize(mapped) || normalize(item.textContent) === normalize(mapped) || normalize(item.textContent) === normalize(value));
  if (option) nativeSetValue(control, option.value);
}

function dispatchButton(button: HTMLButtonElement) {
  button.dispatchEvent(new MouseEvent("click", { bubbles: true, cancelable: true, view: window }));
}

function isSelected(button: HTMLButtonElement) {
  const className = cleanText(button.getAttribute("class"));
  return className.includes("bg-gold") || className.includes("bg-burgundy");
}

function buttonsForLabel(form: HTMLElement, labels: string[]) {
  const label = labelElement(form, labels);
  const container = label?.parentElement;
  if (!container) return [] as HTMLButtonElement[];
  return Array.from(container.querySelectorAll<HTMLButtonElement>("button"));
}

function selectButtonInGroup(form: HTMLElement, groupLabels: string[], buttonLabels: string[]) {
  const wanted = buttonLabels.map(normalize);
  const button = buttonsForLabel(form, groupLabels).find((item) => wanted.includes(normalize(item.textContent)));
  if (button && !isSelected(button)) dispatchButton(button);
}

function calculatorServiceToBooking(service: string) {
  const key = normalize(service);
  if (key === "hemstädning" || key === "home cleaning") return ["Hemstädning", "Home cleaning"];
  if (key === "flyttstädning" || key === "move-out cleaning") return ["Flyttstädning", "Move-out cleaning"];
  if (key === "kontorsstädning" || key === "office cleaning") return ["Kontorsstädning", "Office cleaning"];
  if (key === "fönsterputs" || key === "window cleaning") return ["Fönsterputs", "Window cleaning"];
  if (key === "storstädning" || key === "deep cleaning") return ["Hemstädning", "Home cleaning"];
  return [];
}

function hasSelected(estimate: CalculatorEstimate, labels: string[]) {
  const selected = (estimate.selectedButtons || []).map(normalize);
  return labels.some((label) => selected.includes(normalize(label)));
}

function applyEstimateToBooking() {
  const estimate = readEstimate();
  const form = document.querySelector<HTMLElement>("#booking form");
  if (!estimate || !form) return;

  const submitText = normalize(form.querySelector("button[type='submit']")?.textContent);
  if (submitText.includes("skickar") || submitText.includes("sending")) return;

  const service = getInput(estimate, ["Tjänst", "Service"]);
  const bookingService = calculatorServiceToBooking(service);
  if (bookingService.length) selectButtonInGroup(form, ["Tjänst", "Service"], bookingService);

  setField(form, ["Storlek kvm", "Size", "Size sqm", "Size (sqm)"], getInput(estimate, ["Storlek kvm", "Size sqm", "Size"]));
  setField(form, ["Antal rum", "Rooms"], getInput(estimate, ["Antal rum", "Rooms"]));
  setField(form, ["Antal badrum", "Bathrooms"], getInput(estimate, ["Antal badrum", "Bathrooms"]));
  setField(form, ["Våning", "Floor"], getInput(estimate, ["Våning", "Floor"]));

  setSelect(form, ["Frekvens", "Frequency"], getInput(estimate, ["Frekvens", "Frequency"]));
  setSelect(form, ["Husdjur", "Pets"], getInput(estimate, ["Husdjur", "Pets"]));
  setSelect(form, ["Hiss", "Elevator"], getInput(estimate, ["Hiss", "Elevator"]));
  setSelect(form, ["Parkering", "Parking"], getInput(estimate, ["Parkering", "Parking"]));

  const extraGroup = ["Extra tjänster", "Extra services"];
  if (hasSelected(estimate, ["Fönsterputs", "Window cleaning"])) selectButtonInGroup(form, extraGroup, ["Fönsterputs", "Window cleaning"]);
  if (hasSelected(estimate, ["Ugn", "Ugnsrengöring", "Oven", "Oven cleaning"])) selectButtonInGroup(form, extraGroup, ["Ugn", "Oven"]);
  if (hasSelected(estimate, ["Kyl/frys", "Fridge/freezer"])) selectButtonInGroup(form, extraGroup, ["Kyl/frys", "Fridge/freezer"]);
  if (hasSelected(estimate, ["Balkong", "Balcony"])) selectButtonInGroup(form, extraGroup, ["Balkong", "Balcony"]);
  if (hasSelected(estimate, ["Grovstädning", "Deep cleaning", "Extra smutsigt"]) || ["storstädning", "deep cleaning"].includes(normalize(service))) selectButtonInGroup(form, extraGroup, ["Grovstädning", "Deep cleaning"]);
  if (hasSelected(estimate, ["Skåp/lådor", "Cabinets/drawers"])) selectButtonInGroup(form, extraGroup, ["Skåp/lådor", "Cabinets/drawers"]);
}

export default function BookingRutEnhancer() {
  useEffect(() => {
    function handleCalculatorClick(event: MouseEvent) {
      const target = event.target as Element | null;
      const link = target?.closest("a[href='/#booking'], a[href='#booking'], a[href='/en#booking']");
      const calculator = link?.closest("#pris-kalkylator, #price-calculator") as HTMLElement | null;
      if (!calculator) return;
      window.sessionStorage.setItem(STORAGE_KEY, JSON.stringify(captureCalculator(calculator)));
      [150, 450, 900, 1600, 2600].forEach((delay) => window.setTimeout(applyEstimateToBooking, delay));
    }

    document.addEventListener("click", handleCalculatorClick, true);
    const timers = [150, 450, 900, 1600, 2600].map((delay) => window.setTimeout(applyEstimateToBooking, delay));
    return () => {
      document.removeEventListener("click", handleCalculatorClick, true);
      timers.forEach((timer) => window.clearTimeout(timer));
    };
  }, []);

  return null;
}
