"use client";

import { useEffect } from "react";

const BLOCK_START = "--- Tilläggsdetaljer ---";
const BLOCK_END = "--- Slut tilläggsdetaljer ---";

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
  windowSides: "Båda sidor",
  windowAccess: "Normal åtkomst",
  balconyType: "Balkong",
  balconyGlass: "Vet ej",
  balconyNotes: ""
};

function normalize(text: string) {
  return text.toLowerCase().replace(/\s+/g, " ").trim();
}

function isSelected(button: HTMLButtonElement) {
  return button.className.includes("bg-gold") || button.getAttribute("aria-pressed") === "true";
}

function findButtonByText(text: string) {
  return Array.from(document.querySelectorAll<HTMLButtonElement>("#booking button")).find((button) => normalize(button.textContent || "") === normalize(text));
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
  const start = value.indexOf(BLOCK_START);
  const end = value.indexOf(BLOCK_END);
  if (start < 0 || end < start) return value.trim();
  return `${value.slice(0, start).trim()}\n${value.slice(end + BLOCK_END.length).trim()}`.trim();
}

function buildAddonBlock(showWindows: boolean, showBalcony: boolean) {
  const lines = [BLOCK_START];

  if (showWindows) {
    lines.push("Fönsterputs:");
    lines.push(`Antal fönster: ${state.windowCount || "Ej ifyllt"}`);
    lines.push(`Putsning: ${state.windowSides}`);
    lines.push(`Åtkomst: ${state.windowAccess}`);
  }

  if (showBalcony) {
    if (showWindows) lines.push("");
    lines.push("Balkong:");
    lines.push(`Typ: ${state.balconyType}`);
    lines.push(`Inglasad balkong: ${state.balconyGlass}`);
    lines.push(`Detaljer: ${state.balconyNotes || "Ej ifyllt"}`);
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
  const panel = document.createElement("div");
  panel.dataset.iborenAddonDetails = "1";
  panel.className = "hidden rounded-[1.5rem] border border-gold/20 bg-night/35 p-4";

  const title = document.createElement("p");
  title.className = "text-xs font-black uppercase tracking-[.22em] text-gold";
  title.textContent = "Detaljer för valda tillägg";
  panel.appendChild(title);

  const help = document.createElement("p");
  help.className = "mt-2 text-sm leading-6 text-porcelain/65";
  help.textContent = "Fyll i extra information för fönsterputs eller balkong. Informationen sparas automatiskt i kundens önskemål.";
  panel.appendChild(help);

  const windowBox = document.createElement("div");
  windowBox.dataset.iborenWindowDetails = "1";
  windowBox.className = "mt-4 grid gap-3 sm:grid-cols-3";
  windowBox.appendChild(input("Antal fönster", state.windowCount, (value) => { state.windowCount = value.replace(/[^0-9]/g, ""); sync(); }, "t.ex. 8"));
  windowBox.appendChild(select("Fönsterputs", state.windowSides, ["Båda sidor", "Endast insida", "Endast utsida"], (value) => { state.windowSides = value; sync(); }));
  windowBox.appendChild(select("Åtkomst", state.windowAccess, ["Normal åtkomst", "Svår åtkomst", "Vet ej"], (value) => { state.windowAccess = value; sync(); }));
  panel.appendChild(windowBox);

  const balconyBox = document.createElement("div");
  balconyBox.dataset.iborenBalconyDetails = "1";
  balconyBox.className = "mt-4 grid gap-3 sm:grid-cols-3";
  balconyBox.appendChild(select("Balkongtyp", state.balconyType, ["Balkong", "Fransk balkong", "Stor balkong", "Terrass", "Vet ej"], (value) => { state.balconyType = value; sync(); }));
  balconyBox.appendChild(select("Inglasad balkong", state.balconyGlass, ["Ja", "Nej", "Vet ej"], (value) => { state.balconyGlass = value; sync(); }));
  balconyBox.appendChild(input("Balkongdetaljer", state.balconyNotes, (value) => { state.balconyNotes = value; sync(); }, "t.ex. inglasad, smutsig, möbler"));
  panel.appendChild(balconyBox);

  return panel;
}

function selectedAddons() {
  const serviceWindow = isSelected(findButtonByText("Fönsterputs") || document.createElement("button"));
  const extraWindowButton = Array.from(document.querySelectorAll<HTMLButtonElement>("#booking button")).filter((button) => normalize(button.textContent || "") === "fönsterputs").at(-1);
  const extraBalconyButton = findButtonByText("Balkong");

  return {
    showWindows: serviceWindow || Boolean(extraWindowButton && isSelected(extraWindowButton)),
    showBalcony: Boolean(extraBalconyButton && isSelected(extraBalconyButton))
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
  if (window.location.pathname !== "/") return;
  if (document.querySelector("[data-iboren-addon-details='1']")) {
    sync();
    return;
  }

  const extraButton = findButtonByText("Balkong") || findButtonByText("Fönsterputs");
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
