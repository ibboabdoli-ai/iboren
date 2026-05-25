"use client";

import { useEffect } from "react";

const cutoffHours = 48;
const styleId = "iboren-profile-cancellation-policy";

function scheduledStart(dateText: string) {
  const date = new Date(`${dateText}T08:00:00`);
  return Number.isNaN(date.getTime()) ? null : date;
}

function canCancelOnline(dateText: string) {
  const scheduled = scheduledStart(dateText);
  if (!scheduled) return true;
  const hoursLeft = (scheduled.getTime() - Date.now()) / (60 * 60 * 1000);
  return hoursLeft > cutoffHours;
}

function ensureStyle() {
  if (document.getElementById(styleId)) return;
  const style = document.createElement("style");
  style.id = styleId;
  style.textContent = `
    .iboren-cancel-hidden { display: none !important; }
    .iboren-cancel-locked {
      display: inline-flex;
      align-items: center;
      border-radius: 999px;
      padding: .375rem .75rem;
      font-size: .75rem;
      font-weight: 800;
      color: rgba(23, 30, 28, .62);
      background: rgba(255, 253, 248, .9);
      box-shadow: inset 0 0 0 1px rgba(122, 32, 44, .12);
    }
    .iboren-booking-toggle {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      gap: .35rem;
      border-radius: 999px;
      margin-top: .75rem;
      padding: .65rem 1rem;
      font-size: .78rem;
      font-weight: 900;
      letter-spacing: .06em;
      text-transform: none;
      color: rgb(122, 32, 44);
      background: rgb(255, 253, 248);
      box-shadow: inset 0 0 0 1px rgba(122, 32, 44, .14);
      white-space: nowrap;
    }
    .iboren-booking-details { margin-top: 1rem; }
    .iboren-booking-details:not(.iboren-open) { display: none !important; }
    .iboren-profile-label-normal { text-transform: none !important; letter-spacing: .04em !important; }
  `;
  document.head.appendChild(style);
}

function normalizeLabel(node: HTMLElement, text: string) {
  node.textContent = text;
  node.classList.add("iboren-profile-label-normal");
  node.classList.remove("uppercase");
}

function lockCancelButton(button: HTMLButtonElement, language: "sv" | "en" = "sv") {
  button.classList.add("iboren-cancel-hidden");
  if (!button.parentElement?.querySelector(".iboren-cancel-locked")) {
    const locked = document.createElement("span");
    locked.className = "iboren-cancel-locked";
    locked.textContent = language === "en" ? "Contact Iboren" : "Kontakta Iboren";
    button.parentElement?.appendChild(locked);
  }
}

function isEnglishCardText(text: string) {
  return text.includes("Address:") || text.includes("Date:") || text.includes("Cancel request") || text.includes("NEW") || text.includes("BOOKING REQUESTS");
}

function cardLanguage(card: HTMLElement): "sv" | "en" {
  const text = card.innerText || "";
  return isEnglishCardText(text) ? "en" : "sv";
}

function isServiceText(text: string) {
  return [
    "Hemstädning",
    "Flyttstädning",
    "Kontorsstädning",
    "Fönsterputs",
    "Home cleaning",
    "Move-out cleaning",
    "Office cleaning",
    "Window cleaning"
  ].some((service) => text.includes(service));
}

function isProfileBookingCard(card: HTMLElement) {
  const text = card.innerText || "";
  if (text.includes("Mina bokningar") || text.includes("Profiluppgifter") || text.includes("BOOKING REQUESTS") || text.includes("PROFILE DETAILS") || text.includes("Verified account")) return false;
  const hasSvDetails = text.includes("Storlek:") || text.includes("SERIE ·") || text.includes("Serie ·");
  const hasEnDetails = text.includes("Address:") || text.includes("Date:") || text.includes("Frequency:") || text.includes("Cancel request");
  return isServiceText(text) && (hasSvDetails || hasEnDetails);
}

function toggleLabel(language: "sv" | "en", open: boolean) {
  if (language === "en") return open ? "Hide details ↑" : "Show details ↓";
  return open ? "Dölj detaljer ↑" : "Visa detaljer ↓";
}

function closeAllBookingDetails(except?: HTMLElement) {
  document.querySelectorAll<HTMLElement>(".iboren-booking-details").forEach((details) => {
    if (except && details === except) return;
    details.classList.remove("iboren-open");
    details.hidden = true;
    const card = details.closest("article") as HTMLElement | null;
    const language = card ? cardLanguage(card) : "sv";
    const button = card?.querySelector<HTMLButtonElement>(".iboren-booking-toggle");
    if (button) {
      button.setAttribute("aria-expanded", "false");
      button.textContent = toggleLabel(language, false);
    }
  });
}

