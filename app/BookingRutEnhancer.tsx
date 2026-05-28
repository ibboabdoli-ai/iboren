"use client";

import { useEffect, useMemo, useState } from "react";
import { createRoot, Root } from "react-dom/client";

type CustomerType = "Privatperson" | "Företag";
type Language = "sv" | "en";
type CalculatorEstimate = {
  version: string;
  capturedAt: string;
  language: Language;
  sourcePath: string;
  inputs: Record<string, string>;
  selectedButtons: string[];
  result: {
    title: string;
    riskLabel: string;
    priceBeforeRut: string;
    priceAfterRut: string;
    estimatedTime: string;
    rawText?: string;
  };
};

declare global {
  interface Window {
    __iborenBookingRut?: {
      customerType: CustomerType;
      rutRequested: boolean;
    };
  }
}

const STORAGE_KEY = "iboren:calculatorEstimate:v1";

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

const estimateCopy = {
  sv: {
    title: "Prisindikation från kalkylatorn",
    help: "Det här är priset kunden såg innan förfrågan. Om kunden ändrar uppgifter i formuläret kan slutpriset behöva justeras.",
    beforeRut: "Före RUT",
    afterRut: "Efter RUT / kundpris",
    time: "Uppskattad tid",
    selected: "Alla val i kalkylatorn",
    addOns: "Markerade tillval/val",
    noValue: "Ej angivet"
  },
  en: {
    title: "Price estimate from calculator",
    help: "This is the estimate the customer saw before the request. If details are changed in the form, the final price may need to be adjusted.",
    beforeRut: "Before RUT",
    afterRut: "After RUT / customer price",
    time: "Estimated time",
    selected: "All calculator selections",
    addOns: "Selected add-ons/options",
    noValue: "Not entered"
  }
};

function isEnglishPath() {
  return window.location.pathname === "/en" || window.location.pathname.startsWith("/en/");
}

function cleanText(value: unknown) {
  return String(value ?? "").replace(/\s+/g, " ").trim();
}

function normalize(value: unknown) {
  return cleanText(value).toLowerCase();
}

function parsePositiveInt(value: unknown, fallback = 0) {
  const parsed = Number(cleanText(value).replace(/[^0-9]/g, ""));
  return Number.isFinite(parsed) && parsed > 0 ? parsed : fallback;
}

function escapeRegex(value: string) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function maxResidentialBathroomsForSqm(sqm: number) {
  if (sqm <= 0) return 10;
  if (sqm <= 60) return 2;
  if (sqm <= 100) return 3;
  if (sqm <= 160) return 4;
  if (sqm <= 220) return 5;
  return Math.min(10, Math.ceil(sqm / 45));
}

function maxOfficeToiletsForSqm(sqm: number) {
  if (sqm <= 0) return 20;
  return Math.min(20, Math.max(1, Math.ceil(sqm / 25) + 1));
}

function readControlValue(control: Element) {
  if (control instanceof HTMLInputElement) {
    if (control.type === "checkbox") return control.checked ? "Yes" : "No";
    return control.value;
  }
  if (control instanceof HTMLSelectElement) return control.value;
  if (control instanceof HTMLTextAreaElement) return control.value;
  return "";
}

function readLabelText(label: HTMLLabelElement) {
  const text = cleanText(label.textContent);
  if (text.includes("RUT") && (text.includes("Skatteverkets") || text.includes("conditions") || text.includes("Gäller endast"))) return "RUT";
  const firstSpan = label.querySelector("span");
  return cleanText(firstSpan?.textContent || text)
    .replace("Show price with RUT deduction", "RUT")
    .replace("Visa pris med RUT-avdrag", "RUT")
    .trim();
}

function extractAfterLabel(text: string, labels: string[]) {
  for (const label of labels) {
    const escaped = escapeRegex(label);
    const match = text.match(new RegExp(`${escaped}\\s*([0-9][0-9\\s]*(?:kr|SEK)?(?:\\/(?:mån|month))?)`, "i"));
    if (match?.[1]) return cleanText(match[1]);
  }
  return "";
}

