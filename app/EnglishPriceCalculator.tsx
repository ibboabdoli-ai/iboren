"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { ArrowRight, Calculator, CheckCircle2 } from "lucide-react";

type Service = "Home cleaning" | "Move-out cleaning" | "Deep cleaning" | "Office cleaning" | "Window cleaning";
type Frequency = "One-time" | "Every week" | "Every other week" | "Every fourth week";
type AddOn = "Window cleaning" | "Oven cleaning" | "Fridge/freezer" | "Balcony" | "Extra dirty";
type CustomerType = "Private customer" | "Company";
type Condition = "Normal" | "Dirty" | "Very dirty";
type YesNo = "Yes" | "No";
type Furnished = "Empty home" | "Furnished";
type Access = "Normal" | "Difficult access";
type WindowSide = "Both sides" | "Inside only" | "Outside only";
type BalconyGlass = "No" | "Small" | "Large";
type RiskLevel = "Green" | "Yellow" | "Red";

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

const services: Service[] = ["Home cleaning", "Move-out cleaning", "Deep cleaning", "Office cleaning", "Window cleaning"];
const frequencies: Frequency[] = ["One-time", "Every week", "Every other week", "Every fourth week"];
const addOns: AddOn[] = ["Window cleaning", "Oven cleaning", "Fridge/freezer", "Balcony", "Extra dirty"];
const customerTypes: CustomerType[] = ["Private customer", "Company"];
const conditions: Condition[] = ["Normal", "Dirty", "Very dirty"];
const yesNoOptions: YesNo[] = ["Yes", "No"];
const furnishedOptions: Furnished[] = ["Empty home", "Furnished"];
const accessOptions: Access[] = ["Normal", "Difficult access"];
const windowSideOptions: WindowSide[] = ["Both sides", "Inside only", "Outside only"];
const balconyGlassOptions: BalconyGlass[] = ["No", "Small", "Large"];

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
  if (addOn === "Balcony") return 450;
  if (addOn === "Extra dirty") return 650;
  return 0;
}

function conditionMultiplier(condition: Condition) {
  if (condition === "Dirty") return 1.15;
  if (condition === "Very dirty") return 1.35;
  return 1;
}

function accessMultiplier(input: EstimateInput) {
  let multiplier = 1;
  if (input.access === "Difficult access") multiplier += 0.15;
  if (input.parking === "No") multiplier += 0.05;
  if (input.floor > 2 && input.elevator === "No") multiplier += 0.1;
  if (input.floor > 5 && input.elevator === "No") multiplier += 0.1;
  if (input.shortNotice === "Yes") multiplier += 0.12;
  if (input.weekend === "Yes") multiplier += 0.15;
  return multiplier;
}

function riskLevel(input: EstimateInput): RiskLevel {
  if (input.service === "Office cleaning" || input.condition === "Very dirty" || input.shortNotice === "Yes" || input.access === "Difficult access") return "Red";
  if (input.service === "Move-out cleaning" && input.sqm > 180) return "Red";
  if (input.floor > 4 && input.elevator === "No") return "Red";
  if (input.service === "Window cleaning" && input.windows > 25) return "Red";
  if (input.condition === "Dirty" || input.weekend === "Yes" || input.parking === "No" || input.balconyGlass !== "No") return "Yellow";
  if (input.service === "Move-out cleaning" || input.windows > 15) return "Yellow";
  return "Green";
}

function riskText(risk: RiskLevel) {
  if (risk === "Red") return "Red · manual quote review needed";
  if (risk === "Yellow") return "Yellow · check details before confirmation";
  return "Green · good basis for price indication";
}

