"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { ArrowUpRight, Building2, CheckCircle2, Copy, Home, LocateFixed, Loader2, Mail, Menu, Send, ShieldCheck, Sparkles, Truck, UserRound, X } from "lucide-react";
import { createClient, User } from "@supabase/supabase-js";

type BookingDraft = {
  service: string;
  area: string;
  address: string;
  size: string;
  frequency: string;
  date: string;
  timeWindow: string;
  name: string;
  email: string;
  phone: string;
  notes: string;
};

const initialDraft: BookingDraft = {
  service: "Hemstädning",
  area: "Södertälje",
  address: "",
  size: "",
  frequency: "Engång",
  date: "",
  timeWindow: "Flexibel",
  name: "",
  email: "",
  phone: "",
  notes: ""
};

const services = [
  { icon: Home, title: "Hemstädning", href: "/hemstadning", price: "från 399 SEK", body: "För återkommande eller enstaka städning hemma. CleanAI samlar yta, frekvens och särskilda önskemål." },
  { icon: Truck, title: "Flyttstädning", href: "/flyttstadning", price: "offert efter yta", body: "För flytt, överlämning och checklista. Kunden anger kvm, adress och önskat datum för snabb offert." },
  { icon: Building2, title: "Kontorsstädning", href: "/kontorsstadning", price: "skräddarsydd offert", body: "För företag, lokaler och återkommande service. Flödet samlar yta, tider och åtkomstbehov." }
];

const serviceOptions = ["Hemstädning", "Flyttstädning", "Kontorsstädning", "Fönsterputs"];
const frequencyOptions = ["Engång", "Varje vecka", "Varannan vecka", "Varje månad"];
const timeOptions = ["Morgon", "Förmiddag", "Eftermiddag", "Kväll", "Flexibel"];

function getSupabase() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !key) return null;
  return createClient(url, key);
}

