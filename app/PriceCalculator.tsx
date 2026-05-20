"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { ArrowRight, Calculator, CheckCircle2 } from "lucide-react";

type Service = "Hemstädning" | "Flyttstädning" | "Storstädning" | "Kontorsstädning" | "Fönsterputs";
type Frequency = "Engång" | "Varje vecka" | "Varannan vecka" | "Var fjärde vecka";
type AddOn = "Fönsterputs" | "Ugnsrengöring" | "Kyl/frys" | "Balkong" | "Extra smutsigt";

type Estimate = {
  title: string;
  beforeRut: number;
  afterRut: number;
  hours?: number;
  monthly?: boolean;
  quoteOnly?: boolean;
  note: string;
};

const services: Service[] = ["Hemstädning", "Flyttstädning", "Storstädning", "Kontorsstädning", "Fönsterputs"];
const frequencies: Frequency[] = ["Engång", "Varje vecka", "Varannan vecka", "Var fjärde vecka"];
const addOns: AddOn[] = ["Fönsterputs", "Ugnsrengöring", "Kyl/frys", "Balkong", "Extra smutsigt"];

function parseNumber(value: string, fallback: number) {
  const parsed = Number(value.replace(/[^0-9]/g, ""));
  return Number.isFinite(parsed) && parsed > 0 ? parsed : fallback;
}

function formatSek(value: number) {
  return new Intl.NumberFormat("sv-SE", { style: "currency", currency: "SEK", maximumFractionDigits: 0 }).format(Math.round(value));
}

function frequencyDiscount(frequency: Frequency) {
  if (frequency === "Varje vecka") return 0.1;
  if (frequency === "Varannan vecka") return 0.05;
  return 0;
}

function addOnBeforeRutPrice(addOn: AddOn) {
  if (addOn === "Fönsterputs") return 700;
  if (addOn === "Ugnsrengöring") return 350;
  if (addOn === "Kyl/frys") return 350;
  if (addOn === "Balkong") return 300;
  if (addOn === "Extra smutsigt") return 500;
  return 0;
}

function estimatePrice(service: Service, sqm: number, frequency: Frequency, bathrooms: number, selectedAddOns: AddOn[], rut: boolean): Estimate {
  const addOnBeforeRut = selectedAddOns.reduce((sum, item) => sum + addOnBeforeRutPrice(item), 0);
  const rutFactor = rut ? 0.5 : 1;

  if (service === "Hemstädning") {
    const hours = Math.max(2, sqm / 38 + Math.max(0, bathrooms - 1) * 0.3);
    const hourlyBeforeRut = frequency === "Engång" ? 590 : 520;
    const baseBeforeRut = hours * hourlyBeforeRut;
    const discountedBeforeRut = baseBeforeRut * (1 - frequencyDiscount(frequency));
    const beforeRut = Math.max(frequency === "Engång" ? 1180 : 1040, discountedBeforeRut + addOnBeforeRut);
    return {
      title: "Uppskattat pris för hemstädning",
      beforeRut,
      afterRut: beforeRut * rutFactor,
      hours,
      note: "Konkurrenskraftig prisindikation: återkommande hemstädning räknas från cirka 260 kr/tim efter RUT innan frekvensrabatt. Engångsstädning ligger högre eftersom start och genomgång tar mer tid."
    };
  }

  if (service === "Flyttstädning") {
    const basePerSqmBeforeRut = sqm <= 80 ? 42 : sqm <= 140 ? 40 : 38;
    const bathroomAddonBeforeRut = Math.max(0, bathrooms - 1) * 400;
    const beforeRut = Math.max(2300, sqm * basePerSqmBeforeRut + bathroomAddonBeforeRut + addOnBeforeRut);
    return {
      title: "Uppskattat pris för flyttstädning",
      beforeRut,
      afterRut: beforeRut * rutFactor,
      note: "Flyttstädning räknas med fast kvm-modell från cirka 21 kr/kvm efter RUT. Slutpris påverkas av bostadens skick, tillval, fönster, balkong och åtkomst."
    };
  }

  if (service === "Storstädning") {
    const hours = Math.max(3, sqm / 27 + Math.max(0, bathrooms - 1) * 0.4);
    const beforeRut = Math.max(1770, hours * 590 + addOnBeforeRut);
    return {
      title: "Uppskattat pris för storstädning",
      beforeRut,
      afterRut: beforeRut * rutFactor,
      hours,
      note: "Storstädning beräknas från cirka 295 kr/tim efter RUT. Tiden påverkas mer av bostadens skick än vid återkommande hemstädning."
    };
  }

  if (service === "Kontorsstädning") {
    const factor = frequency === "Varje vecka" ? 49 : frequency === "Varannan vecka" ? 39 : 29;
    const monthly = Math.max(1500, sqm * factor + Math.max(0, bathrooms - 1) * 250);
    return {
      title: "Prisindikation för kontorsstädning",
      beforeRut: monthly,
      afterRut: monthly,
      monthly: true,
      note: "Kontorsstädning visas som konkurrenskraftig månadsindikation från cirka 29–49 kr/kvm/mån. RUT gäller inte företagsstädning."
    };
  }

  let afterRutFrom = 695;
  if (sqm > 80) afterRutFrom = 995;
  if (sqm > 140) afterRutFrom = 1495;
  const beforeRut = afterRutFrom * 2 + selectedAddOns.filter((item) => item !== "Fönsterputs").reduce((sum, item) => sum + addOnBeforeRutPrice(item), 0);
  return {
    title: "Uppskattat pris för fönsterputs",
    beforeRut,
    afterRut: beforeRut * rutFactor,
    note: "Fönsterputs visas från 695 kr efter RUT för mindre bostäder. Exakt pris beror på antal fönster, åtkomst, våningsplan och skick."
  };
}

