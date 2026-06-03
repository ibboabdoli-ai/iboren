"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { ArrowRight, Calculator, CheckCircle2 } from "lucide-react";
import {
  estimatePrice,
  formatSek,
  type PricingAccess as Access,
  type PricingAddOn as AddOn,
  type PricingBalconyGlass as BalconyGlass,
  type PricingCondition as Condition,
  type PricingCustomerType as CustomerType,
  type PricingFrequency as Frequency,
  type PricingFurnished as Furnished,
  type PricingRiskLevel as RiskLevel,
  type PricingService as Service,
  type PricingWindowSide as WindowSide,
  type PricingYesNo as YesNo
} from "./lib/pricingCalculator";

const services: Service[] = ["Hemstädning", "Flyttstädning", "Storstädning", "Kontorsstädning", "Fönsterputs"];
const frequencies: Frequency[] = ["Engång", "Varje vecka", "Varannan vecka", "Var fjärde vecka"];
const addOns: AddOn[] = ["Fönsterputs", "Ugn", "Kyl/frys", "Balkong", "Grovstädning", "Skåp/lådor", "Garage"];
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

function serviceAllowsRut(service: Service) {
  return service !== "Kontorsstädning";
}

function riskText(risk: RiskLevel) {
  if (risk === "Röd") return "Manuell offert behövs";
  if (risk === "Gul") return "Behöver kontrolleras";
  return "Bra prisunderlag";
}

