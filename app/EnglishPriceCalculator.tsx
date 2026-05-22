"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { ArrowRight, Calculator, CheckCircle2 } from "lucide-react";

type Service = "Home cleaning" | "Move-out cleaning" | "Deep cleaning" | "Office cleaning" | "Window cleaning";
type Frequency = "One-time" | "Every week" | "Every other week" | "Every fourth week";
type AddOn = "Window cleaning" | "Oven cleaning" | "Fridge/freezer" | "Balcony" | "Extra dirty";
type CustomerType = "Private customer" | "Company";

type Estimate = {
  title: string;
  beforeRut: number;
  afterRut: number;
  hours?: number;
  monthly?: boolean;
  note: string;
};

const services: Service[] = ["Home cleaning", "Move-out cleaning", "Deep cleaning", "Office cleaning", "Window cleaning"];
const frequencies: Frequency[] = ["One-time", "Every week", "Every other week", "Every fourth week"];
const addOns: AddOn[] = ["Window cleaning", "Oven cleaning", "Fridge/freezer", "Balcony", "Extra dirty"];
const customerTypes: CustomerType[] = ["Private customer", "Company"];

function parseNumber(value: string, fallback: number) {
  const parsed = Number(value.replace(/[^0-9]/g, ""));
  return Number.isFinite(parsed) && parsed > 0 ? parsed : fallback;
}

function formatSek(value: number) {
  return new Intl.NumberFormat("en-SE", { style: "currency", currency: "SEK", maximumFractionDigits: 0 }).format(Math.round(value));
}

function frequencyDiscount(frequency: Frequency) {
  if (frequency === "Every week") return 0.1;
  if (frequency === "Every other week") return 0.05;
  return 0;
}

function serviceAllowsRut(service: Service) {
  return service !== "Office cleaning";
}

function addOnBeforeRutPrice(addOn: AddOn) {
  if (addOn === "Window cleaning") return 700;
  if (addOn === "Oven cleaning") return 350;
  if (addOn === "Fridge/freezer") return 350;
  if (addOn === "Balcony") return 300;
  if (addOn === "Extra dirty") return 500;
  return 0;
}

function estimatePrice(service: Service, sqm: number, frequency: Frequency, bathrooms: number, selectedAddOns: AddOn[], useRut: boolean): Estimate {
  const addOnBeforeRut = selectedAddOns.reduce((sum, item) => sum + addOnBeforeRutPrice(item), 0);
  const rutFactor = useRut ? 0.5 : 1;

  if (service === "Home cleaning") {
    const hours = Math.max(2, sqm / 38 + Math.max(0, bathrooms - 1) * 0.3);
    const hourlyBeforeRut = frequency === "One-time" ? 590 : 520;
    const baseBeforeRut = hours * hourlyBeforeRut;
    const discountedBeforeRut = baseBeforeRut * (1 - frequencyDiscount(frequency));
    const beforeRut = Math.max(frequency === "One-time" ? 1180 : 1040, discountedBeforeRut + addOnBeforeRut);
    return { title: "Estimated price for home cleaning", beforeRut, afterRut: beforeRut * rutFactor, hours, note: "Competitive price indication: recurring home cleaning is calculated from about 260 SEK/hour after RUT before frequency discount. One-time cleaning is higher because startup and review take more time." };
  }

  if (service === "Move-out cleaning") {
    const basePerSqmBeforeRut = sqm <= 80 ? 42 : sqm <= 140 ? 40 : 38;
    const bathroomAddonBeforeRut = Math.max(0, bathrooms - 1) * 400;
    const beforeRut = Math.max(2300, sqm * basePerSqmBeforeRut + bathroomAddonBeforeRut + addOnBeforeRut);
    return { title: "Estimated price for move-out cleaning", beforeRut, afterRut: beforeRut * rutFactor, note: "Move-out cleaning is calculated with a fixed square-metre model from about 21 SEK/sqm after RUT. Final price depends on condition, add-ons, windows, balcony and access." };
  }

  if (service === "Deep cleaning") {
    const hours = Math.max(3, sqm / 27 + Math.max(0, bathrooms - 1) * 0.4);
    const beforeRut = Math.max(1770, hours * 590 + addOnBeforeRut);
    return { title: "Estimated price for deep cleaning", beforeRut, afterRut: beforeRut * rutFactor, hours, note: "Deep cleaning is calculated from about 295 SEK/hour after RUT. The time is affected more by the home's condition than recurring home cleaning." };
  }

  if (service === "Office cleaning") {
    const factor = frequency === "Every week" ? 49 : frequency === "Every other week" ? 39 : 29;
    const monthly = Math.max(1500, sqm * factor + Math.max(0, bathrooms - 1) * 250);
    return { title: "Price indication for office cleaning", beforeRut: monthly, afterRut: monthly, monthly: true, note: "Office cleaning is shown as a competitive monthly indication from about 29–49 SEK/sqm/month. RUT does not apply to company cleaning." };
  }

  let afterRutFrom = 695;
  if (sqm > 80) afterRutFrom = 995;
  if (sqm > 140) afterRutFrom = 1495;
  const beforeRut = afterRutFrom * 2 + selectedAddOns.filter((item) => item !== "Window cleaning").reduce((sum, item) => sum + addOnBeforeRutPrice(item), 0);
  return { title: "Estimated price for window cleaning", beforeRut, afterRut: beforeRut * rutFactor, note: "Window cleaning is shown from 695 SEK after RUT for smaller homes. Exact price depends on number of windows, access, floor level and condition." };
}

