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

function BookingRutPanel() {
  const [customerType, setCustomerType] = useState<CustomerType>("Privatperson");
  const [rutRequested, setRutRequested] = useState(true);

  useEffect(() => {
    window.__iborenBookingRut = { customerType, rutRequested: customerType === "Privatperson" && rutRequested };
  }, [customerType, rutRequested]);

  function chooseCustomerType(nextType: CustomerType) {
    setCustomerType(nextType);
    if (nextType === "Företag") setRutRequested(false);
    if (nextType === "Privatperson") setRutRequested(true);
  }

  const rutAllowed = customerType === "Privatperson";

  return (
    <div className="rounded-[1.5rem] border border-gold/15 bg-night/30 p-4 text-porcelain">
      <p className="mb-3 text-xs font-bold uppercase tracking-[.28em] text-gold">Kundtyp & RUT</p>
      <div className="grid grid-cols-2 gap-2">
        {(["Privatperson", "Företag"] as CustomerType[]).map((type) => (
          <button key={type} type="button" onClick={() => chooseCustomerType(type)} className={`rounded-2xl border px-3 py-3 text-sm font-bold transition ${customerType === type ? "border-gold bg-gold text-ink" : "border-porcelain/10 bg-porcelain/6 text-porcelain/80"}`}>
            {type}
          </button>
        ))}
      </div>
      {rutAllowed ? (
        <label className="mt-3 flex items-start gap-3 rounded-2xl border border-porcelain/10 bg-porcelain/6 p-3 text-sm leading-6 text-porcelain/82">
          <input type="checkbox" checked={rutRequested} onChange={(event) => setRutRequested(event.target.checked)} className="mt-1 h-5 w-5" />
          <span>Jag vill att RUT-avdrag prövas enligt Skatteverkets regler.<span className="mt-1 block text-xs text-porcelain/58">RUT-avdrag kan tillämpas när villkoren är uppfyllda. Om RUT inte godkänns kan resterande belopp faktureras.</span></span>
        </label>
      ) : (
        <p className="mt-3 rounded-2xl border border-porcelain/10 bg-porcelain/6 p-3 text-sm leading-6 text-porcelain/70">RUT gäller inte för företagsbokningar. Priset hanteras som företagspris/offert.</p>
      )}
    </div>
  );
}

export default function BookingRutEnhancer() {
  useEffect(() => {
    const form = document.querySelector<HTMLElement>("#booking form");
    if (!form || document.querySelector("#iboren-booking-rut-host")) return;

    window.__iborenBookingRut = { customerType: "Privatperson", rutRequested: true };

    const host = document.createElement("div");
    host.id = "iboren-booking-rut-host";

    const detailsBlock = Array.from(form.querySelectorAll("p")).find((node) => node.textContent?.includes("Objekt & detaljer"))?.closest("div");
    if (detailsBlock?.parentElement) {
      detailsBlock.insertAdjacentElement("beforebegin", host);
    } else {
      form.querySelector(".grid")?.appendChild(host);
    }

    const root: Root = createRoot(host);
    root.render(<BookingRutPanel />);

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
      root.unmount();
      host.remove();
      window.fetch = originalFetch;
    };
  }, []);

  return null;
}