function estimatePrice(input: EstimateInput): Estimate {
  const selectedAddOns = input.service === "Window cleaning" ? input.selectedAddOns.filter((item) => item !== "Window cleaning") : input.selectedAddOns;
  const addOnsBeforeRut = selectedAddOns.reduce((sum, item) => sum + addOnBeforeRutPrice(item), 0);
  const rutFactor = input.useRut ? 0.5 : 1;
  const complexity = conditionMultiplier(input.condition);
  const access = accessMultiplier(input);
  const factors = [
    `Condition: ${input.condition}`,
    input.floor > 0 ? `Floor: ${input.floor}${input.elevator === "Yes" ? " with elevator" : " without elevator"}` : "",
    input.parking === "No" ? "No parking" : "",
    input.shortNotice === "Yes" ? "Short notice" : "",
    input.weekend === "Yes" ? "Weekend/evening" : "",
    selectedAddOns.length ? `Add-ons: ${selectedAddOns.join(", ")}` : ""
  ].filter(Boolean);

  if (input.service === "Home cleaning") {
    const petHours = input.pets === "Yes" ? 0.25 : 0;
    const hours = Math.max(2, input.sqm / 38 + Math.max(0, input.bathrooms - 1) * 0.35 + Math.max(0, input.rooms - 3) * 0.08 + petHours) * complexity;
    const hourlyBeforeRut = input.frequency === "One-time" ? 590 : 520;
    const subtotal = hours * hourlyBeforeRut * (1 - frequencyDiscount(input.frequency)) + addOnsBeforeRut;
    const beforeRut = Math.max(input.frequency === "One-time" ? 1180 : 1040, subtotal * access);
    return { title: "Estimated price for home cleaning", beforeRut, afterRut: beforeRut * rutFactor, hours, addOnsBeforeRut, riskLevel: riskLevel(input), factors, note: "Price indication based on size, bathrooms, rooms, condition, access, frequency and add-ons. Final price is confirmed before the booking becomes binding." };
  }

  if (input.service === "Move-out cleaning") {
    const perSqm = input.sqm <= 50 ? 52 : input.sqm <= 80 ? 48 : input.sqm <= 120 ? 45 : 42;
    const bathroomAddonBeforeRut = Math.max(0, input.bathrooms - 1) * 400;
    const furnishedFactor = input.furnished === "Furnished" ? 1.2 : 1;
    const beforeRut = Math.max(2900, (input.sqm * perSqm + bathroomAddonBeforeRut + addOnsBeforeRut) * complexity * furnishedFactor * access);
    return { title: "Estimated price for move-out cleaning", beforeRut, afterRut: beforeRut * rutFactor, addOnsBeforeRut, riskLevel: riskLevel(input), factors: [...factors, input.furnished], note: "Move-out cleaning is strongly affected by condition, whether the home is empty, windows, balcony and access. Larger or very dirty properties should always be reviewed manually." };
  }

  if (input.service === "Deep cleaning") {
    const petHours = input.pets === "Yes" ? 0.35 : 0;
    const hours = Math.max(3, input.sqm / 27 + Math.max(0, input.bathrooms - 1) * 0.45 + petHours) * complexity;
    const beforeRut = Math.max(1770, (hours * 590 + addOnsBeforeRut) * access);
    return { title: "Estimated price for deep cleaning", beforeRut, afterRut: beforeRut * rutFactor, hours, addOnsBeforeRut, riskLevel: riskLevel(input), factors, note: "Deep cleaning is calculated with higher time consumption than recurring home cleaning because the condition of the home affects the work more." };
  }

  if (input.service === "Office cleaning") {
    const visitsPerMonth = Math.max(1, input.officeVisits) * 4.33;
    const kitchenHours = input.kitchen === "Yes" ? 0.25 : 0;
    const hoursPerVisit = Math.max(1.5, input.sqm / 60 + Math.max(0, input.officeToilets) * 0.2 + kitchenHours + (input.access === "Difficult access" ? 0.15 : 0));
    const hourly = input.weekend === "Yes" ? 560 : 520;
    const monthly = Math.max(1500, hoursPerVisit * visitsPerMonth * hourly);
    return { title: "Price indication for office cleaning", beforeRut: monthly, afterRut: monthly, hours: hoursPerVisit, monthly: true, addOnsBeforeRut: 0, riskLevel: riskLevel(input), factors: [...factors, `${input.officeVisits} visits/week`, `${input.officeToilets} toilets`, input.kitchen === "Yes" ? "Kitchen/pantry" : ""].filter(Boolean), note: "Office cleaning is shown as a monthly indication without RUT. Final quote should be confirmed after access, alarm, key handling and cleaning scope are reviewed." };
  }

  const sideFactor = input.windowSide === "Both sides" ? 1 : 0.65;
  const balconyExtra = input.balconyGlass === "Large" ? 1200 : input.balconyGlass === "Small" ? 700 : 0;
  const windowBase = input.windows * 85 * sideFactor + balconyExtra;
  const beforeRut = Math.max(1390, (windowBase + addOnsBeforeRut) * access);
  return { title: "Estimated price for window cleaning", beforeRut, afterRut: beforeRut * rutFactor, addOnsBeforeRut, riskLevel: riskLevel(input), factors: [...factors, `${input.windows} windows`, input.windowSide, input.balconyGlass !== "No" ? `Balcony glass: ${input.balconyGlass}` : ""].filter(Boolean), note: "Window cleaning is calculated mainly by number of windows, side/sides, balcony glass and access. High floors or difficult access require manual review." };
}

