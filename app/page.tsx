"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { Building2, CheckCircle2, Home, Truck } from "lucide-react";
import { createClient, User } from "@supabase/supabase-js";
import HomeBookingCta from "./components/home/HomeBookingCta";
import HomeHeader from "./components/home/HomeHeader";
import HomeHero from "./components/home/HomeHero";
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
  {
    icon: Home,
    title: "Hemstädning",
    href: "/hemstadning",
    price: "från 255 kr/tim efter RUT",
    body: "För återkommande eller enstaka städning hemma.",
    image: "/service-cards/home-cleaning.webp",
    details: ["Kök & badrum", "Dammsugning", "Återkommande tider"]
  },
  {
    icon: Truck,
    title: "Flyttstädning",
    href: "/flyttstadning",
    price: "pris efter yta",
    body: "För flytt, överlämning och tydlig checklista.",
    image: "/service-cards/move-out-cleaning.webp",
    details: ["Tydlig checklista", "Kök & badrum", "Inför överlämning"]
  },
  {
    icon: Building2,
    title: "Kontorsstädning",
    href: "/kontorsstadning",
    price: "skräddarsydd offert",
    body: "För företag, lokaler och återkommande service.",
    image: "/service-cards/office-cleaning.webp",
    details: ["Arbetsytor", "Mötesrum", "Gemensamma ytor"]
  },
  {
    icon: CheckCircle2,
    title: "Fönsterputs",
    href: "/fonsterputs",
    price: "skräddarsydd offert",
    body: "För fönster, glasytor och extra städning.",
    image: "/service-cards/window-cleaning.webp",
    details: ["Fönster & glasytor", "Hem & kontor", "Tydlig offert"]
  }
];

function getSupabase() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !key) return null;
  return createClient(url, key);
}

