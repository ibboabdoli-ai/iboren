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

const cinematicFrames = [
  {
    counter: "I / VI",
    kicker: "HOME · BEFORE",
    title: "The mess",
    body: "Vardagens röra syns direkt: ytor, detaljer och småsaker som skapar stress innan städningen börjar.",
    micro: "vardag · röra · stress",
    phase: "Hem",
    background: "radial-gradient(circle at 25% 28%, rgba(255,253,248,.78), transparent 0 11%, transparent 12%), radial-gradient(circle at 66% 35%, rgba(201,169,97,.72), transparent 0 9%, transparent 10%), radial-gradient(circle at 38% 68%, rgba(107,39,55,.9), transparent 0 13%, transparent 14%), linear-gradient(135deg, #2d2024 0%, #171717 46%, #4b342d 100%)"
  },
  {
    counter: "II / VI",
    kicker: "HOME · CLEANING",
    title: "The hands",
    body: "En metodisk reset: yta för yta, med rätt rytm, material och uppmärksamhet på detaljer.",
    micro: "method · care · detail",
    phase: "Hem",
    background: "radial-gradient(circle at 72% 25%, rgba(89,199,183,.82), transparent 0 16%, transparent 17%), radial-gradient(circle at 34% 58%, rgba(255,253,248,.72), transparent 0 12%, transparent 13%), linear-gradient(135deg, #071013 0%, #21302e 50%, #c9a961 140%)"
  },
  {
    counter: "III / VI",
    kicker: "HOME · AFTER",
    title: "The calm",
    body: "När hemmet är klart känns rummet lättare: renare ljus, lugnare ytor och mer energi tillbaka.",
    micro: "clean · bright · calm",
    phase: "Hem",
    background: "radial-gradient(circle at 50% 34%, rgba(255,253,248,.95), transparent 0 20%, transparent 21%), radial-gradient(circle at 70% 70%, rgba(201,169,97,.62), transparent 0 18%, transparent 19%), linear-gradient(135deg, #f5f0e8 0%, #d9c7ae 52%, #1f2c2b 125%)"
  },
  {
    counter: "IV / VI",
    kicker: "OFFICE · BEFORE",
    title: "The clutter",
    body: "På kontoret handlar städning om flow: mindre visuell friktion och bättre start på arbetsdagen.",
    micro: "office · noise · backlog",
    phase: "Kontor",
    background: "repeating-linear-gradient(90deg, rgba(255,253,248,.12) 0 1px, transparent 1px 70px), radial-gradient(circle at 24% 68%, rgba(107,39,55,.86), transparent 0 14%, transparent 15%), linear-gradient(135deg, #161616 0%, #30262a 50%, #0b1515 100%)"
  },
  {
    counter: "V / VI",
    kicker: "OFFICE · CLEANING",
    title: "The reset",
    body: "Arbetsytor, mötesrum och entré återställs utan att tappa känslan av en levande arbetsplats.",
    micro: "reset · surfaces · flow",
    phase: "Kontor",
    background: "radial-gradient(circle at 58% 40%, rgba(89,199,183,.75), transparent 0 18%, transparent 19%), radial-gradient(circle at 32% 62%, rgba(201,169,97,.75), transparent 0 12%, transparent 13%), linear-gradient(135deg, #020504 0%, #14302e 55%, #2a1d24 100%)"
  },
  {
    counter: "VI / VI",
    kicker: "OFFICE · AFTER",
    title: "Begin again",
    body: "En renare arbetsplats, redo för fokus, kunder, möten och nästa produktiva dag.",
    micro: "ready · open · professional",
    phase: "Kontor",
    background: "radial-gradient(circle at 42% 40%, rgba(255,253,248,.95), transparent 0 18%, transparent 19%), radial-gradient(circle at 75% 66%, rgba(89,199,183,.58), transparent 0 14%, transparent 15%), linear-gradient(135deg, #f5f0e8 0%, #d9d0c4 45%, #051514 125%)"
  }
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
    function updateCinematicScroll() {
      ticking = false;
      const section = document.getElementById("cinematic-scroll");
      if (!section) return;
      const scrollable = Math.max(1, section.offsetHeight - window.innerHeight);
      const progress = Math.max(0, Math.min(1, (window.scrollY - section.offsetTop) / scrollable));
      const index = Math.max(0, Math.min(cinematicFrames.length - 1, Math.floor(progress * cinematicFrames.length)));
      setScrollProgress(progress);
      setActiveFrame(index);
    }
    function onScroll() {
      if (!ticking) {
        ticking = true;
        window.requestAnimationFrame(updateCinematicScroll);
      }
    }
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    updateCinematicScroll();
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

  const activeScene = cinematicFrames[activeFrame];

  return (
    <main className="min-h-screen overflow-x-hidden bg-night text-porcelain">
      <header className="fixed inset-x-0 top-0 z-50 border-b border-gold/10 bg-night/72 backdrop-blur-2xl">
        <nav className="luxe-container flex h-20 items-center justify-between">
          <a href="#top" className="group flex items-center gap-3" onClick={() => setMenuOpen(false)}>
            <span className="grid h-11 w-11 place-items-center rounded-full border border-gold/35 bg-porcelain/5 text-gold transition group-hover:bg-gold group-hover:text-night"><span className="display text-2xl font-bold">I</span></span>
            <span><span className="display block text-3xl font-semibold tracking-wide text-porcelain">Iboren</span><span className="block text-[10px] font-bold uppercase tracking-[0.36em] text-gold/75">CleanAI booking</span></span>
          </a>
          <div className="hidden items-center gap-8 text-sm font-semibold text-porcelain/68 md:flex">
            <a href="#cinematic-scroll" className="hover:text-gold">Före / Efter</a>
            <a href="#services" className="hover:text-gold">Tjänster</a>
            <a href="#process" className="hover:text-gold">Så fungerar det</a>
            <Link href={user ? "/profile" : "/login"} className="inline-flex items-center gap-2 hover:text-gold"><UserRound size={17} /> {user ? "Min profil" : "Logga in"}</Link>
            <a href="#booking" className="rounded-full border border-gold/40 bg-gold px-5 py-3 text-night shadow-lg shadow-gold/10">Boka städning</a>
          </div>
          <button onClick={() => setMenuOpen(!menuOpen)} className="grid h-11 w-11 place-items-center rounded-full border border-gold/25 bg-porcelain/5 text-gold md:hidden">{menuOpen ? <X size={19} /> : <Menu size={19} />}</button>
        </nav>
        {menuOpen && <div className="border-t border-gold/10 bg-night/95 px-4 pb-6 md:hidden"><div className="mx-auto grid max-w-sm gap-2 pt-2 text-porcelain"><a href="#cinematic-scroll" onClick={() => setMenuOpen(false)} className="rounded-2xl px-4 py-3 font-semibold">Före / Efter</a><a href="#services" onClick={() => setMenuOpen(false)} className="rounded-2xl px-4 py-3 font-semibold">Tjänster</a><a href="#process" onClick={() => setMenuOpen(false)} className="rounded-2xl px-4 py-3 font-semibold">Så fungerar det</a><Link href={user ? "/profile" : "/login"} className="rounded-2xl px-4 py-3 font-semibold">{user ? "Min profil" : "Logga in"}</Link><a href="#booking" onClick={() => setMenuOpen(false)} className="mt-2 rounded-full bg-gold px-5 py-4 text-center text-sm font-bold text-night">Boka städning</a></div></div>}
      </header>

      <section id="top" className="relative grid min-h-screen place-items-center overflow-hidden px-5 pt-28 text-center">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_42%,rgba(89,199,183,.18),transparent_30%),radial-gradient(circle_at_74%_64%,rgba(201,169,97,.12),transparent_32%),linear-gradient(180deg,#071013_0%,#020504_100%)]" />
        <div className="absolute inset-[10vh_6vw] overflow-hidden border border-gold/15 opacity-75 shadow-[0_40px_140px_rgba(0,0,0,.55)]" style={{ background: cinematicFrames[2].background }} />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_0_30%,rgba(0,0,0,.45)_65%,rgba(0,0,0,.9)_100%)]" />
        <div className="relative z-10 mx-auto max-w-5xl">
          <p className="text-[11px] font-bold uppercase tracking-[0.44em] text-gold/90">Stockholm · cleaning ritual · est 2026</p>
          <h1 className="display mt-6 text-[clamp(5rem,16vw,13rem)] font-normal uppercase leading-[.78] tracking-[.03em] text-porcelain">Iboren</h1>
          <p className="mx-auto mt-7 max-w-3xl text-lg leading-8 text-porcelain/72 md:text-2xl">Rent hem. Klar arbetsplats. Mindre stress.</p>
          {user && <p className="mt-5 inline-flex rounded-full border border-gold/25 bg-night/50 px-4 py-2 text-sm font-bold text-gold">Inloggad som {user.email}</p>}
          <div className="mt-10 flex flex-col items-center justify-center gap-3 sm:flex-row"><a href="#cinematic-scroll" className="btn-primary bg-gold text-night hover:bg-porcelain">Se transformationen <ArrowUpRight size={17} /></a><a href="#booking" className="btn-secondary border-gold/35 bg-porcelain/5 text-gold hover:bg-gold hover:text-night">Boka direkt</a></div>
          <div className="mt-10 inline-flex items-center gap-4 text-[11px] font-bold uppercase tracking-[0.32em] text-gold/75 before:h-px before:w-10 before:bg-gold/40 after:h-px after:w-10 after:bg-gold/40">Scroll to begin</div>
        </div>
      </section>

      <section id="cinematic-scroll" className="relative h-[520vh] bg-night md:h-[620vh]">
        <div className="sticky top-0 h-screen overflow-hidden bg-[radial-gradient(circle_at_50%_48%,rgba(18,51,48,.55),transparent_36%),linear-gradient(180deg,#020504,#071013_50%,#020504)]">
          {cinematicFrames.map((frame, index) => <div key={`blur-${frame.counter}`} className={`absolute inset-0 scale-110 blur-3xl transition-opacity duration-500 ${activeFrame === index ? "opacity-70" : "opacity-0"}`} style={{ background: frame.background }} />)}
          <div className="absolute left-5 right-5 top-[92px] z-10 h-[calc(100vh-220px)] overflow-hidden border border-gold/20 bg-black/20 shadow-[0_40px_120px_rgba(0,0,0,.55)] md:left-[8vw] md:right-[8vw] md:top-[12vh] md:h-[68vh]">
            <span className="pointer-events-none absolute left-4 top-4 z-20 h-16 w-16 border-l border-t border-gold/70 md:h-24 md:w-24" />
            <span className="pointer-events-none absolute bottom-4 right-4 z-20 h-16 w-16 border-b border-r border-gold/70 md:h-24 md:w-24" />
            {cinematicFrames.map((frame, index) => <div key={frame.counter} className={`absolute inset-0 transition-all duration-500 ${activeFrame === index ? "scale-100 opacity-100" : "scale-[1.015] opacity-0"}`} style={{ background: frame.background }} />)}
            <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_58%_44%,transparent_0_33%,rgba(0,0,0,.14)_64%,rgba(0,0,0,.42)_100%),linear-gradient(90deg,rgba(0,0,0,.52),transparent_34%,transparent_66%,rgba(0,0,0,.26))]" />
          </div>
          <div className="absolute left-5 right-5 top-6 z-20 grid grid-cols-[1fr_auto] items-start gap-4 md:left-[8vw] md:right-[8vw] md:top-[7vh]">
            <div><p className="text-[10px] font-bold uppercase tracking-[.34em] text-gold/80">{activeScene.phase}</p><p className="display mt-1 text-4xl font-normal uppercase tracking-[.02em] text-porcelain md:text-6xl">{activeScene.counter}</p></div>
            <div className="h-24 w-1 overflow-hidden rounded-full bg-porcelain/15"><div className="w-full rounded-full bg-gold transition-all" style={{ height: `${Math.round(scrollProgress * 100)}%` }} /></div>
          </div>
          <div className="absolute inset-x-0 bottom-10 z-30 px-5 md:bottom-16">
            {cinematicFrames.map((frame, index) => <article key={`copy-${frame.counter}`} className={`luxe-container grid gap-6 transition-all duration-500 md:grid-cols-[1fr_220px] ${activeFrame === index ? "translate-y-0 opacity-100" : "pointer-events-none translate-y-6 opacity-0"}`}><div><p className="mb-3 text-[11px] font-bold uppercase tracking-[0.34em] text-gold/90">{frame.kicker}</p><h2 className="display text-[clamp(2.6rem,7vw,6rem)] font-normal uppercase leading-[.86] tracking-[.02em] text-porcelain">{frame.title}</h2><p className="mt-4 max-w-xl text-sm leading-7 text-porcelain/70 md:text-lg">{frame.body}</p>{index === cinematicFrames.length - 1 && <a href="#booking" className="mt-5 inline-flex rounded-full border border-gold/50 bg-gold/10 px-5 py-3 text-[11px] font-bold uppercase tracking-[.22em] text-gold backdrop-blur hover:bg-gold hover:text-night">boka städning</a>}</div><div className="hidden self-center text-right text-[11px] uppercase leading-7 tracking-[.22em] text-porcelain/50 md:block">◆<br />{frame.micro}</div></article>)}
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
