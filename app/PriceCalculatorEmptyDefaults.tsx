"use client";

import { useEffect } from "react";

function cleanText(value: unknown) {
  return String(value ?? "").replace(/\s+/g, " ").trim();
}

function normalize(value: unknown) {
  return cleanText(value).toLowerCase();
}

function setNativeValue(element: HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement, value: string) {
  const prototype = Object.getPrototypeOf(element);
  const setter = Object.getOwnPropertyDescriptor(prototype, "value")?.set;
  setter?.call(element, value);
  element.dispatchEvent(new Event("input", { bubbles: true }));
  element.dispatchEvent(new Event("change", { bubbles: true }));
}

function labelText(label: HTMLLabelElement) {
  return normalize(label.querySelector("span")?.textContent || label.textContent);
}

function findControlByLabel(calculator: HTMLElement, labels: string[]) {
  const wanted = labels.map(normalize);
  const allLabels = Array.from(calculator.querySelectorAll("label"));
  for (const label of allLabels) {
    const text = labelText(label as HTMLLabelElement);
    if (!wanted.some((item) => text.includes(item))) continue;
    const control = label.querySelector("input, textarea, select") as HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement | null;
    if (control) return control;
  }
  return null;
}

function visibleInputHasValue(calculator: HTMLElement, labels: string[]) {
  const control = findControlByLabel(calculator, labels);
  if (!control) return true;
  const label = control.closest("label") as HTMLElement | null;
  if (label && label.offsetParent === null) return true;
  return cleanText(control.value).length > 0;
}

function getCalculatorLanguage(calculator: HTMLElement) {
  return calculator.id === "price-calculator" ? "en" : "sv";
}

function clearDefaultInputs(calculator: HTMLElement) {
  if (calculator.dataset.iborenEmptyDefaultsApplied === "1") return;
  calculator.dataset.iborenEmptyDefaultsApplied = "1";

  const defaults = new Set(["75", "3", "1", "8", "0", "151 46"]);
  const fieldsToClear = [
    "Storlek kvm", "Size sqm",
    "Antal rum", "Rooms",
    "Antal badrum", "Bathrooms",
    "Antal fönster", "Number of windows",
    "Besök per vecka", "Visits per week",
    "Antal toaletter", "Number of toilets",
    "Våning", "Floor",
    "Postnummer", "Postal code"
  ];

  Array.from(calculator.querySelectorAll("label")).forEach((label) => {
    const text = labelText(label as HTMLLabelElement);
    if (!fieldsToClear.some((field) => text.includes(normalize(field)))) return;
    const control = label.querySelector("input, textarea") as HTMLInputElement | HTMLTextAreaElement | null;
    if (!control) return;
    if (defaults.has(cleanText(control.value))) setNativeValue(control, "");
  });
}

function requiredDetailsAreFilled(calculator: HTMLElement) {
  const lang = getCalculatorLanguage(calculator);
  const serviceControl = findControlByLabel(calculator, lang === "en" ? ["Service"] : ["Tjänst"]);
  const service = normalize(serviceControl?.value);

  const required: string[][] = lang === "en"
    ? [["Size sqm"], service.includes("office") ? ["Visits per week"] : ["Rooms"], service.includes("office") ? ["Number of toilets"] : ["Bathrooms"]]
    : [["Storlek kvm"], service.includes("kontor") ? ["Besök per vecka"] : ["Antal rum"], service.includes("kontor") ? ["Antal toaletter"] : ["Antal badrum"]];

  if (service.includes("window") || service.includes("fönster")) {
    required.push(lang === "en" ? ["Number of windows"] : ["Antal fönster"]);
  }

  return required.every((labels) => visibleInputHasValue(calculator, labels));
}

function updateCalculatorState(calculator: HTMLElement) {
  const valid = requiredDetailsAreFilled(calculator);
  const lang = getCalculatorLanguage(calculator);
  const noticeId = "iboren-calculator-empty-notice";
  const existingNotice = calculator.querySelector(`#${noticeId}`);

  if (!valid && !existingNotice) {
    const notice = document.createElement("div");
    notice.id = noticeId;
    notice.className = "mt-7 rounded-[2rem] border border-burgundy/10 bg-cream p-6 text-sm font-bold leading-7 text-ink/75";
    notice.textContent = lang === "en" ? "Fill in the details above to see a useful price estimate." : "Fyll i uppgifterna ovan för att se en användbar prisindikation.";
    const grid = calculator.querySelector(".grid.gap-4");
    grid?.insertAdjacentElement("afterend", notice);
  }

  if (valid) existingNotice?.remove();

  const resultCards = Array.from(calculator.querySelectorAll<HTMLElement>("div.rounded-\\[2rem\\].bg-burgundy, div.bg-burgundy"));
  resultCards.forEach((card) => {
    const text = normalize(card.textContent);
    const looksLikeResult = text.includes("rut") || text.includes("price") || text.includes("pris") || text.includes("uppskattat");
    if (looksLikeResult) card.style.display = valid ? "" : "none";
  });

  const links = Array.from(calculator.querySelectorAll<HTMLAnchorElement>("a[href='/#booking'], a[href='#booking'], a[href='/en#booking']"));
  links.forEach((link) => {
    link.dataset.iborenRequiredMissing = valid ? "0" : "1";
    link.setAttribute("aria-disabled", valid ? "false" : "true");
    link.classList.toggle("opacity-55", !valid);
    link.classList.toggle("cursor-not-allowed", !valid);
  });
}

function applyToCalculators() {
  document.querySelectorAll<HTMLElement>("#pris-kalkylator, #price-calculator").forEach((calculator) => {
    clearDefaultInputs(calculator);
    updateCalculatorState(calculator);
  });
}

export default function PriceCalculatorEmptyDefaults() {
  useEffect(() => {
    function handleChange(event: Event) {
      if ((event.target as Element | null)?.closest("#pris-kalkylator, #price-calculator")) applyToCalculators();
    }

    function handleClick(event: MouseEvent) {
      const target = event.target as Element | null;
      const link = target?.closest("a[href='/#booking'], a[href='#booking'], a[href='/en#booking']") as HTMLAnchorElement | null;
      const calculator = link?.closest("#pris-kalkylator, #price-calculator") as HTMLElement | null;
      if (!calculator) return;
      updateCalculatorState(calculator);
      if (link?.dataset.iborenRequiredMissing === "1") {
        event.preventDefault();
        event.stopPropagation();
        calculator.querySelector("#iboren-calculator-empty-notice")?.scrollIntoView({ behavior: "smooth", block: "center" });
      }
    }

    applyToCalculators();
    const timers = [80, 250, 700, 1400].map((delay) => window.setTimeout(applyToCalculators, delay));
    document.addEventListener("input", handleChange, true);
    document.addEventListener("change", handleChange, true);
    document.addEventListener("click", handleClick, true);

    return () => {
      timers.forEach((timer) => window.clearTimeout(timer));
      document.removeEventListener("input", handleChange, true);
      document.removeEventListener("change", handleChange, true);
      document.removeEventListener("click", handleClick, true);
    };
  }, []);

  return null;
}
