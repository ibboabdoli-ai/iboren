"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { ArrowRight, Calculator, CheckCircle2 } from "lucide-react";

type Service = "Hemstädning" | "Flyttstädning" | "Storstädning" | "Kontorsstädning" | "Fönsterputs";
type Frequency = "Engång" | "Varje vecka" | "Varannan vecka" | "Var fjärde vecka";
type AddOn = "Fönsterputs" | "Ugnsrengöring" | "Kyl/frys" | "Balkong" | "Extra smutsigt";
type CustomerType = "Privatperson" | "Företag";
type Condition = "Normal" | "Smutsigt" | "Mycket smutsigt";
type YesNo = "Ja" | "Nej";
type Furnished = "Tom bostad" | "Möblerad";
type Access = "Normal" | "Svår åtkomst";
type WindowSide = "Båda sidor" | "Endast insida" | "Endast utsida";
type BalconyGlass = "Nej" | "Liten" | "Stor";
type RiskLevel = "Grön" | "Gul" | "Röd";

type Estimate = {
  title: string;
  beforeRut: number;
  afterRut: number;
  hours?: number;
  monthly?: boolean;
  addOnsBeforeRut: number;
  riskLevel: RiskLevel;
  factors: string[];
  note: string;
};

type EstimateInput = {
  service: Service;
  sqm: number;
  frequency: Frequency;
  bathrooms: number;
  rooms: number;
  windows: number;
  officeVisits: number;
  officeToilets: number;
  condition: Condition;
  furnished: Furnished;
  pets: YesNo;
  floor: number;
  elevator: YesNo;
  parking: YesNo;
  access: Access;
  shortNotice: YesNo;
  weekend: YesNo;
  windowSide: WindowSide;
  balconyGlass: BalconyGlass;
  kitchen: YesNo;
  selectedAddOns: AddOn[];
  useRut: boolean;
};

const services: Service[] = ["Hemstädning", "Flyttstädning", "Storstädning", "Kontorsstädning", "Fönsterputs"];
const frequencies: Frequency[] = ["Engång", "Varje vecka", "Varannan vecka", "Var fjärde vecka"];
const addOns: AddOn[] = ["Fönsterputs", "Ugnsrengöring", "Kyl/frys", "Balkong", "Extra smutsigt"];
const customerTypes: CustomerType[] = ["Privatperson", "Företag"];
const conditions: Condition[] = ["Normal", "Smutsigt", "Mycket smutsigt"];
const yesNoOptions: YesNo[] = ["Ja", "Nej"];
const furnishedOptions: Furnished[] = ["Tom bostad", "Möblerad"];
const accessOptions: Access[] = ["Normal", "Svår åtkomst"];
const windowSideOptions: WindowSide[] = ["Båda sidor", "Endast insida", "Endast utsida"];
const balconyGlassOptions: BalconyGlass[] = ["Nej", "Liten", "Stor"];

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

function serviceAllowsRut(service: Service) {
  return service !== "Kontorsstädning";
}

function addOnBeforeRutPrice(addOn: AddOn) {
  if (addOn === "Fönsterputs") return 700;
  if (addOn === "Ugnsrengöring") return 350;
  if (addOn === "Kyl/frys") return 350;
  if (addOn === "Balkong") return 450;
  if (addOn === "Extra smutsigt") return 650;
  return 0;
}

function conditionMultiplier(condition: Condition) {
  if (condition === "Smutsigt") return 1.15;
  if (condition === "Mycket smutsigt") return 1.35;
  return 1;
}

function accessMultiplier(input: EstimateInput) {
  let multiplier = 1;
  if (input.access === "Svår åtkomst") multiplier += 0.15;
  if (input.parking === "Nej") multiplier += 0.05;
  if (input.floor > 2 && input.elevator === "Nej") multiplier += 0.1;
  if (input.floor > 5 && input.elevator === "Nej") multiplier += 0.1;
  if (input.shortNotice === "Ja") multiplier += 0.12;
  if (input.weekend === "Ja") multiplier += 0.15;
  return multiplier;
}

