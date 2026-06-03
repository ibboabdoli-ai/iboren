"use client";

import { useEffect } from "react";
import {
  estimatePrice,
  formatSek,
  normalizePricingAddOn,
  normalizePricingFrequency,
  normalizePricingService,
  normalizePricingYesNo,
  type PricingAccess,
  type PricingBalconyGlass,
  type PricingCondition,
  type PricingFurnished,
  type PricingWindowSide,
  type PricingYesNo
} from "./lib/pricingCalculator";

const BLOCK_START = "--- Tilläggsdetaljer / Add-on details ---";
const BLOCK_END = "--- Slut tilläggsdetaljer / End add-on details ---";
const PRICE_START = "--- Prisindikation / Price estimate ---";
const PRICE_END = "--- Slut prisindikation / End price estimate ---";

type AddonState = {
  windowCount: string;
  windowSides: string;
  windowAccess: string;
  balconyType: string;
  balconyGlass: string;
  balconyNotes: string;
};

const state: AddonState = {
  windowCount: "",
  windowSides: "Båda sidor / Both sides",
  windowAccess: "Normal åtkomst / Normal access",
  balconyType: "Balkong / Balcony",
  balconyGlass: "Vet ej / Not sure",
  balconyNotes: ""
};

function isEnglish() {
  return window.location.pathname === "/en";
}

function isBookingPage() {
  return window.location.pathname === "/" || window.location.pathname === "/en";
}

function copy() {
  const en = isEnglish();
  return {
    title: en ? "Details for selected add-ons" : "Detaljer för valda tillägg",
    help: en ? "Add extra details for window cleaning or balcony. The price estimate updates automatically." : "Fyll i extra information för fönsterputs eller balkong. Prisindikationen uppdateras automatiskt.",
    windowCount: en ? "Number of windows" : "Antal fönster",
    windowCleaning: en ? "Window cleaning" : "Fönsterputs",
    access: en ? "Access" : "Åtkomst",
    balconyType: en ? "Balcony type" : "Balkongtyp",
    balconyGlass: en ? "Glazed balcony" : "Inglasad balkong",
    balconyDetails: en ? "Balcony details" : "Balkongdetaljer",
    windowPlaceholder: en ? "e.g. 8" : "t.ex. 8",
    balconyPlaceholder: en ? "e.g. glazed, dirty, furniture" : "t.ex. inglasad, smutsig, möbler",
    estimateTitle: en ? "Price estimate" : "Prisindikation",
    beforeRut: en ? "Before RUT / total" : "Före RUT / totalpris",
    afterRut: en ? "After RUT / customer price" : "Efter RUT / kundpris",
    time: en ? "Estimated time" : "Uppskattad tid",
    note: en ? "This is an estimate. Iboren confirms the final price before the request becomes binding." : "Detta är en prisindikation. Iboren bekräftar slutligt pris innan förfrågan blir bindande.",
    notFilled: en ? "Not filled" : "Ej ifyllt"
  };
}

function normalize(text: string) {
  return text.toLowerCase().replace(/\s+/g, " ").trim();
}

function isSelected(button: HTMLButtonElement) {
  return button.className.includes("bg-gold") || button.getAttribute("aria-pressed") === "true";
}

function findButtonsByTexts(texts: string[]) {
  const normalized = texts.map(normalize);
  return Array.from(document.querySelectorAll<HTMLButtonElement>("#booking button")).filter((button) => normalized.includes(normalize(button.textContent || "")));
}

function findFirstButtonByTexts(texts: string[]) {
  return findButtonsByTexts(texts)[0] || null;
}

function selectedButtonText(options: string[]) {
  return findButtonsByTexts(options).find(isSelected)?.textContent?.trim() || "";
}

function findTextarea() {
  return document.querySelector<HTMLTextAreaElement>("#booking textarea");
}

