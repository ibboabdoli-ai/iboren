"use client";

import { useEffect } from "react";

const STORAGE_KEY = "iboren:calculatorEstimate:v1";

function cleanText(value: unknown) {
  return String(value ?? "").replace(/\s+/g, " ").trim();
}

function escapeRegex(value: string) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
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

function readLabelText(label: HTMLLabelElement) {
  const firstSpan = label.querySelector("span");
  const text = cleanText(firstSpan?.textContent || label.textContent);
  return text
    .replace("Show price with RUT deduction", "RUT")
    .replace("Visa pris med RUT-avdrag", "RUT")
    .trim();
}

function extractAfterLabel(text: string, labels: string[]) {
  for (const label of labels) {
    const escaped = escapeRegex(label);
    const match = text.match(new RegExp(`${escaped}\\s*([0-9][0-9\\s]*(?:kr|SEK)?(?:\\/(?:mån|month))?)`, "i"));
    if (match?.[1]) return cleanText(match[1]);
  }
  return "";
}

function extractEstimatedTime(text: string) {
  const match = text.match(/(?:Uppskattad tid: cirka|Estimated time: about)\s*([0-9,.]+\s*(?:timmar|hours)(?:\s*(?:per besök|per visit))?)/i);
  return cleanText(match?.[1]);
}

function extractRiskLabel(text: string) {
  const labels = [
    "Bra prisunderlag",
    "Behöver kontrolleras",
    "Manuell offert behövs",
    "Good estimate basis",
    "Needs review",
    "Manual quote needed"
  ];
  return labels.find((label) => text.includes(label)) || "";
}

function captureCalculatorEstimate(calculator: HTMLElement) {
  const inputs: Record<string, string> = {};

  calculator.querySelectorAll("label").forEach((labelElement) => {
    const label = labelElement as HTMLLabelElement;
    const control = label.querySelector("input, select, textarea");
    const labelText = readLabelText(label);
    if (!control || !labelText) return;
    inputs[labelText] = readControlValue(control);
  });

  const selectedButtons = Array.from(calculator.querySelectorAll("button"))
    .filter((button) => cleanText(button.className).includes("bg-burgundy"))
    .map((button) => cleanText(button.textContent))
    .filter(Boolean);

  const resultCard = Array.from(calculator.querySelectorAll("div"))
    .find((element) => {
      const className = cleanText(element.getAttribute("class"));
      const text = cleanText(element.textContent);
      return className.includes("bg-burgundy") && className.includes("text-porcelain") && (text.includes("RUT") || text.includes("estimate") || text.includes("pris"));
    }) as HTMLElement | undefined;

  const resultText = cleanText(resultCard?.textContent);

  return {
    version: "v1",
    capturedAt: new Date().toISOString(),
    language: calculator.id === "price-calculator" ? "en" : "sv",
    sourcePath: window.location.pathname,
    sourceHash: window.location.hash,
    inputs,
    selectedButtons,
    result: {
      title: cleanText(resultCard?.querySelector("p")?.textContent),
      riskLabel: extractRiskLabel(resultText),
      priceBeforeRut: extractAfterLabel(resultText, ["Före RUT / totalpris", "Before RUT / total price"]),
      priceAfterRut: extractAfterLabel(resultText, ["Efter RUT / kundpris", "After RUT / customer price", "Kundpris utan RUT", "Customer price without RUT", "Prisindikation", "Monthly estimate"]),
      estimatedTime: extractEstimatedTime(resultText),
      rawText: resultText
    }
  };
}

export default function CalculatorEstimateStorage() {
  useEffect(() => {
    function handleClick(event: MouseEvent) {
      const target = event.target as Element | null;
      const link = target?.closest("a[href='/#booking'], a[href='#booking'], a[href='/en#booking']");
      const calculator = link?.closest("#pris-kalkylator, #price-calculator") as HTMLElement | null;
      if (!calculator) return;

      try {
        const estimate = captureCalculatorEstimate(calculator);
        window.sessionStorage.setItem(STORAGE_KEY, JSON.stringify(estimate));
      } catch {
        // Do not block navigation if browser storage is unavailable.
      }
    }

    document.addEventListener("click", handleClick, true);
    return () => document.removeEventListener("click", handleClick, true);
  }, []);

  return null;
}