function extractEstimatedTime(text: string) {
  const match = text.match(/(?:Uppskattad tid: cirka|Estimated time: about)\s*([0-9,.]+\s*(?:timmar|hours)(?:\s*(?:per besök|per visit))?)/i);
  return cleanText(match?.[1]);
}

function extractRiskLabel(text: string) {
  const labels = ["Bra prisunderlag", "Behöver kontrolleras", "Manuell offert behövs", "Good estimate basis", "Needs review", "Manual quote needed"];
  return labels.find((label) => text.includes(label)) || "";
}

function findControlByLabels(root: HTMLElement, labels: string[]) {
  const wanted = labels.map(normalize);
  const labelsInRoot = Array.from(root.querySelectorAll("label"));
  for (const label of labelsInRoot) {
    const labelText = normalize(label.querySelector("span")?.textContent || label.textContent);
    if (!wanted.some((wantedText) => labelText.includes(wantedText))) continue;
    const control = label.querySelector("input, select, textarea") as HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement | null;
    if (control) return control;
  }
  return null;
}

function validateBathroomLogic(calculator: HTMLElement, renderWarning: boolean) {
  const language: Language = calculator.id === "price-calculator" ? "en" : "sv";
  const sqmControl = findControlByLabels(calculator, ["Storlek kvm", "Size sqm"]);
  const bathroomControl = findControlByLabels(calculator, ["Antal badrum", "Bathrooms"]);
  const toiletControl = findControlByLabels(calculator, ["Antal toaletter", "Number of toilets"]);
  const warningId = "iboren-calculator-bathroom-warning";
  calculator.querySelector(`#${warningId}`)?.remove();

  const sqm = parsePositiveInt(sqmControl?.value, 0);
  const bathroomCount = parsePositiveInt(bathroomControl?.value, 0);
  const toiletCount = parsePositiveInt(toiletControl?.value, 0);
  let message = "";

  if (bathroomControl && sqm > 0 && bathroomCount > maxResidentialBathroomsForSqm(sqm)) {
    const max = maxResidentialBathroomsForSqm(sqm);
    message = language === "en"
      ? `Bathrooms seems too high for ${sqm} sqm. Maximum ${max} bathrooms is accepted here. Adjust before continuing.`
      : `Antal badrum verkar för högt för ${sqm} kvm. Max ${max} badrum accepteras här. Justera innan du fortsätter.`;
  }

  if (!message && toiletControl && sqm > 0 && toiletCount > maxOfficeToiletsForSqm(sqm)) {
    const max = maxOfficeToiletsForSqm(sqm);
    message = language === "en"
      ? `Number of toilets seems too high for ${sqm} sqm. Maximum ${max} toilets is accepted here. Adjust before continuing.`
      : `Antal toaletter verkar för högt för ${sqm} kvm. Max ${max} toaletter accepteras här. Justera innan du fortsätter.`;
  }

  const links = Array.from(calculator.querySelectorAll<HTMLAnchorElement>("a[href='/#booking'], a[href='#booking'], a[href='/en#booking']"));
  links.forEach((link) => {
    link.dataset.iborenCalculatorInvalid = message ? "1" : "0";
    link.setAttribute("aria-disabled", message ? "true" : "false");
    link.classList.toggle("opacity-55", Boolean(message));
    link.classList.toggle("cursor-not-allowed", Boolean(message));
  });

  if (message && renderWarning) {
    const warning = document.createElement("p");
    warning.id = warningId;
    warning.className = "rounded-2xl border border-red-300/40 bg-red-100 px-4 py-3 text-sm font-bold leading-6 text-red-900";
    warning.textContent = message;
    const target = (bathroomControl || toiletControl)?.closest("label") || calculator.querySelector(".grid");
    target?.insertAdjacentElement("afterend", warning);
  }

  return !message;
}

