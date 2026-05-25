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
      font-size: .75rem;
      font-weight: 900;
      letter-spacing: .12em;
      text-transform: uppercase;
      color: rgb(122, 32, 44);
      background: rgb(255, 253, 248);
      box-shadow: inset 0 0 0 1px rgba(122, 32, 44, .14);
      white-space: nowrap;
    }
    .iboren-booking-details { margin-top: 1rem; }
    .iboren-booking-details:not(.iboren-open) { display: none !important; }
  `;
  document.head.appendChild(style);
}

function lockCancelButton(button: HTMLButtonElement) {
  button.classList.add("iboren-cancel-hidden");
  if (!button.parentElement?.querySelector(".iboren-cancel-locked")) {
    const locked = document.createElement("span");
    locked.className = "iboren-cancel-locked";
    locked.textContent = "Kontakta Iboren";
    button.parentElement?.appendChild(locked);
  }
}

function isProfileBookingCard(card: HTMLElement) {
  const text = card.innerText || "";
  if (text.includes("Mina bokningar") || text.includes("Profiluppgifter") || text.includes("Verified account")) return false;
  if (!text.includes("Storlek:") && !text.includes("SERIE ·")) return false;
  return text.includes("Hemstädning") || text.includes("Flyttstädning") || text.includes("Kontorsstädning") || text.includes("Fönsterputs");
}

function closeAllBookingDetails(except?: HTMLElement) {
  document.querySelectorAll<HTMLElement>(".iboren-booking-details").forEach((details) => {
    if (except && details === except) return;
    details.classList.remove("iboren-open");
    details.hidden = true;
    const card = details.closest("article");
    const button = card?.querySelector<HTMLButtonElement>(".iboren-booking-toggle");
    if (button) {
      button.setAttribute("aria-expanded", "false");
      button.textContent = "Visa detaljer ↓";
    }
  });
}

function patchBookingAccordion() {
  document.querySelectorAll<HTMLElement>("article").forEach((card) => {
    if (!isProfileBookingCard(card)) return;

    const existingDetails = card.querySelector<HTMLElement>(".iboren-booking-details");
    if (card.dataset.iborenAccordionReady === "1") {
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
    button.textContent = "Visa detaljer ↓";
    button.addEventListener("click", () => {
      const willOpen = !details.classList.contains("iboren-open");
      closeAllBookingDetails(details);
      details.classList.toggle("iboren-open", willOpen);
      details.hidden = !willOpen;
      button.setAttribute("aria-expanded", String(willOpen));
      button.textContent = willOpen ? "Dölj detaljer ↑" : "Visa detaljer ↓";
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
    const button = Array.from(row.querySelectorAll<HTMLButtonElement>("button")).find((item) => item.textContent?.includes("Avboka"));
    if (button) lockCancelButton(button);
  });
}

function patchSingleBookingCards() {
  document.querySelectorAll<HTMLElement>("article").forEach((card) => {
    const text = card.innerText || "";
    if (text.includes("SERIE ·")) return;
    const date = text.match(/NÄSTA:\s*(20\d{2}-\d{2}-\d{2})/i)?.[1] || text.match(/Nästa:\s*(20\d{2}-\d{2}-\d{2})/i)?.[1] || text.match(/\b20\d{2}-\d{2}-\d{2}\b/)?.[0];
    if (!date || canCancelOnline(date)) return;
    const button = Array.from(card.querySelectorAll<HTMLButtonElement>("button")).find((item) => item.textContent?.includes("Avboka"));
    if (button) lockCancelButton(button);
  });
}

function patchProfile() {
  ensureStyle();

  document.querySelectorAll<HTMLElement>("article").forEach((card) => {
    const text = card.innerText || "";
    if (text.includes("SERIE ·") && text.includes("Klara") && text.includes("NY")) {
      const status = Array.from(card.querySelectorAll<HTMLElement>("p, span")).find((node) => node.textContent?.trim() === "NY");
      if (status) status.textContent = "PÅGÅENDE";
    }
  });

  patchBookingAccordion();
  patchRecurringRows();
  patchSingleBookingCards();

  document.querySelectorAll<HTMLElement>("p").forEach((paragraph) => {
    if (paragraph.textContent?.includes("Öppna serien för att se varje besök") || paragraph.textContent?.includes("Varje besök visas med eget datum och status")) {
      paragraph.textContent = "Här visas dina bokningar som kort. Tryck på Visa detaljer för att se besök och ändringar.";
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
