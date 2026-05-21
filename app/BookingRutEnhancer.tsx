"use client";

import { useEffect, useState } from "react";
import { createRoot, Root } from "react-dom/client";

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
    if (text.includes("obligatoriska") || text.includes("innan du skickar")) {
      node.nodeValue = "Fill in all required fields before sending.";
    }
  });
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

    if (detailsBlock?.parentElement) {
      detailsBlock.insertAdjacentElement("beforebegin", host);
    } else {
      form.querySelector(".grid")?.appendChild(host);
    }

    const root: Root = createRoot(host);
    root.render(<BookingRutPanel language={language} />);

    const observer = language === "en" ? new MutationObserver(() => fixEnglishBookingText(form)) : null;
    if (language === "en") {
      fixEnglishBookingText(form);
      observer?.observe(form, { childList: true, subtree: true, characterData: true });
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
      root.unmount();
      host.remove();
      window.fetch = originalFetch;
    };
  }, []);

  return null;
}
