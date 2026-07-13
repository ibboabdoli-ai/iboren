"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { BadgeCheck, Building2, Calculator, CheckCircle2, Home, LocateFixed, Mail, MapPin, Menu, ShieldCheck, Truck, UserRound, X } from "lucide-react";
import { createClient, type User } from "@supabase/supabase-js";
import ReviewShowcase from "./components/reviews/ReviewShowcase";

type Option = { value: string; label: string };

type BookingDraft = {
  service: string;
  area: string;
  address: string;
  size: string;
  propertyType: string;
  rooms: string;
  bathrooms: string;
  pets: string;
  floor: string;
  elevator: string;
  parking: string;
  extras: string[];
  frequency: string;
  date: string;
  timeWindow: string;
  name: string;
  email: string;
  phone: string;
  notes: string;
};

type ReverseGeocodeResponse = { ok: boolean; address?: string; area?: string; message?: string };

const initialDraft: BookingDraft = {
  service: "Hemstädning",
  area: "Södertälje",
  address: "",
  size: "",
  propertyType: "Lägenhet",
  rooms: "",
  bathrooms: "",
  pets: "Nej",
  floor: "",
  elevator: "Vet ej",
  parking: "Vet ej",
  extras: [],
  frequency: "Engång",
  date: "",
  timeWindow: "Flexibel",
  name: "",
  email: "",
  phone: "",
  notes: ""
};

const serviceOptions: Option[] = [
  { value: "Hemstädning", label: "Home cleaning" },
  { value: "Flyttstädning", label: "Move-out cleaning" },
  { value: "Kontorsstädning", label: "Office cleaning" },
  { value: "Fönsterputs", label: "Window cleaning" }
];

const frequencyOptions: Option[] = [
  { value: "Engång", label: "One-time" },
  { value: "Varje vecka", label: "Every week" },
  { value: "Varannan vecka", label: "Every other week" },
  { value: "Varje månad", label: "Every month" }
];

const timeOptions: Option[] = [
  { value: "Morgon", label: "Morning" },
  { value: "Förmiddag", label: "Late morning" },
  { value: "Eftermiddag", label: "Afternoon" },
  { value: "Kväll", label: "Evening" },
  { value: "Flexibel", label: "Flexible" }
];

const propertyTypes: Option[] = [
  { value: "Lägenhet", label: "Apartment" },
  { value: "Villa", label: "House" },
  { value: "Radhus", label: "Townhouse" },
  { value: "Kontor", label: "Office" },
  { value: "Annat", label: "Other" }
];

const yesNoOptions: Option[] = [
  { value: "Ja", label: "Yes" },
  { value: "Nej", label: "No" },
  { value: "Vet ej", label: "Not sure" }
];

const extraOptions: Option[] = [
  { value: "Fönsterputs", label: "Window cleaning" },
  { value: "Ugn", label: "Oven" },
  { value: "Kyl/frys", label: "Fridge/freezer" },
  { value: "Balkong", label: "Balcony" },
  { value: "Grovstädning", label: "Deep cleaning" },
  { value: "Skåp/lådor", label: "Cabinets/drawers" }
];

const services = [
  {
    icon: Home,
    title: "Home cleaning",
    href: "/en/home-cleaning",
    price: "from 255 SEK/hour after RUT",
    body: "For recurring or one-time cleaning at home.",
    image: "/service-cards/home-cleaning.webp",
    details: ["Kitchen & bathroom", "Vacuuming", "Recurring times"]
  },
  {
    icon: Truck,
    title: "Move-out cleaning",
    href: "/en/move-out-cleaning",
    price: "custom quote",
    body: "For moving, handover and a clear checklist.",
    image: "/service-cards/move-out-cleaning.webp",
    details: ["Clear checklist", "Kitchen & bathroom", "Before handover"]
  },
  {
    icon: Building2,
    title: "Office cleaning",
    href: "/en/office-cleaning",
    price: "custom quote",
    body: "For companies, premises and recurring service.",
    image: "/service-cards/office-cleaning.webp",
    details: ["Workspaces", "Meeting rooms", "Shared areas"]
  },
  {
    icon: CheckCircle2,
    title: "Window cleaning",
    href: "/en/window-cleaning",
    price: "custom quote",
    body: "For windows, glass surfaces and add-on cleaning.",
    image: "/service-cards/window-cleaning.webp",
    details: ["Windows & glass", "Homes & offices", "Clear quote"]
  }
];