function patchBookingAccordion() {
  document.querySelectorAll<HTMLElement>("article").forEach((card) => {
    if (!isProfileBookingCard(card)) return;

    const language = cardLanguage(card);
    const existingDetails = card.querySelector<HTMLElement>(".iboren-booking-details");
    if (card.dataset.iborenAccordionReady === "1") {
      const button = card.querySelector<HTMLButtonElement>(".iboren-booking-toggle");
      if (button && !existingDetails?.classList.contains("iboren-open")) button.textContent = toggleLabel(language, false);
      if (existingDetails && !existingDetails.classList.contains("iboren-open")) existingDetails.hidden = true;
      return;
    }

    const children = Array.from(card.children).filter((child): child is HTMLElement => child instanceof HTMLElement);
    if (children.length < 2) return;

    const header = children[0];
    const details = document.createElement("div");
    details.className = "iboren-booking-details";
    details.hidden = true;
    details.dataset.iborenBookingDetails = "1";

    children.slice(1).forEach((child) => details.appendChild(child));
    card.appendChild(details);

    const button = document.createElement("button");
    button.type = "button";
    button.className = "iboren-booking-toggle";
    button.setAttribute("aria-expanded", "false");
    button.textContent = toggleLabel(language, false);
    button.addEventListener("click", () => {
      const willOpen = !details.classList.contains("iboren-open");
      closeAllBookingDetails(details);
      details.classList.toggle("iboren-open", willOpen);
      details.hidden = !willOpen;
      button.setAttribute("aria-expanded", String(willOpen));
      button.textContent = toggleLabel(language, willOpen);
    });

    header.appendChild(button);
    card.dataset.iborenAccordionReady = "1";
  });
}

function patchRecurringRows() {
  document.querySelectorAll<HTMLElement>("div.rounded-xl").forEach((row) => {
    const text = row.innerText || "";
    const date = text.match(/\b20\d{2}-\d{2}-\d{2}\b/)?.[0];
    if (!date || canCancelOnline(date)) return;
    const language = isEnglishCardText(text) ? "en" : "sv";
    const button = Array.from(row.querySelectorAll<HTMLButtonElement>("button")).find((item) => item.textContent?.includes("Avboka") || item.textContent?.includes("Cancel"));
    if (button) lockCancelButton(button, language);
  });
}

function patchSingleBookingCards() {
  document.querySelectorAll<HTMLElement>("article").forEach((card) => {
    const text = card.innerText || "";
    if (text.includes("SERIE ·") || text.includes("Serie ·")) return;
    const date = text.match(/NÄSTA:\s*(20\d{2}-\d{2}-\d{2})/i)?.[1] || text.match(/Nästa:\s*(20\d{2}-\d{2}-\d{2})/i)?.[1] || text.match(/Date:\s*(20\d{2}-\d{2}-\d{2})/i)?.[1] || text.match(/\b20\d{2}-\d{2}-\d{2}\b/)?.[0];
    if (!date || canCancelOnline(date)) return;
    const language = cardLanguage(card);
    const button = Array.from(card.querySelectorAll<HTMLButtonElement>("button")).find((item) => item.textContent?.includes("Avboka") || item.textContent?.includes("Cancel"));
    if (button) lockCancelButton(button, language);
  });
}

function patchCustomerLabels() {
  document.querySelectorAll<HTMLElement>("article").forEach((card) => {
    const text = card.innerText || "";
    if (!isProfileBookingCard(card)) return;
    const language = cardLanguage(card);

    Array.from(card.querySelectorAll<HTMLElement>("p, span")).forEach((node) => {
      const value = node.textContent?.trim();
      if (language === "sv") {
        if (value === "NY") normalizeLabel(node, "Ny");
        if (value === "KLAR") normalizeLabel(node, "Klar");
        if (value === "PÅGÅENDE") normalizeLabel(node, "Pågående");
        if (value === "SERIE · 8 BESÖK") normalizeLabel(node, "Serie · 8 besök");
        if (value?.startsWith("SERIE ·") && value.includes("BESÖK")) normalizeLabel(node, value.replace("SERIE", "Serie").replace("BESÖK", "besök"));
        if (value?.startsWith("NÄSTA:")) normalizeLabel(node, value.replace("NÄSTA:", "Nästa:"));
      } else {
        if (value === "NEW") normalizeLabel(node, "New");
        if (value === "COMPLETED") normalizeLabel(node, "Completed");
        if (value === "CONFIRMED") normalizeLabel(node, "Confirmed");
        if (value?.startsWith("NEXT:")) normalizeLabel(node, value.replace("NEXT:", "Next:"));
      }
    });

    if (language === "sv" && text.includes("Serie ·") && text.includes("Klar") && text.includes("Ny")) {
      const status = Array.from(card.querySelectorAll<HTMLElement>("p, span")).find((node) => node.textContent?.trim() === "Ny");
      if (status) normalizeLabel(status, "Pågående");
    }
  });
}

function patchProfile() {
  ensureStyle();
  patchBookingAccordion();
  patchCustomerLabels();
  patchRecurringRows();
  patchSingleBookingCards();

  document.querySelectorAll<HTMLElement>("p").forEach((paragraph) => {
    const text = paragraph.textContent || "";
    if (text.includes("Öppna serien för att se varje besök") || text.includes("Varje besök visas med eget datum och status")) {
      paragraph.textContent = "Här visas dina bokningar som kort. Tryck på Visa detaljer för att se besök och ändringar.";
    }
    if (text.includes("My requests") || text.includes("Show cancelled")) {
      // Keep English copy untouched; the accordion handles card size.
    }
  });
}

export default function ProfileCancellationPolicy() {
  useEffect(() => {
    patchProfile();
    closeAllBookingDetails();
    const observer = new MutationObserver(patchProfile);
    observer.observe(document.body, { childList: true, subtree: true, characterData: true });
    return () => observer.disconnect();
  }, []);

  return null;
}
