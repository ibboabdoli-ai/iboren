"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { ArrowUpRight, Building2, CheckCircle2, Home, Mail, Menu, ShieldCheck, Truck, UserRound, X } from "lucide-react";
import { createClient, User } from "@supabase/supabase-js";
// UnifiedBookingFormCore removed from this page to avoid rendering the embedded form on the Swedish homepage

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

const trustBadges = ["RUT-avdrag", "Prisindikation online", "Ej bindande förfrågan"];

function getSupabase() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !key) return null;
  return createClient(url, key);
}

export default function HomePage() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [activeFrame, setActiveFrame] = useState(0);
  const wheelLock = useRef(false);
  const touchStartY = useRef<number | null>(null);

  useEffect(() => {
    const supabase = getSupabase();
    if (!supabase) return;
    supabase.auth.getUser().then(({ data }) => {
      if (!data.user) return;
      setUser(data.user);
    });
    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => setUser(session?.user ?? null));
    return () => listener.subscription.unsubscribe();
  }, []);

  const activeScene = frames[activeFrame];
  const progress = (activeFrame + 1) / frames.length;

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
            <Link href="/boka-utan-konto" className="hover:text-gold">Boka</Link>
            <Link href="/jobb" className="hover:text-gold">Jobba hos oss</Link>
            <Link href="/om-iboren" className="hover:text-gold">Om oss</Link>
            <Link href="/en" className="hover:text-gold">EN</Link>
            <Link href={user ? "/profile" : "/login"} className="inline-flex items-center gap-2 hover:text-gold"><UserRound size={17} /> {user ? "Min profil" : "Logga in"}</Link>
            <Link href="/boka-utan-konto" className="rounded-full border border-gold/40 bg-gold px-5 py-3 text-night">Skicka förfrågan</Link>
          </div>
          <button onClick={() => setMenuOpen(!menuOpen)} className="grid h-11 w-11 place-items-center rounded-full border border-gold/25 bg-porcelain/5 text-gold md:hidden">{menuOpen ? <X size={19} /> : <Menu size={19} />}</button>
        </nav>
        {menuOpen && <div className="border-t border-gold/10 bg-night/95 px-4 pb-6 md:hidden"><div className="mx-auto grid max-w-sm gap-2 pt-2 text-porcelain"><a href="#services" onClick={() => setMenuOpen(false)} className="rounded-2xl px-4 py-3 font-semibold">Tjänster</a><Link href="/priser" onClick={() => setMenuOpen(false)} className="rounded-2xl px-4 py-3 font-semibold">Priser</Link><Link href="/boka-utan-konto" onClick={() => setMenuOpen(false)} className="rounded-2xl px-4 py-3 font-semibold">Boka</Link><Link href="/jobb" onClick={() => setMenuOpen(false)} className="rounded-2xl px-4 py-3 font-semibold">Jobba hos oss</Link><Link href="/om-iboren" onClick={() => setMenuOpen(false)} className="rounded-2xl px-4 py-3 font-semibold">Om oss</Link><Link href="/en" onClick={() => setMenuOpen(false)} className="rounded-2xl px-4 py-3 font-semibold">English</Link><Link href={user ? "/profile" : "/login"} className="rounded-2xl px-4 py-3 font-semibold">{user ? "Min profil" : "Logga in"}</Link><Link href="/boka-utan-konto" onClick={() => setMenuOpen(false)} className="mt-2 rounded-full bg-gold px-5 py-4 text-center text-sm font-bold text-night">Skicka förfrågan</Link></div></div>}
      </header>

      <section id="top" className="relative grid min-h-screen place-items-center overflow-hidden px-5 pt-28 text-center">
        <img src={frames[2].image} alt="Rent hem" loading="eager" decoding="async" fetchPriority="high" sizes="100vw" className="absolute inset-0 h-full w-full object-cover" />
        <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(2,5,4,.58),rgba(2,5,4,.16)_48%,rgba(2,5,4,.62)),radial-gradient(circle_at_center,transparent_0_38%,rgba(0,0,0,.34)_100%)]" />
        <div className="relative z-10 mx-auto max-w-6xl">
          <p className="text-[11px] font-bold uppercase tracking-[0.36em] text-gold/90 md:tracking-[0.44em]">Södertälje · Stockholm · RUT-avdrag</p>
          <h1 className="display mt-5 text-[clamp(3rem,12vw,8.5rem)] font-normal uppercase leading-[.9] tracking-[.01em] text-porcelain md:mt-6 md:leading-[.86]">Städning i Södertälje & Stockholm</h1>
          <p className="mx-auto mt-6 max-w-3xl text-base font-semibold leading-7 text-porcelain/88 md:mt-7 md:text-2xl md:leading-8">Hemstädning, flyttstädning, kontorsstädning och fönsterputs. Beräkna pris online och skicka en ej bindande förfrågan.</p>
          {user && <p className="mt-5 inline-flex rounded-full border border-gold/25 bg-night/50 px-4 py-2 text-sm font-bold text-gold">Inloggad som {user.email}</p>}
          <div className="mt-7 flex flex-wrap items-center justify-center gap-2 md:mt-8">{trustBadges.map((badge) => <span key={badge} className="rounded-full border border-gold/25 bg-night/45 px-3 py-2 text-[10px] font-bold uppercase tracking-[.16em] text-gold md:px-4 md:text-xs md:tracking-[.18em]">{badge}</span>)}</div>
          <div className="mt-9 flex flex-col items-center justify-center gap-3 sm:flex-row md:mt-10"><Link href="/priser" className="btn-primary">Beräkna pris <ArrowUpRight size={17} /></Link><Link href="/boka-utan-konto" className="btn-secondary">Skicka förfrågan</Link></div>
          <p className="mx-auto mt-5 max-w-xl text-sm font-bold leading-6 text-porcelain/75">Vi bekräftar alltid tid och slutligt pris innan förfrågan blir bindande.</p>
          <div className="mt-8 inline-flex items-center gap-4 text-[11px] font-bold uppercase tracking-[0.32em] text-gold/75 before:h-px before:w-10 before:bg-gold/40 after:h-px after:w-10 after:bg-gold/40 md:mt-10">Se före och efter</div>
        </div>
      </section>

      <section id="cinematic-scroll" onWheel={handleCinematicWheel} onTouchStart={handleTouchStart} onTouchEnd={handleTouchEnd} className="relative h-screen min-h-screen overflow-hidden bg-night">
        <div className="relative h-screen min-h-screen overflow-hidden bg-night">
          {frames.map((frame, index) => <img key={frame.counter} src={frame.image} alt={frame.title} loading={index === 0 ? "eager" : "lazy"} decoding="async" fetchPriority={index === 0 ? "auto" : "low"} sizes="100vw" style={{ opacity: activeFrame === index ? 1 : 0, transform: activeFrame === index ? "scale(1)" : "scale(1.04)", zIndex: activeFrame === index ? 2 : 1 }} className="absolute inset-0 h-full w-full object-cover transition-all duration-700 ease-out" />)}
          <div className="absolute inset-0 z-10 bg-[linear-gradient(90deg,rgba(2,5,4,.50),rgba(2,5,4,.06)_48%,rgba(2,5,4,.50)),radial-gradient(circle_at_52%_46%,transparent_0_42%,rgba(0,0,0,.34)_100%)]" />
          <div className="absolute left-5 right-5 top-24 z-20 flex items-start justify-between md:left-[8vw] md:right-[8vw] md:top-[12vh]"><div><p className="text-[10px] font-black uppercase tracking-[.34em] text-gold/85">{activeScene.kicker}</p><p className="display mt-1 text-4xl font-normal uppercase tracking-[.02em] text-porcelain md:text-6xl">{activeScene.counter}</p></div><div className="h-24 w-1 overflow-hidden rounded-full bg-porcelain/15"><div className="w-full rounded-full bg-gold transition-all" style={{ height: `${Math.round(progress * 100)}%` }} /></div></div>
          <div className="absolute inset-x-0 bottom-12 z-20 px-5 md:bottom-20"><div className="luxe-container"><h2 className="display max-w-4xl text-[clamp(3rem,8vw,7rem)] font-normal uppercase leading-[.84] tracking-[.02em] text-porcelain">{activeScene.title}</h2><p className="mt-5 max-w-2xl text-base leading-8 text-porcelain/86 md:text-xl">{activeScene.body}</p><div className="mt-7 flex flex-wrap gap-3">{activeFrame > 0 && <button type="button" onClick={() => stepFrame(-1)} className="rounded-full border border-gold/40 px-5 py-3 text-[11px] font-bold uppercase tracking-[.22em] text-gold">Föregående</button>}{activeFrame < frames.length - 1 ? <button type="button" onClick={() => stepFrame(1)} className="rounded-full border border-gold/50 bg-gold/10 px-5 py-3 text-[11px] font-bold uppercase tracking-[.22em] text-gold backdrop-blur hover:bg-gold hover:text-night">Nästa bild</button> : <Link href="/boka-utan-konto" className="rounded-full border border-gold/50 bg-gold/10 px-5 py-3 text-[11px] font-bold uppercase tracking-[.22em] text-gold backdrop-blur hover:bg-gold hover:text-night">Skicka förfrågan</Link>}</div></div></div>
        </div>
      </section>

      <section id="services" className="bg-night py-24 md:py-32"><div className="luxe-container"><p className="text-[11px] font-bold uppercase tracking-[.38em] text-gold">I / Tjänster</p><h2 className="display mt-4 max-w-4xl text-5xl font-normal uppercase leading-[.9] text-porcelain md:text-7xl">Städtjänster för hem och företag.</h2><div className="mt-12 grid gap-5 md:grid-cols-3">{services.map((service, index) => { const Icon = service.icon; return <Link href={service.href} key={service.title} className="group relative overflow-hidden rounded-[2rem] border border-gold/15 bg-porcelain/[.035] p-7 shadow-[0_28px_90px_rgba(0,0,0,.22)] transition hover:-translate-y-1 hover:border-gold/40"><div className="mb-20 flex items-start justify-between"><div className="grid h-14 w-14 place-items-center rounded-full border border-gold/30 bg-gold/10 text-gold"><Icon size={25} /></div><span className="rounded-full border border-gold/20 px-3 py-1 text-[10px] font-bold uppercase tracking-[.2em] text-gold/80">{service.price}</span></div><p className="mb-3 text-[11px] font-bold uppercase tracking-[.28em] text-porcelain/42">0{index + 1}</p><h3 className="display text-4xl font-normal uppercase text-porcelain">{service.title}</h3><p className="mt-4 leading-7 text-porcelain/62">{service.body}</p></Link>; })}</div></div></section>

      <section id="process" className="bg-porcelain py-24 text-ink md:py-32"><div className="luxe-container"><p className="eyebrow">II / Så fungerar det</p><h2 className="display mt-4 max-w-4xl text-5xl font-normal uppercase leading-[.9] text-burgundy md:text-7xl">Fyra steg. En tydlig förfrågan.</h2><div className="mt-12 grid gap-4 md:grid-cols-4">{["Välj tjänst", "Fyll i plats", "Se sammanfattning", "Skicka förfrågan"].map((item, i) => <article key={item} className="rounded-[2rem] border border-burgundy/10 bg-cream p-6 shadow-sm transition hover:-translate-y-1 hover:shadow-soft"><div className="mb-10 flex items-center justify-between"><span className="display text-4xl text-burgundy/55">0{i + 1}</span><CheckCircle2 className="text-burgundy" /></div><h3 className="display text-3xl font-normal uppercase">{item}</h3><p className="mt-4 text-sm leading-7 text-ink/60">Ett enkelt steg som gör bokningsunderlaget tydligare och lättare att följa upp.</p></article>)}</div></div></section>

      <section id="booking" className="bg-ink py-24 text-porcelain md:py-32">
        <div className="luxe-container grid gap-10">
          <div className="max-w-4xl">
            <p className="mb-4 text-[11px] font-bold uppercase tracking-[.38em] text-gold">Bokning</p>
            <h2 className="display text-5xl font-normal uppercase leading-[.9] md:text-7xl">Skapa en tydlig bokningsförfrågan.</h2>
            <p className="mt-6 max-w-xl text-lg leading-8 text-porcelain/70">Formuläret samlar rätt information direkt: tjänst, plats, storlek, rum, datum, kontakt och särskilda önskemål.</p>
            <div className="mt-8 grid gap-3 text-sm text-porcelain/70">
              <p className="flex items-center gap-3"><ShieldCheck className="h-5 w-5 text-gold" /> Plats delas bara efter aktivt val.</p>
              <p className="flex items-center gap-3"><Mail className="h-5 w-5 text-gold" /> {user ? "Din förfrågan sparas även på din profil." : "Logga in för att boka och spara förfrågan på din profil."}</p>
            </div>
          </div>

          <div className="w-full">
            <div className="mx-auto max-w-3xl rounded-2xl border border-gold/15 bg-night/70 p-8 shadow-lg">
              <h3 className="text-2xl font-bold text-porcelain">Skicka en bokningsförfrågan</h3>
              <p className="mt-3 text-porcelain/80">Fyll i formuläret på vår bokningssida. Du får en tydlig sammanfattning och prisindikation innan du skickar.</p>
              <div className="mt-6 flex flex-wrap items-center gap-3">
                <Link href="/boka-utan-konto" className="btn-primary">Öppna bokningsformulär</Link>
                <Link href="/priser" className="btn-secondary">Se priser först</Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      <footer className="border-t border-gold/10 bg-night py-10"><div className="luxe-container grid gap-8 md:grid-cols-[1.1fr_1fr_1fr]"><div><p className="display text-4xl font-normal uppercase text-gold">Iboren</p><p className="mt-2 max-w-sm text-sm leading-7 text-porcelain/65">Städning i Södertälje och Stockholm med tydlig prisbild, RUT-avdrag och ej bindande bokningsförfrågan.</p></div><div><p className="mb-3 text-xs font-black uppercase tracking-[.22em] text-gold">Tjänster</p><div className="grid gap-2 text-sm font-semibold text-porcelain/70"><Link href="/hemstadning" className="hover:text-gold">Hemstädning</Link><Link href="/flyttstadning" className="hover:text-gold">Flyttstädning</Link><Link href="/kontorsstadning" className="hover:text-gold">Kontorsstädning</Link><Link href="/fonsterputs" className="hover:text-gold">Fönsterputs</Link></div></div><div><p className="mb-3 text-xs font-black uppercase tracking-[.22em] text-gold">Iboren</p><div className="grid gap-2 text-sm font-semibold text-porcelain/70"><Link href="/priser" className="hover:text-gold">Priser</Link><Link href="/jobb" className="hover:text-gold">Jobba hos oss</Link><Link href="/om-iboren" className="hover:text-gold">Om oss</Link><Link href="/privacy" className="hover:text-gold">Privacy</Link><Link href="/terms" className="hover:text-gold">Terms</Link><a href="mailto:hej@iboren.se" className="hover:text-gold">hej@iboren.se</a></div></div></div></footer>
    </main>
  );
}
