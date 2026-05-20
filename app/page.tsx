"use client";

import { FormEvent, useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { ArrowUpRight, Building2, CheckCircle2, Copy, Home, LocateFixed, Loader2, Mail, Menu, Send, ShieldCheck, Truck, UserRound, X } from "lucide-react";
import { createClient, User } from "@supabase/supabase-js";

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

const frames = [
  { counter: "01 / 06", kicker: "HEM · FÖRE", title: "Före städningen", body: "Ett hem innan återställningen: rörigt, tungt och svårt att slappna av i.", image: "/cinematic/01-home-before.webp" },
  { counter: "02 / 06", kicker: "STÄDNING · PÅGÅR", title: "Arbetet börjar", body: "Yta för yta återställs med metod, rytm och precision.", image: "/cinematic/02-home-cleaner.webp" },
  { counter: "03 / 06", kicker: "HEM · EFTER", title: "Lugnet efteråt", body: "Ett rent, ljust och lugnt hem där allt känns lättare.", image: "/cinematic/03-home-after.webp" },
  { counter: "04 / 06", kicker: "KONTOR · FÖRE", title: "När arbetsplatsen behöver lyftas", body: "Kontoret innan städning: ytor, detaljer och saker som tar fokus.", image: "/cinematic/04-office-before.webp" },
  { counter: "05 / 06", kicker: "KONTOR · PÅGÅR", title: "Yta för yta", body: "Arbetsytor, mötesrum och entré återställs utan att störa verksamheten.", image: "/cinematic/05-office-cleaner.webp" },
  { counter: "06 / 06", kicker: "KLART · EFTER", title: "Redo igen", body: "En renare arbetsplats, redo för fokus, kunder och nästa produktiva dag.", image: "/cinematic/06-office-after.webp" }
];

const services = [
  { icon: Home, title: "Hemstädning", href: "/hemstadning", price: "från 255 kr/tim efter RUT", body: "För återkommande eller enstaka städning hemma." },
  { icon: Truck, title: "Flyttstädning", href: "/flyttstadning", price: "pris efter yta", body: "För flytt, överlämning och tydlig checklista." },
  { icon: Building2, title: "Kontorsstädning", href: "/kontorsstadning", price: "skräddarsydd offert", body: "För företag, lokaler och återkommande service." }
];

const serviceOptions = ["Hemstädning", "Flyttstädning", "Kontorsstädning", "Fönsterputs"];
const frequencyOptions = ["Engång", "Varje vecka", "Varannan vecka", "Varje månad"];
const timeOptions = ["Morgon", "Förmiddag", "Eftermiddag", "Kväll", "Flexibel"];
const propertyTypes = ["Lägenhet", "Villa", "Radhus", "Kontor", "Annat"];
const yesNoOptions = ["Ja", "Nej", "Vet ej"];
const extraOptions = ["Fönsterputs", "Ugn", "Kyl/frys", "Balkong", "Grovstädning", "Skåp/lådor"];
const trustBadges = ["RUT-avdrag", "Tydliga priser", "Flexibel bokning", "Snabb återkoppling"];

function getSupabase() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !key) return null;
  return createClient(url, key);
}

function buildBookingNotes(draft: BookingDraft) {
  const details = [
    "--- Objekt & detaljer ---",
    `Typ av objekt: ${draft.propertyType || "Ej ifyllt"}`,
    `Antal rum: ${draft.rooms || "Ej ifyllt"}`,
    `Antal badrum: ${draft.bathrooms || "Ej ifyllt"}`,
    `Husdjur: ${draft.pets || "Ej ifyllt"}`,
    `Våning: ${draft.floor || "Ej ifyllt"}`,
    `Hiss: ${draft.elevator || "Ej ifyllt"}`,
    `Parkering: ${draft.parking || "Ej ifyllt"}`,
    `Extra tjänster: ${draft.extras.length ? draft.extras.join(", ") : "Inga valda"}`
  ];

  if (draft.notes.trim()) {
    details.push("", "--- Kundens önskemål ---", draft.notes.trim());
  }

  return details.join("\n");
}

