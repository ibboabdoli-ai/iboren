"use client";

import { useEffect } from "react";

const INTERNAL_SECTION_MARKERS = [
  "--- Calculator snapshot ---",
  "--- Final booking submitted ---",
  "--- Changes after estimate ---",
  "--- Admin check ---"
];

const INLINE_LABELS = [
  "Typ av objekt",
  "Antal rum",
  "Antal badrum",
  "Husdjur",
  "Våning",
  "Hiss",
  "Parkering",
  "Extra tjänster",
  "Önskemål"
];

function valueAfter(text: string, label: string) {
  const match = text.match(new RegExp(`${label}:\\s*([^\\n]+)`, "i"));
  return match?.[1]?.trim() || "";
}

function normalizeBaseDetails(text: string) {
  let cleaned = text.trim();
  for (const label of INLINE_LABELS) {
    cleaned = cleaned.replace(new RegExp(`\\s+(${label}:)`, "g"), "\n$1");
  }
  return cleaned
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean)
    .join("\n");
}

function customerFacingNotes(raw: string) {
  const firstInternalIndex = INTERNAL_SECTION_MARKERS
    .map((marker) => raw.indexOf(marker))
    .filter((index) => index >= 0)
    .sort((a, b) => a - b)[0];

  const base = firstInternalIndex === undefined ? raw : raw.slice(0, firstInternalIndex);
  const customerLines = normalizeBaseDetails(base);

  if (firstInternalIndex === undefined) return customerLines;

  const estimateStatus = valueAfter(raw, "Estimate status");
  const beforeRut = valueAfter(raw, "Price before RUT");
  const afterRut = valueAfter(raw, "Price after RUT");
  const estimatedTime = valueAfter(raw, "Estimated time");

  const priceLines = [
    "Prisindikation:",
    estimateStatus ? `Status: ${estimateStatus}` : "",
    beforeRut ? `Före RUT: ${beforeRut}` : "",
    afterRut ? `Efter RUT: ${afterRut}` : "",
    estimatedTime ? `Uppskattad tid: ${estimatedTime}` : ""
  ].filter(Boolean).join("\n");

  return [customerLines, priceLines].filter(Boolean).join("\n\n");
}

function polishPre(pre: HTMLPreElement) {
  if (pre.dataset.iborenCustomerNotesPolished === "1") return;
  const raw = pre.textContent || "";
  if (!INTERNAL_SECTION_MARKERS.some((marker) => raw.includes(marker))) return;

  const cleaned = customerFacingNotes(raw);
  if (!cleaned) return;

  pre.dataset.iborenCustomerNotesPolished = "1";
  pre.textContent = cleaned;
}

function apply() {
  document.querySelectorAll<HTMLPreElement>("pre").forEach(polishPre);
}

export default function ProfileBookingNotesPolish() {
  useEffect(() => {
    apply();
    const observer = new MutationObserver(apply);
    observer.observe(document.body, { childList: true, subtree: true });
    window.setTimeout(apply, 250);
    window.setTimeout(apply, 1000);

    return () => observer.disconnect();
  }, []);

  return null;
}
