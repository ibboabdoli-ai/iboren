"use client";

import { useEffect, useState } from "react";
import { createRoot, Root } from "react-dom/client";
import { createClient } from "@supabase/supabase-js";

type CustomerType = "Privatperson" | "Företag";

declare global {
  interface Window {
    __iborenBookingRut?: {
      customerType: CustomerType;
      rutRequested: boolean;
    };
  }
}

const copy = {
  sv: {
    title: "Kundtyp & RUT",
    privateCustomer: "Privatperson",
    company: "Företag",
    rutLabel: "Jag vill att RUT-avdrag prövas enligt Skatteverkets regler.",
    rutHelp: "RUT-avdrag kan tillämpas när villkoren är uppfyllda. Om RUT inte godkänns kan resterande belopp faktureras.",
    noRut: "RUT gäller inte för företagsbokningar. Priset hanteras som företagspris/offert."
  },
  en: {
    title: "Customer type & RUT",
    privateCustomer: "Private customer",
    company: "Company",
    rutLabel: "I want RUT deduction to be assessed according to Skatteverket rules.",
    rutHelp: "RUT deduction may apply when the conditions are fulfilled. If RUT is not approved, the remaining amount may be invoiced.",
    noRut: "RUT does not apply to company bookings. The price is handled as a business price or quote."
  }
};

const serviceByLabel: Record<string, string> = {
  "Home cleaning": "Hemstädning",
  "Move-out cleaning": "Flyttstädning",
  "Office cleaning": "Kontorsstädning",
  "Window cleaning": "Fönsterputs"
};

function getSupabase() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !key) return null;
  return createClient(url, key, { auth: { persistSession: true, autoRefreshToken: true, detectSessionInUrl: true } });
}

function fixEnglishBookingText(form: HTMLElement) {
  form.querySelectorAll<HTMLButtonElement>("button").forEach((button) => {
    const text = button.textContent?.trim() || "";
    if (text.includes("boknings") || text.includes("förfrågan")) button.textContent = "Send booking request";
  });

  const walker = document.createTreeWalker(form, NodeFilter.SHOW_TEXT);
  const nodes: Text[] = [];
  while (walker.nextNode()) nodes.push(walker.currentNode as Text);

  nodes.forEach((node) => {
    const text = node.nodeValue || "";
    if (text.includes("obligatoriska") || text.includes("innan du skickar")) node.nodeValue = "Fill in all required fields before sending.";
  });
}

function getInput(form: HTMLElement, selector: string) {
  return form.querySelector<HTMLInputElement>(selector)?.value.trim() || "";
}

function getSelectValue(form: HTMLElement, valueToFind: string, fallback: string) {
  const select = Array.from(form.querySelectorAll<HTMLSelectElement>("select")).find((item) => Array.from(item.options).some((option) => option.value === valueToFind));
  return select?.value || fallback;
}

function getSelectedService(form: HTMLElement) {
  const buttons = Array.from(form.querySelectorAll<HTMLButtonElement>("button[type='button']"));
  const selected = buttons.find((button) => serviceByLabel[(button.textContent || "").trim()] && button.className.includes("bg-gold"));
  const label = (selected?.textContent || "Home cleaning").trim();
  return serviceByLabel[label] || "Hemstädning";
}

function showEnglishMessage(form: HTMLElement, message: string, tone: "error" | "success" | "info" = "error") {
  let node = form.querySelector<HTMLParagraphElement>("#iboren-en-submit-message");
  if (!node) {
    node = document.createElement("p");
    node.id = "iboren-en-submit-message";
    (form.querySelector(".grid") || form).appendChild(node);
  }
  node.className = `rounded-2xl px-4 py-3 text-sm ${tone === "success" ? "bg-gold/20 text-gold" : tone === "info" ? "bg-porcelain/10 text-porcelain/70" : "bg-red-500/10 text-red-200"}`;
  node.textContent = message;
}

