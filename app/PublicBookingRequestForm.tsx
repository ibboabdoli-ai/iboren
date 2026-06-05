"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";
import Link from "next/link";
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
    formTitle: "Dina uppgifter",
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
    priceNote: "Samma prislogik som huvudkalkylatorn används. Slutligt pris bekräftas efter förfrågan.",
    yes: "Ja",
    no: "Nej",
    unknown: "Vet ej",
    placeholders: { area: "Södertälje", postalCode: "151 46", address: "Gatuadress och nummer", size: "75", rooms: "4", bathrooms: "1", floor: "0", windows: "8", name: "För- och efternamn", email: "namn@email.se", phone: "+46 ...", notes: "Särskilda önskemål..." }
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
    formTitle: "Your details",
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
    priceNote: "The same price logic as the main calculator is used. Final price is confirmed after the request.",
    yes: "Yes",
    no: "No",
    unknown: "Not sure",
    placeholders: { area: "Södertälje", postalCode: "151 46", address: "Street address and number", size: "75", rooms: "4", bathrooms: "1", floor: "0", windows: "8", name: "First and last name", email: "name@email.se", phone: "+46 ...", notes: "Special requests..." }
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
  return createBookingFormDraft(lang);
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

function Field({ label, value, onChange, placeholder, type = "text", required = false }: { label: string; value: string; onChange: (value: string) => void; placeholder?: string; type?: string; required?: boolean }) {
  return <label className="block"><span className="mb-2 block text-sm font-bold text-ink/75">{label}{required ? " *" : ""}</span><input required={required} type={type} value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder} className="w-full rounded-2xl border border-burgundy/10 bg-cream px-4 py-4 text-ink outline-none focus:border-burgundy" /></label>;
}

function Select({ label, value, options: selectOptions, onChange }: { label: string; value: string; options: string[]; onChange: (value: string) => void }) {
  return <label className="block"><span className="mb-2 block text-sm font-bold text-ink/75">{label}</span><select value={value} onChange={(e) => onChange(e.target.value)} className="w-full rounded-2xl border border-burgundy/10 bg-cream px-4 py-4 text-ink outline-none focus:border-burgundy">{selectOptions.map((option) => <option key={option} value={option}>{option}</option>)}</select></label>;
}

