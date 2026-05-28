"use client";

import { useEffect } from "react";

const STORAGE_KEY = "iboren:calculatorEstimate:v1";

type CalculatorEstimate = {
  inputs?: Record<string, string>;
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
  if (!cleanText(value)) return false;
  const control = findInputByLabel(form, keywords);
  if (!(control instanceof HTMLInputElement || control instanceof HTMLTextAreaElement)) return false;
  setNativeValue(control, value);
  return true;
}

function autofillMissingCalculatorValues() {
  const estimate = readStoredEstimate();
  const form = document.querySelector<HTMLElement>("#booking form");
  if (!estimate || !form) return;

  const sqm = getInputByKeywords(estimate, ["storlek", "size sqm", "size"]);
  const rooms = getInputByKeywords(estimate, ["antal rum", "rooms"]);
  const bathrooms = getInputByKeywords(estimate, ["antal badrum", "bathrooms"]);

  fillTextField(form, ["storlek", "size"], sqm);
  fillTextField(form, ["antal rum", "rooms"], rooms);
  fillTextField(form, ["antal badrum", "bathrooms"], bathrooms);
}

export default function BookingCalculatorAutofillFix() {
  useEffect(() => {
    autofillMissingCalculatorValues();
    const observer = new MutationObserver(autofillMissingCalculatorValues);
    observer.observe(document.body, { childList: true, subtree: true });
    const timers = [80, 250, 600, 1200, 2200].map((delay) => window.setTimeout(autofillMissingCalculatorValues, delay));

    return () => {
      observer.disconnect();
      timers.forEach((timer) => window.clearTimeout(timer));
    };
  }, []);

  return null;
}
