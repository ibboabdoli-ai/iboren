"use client";

import { FormEvent, useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { LocateFixed } from "lucide-react";
import { createClient } from "@supabase/supabase-js";
import { formatSek } from "./lib/pricingCalculator";
import {
  applyBookingServiceSideEffects,
  bookingFormVisibility,
  buildBookingSummary,
  createBookingFormDraft,
  formatBookingHours,
  type BookingFormDraft,
  type BookingFormLanguage
} from "./lib/bookingFormModel";

type Lang = BookingFormLanguage;
type Draft = BookingFormDraft;

export type UnifiedBookingFormCoreProps = {
  language: BookingFormLanguage;
  variant?: "page" | "embedded";
};

const authHeaderName = ["Author", "ization"].join("");
const tokenPrefix = ["Bear", "er"].join("");

const copy = {
  sv: {
    title: "Skapa en tydlig bokningsförfrågan.",
    loggedInTitle: "Skapa en tydlig bokningsförfrågan.",
    kicker: "Bokningsförfrågan",
    intro: "Formuläret samlar rätt information direkt: tjänst, plats, storlek, rum, datum, kontakt och särskilda önskemål.",
    loggedInIntro: "Din förfrågan sparas även på din profil och skickas till Iboren.",
    binding: "Vi bekräftar alltid tid och pris innan förfrågan blir bindande.",
    login: "Har du redan konto?",
    loginLink: "Logga in och använd din profil",
    loggedInAs: "Inloggad som",
    profileLink: "Gå till min profil",
    review: "Din förfrågan granskas manuellt innan den blir en bokning.",
    loggedInReview: "Din förfrågan sparas på din profil. Iboren bekräftar alltid tid och pris innan förfrågan blir bindande.",
    langLabel: "EN",
    langHref: "/en/boka-utan-konto",
    section: "Steg 1 / Förfrågan",
    submit: "Skicka förfrågan",
    submitLoggedIn: "Skicka bokningsförfrågan",
    sending: "Skickar...",
    success: "Tack! Din förfrågan har skickats. Vi bekräftar alltid tid och pris innan bokningen blir bindande.",
    formTitle: "Bokningsdetaljer",
    draftBadge: "Utkast",
    objectDetails: "Objekt & detaljer",
    service: "Tjänst",
    customerType: "Kundtyp",
    rut: "RUT-avdrag",
    area: "Område / stad",
    postalCode: "Postnummer",
    address: "Adress",
    size: "Storlek kvm",
    propertyType: "Typ av objekt",
    rooms: "Antal rum",
    bathrooms: "Antal badrum",
    pets: "Husdjur",
    floor: "Våning",
    elevator: "Hiss",
    parking: "Parkering",
    condition: "Skick",
    access: "Åtkomst",
    shortNotice: "Kort varsel",
    weekend: "Helg/kväll",
    extras: "Extra tjänster",
    windows: "Antal fönster",
    windowSide: "Fönsterputs",
    balconyGlass: "Inglasad balkong",
    date: "Önskat datum",
    time: "Tid",
    frequency: "Frekvens",
    name: "Namn",
    email: "E-post",
    phone: "Telefon",
    message: "Meddelande",
    summary: "Sammanfattning",
    estimate: "Prisindikation",
    beforeRut: "Före RUT",
    afterRut: "Efter RUT",
    timeEstimate: "Uppskattad tid",
    moms: "Alla priser visas inklusive moms för privatpersoner.",
    companyMoms: "Priser för företag visas inklusive moms. RUT gäller inte företag.",
    priceNote: "Samma prislogik som huvudkalkylatorn används. Slutligt pris bekräftas efter förfrågan.",
    searchAddress: "Sök adress",
    searchAddressHint: "Skriv eller välj adress i adressfältet.",
    importedEstimate: "Din prisindikation har fyllts i. Komplettera adress, datum och kontaktuppgifter innan du skickar.",
    yes: "Ja",
    no: "Nej",
    unknown: "Vet ej",
    placeholders: { area: "Södertälje", postalCode: "", address: "Gatuadress och nummer", size: "75", rooms: "4", bathrooms: "1", floor: "0", windows: "8", name: "För- och efternamn", email: "namn@email.se", phone: "+46 ...", notes: "Särskilda önskemål..." }
  },
  en: {
    title: "Create a clear booking request.",
    loggedInTitle: "Create a clear booking request.",
    kicker: "Booking request",
    intro: "The form collects the right information directly: service, location, size, rooms, date, contact and special requests.",
    loggedInIntro: "Your request is also saved to your profile and sent to Iboren.",
    binding: "We always confirm time and price before the request becomes binding.",
    login: "Already have an account?",
    loginLink: "Log in and use your profile",
    loggedInAs: "Logged in as",
    profileLink: "Go to my profile",
    review: "Your request is reviewed manually before it becomes a booking.",
    loggedInReview: "Your request is saved to your profile. Iboren always confirms time and price before the request becomes binding.",
    langLabel: "SV",
    langHref: "/boka-utan-konto",
    section: "Step 1 / Request",
    submit: "Send request",
    submitLoggedIn: "Send booking request",
    sending: "Sending...",
    success: "Thank you. Your request has been sent. We always confirm time and price before the booking becomes binding.",
    formTitle: "Request details",
    draftBadge: "Draft",
    objectDetails: "Property & details",
    service: "Service",
    customerType: "Customer type",
    rut: "RUT deduction",
    area: "Area / city",
    postalCode: "Postal code",
    address: "Address",
    size: "Size sqm",
    propertyType: "Property type",
    rooms: "Rooms",
    bathrooms: "Bathrooms",
    pets: "Pets",
    floor: "Floor",
    elevator: "Elevator",
    parking: "Parking",
    condition: "Condition",
    access: "Access",
    shortNotice: "Short notice",
    weekend: "Weekend/evening",
    extras: "Extra services",
    windows: "Number of windows",
    windowSide: "Window cleaning",
    balconyGlass: "Balcony glass",
    date: "Preferred date",
    time: "Time window",
    frequency: "Frequency",
    name: "Name",
    email: "Email",
    phone: "Phone",
    message: "Message",
    summary: "Summary",
    estimate: "Price indication",
    beforeRut: "Before RUT",
    afterRut: "After RUT",
    timeEstimate: "Estimated time",
    moms: "Prices are shown including VAT for private customers.",
    companyMoms: "Prices for companies are shown including VAT. RUT does not apply to companies.",
    priceNote: "The same price logic as the main calculator is used. Final price is confirmed after the request.",
    searchAddress: "Search address",
    searchAddressHint: "Type or choose the address in the address field.",
    importedEstimate: "Your estimate details have been added. Complete the address, date and contact details before sending.",
    yes: "Yes",
    no: "No",
    unknown: "Not sure",
    placeholders: { area: "Södertälje", postalCode: "", address: "Street address and number", size: "75", rooms: "4", bathrooms: "1", floor: "0", windows: "8", name: "First and last name", email: "name@email.se", phone: "+46 ...", notes: "Special requests..." }
  }
};

const options = {
  sv: {
    services: ["Hemstädning", "Flyttstädning", "Storstädning", "Kontorsstädning", "Fönsterputs"],
    types: ["Lägenhet", "Villa", "Radhus", "Kontor", "Annat"],
    freqs: ["Engång", "Varje vecka", "Varannan vecka", "Varje månad"],
    times: ["Morgon", "Förmiddag", "Eftermiddag", "Kväll", "Flexibel"],
    extras: ["Fönsterputs", "Ugn", "Kyl/frys", "Balkong", "Grovstädning", "Skåp/lådor", "Garage"],
    customerTypes: ["Privatperson", "Företag"],
    conditions: ["Normal", "Smutsigt", "Mycket smutsigt"],
    access: ["Normal", "Svår åtkomst"],
    windowSides: ["Båda sidor", "Endast insida", "Endast utsida"],
    balconyGlass: ["Nej", "Liten", "Stor"]
  },
  en: {
    services: ["Home cleaning", "Move-out cleaning", "Deep cleaning", "Office cleaning", "Window cleaning"],
    types: ["Apartment", "House", "Townhouse", "Office", "Other"],
    freqs: ["One-time", "Every week", "Every other week", "Every month"],
    times: ["Morning", "Late morning", "Afternoon", "Evening", "Flexible"],
    extras: ["Window cleaning", "Oven", "Fridge/freezer", "Balcony", "Deep cleaning", "Cabinets/drawers", "Garage"],
    customerTypes: ["Private customer", "Company"],
    conditions: ["Normal", "Dirty", "Very dirty"],
    access: ["Normal", "Difficult access"],
    windowSides: ["Both sides", "Inside only", "Outside only"],
    balconyGlass: ["No", "Small", "Large"]
  }
};

function base(lang: Lang): Draft {
  return { ...createBookingFormDraft(lang), postalCode: "" };
}

function getSupabase() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  return url && key ? createClient(url, key, { auth: { persistSession: true, autoRefreshToken: true, detectSessionInUrl: true } }) : null;
}

