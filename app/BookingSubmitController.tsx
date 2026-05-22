"use client";

import { useEffect } from "react";
import { createClient } from "@supabase/supabase-js";

const SUBMIT_TIMEOUT_MS = 15000;

function isEnglishPath() {
  return window.location.pathname === "/en" || window.location.pathname.startsWith("/en/") || window.location.pathname.startsWith("/en-");
}

function getSupabase() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !key) return null;
  return createClient(url, key);
}

function parseSummary() {
  const summary = document.querySelector("#booking aside pre")?.textContent || "";
  const values: Record<string, string> = {};
  summary.split("\n").forEach((line) => {
    const index = line.indexOf(":");
    if (index === -1) return;
    values[line.slice(0, index).trim()] = line.slice(index + 1).trim();
  });
  return values;
}

function showMessage(form: HTMLFormElement, ok: boolean, text: string) {
  let node = form.querySelector<HTMLParagraphElement>("#iboren-submit-message");
  if (!node) {
    node = document.createElement("p");
    node.id = "iboren-submit-message";
    form.appendChild(node);
  }
  node.className = `rounded-2xl px-4 py-3 text-sm ${ok ? "bg-gold/20 text-gold" : "bg-red-500/10 text-red-200"}`;
  node.textContent = text;
}

function makePayload() {
  const s = parseSummary();
  return {
    service: s["Tjänst"] || "Hemstädning",
    area: s["Område"] || "Södertälje",
    address: s["Adress"] || "",
    size: (s["Storlek"] || "").replace(/[^0-9]/g, ""),
    frequency: s["Frekvens"] || "Engång",
    date: s["Datum"] || "",
    timeWindow: s["Tid"] || "Flexibel",
    name: s["Namn"] || "",
    email: s["E-post"] || "",
    phone: s["Telefon"] || "",
    notes: [
      `Typ av objekt: ${s["Typ av objekt"] || "Ej ifyllt"}`,
      `Antal rum: ${s["Antal rum"] || "Ej ifyllt"}`,
      `Antal badrum: ${s["Antal badrum"] || "Ej ifyllt"}`,
      `Husdjur: ${s["Husdjur"] || "Ej ifyllt"}`,
      `Våning: ${s["Våning"] || "Ej ifyllt"}`,
      `Hiss: ${s["Hiss"] || "Ej ifyllt"}`,
      `Parkering: ${s["Parkering"] || "Ej ifyllt"}`,
      `Extra tjänster: ${s["Extra tjänster"] || "Inga valda"}`,
      "",
      `Önskemål: ${s["Önskemål"] || "-"}`
    ].join("\n")
  };
}

async function sendControlledBooking(form: HTMLFormElement, button: HTMLButtonElement | null) {
  const supabase = getSupabase();
  if (!supabase) {
    showMessage(form, false, "Bokningen kan inte skickas just nu. Försök igen senare.");
    return;
  }

  const { data } = await supabase.auth.getSession();
  const token = data.session?.access_token;
  if (!token) {
    window.location.href = "/login";
    return;
  }

  const payload = makePayload();
  const missing = [payload.name, payload.email, payload.phone, payload.area, payload.address, payload.size, payload.date].some((value) => !value || value.startsWith("Ej "));
  if (missing) {
    showMessage(form, false, "Fyll i alla obligatoriska fält innan du skickar.");
    return;
  }

  const controller = new AbortController();
  const timeout = window.setTimeout(() => controller.abort(), SUBMIT_TIMEOUT_MS);

  try {
    const response = await fetch("/api/bookings", {
      method: "POST",
      signal: controller.signal,
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify(payload)
    });
    const result = await response.json().catch(() => ({ ok: false, message: "Kunde inte läsa svar från servern." }));
    if (!response.ok || !result.ok) throw new Error(result.message || "Kunde inte skicka bokningen just nu.");
    showMessage(form, true, result.message || "Tack! Din bokningsförfrågan är skickad. Iboren återkommer så snart som möjligt.");
    if (button) {
      button.textContent = "Bokning skickad";
      button.disabled = true;
    }
  } catch (error) {
    showMessage(form, false, error instanceof Error && error.name === "AbortError" ? "Bokningen tog för lång tid att bekräfta. Kontrollera din profil eller försök igen." : error instanceof Error ? error.message : "Kunde inte skicka bokningen just nu.");
  } finally {
    window.clearTimeout(timeout);
  }
}

function run(form: HTMLFormElement, button: HTMLButtonElement | null) {
  if (form.dataset.iborenSubmitting === "1") return;
  form.dataset.iborenSubmitting = "1";
  if (button) {
    button.disabled = true;
    button.textContent = "Skickar bokningsförfrågan...";
  }
  sendControlledBooking(form, button).finally(() => {
    const success = Boolean(form.querySelector("#iboren-submit-message")?.textContent?.toLowerCase().includes("tack"));
    if (!success && button) {
      button.disabled = false;
      button.textContent = "Skicka bokningsförfrågan";
    }
    if (!success) delete form.dataset.iborenSubmitting;
  });
}

function attach() {
  if (isEnglishPath()) return;
  const form = document.querySelector<HTMLFormElement>("#booking form");
  if (!form) return;
  const button = form.querySelector<HTMLButtonElement>('button[type="submit"], button:not([type])');
  if (!button || button.dataset.iborenButtonReady === "1") return;

  button.dataset.iborenButtonReady = "1";
  button.type = "button";

  button.addEventListener("click", (event) => {
    event.preventDefault();
    event.stopPropagation();
    event.stopImmediatePropagation();
    run(form, button);
  }, true);

  form.addEventListener("submit", (event) => {
    event.preventDefault();
    event.stopPropagation();
    event.stopImmediatePropagation();
    run(form, button);
  }, true);
}

export default function BookingSubmitController() {
  useEffect(() => {
    if (isEnglishPath()) return;
    attach();
    const observer = new MutationObserver(attach);
    observer.observe(document.documentElement, { childList: true, subtree: true });
    return () => observer.disconnect();
  }, []);
  return null;
}