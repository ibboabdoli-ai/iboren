"use client";

import { useEffect } from "react";

function fixEnglishBookingText() {
  if (!(window.location.pathname === "/en" || window.location.pathname.startsWith("/en/"))) return;
  const booking = document.querySelector<HTMLElement>("#booking");
  if (!booking) return;

  booking.querySelectorAll<HTMLButtonElement>("button").forEach((button) => {
    const text = button.textContent?.trim() || "";
    if (text.includes("boknings") || text.includes("förfrågan")) {
      button.textContent = "Send booking request";
    }
  });

  const walker = document.createTreeWalker(booking, NodeFilter.SHOW_TEXT);
  const nodes: Text[] = [];
  while (walker.nextNode()) nodes.push(walker.currentNode as Text);

  nodes.forEach((node) => {
    const text = node.nodeValue || "";
    if (text.includes("obligatoriska") || text.includes("innan du skickar")) {
      node.nodeValue = "Fill in all required fields before sending.";
    }
  });
}

export default function EnglishBookingTextFix() {
  useEffect(() => {
    fixEnglishBookingText();
    const booking = document.querySelector("#booking");
    if (!booking) return;

    const observer = new MutationObserver(() => fixEnglishBookingText());
    observer.observe(booking, { childList: true, subtree: true, characterData: true });

    return () => observer.disconnect();
  }, []);

  return null;
}