function normalizeAreaValue(value: string) {
  const cleaned = value.trim().toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-z]/g, "");
  if (cleaned === "sodertalje" || cleaned === "sodertalie") return "Södertälje";
  if (cleaned === "stockholm") return "Stockholm";
  return value;
}

function extractPostalCodeFromAddress(value: string) {
  const match = value.match(/\b(\d{3})\s?(\d{2})\b/);
  return match ? `${match[1]} ${match[2]}` : "";
}

function extractAreaFromAddress(value: string) {
  const cleaned = value.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
  if (cleaned.includes("sodertalje")) return "Södertälje";
  if (cleaned.includes("stockholm")) return "Stockholm";
  return "";
}

function translateEstimateValue(value: string, language: Lang) {
  if (language === "sv") return value;
  const map: Record<string, string> = {
    Hemstädning: "Home cleaning",
    Flyttstädning: "Move-out cleaning",
    Storstädning: "Deep cleaning",
    Kontorsstädning: "Office cleaning",
    Fönsterputs: "Window cleaning",
    Privatperson: "Private customer",
    Företag: "Company",
    Engång: "One-time",
    "Varje vecka": "Every week",
    "Varannan vecka": "Every other week",
    "Varje månad": "Every month",
    Ja: "Yes",
    Nej: "No",
    Smutsigt: "Dirty",
    "Mycket smutsigt": "Very dirty",
    "Svår åtkomst": "Difficult access",
    "Båda sidor": "Both sides",
    "Endast insida": "Inside only",
    "Endast utsida": "Outside only",
    Liten: "Small",
    Stor: "Large",
    Ugn: "Oven",
    "Kyl/frys": "Fridge/freezer",
    Balkong: "Balcony",
    Grovstädning: "Deep cleaning",
    "Skåp/lådor": "Cabinets/drawers"
  };
  return map[value] || value;
}

