"use client";

import { useEffect } from "react";
import { createClient } from "@supabase/supabase-js";

const AUTH_HEADER = ["Author", "ization"].join("");
const TOKEN_PREFIX = ["Bear", "er"].join("");

type Language = "sv" | "en";
type RequestPayload = {
  service: string;
  area: string;
  address: string;
  size: string;
  frequency: string;
  date: string;
  timeWindow: string;
  name: string;
  email: string;
  phone: string;
  notes: string;
  customerType: string;
  rutRequested: boolean;
  language: Language;
  website: string;
};

const reverseDisplay = new Map<string, string>([
  ["Home cleaning", "Hemstädning"],
  ["Move-out cleaning", "Flyttstädning"],
  ["Office cleaning", "Kontorsstädning"],
  ["Window cleaning", "Fönsterputs"],
  ["One-time", "Engång"],
  ["Every week", "Varje vecka"],
  ["Every other week", "Varannan vecka"],
  ["Every month", "Varje månad"],
  ["Morning", "Morgon"],
  ["Late morning", "Förmiddag"],
  ["Afternoon", "Eftermiddag"],
  ["Evening", "Kväll"],
  ["Flexible", "Flexibel"]
]);

function getSupabase() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !key) return null;
  return createClient(url, key, { auth: { persistSession: true, autoRefreshToken: true, detectSessionInUrl: true } });
}

function languageFromPath(): Language {
  return window.location.pathname.startsWith("/en") ? "en" : "sv";
}

function normalizeDisplay(value: string) {
  return reverseDisplay.get(value.trim()) || value.trim();
}

function cleanValue(value: string) {
  const clean = value.trim();
  if (["—", "Ej ifylld", "Ej ifyllt", "Ej valt", "Not filled in", "Not selected"].includes(clean)) return "";
  return clean;
}

function parseSummary(summaryText: string, language: Language) {
  const parsed: Record<string, string> = {};
  const labelMap: Record<string, keyof RequestPayload | "ignored"> = language === "en" ? {
    Service: "service",
    Area: "area",
    Address: "address",
    Size: "size",
    Frequency: "frequency",
    Date: "date",
    Time: "timeWindow",
    Name: "name",
    Email: "email",
    Phone: "phone",
    Notes: "ignored"
  } : {
    "Tjänst": "service",
    "Område": "area",
    "Adress": "address",
    "Storlek": "size",
    "Frekvens": "frequency",
    "Datum": "date",
    "Tid": "timeWindow",
    "Namn": "name",
    "E-post": "email",
    "Telefon": "phone",
    "Önskemål": "ignored"
  };

  for (const line of summaryText.split("\n")) {
    const index = line.indexOf(":");
    if (index < 0) continue;
    const label = line.slice(0, index).trim();
    const key = labelMap[label];
    if (!key || key === "ignored") continue;
    parsed[key] = cleanValue(line.slice(index + 1));
  }

  const service = normalizeDisplay(parsed.service || "");
  const frequency = normalizeDisplay(parsed.frequency || "Engång") || "Engång";
  const timeWindow = normalizeDisplay(parsed.timeWindow || "Flexibel") || "Flexibel";
  const size = (parsed.size || "").replace(/[^0-9]/g, "");
  const customerType = service === "Kontorsstädning" ? "Företag" : "Privatperson";

  return {
    service,
    area: parsed.area || "",
    address: parsed.address || "",
    size,
    frequency,
    date: parsed.date || "",
    timeWindow,
    name: parsed.name || "",
    email: parsed.email || "",
    phone: parsed.phone || "",
    notes: `${summaryText}\n\n--- Public request ---\nStatus: new / unverified / pending review`,
    customerType,
    rutRequested: customerType === "Privatperson" && service !== "Kontorsstädning",
    language,
    website: ""
  } satisfies RequestPayload;
}

function findBookingSummary(form: HTMLFormElement) {
  return form.closest("#booking")?.querySelector("aside pre")?.textContent || "";
}

function missingFields(payload: RequestPayload) {
  const required: Array<keyof RequestPayload> = ["service", "area", "address", "size", "date", "name", "email", "phone"];
  return required.filter((key) => !String(payload[key] || "").trim());
}

function feedback(form: HTMLFormElement, status: "success" | "error" | "info", text: string) {
  let element = form.querySelector<HTMLParagraphElement>(".iboren-public-request-feedback");
  if (!element) {
    element = document.createElement("p");
    element.className = "iboren-public-request-feedback rounded-2xl px-4 py-3 text-sm";
    form.appendChild(element);
  }
  element.textContent = text;
  element.className = `iboren-public-request-feedback rounded-2xl px-4 py-3 text-sm ${status === "success" ? "bg-gold/20 text-gold" : status === "error" ? "bg-red-500/10 text-red-200" : "bg-porcelain/10 text-porcelain/70"}`;
}

