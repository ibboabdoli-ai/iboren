"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";

type Language = "sv" | "en";

function pageLanguage(): Language {
  return window.location.pathname.startsWith("/en") ? "en" : "sv";
}

function clean(value: string) {
  return value.trim().replace("*", "").toLowerCase();
}

function translate(value: string, language: Language) {
  if (language === "sv") return value;
  const map: Record<string, string> = {
    Hemstädning: "Home cleaning",
    Flyttstädning: "Move-out cleaning",
    Storstädning: "Deep cleaning",
    Kontorsstädning: "Office cleaning",
    Fönsterputs: "Window cleaning",
    Privatperson: "Private customer",
    Företag: "Company",
    Engång: "One-time",
    "Varje vecka": "Every week",
    "Varannan vecka": "Every other week",
    "Varje månad": "Every month",
    Ja: "Yes",
    Nej: "No",
    Smutsigt: "Dirty",
    "Mycket smutsigt": "Very dirty",
    "Svår åtkomst": "Difficult access",
    "Båda sidor": "Both sides",
    "Endast insida": "Inside only",
    "Endast utsida": "Outside only",
    Liten: "Small",
    Stor: "Large",
    Ugn: "Oven",
    "Kyl/frys": "Fridge/freezer",
    Balkong: "Balcony",
    Grovstädning: "Deep cleaning",
    "Skåp/lådor": "Cabinets/drawers"
  };
  return map[value] || value;
}

function labelText(label: HTMLLabelElement) {
  const span = label.querySelector("span");
  return clean(span?.textContent || label.textContent || "");
}

function findControl(form: HTMLFormElement, labels: string[]) {
  const targets = labels.map(clean);
  const label = Array.from(form.querySelectorAll<HTMLLabelElement>("label")).find((item) => targets.includes(labelText(item)));
  return label?.querySelector<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>("input, select, textarea") || null;
}

function fireFormEvents(control: HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement) {
  control.dispatchEvent(new Event("input", { bubbles: true }));
  control.dispatchEvent(new Event("change", { bubbles: true }));
}

function setInputValue(input: HTMLInputElement | HTMLTextAreaElement, value: string) {
  const prototype = input instanceof HTMLTextAreaElement ? HTMLTextAreaElement.prototype : HTMLInputElement.prototype;
  const descriptor = Object.getOwnPropertyDescriptor(prototype, "value");
  descriptor?.set?.call(input, value);
  fireFormEvents(input);
}

function setSelectValue(select: HTMLSelectElement, value: string) {
  const exists = Array.from(select.options).some((option) => option.value === value || option.textContent === value);
  if (!exists) return;
  const descriptor = Object.getOwnPropertyDescriptor(HTMLSelectElement.prototype, "value");
  descriptor?.set?.call(select, value);
  fireFormEvents(select);
}

function setControl(form: HTMLFormElement, labels: string[], value: string) {
  if (!value) return;
  const control = findControl(form, labels);
  if (!control) return;
  if (control instanceof HTMLSelectElement) setSelectValue(control, value);
  else setInputValue(control, value);
}

function isSelectedButton(button: HTMLButtonElement) {
  return button.className.includes("bg-gold") || button.className.includes("bg-burgundy");
}

function selectExtras(form: HTMLFormElement, extras: string[], language: Language) {
  if (!extras.length) return;
  const wanted = extras.map((item) => clean(translate(item, language)));
  for (const button of Array.from(form.querySelectorAll<HTMLButtonElement>('button[type="button"]'))) {
    const text = clean(button.textContent || "");
    if (!wanted.includes(text) || isSelectedButton(button)) continue;
    button.click();
  }
}

function showImportedNotice(form: HTMLFormElement, language: Language) {
  if (form.querySelector('[data-iboren-estimate-import="1"]')) return;
  const node = document.createElement("p");
  node.dataset.iborenEstimateImport = "1";
  node.className = "mb-5 rounded-2xl border border-gold/25 bg-gold/10 px-4 py-3 text-sm font-bold text-gold";
  node.textContent = language === "en"
    ? "Your estimate details have been added. Complete the address, date and contact details before sending."
    : "Din prisindikation har fyllts i. Komplettera adress, datum och kontaktuppgifter innan du skickar.";
  form.insertBefore(node, form.firstChild);
}

function applyEstimate(form: HTMLFormElement, params: URLSearchParams, language: Language) {
  setControl(form, ["Tjänst", "Service"], translate(params.get("service") || "", language));
  setControl(form, ["Kundtyp", "Customer type"], translate(params.get("customerType") || "", language));
  setControl(form, ["RUT-avdrag", "RUT deduction"], translate(params.get("rut") || "", language));
  setControl(form, ["Postnummer", "Postal code"], params.get("postalCode") || "");
  setControl(form, ["Storlek kvm", "Size sqm"], params.get("size") || "");
  setControl(form, ["Antal rum", "Rooms"], params.get("rooms") || "");
  setControl(form, ["Antal badrum", "Bathrooms"], params.get("bathrooms") || "");
  setControl(form, ["Husdjur", "Pets"], translate(params.get("pets") || "", language));
  setControl(form, ["Våning", "Floor"], params.get("floor") || "");
  setControl(form, ["Hiss", "Elevator"], translate(params.get("elevator") || "", language));
  setControl(form, ["Parkering", "Parking"], translate(params.get("parking") || "", language));
  setControl(form, ["Skick", "Condition"], translate(params.get("condition") || "", language));
  setControl(form, ["Åtkomst", "Access"], translate(params.get("access") || "", language));
  setControl(form, ["Kort varsel", "Short notice"], translate(params.get("shortNotice") || "", language));
  setControl(form, ["Helg/kväll", "Weekend/evening"], translate(params.get("weekend") || "", language));
  setControl(form, ["Frekvens", "Frequency"], translate(params.get("frequency") || "", language));

  const extras = (params.get("extras") || "").split("|").map((item) => item.trim()).filter(Boolean);
  window.setTimeout(() => {
    selectExtras(form, extras, language);
    window.setTimeout(() => {
      setControl(form, ["Antal fönster", "Number of windows"], params.get("windows") || "");
      setControl(form, ["Fönsterputs", "Window cleaning"], translate(params.get("windowSide") || "", language));
      setControl(form, ["Inglasad balkong", "Balcony glass"], translate(params.get("balconyGlass") || "", language));
    }, 150);
  }, 150);

  showImportedNotice(form, language);
}

function findBookingForm() {
  const addressField = document.getElementById("booking-address");
  return addressField?.closest("form") as HTMLFormElement | null;
}

export default function BookingEstimateQueryHydrator() {
  const pathname = usePathname();
  const isBookingPage = pathname === "/boka-utan-konto" || pathname === "/en/boka-utan-konto";

  useEffect(() => {
    if (!isBookingPage) return;
    const params = new URLSearchParams(window.location.search);
    if (params.get("estimate") !== "1") return;

    const language = pageLanguage();
    let attempts = 0;
    const timer = window.setInterval(() => {
      const form = findBookingForm();
      attempts += 1;
      if (!form && attempts < 40) return;
      window.clearInterval(timer);
      if (!form) return;
      applyEstimate(form, params, language);
      form.scrollIntoView({ behavior: "smooth", block: "start" });
    }, 250);

    return () => window.clearInterval(timer);
  }, [isBookingPage, pathname]);

  return null;
}