function validateAllCalculators(renderWarning = true) {
  document.querySelectorAll<HTMLElement>("#pris-kalkylator, #price-calculator").forEach((calculator) => validateBathroomLogic(calculator, renderWarning));
}

function captureCalculatorEstimate(calculator: HTMLElement): CalculatorEstimate {
  const inputs: Record<string, string> = {};

  calculator.querySelectorAll("label").forEach((labelElement) => {
    const label = labelElement as HTMLLabelElement;
    const control = label.querySelector("input, select, textarea");
    const labelText = readLabelText(label);
    if (!control || !labelText) return;
    inputs[labelText] = readControlValue(control);
  });

  const selectedButtons = Array.from(calculator.querySelectorAll("button"))
    .filter((button) => cleanText(button.className).includes("bg-burgundy"))
    .map((button) => cleanText(button.textContent))
    .filter(Boolean);

  const resultCard = Array.from(calculator.querySelectorAll("div"))
    .find((element) => {
      const className = cleanText(element.getAttribute("class"));
      const text = cleanText(element.textContent);
      return className.includes("bg-burgundy") && className.includes("text-porcelain") && (text.includes("RUT") || text.includes("estimate") || text.includes("pris"));
    }) as HTMLElement | undefined;

  const resultText = cleanText(resultCard?.textContent);
  const language: Language = calculator.id === "price-calculator" ? "en" : "sv";

  return {
    version: "v1",
    capturedAt: new Date().toISOString(),
    language,
    sourcePath: window.location.pathname,
    inputs,
    selectedButtons,
    result: {
      title: cleanText(resultCard?.querySelector("p")?.textContent),
      riskLabel: extractRiskLabel(resultText),
      priceBeforeRut: extractAfterLabel(resultText, ["Före RUT / totalpris", "Before RUT / total price"]),
      priceAfterRut: extractAfterLabel(resultText, ["Efter RUT / kundpris", "After RUT / customer price", "Kundpris utan RUT", "Customer price without RUT", "Prisindikation", "Monthly estimate"]),
      estimatedTime: extractEstimatedTime(resultText),
      rawText: resultText
    }
  };
}

function readStoredEstimate(): CalculatorEstimate | null {
  try {
    const raw = window.sessionStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as CalculatorEstimate;
  } catch {
    return null;
  }
}

function getInput(estimate: CalculatorEstimate, keys: string[]) {
  for (const key of keys) {
    const value = estimate.inputs[key];
    if (cleanText(value)) return cleanText(value);
  }
  return "";
}

function clampBathroomForBooking(value: string, sqmValue: string) {
  const count = parsePositiveInt(value, 0);
  const sqm = parsePositiveInt(sqmValue, 0);
  if (!count) return value;
  return String(Math.min(count, 10, maxResidentialBathroomsForSqm(sqm)));
}

function setNativeValue(element: HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement, value: string) {
  const prototype = Object.getPrototypeOf(element);
  const setter = Object.getOwnPropertyDescriptor(prototype, "value")?.set;
  setter?.call(element, value);
  element.dispatchEvent(new Event("input", { bubbles: true }));
  element.dispatchEvent(new Event("change", { bubbles: true }));
}

function setTextField(form: HTMLElement, labels: string[], value: string) {
  if (!cleanText(value)) return;
  const control = findControlByLabels(form, labels);
  if (control instanceof HTMLInputElement || control instanceof HTMLTextAreaElement) setNativeValue(control, value);
}

function setSelectField(form: HTMLElement, labels: string[], rawValue: string) {
  if (!cleanText(rawValue)) return;
  const control = findControlByLabels(form, labels);
  if (!(control instanceof HTMLSelectElement)) return;
  const value = mapSelectValue(rawValue);
  const option = Array.from(control.options).find((item) => item.value === value || normalize(item.textContent) === normalize(rawValue) || normalize(item.textContent) === normalize(value));
  if (option) setNativeValue(control, option.value);
}