export default function PublicBookingRequestForm({ language }: { language: Lang }) {
  const t = copy[language];
  const o = options[language];
  const [checking, setChecking] = useState(true);
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
        setDraft((current) => ({ ...current, name: current.name || fullName, email: email || current.email }));
      } else {
        setAuthToken("");
        setAccountEmail("");
      }
      setChecking(false);
    });
  }, [language]);

  function setField<K extends keyof Draft>(key: K, value: Draft[K]) {
    setDraft((current) => {
      let next: Draft = { ...current, [key]: value };
      if (key === "area") next.area = normalizeAreaValue(String(value));
      if (key === "service") next = applyBookingServiceSideEffects(next, language);
      if (key === "customerType" && (next.customerType === "Företag" || next.customerType === "Company")) next.rutRequested = false;
      return next;
    });
  }

  function toggleExtra(item: string) {
    setDraft((current) => ({ ...current, extras: current.extras.includes(item) ? current.extras.filter((extra) => extra !== item) : [...current.extras, item] }));
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

  if (checking) return <main className="min-h-screen bg-cream px-5 py-20 text-ink"><div className="luxe-container rounded-[2rem] bg-porcelain p-8 shadow-soft"><h1 className="display text-4xl uppercase text-burgundy">Iboren</h1></div></main>;

  return (
    <main className="min-h-screen bg-cream px-5 py-12 text-ink md:py-20">
      <div className="luxe-container grid gap-8">
        <section className="rounded-[2rem] border border-burgundy/10 bg-porcelain p-7 shadow-soft md:p-9">
          <div className="mb-5 flex items-center justify-between gap-3"><p className="text-xs font-black uppercase tracking-[.28em] text-burgundy/60">{t.kicker}</p><Link href={t.langHref} className="rounded-full border border-burgundy/15 px-4 py-2 text-xs font-black uppercase tracking-[.18em] text-burgundy">{t.langLabel}</Link></div>
          <h1 className="display text-5xl font-normal uppercase leading-[.92] text-burgundy md:text-7xl">{isLoggedIn ? t.loggedInTitle : t.title}</h1>
          <p className="mt-6 max-w-3xl text-base leading-8 text-ink/70">{isLoggedIn ? t.loggedInIntro : t.intro}</p>
          <p className="mt-5 max-w-3xl rounded-2xl border border-gold/25 bg-gold/10 px-4 py-3 text-sm font-bold text-burgundy">{t.binding}</p>
          <div className="mt-6 grid gap-3 text-sm text-ink/65">
            {isLoggedIn ? <p>{t.loggedInAs} <b>{accountEmail}</b>. <Link href={language === "sv" ? "/profile" : "/en/profile"} className="font-bold text-burgundy underline">{t.profileLink}</Link>.</p> : <p>{t.login} <Link href="/login" className="font-bold text-burgundy underline">{t.loginLink}</Link>.</p>}
            <p>{isLoggedIn ? t.loggedInReview : t.review}</p>
          </div>
        </section>

        <section className="grid gap-5 xl:grid-cols-[1fr_.75fr]">
          <form onSubmit={submit} className="rounded-[2rem] border border-burgundy/10 bg-porcelain p-5 shadow-soft md:p-7">
            <input value={draft.website} onChange={(event) => setField("website", event.target.value)} name="website" tabIndex={-1} autoComplete="off" aria-hidden="true" className="hidden" />
            <div className="mb-6"><p className="text-xs font-black uppercase tracking-[.28em] text-burgundy/60">{t.section}</p><h2 className="display mt-2 text-3xl font-normal uppercase text-burgundy">{t.formTitle}</h2></div>
            <div className="grid gap-4">
              <Select label={t.service} value={draft.service} options={o.services} onChange={(value) => setField("service", value)} />
              <div className="grid gap-4 sm:grid-cols-2"><Select label={t.customerType} value={draft.customerType} options={o.customerTypes} onChange={(value) => setField("customerType", value)} /><Select label={t.rut} value={draft.rutRequested ? t.yes : t.no} options={[t.yes, t.no]} onChange={(value) => setField("rutRequested", value === t.yes)} /></div>
              <div className="grid gap-4 sm:grid-cols-3"><Field required label={t.area} value={draft.area} onChange={(value) => setField("area", value)} placeholder={t.placeholders.area} /><Field label={t.postalCode} value={draft.postalCode} onChange={(value) => setField("postalCode", value.slice(0, 12))} placeholder={t.placeholders.postalCode} /><Field required label={t.size} value={draft.size} onChange={(value) => setField("size", value.replace(/[^0-9]/g, ""))} placeholder={t.placeholders.size} /></div>
              <Field required label={t.address} value={draft.address} onChange={(value) => setField("address", value)} placeholder={t.placeholders.address} />
              <div className="grid gap-4 sm:grid-cols-2"><Select label={t.propertyType} value={draft.propertyType} options={o.types} onChange={(value) => setField("propertyType", value)} /><Field label={t.rooms} value={draft.rooms} onChange={(value) => setField("rooms", value.replace(/[^0-9]/g, ""))} placeholder={t.placeholders.rooms} /></div>
              <div className="grid gap-4 sm:grid-cols-2"><Field label={t.bathrooms} value={draft.bathrooms} onChange={(value) => setField("bathrooms", value.replace(/[^0-9]/g, ""))} placeholder={t.placeholders.bathrooms} /><Select label={t.pets} value={draft.pets} options={[t.yes, t.no, t.unknown]} onChange={(value) => setField("pets", value)} /></div>
              <div className="grid gap-4 sm:grid-cols-3"><Field label={t.floor} value={draft.floor} onChange={(value) => setField("floor", value.replace(/[^0-9]/g, ""))} placeholder={t.placeholders.floor} /><Select label={t.elevator} value={draft.elevator} options={[t.yes, t.no, t.unknown]} onChange={(value) => setField("elevator", value)} /><Select label={t.parking} value={draft.parking} options={[t.yes, t.no, t.unknown]} onChange={(value) => setField("parking", value)} /></div>
              <div className="grid gap-4 sm:grid-cols-2"><Select label={t.condition} value={draft.condition} options={o.conditions} onChange={(value) => setField("condition", value)} /><Select label={t.access} value={draft.access} options={o.access} onChange={(value) => setField("access", value)} /></div>
              <div className="grid gap-4 sm:grid-cols-2"><Select label={t.shortNotice} value={draft.shortNotice} options={[t.yes, t.no]} onChange={(value) => setField("shortNotice", value)} /><Select label={t.weekend} value={draft.weekend} options={[t.yes, t.no]} onChange={(value) => setField("weekend", value)} /></div>
              {visibility.showAddOns && <div><p className="mb-2 text-sm font-bold text-ink/75">{t.extras}</p><div className="grid grid-cols-2 gap-2 md:grid-cols-3">{o.extras.map((extra) => <button type="button" key={extra} onClick={() => toggleExtra(extra)} className={`rounded-2xl border px-3 py-3 text-sm font-bold ${draft.extras.includes(extra) ? "border-burgundy bg-burgundy text-porcelain" : "border-burgundy/10 bg-cream text-ink/75"}`}>{extra}</button>)}</div></div>}
              {visibility.showWindowFields && <div className="grid gap-4 sm:grid-cols-2"><Field label={t.windows} value={draft.windows} onChange={(value) => setField("windows", value.replace(/[^0-9]/g, ""))} placeholder={t.placeholders.windows} /><Select label={t.windowSide} value={draft.windowSide} options={o.windowSides} onChange={(value) => setField("windowSide", value)} /></div>}
              {visibility.showBalconyFields && <Select label={t.balconyGlass} value={draft.balconyGlass} options={o.balconyGlass} onChange={(value) => setField("balconyGlass", value)} />}
              <div className="grid gap-4 sm:grid-cols-2"><Field required type="date" label={t.date} value={draft.date} onChange={(value) => setField("date", value)} /><Select label={t.time} value={draft.timeWindow} options={o.times} onChange={(value) => setField("timeWindow", value)} /></div>
              <Select label={t.frequency} value={draft.frequency} options={o.freqs} onChange={(value) => setField("frequency", value)} />
              <div className="grid gap-4 sm:grid-cols-2"><Field required label={t.name} value={draft.name} onChange={(value) => setField("name", value)} placeholder={t.placeholders.name} /><Field required type="email" label={t.email} value={isLoggedIn ? accountEmail || draft.email : draft.email} onChange={(value) => setField("email", value)} placeholder={t.placeholders.email} /></div>
              <Field required type="tel" label={t.phone} value={draft.phone} onChange={(value) => setField("phone", value)} placeholder={t.placeholders.phone} />
              <label className="block"><span className="mb-2 block text-sm font-bold text-ink/75">{t.message}</span><textarea value={draft.notes} onChange={(event) => setField("notes", event.target.value)} className="min-h-28 w-full rounded-2xl border border-burgundy/10 bg-cream px-4 py-4 text-ink outline-none focus:border-burgundy" placeholder={t.placeholders.notes} /></label>
              <button disabled={status === "loading"} className="btn-primary w-full justify-center bg-burgundy text-porcelain hover:bg-ink disabled:cursor-not-allowed disabled:opacity-60">{status === "loading" ? t.sending : isLoggedIn ? t.submitLoggedIn : t.submit}</button>
              {message && <p className={`rounded-2xl px-4 py-3 text-sm ${status === "success" ? "bg-green-100 text-green-800" : status === "error" ? "bg-red-100 text-red-800" : "bg-burgundy/5 text-ink/70"}`}>{message}</p>}
            </div>
          </form>
          <aside className="rounded-[2rem] border border-burgundy/10 bg-porcelain p-5 shadow-soft md:p-7 xl:sticky xl:top-6 xl:self-start">
            <p className="text-xs font-black uppercase tracking-[.28em] text-burgundy/60">{t.summary}</p>
            <h2 className="display mt-2 text-3xl font-normal uppercase text-burgundy">{t.estimate}</h2>
            <div className="mt-5 grid gap-3 rounded-[1.5rem] border border-burgundy/10 bg-cream p-5 text-sm"><p><b>{t.beforeRut}:</b> {formatSek(estimate.beforeRut)}</p><p><b>{t.afterRut}:</b> {formatSek(estimate.afterRut)}</p><p><b>{t.timeEstimate}:</b> {timeEstimate}</p><p className="text-ink/60">{t.moms}</p><p className="text-ink/60">{t.priceNote}</p></div>
            <pre className="mt-5 max-h-[520px] overflow-auto whitespace-pre-wrap rounded-[1.5rem] border border-burgundy/10 bg-cream p-5 text-sm leading-7 text-ink/70">{summary}</pre>
          </aside>
        </section>
      </div>
    </main>
  );
}
