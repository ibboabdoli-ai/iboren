"use client";

import { useEffect } from "react";

const BOOKING_NUMBER_LABEL = "Bokningsnummer:";
const BOOKING_ID_LABEL = "Boknings-ID:";

function isFriendlyBookingNumber(value: string) {
  return /^IB-\d{6}-[A-ZÅÄÖ]{3}-[A-ZÅÄÖ]{3}-\d{3}$/i.test(value.trim());
}

function polishNode(node: Element) {
  const text = node.textContent || "";
  const index = text.toLowerCase().indexOf(BOOKING_NUMBER_LABEL.toLowerCase());
  if (index < 0) return;

  const reference = text.slice(index + BOOKING_NUMBER_LABEL.length).trim().split(/\s+/)[0] || "";
  if (!reference || isFriendlyBookingNumber(reference)) return;

  for (const child of Array.from(node.childNodes)) {
    if (child.nodeType !== Node.TEXT_NODE || !child.textContent?.includes(BOOKING_NUMBER_LABEL)) continue;
    child.textContent = child.textContent.replace(BOOKING_NUMBER_LABEL, BOOKING_ID_LABEL);
  }
}

function apply() {
  document.querySelectorAll("p, span").forEach(polishNode);
}

export default function ProfileBookingReferencePolish() {
  useEffect(() => {
    apply();
    const observer = new MutationObserver(apply);
    observer.observe(document.body, { childList: true, subtree: true, characterData: true });
    window.setTimeout(apply, 250);
    window.setTimeout(apply, 1000);

    return () => observer.disconnect();
  }, []);

  return null;
}