export default function HomePage() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [draft, setDraft] = useState(initialDraft);
  const [locating, setLocating] = useState(false);
  const [message, setMessage] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [user, setUser] = useState<User | null>(null);
  const [activeFrame, setActiveFrame] = useState(0);
  const wheelLock = useRef(false);
  const touchStartY = useRef<number | null>(null);

  useEffect(() => {
    const supabase = getSupabase();
    if (!supabase) return;
    supabase.auth.getUser().then(({ data }) => {
      if (!data.user) return;
      const fullName = data.user.user_metadata?.full_name || data.user.user_metadata?.name || "";
      setUser(data.user);
      setDraft((current) => ({ ...current, name: current.name || fullName, email: current.email || data.user?.email || "" }));
    });
    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => setUser(session?.user ?? null));
    return () => listener.subscription.unsubscribe();
  }, []);

  const activeScene = frames[activeFrame];
  const progress = (activeFrame + 1) / frames.length;
  const fullBookingNotes = useMemo(() => buildBookingNotes(draft), [draft]);

  function stepFrame(direction: 1 | -1) {
    setActiveFrame((current) => Math.max(0, Math.min(frames.length - 1, current + direction)));
  }

  function handleCinematicWheel(event: React.WheelEvent<HTMLElement>) {
    const down = event.deltaY > 0;
    const up = event.deltaY < 0;
    const canGoNext = down && activeFrame < frames.length - 1;
    const canGoPrev = up && activeFrame > 0;
    if (!canGoNext && !canGoPrev) return;
    event.preventDefault();
    if (wheelLock.current) return;
    wheelLock.current = true;
    stepFrame(down ? 1 : -1);
    window.setTimeout(() => { wheelLock.current = false; }, 520);
  }

  function handleTouchStart(event: React.TouchEvent<HTMLElement>) {
    touchStartY.current = event.touches[0]?.clientY ?? null;
  }

  function handleTouchEnd(event: React.TouchEvent<HTMLElement>) {
    if (touchStartY.current === null) return;
    const endY = event.changedTouches[0]?.clientY ?? touchStartY.current;
    const delta = touchStartY.current - endY;
    touchStartY.current = null;
    if (Math.abs(delta) < 40) return;
    if (delta > 0 && activeFrame < frames.length - 1) stepFrame(1);
    if (delta < 0 && activeFrame > 0) stepFrame(-1);
  }

  const summary = useMemo(() => [
    `Tjänst: ${draft.service || "—"}`,
    `Område: ${draft.area || "—"}`,
    `Adress: ${draft.address || "Ej ifylld"}`,
    `Storlek: ${draft.size ? `${draft.size} kvm` : "Ej ifylld"}`,
    `Typ av objekt: ${draft.propertyType}`,
    `Antal rum: ${draft.rooms || "Ej ifyllt"}`,
    `Antal badrum: ${draft.bathrooms || "Ej ifyllt"}`,
    `Husdjur: ${draft.pets}`,
    `Våning: ${draft.floor || "Ej ifyllt"}`,
    `Hiss: ${draft.elevator}`,
    `Parkering: ${draft.parking}`,
    `Extra tjänster: ${draft.extras.length ? draft.extras.join(", ") : "Inga valda"}`,
    `Frekvens: ${draft.frequency}`,
    `Datum: ${draft.date || "Ej valt"}`,
    `Tid: ${draft.timeWindow}`,
    `Namn: ${draft.name || "Ej ifyllt"}`,
    `E-post: ${draft.email || "Ej ifylld"}`,
    `Telefon: ${draft.phone || "Ej ifylld"}`,
    `Önskemål: ${draft.notes || "—"}`
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
      setMessage("Din webbläsare stödjer inte platsdelning. Fyll i adress manuellt.");
      return;
    }
    setLocating(true);
    setMessage("Hämtar din position och försöker fylla i adressen...");
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;
        try {
          const result = await reverseGeocode(latitude, longitude);
          setDraft((current) => ({ ...current, address: result.address || current.address, area: result.area || current.area }));
          setMessage(result.address ? "Adress hämtad automatiskt. Kontrollera att den stämmer innan du skickar." : "Position hämtad, men adress kunde inte tolkas. Fyll i adress manuellt.");
        } catch {
          setMessage("Position hämtad, men adress kunde inte hämtas automatiskt. Fyll i adress manuellt.");
        } finally {
          setLocating(false);
        }
      },
      () => { setMessage("Platsdelning nekades. Det går bra att skriva adressen manuellt."); setLocating(false); },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 30000 }
    );
  }

  async function saveBookingToDatabase() {
    return;
  }

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!draft.name || !draft.email || !draft.phone || !draft.area || !draft.address || !draft.size || !draft.rooms || !draft.bathrooms || !draft.date) {
      setStatus("error");
      setMessage("Fyll i namn, e-post, telefon, område, adress, storlek, antal rum, antal badrum och datum innan du skickar.");
      return;
    }
    setStatus("loading");
    setMessage("");
    try {
      await saveBookingToDatabase();
      const response = await fetch("/api/bookings", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ ...draft, notes: fullBookingNotes }) });
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
    <main className="min-h-screen overflow-x-hidden bg-night text-porcelain">
      <header className="fixed inset-x-0 top-0 z-50 border-b border-gold/10 bg-night/80 backdrop-blur-2xl">
        <nav className="luxe-container flex h-20 items-center justify-between">
          <a href="#top" className="group flex items-center" onClick={() => setMenuOpen(false)} aria-label="Iboren startsida">
            <span className="sr-only">Iboren</span>
            <span className="flex flex-col leading-none">
              <span className="display block text-4xl font-semibold tracking-wide text-porcelain md:text-5xl">Iboren</span>
              <span className="mt-1 block text-[10px] font-bold uppercase tracking-[0.36em] text-gold/75 md:text-[11px]">Pris direkt & enkel bokning</span>
            </span>
          </a>
          <div className="hidden items-center gap-6 text-sm font-semibold text-porcelain/68 md:flex">
            <a href="#services" className="hover:text-gold">Tjänster</a>
            <Link href="/priser" className="hover:text-gold">Priser</Link>
            <a href="#booking" className="hover:text-gold">Boka</a>
            <Link href="/jobb" className="hover:text-gold">Jobba hos oss</Link>
            <Link href="/om-iboren" className="hover:text-gold">Om oss</Link>
            <Link href="/en" className="hover:text-gold">EN</Link>
            <Link href={user ? "/profile" : "/login"} className="inline-flex items-center gap-2 hover:text-gold"><UserRound size={17} /> {user ? "Min profil" : "Logga in"}</Link>
            <a href="#booking" className="rounded-full border border-gold/40 bg-gold px-5 py-3 text-night">Boka städning</a>
          </div>
          <button onClick={() => setMenuOpen(!menuOpen)} className="grid h-11 w-11 place-items-center rounded-full border border-gold/25 bg-porcelain/5 text-gold md:hidden">{menuOpen ? <X size={19} /> : <Menu size={19} />}</button>
        </nav>
        {menuOpen && <div className="border-t border-gold/10 bg-night/95 px-4 pb-6 md:hidden"><div className="mx-auto grid max-w-sm gap-2 pt-2 text-porcelain"><a href="#services" onClick={() => setMenuOpen(false)} className="rounded-2xl px-4 py-3 font-semibold">Tjänster</a><Link href="/priser" onClick={() => setMenuOpen(false)} className="rounded-2xl px-4 py-3 font-semibold">Priser</Link><a href="#booking" onClick={() => setMenuOpen(false)} className="rounded-2xl px-4 py-3 font-semibold">Boka</a><Link href="/jobb" onClick={() => setMenuOpen(false)} className="rounded-2xl px-4 py-3 font-semibold">Jobba hos oss</Link><Link href="/om-iboren" onClick={() => setMenuOpen(false)} className="rounded-2xl px-4 py-3 font-semibold">Om oss</Link><Link href="/en" onClick={() => setMenuOpen(false)} className="rounded-2xl px-4 py-3 font-semibold">English</Link><Link href={user ? "/profile" : "/login"} className="rounded-2xl px-4 py-3 font-semibold">{user ? "Min profil" : "Logga in"}</Link><a href="#booking" onClick={() => setMenuOpen(false)} className="mt-2 rounded-full bg-gold px-5 py-4 text-center text-sm font-bold text-night">Boka städning</a></div></div>}
      </header>

      <section id="top" className="relative grid min-h-screen place-items-center overflow-hidden px-5 pt-28 text-center">
        <img src={frames[2].image} alt="Rent hem" className="absolute inset-0 h-full w-full object-cover" />
        <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(2,5,4,.58),rgba(2,5,4,.16)_48%,rgba(2,5,4,.62)),radial-gradient(circle_at_center,transparent_0_38%,rgba(0,0,0,.34)_100%)]" />
        <div className="relative z-10 mx-auto max-w-6xl">
          <p className="text-[11px] font-bold uppercase tracking-[0.44em] text-gold/90">Södertälje · Stockholm · RUT-avdrag</p>
          <h1 className="display mt-6 text-[clamp(3.8rem,10vw,9rem)] font-normal uppercase leading-[.86] tracking-[.01em] text-porcelain">Städning i Södertälje och Stockholm</h1>
          <p className="mx-auto mt-7 max-w-3xl text-lg leading-8 text-porcelain/86 md:text-2xl">Få hjälp med hemstädning, flyttstädning, kontorsstädning och fönsterputs. Beräkna ditt pris online och boka enkelt när det passar dig.</p>
          {user && <p className="mt-5 inline-flex rounded-full border border-gold/25 bg-night/50 px-4 py-2 text-sm font-bold text-gold">Inloggad som {user.email}</p>}
          <div className="mt-8 flex flex-wrap items-center justify-center gap-2">{trustBadges.map((badge) => <span key={badge} className="rounded-full border border-gold/25 bg-night/45 px-4 py-2 text-xs font-bold uppercase tracking-[.18em] text-gold">{badge}</span>)}</div>
          <div className="mt-10 flex flex-col items-center justify-center gap-3 sm:flex-row"><Link href="/priser" className="btn-primary">Beräkna pris <ArrowUpRight size={17} /></Link><a href="#booking" className="btn-secondary">Logga in och boka</a></div>
          <div className="mt-10 inline-flex items-center gap-4 text-[11px] font-bold uppercase tracking-[0.32em] text-gold/75 before:h-px before:w-10 before:bg-gold/40 after:h-px after:w-10 after:bg-gold/40">Se före och efter</div>
        </div>
      </section>

      <section id="cinematic-scroll" onWheel={handleCinematicWheel} onTouchStart={handleTouchStart} onTouchEnd={handleTouchEnd} className="relative h-screen min-h-screen overflow-hidden bg-night">
        <div className="relative h-screen min-h-screen overflow-hidden bg-night">
          {frames.map((frame, index) => <img key={frame.counter} src={frame.image} alt={frame.title} style={{ opacity: activeFrame === index ? 1 : 0, transform: activeFrame === index ? "scale(1)" : "scale(1.04)", zIndex: activeFrame === index ? 2 : 1 }} className="absolute inset-0 h-full w-full object-cover transition-all duration-700 ease-out" />)}
          <div className="absolute inset-0 z-10 bg-[linear-gradient(90deg,rgba(2,5,4,.50),rgba(2,5,4,.06)_48%,rgba(2,5,4,.50)),radial-gradient(circle_at_52%_46%,transparent_0_42%,rgba(0,0,0,.34)_100%)]" />
          <div className="absolute left-5 right-5 top-24 z-20 flex items-start justify-between md:left-[8vw] md:right-[8vw] md:top-[12vh]"><div><p className="text-[10px] font-black uppercase tracking-[.34em] text-gold/85">{activeScene.kicker}</p><p className="display mt-1 text-4xl font-normal uppercase tracking-[.02em] text-porcelain md:text-6xl">{activeScene.counter}</p></div><div className="h-24 w-1 overflow-hidden rounded-full bg-porcelain/15"><div className="w-full rounded-full bg-gold transition-all" style={{ height: `${Math.round(progress * 100)}%` }} /></div></div>
          <div className="absolute inset-x-0 bottom-12 z-20 px-5 md:bottom-20"><div className="luxe-container"><h2 className="display max-w-4xl text-[clamp(3rem,8vw,7rem)] font-normal uppercase leading-[.84] tracking-[.02em] text-porcelain">{activeScene.title}</h2><p className="mt-5 max-w-2xl text-base leading-8 text-porcelain/86 md:text-xl">{activeScene.body}</p><div className="mt-7 flex flex-wrap gap-3">{activeFrame > 0 && <button type="button" onClick={() => stepFrame(-1)} className="rounded-full border border-gold/40 px-5 py-3 text-[11px] font-bold uppercase tracking-[.22em] text-gold">Föregående</button>}{activeFrame < frames.length - 1 ? <button type="button" onClick={() => stepFrame(1)} className="rounded-full border border-gold/50 bg-gold/10 px-5 py-3 text-[11px] font-bold uppercase tracking-[.22em] text-gold backdrop-blur hover:bg-gold hover:text-night">Nästa bild</button> : <a href="#booking" className="rounded-full border border-gold/50 bg-gold/10 px-5 py-3 text-[11px] font-bold uppercase tracking-[.22em] text-gold backdrop-blur hover:bg-gold hover:text-night">Boka städning</a>}</div></div></div>
        </div>
      </section>

      <section id="services" className="bg-night py-24 md:py-32"><div className="luxe-container"><p className="text-[11px] font-bold uppercase tracking-[.38em] text-gold">I / Tjänster</p><h2 className="display mt-4 max-w-4xl text-5xl font-normal uppercase leading-[.9] text-porcelain md:text-7xl">Städtjänster för hem och företag.</h2><div className="mt-12 grid gap-5 md:grid-cols-3">{services.map((service, index) => { const Icon = service.icon; return <Link href={service.href} key={service.title} className="group relative overflow-hidden rounded-[2rem] border border-gold/15 bg-porcelain/[.035] p-7 shadow-[0_28px_90px_rgba(0,0,0,.22)] transition hover:-translate-y-1 hover:border-gold/40"><div className="mb-20 flex items-start justify-between"><div className="grid h-14 w-14 place-items-center rounded-full border border-gold/30 bg-gold/10 text-gold"><Icon size={25} /></div><span className="rounded-full border border-gold/20 px-3 py-1 text-[10px] font-bold uppercase tracking-[.2em] text-gold/80">{service.price}</span></div><p className="mb-3 text-[11px] font-bold uppercase tracking-[.28em] text-porcelain/42">0{index + 1}</p><h3 className="display text-4xl font-normal uppercase text-porcelain">{service.title}</h3><p className="mt-4 leading-7 text-porcelain/62">{service.body}</p></Link>; })}</div></div></section>

      <section id="process" className="bg-porcelain py-24 text-ink md:py-32"><div className="luxe-container"><p className="eyebrow">II / Så fungerar det</p><h2 className="display mt-4 max-w-4xl text-5xl font-normal uppercase leading-[.9] text-burgundy md:text-7xl">Fyra steg. En tydlig bokning.</h2><div className="mt-12 grid gap-4 md:grid-cols-4">{["Välj tjänst", "Fyll i plats", "Se sammanfattning", "Skicka förfrågan"].map((item, i) => <article key={item} className="rounded-[2rem] border border-burgundy/10 bg-cream p-6 shadow-sm transition hover:-translate-y-1 hover:shadow-soft"><div className="mb-10 flex items-center justify-between"><span className="display text-4xl text-burgundy/55">0{i + 1}</span><CheckCircle2 className="text-burgundy" /></div><h3 className="display text-3xl font-normal uppercase">{item}</h3><p className="mt-4 text-sm leading-7 text-ink/60">Ett enkelt steg som gör bokningsunderlaget tydligare och lättare att följa upp.</p></article>)}</div></div></section>

      <section id="booking" className="bg-ink py-24 text-porcelain md:py-32"><div className="luxe-container grid gap-10 lg:grid-cols-[.82fr_1.18fr]"><div><p className="mb-4 text-[11px] font-bold uppercase tracking-[.38em] text-gold">Bokning</p><h2 className="display text-5xl font-normal uppercase leading-[.9] md:text-7xl">Skapa en tydlig bokningsförfrågan.</h2><p className="mt-6 max-w-xl text-lg leading-8 text-porcelain/70">Formuläret samlar rätt information direkt: tjänst, plats, storlek, rum, datum, kontakt och särskilda önskemål.</p><div className="mt-8 grid gap-3 text-sm text-porcelain/70"><p className="flex items-center gap-3"><ShieldCheck className="h-5 w-5 text-gold" /> Plats delas bara efter aktivt val.</p><p className="flex items-center gap-3"><Mail className="h-5 w-5 text-gold" /> {user ? "Din förfrågan sparas även på din profil." : "Logga in för att boka och spara förfrågan på din profil."}</p></div></div><div className="grid gap-5 xl:grid-cols-[1fr_.88fr]"><form onSubmit={submit} className="rounded-[2rem] border border-porcelain/10 bg-porcelain/8 p-5 shadow-2xl backdrop-blur-xl md:p-7"><div className="mb-6 flex items-center justify-between"><div><p className="text-xs uppercase tracking-[.28em] text-gold">Steg 1 / Förfrågan</p><h3 className="display mt-2 text-3xl font-normal uppercase">Bokningsdetaljer</h3></div><span className="rounded-full border border-gold/30 px-3 py-1 text-[10px] font-bold uppercase tracking-[.22em] text-gold">Utkast</span></div><div className="grid gap-4"><div><label className="mb-2 block text-sm font-bold text-porcelain/80">Tjänst</label><div className="grid grid-cols-2 gap-2">{serviceOptions.map((service) => <button type="button" key={service} onClick={() => setField("service", service)} className={`rounded-2xl border px-3 py-3 text-sm font-bold transition ${draft.service === service ? "border-gold bg-gold text-ink" : "border-porcelain/10 bg-porcelain/6 text-porcelain/80"}`}>{service}</button>)}</div></div><div className="grid gap-4 sm:grid-cols-2"><Field label="Område / stad" value={draft.area} onChange={(v) => setField("area", v)} placeholder="Stockholm, Södertälje..." /><Field label="Storlek kvm" value={draft.size} onChange={(v) => setField("size", v.replace(/[^0-9]/g, ""))} placeholder="75" /></div><div><label className="mb-2 block text-sm font-bold text-porcelain/80">Adress</label><div className="flex gap-2"><input value={draft.address} onChange={(e) => setField("address", e.target.value)} className="min-w-0 flex-1 rounded-2xl border border-porcelain/10 bg-porcelain px-4 py-4 text-ink placeholder:text-ink/45 outline-none" placeholder="Gatuadress" /><button type="button" onClick={useLocation} className="grid h-14 w-14 shrink-0 place-items-center rounded-2xl border border-gold/30 text-gold">{locating ? <Loader2 className="h-5 w-5 animate-spin" /> : <LocateFixed className="h-5 w-5" />}</button></div></div><div className="rounded-[1.5rem] border border-gold/15 bg-night/30 p-4"><p className="mb-4 text-xs font-bold uppercase tracking-[.28em] text-gold">Objekt & detaljer</p><div className="grid gap-4 sm:grid-cols-2"><Select label="Typ av objekt" value={draft.propertyType} options={propertyTypes} onChange={(v) => setField("propertyType", v)} /><Field label="Antal rum" value={draft.rooms} onChange={(v) => setField("rooms", v.replace(/[^0-9]/g, ""))} placeholder="3" /><Field label="Antal badrum" value={draft.bathrooms} onChange={(v) => setField("bathrooms", v.replace(/[^0-9]/g, ""))} placeholder="1" /><Select label="Husdjur" value={draft.pets} options={yesNoOptions} onChange={(v) => setField("pets", v)} /><Field label="Våning" value={draft.floor} onChange={(v) => setField("floor", v)} placeholder="3" /><Select label="Hiss" value={draft.elevator} options={yesNoOptions} onChange={(v) => setField("elevator", v)} /><Select label="Parkering" value={draft.parking} options={yesNoOptions} onChange={(v) => setField("parking", v)} /></div></div><div><label className="mb-2 block text-sm font-bold text-porcelain/80">Extra tjänster</label><div className="grid grid-cols-2 gap-2 sm:grid-cols-3">{extraOptions.map((extra) => <button type="button" key={extra} onClick={() => toggleExtra(extra)} className={`rounded-2xl border px-3 py-3 text-sm font-bold transition ${draft.extras.includes(extra) ? "border-gold bg-gold text-ink" : "border-porcelain/10 bg-porcelain/6 text-porcelain/80"}`}>{extra}</button>)}</div></div><div className="grid gap-4 sm:grid-cols-2"><Field label="Önskat datum" type="date" value={draft.date} onChange={(v) => setField("date", v)} /><Select label="Tidsfönster" value={draft.timeWindow} options={timeOptions} onChange={(v) => setField("timeWindow", v)} /></div><Select label="Frekvens" value={draft.frequency} options={frequencyOptions} onChange={(v) => setField("frequency", v)} /><div className="grid gap-4 sm:grid-cols-2"><Field label="Namn" value={draft.name} onChange={(v) => setField("name", v)} placeholder="För- och efternamn" /><Field label="E-post" value={draft.email} onChange={(v) => setField("email", v)} placeholder="namn@email.se" type="email" /></div><Field label="Telefon" value={draft.phone} onChange={(v) => setField("phone", v)} placeholder="+46 ..." type="tel" /><textarea value={draft.notes} onChange={(e) => setField("notes", e.target.value)} className="min-h-28 w-full rounded-2xl border border-porcelain/10 bg-porcelain px-4 py-4 text-ink placeholder:text-ink/45 outline-none" placeholder="Särskilda önskemål..." /><button disabled={status === "loading"} className="btn-primary w-full bg-gold text-ink hover:bg-porcelain">{status === "loading" ? <Loader2 className="h-5 w-5 animate-spin" /> : <Send className="h-5 w-5" />} Skicka bokningsförfrågan</button>{message && <p className={`rounded-2xl px-4 py-3 text-sm ${status === "success" ? "bg-gold/20 text-gold" : status === "error" ? "bg-red-500/10 text-red-200" : "bg-porcelain/10 text-porcelain/70"}`}>{message}</p>}</div></form><aside className="rounded-[2rem] border border-porcelain/10 bg-cream p-5 text-ink shadow-2xl md:p-7"><div className="mb-6 flex items-center justify-between"><div><p className="text-xs font-bold uppercase tracking-[.28em] text-burgundy/60">Sammanfattning</p><h3 className="display mt-2 text-3xl font-normal uppercase text-burgundy">Bokningsutkast</h3></div><button onClick={() => navigator.clipboard.writeText(summary)} className="grid h-11 w-11 place-items-center rounded-full border border-burgundy/15 bg-porcelain text-burgundy"><Copy className="h-4 w-4" /></button></div><pre className="max-h-[520px] overflow-auto whitespace-pre-wrap rounded-[1.5rem] border border-burgundy/10 bg-porcelain/70 p-5 text-sm leading-7 text-ink/70">{summary}</pre></aside></div></div></section>

      <footer className="border-t border-gold/10 bg-night py-10"><div className="luxe-container grid gap-8 md:grid-cols-[1.1fr_1fr_1fr]"><div><p className="display text-4xl font-normal uppercase text-gold">Iboren</p><p className="mt-2 max-w-sm text-sm leading-7 text-porcelain/65">Städning i Södertälje och Stockholm med tydlig prisbild, RUT-avdrag och enkel bokning.</p></div><div><p className="mb-3 text-xs font-black uppercase tracking-[.22em] text-gold">Tjänster</p><div className="grid gap-2 text-sm font-semibold text-porcelain/70"><Link href="/hemstadning" className="hover:text-gold">Hemstädning</Link><Link href="/flyttstadning" className="hover:text-gold">Flyttstädning</Link><Link href="/kontorsstadning" className="hover:text-gold">Kontorsstädning</Link><Link href="/fonsterputs" className="hover:text-gold">Fönsterputs</Link></div></div><div><p className="mb-3 text-xs font-black uppercase tracking-[.22em] text-gold">Iboren</p><div className="grid gap-2 text-sm font-semibold text-porcelain/70"><Link href="/priser" className="hover:text-gold">Priser</Link><Link href="/jobb" className="hover:text-gold">Jobba hos oss</Link><Link href="/om-iboren" className="hover:text-gold">Om oss</Link><Link href="/privacy" className="hover:text-gold">Privacy</Link><Link href="/terms" className="hover:text-gold">Terms</Link><a href="mailto:hej@iboren.se" className="hover:text-gold">hej@iboren.se</a></div></div></div></footer>
    </main>
  );
}

function Field({ label, value, onChange, placeholder, type = "text" }: { label: string; value: string; onChange: (value: string) => void; placeholder?: string; type?: string }) {
  return <label className="block"><span className="mb-2 block text-sm font-bold text-porcelain/80">{label}</span><input type={type} value={value} onChange={(event) => onChange(event.target.value)} className="w-full rounded-2xl border border-porcelain/10 bg-porcelain px-4 py-4 text-ink placeholder:text-ink/45 outline-none" placeholder={placeholder} /></label>;
}

function Select({ label, value, options, onChange }: { label: string; value: string; options: string[]; onChange: (value: string) => void }) {
  return <label className="block"><span className="mb-2 block text-sm font-bold text-porcelain/80">{label}</span><select value={value} onChange={(event) => onChange(event.target.value)} className="w-full rounded-2xl border border-porcelain/10 bg-porcelain px-4 py-4 text-ink outline-none">{options.map((option) => <option key={option} value={option}>{option}</option>)}</select></label>;
}