function setNativeTextareaValue(textarea: HTMLTextAreaElement, value: string) {
  const prototype = window.HTMLTextAreaElement.prototype;
  const descriptor = Object.getOwnPropertyDescriptor(prototype, "value");
  descriptor?.set?.call(textarea, value);
  textarea.dispatchEvent(new Event("input", { bubbles: true }));
}

function stripBlock(value: string, starts: string[], ends: string[]) {
  let cleaned = value.trim();
  for (const startMarker of starts) {
    const start = cleaned.indexOf(startMarker);
    if (start < 0) continue;
    const endMarker = ends.find((marker) => cleaned.indexOf(marker, start) >= 0);
    if (!endMarker) continue;
    const end = cleaned.indexOf(endMarker, start);
    cleaned = `${cleaned.slice(0, start).trim()}\n${cleaned.slice(end + endMarker.length).trim()}`.trim();
  }
  return cleaned;
}

function stripGeneratedBlocks(value: string) {
  const withoutAddon = stripBlock(value, ["--- Tilläggsdetaljer ---", BLOCK_START], ["--- Slut tilläggsdetaljer ---", BLOCK_END]);
  return stripBlock(withoutAddon, ["--- Prisindikation ---", PRICE_START], ["--- Slut prisindikation ---", PRICE_END]);
}

function numeric(value: string, fallback: number) {
  const parsed = Number(value.replace(/[^0-9]/g, ""));
  return Number.isFinite(parsed) && parsed > 0 ? parsed : fallback;
}

function parseSummary() {
  const text = Array.from(document.querySelectorAll<HTMLElement>("#booking pre, #booking aside, #booking div"))
    .map((node) => node.textContent || "")
    .find((value) => value.includes("Storlek:") || value.includes("Size:")) || "";

  function match(labels: string[]) {
    for (const label of labels) {
      const result = text.match(new RegExp(`${label}:\\s*([^\\n]+)`, "i"));
      if (result?.[1]) return result[1].trim();
    }
    return "";
  }

  return {
    service: selectedButtonText(["Hemstädning", "Flyttstädning", "Storstädning", "Kontorsstädning", "Fönsterputs", "Home cleaning", "Move-out cleaning", "Deep cleaning", "Office cleaning", "Window cleaning"]) || match(["Tjänst", "Service"]),
    sqm: numeric(match(["Storlek", "Size"]), 75),
    rooms: numeric(match(["Antal rum", "Rooms"]), 3),
    bathrooms: numeric(match(["Antal badrum", "Bathrooms"]), 1),
    pets: match(["Husdjur", "Pets"]),
    floor: numeric(match(["Våning", "Floor"]), 0),
    elevator: match(["Hiss", "Elevator"]),
    parking: match(["Parkering", "Parking"]),
    frequency: match(["Frekvens", "Frequency"])
  };
}

function pricingAccess(): PricingAccess {
  return state.windowAccess.includes("Svår") || state.windowAccess.includes("Difficult") ? "Svår åtkomst" : "Normal";
}

function pricingWindowSide(): PricingWindowSide {
  if (state.windowSides.includes("Endast insida") || state.windowSides.includes("Inside only")) return "Endast insida";
  if (state.windowSides.includes("Endast utsida") || state.windowSides.includes("Outside only")) return "Endast utsida";
  return "Båda sidor";
}

function pricingBalconyGlass(): PricingBalconyGlass {
  if (state.balconyGlass.includes("Ja") || state.balconyGlass.includes("Yes")) {
    return state.balconyType.includes("Stor") || state.balconyType.includes("Terrace") || state.balconyType.includes("Large") ? "Stor" : "Liten";
  }
  return "Nej";
}

function selectedAddonsList(showWindows: boolean, showBalcony: boolean) {
  const selected = Array.from(document.querySelectorAll<HTMLButtonElement>("#booking button"))
    .filter(isSelected)
    .map((button) => button.textContent?.trim() || "")
    .map((item) => normalizePricingAddOn(item))
    .filter(Boolean) as NonNullable<ReturnType<typeof normalizePricingAddOn>>[];
  if (showWindows && !selected.includes("Fönsterputs")) selected.push("Fönsterputs");
  if (showBalcony && !selected.includes("Balkong")) selected.push("Balkong");
  return Array.from(new Set(selected));
}