export default function HomePage() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [draft, setDraft] = useState(initialDraft);
  const [locating, setLocating] = useState(false);
  const [message, setMessage] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    const supabase = getSupabase();
    if (!supabase) return;

    supabase.auth.getUser().then(({ data }) => {
      if (!data.user) return;
      setUser(data.user);
      const fullName = data.user.user_metadata?.full_name || data.user.user_metadata?.name || "";
      setDraft((current) => ({
        ...current,
        name: current.name || fullName,
        email: current.email || data.user?.email || ""
      }));
    });

    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    return () => listener.subscription.unsubscribe();
  }, []);

  const summary = useMemo(() => [
    `Tjänst: ${draft.service || "—"}`,
    `Område: ${draft.area || "—"}`,
    `Adress: ${draft.address || "Ej ifylld"}`,
    `Storlek: ${draft.size ? `${draft.size} kvm` : "Ej ifylld"}`,
    `Frekvens: ${draft.frequency}`,
    `Datum: ${draft.date || "Ej valt"}`,
    `Tid: ${draft.timeWindow}`,
    `Namn: ${draft.name || "Ej ifyllt"}`,
    `E-post: ${draft.email || "Ej ifylld"}`,
    `Telefon: ${draft.phone || "Ej ifylld"}`,
    `Önskemål: ${draft.notes || "—"}`
  ].join("\n"), [draft]);

  const setField = <K extends keyof BookingDraft>(key: K, value: BookingDraft[K]) => setDraft((current) => ({ ...current, [key]: value }));

  function useLocation() {
    if (!navigator.geolocation) {
      setMessage("Din webbläsare stödjer inte platsdelning. Fyll i adress manuellt.");
      return;
    }
    setLocating(true);
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        setField("notes", `${draft.notes ? `${draft.notes}\n` : ""}GPS ungefärlig position: ${latitude.toFixed(5)}, ${longitude.toFixed(5)}`);
        setMessage("Plats hämtad. Fyll gärna i exakt adress manuellt för korrekt offert.");
        setLocating(false);
      },
      () => {
        setMessage("Platsdelning nekades. Det går bra att skriva adressen manuellt.");
        setLocating(false);
      },
      { enableHighAccuracy: false, timeout: 8000, maximumAge: 60000 }
    );
  }

  async function saveBookingToDatabase() {
    const supabase = getSupabase();
    if (!supabase) return;

    const { data } = await supabase.auth.getUser();
    const currentUser = data.user;

    const { error } = await supabase.from("bookings").insert({
      user_id: currentUser?.id ?? null,
      service: draft.service,
      area: draft.area,
      address: draft.address || null,
      size_sqm: Number.parseInt(draft.size, 10),
      frequency: draft.frequency,
      preferred_date: draft.date,
      time_window: draft.timeWindow,
      customer_name: draft.name,
      customer_email: draft.email,
      customer_phone: draft.phone || null,
      notes: draft.notes || null,
      status: "new"
    });

    if (error) throw new Error(`Kunde inte spara bokningen i databasen: ${error.message}`);
  }

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!draft.name || !draft.email || !draft.area || !draft.size || !draft.date) {
      setStatus("error");
      setMessage("Fyll i namn, e-post, område, storlek och datum innan du skickar.");
      return;
    }
    setStatus("loading");
    setMessage("");
    try {
      await saveBookingToDatabase();
      const response = await fetch("/api/bookings", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(draft) });
      const result = await response.json();
      if (!response.ok || !result.ok) throw new Error(result.message || "Något gick fel.");
      setStatus("success");
      setMessage(user ? "Tack! Bokningen är sparad på din profil och skickad till Iboren." : result.message || "Din bokningsförfrågan är registrerad.");
    } catch (error) {
      setStatus("error");
      setMessage(error instanceof Error ? error.message : "Kunde inte skicka bokningen just nu.");
    }
  }

  return (
    <main className="min-h-screen bg-cream text-ink">
      <header className="fixed inset-x-0 top-0 z-50 border-b border-burgundy/10 bg-cream/85 backdrop-blur-2xl">
        <nav className="luxe-container flex h-20 items-center justify-between">
          <a href="#top" className="flex items-center gap-3" onClick={() => setMenuOpen(false)}>
            <span className="grid h-11 w-11 place-items-center rounded-full border border-burgundy/20 bg-porcelain/70"><span className="display text-2xl font-bold text-burgundy">I</span></span>
            <span><span className="display block text-3xl font-bold tracking-wide">Iboren</span><span className="block text-[10px] font-bold uppercase tracking-[0.36em] text-burgundy/70">CleanAI booking</span></span>
          </a>
          <div className="hidden items-center gap-8 text-sm font-semibold text-ink/70 md:flex">
            <a href="#services" className="hover:text-burgundy">Tjänster</a>
            <a href="#process" className="hover:text-burgundy">Så fungerar det</a>
            <Link href={user ? "/profile" : "/login"} className="inline-flex items-center gap-2 hover:text-burgundy"><UserRound size={17} /> {user ? "Min profil" : "Logga in"}</Link>
            <a href="#booking" className="rounded-full bg-burgundy px-5 py-3 text-porcelain shadow-lg">Boka städning</a>
          </div>
          <button onClick={() => setMenuOpen(!menuOpen)} className="grid h-11 w-11 place-items-center rounded-full border border-burgundy/15 bg-porcelain/60 text-burgundy md:hidden">{menuOpen ? <X size={19} /> : <Menu size={19} />}</button>
        </nav>
        {menuOpen && <div className="border-t border-burgundy/10 bg-cream/95 px-4 pb-6 md:hidden"><div className="mx-auto grid max-w-sm gap-2 pt-2"><a href="#services" className="rounded-2xl px-4 py-3 font-semibold">Tjänster</a><a href="#process" className="rounded-2xl px-4 py-3 font-semibold">Så fungerar det</a><Link href={user ? "/profile" : "/login"} className="rounded-2xl px-4 py-3 font-semibold">{user ? "Min profil" : "Logga in"}</Link><a href="#booking" className="mt-2 rounded-full bg-burgundy px-5 py-4 text-center text-sm font-bold text-porcelain">Boka städning</a></div></div>}
      </header>

      <section id="top" className="relative flex min-h-screen items-center overflow-hidden pt-24">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_40%,rgba(212,165,116,.35),transparent_34%),radial-gradient(circle_at_82%_15%,rgba(107,39,55,.18),transparent_32%)]" />
        <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(107,39,55,.045)_1px,transparent_1px),linear-gradient(rgba(107,39,55,.035)_1px,transparent_1px)] bg-[size:72px_72px]" />
        <div className="luxe-container relative grid gap-10 md:grid-cols-[1.03fr_.97fr] md:items-center">
          <div>
            <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-burgundy/15 bg-porcelain/55 px-4 py-2 text-sm font-bold text-burgundy shadow-sm backdrop-blur"><Sparkles size={16} /> CleanAI by Iboren</div>
            <h1 className="display max-w-4xl text-6xl font-bold leading-[.88] text-ink md:text-8xl lg:text-9xl">Smart städbokning med lyxigare känsla.</h1>
            <p className="mt-7 max-w-2xl text-lg leading-8 text-ink/70 md:text-xl">Iboren gör bokningen enkel: välj tjänst, fyll i adress, lägg till önskemål och få ett tydligt underlag — steg för steg.</p>
            {user && <p className="mt-4 inline-flex rounded-full border border-burgundy/15 bg-porcelain/70 px-4 py-2 text-sm font-bold text-burgundy">Inloggad som {user.email}</p>}
            <div className="mt-9 flex flex-col gap-3 sm:flex-row"><a href="#booking" className="btn-primary">Starta bokning <ArrowUpRight size={17} /></a><a href="#services" className="btn-secondary">Se tjänster</a></div>
          </div>
          <div className="relative min-h-[440px] rounded-[2.5rem] border border-burgundy/10 bg-porcelain/45 p-8 shadow-2xl backdrop-blur-xl">
            <div className="absolute left-1/2 top-1/2 h-72 w-72 -translate-x-1/2 -translate-y-1/2 rounded-full border border-gold/40 bg-gold/10" />
            <div className="absolute right-[15%] top-[18%] grid h-28 w-28 place-items-center rounded-full bg-burgundy text-porcelain shadow-xl"><Sparkles size={44} /></div>
            <div className="absolute bottom-[19%] left-[14%] grid h-28 w-28 place-items-center rounded-[2rem] bg-gold/75 text-ink shadow-xl"><ShieldCheck size={42} /></div>
            <div className="absolute bottom-8 left-8 right-8 rounded-[1.8rem] bg-cream/80 p-5 shadow-lg"><p className="text-xs font-bold uppercase tracking-[.3em] text-burgundy/70">Live CleanAI draft</p><p className="mt-2 text-sm leading-6 text-ink/65">Hemstädning · Södertälje · RUT-ready · offertförfrågan</p></div>
          </div>
        </div>
      </section>

      <section id="services" className="py-24 md:py-32"><div className="luxe-container"><p className="eyebrow">I / Services</p><h2 className="display mt-4 text-5xl font-bold leading-[.9] text-burgundy md:text-7xl">The cleaning collection.</h2><div className="mt-12 grid gap-5 md:grid-cols-3">{services.map((service) => { const Icon = service.icon; return <Link href={service.href} key={service.title} className="relative overflow-hidden rounded-[28px] bg-porcelain p-7 shadow-lg transition hover:-translate-y-1"><div className="mb-20 flex items-start justify-between"><div className="grid h-14 w-14 place-items-center rounded-full bg-burgundy text-porcelain"><Icon size={25} /></div><span className="rounded-full border border-burgundy/15 px-3 py-1 text-[10px] font-bold uppercase tracking-[.2em] text-burgundy/70">{service.price}</span></div><h3 className="display text-4xl font-bold text-burgundy">{service.title}</h3><p className="mt-4 leading-7 text-ink/65">{service.body}</p></Link>; })}</div></div></section>

      <section id="process" className="bg-porcelain py-24 md:py-32"><div className="luxe-container"><p className="eyebrow">II / Method</p><h2 className="display mt-4 text-5xl font-bold leading-[.9] text-burgundy md:text-7xl">Four steps. One clear booking.</h2><div className="mt-12 grid gap-4 md:grid-cols-4">{["Välj tjänst", "Fyll i plats", "CleanAI sammanfattar", "Skicka förfrågan"].map((item, i) => <article key={item} className="rounded-[2rem] border border-burgundy/10 bg-cream p-6 shadow-sm"><div className="mb-10 flex items-center justify-between"><span className="display text-4xl text-burgundy/55">0{i + 1}</span><CheckCircle2 className="text-burgundy" /></div><h3 className="display text-3xl font-bold">{item}</h3><p className="mt-4 text-sm leading-7 text-ink/60">Ett enkelt steg som gör bokningsunderlaget tydligare och lättare att följa upp.</p></article>)}</div></div></section>

      <section id="booking" className="bg-ink py-24 text-porcelain md:py-32"><div className="luxe-container grid gap-10 lg:grid-cols-[.82fr_1.18fr]"><div><p className="mb-4 text-[11px] font-bold uppercase tracking-[.38em] text-gold">CleanAI booking</p><h2 className="display text-5xl font-bold leading-[.9] md:text-7xl">Skapa en tydlig bokningsförfrågan.</h2><p className="mt-6 max-w-xl text-lg leading-8 text-porcelain/70">MVP-flödet samlar rätt information direkt: tjänst, plats, storlek, datum, kontakt och särskilda önskemål.</p><div className="mt-8 grid gap-3 text-sm text-porcelain/70"><p className="flex items-center gap-3"><ShieldCheck className="h-5 w-5 text-gold" /> GDPR-aware: plats delas bara efter aktivt val.</p><p className="flex items-center gap-3"><Mail className="h-5 w-5 text-gold" /> {user ? "Din förfrågan sparas även på din profil." : "Logga in för att spara bokningen på din profil."}</p></div></div><div className="grid gap-5 xl:grid-cols-[1fr_.88fr]"><form onSubmit={submit} className="rounded-[2rem] border border-porcelain/10 bg-porcelain/8 p-5 shadow-2xl backdrop-blur-xl md:p-7"><div className="mb-6 flex items-center justify-between"><div><p className="text-xs uppercase tracking-[.28em] text-gold">Step 1 / Request</p><h3 className="display mt-2 text-3xl font-bold">Bokningsdetaljer</h3></div><span className="rounded-full border border-gold/30 px-3 py-1 text-[10px] font-bold uppercase tracking-[.22em] text-gold">Draft</span></div><div className="grid gap-4"><div><label className="mb-2 block text-sm font-bold text-porcelain/80">Tjänst</label><div className="grid grid-cols-2 gap-2">{serviceOptions.map((service) => <button type="button" key={service} onClick={() => setField("service", service)} className={`rounded-2xl border px-3 py-3 text-sm font-bold transition ${draft.service === service ? "border-gold bg-gold text-ink" : "border-porcelain/10 bg-porcelain/6 text-porcelain/80"}`}>{service}</button>)}</div></div><div className="grid gap-4 sm:grid-cols-2"><Field label="Område / stad" value={draft.area} onChange={(v) => setField("area", v)} placeholder="Stockholm, Södertälje..." /><Field label="Storlek kvm" value={draft.size} onChange={(v) => setField("size", v.replace(/[^0-9]/g, ""))} placeholder="75" /></div><div><label className="mb-2 block text-sm font-bold text-porcelain/80">Adress</label><div className="flex gap-2"><input value={draft.address} onChange={(e) => setField("address", e.target.value)} className="min-w-0 flex-1 rounded-2xl border border-porcelain/10 bg-porcelain/8 px-4 py-3 text-porcelain placeholder:text-porcelain/40" placeholder="Gatuadress" /><button type="button" onClick={useLocation} className="grid h-12 w-12 place-items-center rounded-2xl border border-gold/30 text-gold">{locating ? <Loader2 className="h-5 w-5 animate-spin" /> : <LocateFixed className="h-5 w-5" />}</button></div></div><div className="grid gap-4 sm:grid-cols-2"><Field label="Önskat datum" type="date" value={draft.date} onChange={(v) => setField("date", v)} /><Select label="Tidsfönster" value={draft.timeWindow} options={timeOptions} onChange={(v) => setField("timeWindow", v)} /></div><Select label="Frekvens" value={draft.frequency} options={frequencyOptions} onChange={(v) => setField("frequency", v)} /><div className="grid gap-4 sm:grid-cols-2"><Field label="Namn" value={draft.name} onChange={(v) => setField("name", v)} placeholder="För- och efternamn" /><Field label="E-post" value={draft.email} onChange={(v) => setField("email", v)} placeholder="namn@email.se" type="email" /></div><Field label="Telefon" value={draft.phone} onChange={(v) => setField("phone", v)} placeholder="+46 ..." type="tel" /><textarea value={draft.notes} onChange={(e) => setField("notes", e.target.value)} className="min-h-28 w-full rounded-2xl border border-porcelain/10 bg-porcelain/8 px-4 py-3 text-porcelain placeholder:text-porcelain/40" placeholder="Särskilda önskemål..." /><button disabled={status === "loading"} className="btn-primary w-full bg-gold text-ink hover:bg-porcelain">{status === "loading" ? <Loader2 className="h-5 w-5 animate-spin" /> : <Send className="h-5 w-5" />} Skicka bokningsförfrågan</button>{message && <p className={`rounded-2xl px-4 py-3 text-sm ${status === "success" ? "bg-gold/20 text-gold" : status === "error" ? "bg-red-500/10 text-red-200" : "bg-porcelain/10 text-porcelain/70"}`}>{message}</p>}</div></form><aside className="rounded-[2rem] border border-porcelain/10 bg-cream p-5 text-ink shadow-2xl md:p-7"><div className="mb-6 flex items-center justify-between"><div><p className="text-xs font-bold uppercase tracking-[.28em] text-burgundy/60">Live summary</p><h3 className="display mt-2 text-3xl font-bold text-burgundy">CleanAI draft</h3></div><button onClick={() => navigator.clipboard.writeText(summary)} className="grid h-11 w-11 place-items-center rounded-full border border-burgundy/15 bg-porcelain text-burgundy"><Copy className="h-4 w-4" /></button></div><pre className="max-h-[420px] overflow-auto whitespace-pre-wrap rounded-[1.5rem] border border-burgundy/10 bg-porcelain/70 p-5 text-sm leading-7 text-ink/70">{summary}</pre></aside></div></div></section>

      <footer className="border-t border-burgundy/10 bg-cream py-10"><div className="luxe-container flex flex-col gap-6 md:flex-row md:items-center md:justify-between"><div><p className="display text-4xl font-bold text-burgundy">Iboren</p><p className="mt-1 text-[10px] font-bold uppercase tracking-[.32em] text-ink/45">Smart städbokning med AI i Sverige</p></div><div className="flex flex-wrap gap-4 text-sm font-semibold text-ink/60"><Link href="/profile" className="hover:text-burgundy">Min profil</Link><Link href="/privacy" className="hover:text-burgundy">Privacy</Link><Link href="/terms" className="hover:text-burgundy">Terms</Link><a href="mailto:hej@iboren.se" className="hover:text-burgundy">hej@iboren.se</a></div></div></footer>
    </main>
  );
}

function Field({ label, value, onChange, placeholder, type = "text" }: { label: string; value: string; onChange: (value: string) => void; placeholder?: string; type?: string }) {
  return <label className="block"><span className="mb-2 block text-sm font-bold text-porcelain/80">{label}</span><input type={type} value={value} onChange={(event) => onChange(event.target.value)} className="w-full rounded-2xl border border-porcelain/10 bg-porcelain/8 px-4 py-3 text-porcelain placeholder:text-porcelain/40" placeholder={placeholder} /></label>;
}

function Select({ label, value, options, onChange }: { label: string; value: string; options: string[]; onChange: (value: string) => void }) {
  return <label className="block"><span className="mb-2 block text-sm font-bold text-porcelain/80">{label}</span><select value={value} onChange={(event) => onChange(event.target.value)} className="w-full rounded-2xl border border-porcelain/10 bg-[#34272b] px-4 py-3 text-porcelain">{options.map((option) => <option key={option} value={option}>{option}</option>)}</select></label>;
}