function mapSelectValue(value: string) {
  const normalized = normalize(value);
  const map: Record<string, string> = {
    "yes": "Ja",
    "ja": "Ja",
    "no": "Nej",
    "nej": "Nej",
    "not sure": "Vet ej",
    "vet ej": "Vet ej",
    "one-time": "Engång",
    "engång": "Engång",
    "every week": "Varje vecka",
    "varje vecka": "Varje vecka",
    "every other week": "Varannan vecka",
    "varannan vecka": "Varannan vecka",
    "every fourth week": "Varje månad",
    "var fjärde vecka": "Varje månad",
    "every month": "Varje månad",
    "normal": "Annat",
    "dirty": "Annat",
    "very dirty": "Annat"
  };
  return map[normalized] || value;
}

function clickButtonByText(form: HTMLElement, labels: string[]) {
  const wanted = labels.map(normalize);
  const button = Array.from(form.querySelectorAll("button"))
    .find((item) => wanted.includes(normalize(item.textContent)));
  button?.click();
}

function clickExtraIfNeeded(form: HTMLElement, labels: string[]) {
  const wanted = labels.map(normalize);
  const button = Array.from(form.querySelectorAll("button"))
    .find((item) => wanted.includes(normalize(item.textContent)));
  if (!button) return;
  const className = cleanText(button.getAttribute("class"));
  if (!className.includes("bg-gold")) button.click();
}

function autoFillBookingForm(form: HTMLElement, estimate: CalculatorEstimate) {
  if (form.dataset.iborenEstimateAutofilled === "1") return;
  form.dataset.iborenEstimateAutofilled = "1";

  const service = getInput(estimate, ["Tjänst", "Service"]);
  const sqmValue = getInput(estimate, ["Storlek kvm", "Size sqm"]);
  const bathroomValue = clampBathroomForBooking(getInput(estimate, ["Antal badrum", "Bathrooms"]), sqmValue);
  const serviceMap: Record<string, string[]> = {
    "Hemstädning": ["Hemstädning", "Home cleaning"],
    "Home cleaning": ["Hemstädning", "Home cleaning"],
    "Flyttstädning": ["Flyttstädning", "Move-out cleaning"],
    "Move-out cleaning": ["Flyttstädning", "Move-out cleaning"],
    "Kontorsstädning": ["Kontorsstädning", "Office cleaning"],
    "Office cleaning": ["Kontorsstädning", "Office cleaning"],
    "Fönsterputs": ["Fönsterputs", "Window cleaning"],
    "Window cleaning": ["Fönsterputs", "Window cleaning"],
    "Storstädning": ["Hemstädning", "Home cleaning"],
    "Deep cleaning": ["Hemstädning", "Home cleaning"]
  };

  if (serviceMap[service]) clickButtonByText(form, serviceMap[service]);

  function applyFields() {
    setTextField(form, ["Storlek kvm", "Size sqm"], sqmValue);
    setTextField(form, ["Antal rum", "Rooms"], getInput(estimate, ["Antal rum", "Rooms"]));
    setTextField(form, ["Antal badrum", "Bathrooms"], bathroomValue);
    setTextField(form, ["Våning", "Floor"], getInput(estimate, ["Våning", "Floor"]));

    setSelectField(form, ["Frekvens", "Frequency"], getInput(estimate, ["Frekvens", "Frequency"]));
    setSelectField(form, ["Husdjur", "Pets"], getInput(estimate, ["Husdjur", "Pets"]));
    setSelectField(form, ["Hiss", "Elevator"], getInput(estimate, ["Hiss", "Elevator"]));
    setSelectField(form, ["Parkering", "Parking"], getInput(estimate, ["Parkering", "Parking"]));

    if (normalize(service).includes("kontor") || normalize(service).includes("office")) setSelectField(form, ["Typ av objekt", "Property type"], "Kontor");

    const selected = estimate.selectedButtons.map(normalize);
    const has = (labels: string[]) => labels.some((label) => selected.includes(normalize(label)));
    if (has(["Fönsterputs", "Window cleaning"]) && !normalize(service).includes("fönster") && !normalize(service).includes("window")) clickExtraIfNeeded(form, ["Fönsterputs", "Window cleaning"]);
    if (has(["Ugnsrengöring", "Oven cleaning", "Oven"])) clickExtraIfNeeded(form, ["Ugn", "Oven"]);
    if (has(["Kyl/frys", "Fridge/freezer"])) clickExtraIfNeeded(form, ["Kyl/frys", "Fridge/freezer"]);
    if (has(["Balkong", "Balcony"])) clickExtraIfNeeded(form, ["Balkong", "Balcony"]);
    if (has(["Extra smutsigt", "Deep cleaning", "Storstädning"]) || normalize(service).includes("storstäd") || normalize(service).includes("deep cleaning")) clickExtraIfNeeded(form, ["Grovstädning", "Deep cleaning"]);
  }

  applyFields();
  window.setTimeout(applyFields, 80);
  window.setTimeout(applyFields, 300);
}