function calculateEstimate(showWindows: boolean, showBalcony: boolean) {
  const summary = parseSummary();
  const service = normalizePricingService(summary.service || (showWindows && !showBalcony ? "Fönsterputs" : "Hemstädning"));
  const selectedAddOns = selectedAddonsList(showWindows, showBalcony);
  const windows = numeric(state.windowCount, showWindows ? 8 : 0);
  const useRut = service !== "Kontorsstädning";

  return estimatePrice({
    service,
    sqm: summary.sqm,
    frequency: normalizePricingFrequency(summary.frequency || "Engång"),
    bathrooms: summary.bathrooms,
    rooms: summary.rooms,
    windows,
    officeVisits: 1,
    officeToilets: 1,
    condition: "Normal" as PricingCondition,
    furnished: "Tom bostad" as PricingFurnished,
    pets: normalizePricingYesNo(summary.pets),
    floor: summary.floor,
    elevator: normalizePricingYesNo(summary.elevator) as PricingYesNo,
    parking: normalizePricingYesNo(summary.parking) as PricingYesNo,
    access: pricingAccess(),
    shortNotice: "Nej",
    weekend: "Nej",
    windowSide: pricingWindowSide(),
    balconyGlass: pricingBalconyGlass(),
    kitchen: "Ja",
    selectedAddOns,
    useRut
  });
}

function buildAddonBlock(showWindows: boolean, showBalcony: boolean) {
  const t = copy();
  const lines = [BLOCK_START];

  if (showWindows) {
    lines.push(isEnglish() ? "Window cleaning:" : "Fönsterputs:");
    lines.push(`${t.windowCount}: ${state.windowCount || t.notFilled}`);
    lines.push(`${t.windowCleaning}: ${state.windowSides}`);
    lines.push(`${t.access}: ${state.windowAccess}`);
  }

  if (showBalcony) {
    if (showWindows) lines.push("");
    lines.push(isEnglish() ? "Balcony:" : "Balkong:");
    lines.push(`${t.balconyType}: ${state.balconyType}`);
    lines.push(`${t.balconyGlass}: ${state.balconyGlass}`);
    lines.push(`${t.balconyDetails}: ${state.balconyNotes || t.notFilled}`);
  }

  lines.push(BLOCK_END);
  return lines.join("\n");
}

function buildPriceBlock(showWindows: boolean, showBalcony: boolean) {
  if (!showWindows && !showBalcony) return "";
  const t = copy();
  const estimate = calculateEstimate(showWindows, showBalcony);
  const lines = [PRICE_START];
  lines.push(`${t.estimateTitle}: ${estimate.title}`);
  lines.push(`${t.beforeRut}: ${formatSek(estimate.beforeRut)}`);
  lines.push(`${t.afterRut}: ${formatSek(estimate.afterRut)}`);
  if (estimate.hours) lines.push(`${t.time}: ${estimate.hours.toFixed(1).replace(".", ",")} timmar / hours`);
  lines.push(`Risk: ${estimate.riskLevel}`);
  lines.push(t.note);
  lines.push(PRICE_END);
  return lines.join("\n");
}