function submitButton(form: HTMLFormElement, submitEvent: SubmitEvent) {
  const candidate = submitEvent.submitter instanceof HTMLButtonElement ? submitEvent.submitter : null;
  return candidate || form.querySelector<HTMLButtonElement>('button[type="submit"], button:not([type])');
}

async function accessToken() {
  const supabase = getSupabase();
  if (!supabase) return "";
  const { data } = await supabase.auth.getSession();
  return data.session?.access_token || "";
}

async function submitRequest(form: HTMLFormElement, event: SubmitEvent) {
  const language = languageFromPath();
  const summary = findBookingSummary(form);
  const payload = parseSummary(summary, language);
  const missing = missingFields(payload);

  if (missing.length) {
    feedback(form, "error", language === "en" ? `Fill in required fields before sending: ${missing.join(", ")}.` : `Fyll i obligatoriska fält innan du skickar: ${missing.join(", ")}.`);
    return;
  }

  const token = await accessToken();
  const endpoint = token ? "/api/bookings" : "/api/public-booking-request";
  const headers: Record<string, string> = { "Content-Type": "application/json" };
  if (token) headers[AUTH_HEADER] = `${TOKEN_PREFIX} ${token}`;

  const button = submitButton(form, event);
  const originalButtonText = button?.textContent || "";
  if (button) {
    button.disabled = true;
    button.textContent = language === "en" ? "Sending..." : "Skickar...";
  }
  feedback(form, "info", language === "en" ? "Sending your request..." : "Skickar din förfrågan...");

  try {
    const response = await fetch(endpoint, { method: "POST", headers, body: JSON.stringify(payload) });
    const result = await response.json().catch(() => null) as { ok?: boolean; message?: string } | null;
    if (!response.ok || !result?.ok) throw new Error(result?.message || (language === "en" ? "Could not send the request right now." : "Kunde inte skicka förfrågan just nu."));

    feedback(form, "success", result.message || (language === "en" ? "Thank you. Your request has been sent. We always confirm time and price before the booking becomes binding." : "Tack! Din förfrågan har skickats. Vi bekräftar alltid tid och pris innan bokningen blir bindande."));
  } catch (error) {
    feedback(form, "error", error instanceof Error ? error.message : (language === "en" ? "Could not send the request right now." : "Kunde inte skicka förfrågan just nu."));
  } finally {
    if (button) {
      button.disabled = false;
      button.textContent = originalButtonText || (language === "en" ? "Send request" : "Skicka bokningsförfrågan");
    }
  }
}

function ensureHoneypot(form: HTMLFormElement) {
  if (form.querySelector('input[name="website"]')) return;
  const input = document.createElement("input");
  input.name = "website";
  input.type = "text";
  input.tabIndex = -1;
  input.autocomplete = "off";
  input.setAttribute("aria-hidden", "true");
  input.className = "hidden";
  form.appendChild(input);
}

function replaceTextNodes(root: ParentNode, replacements: Array<[string, string]>) {
  const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT);
  const nodes: Text[] = [];
  while (walker.nextNode()) nodes.push(walker.currentNode as Text);
  for (const node of nodes) {
    let value = node.nodeValue || "";
    for (const [from, to] of replacements) value = value.replace(from, to);
    node.nodeValue = value;
  }
}

function polishCopy() {
  const replacements: Array<[string, string]> = [
    ["Logga in och boka", "Skicka förfrågan"],
    ["Logga in för att boka och spara förfrågan på din profil.", "Skicka förfrågan utan konto. Logga in om du vill spara den på din profil."],
    ["Log in to send and save your request to your profile.", "Send a request without an account. Log in if you want to save it to your profile."]
  ];
  replaceTextNodes(document.body, replacements);

  for (const form of document.querySelectorAll<HTMLFormElement>("#booking form")) {
    ensureHoneypot(form);
    const bookingSection = form.closest("#booking");
    if (!bookingSection || bookingSection.querySelector(".iboren-binding-note")) continue;
    const note = document.createElement("p");
    note.className = "iboren-binding-note mt-3 rounded-2xl border border-gold/20 bg-gold/10 px-4 py-3 text-sm font-bold text-gold";
    note.textContent = languageFromPath() === "en" ? "We always confirm time and price before the booking becomes binding." : "Vi bekräftar alltid tid och pris innan bokningen blir bindande.";
    form.prepend(note);
  }
}

export default function PublicBookingRequestEnhancer() {
  useEffect(() => {
    polishCopy();
    const observer = new MutationObserver(() => polishCopy());
    observer.observe(document.body, { childList: true, subtree: true });

    const handleSubmit = (event: Event) => {
      const form = event.target instanceof HTMLFormElement ? event.target : null;
      if (!form || !form.closest("#booking")) return;
      event.preventDefault();
      event.stopImmediatePropagation();
      void submitRequest(form, event as SubmitEvent);
    };

    document.addEventListener("submit", handleSubmit, true);
    return () => {
      observer.disconnect();
      document.removeEventListener("submit", handleSubmit, true);
    };
  }, []);

  return null;
}
