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
import {
  accessOptions,
  addOnOptions,
  balconyGlassOptions,
  conditionOptions,
  customerTypeOptions,
  frequencyOptions,
  furnishedOptions,
  optionLabel,
  serviceOptions,
  windowSideOptions,
  yesNoOptions,
  type BookingPricingLocale,
  type BookingPricingOption
} from "./lib/bookingPricingConfig";

function parseNumber(value: string, fallback: number) {
  const parsed = Number(value.replace(/[^0-9]/g, ""));
  return Number.isFinite(parsed) && parsed > 0 ? parsed : fallback;
}

function serviceAllowsRut(service: Service) {
  return service !== "Kontorsstädning";
}

function riskText(risk: RiskLevel, locale: BookingPricingLocale) {
  if (locale === "en") {
    if (risk === "Röd") return "Manual quote needed";
    if (risk === "Gul") return "Needs review";
    return "Good estimate basis";
  }
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

function replaceAllSafe(value: string, search: string, replacement: string) {
  return value.split(search).join(replacement);
}

function englishTitle(title: string) {
  const titles: Record<string, string> = {
    "Uppskattat pris för hemstädning": "Estimated price for home cleaning",
    "Uppskattat pris för flyttstädning": "Estimated price for move-out cleaning",
    "Uppskattat pris för storstädning": "Estimated price for deep cleaning",
    "Prisindikation för kontorsstädning": "Monthly estimate for office cleaning",
    "Uppskattat pris för fönsterputs": "Estimated price for window cleaning"
  };
  return titles[title] || title;
}

function englishNote(note: string) {
  if (note.includes("Prisindikation baserad") || note.includes("hemstädning")) return "Estimate based on size, bathrooms, rooms, condition, access, frequency and add-ons. Final price is confirmed before the request becomes binding.";
  if (note.includes("Flyttstädning")) return "Move-out cleaning is strongly affected by condition, whether the home is empty, windows, balcony and access. Larger or very dirty properties should always be reviewed manually.";
  if (note.includes("Storstädning")) return "Deep cleaning is calculated with higher time consumption than recurring home cleaning because the condition of the home affects the work more.";
  if (note.includes("Kontorsstädning")) return "Office cleaning is shown as a monthly estimate without RUT. Final quote should be confirmed after access, alarm, key handling and cleaning scope are reviewed.";
  if (note.includes("Fönsterputs")) return "Window cleaning is calculated mainly by number of windows, side/sides, balcony glass and access. High floors or difficult access require manual review.";
  return note;
}

function englishFactor(factor: string) {
  let value = factor;
  value = value.replace("Skick:", "Condition:");
  value = value.replace("Smutsigt", "Dirty");
  value = value.replace("Mycket smutsigt", "Very dirty");
  value = value.replace("Våning:", "Floor:");
  value = value.replace(" med hiss", " with elevator");
  value = value.replace(" utan hiss", " without elevator");
  value = value.replace("Parkering saknas", "No parking");
  value = value.replace("Kort varsel", "Short notice");
  value = value.replace("Helg/kväll", "Weekend/evening");
  value = value.replace("Tillval:", "Add-ons:");
  value = replaceAllSafe(value, "Fönsterputs", "Window cleaning");
  value = replaceAllSafe(value, "Ugn", "Oven");
  value = replaceAllSafe(value, "Kyl/frys", "Fridge/freezer");
  value = replaceAllSafe(value, "Balkong", "Balcony");
  value = replaceAllSafe(value, "Grovstädning", "Deep cleaning");
  value = replaceAllSafe(value, "Skåp/lådor", "Cabinets/drawers");
  value = replaceAllSafe(value, "Båda sidor", "Both sides");
  value = replaceAllSafe(value, "Endast insida", "Inside only");
  value = replaceAllSafe(value, "Endast utsida", "Outside only");
  value = replaceAllSafe(value, "Inglasad balkong: Stor", "Balcony glass: Large");
  value = replaceAllSafe(value, "Inglasad balkong: Liten", "Balcony glass: Small");
  value = replaceAllSafe(value, "fönster", "windows");
  return value;
}

const ui = {
  sv: {
    id: "pris-kalkylator",
    eyebrow: "Kalkylator",
    heading: "Beräkna pris",
    intro: "Professionell prisindikation. Slutligt pris bekräftas alltid innan bokning.",
    service: "Tjänst",
    customerType: "Kundtyp",
    size: "Storlek kvm",
    rooms: "Antal rum",
    bathrooms: "Antal badrum",
    frequency: "Frekvens",
    postalCode: "Postnummer",
    condition: "Skick",
    moveStatus: "Bostad vid flytt",
    pets: "Husdjur",
    floor: "Våning",
    elevator: "Hiss",
    parking: "Parkering",
    access: "Åtkomst",
    shortNotice: "Kort varsel",
    windows: "Antal fönster",
    windowSide: "Fönsterputs",
    balconyGlass: "Inglasad balkong",
    officeVisits: "Besök per vecka",
    officeToilets: "Antal toaletter",
    kitchen: "Kök/pentry",
    weekend: "Helg/kväll",
    addOns: "Tillval",
    showRut: "Visa pris med RUT-avdrag",
    rutHelp: "Gäller endast om kunden uppfyller Skatteverkets villkor.",
    noRut: "RUT visas inte för företag eller kontorsstädning. Priset visas som företagspris/offert.",
    beforeRut: "Före RUT / totalpris",
    monthly: "Prisindikation",
    afterRut: "Efter RUT / kundpris",
    noRutPrice: "Kundpris utan RUT",
    time: "Uppskattad tid: cirka",
    timeSuffix: "timmar",
    perVisit: "per besök",
    customerLine: "Kundtyp",
    rut: "RUT",
    addOnsBeforeRut: "Tillval före RUT",
    postalLine: "Postnummer",
    estimateNote: "Detta är en prisindikation, inte fast pris.",
    cta: "Starta bokning med denna prisindikation",
    ctaHref: "/#booking",
    bullets: [
      "RUT-avdrag visas bara för privatpersoner och tjänster där RUT normalt kan användas.",
      "Slutpris bekräftas innan bokningen blir bindande.",
      "Risknivån hjälper Iboren att avgöra om manuell offert behövs."
    ]
  },
  en: {
    id: "price-calculator",
    eyebrow: "Calculator",
    heading: "Get estimate",
    intro: "Detailed price estimate. Final price is always confirmed before booking.",
    service: "Service",
    customerType: "Customer type",
    size: "Size sqm",
    rooms: "Rooms",
    bathrooms: "Bathrooms",
    frequency: "Frequency",
    postalCode: "Postal code",
    condition: "Condition",
    moveStatus: "Move-out status",
    pets: "Pets",
    floor: "Floor",
    elevator: "Elevator",
    parking: "Parking",
    access: "Access",
    shortNotice: "Short notice",
    windows: "Number of windows",
    windowSide: "Window cleaning",
    balconyGlass: "Balcony glass",
    officeVisits: "Visits per week",
    officeToilets: "Number of toilets",
    kitchen: "Kitchen/pantry",
    weekend: "Weekend/evening",
    addOns: "Add-ons",
    showRut: "Show price with RUT deduction",
    rutHelp: "Only applies when the customer fulfils the RUT conditions.",
    noRut: "RUT is not shown for companies or office cleaning. The price is shown as a business price or quote.",
    beforeRut: "Before RUT / total price",
    monthly: "Monthly estimate",
    afterRut: "After RUT / customer price",
    noRutPrice: "Customer price without RUT",
    time: "Estimated time: about",
    timeSuffix: "hours",
    perVisit: "per visit",
    customerLine: "Customer type",
    rut: "RUT",
    addOnsBeforeRut: "Add-ons before RUT",
    postalLine: "Postal code",
    estimateNote: "This is an estimate, not a fixed price.",
    cta: "Continue to request with this estimate",
    ctaHref: "/en#booking",
    bullets: [
      "RUT deduction is shown only for private customers and eligible services.",
      "Final price is confirmed before the request becomes binding.",
      "Risk level helps Iboren decide if a manual quote is needed."
    ]
  }
} as const;

export default function PriceCalculator({ locale = "sv" }: { locale?: BookingPricingLocale }) {
  const t = ui[locale];
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
  const visibleAddOns = service === "Fönsterputs" ? addOnOptions.filter((item) => item.value !== "Fönsterputs") : addOnOptions;
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

  const title = locale === "en" ? englishTitle(result.title) : result.title;
  const note = locale === "en" ? englishNote(result.note) : result.note;
  const factors = locale === "en" ? result.factors.map(englishFactor) : result.factors;
  const customerTypeLabel = optionLabel(customerTypeOptions.find((item) => item.value === customerType) || customerTypeOptions[0], locale);
  const hoursValue = result.hours ? locale === "en" ? result.hours.toFixed(1) : result.hours.toFixed(1).replace(".", ",") : "";

  return (
    <section className="rounded-[2rem] border border-burgundy/10 bg-porcelain p-6 shadow-luxe md:p-8" id={t.id}>
      <div className="mb-7 flex items-center justify-between gap-4"><div><p className="text-xs font-black uppercase tracking-[.28em] text-burgundy">{t.eyebrow}</p><h2 className="display mt-2 text-4xl font-bold text-burgundy">{t.heading}</h2><p className="mt-2 text-sm leading-6 text-ink/65">{t.intro}</p></div><div className="grid h-14 w-14 shrink-0 place-items-center rounded-full bg-burgundy text-porcelain"><Calculator /></div></div>
      <div className="grid gap-4">
        <OptionSelect label={t.service} value={service} options={serviceOptions} locale={locale} onChange={(value) => setSelectedService(value as Service)} />
        <OptionButtons label={t.customerType} options={customerTypeOptions} value={customerType} locale={locale} onChange={(value) => setSelectedCustomerType(value as CustomerType)} />
        <div className="grid gap-4 sm:grid-cols-3"><NumberField label={t.size} value={sqm} onChange={setSqm} />{!showOfficeFields && <NumberField label={t.rooms} value={rooms} onChange={setRooms} />}{!showOfficeFields && <NumberField label={t.bathrooms} value={bathrooms} onChange={setBathrooms} />}</div>
        <div className="grid gap-4 sm:grid-cols-2">{!showOfficeFields && <OptionSelect label={t.frequency} value={frequency} options={frequencyOptions} locale={locale} onChange={(value) => setFrequency(value as Frequency)} />}<label className="block"><span className="mb-2 block text-sm font-bold">{t.postalCode}</span><input value={postalCode} onChange={(event) => setPostalCode(event.target.value.slice(0, 12))} className="w-full rounded-2xl border border-burgundy/10 bg-cream px-4 py-4" placeholder="151 46" /></label></div>
        <div className="grid gap-4 sm:grid-cols-2"><OptionSelect label={t.condition} value={condition} options={conditionOptions} locale={locale} onChange={(value) => setCondition(value as Condition)} />{showMoveFields && <OptionSelect label={t.moveStatus} value={furnished} options={furnishedOptions} locale={locale} onChange={(value) => setFurnished(value as Furnished)} />}</div>
        {!showOfficeFields && <div className="grid gap-4 sm:grid-cols-3"><OptionSelect label={t.pets} value={pets} options={yesNoOptions} locale={locale} onChange={(value) => setPets(value as YesNo)} /><NumberField label={t.floor} value={floor} onChange={setFloor} /><OptionSelect label={t.elevator} value={elevator} options={yesNoOptions} locale={locale} onChange={(value) => setElevator(value as YesNo)} /></div>}
        <div className="grid gap-4 sm:grid-cols-3"><OptionSelect label={t.parking} value={parking} options={yesNoOptions} locale={locale} onChange={(value) => setParking(value as YesNo)} /><OptionSelect label={t.access} value={access} options={accessOptions} locale={locale} onChange={(value) => setAccess(value as Access)} /><OptionSelect label={t.shortNotice} value={shortNotice} options={yesNoOptions} locale={locale} onChange={(value) => setShortNotice(value as YesNo)} /></div>
        {showWindowFields && <div className="grid gap-4 sm:grid-cols-3"><NumberField label={t.windows} value={windows} onChange={setWindows} /><OptionSelect label={t.windowSide} value={windowSide} options={windowSideOptions} locale={locale} onChange={(value) => setWindowSide(value as WindowSide)} /><OptionSelect label={t.balconyGlass} value={balconyGlass} options={balconyGlassOptions} locale={locale} onChange={(value) => setBalconyGlass(value as BalconyGlass)} /></div>}
        {showOfficeFields && <div className="grid gap-4 sm:grid-cols-3"><NumberField label={t.officeVisits} value={officeVisits} onChange={setOfficeVisits} /><NumberField label={t.officeToilets} value={officeToilets} onChange={setOfficeToilets} /><OptionSelect label={t.kitchen} value={kitchen} options={yesNoOptions} locale={locale} onChange={(value) => setKitchen(value as YesNo)} /></div>}
        <OptionSelect label={t.weekend} value={weekend} options={yesNoOptions} locale={locale} onChange={(value) => setWeekend(value as YesNo)} />
        {showAddOns && <div><p className="mb-2 text-sm font-bold">{t.addOns}</p><div className="grid gap-2 sm:grid-cols-2">{visibleAddOns.map((item) => <button type="button" key={item.value} onClick={() => toggleAddOn(item.value)} className={`rounded-2xl border px-4 py-3 text-left text-sm font-bold transition ${selectedAddOns.includes(item.value) ? "border-burgundy bg-burgundy text-porcelain" : "border-burgundy/10 bg-cream text-ink"}`}>{optionLabel(item, locale)}</button>)}</div></div>}
        {rutEligible ? <label className="flex items-start gap-3 rounded-2xl bg-cream p-4 text-sm font-bold"><input type="checkbox" checked={rutRequested} onChange={(event) => setRutRequested(event.target.checked)} className="mt-1 h-5 w-5" /><span>{t.showRut}<br /><span className="font-normal text-ink/65">{t.rutHelp}</span></span></label> : <p className="rounded-2xl bg-cream p-4 text-sm font-bold text-ink/70">{t.noRut}</p>}
      </div>
      <div className="mt-7 rounded-[2rem] bg-burgundy p-6 text-porcelain"><div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between"><p className="text-xs font-black uppercase tracking-[.28em] text-gold">{title}</p><span className={riskBadgeClass(result.riskLevel)}>{riskText(result.riskLevel, locale)}</span></div><div className="mt-4 grid gap-4 sm:grid-cols-2"><div><p className="text-sm text-porcelain/75">{t.beforeRut}</p><p className="display mt-1 text-4xl font-bold">{formatSek(result.beforeRut)}</p></div><div><p className="text-sm text-porcelain/75">{result.monthly ? t.monthly : useRut ? t.afterRut : t.noRutPrice}</p><p className="display mt-1 text-4xl font-bold text-gold">{formatSek(result.afterRut)}{result.monthly ? locale === "en" ? "/month" : "/mån" : ""}</p></div></div>{result.hours && <p className="mt-4 inline-flex rounded-full bg-porcelain/10 px-4 py-2 text-sm font-bold text-gold">{t.time} {hoursValue} {t.timeSuffix}{result.monthly ? ` ${t.perVisit}` : ""}</p>}<div className="mt-5 flex flex-wrap gap-2">{factors.map((factor) => <span key={factor} className="rounded-full bg-porcelain/10 px-3 py-1 text-xs font-bold text-porcelain/80">{factor}</span>)}</div><p className="mt-5 text-sm leading-7 text-porcelain/75">{note}</p><p className="mt-3 text-xs leading-6 text-porcelain/60">{t.customerLine}: {customerTypeLabel}. {t.rut}: {useRut ? locale === "en" ? "Yes" : "Ja" : locale === "en" ? "No" : "Nej"}. {t.addOnsBeforeRut}: {formatSek(result.addOnsBeforeRut)}. {t.postalLine}: {postalCode || (locale === "en" ? "not entered" : "ej angivet")}. {t.estimateNote}</p><div className="mt-6"><Link href={t.ctaHref} className="inline-flex w-full items-center justify-center rounded-full bg-gold px-5 py-3 text-center text-sm font-black uppercase tracking-[.12em] text-ink sm:w-auto">{t.cta} <ArrowRight className="ml-2 h-4 w-4" /></Link></div></div>
      <div className="mt-5 grid gap-3 text-sm text-ink/70 md:grid-cols-3">{t.bullets.map((item) => <p key={item} className="flex gap-2 rounded-2xl bg-cream p-4"><CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-burgundy" /> {item}</p>)}</div>
    </section>
  );
}

function NumberField({ label, value, onChange }: { label: string; value: string; onChange: (value: string) => void }) {
  return <label className="block"><span className="mb-2 block text-sm font-bold">{label}</span><input inputMode="numeric" value={value} onChange={(event) => onChange(event.target.value.replace(/[^0-9]/g, ""))} className="w-full rounded-2xl border border-burgundy/10 bg-cream px-4 py-4" /></label>;
}

function OptionSelect<T extends string>({ label, value, options, locale, onChange }: { label: string; value: T; options: BookingPricingOption<T>[]; locale: BookingPricingLocale; onChange: (value: T) => void }) {
  return <label className="block"><span className="mb-2 block text-sm font-bold">{label}</span><select value={value} onChange={(event) => onChange(event.target.value as T)} className="w-full rounded-2xl border border-burgundy/10 bg-cream px-4 py-4">{options.map((item) => <option key={item.value} value={item.value}>{optionLabel(item, locale)}</option>)}</select></label>;
}

function OptionButtons<T extends string>({ label, options, value, locale, onChange }: { label: string; options: BookingPricingOption<T>[]; value: T; locale: BookingPricingLocale; onChange: (value: T) => void }) {
  return <div><p className="mb-2 text-sm font-bold">{label}</p><div className="grid grid-cols-2 gap-2">{options.map((item) => <button type="button" key={item.value} onClick={() => onChange(item.value)} className={`rounded-2xl border px-4 py-3 text-sm font-bold transition ${value === item.value ? "border-burgundy bg-burgundy text-porcelain" : "border-burgundy/10 bg-cream text-ink"}`}>{optionLabel(item, locale)}</button>)}</div></div>;
}