const trustPoints = [
  {
    icon: Calculator,
    title: "Clear price indication",
    body: "See a price estimate before you send your request."
  },
  {
    icon: ShieldCheck,
    title: "RUT deduction",
    body: "For private services when the RUT conditions are fulfilled."
  },
  {
    icon: MapPin,
    title: "Local focus",
    body: "We receive requests in Södertälje and Stockholm."
  },
  {
    icon: BadgeCheck,
    title: "Non-binding request",
    body: "Time, scope and final price are confirmed before booking."
  }
];

const trustBadges = ["RUT deduction", "Online price estimate", "Non-binding request"];

const displayMap = new Map<string, string>([
  ...serviceOptions.map((option) => [option.value, option.label] as const),
  ...frequencyOptions.map((option) => [option.value, option.label] as const),
  ...timeOptions.map((option) => [option.value, option.label] as const),
  ...propertyTypes.map((option) => [option.value, option.label] as const),
  ...yesNoOptions.map((option) => [option.value, option.label] as const),
  ...extraOptions.map((option) => [option.value, option.label] as const)
]);

function display(value: string) {
  return displayMap.get(value) || value;
}

function getSupabase() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !key) return null;
  return createClient(url, key, { auth: { persistSession: true, autoRefreshToken: true, detectSessionInUrl: true } });
}

function buildBookingNotes(draft: BookingDraft) {
  const lines = [
    "--- Property & details ---",
    `Property type: ${display(draft.propertyType)}`,
    `Rooms: ${draft.rooms || "Not filled in"}`,
    `Bathrooms: ${draft.bathrooms || "Not filled in"}`,
    `Pets: ${display(draft.pets)}`,
    `Floor: ${draft.floor || "Not filled in"}`,
    `Elevator: ${display(draft.elevator)}`,
    `Parking: ${display(draft.parking)}`,
    `Extra services: ${draft.extras.length ? draft.extras.map(display).join(", ") : "None selected"}`
  ];
  if (draft.notes.trim()) lines.push("", "--- Customer notes ---", draft.notes.trim());
  return lines.join("\n");
}