function buildEnglishNotes(form: HTMLElement) {
  const textArea = form.querySelector<HTMLTextAreaElement>("textarea")?.value.trim() || "";
  const details = [
    "--- Property & details ---",
    `Number of rooms: ${getInput(form, "input[placeholder='3']") || "Not filled in"}`,
    `Number of bathrooms: ${getInput(form, "input[placeholder='1']") || "Not filled in"}`,
    "",
    "--- Customer notes ---",
    textArea || "-"
  ];
  return details.join("\n");
}

async function submitEnglishBooking(form: HTMLElement) {
  fixEnglishBookingText(form);

  const payload = {
    service: getSelectedService(form),
    area: getInput(form, "input[placeholder='Stockholm, Södertälje...']"),
    address: getInput(form, "input[placeholder='Street address']"),
    size: getInput(form, "input[placeholder='75']"),
    frequency: getSelectValue(form, "Engång", "Engång"),
    date: getInput(form, "input[type='date']"),
    timeWindow: getSelectValue(form, "Morgon", "Flexibel"),
    name: getInput(form, "input[placeholder='Full name']"),
    email: getInput(form, "input[type='email']"),
    phone: getInput(form, "input[type='tel']"),
    notes: buildEnglishNotes(form),
    customerType: window.__iborenBookingRut?.customerType || "Privatperson",
    rutRequested: window.__iborenBookingRut?.rutRequested ?? true
  };

  const missing = [
    ["Name", payload.name],
    ["Email", payload.email],
    ["Phone", payload.phone],
    ["Area / city", payload.area],
    ["Address", payload.address],
    ["Size sqm", payload.size],
    ["Preferred date", payload.date]
  ].filter(([, value]) => !value).map(([label]) => label);

  if (missing.length) {
    showEnglishMessage(form, `Please fill in: ${missing.join(", ")}.`);
    return;
  }

  const supabase = getSupabase();
  const { data } = supabase ? await supabase.auth.getSession() : { data: { session: null } };
  const token = data.session?.access_token;
  const sessionEmail = data.session?.user?.email || "";

  if (!token) {
    showEnglishMessage(form, "Please log in before sending a booking request.");
    return;
  }

  if (sessionEmail && payload.email.toLowerCase() !== sessionEmail.toLowerCase()) {
    showEnglishMessage(form, `Use the same email as your logged-in account: ${sessionEmail}.`);
    return;
  }

  showEnglishMessage(form, "Sending your booking request...", "info");

  const response = await fetch("/api/bookings", {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
    body: JSON.stringify(payload)
  });
  const result = await response.json().catch(() => null) as { ok?: boolean; duplicate?: boolean; message?: string } | null;

  if (!response.ok || !result?.ok) {
    const apiMessage = result?.duplicate
      ? "This booking request already exists. Change the date, time or details if you want to create a new request."
      : result?.message?.includes("Missing required fields")
        ? result.message
        : result?.message?.includes("e-post")
          ? `Use the same email as your logged-in account: ${sessionEmail}.`
          : result?.message || "Could not send the request right now.";
    showEnglishMessage(form, apiMessage);
    return;
  }

  showEnglishMessage(form, "Thank you. Your booking request has been sent to Iboren and saved to your profile.", "success");
}

