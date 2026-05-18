"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { ArrowUpRight, Building2, CheckCircle2, Copy, Home, LocateFixed, Loader2, Mail, Menu, Send, ShieldCheck, Truck, UserRound, X } from "lucide-react";
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

const frames = [
  {
    counter: "01 / 06",
    kicker: "HOME · BEFORE",
    title: "Before the reset",
    body: "Ett hem innan återställningen: rörigt, tungt och svårt att slappna av i.",
    image: "https://images.unsplash.com/photo-1586023492125-27b2c045efd7?auto=format&fit=crop&w=1800&q=90"
  },
  {
    counter: "02 / 06",
    kicker: "CLEANING · MOTION",
    title: "The work begins",
    body: "Yta för yta återställs med metod, rytm och precision.",
    image: "https://images.unsplash.com/photo-1581578731548-c64695cc6952?auto=format&fit=crop&w=1800&q=90"
  },
  {
    counter: "03 / 06",
    kicker: "HOME · AFTER",
    title: "The calm after",
    body: "Ett rent, ljust och lugnt hem där allt känns lättare.",
    image: "https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?auto=format&fit=crop&w=1800&q=90"
  },
  {
    counter: "04 / 06",
    kicker: "OFFICE · BEFORE",
    title: "Workplace friction",
    body: "Kontoret innan reset: ytor, detaljer och saker som tar fokus.",
    image: "https://images.unsplash.com/photo-1497366754035-f200968a6e72?auto=format&fit=crop&w=1800&q=90"
  },
  {
    counter: "05 / 06",
    kicker: "OFFICE · RESET",
    title: "Surface by surface",
    body: "Arbetsytor, mötesrum och entré återställs utan att störa verksamheten.",
    image: "https://images.unsplash.com/photo-1497366811353-6870744d04b2?auto=format&fit=crop&w=1800&q=90"
  },
  {
    counter: "06 / 06",
    kicker: "READY · AFTER",
    title: "Ready again",
    body: "En renare arbetsplats, redo för fokus, kunder och nästa produktiva dag.",
    image: "https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&w=1800&q=90"
  }
];