export default function EnglishPriceCalculator() {
  const [service, setService] = useState<Service>("Home cleaning");
  const [customerType, setCustomerType] = useState<CustomerType>("Private customer");
  const [sqm, setSqm] = useState("75");
  const [frequency, setFrequency] = useState<Frequency>("One-time");
  const [bathrooms, setBathrooms] = useState("1");
  const [postalCode, setPostalCode] = useState("151 46");
  const [rutRequested, setRutRequested] = useState(true);
  const [selectedAddOns, setSelectedAddOns] = useState<AddOn[]>([]);

  const rutEligible = customerType === "Private customer" && serviceAllowsRut(service);
  const useRut = rutEligible && rutRequested;
  const result = useMemo(() => estimatePrice(service, parseNumber(sqm, 75), frequency, parseNumber(bathrooms, 1), selectedAddOns, useRut), [service, sqm, frequency, bathrooms, selectedAddOns, useRut]);

  function setSelectedService(nextService: Service) {
    setService(nextService);
    if (!serviceAllowsRut(nextService)) {
      setCustomerType("Company");
      setRutRequested(false);
    }
  }

  function setSelectedCustomerType(nextType: CustomerType) {
    setCustomerType(nextType);
    if (nextType === "Company") setRutRequested(false);
    if (nextType === "Private customer" && serviceAllowsRut(service)) setRutRequested(true);
  }

  function toggleAddOn(addOn: AddOn) {
    setSelectedAddOns((current) => current.includes(addOn) ? current.filter((item) => item !== addOn) : [...current, addOn]);
  }

  return (
    <section className="rounded-[2rem] border border-burgundy/10 bg-porcelain p-6 shadow-luxe md:p-8" id="price-calculator">
      <div className="mb-7 flex items-center justify-between gap-4"><div><p className="text-xs font-black uppercase tracking-[.28em] text-burgundy">Calculator</p><h2 className="display mt-2 text-4xl font-bold text-burgundy">Calculate price</h2></div><div className="grid h-14 w-14 shrink-0 place-items-center rounded-full bg-burgundy text-porcelain"><Calculator /></div></div>
      <div className="grid gap-4">
        <label className="block"><span className="mb-2 block text-sm font-bold">Service</span><select value={service} onChange={(event) => setSelectedService(event.target.value as Service)} className="w-full rounded-2xl border border-burgundy/10 bg-cream px-4 py-4">{services.map((item) => <option key={item} value={item}>{item}</option>)}</select></label>
        <div><p className="mb-2 text-sm font-bold">Customer type</p><div className="grid grid-cols-2 gap-2">{customerTypes.map((item) => <button type="button" key={item} onClick={() => setSelectedCustomerType(item)} className={`rounded-2xl border px-4 py-3 text-sm font-bold transition ${customerType === item ? "border-burgundy bg-burgundy text-porcelain" : "border-burgundy/10 bg-cream text-ink"}`}>{item}</button>)}</div></div>
        <div className="grid gap-4 sm:grid-cols-2"><NumberField label="Size sqm" value={sqm} onChange={setSqm} /><NumberField label="Number of bathrooms" value={bathrooms} onChange={setBathrooms} /></div>
        <div className="grid gap-4 sm:grid-cols-2"><label className="block"><span className="mb-2 block text-sm font-bold">Frequency</span><select value={frequency} onChange={(event) => setFrequency(event.target.value as Frequency)} className="w-full rounded-2xl border border-burgundy/10 bg-cream px-4 py-4">{frequencies.map((item) => <option key={item} value={item}>{item}</option>)}</select></label><label className="block"><span className="mb-2 block text-sm font-bold">Postal code</span><input value={postalCode} onChange={(event) => setPostalCode(event.target.value.slice(0, 12))} className="w-full rounded-2xl border border-burgundy/10 bg-cream px-4 py-4" placeholder="151 46" /></label></div>
        <div><p className="mb-2 text-sm font-bold">Add-ons</p><div className="grid gap-2 sm:grid-cols-2">{addOns.map((item) => <button type="button" key={item} onClick={() => toggleAddOn(item)} className={`rounded-2xl border px-4 py-3 text-left text-sm font-bold transition ${selectedAddOns.includes(item) ? "border-burgundy bg-burgundy text-porcelain" : "border-burgundy/10 bg-cream text-ink"}`}>{item}</button>)}</div></div>
        {rutEligible ? <label className="flex items-start gap-3 rounded-2xl bg-cream p-4 text-sm font-bold"><input type="checkbox" checked={rutRequested} onChange={(event) => setRutRequested(event.target.checked)} className="mt-1 h-5 w-5" /><span>Show price with RUT deduction<br /><span className="font-normal text-ink/65">Only applies when the customer fulfils Skatteverket's conditions.</span></span></label> : <p className="rounded-2xl bg-cream p-4 text-sm font-bold text-ink/70">RUT is not shown for companies or office cleaning. The price is shown as a business price or quote.</p>}
      </div>
      <div className="mt-7 rounded-[2rem] bg-burgundy p-6 text-porcelain"><p className="text-xs font-black uppercase tracking-[.28em] text-gold">{result.title}</p><div className="mt-4 grid gap-4 sm:grid-cols-2"><div><p className="text-sm text-porcelain/75">Before RUT / total price</p><p className="display mt-1 text-4xl font-bold">{formatSek(result.beforeRut)}</p></div><div><p className="text-sm text-porcelain/75">{result.monthly ? "Price indication" : useRut ? "After RUT / customer price" : "Customer price without RUT"}</p><p className="display mt-1 text-4xl font-bold text-gold">{formatSek(result.afterRut)}{result.monthly ? "/month" : ""}</p></div></div>{result.hours && <p className="mt-4 inline-flex rounded-full bg-porcelain/10 px-4 py-2 text-sm font-bold text-gold">Estimated time: about {result.hours.toFixed(1)} hours</p>}<p className="mt-5 text-sm leading-7 text-porcelain/75">{result.note}</p><p className="mt-3 text-xs leading-6 text-porcelain/60">Customer type: {customerType}. RUT: {useRut ? "Yes" : "No"}. Postal code: {postalCode || "not entered"}. This is an estimated price. Final price is confirmed after the booking request.</p><div className="mt-6 flex flex-col gap-3 sm:flex-row"><Link href="/en#booking" className="inline-flex items-center justify-center rounded-full bg-gold px-5 py-3 text-sm font-black uppercase tracking-[.12em] text-ink">Book cleaning <ArrowRight className="ml-2 h-4 w-4" /></Link><Link href="/en#booking" className="inline-flex items-center justify-center rounded-full border border-gold/40 px-5 py-3 text-sm font-black uppercase tracking-[.12em] text-gold">Send request</Link></div></div>
      <div className="mt-5 grid gap-3 text-sm text-ink/70 md:grid-cols-3">{["RUT deduction is shown only for private customers and services where RUT normally can be used.", "Final price is confirmed before the request becomes binding.", "The calculation is used as a price indication, not a fixed quote."].map((item) => <p key={item} className="flex gap-2 rounded-2xl bg-cream p-4"><CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-burgundy" /> {item}</p>)}</div>
    </section>
  );
}

function NumberField({ label, value, onChange }: { label: string; value: string; onChange: (value: string) => void }) {
  return <label className="block"><span className="mb-2 block text-sm font-bold">{label}</span><input inputMode="numeric" value={value} onChange={(event) => onChange(event.target.value.replace(/[^0-9]/g, ""))} className="w-full rounded-2xl border border-burgundy/10 bg-cream px-4 py-4" /></label>;
}