function riskLevel(input: EstimateInput): RiskLevel {
  if (input.service === "Kontorsstädning" || input.condition === "Mycket smutsigt" || input.shortNotice === "Ja" || input.access === "Svår åtkomst") return "Röd";
  if (input.service === "Flyttstädning" && input.sqm > 180) return "Röd";
  if (input.floor > 4 && input.elevator === "Nej") return "Röd";
  if (input.service === "Fönsterputs" && input.windows > 25) return "Röd";
  if (input.condition === "Smutsigt" || input.weekend === "Ja" || input.parking === "Nej" || input.balconyGlass !== "Nej") return "Gul";
  if (input.service === "Flyttstädning" || input.windows > 15) return "Gul";
  return "Grön";
}

function riskText(risk: RiskLevel) {
  if (risk === "Röd") return "Röd · kräver manuell offertkontroll";
  if (risk === "Gul") return "Gul · kontrollera detaljer innan bekräftelse";
  return "Grön · bra underlag för prisindikation";
}

function estimatePrice(input: EstimateInput): Estimate {
  const selectedAddOns = input.service === "Fönsterputs" ? input.selectedAddOns.filter((item) => item !== "Fönsterputs") : input.selectedAddOns;
  const addOnsBeforeRut = selectedAddOns.reduce((sum, item) => sum + addOnBeforeRutPrice(item), 0);
  const rutFactor = input.useRut ? 0.5 : 1;
  const complexity = conditionMultiplier(input.condition);
  const access = accessMultiplier(input);
  const factors = [
    `Skick: ${input.condition}`,
    input.floor > 0 ? `Våning: ${input.floor}${input.elevator === "Ja" ? " med hiss" : " utan hiss"}` : "",
    input.parking === "Nej" ? "Parkering saknas" : "",
    input.shortNotice === "Ja" ? "Kort varsel" : "",
    input.weekend === "Ja" ? "Helg/kväll" : "",
    selectedAddOns.length ? `Tillval: ${selectedAddOns.join(", ")}` : ""
  ].filter(Boolean);

  if (input.service === "Hemstädning") {
    const petHours = input.pets === "Ja" ? 0.25 : 0;
    const hours = Math.max(2, input.sqm / 38 + Math.max(0, input.bathrooms - 1) * 0.35 + Math.max(0, input.rooms - 3) * 0.08 + petHours) * complexity;
    const hourlyBeforeRut = input.frequency === "Engång" ? 590 : 520;
    const subtotal = hours * hourlyBeforeRut * (1 - frequencyDiscount(input.frequency)) + addOnsBeforeRut;
    const beforeRut = Math.max(input.frequency === "Engång" ? 1180 : 1040, subtotal * access);
    return { title: "Uppskattat pris för hemstädning", beforeRut, afterRut: beforeRut * rutFactor, hours, addOnsBeforeRut, riskLevel: riskLevel(input), factors, note: "Prisindikation baserad på yta, badrum, rum, skick, åtkomst, frekvens och tillval. Slutligt pris bekräftas innan bokningen blir bindande." };
  }

  if (input.service === "Flyttstädning") {
    const perSqm = input.sqm <= 50 ? 52 : input.sqm <= 80 ? 48 : input.sqm <= 120 ? 45 : 42;
    const bathroomAddonBeforeRut = Math.max(0, input.bathrooms - 1) * 400;
    const furnishedFactor = input.furnished === "Möblerad" ? 1.2 : 1;
    const beforeRut = Math.max(2900, (input.sqm * perSqm + bathroomAddonBeforeRut + addOnsBeforeRut) * complexity * furnishedFactor * access);
    return { title: "Uppskattat pris för flyttstädning", beforeRut, afterRut: beforeRut * rutFactor, addOnsBeforeRut, riskLevel: riskLevel(input), factors: [...factors, input.furnished], note: "Flyttstädning påverkas starkt av skick, om bostaden är tömd, fönster, balkong och åtkomst. Större eller mycket smutsiga objekt bör alltid kontrolleras manuellt." };
  }

  if (input.service === "Storstädning") {
    const petHours = input.pets === "Ja" ? 0.35 : 0;
    const hours = Math.max(3, input.sqm / 27 + Math.max(0, input.bathrooms - 1) * 0.45 + petHours) * complexity;
    const beforeRut = Math.max(1770, (hours * 590 + addOnsBeforeRut) * access);
    return { title: "Uppskattat pris för storstädning", beforeRut, afterRut: beforeRut * rutFactor, hours, addOnsBeforeRut, riskLevel: riskLevel(input), factors, note: "Storstädning räknas med högre tidsåtgång än återkommande hemstädning eftersom bostadens skick påverkar mer." };
  }

  if (input.service === "Kontorsstädning") {
    const visitsPerMonth = Math.max(1, input.officeVisits) * 4.33;
    const kitchenHours = input.kitchen === "Ja" ? 0.25 : 0;
    const hoursPerVisit = Math.max(1.5, input.sqm / 60 + Math.max(0, input.officeToilets) * 0.2 + kitchenHours + (input.access === "Svår åtkomst" ? 0.15 : 0));
    const hourly = input.weekend === "Ja" ? 560 : 520;
    const monthly = Math.max(1500, hoursPerVisit * visitsPerMonth * hourly);
    return { title: "Prisindikation för kontorsstädning", beforeRut: monthly, afterRut: monthly, hours: hoursPerVisit, monthly: true, addOnsBeforeRut: 0, riskLevel: riskLevel(input), factors: [...factors, `${input.officeVisits} besök/vecka`, `${input.officeToilets} toaletter`, input.kitchen === "Ja" ? "Kök/pentry" : ""].filter(Boolean), note: "Kontorsstädning visas som månadsindikation exklusive RUT. Slutlig offert bör bekräftas efter access, larm, nyckelhantering och städomfattning." };
  }

  const sideFactor = input.windowSide === "Båda sidor" ? 1 : 0.65;
  const balconyExtra = input.balconyGlass === "Stor" ? 1200 : input.balconyGlass === "Liten" ? 700 : 0;
  const windowBase = input.windows * 85 * sideFactor + balconyExtra;
  const beforeRut = Math.max(1390, (windowBase + addOnsBeforeRut) * access);
  return { title: "Uppskattat pris för fönsterputs", beforeRut, afterRut: beforeRut * rutFactor, addOnsBeforeRut, riskLevel: riskLevel(input), factors: [...factors, `${input.windows} fönster`, input.windowSide, input.balconyGlass !== "Nej" ? `Inglasad balkong: ${input.balconyGlass}` : ""].filter(Boolean), note: "Fönsterputs beräknas främst på antal fönster, sida/sidor, balkongglas och åtkomst. Höga våningar eller svår åtkomst kräver manuell kontroll." };
}