export default function PriceCalculator() {
  const [service, setService] = useState<Service>("Hemstädning");
  const [sqm, setSqm] = useState("75");
  const [frequency, setFrequency] = useState<Frequency>("Engång");
  const [bathrooms, setBathrooms] = useState("1");
  const [postalCode, setPostalCode] = useState("151 46");
  const [rut, setRut] = useState(true);
  const [selectedAddOns, setSelectedAddOns] = useState<AddOn[]>([]);

  const result = useMemo(() => estimatePrice(service, parseNumber(sqm, 75), frequency, parseNumber(bathrooms, 1), selectedAddOns, rut), [service, sqm, frequency, bathrooms, selectedAddOns, rut]);

  function toggleAddOn(addOn: AddOn) {
    setSelectedAddOns((current) => current.includes(addOn) ? current.filter((item) => item !== addOn) : [...current, addOn]);
  }

  return (
    <section className="rounded-[2rem] border border-burgundy/10 bg-porcelain p-6 shadow-luxe md:p-8" id="pris-kalkylator">
      <div className="mb-7 flex items-center justify-between gap-4">
        <div>
          <p className="text-xs font-black uppercase tracking-[.28em] text-burgundy">Kalkylator</p>
          <h2 className="display mt-2 text-4xl font-bold text-burgundy">Beräkna pris</h2>
        </div>
        <div className="grid h-14 w-14 shrink-0 place-items-center rounded-full bg-burgundy text-porcelain"><Calculator /></div>
      </div>

      <div className="grid gap-4">
        <label className="block">
          <span className="mb-2 block text-sm font-bold">Tjänst</span>
          <select value={service} onChange={(event) => setService(event.target.value as Service)} className="w-full rounded-2xl border border-burgundy/10 bg-cream px-4 py-4">
            {services.map((item) => <option key={item} value={item}>{item}</option>)}
          </select>
        </label>

        <div className="grid gap-4 sm:grid-cols-2">
          <NumberField label="Storlek kvm" value={sqm} onChange={setSqm} />
          <NumberField label="Antal badrum" value={bathrooms} onChange={setBathrooms} />
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <label className="block">
            <span className="mb-2 block text-sm font-bold">Frekvens</span>
            <select value={frequency} onChange={(event) => setFrequency(event.target.value as Frequency)} className="w-full rounded-2xl border border-burgundy/10 bg-cream px-4 py-4">
              {frequencies.map((item) => <option key={item} value={item}>{item}</option>)}
            </select>
          </label>
          <label className="block">
            <span className="mb-2 block text-sm font-bold">Postnummer</span>
            <input value={postalCode} onChange={(event) => setPostalCode(event.target.value.slice(0, 12))} className="w-full rounded-2xl border border-burgundy/10 bg-cream px-4 py-4" placeholder="151 46" />
          </label>
        </div>

        <div>
          <p className="mb-2 text-sm font-bold">Tillval</p>
          <div className="grid gap-2 sm:grid-cols-2">
            {addOns.map((item) => (
              <button type="button" key={item} onClick={() => toggleAddOn(item)} className={`rounded-2xl border px-4 py-3 text-left text-sm font-bold transition ${selectedAddOns.includes(item) ? "border-burgundy bg-burgundy text-porcelain" : "border-burgundy/10 bg-cream text-ink"}`}>{item}</button>
            ))}
          </div>
        </div>

        <label className="flex items-center gap-3 rounded-2xl bg-cream p-4 text-sm font-bold">
          <input type="checkbox" checked={rut} onChange={(event) => setRut(event.target.checked)} className="h-5 w-5" /> Visa pris med RUT-avdrag
        </label>
      </div>

      <div className="mt-7 rounded-[2rem] bg-burgundy p-6 text-porcelain">
        <p className="text-xs font-black uppercase tracking-[.28em] text-gold">{result.title}</p>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <div>
            <p className="text-sm text-porcelain/75">Före RUT / totalpris</p>
            <p className="display mt-1 text-4xl font-bold">{formatSek(result.beforeRut)}</p>
          </div>
          <div>
            <p className="text-sm text-porcelain/75">{result.monthly ? "Prisindikation" : rut ? "Efter RUT / kundpris" : "Kundpris utan RUT"}</p>
            <p className="display mt-1 text-4xl font-bold text-gold">{formatSek(result.afterRut)}{result.monthly ? "/mån" : ""}</p>
          </div>
        </div>
        {result.hours && <p className="mt-4 inline-flex rounded-full bg-porcelain/10 px-4 py-2 text-sm font-bold text-gold">Uppskattad tid: cirka {result.hours.toFixed(1).replace(".", ",")} timmar</p>}
        <p className="mt-5 text-sm leading-7 text-porcelain/75">{result.note}</p>
        <p className="mt-3 text-xs leading-6 text-porcelain/60">Postnummer: {postalCode || "ej angivet"}. Priset är ett uppskattat pris. Slutligt pris bekräftas efter bokningsförfrågan.</p>
        <div className="mt-6 flex flex-col gap-3 sm:flex-row">
          <Link href="/#booking" className="inline-flex items-center justify-center rounded-full bg-gold px-5 py-3 text-sm font-black uppercase tracking-[.12em] text-ink">Boka städning <ArrowRight className="ml-2 h-4 w-4" /></Link>
          <Link href="/#booking" className="inline-flex items-center justify-center rounded-full border border-gold/40 px-5 py-3 text-sm font-black uppercase tracking-[.12em] text-gold">Skicka förfrågan</Link>
        </div>
      </div>

      <div className="mt-5 grid gap-3 text-sm text-ink/70 md:grid-cols-3">
        {[
          "RUT-avdrag dras normalt direkt på fakturan.",
          "Slutpris bekräftas innan bokningen blir bindande.",
          "Beräkningen används som prisindikation, inte fast offert."
        ].map((item) => <p key={item} className="flex gap-2 rounded-2xl bg-cream p-4"><CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-burgundy" /> {item}</p>)}
      </div>
    </section>
  );
}

function NumberField({ label, value, onChange }: { label: string; value: string; onChange: (value: string) => void }) {
  return (
    <label className="block">
      <span className="mb-2 block text-sm font-bold">{label}</span>
      <input inputMode="numeric" value={value} onChange={(event) => onChange(event.target.value.replace(/[^0-9]/g, ""))} className="w-full rounded-2xl border border-burgundy/10 bg-cream px-4 py-4" />
    </label>
  );
}
