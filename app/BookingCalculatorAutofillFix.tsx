"use client";

import { useEffect } from "react";

const STORAGE_KEY = "iboren:calculatorEstimate:v1";

type CalculatorEstimate = {
  inputs?: Record<string, string>;
  selectedButtons?: string[];
};

function cleanText(value: unknown) {
  return String(value ?? "").replace(/\s+/g, " ").trim();
}

function normalize(value: unknown) {
  return cleanText(value).toLowerCase();
}

function readStoredEstimate(): CalculatorEstimate | null {
  try {
    const raw = window.sessionStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as CalculatorEstimate;
  } catch {
    return null;
  }
}

function getInputByKeywords(estimate: CalculatorEstimate, keywords: string[]) {
  const entries = Object.entries(estimate.inputs || {});
  const wanted = keywords.map(normalize);
  const match = entries.find(([key, value]) => cleanText(value) && wanted.some((keyword) => normalize(key).includes(keyword)));
  return cleanText(match?.[1]);
}

function setNativeValue(element: HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement, value: string) {
  const prototype = Object.getPrototypeOf(element);
  const setter = Object.getOwnPropertyDescriptor(prototype, "value")?.set;
  setter?.call(element, value);
  element.dispatchEvent(new Event("input", { bubbles: true }));
  element.dispatchEvent(new Event("change", { bubbles: true }));
}

function findInputByLabel(form: HTMLElement, keywords: string[]) {
  const wanted = keywords.map(normalize);
  const labels = Array.from(form.querySelectorAll("label"));
  for (const label of labels) {
    const text = normalize(label.textContent);
    if (!wanted.some((keyword) => text.includes(keyword))) continue;
    const control = label.querySelector("input, textarea, select") as HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement | null;
    if (control) return control;
  }
  return null;
}

function fillTextField(form: HTMLElement, keywords: string[], value: string) {
  if (!cleanText(value)) return;
  const control = findInputByLabel(form, keywords);
  if (control instanceof HTMLInputElement || control instanceof HTMLTextAreaElement) setNativeValue(control, value);
}

function findBlockByTitle(form: HTMLElement, titles: string[]) {
  const wanted = titles.map(normalize);
  const nodes = Array.from(form.querySelectorAll("p, h2, h3, h4, div"));
  const titleNode = nodes.find((node) => wanted.some((title) => normalize(node.textContent) === title));
  return titleNode?.parentElement || null;
}

function clickButtonInBlock(block: HTMLElement | null, labels: string[]) {
  if (!block) return;
  const wanted = labels.map(normalize);
  const button = Array.from(block.querySelectorAll("button")).find((item) => wanted.includes(normalize(item.textContent)));
  if (!button) return;
  const className = cleanText(button.getAttribute("class"));
  const selected = className.includes("bg-gold") || className.includes("bg-burgundy");
  if (!selected) button.click();
}

function clickServiceButton(form: HTMLElement, service: string) {
  const map: Record<string, string[]> = {
    "hemstädning": ["Hemstädning", "Home cleaning"],
    "home cleaning": ["Hemstädning", "Home cleaning"],
    "flyttstädning": ["Flyttstädning", "Move-out cleaning"],
    "move-out cleaning": ["Flyttstädning", "Move-out cleaning"],
    "kontorsstädning": ["Kontorsstädning", "Office cleaning"],
    "office cleaning": ["Kontorsstädning", "Office cleaning"],
    "fönsterputs": ["Fönsterputs", "Window cleaning"],
    "window cleaning": ["Fönsterputs", "Window cleaning"],
    "storstädning": ["Hemstädning", "Home cleaning"],
    "deep cleaning": ["Hemstädning", "Home cleaning"]
  };

  const labels = map[normalize(service)];
  if (!labels) return;
  const serviceBlock = findBlockByTitle(form, ["Tjänst", "Service"]);
  clickButtonInBlock(serviceBlock, labels);
}

function applyExtraServices(form: HTMLElement, estimate: CalculatorEstimate) {
  const selected = (estimate.selectedButtons || []).map(normalize);
  const has = (labels: string[]) => labels.some((label) => selected.includes(normalize(label)));
  const extrasBlock = findBlockByTitle(form, ["Extra tjänster", "Extra services"]);

  if (has(["Fönsterputs", "Window cleaning"])) clickButtonInBlock(extrasBlock, ["Fönsterputs", "Window cleaning"]);
  if (has(["Ugnsrengöring", "Oven cleaning", "Oven"])) clickButtonInBlock(extrasBlock, ["Ugn", "Oven"]);
  if (has(["Kyl/frys", "Fridge/freezer"])) clickButtonInBlock(extrasBlock, ["Kyl/frys", "Fridge/freezer"]);
  if (has(["Balkong", "Balcony"])) clickButtonInBlock(extrasBlock, ["Balkong", "Balcony"]);
  if (has(["Extra smutsigt", "Grovstädning", "Deep cleaning"])) clickButtonInBlock(extrasBlock, ["Grovstädning", "Deep cleaning"]);
  if (has(["Skåp/lådor", "Cabinets/drawers"])) clickButtonInBlock(extrasBlock, ["Skåp/lådor", "Cabinets/drawers"]);
}

function applyAutofill() {
  const estimate = readStoredEstimate();
  const form = document.querySelector<HTMLElement>("#booking form");
  if (!estimate || !form) return;

  const submitText = normalize(form.querySelector("button[type='submit']")?.textContent);
  if (submitText.includes("skickar") || submitText.includes("sending")) return;

  const service = getInputByKeywords(estimate, ["tjänst", "service"]);
  const sqm = getInputByKeywords(estimate, ["storlek", "size sqm", "size"]);
  const rooms = getInputByKeywords(estimate, ["antal rum", "rooms"]);
  const bathrooms = getInputByKeywords(estimate, ["antal badrum", "bathrooms"]);

  clickServiceButton(form, service);
  fillTextField(form, ["storlek", "size"], sqm);
  fillTextField(form, ["antal rum", "rooms"], rooms);
  fillTextField(form, ["antal badrum", "bathrooms"], bathrooms);
  applyExtraServices(form, estimate);
}

export default function BookingCalculatorAutofillFix() {
  useEffect(() => {
    const timers = [80, 250, 600, 1200, 2200].map((delay) => window.setTimeout(applyAutofill, delay));
    return () => timers.forEach((timer) => window.clearTimeout(timer));
  }, []);

  return null;
}
