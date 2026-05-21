"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { Copy, Home, LocateFixed, Loader2, Mail, Menu, Send, ShieldCheck, UserRound, X } from "lucide-react";
import { createClient, type User } from "@supabase/supabase-js";

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

const FORM_VERSION = "EN-NEW-ROUTE-1";

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
          setMessage("Position found, but the address could not be fetched automatically. Enter the address manually.");
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
          rutRequested: draft.service !== "Kontorsstädning"
        })
      });
      const result = await response.json();
      if (!response.ok || !result.ok) throw new Error(result.message || "Could not send the request.");

      setStatus("success");
      setMessage("Thank you. Your request has been saved to your profile and sent to Iboren.");
    } catch (error) {
      setStatus("error");
      setMessage(error instanceof Error ? error.message : "Could not send the request right now.");
    }
  }

  return (
    <main className="min-h-screen overflow-x-hidden bg-night text-porcelain">
      <header className="fixed inset-x-0 top-0 z-50 border-b border-gold/10 bg-night/80 backdrop-blur-2xl">
        <nav className="luxe-container flex h-20 items-center justify-between">
          <a href="#top" className="group flex items-center" onClick={() => setMenuOpen(false)} aria-label="Iboren English homepage">
            <span className="sr-only">Iboren</span>
            <span className="flex flex-col leading-none">
              <span className="display block text-4xl font-semibold tracking-wide text-porcelain md:text-5xl">Iboren</span>
              <span className="mt-1 block text-[10px] font-bold uppercase tracking-[0.36em] text-gold/75 md:text-[11px]">Price estimate & simple booking</span>
            </span>
          </a>
          <div className="hidden items-center gap-6 text-sm font-semibold text-porcelain/68 md:flex">
            <a href="#booking" className="hover:text-gold">Request</a>
            <Link href="/en/prices" className="hover:text-gold">Prices</Link>
            <Link href="/en/jobs" className="hover:text-gold">Work with us</Link>
            <Link href="/en/about" className="hover:text-gold">About us</Link>
            <Link href="/" className="hover:text-gold">SV</Link>
            <Link href="/en" className="text-gold">EN</Link>
            <Link href={user ? "/profile" : "/login"} className="inline-flex items-center gap-2 hover:text-gold"><UserRound size={17} /> {user ? "My profile" : "Log in"}</Link>
            <a href="#booking" className="rounded-full border border-gold/40 bg-gold px-5 py-3 text-night">Send request</a>
          </div>
          <button type="button" aria-label="Toggle menu" aria-expanded={menuOpen} onClick={() => setMenuOpen(!menuOpen)} className="grid h-11 w-11 place-items-center rounded-full border border-gold/25 bg-porcelain/5 text-gold md:hidden">{menuOpen ? <X size={19} /> : <Menu size={19} />}</button>
        </nav>
        {menuOpen && (
          <div className="border-t border-gold/10 bg-night/95 px-4 pb-6 md:hidden">
            <div className="mx-auto grid max-w-sm gap-2 pt-2 text-porcelain">
              <a href="#booking" onClick={() => setMenuOpen(false)} className="rounded-2xl px-4 py-3 font-semibold">Request</a>
              <Link href="/en/prices" onClick={() => setMenuOpen(false)} className="rounded-2xl px-4 py-3 font-semibold">Prices</Link>
              <Link href="/en/jobs" onClick={() => setMenuOpen(false)} className="rounded-2xl px-4 py-3 font-semibold">Work with us</Link>
              <Link href="/en/about" onClick={() => setMenuOpen(false)} className="rounded-2xl px-4 py-3 font-semibold">About us</Link>
              <Link href="/" onClick={() => setMenuOpen(false)} className="rounded-2xl px-4 py-3 font-semibold">Svenska</Link>
              <Link href={user ? "/profile" : "/login"} className="rounded-2xl px-4 py-3 font-semibold">{user ? "My profile" : "Log in"}</Link>
            </div>
          </div>
        )}
      </header>

      <section id="top" className="relative grid min-h-screen place-items-center overflow-hidden px-5 pt-28 text-center">
        <img src="/cinematic/03-home-after.webp" alt="Clean home" className="absolute inset-0 h-full w-full object-cover" />
        <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(2,5,4,.58),rgba(2,5,4,.16)_48%,rgba(2,5,4,.62)),radial-gradient(circle_at_center,transparent_0_38%,rgba(0,0,0,.34)_100%)]" />
        <div className="relative z-10 mx-auto max-w-6xl">
          <p className="text-[11px] font-bold uppercase tracking-[0.44em] text-gold/90">Södertälje · Stockholm · RUT deduction</p>
          <h1 className="display mt-6 text-[clamp(3.8rem,10vw,9rem)] font-normal uppercase leading-[.86] tracking-[.01em] text-porcelain">Cleaning in Södertälje and Stockholm</h1>
          <p className="mx-auto mt-7 max-w-3xl text-lg leading-8 text-porcelain/86 md:text-2xl">Get help with home cleaning, move-out cleaning, office cleaning and window cleaning. Send a clear booking request online.</p>
          {user && <p className="mt-5 inline-flex rounded-full border border-gold/25 bg-night/50 px-4 py-2 text-sm font-bold text-gold">Logged in as {user.email}</p>}
          <div className="mt-10 flex flex-col items-center justify-center gap-3 sm:flex-row"><Link href="/en/prices" className="btn-primary">Calculate price</Link><a href="#booking" className="btn-secondary">Send request</a></div>
        </div>
      </section>

      <section id="booking" className="bg-ink py-24 text-porcelain md:py-32">
        <div className="luxe-container grid gap-10 lg:grid-cols-[.82fr_1.18fr]">
          <div>
            <p className="mb-4 text-[11px] font-bold uppercase tracking-[.38em] text-gold">Request</p>
            <h2 className="display text-5xl font-normal uppercase leading-[.9] md:text-7xl">Create a clear booking request.</h2>
            <p className="mt-6 max-w-xl text-lg leading-8 text-porcelain/70">This is the clean English booking form. Fill in service, location, size, rooms, date, contact details and special requests.</p>
            <div className="mt-8 grid gap-3 text-sm text-porcelain/70">
              <p className="flex items-center gap-3"><ShieldCheck className="h-5 w-5 text-gold" /> Location is shared only after active consent.</p>
              <p className="flex items-center gap-3"><Mail className="h-5 w-5 text-gold" /> {user ? "Your request is saved to your profile." : "Log in to send and save your request to your profile."}</p>
              <p className="flex items-center gap-3"><Home className="h-5 w-5 text-gold" /> Form version: {FORM_VERSION}</p>
            </div>
          </div>

          <div className="grid gap-5 xl:grid-cols-[1fr_.88fr]">
            <form onSubmit={submit} className="rounded-[2rem] border border-porcelain/10 bg-porcelain/8 p-5 shadow-2xl backdrop-blur-xl md:p-7">
              <div className="mb-6 flex items-center justify-between"><div><p className="text-xs uppercase tracking-[.28em] text-gold">Step 1 / Request</p><h3 className="display mt-2 text-3xl font-normal uppercase">Request details</h3></div><span className="rounded-full border border-gold/30 px-3 py-1 text-[10px] font-bold uppercase tracking-[.22em] text-gold">Draft</span></div>
              <div className="grid gap-4">
                <div><label className="mb-2 block text-sm font-bold text-porcelain/80">Service</label><div className="grid grid-cols-2 gap-2">{serviceOptions.map((service) => <button type="button" key={service.value} onClick={() => setField("service", service.value)} className={`rounded-2xl border px-3 py-3 text-sm font-bold transition ${draft.service === service.value ? "border-gold bg-gold text-ink" : "border-porcelain/10 bg-porcelain/6 text-porcelain/80"}`}>{service.label}</button>)}</div></div>
                <div className="grid gap-4 sm:grid-cols-2"><Field label="Area / city" value={draft.area} onChange={(value) => setField("area", value)} placeholder="Stockholm, Södertälje..." /><Field label="Size sqm" value={draft.size} onChange={(value) => setField("size", value.replace(/[^0-9]/g, ""))} placeholder="75" /></div>
                <div><label className="mb-2 block text-sm font-bold text-porcelain/80">Address</label><div className="flex gap-2"><input value={draft.address} onChange={(event) => setField("address", event.target.value)} className="min-w-0 flex-1 rounded-2xl border border-porcelain/10 bg-porcelain px-4 py-4 text-ink placeholder:text-ink/45 outline-none" placeholder="Street address" /><button type="button" aria-label="Use my location" onClick={useLocation} className="grid h-14 w-14 shrink-0 place-items-center rounded-2xl border border-gold/30 text-gold">{locating ? <Loader2 className="h-5 w-5 animate-spin" /> : <LocateFixed className="h-5 w-5" />}</button></div></div>
                <div className="rounded-[1.5rem] border border-gold/15 bg-night/30 p-4"><p className="mb-4 text-xs font-bold uppercase tracking-[.28em] text-gold">Property & details</p><div className="grid gap-4 sm:grid-cols-2"><Select label="Property type" value={draft.propertyType} options={propertyTypes} onChange={(value) => setField("propertyType", value)} /><Field label="Number of rooms" value={draft.rooms} onChange={(value) => setField("rooms", value.replace(/[^0-9]/g, ""))} placeholder="3" /><Field label="Number of bathrooms" value={draft.bathrooms} onChange={(value) => setField("bathrooms", value.replace(/[^0-9]/g, ""))} placeholder="1" /><Select label="Pets" value={draft.pets} options={yesNoOptions} onChange={(value) => setField("pets", value)} /><Field label="Floor" value={draft.floor} onChange={(value) => setField("floor", value)} placeholder="3" /><Select label="Elevator" value={draft.elevator} options={yesNoOptions} onChange={(value) => setField("elevator", value)} /><Select label="Parking" value={draft.parking} options={yesNoOptions} onChange={(value) => setField("parking", value)} /></div></div>
                <div><label className="mb-2 block text-sm font-bold text-porcelain/80">Extra services</label><div className="grid grid-cols-2 gap-2 sm:grid-cols-3">{extraOptions.map((extra) => <button type="button" key={extra.value} onClick={() => toggleExtra(extra.value)} className={`rounded-2xl border px-3 py-3 text-sm font-bold transition ${draft.extras.includes(extra.value) ? "border-gold bg-gold text-ink" : "border-porcelain/10 bg-porcelain/6 text-porcelain/80"}`}>{extra.label}</button>)}</div></div>
                <div className="grid gap-4 sm:grid-cols-2"><Field label="Preferred date" type="date" value={draft.date} onChange={(value) => setField("date", value)} /><Select label="Time window" value={draft.timeWindow} options={timeOptions} onChange={(value) => setField("timeWindow", value)} /></div>
                <Select label="Frequency" value={draft.frequency} options={frequencyOptions} onChange={(value) => setField("frequency", value)} />
                <div className="grid gap-4 sm:grid-cols-2"><Field label="Name" value={draft.name} onChange={(value) => setField("name", value)} placeholder="Full name" /><Field label="Email" value={draft.email} onChange={(value) => setField("email", value)} placeholder="name@email.se" type="email" /></div>
                <Field label="Phone" value={draft.phone} onChange={(value) => setField("phone", value)} placeholder="+46 ..." type="tel" />
                <textarea value={draft.notes} onChange={(event) => setField("notes", event.target.value)} className="min-h-28 w-full rounded-2xl border border-porcelain/10 bg-porcelain px-4 py-4 text-ink placeholder:text-ink/45 outline-none" placeholder="Special requests..." />
                <button disabled={status === "loading" || !user} className="btn-primary w-full bg-gold text-ink hover:bg-porcelain disabled:cursor-not-allowed disabled:opacity-55">{status === "loading" ? <Loader2 className="h-5 w-5 animate-spin" /> : <Send className="h-5 w-5" />} Send booking request</button>
                {message && <p className={`rounded-2xl px-4 py-3 text-sm ${status === "success" ? "bg-gold/20 text-gold" : status === "error" ? "bg-red-500/10 text-red-200" : "bg-porcelain/10 text-porcelain/70"}`}>{message}</p>}
              </div>
            </form>

            <aside className="rounded-[2rem] border border-porcelain/10 bg-cream p-5 text-ink shadow-2xl md:p-7"><div className="mb-6 flex items-center justify-between"><div><p className="text-xs font-bold uppercase tracking-[.28em] text-burgundy/60">Summary</p><h3 className="display mt-2 text-3xl font-normal uppercase text-burgundy">Request draft</h3></div><button type="button" aria-label="Copy summary" onClick={() => navigator.clipboard.writeText(summary)} className="grid h-11 w-11 place-items-center rounded-full border border-burgundy/15 bg-porcelain text-burgundy"><Copy className="h-4 w-4" /></button></div><pre className="max-h-[520px] overflow-auto whitespace-pre-wrap rounded-[1.5rem] border border-burgundy/10 bg-porcelain/70 p-5 text-sm leading-7 text-ink/70">{summary}</pre></aside>
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