const services = [
  { icon: Home, title: "Hemstädning", href: "/hemstadning", price: "från 399 SEK", body: "För återkommande eller enstaka städning hemma." },
  { icon: Truck, title: "Flyttstädning", href: "/flyttstadning", price: "offert efter yta", body: "För flytt, överlämning och tydlig checklista." },
  { icon: Building2, title: "Kontorsstädning", href: "/kontorsstadning", price: "skräddarsydd offert", body: "För företag, lokaler och återkommande service." }
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
  const [activeFrame, setActiveFrame] = useState(0);
  const [scrollProgress, setScrollProgress] = useState(0);

  useEffect(() => {
    const supabase = getSupabase();
    if (!supabase) return;
    supabase.auth.getUser().then(({ data }) => {
      if (!data.user) return;
      setUser(data.user);
      const fullName = data.user.user_metadata?.full_name || data.user.user_metadata?.name || "";
      setDraft((current) => ({ ...current, name: current.name || fullName, email: current.email || data.user?.email || "" }));
    });
    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => setUser(session?.user ?? null));
    return () => listener.subscription.unsubscribe();
  }, []);

  useEffect(() => {
    let ticking = false;
    function updateCinematic() {
      ticking = false;
      const section = document.getElementById("cinematic-scroll");
      if (!section) return;
      const rect = section.getBoundingClientRect();
      const total = Math.max(1, rect.height - window.innerHeight);
      const progress = Math.max(0, Math.min(1, -rect.top / total));
      const nextFrame = Math.max(0, Math.min(frames.length - 1, Math.floor(progress * frames.length)));
      setScrollProgress(progress);
      setActiveFrame(nextFrame);
    }
    function onScroll() {
      if (!ticking) {
        ticking = true;
        window.requestAnimationFrame(updateCinematic);
      }
    }
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    updateCinematic();
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
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

  const activeScene = frames[activeFrame];

  return (
    <main className="min-h-screen overflow-x-hidden bg-night text-porcelain">
      <header className="fixed inset-x-0 top-0 z-50 border-b border-gold/10 bg-night/80 backdrop-blur-2xl">
        <nav className="luxe-container flex h-20 items-center justify-between">
          <a href="#top" className="group flex items-center gap-3" onClick={() => setMenuOpen(false)}>
            <span className="grid h-11 w-11 place-items-center rounded-full border border-gold/35 bg-porcelain/5 text-gold"><span className="display text-2xl font-bold">I</span></span>
            <span><span className="display block text-3xl font-semibold tracking-wide text-porcelain">Iboren</span><span className="block text-[10px] font-bold uppercase tracking-[0.36em] text-gold/75">CleanAI booking</span></span>
          </a>
          <div className="hidden items-center gap-8 text-sm font-semibold text-porcelain/68 md:flex">
            <a href="#cinematic-scroll" className="hover:text-gold">Före / Efter</a>
            <a href="#services" className="hover:text-gold">Tjänster</a>
            <a href="#process" className="hover:text-gold">Så fungerar det</a>
            <Link href={user ? "/profile" : "/login"} className="inline-flex items-center gap-2 hover:text-gold"><UserRound size={17} /> {user ? "Min profil" : "Logga in"}</Link>
            <a href="#booking" className="rounded-full border border-gold/40 bg-gold px-5 py-3 text-night">Boka städning</a>
          </div>
          <button onClick={() => setMenuOpen(!menuOpen)} className="grid h-11 w-11 place-items-center rounded-full border border-gold/25 bg-porcelain/5 text-gold md:hidden">{menuOpen ? <X size={19} /> : <Menu size={19} />}</button>
        </nav>
        {menuOpen && <div className="border-t border-gold/10 bg-night/95 px-4 pb-6 md:hidden"><div className="mx-auto grid max-w-sm gap-2 pt-2 text-porcelain"><a href="#cinematic-scroll" onClick={() => setMenuOpen(false)} className="rounded-2xl px-4 py-3 font-semibold">Före / Efter</a><a href="#services" onClick={() => setMenuOpen(false)} className="rounded-2xl px-4 py-3 font-semibold">Tjänster</a><a href="#process" onClick={() => setMenuOpen(false)} className="rounded-2xl px-4 py-3 font-semibold">Så fungerar det</a><Link href={user ? "/profile" : "/login"} className="rounded-2xl px-4 py-3 font-semibold">{user ? "Min profil" : "Logga in"}</Link><a href="#booking" onClick={() => setMenuOpen(false)} className="mt-2 rounded-full bg-gold px-5 py-4 text-center text-sm font-bold text-night">Boka städning</a></div></div>}
      </header>

      <section id="top" className="relative grid min-h-screen place-items-center overflow-hidden px-5 pt-28 text-center">
        <img src={frames[2].image} alt="Rent hem" className="absolute inset-0 h-full w-full object-cover" />
        <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(2,5,4,.46),rgba(2,5,4,.08)_48%,rgba(2,5,4,.54)),radial-gradient(circle_at_center,transparent_0_38%,rgba(0,0,0,.34)_100%)]" />
        <div className="relative z-10 mx-auto max-w-5xl">
          <p className="text-[11px] font-bold uppercase tracking-[0.44em] text-gold/90">Stockholm · cleaning ritual · est 2026</p>
          <h1 className="display mt-6 text-[clamp(5rem,16vw,13rem)] font-normal uppercase leading-[.78] tracking-[.03em] text-porcelain">Iboren</h1>
          <p className="mx-auto mt-7 max-w-3xl text-lg leading-8 text-porcelain/86 md:text-2xl">Rent hem. Klar arbetsplats. Mindre stress.</p>
          {user && <p className="mt-5 inline-flex rounded-full border border-gold/25 bg-night/50 px-4 py-2 text-sm font-bold text-gold">Inloggad som {user.email}</p>}
          <div className="mt-10 flex flex-col items-center justify-center gap-3 sm:flex-row"><a href="#cinematic-scroll" className="btn-primary">Se transformationen <ArrowUpRight size={17} /></a><a href="#booking" className="btn-secondary">Boka direkt</a></div>
          <div className="mt-10 inline-flex items-center gap-4 text-[11px] font-bold uppercase tracking-[0.32em] text-gold/75 before:h-px before:w-10 before:bg-gold/40 after:h-px after:w-10 after:bg-gold/40">Scroll to begin</div>
        </div>
      </section>

      <section id="cinematic-scroll" className="relative h-[820vh] min-h-[5200px] bg-night">
        <div className="sticky top-0 h-screen overflow-hidden bg-night">
          {frames.map((frame, index) => (
            <img key={frame.counter} src={frame.image} alt={frame.title} className={`absolute inset-0 h-full w-full object-cover transition-all duration-700 ease-out ${activeFrame === index ? "scale-100 opacity-100" : "scale-[1.04] opacity-0"}`} />
          ))}
          <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(2,5,4,.50),rgba(2,5,4,.06)_48%,rgba(2,5,4,.50)),radial-gradient(circle_at_52%_46%,transparent_0_42%,rgba(0,0,0,.34)_100%)]" />
          <div className="absolute left-5 right-5 top-24 z-20 flex items-start justify-between md:left-[8vw] md:right-[8vw] md:top-[12vh]">
            <div><p className="text-[10px] font-black uppercase tracking-[.34em] text-gold/85">{activeScene.kicker}</p><p className="display mt-1 text-4xl font-normal uppercase tracking-[.02em] text-porcelain md:text-6xl">{activeScene.counter}</p></div>
            <div className="h-24 w-1 overflow-hidden rounded-full bg-porcelain/15"><div className="w-full rounded-full bg-gold transition-all" style={{ height: `${Math.round(scrollProgress * 100)}%` }} /></div>
          </div>
          <div className="absolute inset-x-0 bottom-12 z-20 px-5 md:bottom-20">
            <div className="luxe-container">
              <h2 className="display max-w-4xl text-[clamp(3rem,8vw,7rem)] font-normal uppercase leading-[.84] tracking-[.02em] text-porcelain">{activeScene.title}</h2>
              <p className="mt-5 max-w-2xl text-base leading-8 text-porcelain/86 md:text-xl">{activeScene.body}</p>
              {activeFrame === frames.length - 1 && <a href="#booking" className="mt-7 inline-flex rounded-full border border-gold/50 bg-gold/10 px-5 py-3 text-[11px] font-bold uppercase tracking-[.22em] text-gold backdrop-blur hover:bg-gold hover:text-night">Boka städning</a>}
            </div>
          </div>
        </div>
      </section>

      <section id="services" className="bg-night py-24 md:py-32"><div className="luxe-container"><p className="text-[11px] font-bold uppercase tracking-[.38em] text-gold">I / Services</p><h2 className="display mt-4 max-w-4xl text-5xl font-normal uppercase leading-[.9] text-porcelain md:text-7xl">The cleaning collection.</h2><div className="mt-12 grid gap-5 md:grid-cols-3">{services.map((service, index) => { const Icon = service.icon; return <Link href={service.href} key={service.title} className="group relative overflow-hidden rounded-[2rem] border border-gold/15 bg-porcelain/[.035] p-7 shadow-[0_28px_90px_rgba(0,0,0,.22)] transition hover:-translate-y-1 hover:border-gold/40"><div className="mb-20 flex items-start justify-between"><div className="grid h-14 w-14 place-items-center rounded-full border border-gold/30 bg-gold/10 text-gold"><Icon size={25} /></div><span className="rounded-full border border-gold/20 px-3 py-1 text-[10px] font-bold uppercase tracking-[.2em] text-gold/80">{service.price}</span></div><p className="mb-3 text-[11px] font-bold uppercase tracking-[.28em] text-porcelain/42">0{index + 1}</p><h3 className="display text-4xl font-normal uppercase text-porcelain">{service.title}</h3><p className="mt-4 leading-7 text-porcelain/62">{service.body}</p></Link>; })}</div></div></section>

      <section id="process" className="bg-porcelain py-24 text-ink md:py-32"><div className="luxe-container"><p className="eyebrow">II / Method</p><h2 className="display mt-4 max-w-4xl text-5xl font-normal uppercase leading-[.9] text-burgundy md:text-7xl">Four steps. One clear booking.</h2><div className="mt-12 grid gap-4 md:grid-cols-4">{["Välj tjänst", "Fyll i plats", "CleanAI sammanfattar", "Skicka förfrågan"].map((item, i) => <article key={item} className="rounded-[2rem] border border-burgundy/10 bg-cream p-6 shadow-sm transition hover:-translate-y-1 hover:shadow-soft"><div className="mb-10 flex items-center justify-between"><span className="display text-4xl text-burgundy/55">0{i + 1}</span><CheckCircle2 className="text-burgundy" /></div><h3 className="display text-3xl font-normal uppercase">{item}</h3><p className="mt-4 text-sm leading-7 text-ink/60">Ett enkelt steg som gör bokningsunderlaget tydligare och lättare att följa upp.</p></article>)}</div></div></section>

      <section id="booking" className="bg-ink py-24 text-porcelain md:py-32"><div className="luxe-container grid gap-10 lg:grid-cols-[.82fr_1.18fr]"><div><p className="mb-4 text-[11px] font-bold uppercase tracking-[.38em] text-gold">CleanAI booking</p><h2 className="display text-5xl font-normal uppercase leading-[.9] md:text-7xl">Skapa en tydlig bokningsförfrågan.</h2><p className="mt-6 max-w-xl text-lg leading-8 text-porcelain/70">MVP-flödet samlar rätt information direkt: tjänst, plats, storlek, datum, kontakt och särskilda önskemål.</p><div className="mt-8 grid gap-3 text-sm text-porcelain/70"><p className="flex items-center gap-3"><ShieldCheck className="h-5 w-5 text-gold" /> GDPR-aware: plats delas bara efter aktivt val.</p><p className="flex items-center gap-3"><Mail className="h-5 w-5 text-gold" /> {user ? "Din förfrågan sparas även på din profil." : "Logga in för att spara bokningen på din profil."}</p></div></div><div className="grid gap-5 xl:grid-cols-[1fr_.88fr]"><form onSubmit={submit} className="rounded-[2rem] border border-porcelain/10 bg-porcelain/8 p-5 shadow-2xl backdrop-blur-xl md:p-7"><div className="mb-6 flex items-center justify-between"><div><p className="text-xs uppercase tracking-[.28em] text-gold">Step 1 / Request</p><h3 className="display mt-2 text-3xl font-normal uppercase">Bokningsdetaljer</h3></div><span className="rounded-full border border-gold/30 px-3 py-1 text-[10px] font-bold uppercase tracking-[.22em] text-gold">Draft</span></div><div className="grid gap-4"><div><label className="mb-2 block text-sm font-bold text-porcelain/80">Tjänst</label><div className="grid grid-cols-2 gap-2">{serviceOptions.map((service) => <button type="button" key={service} onClick={() => setField("service", service)} className={`rounded-2xl border px-3 py-3 text-sm font-bold transition ${draft.service === service ? "border-gold bg-gold text-ink" : "border-porcelain/10 bg-porcelain/6 text-porcelain/80"}`}>{service}</button>)}</div></div><div className="grid gap-4 sm:grid-cols-2"><Field label="Område / stad" value={draft.area} onChange={(v) => setField("area", v)} placeholder="Stockholm, Södertälje..." /><Field label="Storlek kvm" value={draft.size} onChange={(v) => setField("size", v.replace(/[^0-9]/g, ""))} placeholder="75" /></div><div><label className="mb-2 block text-sm font-bold text-porcelain/80">Adress</label><div className="flex gap-2"><input value={draft.address} onChange={(e) => setField("address", e.target.value)} className="min-w-0 flex-1 rounded-2xl border border-porcelain/10 bg-porcelain px-4 py-4 text-ink placeholder:text-ink/45 outline-none" placeholder="Gatuadress" /><button type="button" onClick={useLocation} className="grid h-14 w-14 shrink-0 place-items-center rounded-2xl border border-gold/30 text-gold">{locating ? <Loader2 className="h-5 w-5 animate-spin" /> : <LocateFixed className="h-5 w-5" />}</button></div></div><div className="grid gap-4 sm:grid-cols-2"><Field label="Önskat datum" type="date" value={draft.date} onChange={(v) => setField("date", v)} /><Select label="Tidsfönster" value={draft.timeWindow} options={timeOptions} onChange={(v) => setField("timeWindow", v)} /></div><Select label="Frekvens" value={draft.frequency} options={frequencyOptions} onChange={(v) => setField("frequency", v)} /><div className="grid gap-4 sm:grid-cols-2"><Field label="Namn" value={draft.name} onChange={(v) => setField("name", v)} placeholder="För- och efternamn" /><Field label="E-post" value={draft.email} onChange={(v) => setField("email", v)} placeholder="namn@email.se" type="email" /></div><Field label="Telefon" value={draft.phone} onChange={(v) => setField("phone", v)} placeholder="+46 ..." type="tel" /><textarea value={draft.notes} onChange={(e) => setField("notes", e.target.value)} className="min-h-28 w-full rounded-2xl border border-porcelain/10 bg-porcelain px-4 py-4 text-ink placeholder:text-ink/45 outline-none" placeholder="Särskilda önskemål..." /><button disabled={status === "loading"} className="btn-primary w-full bg-gold text-ink hover:bg-porcelain">{status === "loading" ? <Loader2 className="h-5 w-5 animate-spin" /> : <Send className="h-5 w-5" />} Skicka bokningsförfrågan</button>{message && <p className={`rounded-2xl px-4 py-3 text-sm ${status === "success" ? "bg-gold/20 text-gold" : status === "error" ? "bg-red-500/10 text-red-200" : "bg-porcelain/10 text-porcelain/70"}`}>{message}</p>}</div></form><aside className="rounded-[2rem] border border-porcelain/10 bg-cream p-5 text-ink shadow-2xl md:p-7"><div className="mb-6 flex items-center justify-between"><div><p className="text-xs font-bold uppercase tracking-[.28em] text-burgundy/60">Live summary</p><h3 className="display mt-2 text-3xl font-normal uppercase text-burgundy">CleanAI draft</h3></div><button onClick={() => navigator.clipboard.writeText(summary)} className="grid h-11 w-11 place-items-center rounded-full border border-burgundy/15 bg-porcelain text-burgundy"><Copy className="h-4 w-4" /></button></div><pre className="max-h-[420px] overflow-auto whitespace-pre-wrap rounded-[1.5rem] border border-burgundy/10 bg-porcelain/70 p-5 text-sm leading-7 text-ink/70">{summary}</pre></aside></div></div></section>

      <footer className="border-t border-gold/10 bg-night py-10"><div className="luxe-container flex flex-col gap-6 md:flex-row md:items-center md:justify-between"><div><p className="display text-4xl font-normal uppercase text-gold">Iboren</p><p className="mt-1 text-[10px] font-bold uppercase tracking-[.32em] text-porcelain/45">Smart städbokning med AI i Sverige</p></div><div className="flex flex-wrap gap-4 text-sm font-semibold text-porcelain/60"><Link href="/profile" className="hover:text-gold">Min profil</Link><Link href="/privacy" className="hover:text-gold">Privacy</Link><Link href="/terms" className="hover:text-gold">Terms</Link><a href="mailto:hej@iboren.se" className="hover:text-gold">hej@iboren.se</a></div></div></footer>
    </main>
  );
}

function Field({ label, value, onChange, placeholder, type = "text" }: { label: string; value: string; onChange: (value: string) => void; placeholder?: string; type?: string }) {
  return <label className="block"><span className="mb-2 block text-sm font-bold text-porcelain/80">{label}</span><input type={type} value={value} onChange={(event) => onChange(event.target.value)} className="w-full rounded-2xl border border-porcelain/10 bg-porcelain px-4 py-4 text-ink placeholder:text-ink/45 outline-none" placeholder={placeholder} /></label>;
}

function Select({ label, value, options, onChange }: { label: string; value: string; options: string[]; onChange: (value: string) => void }) {
  return <label className="block"><span className="mb-2 block text-sm font-bold text-porcelain/80">{label}</span><select value={value} onChange={(event) => onChange(event.target.value)} className="w-full rounded-2xl border border-porcelain/10 bg-porcelain px-4 py-4 text-ink outline-none">{options.map((option) => <option key={option} value={option}>{option}</option>)}</select></label>;
}
