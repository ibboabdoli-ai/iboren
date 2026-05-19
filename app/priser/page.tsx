"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { ArrowRight, Calculator, CheckCircle2, Info } from "lucide-react";

type Service = "Hemstädning" | "Flyttstädning" | "Kontorsstädning" | "Fönsterputs";

type EstimateResult = {
  beforeRut: number;
  afterRut: number;
  note: string;
  exact?: boolean;
};

const serviceOptions: Service[] = ["Hemstädning", "Flyttstädning", "Kontorsstädning", "Fönsterputs"];

const flyttstadningAfterRut = [
  { max: 49, price: 1500 },
  { max: 59, price: 1650 },
  { max: 69, price: 1900 },
  { max: 79, price: 2100 },
  { max: 89, price: 2300 },
  { max: 99, price: 2500 },
  { max: 109, price: 2700 },
  { max: 119, price: 2900 },
  { max: 129, price: 3100 },
  { max: 139, price: 3300 },
  { max: 149, price: 3500 }
];

function clampNumber(value: string, fallback: number) {
  const parsed = Number(value.replace(/[^0-9.]/g, ""));
  return Number.isFinite(parsed) && parsed > 0 ? parsed : fallback;
}

function formatSek(value: number) {
  return new Intl.NumberFormat("sv-SE", { style: "currency", currency: "SEK", maximumFractionDigits: 0 }).format(Math.round(value));
}

function estimate(service: Service, sqm: number, rooms: number, bathrooms: number, windows: number, recurring: boolean): EstimateResult {
  if (service === "Hemstädning") {
    const hours = Math.max(2, sqm / 42 + rooms * 0.15 + bathrooms * 0.3);
    const hourlyAfterRut = recurring ? 255 : 315;
    const afterRut = Math.max(recurring ? 510 : 630, hours * hourlyAfterRut);
    return {
      beforeRut: afterRut * 2,
      afterRut,
      note: recurring ? "Beräknat från marknadsnivå för återkommande hemstädning efter RUT. Efter första städningen kan tiden justeras." : "Engångsstädning ligger normalt högre än återkommande städning eftersom start och förberedelse tar mer tid."
    };
  }

  if (service === "Flyttstädning") {
    const match = flyttstadningAfterRut.find((row) => sqm <= row.max);
    if (!match) return { beforeRut: 0, afterRut: 0, exact: false, note: "För 150 kvm eller större bör priset lämnas som offert efter kontroll av yta, skick, antal våtrum och tillval." };
    const bathroomAddon = Math.max(0, bathrooms - 1) * 250;
    const afterRut = match.price + bathroomAddon;
    return { beforeRut: afterRut * 2, afterRut, exact: true, note: "Flyttstädning följer en fast kvm-trappa som liknar lokala prislistor. Fönsterputs och tillval måste bekräftas i offerten." };
  }

  if (service === "Kontorsstädning") {
    const hours = Math.max(2, sqm / 55 + bathrooms * 0.25);
    const price = hours * 430;
    return { beforeRut: price, afterRut: price, note: "Företagsstädning visas som indikativt pris exklusive RUT. Slutpris beror på frekvens, tider och lokalens krav." };
  }

  const afterRut = Math.max(550, 390 + windows * 55 + sqm * 1.4);
  return { beforeRut: afterRut * 2, afterRut, note: "Fönsterputs beror på antal fönster, åtkomst, skick och om tjänsten kombineras med annan städning." };
}