export default function EnglishBookingPage() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [draft, setDraft] = useState<BookingDraft>(initialDraft);
  const [user, setUser] = useState<User | null>(null);
  const [locating, setLocating] = useState(false);
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [message, setMessage] = useState("");

  useEffect(() => {
    const supabase = getSupabase();
    if (!supabase) return;

    supabase.auth.getUser().then(({ data }) => {
      if (!data.user) return;
      const fullName = data.user.user_metadata?.full_name || data.user.user_metadata?.name || "";
      setUser(data.user);
      setDraft((current) => ({ ...current, name: current.name || fullName, email: current.email || data.user?.email || "" }));
    });

    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
      if (session?.user) {
        const fullName = session.user.user_metadata?.full_name || session.user.user_metadata?.name || "";
        setDraft((current) => ({ ...current, name: current.name || fullName, email: current.email || session.user.email || "" }));
      }
    });

    return () => listener.subscription.unsubscribe();
  }, []);

  const notesForApi = useMemo(() => buildBookingNotes(draft), [draft]);
  const summary = useMemo(() => [
    `Service: ${display(draft.service)}`,
    `Area: ${draft.area || "Not filled in"}`,
    `Address: ${draft.address || "Not filled in"}`,
    `Size: ${draft.size ? `${draft.size} sqm` : "Not filled in"}`,
    `Property type: ${display(draft.propertyType)}`,
    `Rooms: ${draft.rooms || "Not filled in"}`,
    `Bathrooms: ${draft.bathrooms || "Not filled in"}`,
    `Pets: ${display(draft.pets)}`,
    `Floor: ${draft.floor || "Not filled in"}`,
    `Elevator: ${display(draft.elevator)}`,
    `Parking: ${display(draft.parking)}`,
    `Extra services: ${draft.extras.length ? draft.extras.map(display).join(", ") : "None selected"}`,
    `Frequency: ${display(draft.frequency)}`,
    `Date: ${draft.date || "Not selected"}`,
    `Time: ${display(draft.timeWindow)}`,
    `Name: ${draft.name || "Not filled in"}`,
    `Email: ${draft.email || "Not filled in"}`,
    `Phone: ${draft.phone || "Not filled in"}`,
    `Notes: ${draft.notes || "—"}`
  ].join("\n"), [draft]);

  const setField = <K extends keyof BookingDraft>(key: K, value: BookingDraft[K]) => setDraft((current) => ({ ...current, [key]: value }));

  function toggleExtra(extra: string) {
    setDraft((current) => ({ ...current, extras: current.extras.includes(extra) ? current.extras.filter((item) => item !== extra) : [...current.extras, extra] }));
  }

  function startNewBooking() {
    setDraft((current) => ({ ...initialDraft, name: current.name, email: current.email, phone: current.phone, area: current.area || initialDraft.area }));
    setStatus("idle");
    setMessage("");
    window.setTimeout(() => document.querySelector("#booking")?.scrollIntoView({ behavior: "smooth", block: "start" }), 50);
  }

  async function reverseGeocode(latitude: number, longitude: number) {
    const response = await fetch(`/api/reverse-geocode?lat=${encodeURIComponent(latitude)}&lon=${encodeURIComponent(longitude)}`, { headers: { Accept: "application/json" } });
    const result = (await response.json()) as ReverseGeocodeResponse;
    if (!response.ok || !result.ok) throw new Error(result.message || "Reverse geocoding failed");
    return result;
  }

  function useLocation() {
    if (!navigator.geolocation) {
      setMessage("Your browser does not support location sharing. Enter the address manually.");
      return;
    }

    setLocating(true);
    setMessage("Fetching your position and trying to fill in the address...");
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        try {
          const result = await reverseGeocode(position.coords.latitude, position.coords.longitude);
          setDraft((current) => ({ ...current, address: result.address || current.address, area: result.area || current.area }));
          setMessage(result.address ? "Address was filled automatically. Please check that it is correct before sending." : "Position found, but the address could not be interpreted. Enter the address manually.");
        } catch {
          setMessage("Could not fetch the address. Enter it manually.");
        } finally {
          setLocating(false);
        }
      },
      () => {
        setMessage("Location sharing was denied. You can enter the address manually.");
        setLocating(false);
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 30000 }
    );
  }

  async function getAccessToken() {
    const supabase = getSupabase();
    if (!supabase) return "";
    const { data } = await supabase.auth.getSession();
    return data.session?.access_token || "";
  }

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!user) {
      setStatus("error");
      setMessage("Log in before sending a booking request.");
      return;
    }

    const missing: string[] = [];
    if (!draft.name.trim()) missing.push("name");
    if (!draft.email.trim()) missing.push("email");
    if (!draft.phone.trim()) missing.push("phone");
    if (!draft.area.trim()) missing.push("area");
    if (!draft.address.trim()) missing.push("address");
    if (!draft.size.trim()) missing.push("size");
    if (!draft.rooms.trim()) missing.push("rooms");
    if (!draft.bathrooms.trim()) missing.push("bathrooms");
    if (!draft.date.trim()) missing.push("date");

    if (missing.length) {
      setStatus("error");
      setMessage(`Fill in required fields before sending: ${missing.join(", ")}.`);
      return;
    }

    setStatus("loading");
    setMessage("");

    try {
      const accessToken = await getAccessToken();
      if (!accessToken) throw new Error("Your session has expired. Log in again before sending the request.");

      const response = await fetch("/api/bookings", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${accessToken}` },
        body: JSON.stringify({
          service: draft.service,
          area: draft.area,
          address: draft.address,
          size: draft.size,
          frequency: draft.frequency,
          date: draft.date,
          timeWindow: draft.timeWindow,
          name: draft.name,
          email: draft.email,
          phone: draft.phone,
          notes: notesForApi,
          customerType: draft.service === "Kontorsstädning" ? "Företag" : "Privatperson",
          rutRequested: draft.service !== "Kontorsstädning",
          language: "en"
        })
      });
      const result = await response.json();
      if (!response.ok || !result.ok) throw new Error(result.message || "Could not send the request.");

      setStatus("success");
      setMessage("Thank you. Your booking request has been saved to your profile and sent to Iboren.");
    } catch (error) {
      setStatus("error");
      setMessage(error instanceof Error ? error.message : "Could not send the request right now.");
    }
  }

  return (
    <main className="min-h-screen overflow-x-hidden bg-night text-porcelain">
      <header className="fixed inset-x-0 top-0 z-50 border-b border-gold/10 bg-night/80 backdrop-blur-2xl">
        <nav className="luxe-container flex h-20 items-center justify-between">
          <a href="/en" className="iboren-header-logo-link group flex items-center" onClick={() => setMenuOpen(false)} aria-label="Iboren English homepage">
            <span className="sr-only">Iboren</span>
            <img src="/ibbologo.svg" alt="Iboren" width={180} height={60} className="iboren-header-logo" decoding="async" />
          </a>
          <div className="hidden items-center gap-2 text-sm font-semibold text-porcelain/68 xl:flex">
            <a href="#services" className="rounded-full px-3 py-2 transition hover:bg-gold/10 hover:text-gold">Services</a>
            <Link href="/en/prices" className="rounded-full px-3 py-2 transition hover:bg-gold/10 hover:text-gold">Prices</Link>
            <Link href="/en/boka-utan-konto" className="rounded-full px-3 py-2 transition hover:bg-gold/10 hover:text-gold">Request</Link>
            <Link href="/en/jobs" className="rounded-full px-3 py-2 transition hover:bg-gold/10 hover:text-gold">Work with us</Link>
            <Link href="/en/about" className="rounded-full px-3 py-2 transition hover:bg-gold/10 hover:text-gold">About us</Link>
            <Link href="/" className="rounded-full px-3 py-2 transition hover:bg-gold/10 hover:text-gold">SV</Link>
            <Link href="/en" className="rounded-full bg-gold/10 px-3 py-2 text-gold">EN</Link>
            <Link href={user ? "/profile" : "/login"} className="inline-flex items-center gap-2 rounded-full px-3 py-2 transition hover:bg-gold/10 hover:text-gold"><UserRound size={17} /> {user ? "My profile" : "Log in"}</Link>
            <Link href="/en/boka-utan-konto" className="rounded-full border border-gold/40 bg-gold px-5 py-3 text-night transition hover:bg-porcelain">Send request</Link>
          </div>
          <button type="button" aria-label={menuOpen ? "Close menu" : "Open menu"} aria-expanded={menuOpen} aria-controls="english-mobile-menu" onClick={() => setMenuOpen(!menuOpen)} className="grid h-11 w-11 place-items-center rounded-full border border-gold/25 bg-porcelain/5 text-gold transition hover:bg-gold/10 xl:hidden">{menuOpen ? <X size={19} /> : <Menu size={19} />}</button>
        </nav>
        {menuOpen && (
          <div id="english-mobile-menu" className="max-h-[calc(100svh-5rem)] overflow-y-auto border-t border-gold/10 bg-night/95 px-4 pb-6 xl:hidden">
            <div className="mx-auto grid max-w-sm gap-2 pt-2 text-porcelain">
              <a href="#services" onClick={() => setMenuOpen(false)} className="rounded-2xl px-4 py-3 font-semibold">Services</a>
              <Link href="/en/boka-utan-konto" onClick={() => setMenuOpen(false)} className="rounded-2xl px-4 py-3 font-semibold">Request</Link>
              <Link href="/en/prices" onClick={() => setMenuOpen(false)} className="rounded-2xl px-4 py-3 font-semibold">Prices</Link>
              <Link href="/en/jobs" onClick={() => setMenuOpen(false)} className="rounded-2xl px-4 py-3 font-semibold">Work with us</Link>
              <Link href="/en/about" onClick={() => setMenuOpen(false)} className="rounded-2xl px-4 py-3 font-semibold">About us</Link>
              <Link href="/" onClick={() => setMenuOpen(false)} className="rounded-2xl px-4 py-3 font-semibold">Svenska</Link>
              <Link href={user ? "/profile" : "/login"} onClick={() => setMenuOpen(false)} className="rounded-2xl px-4 py-3 font-semibold">{user ? "My profile" : "Log in"}</Link>
              <Link href="/en/boka-utan-konto" onClick={() => setMenuOpen(false)} className="mt-2 rounded-full bg-gold px-5 py-4 text-center text-sm font-bold text-night">Send request</Link>
            </div>
          </div>
        )}
      </header>

      <section id="top" className="relative grid min-h-screen place-items-center overflow-hidden px-5 pt-28 text-center">
        <img src="/cinematic/03-home-after.webp" alt="Clean home" className="absolute inset-0 h-full w-full object-cover" />
        <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(2,5,4,.58),rgba(2,5,4,.16)_48%,rgba(2,5,4,.62)),radial-gradient(circle_at_center,transparent_0_38%,rgba(0,0,0,.34)_100%)]" />
        <div className="relative z-10 mx-auto max-w-6xl">
          <p className="text-[11px] font-bold uppercase tracking-[0.36em] text-gold/90 md:tracking-[0.44em]">Södertälje · Stockholm · RUT deduction</p>
          <h1 className="display mt-5 text-[clamp(3rem,12vw,8.5rem)] font-normal uppercase leading-[.9] tracking-[.01em] text-porcelain md:mt-6 md:leading-[.86]">Cleaning in Södertälje & Stockholm</h1>
          <p className="mx-auto mt-6 max-w-3xl text-base font-semibold leading-7 text-porcelain/88 md:mt-7 md:text-2xl md:leading-8">Home cleaning, move-out cleaning, office cleaning and window cleaning. Get a price estimate online and send a non-binding request.</p>
          {user && <p className="mt-5 inline-flex rounded-full border border-gold/25 bg-night/50 px-4 py-2 text-sm font-bold text-gold">Logged in as {user.email}</p>}
          <div className="mt-7 flex flex-wrap items-center justify-center gap-2 md:mt-8">{trustBadges.map((badge) => <span key={badge} className="rounded-full border border-gold/25 bg-night/45 px-3 py-2 text-[10px] font-bold uppercase tracking-[.16em] text-gold md:px-4 md:text-xs md:tracking-[.18em]">{badge}</span>)}</div>
          <div className="mt-9 flex flex-col items-center justify-center gap-3 sm:flex-row md:mt-10"><Link href="/en/prices" className="btn-primary">Calculate price</Link><Link href="/en/boka-utan-konto" className="btn-secondary">Send request</Link></div>
          <p className="mx-auto mt-5 max-w-xl text-sm font-bold leading-6 text-porcelain/75">We always confirm final time and price before the request becomes binding.</p>
        </div>
      </section>

      <section id="services" className="bg-night py-24 md:py-32">
        <div className="luxe-container">
          <p className="text-[11px] font-bold uppercase tracking-[.38em] text-gold">I / Services</p>
          <h2 className="display mt-4 max-w-4xl text-5xl font-normal uppercase leading-[.9] text-porcelain md:text-7xl">Cleaning services for homes and businesses.</h2>
          <div className="mt-12 grid gap-5 md:grid-cols-2 xl:grid-cols-4">
            {services.map((service, index) => {
              const Icon = service.icon;
              return (
                <Link href={service.href} key={service.title} className="iboren-card-glass iboren-card-glass-hover group relative min-h-[27rem] overflow-hidden rounded-[2rem] border border-gold/15">
                  <img src={service.image} alt="" loading="lazy" decoding="async" className="absolute inset-0 h-full w-full object-cover opacity-45 transition duration-700 group-hover:scale-105 group-hover:opacity-60" />
                  <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(2,5,4,.1)_0%,rgba(2,5,4,.5)_36%,rgba(2,5,4,.95)_100%)]" />
                  <div className="relative z-10 flex h-full min-h-[27rem] flex-col p-7">
                    <div className="flex items-start justify-between gap-4">
                      <div className="iboren-gold-accent grid h-14 w-14 shrink-0 place-items-center rounded-full border border-gold/30 bg-night/45 backdrop-blur-sm"><Icon size={25} /></div>
                      <span className="iboren-gold-accent max-w-[10rem] rounded-full border border-gold/20 bg-night/45 px-3 py-1 text-right text-[10px] font-bold uppercase tracking-[.16em] backdrop-blur-sm">{service.price}</span>
                    </div>
                    <div className="mt-auto">
                      <div className="mb-5 flex items-center justify-between gap-4">
                        <p className="text-[11px] font-bold uppercase tracking-[.28em] text-porcelain/72">0{index + 1}</p>
                        <span className="text-[10px] font-bold uppercase tracking-[.2em] text-porcelain/72 transition group-hover:text-gold">Learn more <span aria-hidden="true">↗</span></span>
                      </div>
                      <h3 className="display text-4xl font-normal uppercase text-porcelain">{service.title}</h3>
                      <p className="iboren-text-muted-dark mt-4 max-w-[28ch] leading-7">{service.body}</p>
                      <ul className="mt-6 grid gap-2 border-t border-porcelain/15 pt-5 text-xs font-semibold text-porcelain/82">
                        {service.details.map((detail) => <li key={detail} className="flex items-center gap-2"><CheckCircle2 size={14} strokeWidth={2.5} className="shrink-0 text-gold" /><span>{detail}</span></li>)}
                      </ul>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      </section>

      <section aria-labelledby="trust-heading" className="relative overflow-hidden bg-[#111411] py-20 md:py-28">
        <div aria-hidden="true" className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_8%_20%,rgba(212,165,116,.12),transparent_28%),radial-gradient(circle_at_88%_78%,rgba(212,165,116,.08),transparent_26%)]" />
        <div className="luxe-container relative">
          <p className="text-[11px] font-bold uppercase tracking-[.38em] text-gold">II / Why Iboren</p>
          <div className="mt-4 flex flex-col justify-between gap-5 lg:flex-row lg:items-end">
            <h2 id="trust-heading" className="display max-w-4xl text-5xl font-normal uppercase leading-[.9] text-porcelain md:text-7xl">Clear from the first step.</h2>
            <p className="max-w-md text-sm leading-7 text-porcelain/65">A clear basis before anything becomes binding.</p>
          </div>
          <div className="mt-12 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            {trustPoints.map((point, index) => {
              const Icon = point.icon;
              return <article key={point.title} className="iboren-card-glass iboren-card-glass-hover relative overflow-hidden rounded-[2rem] border border-gold/15 p-6"><div className="mb-10 flex items-start justify-between gap-4"><div className="grid h-12 w-12 place-items-center rounded-full border border-gold/30 bg-gold/10 text-gold"><Icon size={22} /></div><span className="text-[10px] font-bold uppercase tracking-[.24em] text-gold/70">0{index + 1}</span></div><h3 className="display text-3xl font-normal uppercase text-porcelain">{point.title}</h3><p className="mt-4 max-w-[30ch] leading-7 text-porcelain/65">{point.body}</p></article>;
            })}
          </div>
        </div>
      </section>

      <ReviewShowcase language="en" />

      <section id="booking" className="bg-ink py-24 text-porcelain md:py-32">
        <div className="luxe-container grid gap-10 lg:grid-cols-[.82fr_1.18fr]">
          <div>
            <p className="mb-4 text-[11px] font-bold uppercase tracking-[.38em] text-gold">Request</p>
            <h2 className="display text-5xl font-normal uppercase leading-[.9] md:text-7xl">Create a clear booking request.</h2>
            <p className="mt-6 max-w-xl text-lg leading-8 text-porcelain/70">Fill in service, location, size, rooms, date, contact details and special requests. Log in if you want to save and follow the request in your profile.</p>
            <div className="mt-8 grid gap-3 text-sm text-porcelain/70">
              <p className="flex items-center gap-3"><ShieldCheck className="h-5 w-5 text-gold" /> Location is shared only after active consent.</p>
              <p className="flex items-center gap-3"><Mail className="h-5 w-5 text-gold" /> {user ? "Your request is saved to your profile." : "You can send a request without an account. Log in if you want to save and follow it in your profile."}</p>
              <p className="flex items-center gap-3"><Home className="h-5 w-5 text-gold" /> Your request is reviewed before confirmation.</p>
            </div>
          </div>

          <div className="w-full">
            <div className="iboren-card-glass iboren-card-glass-hover mx-auto max-w-3xl rounded-2xl p-8">
              <h3 className="text-2xl font-bold text-porcelain">Send a booking request</h3>
              <p className="iboren-text-muted-dark mt-3">Fill in the form on our booking page. You get a clear summary and price indication before sending.</p>
              <div className="mt-6 flex flex-wrap items-center gap-3">
                <Link href="/en/boka-utan-konto" className="btn-primary">Open booking form</Link>
                <Link href="/en/prices" className="btn-secondary">See prices first</Link>
              </div>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}

function Field({ label, value, onChange, placeholder, type = "text" }: { label: string; value: string; onChange: (value: string) => void; placeholder?: string; type?: string }) {
  return <label className="block"><span className="mb-2 block text-sm font-bold text-porcelain/80">{label}</span><input type={type} value={value} onChange={(event) => onChange(event.target.value)} className="w-full rounded-2xl border border-porcelain/10 bg-porcelain px-4 py-4 text-ink placeholder:text-ink/45 outline-none" placeholder={placeholder} /></label>;
}

function Select({ label, value, options, onChange }: { label: string; value: string; options: Option[]; onChange: (value: string) => void }) {
  return <label className="block"><span className="mb-2 block text-sm font-bold text-porcelain/80">{label}</span><select value={value} onChange={(event) => onChange(event.target.value)} className="w-full rounded-2xl border border-porcelain/10 bg-porcelain px-4 py-4 text-ink outline-none">{options.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}</select></label>;
}
