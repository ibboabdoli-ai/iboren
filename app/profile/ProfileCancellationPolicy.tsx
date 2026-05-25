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
  `;
  document.head.appendChild(style);
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

  document.querySelectorAll<HTMLElement>("div.rounded-xl").forEach((row) => {
    const text = row.innerText || "";
    const date = text.match(/\b20\d{2}-\d{2}-\d{2}\b/)?.[0];
    if (!date) return;
    const button = Array.from(row.querySelectorAll<HTMLButtonElement>("button")).find((item) => item.textContent?.includes("Avboka"));
    if (!button) return;
    if (canCancelOnline(date)) return;
    button.classList.add("iboren-cancel-hidden");
    if (!row.querySelector(".iboren-cancel-locked")) {
      const locked = document.createElement("span");
      locked.className = "iboren-cancel-locked";
      locked.textContent = "Kontakta Iboren";
      button.parentElement?.appendChild(locked);
    }
  });

  document.querySelectorAll<HTMLElement>("p").forEach((paragraph) => {
    if (paragraph.textContent?.includes("Öppna serien för att se varje besök")) {
      paragraph.textContent = "Här visas dina bokningar grupperade per återkommande serie. Varje besök visas med eget datum och status.";
    }
  });
}

export default function ProfileCancellationPolicy() {
  useEffect(() => {
    patchProfile();
    const observer = new MutationObserver(patchProfile);
    observer.observe(document.body, { childList: true, subtree: true, characterData: true });
    return () => observer.disconnect();
  }, []);

  return null;
}