function renderEstimate(panel: HTMLElement, showWindows: boolean, showBalcony: boolean) {
  const box = panel.querySelector<HTMLElement>("[data-iboren-addon-estimate='1']");
  if (!box) return;
  if (!showWindows && !showBalcony) {
    box.style.display = "none";
    return;
  }
  const t = copy();
  const estimate = calculateEstimate(showWindows, showBalcony);
  box.style.display = "block";
  box.innerHTML = `
    <p class="text-xs font-black uppercase tracking-[.22em] text-gold">${t.estimateTitle}</p>
    <div class="mt-3 grid gap-3 sm:grid-cols-3">
      <div class="rounded-2xl bg-porcelain/10 p-3"><p class="text-xs text-porcelain/60">${t.beforeRut}</p><p class="mt-1 text-lg font-black text-gold">${formatSek(estimate.beforeRut)}</p></div>
      <div class="rounded-2xl bg-porcelain/10 p-3"><p class="text-xs text-porcelain/60">${t.afterRut}</p><p class="mt-1 text-lg font-black text-gold">${formatSek(estimate.afterRut)}</p></div>
      <div class="rounded-2xl bg-porcelain/10 p-3"><p class="text-xs text-porcelain/60">Risk</p><p class="mt-1 text-lg font-black text-gold">${estimate.riskLevel}</p></div>
    </div>
    <p class="mt-3 text-xs leading-5 text-porcelain/60">${t.note}</p>
  `;
}

function updateNotes(showWindows: boolean, showBalcony: boolean) {
  const textarea = findTextarea();
  if (!textarea) return;
  const base = stripGeneratedBlocks(textarea.value || "");
  const addonBlock = showWindows || showBalcony ? buildAddonBlock(showWindows, showBalcony) : "";
  const priceBlock = buildPriceBlock(showWindows, showBalcony);
  const nextValue = [base, addonBlock, priceBlock].filter(Boolean).join("\n\n");
  setNativeTextareaValue(textarea, nextValue);
}

function input(label: string, value: string, onChange: (value: string) => void, placeholder = "") {
  const wrapper = document.createElement("label");
  wrapper.className = "block";

  const span = document.createElement("span");
  span.className = "mb-2 block text-sm font-bold text-porcelain/80";
  span.textContent = label;

  const field = document.createElement("input");
  field.className = "w-full rounded-2xl border border-porcelain/10 bg-porcelain px-4 py-4 text-ink placeholder:text-ink/45 outline-none";
  field.value = value;
  field.placeholder = placeholder;
  field.addEventListener("input", () => onChange(field.value));

  wrapper.appendChild(span);
  wrapper.appendChild(field);
  return wrapper;
}

function select(label: string, value: string, options: string[], onChange: (value: string) => void) {
  const wrapper = document.createElement("label");
  wrapper.className = "block";

  const span = document.createElement("span");
  span.className = "mb-2 block text-sm font-bold text-porcelain/80";
  span.textContent = label;

  const field = document.createElement("select");
  field.className = "w-full rounded-2xl border border-porcelain/10 bg-porcelain px-4 py-4 text-ink outline-none";
  for (const option of options) {
    const element = document.createElement("option");
    element.value = option;
    element.textContent = option;
    field.appendChild(element);
  }
  field.value = value;
  field.addEventListener("change", () => onChange(field.value));

  wrapper.appendChild(span);
  wrapper.appendChild(field);
  return wrapper;
}

