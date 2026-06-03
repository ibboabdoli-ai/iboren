"use client";

import { useEffect } from "react";

const BLOCK_START = "--- Tilläggsdetaljer / Add-on details ---";
const BLOCK_END = "--- Slut tilläggsdetaljer / End add-on details ---";

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
    help: en ? "Add extra details for window cleaning or balcony. The information is saved automatically in customer notes." : "Fyll i extra information för fönsterputs eller balkong. Informationen sparas automatiskt i kundens önskemål.",
    windowCount: en ? "Number of windows" : "Antal fönster",
    windowCleaning: en ? "Window cleaning" : "Fönsterputs",
    access: en ? "Access" : "Åtkomst",
    balconyType: en ? "Balcony type" : "Balkongtyp",
    balconyGlass: en ? "Glazed balcony" : "Inglasad balkong",
    balconyDetails: en ? "Balcony details" : "Balkongdetaljer",
    windowPlaceholder: en ? "e.g. 8" : "t.ex. 8",
    balconyPlaceholder: en ? "e.g. glazed, dirty, furniture" : "t.ex. inglasad, smutsig, möbler",
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

function findTextarea() {
  return document.querySelector<HTMLTextAreaElement>("#booking textarea");
}

function setNativeTextareaValue(textarea: HTMLTextAreaElement, value: string) {
  const prototype = window.HTMLTextAreaElement.prototype;
  const descriptor = Object.getOwnPropertyDescriptor(prototype, "value");
  descriptor?.set?.call(textarea, value);
  textarea.dispatchEvent(new Event("input", { bubbles: true }));
}

function stripAddonBlock(value: string) {
  const legacyStarts = ["--- Tilläggsdetaljer ---", "--- Tilläggsdetaljer / Add-on details ---"];
  const legacyEnds = ["--- Slut tilläggsdetaljer ---", "--- Slut tilläggsdetaljer / End add-on details ---"];

  let cleaned = value.trim();
  for (const startMarker of legacyStarts) {
    const start = cleaned.indexOf(startMarker);
    if (start < 0) continue;
    const endMarker = legacyEnds.find((marker) => cleaned.indexOf(marker, start) >= 0);
    if (!endMarker) continue;
    const end = cleaned.indexOf(endMarker, start);
    cleaned = `${cleaned.slice(0, start).trim()}\n${cleaned.slice(end + endMarker.length).trim()}`.trim();
  }
  return cleaned;
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

function updateNotes(showWindows: boolean, showBalcony: boolean) {
  const textarea = findTextarea();
  if (!textarea) return;
  const base = stripAddonBlock(textarea.value || "");
  const addonBlock = showWindows || showBalcony ? buildAddonBlock(showWindows, showBalcony) : "";
  const nextValue = [base, addonBlock].filter(Boolean).join("\n\n");
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
    const clickHandler = () => window.setTimeout(sync, 80);
    document.addEventListener("click", clickHandler);
    const observer = new MutationObserver(mount);
    observer.observe(document.body, { childList: true, subtree: true });
    window.setTimeout(mount, 500);
    window.setTimeout(mount, 1500);
    return () => {
      document.removeEventListener("click", clickHandler);
      observer.disconnect();
    };
  }, []);

  return null;
}
