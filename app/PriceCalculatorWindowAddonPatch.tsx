"use client";

import { useEffect } from "react";

type Lang = "sv" | "en";

function cleanText(value: unknown) {
  return String(value ?? "").replace(/\s+/g, " ").trim();
}

function normalize(value: unknown) {
  return cleanText(value).toLowerCase();
}

function parseNumber(value: unknown, fallback: number) {
  const parsed = Number(cleanText(value).replace(/[^0-9]/g, ""));
  return Number.isFinite(parsed) && parsed > 0 ? parsed : fallback;
}

function formatSek(value: number, lang: Lang) {
  return new Intl.NumberFormat(lang === "en" ? "en-SE" : "sv-SE", { style: "currency", currency: "SEK", maximumFractionDigits: 0 }).format(Math.round(value));
}

function labelText(label: HTMLLabelElement) {
  return normalize(label.querySelector("span")?.textContent || label.textContent);
}

function findControlByLabel(calculator: HTMLElement, labels: string[]) {
  const wanted = labels.map(normalize);
  const label = Array.from(calculator.querySelectorAll<HTMLLabelElement>("label")).find((item) => {
    const text = labelText(item);
    return wanted.some((candidate) => text === candidate || text.includes(candidate));
  });
  return label?.querySelector("input, select, textarea") as HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement | null;
}

function readControl(calculator: HTMLElement, labels: string[], fallback = "") {
  return cleanText(findControlByLabel(calculator, labels)?.value || fallback);
}

function findBlockByTitle(calculator: HTMLElement, titles: string[]) {
  const wanted = titles.map(normalize);
  const title = Array.from(calculator.querySelectorAll("p, h2, h3, h4, div")).find((node) => wanted.includes(normalize(node.textContent)));
  return title?.parentElement || null;
}

function selectedButtonText(calculator: HTMLElement, titles: string[]) {
  const block = findBlockByTitle(calculator, titles);
  if (!block) return "";
  const selected = Array.from(block.querySelectorAll<HTMLButtonElement>("button")).find((button) => {
    const className = cleanText(button.getAttribute("class"));
    return className.includes("bg-burgundy") || className.includes("bg-gold");
  });
  return cleanText(selected?.textContent);
}

function selectedButtons(calculator: HTMLElement, titles: string[]) {
  const block = findBlockByTitle(calculator, titles);
  if (!block) return [] as string[];
  return Array.from(block.querySelectorAll<HTMLButtonElement>("button"))
    .filter((button) => {
      const className = cleanText(button.getAttribute("class"));
      return className.includes("bg-burgundy") || className.includes("bg-gold");
    })
    .map((button) => cleanText(button.textContent));
}

function staticAddOnPrice(label: string) {
  const key = normalize(label);
  if (["ugn", "oven"].includes(key)) return 350;
  if (["kyl/frys", "fridge/freezer"].includes(key)) return 350;
  if (["balkong", "balcony"].includes(key)) return 450;
  if (["grovstädning", "deep cleaning"].includes(key)) return 650;
  if (["skåp/lådor", "cabinets/drawers"].includes(key)) return 450;
  return 0;
}

function windowPriceBeforeRut(windows: number, windowSide: string, balconyGlass: string, minimum: number) {
  const side = normalize(windowSide);
  const balcony = normalize(balconyGlass);
  const sideFactor = side.includes("båda") || side.includes("both") ? 1 : 0.65;
  const balconyExtra = balcony.includes("stor") || balcony.includes("large") ? 1200 : balcony.includes("liten") || balcony.includes("small") ? 700 : 0;
  return Math.max(minimum, windows * 85 * sideFactor + balconyExtra);
}

function conditionMultiplier(condition: string) {
  const key = normalize(condition);
  if (key.includes("mycket") || key.includes("very")) return 1.35;
  if (key.includes("smutsigt") || key.includes("dirty")) return 1.15;
  return 1;
}

function frequencyDiscount(frequency: string) {
  const key = normalize(frequency);
  if (key.includes("varje vecka") || key.includes("every week")) return 0.1;
  if (key.includes("varannan") || key.includes("every other")) return 0.05;
  return 0;
}

function accessMultiplier(input: { access: string; parking: string; floor: number; elevator: string; shortNotice: string; weekend: string }) {
  let multiplier = 1;
  if (normalize(input.access).includes("svår") || normalize(input.access).includes("difficult")) multiplier += 0.15;
  if (["nej", "no"].includes(normalize(input.parking))) multiplier += 0.05;
  if (input.floor > 2 && ["nej", "no"].includes(normalize(input.elevator))) multiplier += 0.1;
  if (input.floor > 5 && ["nej", "no"].includes(normalize(input.elevator))) multiplier += 0.1;
  if (["ja", "yes"].includes(normalize(input.shortNotice))) multiplier += 0.12;
  if (["ja", "yes"].includes(normalize(input.weekend))) multiplier += 0.15;
  return multiplier;
}