export default function HomePage() {
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
      <HomeHeader user={user} />

      <HomeHero user={user} image={frames[2].image} />

      <section id="cinematic-scroll" onWheel={handleCinematicWheel} onTouchStart={handleTouchStart} onTouchEnd={handleTouchEnd} className="relative h-screen min-h-screen overflow-hidden bg-night">
        <div className="relative h-screen min-h-screen overflow-hidden bg-night">
          {frames.map((frame, index) => <img key={frame.counter} src={frame.image} alt={frame.title} loading={index === 0 ? "eager" : "lazy"} decoding="async" fetchPriority={index === 0 ? "auto" : "low"} sizes="100vw" style={{ opacity: activeFrame === index ? 1 : 0, transform: activeFrame === index ? "scale(1)" : "scale(1.04)", zIndex: activeFrame === index ? 2 : 1 }} className="absolute inset-0 h-full w-full object-cover transition-all duration-700 ease-out" />)}
          <div className="absolute inset-0 z-10 bg-[linear-gradient(90deg,rgba(2,5,4,.50),rgba(2,5,4,.06)_48%,rgba(2,5,4,.50)),radial-gradient(circle_at_52%_46%,transparent_0_42%,rgba(0,0,0,.34)_100%)]" />
          <div className="absolute left-5 right-5 top-24 z-20 flex items-start justify-between md:left-[8vw] md:right-[8vw] md:top-[12vh]"><div><p className="text-[10px] font-black uppercase tracking-[.34em] text-gold/85">{activeScene.kicker}</p><p className="display mt-1 text-4xl font-normal uppercase tracking-[.02em] text-porcelain md:text-6xl">{activeScene.counter}</p></div><div className="h-24 w-1 overflow-hidden rounded-full bg-porcelain/15"><div className="w-full rounded-full bg-gold transition-all" style={{ height: `${Math.round(progress * 100)}%` }} /></div></div>
          <div className="absolute inset-x-0 bottom-12 z-20 px-5 md:bottom-20"><div className="luxe-container"><h2 className="display max-w-4xl text-[clamp(3rem,8vw,7rem)] font-normal uppercase leading-[.84] tracking-[.02em] text-porcelain">{activeScene.title}</h2><p className="mt-5 max-w-2xl text-base leading-8 text-porcelain/86 md:text-xl">{activeScene.body}</p><div className="mt-7 flex flex-wrap gap-3">{activeFrame > 0 && <button type="button" onClick={() => stepFrame(-1)} className="rounded-full border border-gold/40 px-5 py-3 text-[11px] font-bold uppercase tracking-[.22em] text-gold">Föregående</button>}{activeFrame < frames.length - 1 ? <button type="button" onClick={() => stepFrame(1)} className="rounded-full border border-gold/50 bg-gold/10 px-5 py-3 text-[11px] font-bold uppercase tracking-[.22em] text-gold backdrop-blur hover:bg-gold hover:text-night">Nästa bild</button> : <Link href="/boka-utan-konto" className="rounded-full border border-gold/50 bg-gold/10 px-5 py-3 text-[11px] font-bold uppercase tracking-[.22em] text-gold backdrop-blur hover:bg-gold hover:text-night">Skicka förfrågan</Link>}</div></div></div>
        </div>
      </section>

      <section id="services" className="bg-night py-24 md:py-32">
        <div className="luxe-container">
          <p className="text-[11px] font-bold uppercase tracking-[.38em] text-gold">I / Tjänster</p>
          <h2 className="display mt-4 max-w-4xl text-5xl font-normal uppercase leading-[.9] text-porcelain md:text-7xl">Städtjänster för hem och företag.</h2>
          <div className="mt-12 grid gap-5 md:grid-cols-2 xl:grid-cols-4">
            {services.map((service, index) => {
              const Icon = service.icon;

              return (
                <Link
                  href={service.href}
                  key={service.title}
                  className="iboren-card-glass iboren-card-glass-hover group relative min-h-[27rem] overflow-hidden rounded-[2rem] border border-gold/15"
                >
                  <img
                    src={service.image}
                    alt=""
                    loading="lazy"
                    decoding="async"
                    className="absolute inset-0 h-full w-full object-cover opacity-45 transition duration-700 group-hover:scale-105 group-hover:opacity-60"
                  />
                  <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(2,5,4,.12)_0%,rgba(2,5,4,.62)_46%,rgba(2,5,4,.96)_100%)]" />
                  <div className="relative flex h-full flex-col p-7">
                    <div className="flex items-start justify-between gap-3">
                      <div className="iboren-gold-accent grid h-14 w-14 shrink-0 place-items-center rounded-full border border-gold/30 bg-night/45 backdrop-blur-sm">
                        <Icon size={25} />
                      </div>
                      <span className="iboren-gold-accent max-w-[10rem] rounded-full border border-gold/20 bg-night/45 px-3 py-1 text-right text-[10px] font-bold uppercase tracking-[.16em] backdrop-blur-sm">
                        {service.price}
                      </span>
                    </div>
                    <div className="mt-auto">
                      <div className="mb-5 flex items-center justify-between gap-4">
                        <p className="iboren-gold-accent text-[11px] font-bold uppercase tracking-[.28em]">0{index + 1}</p>
                        <span className="text-[10px] font-bold uppercase tracking-[.2em] text-porcelain/72 transition group-hover:text-gold">
                          Läs mer <span aria-hidden="true">↗</span>
                        </span>
                      </div>
                      <h3 className="display text-4xl font-normal uppercase text-porcelain">{service.title}</h3>
                      <p className="iboren-text-muted-dark mt-4 max-w-[28ch] leading-7">{service.body}</p>
                      <ul className="mt-6 grid gap-2 border-t border-porcelain/15 pt-5 text-xs font-semibold text-porcelain/82">
                        {service.details.map((detail) => (
                          <li key={detail} className="flex items-center gap-2">
                            <CheckCircle2 size={14} strokeWidth={2.5} className="shrink-0 text-gold" />
                            <span>{detail}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      </section>

      <section id="process" className="iboren-section-dark py-24 md:py-32"><div className="luxe-container"><p className="iboren-gold-accent text-[11px] font-bold uppercase tracking-[.38em]">II / Så fungerar det</p><h2 className="display mt-4 max-w-4xl text-5xl font-normal uppercase leading-[.9] text-porcelain md:text-7xl">Fyra steg. En tydlig förfrågan.</h2><div className="mt-12 grid gap-4 md:grid-cols-4">{["Välj tjänst", "Fyll i plats", "Se sammanfattning", "Skicka förfrågan"].map((item, i) => <article key={item} className="process-card iboren-card-glass iboren-card-glass-hover min-w-0 rounded-[2rem] p-6"><div className="mb-10 flex items-center justify-between"><span className="iboren-gold-accent display text-4xl">0{i + 1}</span><CheckCircle2 className="iboren-gold-accent" /></div><h3 className="display font-normal uppercase text-porcelain">{item}</h3><p className="iboren-text-muted-dark mt-4 text-sm leading-7">Ett enkelt steg som gör bokningsunderlaget tydligare och lättare att följa upp.</p></article>)}</div></div></section>

      <HomeBookingCta user={user} />

      <footer className="border-t border-gold/10 bg-night py-10"><div className="luxe-container grid gap-8 md:grid-cols-[1.1fr_1fr_1fr]"><div><p className="display text-4xl font-normal uppercase text-gold">Iboren</p><p className="mt-2 max-w-sm text-sm leading-7 text-porcelain/65">Städning i Södertälje och Stockholm med tydlig prisbild, RUT-avdrag och ej bindande bokningsförfrågan.</p></div><div><p className="mb-3 text-xs font-black uppercase tracking-[.22em] text-gold">Tjänster</p><div className="grid gap-2 text-sm font-semibold text-porcelain/70"><Link href="/hemstadning" className="hover:text-gold">Hemstädning</Link><Link href="/flyttstadning" className="hover:text-gold">Flyttstädning</Link><Link href="/kontorsstadning" className="hover:text-gold">Kontorsstädning</Link><Link href="/fonsterputs" className="hover:text-gold">Fönsterputs</Link></div></div><div><p className="mb-3 text-xs font-black uppercase tracking-[.22em] text-gold">Iboren</p><div className="grid gap-2 text-sm font-semibold text-porcelain/70"><Link href="/priser" className="hover:text-gold">Priser</Link><Link href="/jobb" className="hover:text-gold">Jobba hos oss</Link><Link href="/om-iboren" className="hover:text-gold">Om oss</Link><Link href="/privacy" className="hover:text-gold">Privacy</Link><Link href="/terms" className="hover:text-gold">Terms</Link><a href="mailto:hej@iboren.se" className="hover:text-gold">hej@iboren.se</a><a href="tel:+46760354141" className="hover:text-gold">076 035 41 41</a></div></div></div></footer>
    </main>
  );
}