function createPanel() {
  const t = copy();
  const panel = document.createElement("div");
  panel.dataset.iborenAddonDetails = "1";
  panel.className = "hidden rounded-[1.5rem] border border-gold/20 bg-night/35 p-4";

  const title = document.createElement("p");
  title.className = "text-xs font-black uppercase tracking-[.22em] text-gold";
  title.textContent = t.title;
  panel.appendChild(title);

  const help = document.createElement("p");
  help.className = "mt-2 text-sm leading-6 text-porcelain/65";
  help.textContent = t.help;
  panel.appendChild(help);

  const windowBox = document.createElement("div");
  windowBox.dataset.iborenWindowDetails = "1";
  windowBox.className = "mt-4 grid gap-3 sm:grid-cols-3";
  windowBox.appendChild(input(t.windowCount, state.windowCount, (value) => { state.windowCount = value.replace(/[^0-9]/g, ""); sync(); }, t.windowPlaceholder));
  windowBox.appendChild(select(t.windowCleaning, state.windowSides, ["Båda sidor / Both sides", "Endast insida / Inside only", "Endast utsida / Outside only"], (value) => { state.windowSides = value; sync(); }));
  windowBox.appendChild(select(t.access, state.windowAccess, ["Normal åtkomst / Normal access", "Svår åtkomst / Difficult access", "Vet ej / Not sure"], (value) => { state.windowAccess = value; sync(); }));
  panel.appendChild(windowBox);

  const balconyBox = document.createElement("div");
  balconyBox.dataset.iborenBalconyDetails = "1";
  balconyBox.className = "mt-4 grid gap-3 sm:grid-cols-3";
  balconyBox.appendChild(select(t.balconyType, state.balconyType, ["Balkong / Balcony", "Fransk balkong / French balcony", "Stor balkong / Large balcony", "Terrass / Terrace", "Vet ej / Not sure"], (value) => { state.balconyType = value; sync(); }));
  balconyBox.appendChild(select(t.balconyGlass, state.balconyGlass, ["Ja / Yes", "Nej / No", "Vet ej / Not sure"], (value) => { state.balconyGlass = value; sync(); }));
  balconyBox.appendChild(input(t.balconyDetails, state.balconyNotes, (value) => { state.balconyNotes = value; sync(); }, t.balconyPlaceholder));
  panel.appendChild(balconyBox);

  const estimateBox = document.createElement("div");
  estimateBox.dataset.iborenAddonEstimate = "1";
  estimateBox.className = "mt-4 rounded-2xl border border-gold/20 bg-night/45 p-4";
  panel.appendChild(estimateBox);

  return panel;
}

function selectedAddons() {
  const windowButtons = findButtonsByTexts(["Fönsterputs", "Window cleaning"]);
  const serviceWindow = Boolean(windowButtons[0] && isSelected(windowButtons[0]));
  const extraWindow = Boolean(windowButtons.at(-1) && isSelected(windowButtons.at(-1)!));
  const balconyButton = findFirstButtonByTexts(["Balkong", "Balcony"]);

  return {
    showWindows: serviceWindow || extraWindow,
    showBalcony: Boolean(balconyButton && isSelected(balconyButton))
  };
}

function sync() {
  const panel = document.querySelector<HTMLElement>("[data-iboren-addon-details='1']");
  if (!panel) return;
  const { showWindows, showBalcony } = selectedAddons();
  const windowBox = panel.querySelector<HTMLElement>("[data-iboren-window-details='1']");
  const balconyBox = panel.querySelector<HTMLElement>("[data-iboren-balcony-details='1']");

  panel.classList.toggle("hidden", !showWindows && !showBalcony);
  if (windowBox) windowBox.style.display = showWindows ? "grid" : "none";
  if (balconyBox) balconyBox.style.display = showBalcony ? "grid" : "none";
  renderEstimate(panel, showWindows, showBalcony);
  updateNotes(showWindows, showBalcony);
}

function mount() {
  if (!isBookingPage()) return;
  if (document.querySelector("[data-iboren-addon-details='1']")) {
    sync();
    return;
  }

  const extraButton = findFirstButtonByTexts(["Balkong", "Balcony", "Fönsterputs", "Window cleaning"]);
  const extraGrid = extraButton?.parentElement;
  if (!extraGrid) return;

  const panel = createPanel();
  extraGrid.insertAdjacentElement("afterend", panel);
  sync();
}

export default function BookingAddonDetailsEnhancer() {
  useEffect(() => {
    mount();
    const changeHandler = () => window.setTimeout(sync, 80);
    document.addEventListener("click", changeHandler);
    document.addEventListener("input", changeHandler);
    document.addEventListener("change", changeHandler);
    const observer = new MutationObserver(mount);
    observer.observe(document.body, { childList: true, subtree: true });
    window.setTimeout(mount, 500);
    window.setTimeout(mount, 1500);
    return () => {
      document.removeEventListener("click", changeHandler);
      document.removeEventListener("input", changeHandler);
      document.removeEventListener("change", changeHandler);
      observer.disconnect();
    };
  }, []);

  return null;
}