function BookingRutPanel({ language }: { language: "sv" | "en" }) {
  const [customerType, setCustomerType] = useState<CustomerType>("Privatperson");
  const [rutRequested, setRutRequested] = useState(true);
  const t = copy[language];

  useEffect(() => {
    window.__iborenBookingRut = { customerType, rutRequested: customerType === "Privatperson" && rutRequested };
  }, [customerType, rutRequested]);

  function chooseCustomerType(nextType: CustomerType) {
    setCustomerType(nextType);
    if (nextType === "Företag") setRutRequested(false);
    if (nextType === "Privatperson") setRutRequested(true);
  }

  const rutAllowed = customerType === "Privatperson";
  const options: Array<{ value: CustomerType; label: string }> = [
    { value: "Privatperson", label: t.privateCustomer },
    { value: "Företag", label: t.company }
  ];

  return (
    <div className="rounded-[1.5rem] border border-gold/15 bg-night/30 p-4 text-porcelain">
      <p className="mb-3 text-xs font-bold uppercase tracking-[.28em] text-gold">{t.title}</p>
      <div className="grid grid-cols-2 gap-2">
        {options.map((option) => (
          <button key={option.value} type="button" onClick={() => chooseCustomerType(option.value)} className={`rounded-2xl border px-3 py-3 text-sm font-bold transition ${customerType === option.value ? "border-gold bg-gold text-ink" : "border-porcelain/10 bg-porcelain/6 text-porcelain/80"}`}>
            {option.label}
          </button>
        ))}
      </div>
      {rutAllowed ? (
        <label className="mt-3 flex items-start gap-3 rounded-2xl border border-porcelain/10 bg-porcelain/6 p-3 text-sm leading-6 text-porcelain/82">
          <input type="checkbox" checked={rutRequested} onChange={(event) => setRutRequested(event.target.checked)} className="mt-1 h-5 w-5" />
          <span>{t.rutLabel}<span className="mt-1 block text-xs text-porcelain/58">{t.rutHelp}</span></span>
        </label>
      ) : (
        <p className="mt-3 rounded-2xl border border-porcelain/10 bg-porcelain/6 p-3 text-sm leading-6 text-porcelain/70">{t.noRut}</p>
      )}
    </div>
  );
}

export default function BookingRutEnhancer() {
  useEffect(() => {
    const form = document.querySelector<HTMLElement>("#booking form");
    if (!form || document.querySelector("#iboren-booking-rut-host")) return;

    const language = window.location.pathname === "/en" || window.location.pathname.startsWith("/en/") ? "en" : "sv";
    window.__iborenBookingRut = { customerType: "Privatperson", rutRequested: true };

    const host = document.createElement("div");
    host.id = "iboren-booking-rut-host";

    const detailsBlock = Array.from(form.querySelectorAll("p"))
      .find((node) => node.textContent?.includes("Objekt & detaljer") || node.textContent?.includes("Property & details"))
      ?.closest("div");

    if (detailsBlock?.parentElement) detailsBlock.insertAdjacentElement("beforebegin", host);
    else form.querySelector(".grid")?.appendChild(host);

    const root: Root = createRoot(host);
    root.render(<BookingRutPanel language={language} />);

    const observer = language === "en" ? new MutationObserver(() => fixEnglishBookingText(form)) : null;
    const onEnglishSubmit = (event: SubmitEvent) => {
      event.preventDefault();
      event.stopPropagation();
      event.stopImmediatePropagation();
      void submitEnglishBooking(form);
    };

    if (language === "en") {
      fixEnglishBookingText(form);
      observer?.observe(form, { childList: true, subtree: true, characterData: true });
      form.addEventListener("submit", onEnglishSubmit, true);
    }

    const originalFetch = window.fetch.bind(window);
    window.fetch = ((input: RequestInfo | URL, init?: RequestInit) => {
      const url = typeof input === "string" ? input : input instanceof URL ? input.toString() : input.url;
      if (url.includes("/api/bookings") && init?.method?.toUpperCase() === "POST" && typeof init.body === "string") {
        try {
          const body = JSON.parse(init.body);
          const rut = window.__iborenBookingRut || { customerType: "Privatperson", rutRequested: true };
          init = { ...init, body: JSON.stringify({ ...body, customerType: rut.customerType, rutRequested: rut.customerType === "Privatperson" && rut.rutRequested }) };
        } catch {}
      }
      return originalFetch(input, init);
    }) as typeof window.fetch;

    return () => {
      observer?.disconnect();
      if (language === "en") form.removeEventListener("submit", onEnglishSubmit, true);
      root.unmount();
      host.remove();
      window.fetch = originalFetch;
    };
  }, []);

  return null;
}