function updatePriceText(card: HTMLElement, beforeRut: number, afterRut: number, addOnsBeforeRut: number, lang: Lang) {
  const paragraphs = Array.from(card.querySelectorAll<HTMLParagraphElement>("p"));
  paragraphs.forEach((paragraph) => {
    const text = normalize(paragraph.textContent);
    const next = paragraph.nextElementSibling as HTMLElement | null;
    if (!next) return;
    if (text.includes("före rut") || text.includes("before rut")) next.textContent = formatSek(beforeRut, lang);
    if (text.includes("efter rut") || text.includes("kundpris") || text.includes("after rut") || text.includes("customer price")) {
      next.textContent = formatSek(afterRut, lang);
    }
  });

  const summary = paragraphs.find((paragraph) => normalize(paragraph.textContent).includes(lang === "en" ? "add-ons before rut" : "tillval före rut"));
  if (summary) {
    summary.textContent = summary.textContent?.replace(/(Tillval före RUT|Add-ons before RUT):[^.]+\./, `$1: ${formatSek(addOnsBeforeRut, lang)}.`) || "";
  }
}

function applyCalculatorPatch(calculator: HTMLElement) {
  const lang: Lang = calculator.id === "price-calculator" ? "en" : "sv";
  const service = readControl(calculator, lang === "en" ? ["Service"] : ["Tjänst"]);
  const serviceKey = normalize(service);
  const isOffice = serviceKey.includes("kontor") || serviceKey.includes("office");
  if (isOffice) return;

  const addOns = selectedButtons(calculator, lang === "en" ? ["Add-ons"] : ["Tillval"]);
  const isWindowService = serviceKey.includes("fönster") || serviceKey.includes("window");
  const hasWindowAddOn = addOns.some((item) => normalize(item).includes("fönster") || normalize(item).includes("window"));
  if (!isWindowService && !hasWindowAddOn) return;

  const sqm = parseNumber(readControl(calculator, lang === "en" ? ["Size sqm"] : ["Storlek kvm"]), 75);
  const rooms = parseNumber(readControl(calculator, lang === "en" ? ["Rooms"] : ["Antal rum"]), 3);
  const bathrooms = parseNumber(readControl(calculator, lang === "en" ? ["Bathrooms"] : ["Antal badrum"]), 1);
  const windows = parseNumber(readControl(calculator, lang === "en" ? ["Number of windows"] : ["Antal fönster"]), 8);
  const floor = parseNumber(readControl(calculator, lang === "en" ? ["Floor"] : ["Våning"]), 0);
  const condition = readControl(calculator, lang === "en" ? ["Condition"] : ["Skick"], "Normal");
  const frequency = readControl(calculator, lang === "en" ? ["Frequency"] : ["Frekvens"], lang === "en" ? "One-time" : "Engång");
  const pets = readControl(calculator, lang === "en" ? ["Pets"] : ["Husdjur"], lang === "en" ? "No" : "Nej");
  const furnished = readControl(calculator, lang === "en" ? ["Home at move-out"] : ["Bostad vid flytt"], lang === "en" ? "Empty home" : "Tom bostad");
  const parking = readControl(calculator, lang === "en" ? ["Parking"] : ["Parkering"], lang === "en" ? "Yes" : "Ja");
  const access = readControl(calculator, lang === "en" ? ["Access"] : ["Åtkomst"], "Normal");
  const elevator = readControl(calculator, lang === "en" ? ["Elevator"] : ["Hiss"], lang === "en" ? "Yes" : "Ja");
  const shortNotice = readControl(calculator, lang === "en" ? ["Short notice"] : ["Kort varsel"], lang === "en" ? "No" : "Nej");
  const weekend = readControl(calculator, lang === "en" ? ["Weekend/evening"] : ["Helg/kväll"], lang === "en" ? "No" : "Nej");
  const windowSide = readControl(calculator, lang === "en" ? ["Window cleaning"] : ["Fönsterputs"], lang === "en" ? "Both sides" : "Båda sidor");
  const balconyGlass = readControl(calculator, lang === "en" ? ["Balcony glass"] : ["Inglasad balkong"], lang === "en" ? "No" : "Nej");
  const customerType = selectedButtonText(calculator, lang === "en" ? ["Customer type"] : ["Kundtyp"]);
  const rutCheckbox = Array.from(calculator.querySelectorAll<HTMLInputElement>("input[type='checkbox']")).find((input) => normalize(input.closest("label")?.textContent).includes("rut"));
  const useRut = (normalize(customerType).includes("privat") || normalize(customerType).includes("private")) && !!rutCheckbox?.checked;

  const accessFactor = accessMultiplier({ access, parking, floor, elevator, shortNotice, weekend });
  const complexity = conditionMultiplier(condition);
  const dynamicWindowAddOn = windowPriceBeforeRut(windows, windowSide, balconyGlass, 700);
  const selectedAddOns = isWindowService ? addOns.filter((item) => !(normalize(item).includes("fönster") || normalize(item).includes("window"))) : addOns;
  const addOnsBeforeRut = selectedAddOns.reduce((sum, item) => {
    if (normalize(item).includes("fönster") || normalize(item).includes("window")) return sum + dynamicWindowAddOn;
    return sum + staticAddOnPrice(item);
  }, 0);

  let beforeRut = 0;
  if (isWindowService) {
    beforeRut = Math.max(1390, (windowPriceBeforeRut(windows, windowSide, balconyGlass, 0) + addOnsBeforeRut) * accessFactor);
  } else if (serviceKey.includes("flytt") || serviceKey.includes("move-out")) {
    const perSqm = sqm <= 50 ? 52 : sqm <= 80 ? 48 : sqm <= 120 ? 45 : 42;
    const bathroomAddonBeforeRut = Math.max(0, bathrooms - 1) * 400;
    const furnishedFactor = normalize(furnished).includes("möblerad") || normalize(furnished).includes("furnished") ? 1.2 : 1;
    beforeRut = Math.max(2900, (sqm * perSqm + bathroomAddonBeforeRut + addOnsBeforeRut) * complexity * furnishedFactor * accessFactor);
  } else if (serviceKey.includes("stor") || serviceKey.includes("deep")) {
    const petHours = ["ja", "yes"].includes(normalize(pets)) ? 0.35 : 0;
    const hours = Math.max(3, sqm / 27 + Math.max(0, bathrooms - 1) * 0.45 + petHours) * complexity;
    beforeRut = Math.max(1770, (hours * 590 + addOnsBeforeRut) * accessFactor);
  } else {
    const petHours = ["ja", "yes"].includes(normalize(pets)) ? 0.25 : 0;
    const hours = Math.max(2, sqm / 38 + Math.max(0, bathrooms - 1) * 0.35 + Math.max(0, rooms - 3) * 0.08 + petHours) * complexity;
    const hourlyBeforeRut = normalize(frequency).includes("one-time") || normalize(frequency).includes("engång") ? 590 : 520;
    const subtotal = hours * hourlyBeforeRut * (1 - frequencyDiscount(frequency)) + addOnsBeforeRut;
    beforeRut = Math.max(normalize(frequency).includes("one-time") || normalize(frequency).includes("engång") ? 1180 : 1040, subtotal * accessFactor);
  }

  const card = Array.from(calculator.querySelectorAll<HTMLElement>("div.bg-burgundy")).find((item) => normalize(item.textContent).includes("rut") || normalize(item.textContent).includes("price"));
  if (!card) return;
  updatePriceText(card, beforeRut, beforeRut * (useRut ? 0.5 : 1), addOnsBeforeRut, lang);
}

function applyPatch() {
  document.querySelectorAll<HTMLElement>("#pris-kalkylator, #price-calculator").forEach(applyCalculatorPatch);
}

export default function PriceCalculatorWindowAddonPatch() {
  useEffect(() => {
    const delayedApply = () => window.setTimeout(applyPatch, 30);
    const observer = new MutationObserver(delayedApply);
    document.querySelectorAll<HTMLElement>("#pris-kalkylator, #price-calculator").forEach((calculator) => observer.observe(calculator, { childList: true, subtree: true, characterData: true }));
    const timers = [80, 250, 700, 1400].map((delay) => window.setTimeout(applyPatch, delay));
    document.addEventListener("input", delayedApply, true);
    document.addEventListener("change", delayedApply, true);
    document.addEventListener("click", delayedApply, true);
    return () => {
      observer.disconnect();
      timers.forEach((timer) => window.clearTimeout(timer));
      document.removeEventListener("input", delayedApply, true);
      document.removeEventListener("change", delayedApply, true);
      document.removeEventListener("click", delayedApply, true);
    };
  }, []);

  return null;
}