function riskBadgeClass(risk: RiskLevel) {
  const base = "rounded-full border px-3 py-1 text-xs font-black uppercase tracking-[.18em]";
  if (risk === "Röd") return `${base} border-red-300/45 bg-red-400/20 text-red-100`;
  if (risk === "Gul") return `${base} border-amber-300/45 bg-amber-400/20 text-amber-100`;
  return `${base} border-emerald-300/45 bg-emerald-400/20 text-emerald-100`;
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
  const showOfficeFields = service === "Kontorsstädning";
  const showMoveFields = service === "Flyttstädning";
  const showWindowFields = service === "Fönsterputs" || selectedAddOns.includes("Fönsterputs");
  const showAddOns = !showOfficeFields;
  const visibleAddOns = service === "Fönsterputs" ? addOns.filter((item) => item !== "Fönsterputs") : addOns;
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
        <div className="grid gap-4 sm:grid-cols-3"><NumberField label="Storlek kvm" value={sqm} onChange={setSqm} />{!showOfficeFields && <NumberField label="Antal rum" value={rooms} onChange={setRooms} />}{!showOfficeFields && <NumberField label="Antal badrum" value={bathrooms} onChange={setBathrooms} />}</div>
        <div className="grid gap-4 sm:grid-cols-2">{!showOfficeFields && <SelectField label="Frekvens" value={frequency} options={frequencies} onChange={(value) => setFrequency(value as Frequency)} />}<label className="block"><span className="mb-2 block text-sm font-bold">Postnummer</span><input value={postalCode} onChange={(event) => setPostalCode(event.target.value.slice(0, 12))} className="w-full rounded-2xl border border-burgundy/10 bg-cream px-4 py-4" placeholder="151 46" /></label></div>
        <div className="grid gap-4 sm:grid-cols-2"><SelectField label="Skick" value={condition} options={conditions} onChange={(value) => setCondition(value as Condition)} />{showMoveFields && <SelectField label="Bostad vid flytt" value={furnished} options={furnishedOptions} onChange={(value) => setFurnished(value as Furnished)} />}</div>
        {!showOfficeFields && <div className="grid gap-4 sm:grid-cols-3"><SelectField label="Husdjur" value={pets} options={yesNoOptions} onChange={(value) => setPets(value as YesNo)} /><NumberField label="Våning" value={floor} onChange={setFloor} /><SelectField label="Hiss" value={elevator} options={yesNoOptions} onChange={(value) => setElevator(value as YesNo)} /></div>}
        <div className="grid gap-4 sm:grid-cols-3"><SelectField label="Parkering" value={parking} options={yesNoOptions} onChange={(value) => setParking(value as YesNo)} /><SelectField label="Åtkomst" value={access} options={accessOptions} onChange={(value) => setAccess(value as Access)} /><SelectField label="Kort varsel" value={shortNotice} options={yesNoOptions} onChange={(value) => setShortNotice(value as YesNo)} /></div>
        {showWindowFields && <div className="grid gap-4 sm:grid-cols-3"><NumberField label="Antal fönster" value={windows} onChange={setWindows} /><SelectField label="Fönsterputs" value={windowSide} options={windowSideOptions} onChange={(value) => setWindowSide(value as WindowSide)} /><SelectField label="Inglasad balkong" value={balconyGlass} options={balconyGlassOptions} onChange={(value) => setBalconyGlass(value as BalconyGlass)} /></div>}
        {showOfficeFields && <div className="grid gap-4 sm:grid-cols-3"><NumberField label="Besök per vecka" value={officeVisits} onChange={setOfficeVisits} /><NumberField label="Antal toaletter" value={officeToilets} onChange={setOfficeToilets} /><SelectField label="Kök/pentry" value={kitchen} options={yesNoOptions} onChange={(value) => setKitchen(value as YesNo)} /></div>}
        <SelectField label="Helg/kväll" value={weekend} options={yesNoOptions} onChange={(value) => setWeekend(value as YesNo)} />
        {showAddOns && <div><p className="mb-2 text-sm font-bold">Tillval</p><div className="grid gap-2 sm:grid-cols-2">{visibleAddOns.map((item) => <button type="button" key={item} onClick={() => toggleAddOn(item)} className={`rounded-2xl border px-4 py-3 text-left text-sm font-bold transition ${selectedAddOns.includes(item) ? "border-burgundy bg-burgundy text-porcelain" : "border-burgundy/10 bg-cream text-ink"}`}>{item}</button>)}</div></div>}
        {rutEligible ? <label className="flex items-start gap-3 rounded-2xl bg-cream p-4 text-sm font-bold"><input type="checkbox" checked={rutRequested} onChange={(event) => setRutRequested(event.target.checked)} className="mt-1 h-5 w-5" /><span>Visa pris med RUT-avdrag<br /><span className="font-normal text-ink/65">Gäller endast om kunden uppfyller Skatteverkets villkor.</span></span></label> : <p className="rounded-2xl bg-cream p-4 text-sm font-bold text-ink/70">RUT visas inte för företag eller kontorsstädning. Priset visas som företagspris/offert.</p>}
      </div>
      <div className="mt-7 rounded-[2rem] bg-burgundy p-6 text-porcelain"><div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between"><p className="text-xs font-black uppercase tracking-[.28em] text-gold">{result.title}</p><span className={riskBadgeClass(result.riskLevel)}>{riskText(result.riskLevel)}</span></div><div className="mt-4 grid gap-4 sm:grid-cols-2"><div><p className="text-sm text-porcelain/75">Före RUT / totalpris</p><p className="display mt-1 text-4xl font-bold">{formatSek(result.beforeRut)}</p></div><div><p className="text-sm text-porcelain/75">{result.monthly ? "Prisindikation" : useRut ? "Efter RUT / kundpris" : "Kundpris utan RUT"}</p><p className="display mt-1 text-4xl font-bold text-gold">{formatSek(result.afterRut)}{result.monthly ? "/mån" : ""}</p></div></div>{result.hours && <p className="mt-4 inline-flex rounded-full bg-porcelain/10 px-4 py-2 text-sm font-bold text-gold">Uppskattad tid: cirka {result.hours.toFixed(1).replace(".", ",")} timmar{result.monthly ? " per besök" : ""}</p>}<div className="mt-5 flex flex-wrap gap-2">{result.factors.map((factor) => <span key={factor} className="rounded-full bg-porcelain/10 px-3 py-1 text-xs font-bold text-porcelain/80">{factor}</span>)}</div><p className="mt-5 text-sm leading-7 text-porcelain/75">{result.note}</p><p className="mt-3 text-xs leading-6 text-porcelain/60">Kundtyp: {customerType}. RUT: {useRut ? "Ja" : "Nej"}. Tillval före RUT: {formatSek(result.addOnsBeforeRut)}. Postnummer: {postalCode || "ej angivet"}. Detta är en prisindikation, inte fast pris.</p><div className="mt-6"><Link href="/#booking" className="inline-flex w-full items-center justify-center rounded-full bg-gold px-5 py-3 text-center text-sm font-black uppercase tracking-[.12em] text-ink sm:w-auto">Starta bokning med denna prisindikation <ArrowRight className="ml-2 h-4 w-4" /></Link></div></div>
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