export default function PriceCalculator() {
  const [service, setService] = useState<Service>("Hemstädning");
  const [customerType, setCustomerType] = useState<CustomerType>("Privatperson");
  const [sqm, setSqm] = useState("75");
  const [rooms, setRooms] = useState("3");
  const [bathrooms, setBathrooms] = useState("1");
  const [windows, setWindows] = useState("8");
  const [officeVisits, setOfficeVisits] = useState("1");
  const [officeToilets, setOfficeToilets] = useState("1");
  const [postalCode, setPostalCode] = useState("151 46");
  const [frequency, setFrequency] = useState<Frequency>("Engång");
  const [condition, setCondition] = useState<Condition>("Normal");
  const [furnished, setFurnished] = useState<Furnished>("Tom bostad");
  const [pets, setPets] = useState<YesNo>("Nej");
  const [floor, setFloor] = useState("0");
  const [elevator, setElevator] = useState<YesNo>("Ja");
  const [parking, setParking] = useState<YesNo>("Ja");
  const [access, setAccess] = useState<Access>("Normal");
  const [shortNotice, setShortNotice] = useState<YesNo>("Nej");
  const [weekend, setWeekend] = useState<YesNo>("Nej");
  const [windowSide, setWindowSide] = useState<WindowSide>("Båda sidor");
  const [balconyGlass, setBalconyGlass] = useState<BalconyGlass>("Nej");
  const [kitchen, setKitchen] = useState<YesNo>("Ja");
  const [rutRequested, setRutRequested] = useState(true);
  const [selectedAddOns, setSelectedAddOns] = useState<AddOn[]>([]);

  const rutEligible = customerType === "Privatperson" && serviceAllowsRut(service);
  const useRut = rutEligible && rutRequested;
  const result = useMemo(() => estimatePrice({ service, sqm: parseNumber(sqm, 75), frequency, bathrooms: parseNumber(bathrooms, 1), rooms: parseNumber(rooms, 3), windows: parseNumber(windows, 8), officeVisits: parseNumber(officeVisits, 1), officeToilets: parseNumber(officeToilets, 1), condition, furnished, pets, floor: parseNumber(floor, 0), elevator, parking, access, shortNotice, weekend, windowSide, balconyGlass, kitchen, selectedAddOns, useRut }), [service, sqm, frequency, bathrooms, rooms, windows, officeVisits, officeToilets, condition, furnished, pets, floor, elevator, parking, access, shortNotice, weekend, windowSide, balconyGlass, kitchen, selectedAddOns, useRut]);

  function setSelectedService(nextService: Service) {
    setService(nextService);
    if (!serviceAllowsRut(nextService)) {
      setCustomerType("Företag");
      setRutRequested(false);
    }
  }

  function setSelectedCustomerType(nextType: CustomerType) {
    setCustomerType(nextType);
    if (nextType === "Företag") setRutRequested(false);
    if (nextType === "Privatperson" && serviceAllowsRut(service)) setRutRequested(true);
  }

  function toggleAddOn(addOn: AddOn) {
    setSelectedAddOns((current) => current.includes(addOn) ? current.filter((item) => item !== addOn) : [...current, addOn]);
  }

  return (
    <section className="rounded-[2rem] border border-burgundy/10 bg-porcelain p-6 shadow-luxe md:p-8" id="pris-kalkylator">
      <div className="mb-7 flex items-center justify-between gap-4"><div><p className="text-xs font-black uppercase tracking-[.28em] text-burgundy">Kalkylator</p><h2 className="display mt-2 text-4xl font-bold text-burgundy">Beräkna pris</h2><p className="mt-2 text-sm leading-6 text-ink/65">Professionell prisindikation. Slutligt pris bekräftas alltid innan bokning.</p></div><div className="grid h-14 w-14 shrink-0 place-items-center rounded-full bg-burgundy text-porcelain"><Calculator /></div></div>
      <div className="grid gap-4">
        <SelectField label="Tjänst" value={service} options={services} onChange={(value) => setSelectedService(value as Service)} />
        <ButtonGroup label="Kundtyp" options={customerTypes} value={customerType} onChange={(value) => setSelectedCustomerType(value as CustomerType)} />
        <div className="grid gap-4 sm:grid-cols-3"><NumberField label="Storlek kvm" value={sqm} onChange={setSqm} /><NumberField label="Antal rum" value={rooms} onChange={setRooms} /><NumberField label="Antal badrum" value={bathrooms} onChange={setBathrooms} /></div>
        <div className="grid gap-4 sm:grid-cols-2"><SelectField label="Frekvens" value={frequency} options={frequencies} onChange={(value) => setFrequency(value as Frequency)} /><label className="block"><span className="mb-2 block text-sm font-bold">Postnummer</span><input value={postalCode} onChange={(event) => setPostalCode(event.target.value.slice(0, 12))} className="w-full rounded-2xl border border-burgundy/10 bg-cream px-4 py-4" placeholder="151 46" /></label></div>
        <div className="grid gap-4 sm:grid-cols-2"><SelectField label="Skick" value={condition} options={conditions} onChange={(value) => setCondition(value as Condition)} /><SelectField label="Bostad vid flytt" value={furnished} options={furnishedOptions} onChange={(value) => setFurnished(value as Furnished)} /></div>
        <div className="grid gap-4 sm:grid-cols-3"><SelectField label="Husdjur" value={pets} options={yesNoOptions} onChange={(value) => setPets(value as YesNo)} /><NumberField label="Våning" value={floor} onChange={setFloor} /><SelectField label="Hiss" value={elevator} options={yesNoOptions} onChange={(value) => setElevator(value as YesNo)} /></div>
        <div className="grid gap-4 sm:grid-cols-3"><SelectField label="Parkering" value={parking} options={yesNoOptions} onChange={(value) => setParking(value as YesNo)} /><SelectField label="Åtkomst" value={access} options={accessOptions} onChange={(value) => setAccess(value as Access)} /><SelectField label="Kort varsel" value={shortNotice} options={yesNoOptions} onChange={(value) => setShortNotice(value as YesNo)} /></div>
        <div className="grid gap-4 sm:grid-cols-3"><NumberField label="Antal fönster" value={windows} onChange={setWindows} /><SelectField label="Fönsterputs" value={windowSide} options={windowSideOptions} onChange={(value) => setWindowSide(value as WindowSide)} /><SelectField label="Inglasad balkong" value={balconyGlass} options={balconyGlassOptions} onChange={(value) => setBalconyGlass(value as BalconyGlass)} /></div>
        {service === "Kontorsstädning" && <div className="grid gap-4 sm:grid-cols-3"><NumberField label="Besök per vecka" value={officeVisits} onChange={setOfficeVisits} /><NumberField label="Antal toaletter" value={officeToilets} onChange={setOfficeToilets} /><SelectField label="Kök/pentry" value={kitchen} options={yesNoOptions} onChange={(value) => setKitchen(value as YesNo)} /></div>}
        <SelectField label="Helg/kväll" value={weekend} options={yesNoOptions} onChange={(value) => setWeekend(value as YesNo)} />
        <div><p className="mb-2 text-sm font-bold">Tillval</p><div className="grid gap-2 sm:grid-cols-2">{addOns.map((item) => <button type="button" key={item} onClick={() => toggleAddOn(item)} className={`rounded-2xl border px-4 py-3 text-left text-sm font-bold transition ${selectedAddOns.includes(item) ? "border-burgundy bg-burgundy text-porcelain" : "border-burgundy/10 bg-cream text-ink"}`}>{item}</button>)}</div></div>
        {rutEligible ? <label className="flex items-start gap-3 rounded-2xl bg-cream p-4 text-sm font-bold"><input type="checkbox" checked={rutRequested} onChange={(event) => setRutRequested(event.target.checked)} className="mt-1 h-5 w-5" /><span>Visa pris med RUT-avdrag<br /><span className="font-normal text-ink/65">Gäller endast om kunden uppfyller Skatteverkets villkor.</span></span></label> : <p className="rounded-2xl bg-cream p-4 text-sm font-bold text-ink/70">RUT visas inte för företag eller kontorsstädning. Priset visas som företagspris/offert.</p>}
      </div>
      <div className="mt-7 rounded-[2rem] bg-burgundy p-6 text-porcelain"><div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between"><p className="text-xs font-black uppercase tracking-[.28em] text-gold">{result.title}</p><span className="rounded-full border border-gold/35 px-3 py-1 text-xs font-black uppercase tracking-[.18em] text-gold">{riskText(result.riskLevel)}</span></div><div className="mt-4 grid gap-4 sm:grid-cols-2"><div><p className="text-sm text-porcelain/75">Före RUT / totalpris</p><p className="display mt-1 text-4xl font-bold">{formatSek(result.beforeRut)}</p></div><div><p className="text-sm text-porcelain/75">{result.monthly ? "Prisindikation" : useRut ? "Efter RUT / kundpris" : "Kundpris utan RUT"}</p><p className="display mt-1 text-4xl font-bold text-gold">{formatSek(result.afterRut)}{result.monthly ? "/mån" : ""}</p></div></div>{result.hours && <p className="mt-4 inline-flex rounded-full bg-porcelain/10 px-4 py-2 text-sm font-bold text-gold">Uppskattad tid: cirka {result.hours.toFixed(1).replace(".", ",")} timmar{result.monthly ? " per besök" : ""}</p>}<div className="mt-5 flex flex-wrap gap-2">{result.factors.map((factor) => <span key={factor} className="rounded-full bg-porcelain/10 px-3 py-1 text-xs font-bold text-porcelain/80">{factor}</span>)}</div><p className="mt-5 text-sm leading-7 text-porcelain/75">{result.note}</p><p className="mt-3 text-xs leading-6 text-porcelain/60">Kundtyp: {customerType}. RUT: {useRut ? "Ja" : "Nej"}. Tillval före RUT: {formatSek(result.addOnsBeforeRut)}. Postnummer: {postalCode || "ej angivet"}. Detta är en prisindikation, inte fast pris.</p><div className="mt-6 flex flex-col gap-3 sm:flex-row"><Link href="/#booking" className="inline-flex items-center justify-center rounded-full bg-gold px-5 py-3 text-sm font-black uppercase tracking-[.12em] text-ink">Boka städning <ArrowRight className="ml-2 h-4 w-4" /></Link><Link href="/#booking" className="inline-flex items-center justify-center rounded-full border border-gold/40 px-5 py-3 text-sm font-black uppercase tracking-[.12em] text-gold">Skicka förfrågan</Link></div></div>
      <div className="mt-5 grid gap-3 text-sm text-ink/70 md:grid-cols-3">{["RUT-avdrag visas bara för privatpersoner och tjänster där RUT normalt kan användas.", "Slutpris bekräftas innan bokningen blir bindande.", "Risknivån hjälper Iboren att avgöra om manuell offert behövs."].map((item) => <p key={item} className="flex gap-2 rounded-2xl bg-cream p-4"><CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-burgundy" /> {item}</p>)}</div>
    </section>
  );
}

function NumberField({ label, value, onChange }: { label: string; value: string; onChange: (value: string) => void }) {
  return <label className="block"><span className="mb-2 block text-sm font-bold">{label}</span><input inputMode="numeric" value={value} onChange={(event) => onChange(event.target.value.replace(/[^0-9]/g, ""))} className="w-full rounded-2xl border border-burgundy/10 bg-cream px-4 py-4" /></label>;
}

function SelectField({ label, value, options, onChange }: { label: string; value: string; options: string[]; onChange: (value: string) => void }) {
  return <label className="block"><span className="mb-2 block text-sm font-bold">{label}</span><select value={value} onChange={(event) => onChange(event.target.value)} className="w-full rounded-2xl border border-burgundy/10 bg-cream px-4 py-4">{options.map((item) => <option key={item} value={item}>{item}</option>)}</select></label>;
}

function ButtonGroup({ label, options, value, onChange }: { label: string; options: string[]; value: string; onChange: (value: string) => void }) {
  return <div><p className="mb-2 text-sm font-bold">{label}</p><div className="grid grid-cols-2 gap-2">{options.map((item) => <button type="button" key={item} onClick={() => onChange(item)} className={`rounded-2xl border px-4 py-3 text-sm font-bold transition ${value === item ? "border-burgundy bg-burgundy text-porcelain" : "border-burgundy/10 bg-cream text-ink"}`}>{item}</button>)}</div></div>;
}