function splitEstimateExtras(value: string, language: Lang) {
  return value.split("|").map((item) => translateEstimateValue(item.trim(), language)).filter(Boolean);
}

function applyEstimateQueryToDraft(current: Draft, language: Lang): Draft {
  if (typeof window === "undefined") return current;
  const params = new URLSearchParams(window.location.search);
  if (params.get("estimate") !== "1") return current;

  const value = (key: string) => params.get(key)?.trim() || "";
  let next: Draft = { ...current };

  const service = translateEstimateValue(value("service"), language);
  const customerType = translateEstimateValue(value("customerType"), language);
  const frequency = translateEstimateValue(value("frequency"), language);

  if (service) next.service = service;
  if (customerType) next.customerType = customerType;
  if (frequency) next.frequency = frequency;
  if (value("postalCode")) next.postalCode = value("postalCode");
  if (value("size")) next.size = value("size").replace(/[^0-9]/g, "");
  if (value("rooms")) next.rooms = value("rooms").replace(/[^0-9]/g, "");
  if (value("bathrooms")) next.bathrooms = value("bathrooms").replace(/[^0-9]/g, "");
  if (value("windows")) next.windows = value("windows").replace(/[^0-9]/g, "");
  if (value("floor")) next.floor = value("floor").replace(/[^0-9]/g, "");
  if (value("condition")) next.condition = translateEstimateValue(value("condition"), language);
  if (value("pets")) next.pets = translateEstimateValue(value("pets"), language);
  if (value("elevator")) next.elevator = translateEstimateValue(value("elevator"), language);
  if (value("parking")) next.parking = translateEstimateValue(value("parking"), language);
  if (value("access")) next.access = translateEstimateValue(value("access"), language);
  if (value("shortNotice")) next.shortNotice = translateEstimateValue(value("shortNotice"), language);
  if (value("weekend")) next.weekend = translateEstimateValue(value("weekend"), language);
  if (value("windowSide")) next.windowSide = translateEstimateValue(value("windowSide"), language);
  if (value("balconyGlass")) next.balconyGlass = translateEstimateValue(value("balconyGlass"), language);
  if (value("extras")) next.extras = splitEstimateExtras(value("extras"), language);
  if (value("rut")) next.rutRequested = ["Ja", "Yes", "true", "1"].includes(translateEstimateValue(value("rut"), language));

  next = applyBookingServiceSideEffects(next, language);
  if (next.customerType === "Företag" || next.customerType === "Company") next.rutRequested = false;
  return next;
}