export default function EnglishPriceCalculator() {
  const [service, setService] = useState<Service>("Home cleaning");
  const [customerType, setCustomerType] = useState<CustomerType>("Private customer");
  const [sqm, setSqm] = useState("75");
  const [rooms, setRooms] = useState("3");
  const [bathrooms, setBathrooms] = useState("1");
  const [windows, setWindows] = useState("8");
  const [officeVisits, setOfficeVisits] = useState("1");
  const [officeToilets, setOfficeToilets] = useState("1");
  const [postalCode, setPostalCode] = useState("151 46");
  const [frequency, setFrequency] = useState<Frequency>("One-time");
  const [condition, setCondition] = useState<Condition>("Normal");
  const [furnished, setFurnished] = useState<Furnished>("Empty home");
  const [pets, setPets] = useState<YesNo>("No");
  const [floor, setFloor] = useState("0");
  const [elevator, setElevator] = useState<YesNo>("Yes");
  const [parking, setParking] = useState<YesNo>("Yes");
  const [access, setAccess] = useState<Access>("Normal");
  const [shortNotice, setShortNotice] = useState<YesNo>("No");
  const [weekend, setWeekend] = useState<YesNo>("No");
  const [windowSide, setWindowSide] = useState<WindowSide>("Both sides");
  const [balconyGlass, setBalconyGlass] = useState<BalconyGlass>("No");
  const [kitchen, setKitchen] = useState<YesNo>("Yes");
  const [rutRequested, setRutRequested] = useState(true);
  const [selectedAddOns, setSelectedAddOns] = useState<AddOn[]>([]);

  const rutEligible = customerType === "Private customer" && serviceAllowsRut(service);
  const useRut = rutEligible && rutRequested;
  const result = useMemo(() => estimatePrice({ service, sqm: parseNumber(sqm, 75), frequency, bathrooms: parseNumber(bathrooms, 1), rooms: parseNumber(rooms, 3), windows: parseNumber(windows, 8), officeVisits: parseNumber(officeVisits, 1), officeToilets: parseNumber(officeToilets, 1), condition, furnished, pets, floor: parseNumber(floor, 0), elevator, parking, access, shortNotice, weekend, windowSide, balconyGlass, kitchen, selectedAddOns, useRut }), [service, sqm, frequency, bathrooms, rooms, windows, officeVisits, officeToilets, condition, furnished, pets, floor, elevator, parking, access, shortNotice, weekend, windowSide, balconyGlass, kitchen, selectedAddOns, useRut]);

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
      <div className="mb-7 flex items-center justify-between gap-4"><div><p className="text-xs font-black uppercase tracking-[.28em] text-burgundy">Calculator</p><h2 className="display mt-2 text-4xl font-bold text-burgundy">Calculate price</h2><p className="mt-2 text-sm leading-6 text-ink/65">Professional price indication. Final price is always confirmed before booking.</p></div><div className="grid h-14 w-14 shrink-0 place-items-center rounded-full bg-burgundy text-porcelain"><Calculator /></div></div>
      <div className="grid gap-4">
        <SelectField label="Service" value={service} options={services} onChange={(value) => setSelectedService(value as Service)} />
        <ButtonGroup label="Customer type" options={customerTypes} value={customerType} onChange={(value) => setSelectedCustomerType(value as CustomerType)} />
        <div className="grid gap-4 sm:grid-cols-3"><NumberField label="Size sqm" value={sqm} onChange={setSqm} /><NumberField label="Rooms" value={rooms} onChange={setRooms} /><NumberField label="Bathrooms" value={bathrooms} onChange={setBathrooms} /></div>
        <div className="grid gap-4 sm:grid-cols-2"><SelectField label="Frequency" value={frequency} options={frequencies} onChange={(value) => setFrequency(value as Frequency)} /><label className="block"><span className="mb-2 block text-sm font-bold">Postal code</span><input value={postalCode} onChange={(event) => setPostalCode(event.target.value.slice(0, 12))} className="w-full rounded-2xl border border-burgundy/10 bg-cream px-4 py-4" placeholder="151 46" /></label></div>
        <div className="grid gap-4 sm:grid-cols-2"><SelectField label="Condition" value={condition} options={conditions} onChange={(value) => setCondition(value as Condition)} /><SelectField label="Move-out status" value={furnished} options={furnishedOptions} onChange={(value) => setFurnished(value as Furnished)} /></div>
        <div className="grid gap-4 sm:grid-cols-3"><SelectField label="Pets" value={pets} options={yesNoOptions} onChange={(value) => setPets(value as YesNo)} /><NumberField label="Floor" value={floor} onChange={setFloor} /><SelectField label="Elevator" value={elevator} options={yesNoOptions} onChange={(value) => setElevator(value as YesNo)} /></div>
        <div className="grid gap-4 sm:grid-cols-3"><SelectField label="Parking" value={parking} options={yesNoOptions} onChange={(value) => setParking(value as YesNo)} /><SelectField label="Access" value={access} options={accessOptions} onChange={(value) => setAccess(value as Access)} /><SelectField label="Short notice" value={shortNotice} options={yesNoOptions} onChange={(value) => setShortNotice(value as YesNo)} /></div>
        <div className="grid gap-4 sm:grid-cols-3"><NumberField label="Number of windows" value={windows} onChange={setWindows} /><SelectField label="Window cleaning" value={windowSide} options={windowSideOptions} onChange={(value) => setWindowSide(value as WindowSide)} /><SelectField label="Balcony glass" value={balconyGlass} options={balconyGlassOptions} onChange={(value) => setBalconyGlass(value as BalconyGlass)} /></div>
        {service === "Office cleaning" && <div className="grid gap-4 sm:grid-cols-3"><NumberField label="Visits per week" value={officeVisits} onChange={setOfficeVisits} /><NumberField label="Number of toilets" value={officeToilets} onChange={setOfficeToilets} /><SelectField label="Kitchen/pantry" value={kitchen} options={yesNoOptions} onChange={(value) => setKitchen(value as YesNo)} /></div>}
        <SelectField label="Weekend/evening" value={weekend} options={yesNoOptions} onChange={(value) => setWeekend(value as YesNo)} />
        <div><p className="mb-2 text-sm font-bold">Add-ons</p><div className="grid gap-2 sm:grid-cols-2">{addOns.map((item) => <button type="button" key={item} onClick={() => toggleAddOn(item)} className={`rounded-2xl border px-4 py-3 text-left text-sm font-bold transition ${selectedAddOns.includes(item) ? "border-burgundy bg-burgundy text-porcelain" : "border-burgundy/10 bg-cream text-ink"}`}>{item}</button>)}</div></div>
        {rutEligible ? <label className="flex items-start gap-3 rounded-2xl bg-cream p-4 text-sm font-bold"><input type="checkbox" checked={rutRequested} onChange={(event) => setRutRequested(event.target.checked)} className="mt-1 h-5 w-5" /><span>Show price with RUT deduction<br /><span className="font-normal text-ink/65">Only applies when the customer fulfils Skatteverket's conditions.</span></span></label> : <p className="rounded-2xl bg-cream p-4 text-sm font-bold text-ink/70">RUT is not shown for companies or office cleaning. The price is shown as a business price or quote.</p>}
      </div>
      <div className="mt-7 rounded-[2rem] bg-burgundy p-6 text-porcelain"><div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between"><p className="text-xs font-black uppercase tracking-[.28em] text-gold">{result.title}</p><span className="rounded-full border border-gold/35 px-3 py-1 text-xs font-black uppercase tracking-[.18em] text-gold">{riskText(result.riskLevel)}</span></div><div className="mt-4 grid gap-4 sm:grid-cols-2"><div><p className="text-sm text-porcelain/75">Before RUT / total price</p><p className="display mt-1 text-4xl font-bold">{formatSek(result.beforeRut)}</p></div><div><p className="text-sm text-porcelain/75">{result.monthly ? "Price indication" : useRut ? "After RUT / customer price" : "Customer price without RUT"}</p><p className="display mt-1 text-4xl font-bold text-gold">{formatSek(result.afterRut)}{result.monthly ? "/month" : ""}</p></div></div>{result.hours && <p className="mt-4 inline-flex rounded-full bg-porcelain/10 px-4 py-2 text-sm font-bold text-gold">Estimated time: about {result.hours.toFixed(1)} hours{result.monthly ? " per visit" : ""}</p>}<div className="mt-5 flex flex-wrap gap-2">{result.factors.map((factor) => <span key={factor} className="rounded-full bg-porcelain/10 px-3 py-1 text-xs font-bold text-porcelain/80">{factor}</span>)}</div><p className="mt-5 text-sm leading-7 text-porcelain/75">{result.note}</p><p className="mt-3 text-xs leading-6 text-porcelain/60">Customer type: {customerType}. RUT: {useRut ? "Yes" : "No"}. Add-ons before RUT: {formatSek(result.addOnsBeforeRut)}. Postal code: {postalCode || "not entered"}. This is a price indication, not a fixed price.</p><div className="mt-6 flex flex-col gap-3 sm:flex-row"><Link href="/en#booking" className="inline-flex items-center justify-center rounded-full bg-gold px-5 py-3 text-sm font-black uppercase tracking-[.12em] text-ink">Book cleaning <ArrowRight className="ml-2 h-4 w-4" /></Link><Link href="/en#booking" className="inline-flex items-center justify-center rounded-full border border-gold/40 px-5 py-3 text-sm font-black uppercase tracking-[.12em] text-gold">Send request</Link></div></div>
      <div className="mt-5 grid gap-3 text-sm text-ink/70 md:grid-cols-3">{["RUT deduction is shown only for private customers and services where RUT normally can be used.", "Final price is confirmed before the request becomes binding.", "Risk level helps Iboren decide if a manual quote is needed."].map((item) => <p key={item} className="flex gap-2 rounded-2xl bg-cream p-4"><CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-burgundy" /> {item}</p>)}</div>
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