function BookingRutPanel({ language }: { language: Language }) {
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

function EstimateSummary({ estimate, language }: { estimate: CalculatorEstimate; language: Language }) {
  const t = estimateCopy[language];
  const allInputs = useMemo(() => Object.entries(estimate.inputs).filter(([, value]) => cleanText(value)), [estimate]);

  return (
    <div className="rounded-[1.5rem] border border-gold/20 bg-gold/10 p-4 text-porcelain">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <p className="text-xs font-bold uppercase tracking-[.28em] text-gold">{t.title}</p>
          <p className="mt-2 text-sm leading-6 text-porcelain/70">{t.help}</p>
        </div>
        {estimate.result.riskLabel && <span className="rounded-full border border-gold/35 px-3 py-1 text-[10px] font-black uppercase tracking-[.18em] text-gold">{estimate.result.riskLabel}</span>}
      </div>
      <div className="mt-4 grid gap-3 sm:grid-cols-3">
        <div className="rounded-2xl bg-night/35 p-3"><p className="text-[10px] font-black uppercase tracking-[.2em] text-gold/80">{t.beforeRut}</p><p className="mt-1 font-bold">{estimate.result.priceBeforeRut || t.noValue}</p></div>
        <div className="rounded-2xl bg-night/35 p-3"><p className="text-[10px] font-black uppercase tracking-[.2em] text-gold/80">{t.afterRut}</p><p className="mt-1 font-bold">{estimate.result.priceAfterRut || t.noValue}</p></div>
        <div className="rounded-2xl bg-night/35 p-3"><p className="text-[10px] font-black uppercase tracking-[.2em] text-gold/80">{t.time}</p><p className="mt-1 font-bold">{estimate.result.estimatedTime || t.noValue}</p></div>
      </div>
      {allInputs.length > 0 && (
        <div className="mt-4 rounded-2xl bg-night/25 p-3">
          <p className="mb-2 text-[10px] font-black uppercase tracking-[.2em] text-gold/80">{t.selected}</p>
          <div className="grid gap-1 text-xs text-porcelain/75 sm:grid-cols-2">
            {allInputs.map(([key, value]) => <p key={key}><span className="font-bold text-porcelain/90">{key}:</span> {value}</p>)}
          </div>
        </div>
      )}
      {estimate.selectedButtons.length > 0 && (
        <div className="mt-3 rounded-2xl bg-night/25 p-3">
          <p className="mb-2 text-[10px] font-black uppercase tracking-[.2em] text-gold/80">{t.addOns}</p>
          <p className="text-xs text-porcelain/75">{estimate.selectedButtons.join(", ")}</p>
        </div>
      )}
    </div>
  );
}

function insertHostBeforeDetails(form: HTMLElement, host: HTMLElement) {
  const detailsBlock = Array.from(form.querySelectorAll("p"))
    .find((node) => node.textContent?.includes("Objekt & detaljer") || node.textContent?.includes("Property & details"))
    ?.closest("div");

  if (detailsBlock?.parentElement) detailsBlock.insertAdjacentElement("beforebegin", host);
  else form.querySelector(".grid")?.appendChild(host);
}

export default function BookingRutEnhancer() {
  useEffect(() => {
    function handleCalculatorClick(event: MouseEvent) {
      const target = event.target as Element | null;
      const link = target?.closest("a[href='/#booking'], a[href='#booking'], a[href='/en#booking']") as HTMLAnchorElement | null;
      const calculator = link?.closest("#pris-kalkylator, #price-calculator") as HTMLElement | null;
      if (!calculator) return;
      if (!validateBathroomLogic(calculator, true) || link?.dataset.iborenCalculatorInvalid === "1") {
        event.preventDefault();
        event.stopPropagation();
        calculator.querySelector("#iboren-calculator-bathroom-warning")?.scrollIntoView({ behavior: "smooth", block: "center" });
        return;
      }
      try {
        window.sessionStorage.setItem(STORAGE_KEY, JSON.stringify(captureCalculatorEstimate(calculator)));
      } catch {}
    }

    function handleCalculatorChange(event: Event) {
      const target = event.target as Element | null;
      if (target?.closest("#pris-kalkylator, #price-calculator")) validateAllCalculators(true);
    }

    document.addEventListener("click", handleCalculatorClick, true);
    document.addEventListener("input", handleCalculatorChange, true);
    document.addEventListener("change", handleCalculatorChange, true);
    validateAllCalculators(false);
    const timer = window.setTimeout(() => validateAllCalculators(false), 500);
    return () => {
      window.clearTimeout(timer);
      document.removeEventListener("click", handleCalculatorClick, true);
      document.removeEventListener("input", handleCalculatorChange, true);
      document.removeEventListener("change", handleCalculatorChange, true);
    };
  }, []);

  useEffect(() => {
    const roots: Root[] = [];
    const hosts: HTMLElement[] = [];
    const originalFetch = window.fetch.bind(window);
    let fetchPatched = false;

    function enhanceBookingForm() {
      const form = document.querySelector<HTMLElement>("#booking form");
      if (!form) return;

      const language: Language = isEnglishPath() ? "en" : "sv";
      const estimate = readStoredEstimate();

      if (estimate) autoFillBookingForm(form, estimate);

      if (estimate && !document.querySelector("#iboren-calculator-estimate-host")) {
        const host = document.createElement("div");
        host.id = "iboren-calculator-estimate-host";
        insertHostBeforeDetails(form, host);
        const root = createRoot(host);
        root.render(<EstimateSummary estimate={estimate} language={language} />);
        roots.push(root);
        hosts.push(host);
      }

      if (!isEnglishPath() && !document.querySelector("#iboren-booking-rut-host")) {
        window.__iborenBookingRut = { customerType: "Privatperson", rutRequested: true };
        const host = document.createElement("div");
        host.id = "iboren-booking-rut-host";
        insertHostBeforeDetails(form, host);
        const root = createRoot(host);
        root.render(<BookingRutPanel language={language} />);
        roots.push(root);
        hosts.push(host);
      }

      if (!isEnglishPath() && !fetchPatched) {
        fetchPatched = true;
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
      }
    }

    enhanceBookingForm();
    const observer = new MutationObserver(enhanceBookingForm);
    observer.observe(document.body, { childList: true, subtree: true });
    const timers = [window.setTimeout(enhanceBookingForm, 250), window.setTimeout(enhanceBookingForm, 900), window.setTimeout(enhanceBookingForm, 1600)];

    return () => {
      timers.forEach((timer) => window.clearTimeout(timer));
      observer.disconnect();
      roots.forEach((root) => root.unmount());
      hosts.forEach((host) => host.remove());
      if (fetchPatched) window.fetch = originalFetch;
    };
  }, []);

  return null;
}