function Field({ id, label, value, onChange, placeholder, type = "text", required = false }: { id?: string; label: string; value: string; onChange: (value: string) => void; placeholder?: string; type?: string; required?: boolean }) {
  const inputRef = useRef<HTMLInputElement | null>(null);

  function openDatePicker() {
    if (type !== "date") return;
    try {
      inputRef.current?.showPicker?.();
    } catch {
      // Native picker availability and activation rules vary by browser.
    }
  }

  return <label className="block"><span className="mb-2 block text-sm font-black text-porcelain/75">{label}{required ? " *" : ""}</span><input ref={inputRef} id={id} required={required} type={type} value={value} onChange={(e) => onChange(e.target.value)} onClick={openDatePicker} onKeyDown={(event) => { if (type === "date" && (event.key === "Enter" || event.key === " ")) { event.preventDefault(); openDatePicker(); } }} placeholder={placeholder} className="w-full rounded-2xl border border-white/10 bg-[#181917] px-4 py-4 text-base font-bold text-porcelain outline-none placeholder:text-porcelain/35 transition focus:border-gold focus:ring-2 focus:ring-gold/25" /></label>;
}

function Select({ label, value, options: selectOptions, onChange }: { label: string; value: string; options: string[]; onChange: (value: string) => void }) {
  return <label className="block"><span className="mb-2 block text-sm font-black text-porcelain/75">{label}</span><select value={value} onChange={(e) => onChange(e.target.value)} className="w-full rounded-2xl border border-white/10 bg-[#181917] px-4 py-4 text-base font-bold text-porcelain outline-none transition focus:border-gold focus:ring-2 focus:ring-gold/25">{selectOptions.map((option) => <option key={option} value={option}>{option}</option>)}</select></label>;
}