export default function PriserPage() {
  const [service, setService] = useState<Service>("Hemstädning");
  const [sqm, setSqm] = useState("75");
  const [rooms, setRooms] = useState("3");
  const [bathrooms, setBathrooms] = useState("1");
  const [windows, setWindows] = useState("8");
  const [recurring, setRecurring] = useState(false);

  const result = useMemo(() => estimate(service, clampNumber(sqm, 75), clampNumber(rooms, 3), clampNumber(bathrooms, 1), clampNumber(windows, 8), recurring), [service, sqm, rooms, bathrooms, windows, recurring]);
  const showOffer = service === "Flyttstädning" && !result.exact && result.afterRut === 0;

  return (
    <main className="min-h-screen bg-cream text-ink">
      <section className="relative overflow-hidden py-20 md:py-28">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_20%,rgba(212,165,116,.35),transparent_32%),radial-gradient(circle_at_18%_75%,rgba(107,39,55,.14),transparent_34%)]" />
        <div className="luxe-container relative grid gap-10 lg:grid-cols-[.9fr_1.1fr] lg:items-start">
          <div>
            <Link href="/" className="mb-10 inline-flex text-sm font-bold text-burgundy">← Tillbaka</Link>
            <p className="eyebrow">Prisindikator</p>
            <h1 className="display mt-4 text-6xl font-bold leading-[.88] text-burgundy md:text-8xl">Priser</h1>
            <p className="mt-7 max-w-2xl text-lg leading-8 text-ink/75 md:text-xl">Räkna fram ett ungefärligt pris för städning. Kalkylen visar en prisindikator, inte ett bindande slutpris.</p>
            <div className="mt-8 rounded-2xl border border-burgundy/10 bg-porcelain p-5 text-sm leading-7 text-ink/75">
              <p className="flex gap-3"><Info className="mt-1 h-5 w-5 shrink-0 text-burgundy" /> Priset påverkas av yta, skick, extra tjänster, antal badrum, fönster, datum och åtkomst. Förfrågan är inte bindande förrän Iboren bekräftar pris och tid.</p>
            </div>
          </div>

          <section className="rounded-[2rem] border border-burgundy/10 bg-porcelain p-6 shadow-luxe md:p-8">
            <div className="mb-7 flex items-center justify-between">
              <div><p className="text-xs font-black uppercase tracking-[.28em] text-burgundy">Kalkylator</p><h2 className="display mt-2 text-4xl font-bold text-burgundy">Beräkna pris</h2></div>
              <div className="grid h-14 w-14 place-items-center rounded-full bg-burgundy text-porcelain"><Calculator /></div>
            </div>

            <div className="grid gap-4">
              <label className="block"><span className="mb-2 block text-sm font-bold">Tjänst</span><select value={service} onChange={(e) => setService(e.target.value as Service)} className="w-full rounded-2xl border border-burgundy/10 bg-cream px-4 py-4">{serviceOptions.map((item) => <option key={item}>{item}</option>)}</select></label>
              <div className="grid gap-4 sm:grid-cols-2">
                <Field label="Storlek kvm" value={sqm} onChange={setSqm} />
                <Field label="Antal rum" value={rooms} onChange={setRooms} />
                <Field label="Antal badrum" value={bathrooms} onChange={setBathrooms} />
                <Field label="Antal fönster" value={windows} onChange={setWindows} />
              </div>
              <label className="flex items-center gap-3 rounded-2xl bg-cream p-4 text-sm font-bold"><input type="checkbox" checked={recurring} onChange={(e) => setRecurring(e.target.checked)} className="h-5 w-5" /> Återkommande städning</label>
            </div>

            <div className="mt-7 rounded-[2rem] bg-burgundy p-6 text-porcelain">
              <p className="text-xs font-black uppercase tracking-[.28em] text-gold">Ungefärligt pris</p>
              {showOffer ? <p className="display mt-4 text-5xl font-bold text-gold">Offert</p> : <div className="mt-4 grid gap-4 sm:grid-cols-2"><div><p className="text-sm text-porcelain/75">Före RUT / totalpris</p><p className="display mt-1 text-4xl font-bold">{formatSek(result.beforeRut)}</p></div><div><p className="text-sm text-porcelain/75">Efter RUT / kundpris</p><p className="display mt-1 text-4xl font-bold text-gold">{formatSek(result.afterRut)}</p></div></div>}
              <p className="mt-5 text-sm leading-7 text-porcelain/75">{result.note}</p>
              <Link href="/#booking" className="mt-6 inline-flex rounded-full bg-gold px-5 py-3 text-sm font-black uppercase tracking-[.12em] text-ink">Gå vidare till bokning <ArrowRight className="ml-2 h-4 w-4" /></Link>
            </div>
          </section>
        </div>
      </section>

      <section className="bg-porcelain py-16">
        <div className="luxe-container grid gap-5 md:grid-cols-3">
          {["Prisindikator först", "Slutpris bekräftas", "Ingen bindning direkt"].map((item) => <article key={item} className="rounded-[2rem] bg-cream p-6 shadow-soft"><CheckCircle2 className="mb-5 text-burgundy" /><h3 className="display text-3xl font-bold text-burgundy">{item}</h3><p className="mt-3 leading-7 text-ink/75">Kalkylen hjälper kunden förstå ungefärlig nivå innan förfrågan skickas.</p></article>)}
        </div>
      </section>
    </main>
  );
}

function Field({ label, value, onChange }: { label: string; value: string; onChange: (value: string) => void }) {
  return <label className="block"><span className="mb-2 block text-sm font-bold">{label}</span><input inputMode="numeric" value={value} onChange={(e) => onChange(e.target.value.replace(/[^0-9]/g, ""))} className="w-full rounded-2xl border border-burgundy/10 bg-cream px-4 py-4" /></label>;
}