export default function UnifiedBookingFormCore({ language, variant = "page" }: UnifiedBookingFormCoreProps) {
  const t = copy[language];
  const o = options[language];
  const [checking, setChecking] = useState(true);
  const [estimateApplied, setEstimateApplied] = useState(false);
  const [authToken, setAuthToken] = useState("");
  const [accountEmail, setAccountEmail] = useState("");
  const [draft, setDraft] = useState<Draft>(() => base(language));
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [message, setMessage] = useState("");
  const isLoggedIn = Boolean(authToken);
  const visibility = useMemo(() => bookingFormVisibility(draft), [draft]);
  const summaryResult = useMemo(() => buildBookingSummary(draft, language), [draft, language]);
  const estimate = summaryResult.estimate;
  const summary = summaryResult.text;
  const timeEstimate = formatBookingHours(estimate.hours, language, estimate.monthly);

  useEffect(() => {
    const supabase = getSupabase();
    if (!supabase) {
      setChecking(false);
      return;
    }
    supabase.auth.getSession().then(({ data }) => {
      const session = data.session;
      const email = session?.user?.email || "";
      const fullName = String(session?.user?.user_metadata?.full_name || session?.user?.user_metadata?.name || "");
      if (session?.access_token) {
        setAuthToken(session.access_token);
        setAccountEmail(email);
        setDraft((current) => ({ ...current, name: current.name || fullName, email: email || current.email, postalCode: current.postalCode || "" }));
      } else {
        setAuthToken("");
        setAccountEmail("");
      }
      setChecking(false);
    });
  }, [language]);

  useEffect(() => {
    if (checking || estimateApplied || typeof window === "undefined") return;
    const params = new URLSearchParams(window.location.search);
    if (params.get("estimate") !== "1") {
      setEstimateApplied(true);
      return;
    }
    setDraft((current) => applyEstimateQueryToDraft(current, language));
    setStatus("idle");
    setMessage(t.importedEstimate);
    setEstimateApplied(true);
  }, [checking, estimateApplied, language, t.importedEstimate]);

  function setField<K extends keyof Draft>(key: K, value: Draft[K]) {
    setDraft((current) => {
      let next: Draft = { ...current, [key]: value };
      if (key === "area") next.area = normalizeAreaValue(String(value));
      if (key === "address") {
        const address = String(value);
        const postalCode = extractPostalCodeFromAddress(address);
        const area = extractAreaFromAddress(address);
        if (postalCode) next.postalCode = postalCode;
        if (area) next.area = area;
      }
      if (key === "service") next = applyBookingServiceSideEffects(next, language);
      if (key === "customerType" && (next.customerType === "Företag" || next.customerType === "Company")) next.rutRequested = false;
      return next;
    });
  }

  function toggleExtra(item: string) {
    setDraft((current) => ({ ...current, extras: current.extras.includes(item) ? current.extras.filter((extra) => extra !== item) : [...current.extras, item] }));
  }

  async function useCurrentLocationAddress() {
    const addressField = document.getElementById("booking-address");
    if (!navigator.geolocation) {
      addressField?.focus();
      setStatus("idle");
      setMessage(t.searchAddressHint);
      return;
    }

    setStatus("idle");
    setMessage(language === "sv" ? "Hämtar din position..." : "Getting your location...");

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        try {
          const lat = position.coords.latitude;
          const lon = position.coords.longitude;
          const res = await fetch(`/api/reverse-geocode?lat=${encodeURIComponent(lat)}&lon=${encodeURIComponent(lon)}`);
          const json = await res.json().catch(() => null) as { ok?: boolean; address?: string; area?: string } | null;
          if (res.ok && json?.address) {
            setField("address", json.address as Draft["address"]);
            if (json.area) setField("area", json.area as Draft["area"]);
            setStatus("idle");
            setMessage(language === "sv" ? "Adressen har fyllts i från din position." : "The address has been filled from your location.");
            return;
          }
          setStatus("error");
          setMessage(language === "sv" ? "Kunde inte hämta adressen. Skriv adressen manuellt." : "Could not get the address. Please enter it manually.");
          addressField?.focus();
        } catch {
          setStatus("error");
          setMessage(language === "sv" ? "Kunde inte hämta adressen. Skriv adressen manuellt." : "Could not get the address. Please enter it manually.");
          addressField?.focus();
        }
      },
      () => {
        setStatus("error");
        setMessage(language === "sv" ? "Kunde inte hämta adressen. Skriv adressen manuellt." : "Could not get the address. Please enter it manually.");
        addressField?.focus();
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 30000 }
    );
  }

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setStatus("loading");
    setMessage(t.sending);
    try {
      const canonicalArea = normalizeAreaValue(draft.area);
      const endpoint = isLoggedIn ? "/api/bookings" : "/api/public-booking-request";
      const headers: Record<string, string> = { "Content-Type": "application/json" };
      if (isLoggedIn) headers[authHeaderName] = `${tokenPrefix} ${authToken}`;
      const response = await fetch(endpoint, {
        method: "POST",
        headers,
        body: JSON.stringify({ service: draft.service, area: canonicalArea, address: draft.address, size: draft.size, frequency: draft.frequency, date: draft.date, timeWindow: draft.timeWindow, name: draft.name, email: isLoggedIn ? accountEmail || draft.email : draft.email, phone: draft.phone, notes: summary, customerType: draft.customerType, rutRequested: draft.rutRequested, language, website: draft.website })
      });
      const json = await response.json().catch(() => null) as { ok?: boolean; message?: string } | null;
      if (!response.ok || !json?.ok) throw new Error(json?.message || "Error");
      setStatus("success");
      setMessage(json.message || t.success);
      setDraft((current) => ({ ...base(language), name: isLoggedIn ? current.name : "", email: isLoggedIn ? accountEmail : "" }));
    } catch (error) {
      setStatus("error");
      setMessage(error instanceof Error ? error.message : "Error");
    }
  }

  const formAndSummary = (
        <section className={variant === "embedded" ? "grid w-full min-w-0 gap-5" : "grid gap-5 xl:grid-cols-[1fr_.75fr]"}>
          <form onSubmit={submit} className="w-full min-w-0 rounded-[2rem] border border-white/10 bg-[#252420] p-5 shadow-luxe md:p-7">
            <input value={draft.website} onChange={(event) => setField("website", event.target.value)} name="website" tabIndex={-1} autoComplete="off" aria-hidden="true" className="hidden" />
            <div className="mb-7 flex items-start justify-between gap-4"><div><p className="text-xs font-black uppercase tracking-[.32em] text-gold">{t.section}</p><h2 className="display mt-2 text-3xl font-normal uppercase text-gold md:text-4xl">{t.formTitle}</h2></div><span className="rounded-full border border-gold/30 px-4 py-2 text-xs font-black uppercase tracking-[.18em] text-gold">{t.draftBadge}</span></div>
            <div className="grid gap-5">
              <Select label={t.service} value={draft.service} options={o.services} onChange={(value) => setField("service", value)} />
              <div className="grid gap-4 sm:grid-cols-2"><Select label={t.customerType} value={draft.customerType} options={o.customerTypes} onChange={(value) => setField("customerType", value)}/><Select label={t.rut} value={draft.rutRequested ? t.yes : t.no} options={[t.yes, t.no]} onChange={(value) => setField("rutRequested", value === t.yes)} /></div>
              <div className="grid gap-4 sm:grid-cols-3"><Field required label={t.area} value={draft.area} onChange={(value) => setField("area", value)} placeholder={t.placeholders.area} /><Field label={t.postalCode} value={draft.postalCode} onChange={(value) => setField("postalCode", value.slice(0, 12))} placeholder={t.placeholders.postalCode} /><Field required label={t.size} value={draft.size} onChange={(value) => setField("size", value.replace(/[^0-9]/g, ""))} placeholder={t.placeholders.size} /></div>
              <div className="grid grid-cols-[minmax(0,1fr)_4.5rem] items-end gap-3"><Field id="booking-address" required label={t.address} value={draft.address} onChange={(value) => setField("address", value)} placeholder={t.placeholders.address} /><button type="button" onClick={useCurrentLocationAddress} aria-label={t.searchAddress} title={t.searchAddress} className="grid h-[58px] place-items-center rounded-2xl border border-gold/35 bg-transparent text-gold transition hover:bg-gold hover:text-ink"><LocateFixed className="h-5 w-5" /></button></div>
              <div className="rounded-[1.75rem] border border-gold/15 bg-[#181917] p-5"><p className="mb-5 text-xs font-black uppercase tracking-[.32em] text-gold">{t.objectDetails}</p><div className="grid gap-4"><div className="grid gap-4 sm:grid-cols-2"><Select label={t.propertyType} value={draft.propertyType} options={o.types} onChange={(value) => setField("propertyType", value)} /><Field label={t.rooms} value={draft.rooms} onChange={(value) => setField("rooms", value.replace(/[^0-9]/g, ""))} placeholder={t.placeholders.rooms} /></div>
              <div className="grid gap-4 sm:grid-cols-2"><Field label={t.bathrooms} value={draft.bathrooms} onChange={(value) => setField("bathrooms", value.replace(/[^0-9]/g, ""))} placeholder={t.placeholders.bathrooms} /><Select label={t.pets} value={draft.pets} options={[t.yes, t.no, t.unknown]} onChange={(value) => setField("pets", value)} /></div>
              <div className="grid gap-4 sm:grid-cols-3"><Field label={t.floor} value={draft.floor} onChange={(value) => setField("floor", value.replace(/[^0-9]/g, ""))} placeholder={t.placeholders.floor} /><Select label={t.elevator} value={draft.elevator} options={[t.yes, t.no, t.unknown]} onChange={(value) => setField("elevator", value)} /><Select label={t.parking} value={draft.parking} options={[t.yes, t.no, t.unknown]} onChange={(value) => setField("parking", value)} /></div>
              <div className="grid gap-4 sm:grid-cols-2"><Select label={t.condition} value={draft.condition} options={o.conditions} onChange={(value) => setField("condition", value)} /><Select label={t.access} value={draft.access} options={o.access} onChange={(value) => setField("access", value)} /></div>
              <div className="grid gap-4 sm:grid-cols-2"><Select label={t.shortNotice} value={draft.shortNotice} options={[t.yes, t.no]} onChange={(value) => setField("shortNotice", value)} /><Select label={t.weekend} value={draft.weekend} options={[t.yes, t.no]} onChange={(value) => setField("weekend", value)} /></div></div></div>
              {visibility.showAddOns && <div><p className="mb-2 text-sm font-black text-porcelain/75">{t.extras}</p><div className="grid grid-cols-2 gap-2 md:grid-cols-3">{o.extras.map((extra) => <button type="button" key={extra} onClick={() => toggleExtra(extra)} className={`rounded-2xl border px-3 py-3 text-sm font-black transition ${draft.extras.includes(extra) ? "border-gold bg-gold text-ink" : "border-white/10 bg-transparent text-porcelain/75 hover:border-gold/50"}`}>{extra}</button>)}</div></div>}
              {visibility.showWindowFields && <div className="grid gap-4 sm:grid-cols-2"><Field label={t.windows} value={draft.windows} onChange={(value) => setField("windows", value.replace(/[^0-9]/g, ""))} placeholder={t.placeholders.windows} /><Select label={t.windowSide} value={draft.windowSide} options={o.windowSides} onChange={(value) => setField("windowSide", value)} /></div>}
              {visibility.showBalconyFields && <Select label={t.balconyGlass} value={draft.balconyGlass} options={o.balconyGlass} onChange={(value) => setField("balconyGlass", value)} />}
              <div className="grid gap-4 sm:grid-cols-2"><Field required type="date" label={t.date} value={draft.date} onChange={(value) => setField("date", value)} /><Select label={t.time} value={draft.timeWindow} options={o.times} onChange={(value) => setField("timeWindow", value)} /></div>
              <Select label={t.frequency} value={draft.frequency} options={o.freqs} onChange={(value) => setField("frequency", value)} />
              <div className="grid gap-4 sm:grid-cols-2"><Field required label={t.name} value={draft.name} onChange={(value) => setField("name", value)} placeholder={t.placeholders.name} /><Field required type="email" label={t.email} value={isLoggedIn ? accountEmail || draft.email : draft.email} onChange={(value) => setField("email", value)} placeholder={t.placeholders.email} /></div>
              <Field required type="tel" label={t.phone} value={draft.phone} onChange={(value) => setField("phone", value)} placeholder={t.placeholders.phone} />
              <label className="block"><span className="mb-2 block text-sm font-black text-porcelain/75">{t.message}</span><textarea value={draft.notes} onChange={(event) => setField("notes", event.target.value)} className="min-h-28 w-full rounded-2xl border border-white/10 bg-[#181917] px-4 py-4 text-porcelain outline-none placeholder:text-porcelain/35 transition focus:border-gold focus:ring-2 focus:ring-gold/25" placeholder={t.placeholders.notes} /></label>
              <button disabled={status === "loading"} className="btn-primary w-full justify-center bg-gold text-ink hover:bg-porcelain disabled:cursor-not-allowed disabled:opacity-60">{status === "loading" ? t.sending : isLoggedIn ? t.submitLoggedIn : t.submit}</button>
              {message && <p className={`rounded-2xl px-4 py-3 text-sm ${status === "success" ? "bg-green-100 text-green-800" : status === "error" ? "bg-red-100 text-red-800" : "bg-gold/10 text-gold"}`}>{message}</p>}
            </div>
          </form>
          <aside className={variant === "embedded" ? "w-full min-w-0 rounded-[2rem] border border-white/10 bg-[#252420] p-5 shadow-luxe md:p-7" : "w-full min-w-0 rounded-[2rem] border border-white/10 bg-[#252420] p-5 shadow-luxe md:p-7 xl:sticky xl:top-6 xl:self-start"}>
            <p className="text-xs font-black uppercase tracking-[.32em] text-gold">{t.summary}</p>
            <h2 className="display mt-2 text-3xl font-normal uppercase text-gold">{t.estimate}</h2>
            <div className="mt-5 grid gap-3 rounded-[1.5rem] border border-gold/15 bg-[#181917] p-5 text-sm text-porcelain/80"><p><b>{t.beforeRut}:</b> {formatSek(estimate.beforeRut)}</p><p><b>{t.afterRut}:</b> {formatSek(estimate.afterRut)}</p><p><b>{t.timeEstimate}:</b> {timeEstimate}</p><p className="text-porcelain/55">{draft.customerType === "Företag" || draft.customerType === "Company" ? t.companyMoms : t.moms}</p><p className="text-porcelain/55">{t.priceNote}</p></div>
            <pre className="mt-5 max-h-[520px] overflow-auto whitespace-pre-wrap rounded-[1.5rem] border border-gold/15 bg-[#181917] p-5 text-sm leading-7 text-porcelain/70">{summary}</pre>
          </aside>
        </section>
  );

  if (checking) {
    const loadingCard = <div className="luxe-container rounded-[2rem] bg-[#242321] p-8 shadow-soft"><h1 className="display text-4xl uppercase text-gold">Iboren</h1></div>;
    return variant === "embedded" ? loadingCard : <main className="min-h-screen bg-ink px-5 py-20 text-porcelain">{loadingCard}</main>;
  }

  if (variant === "embedded") return formAndSummary;

  return (
    <main className="min-h-screen bg-[#1f1f1d] px-5 py-10 text-porcelain md:py-16">
      <div className="luxe-container grid gap-8">
        <section className="rounded-[2rem] border border-white/10 bg-gradient-to-b from-[#2b2a28] to-[#1c1c1a] p-7 shadow-luxe md:p-9">
          <div className="mb-4 flex items-center justify-between gap-3"><p className="text-xs font-black uppercase tracking-[.32em] text-gold">{t.kicker}</p><Link href={t.langHref} className="rounded-full border border-gold/35 px-4 py-2 text-xs font-black uppercase tracking-[.18em] text-gold">{t.langLabel}</Link></div>
          <h1 className="display text-4xl font-normal uppercase leading-[.95] text-gold md:text-6xl">{isLoggedIn ? t.loggedInTitle : t.title}</h1>
          <p className="mt-5 max-w-3xl text-base leading-8 text-porcelain/70">{isLoggedIn ? t.loggedInIntro : t.intro}</p>
          <p className="mt-5 max-w-3xl rounded-2xl border border-gold/25 bg-gold/10 px-4 py-3 text-sm font-bold text-gold">{t.binding}</p>
          <div className="mt-5 grid gap-2 text-sm text-porcelain/65">
            {isLoggedIn ? <p>{t.loggedInAs} <b className="text-porcelain">{accountEmail}</b>. <Link href={language === "sv" ? "/profile" : "/en/profile"} className="font-bold text-gold underline">{t.profileLink}</Link>.</p> : <p>{t.login} <Link href="/login" className="font-bold text-gold underline">{t.loginLink}</Link>.</p>}
            <p>{isLoggedIn ? t.loggedInReview : t.review}</p>
          </div>
        </section>

        {formAndSummary}
      </div>
    </main>
  );
}
