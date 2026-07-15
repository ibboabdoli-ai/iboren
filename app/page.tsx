"use client";

import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { useEffect, useState } from "react";
import Link from "next/link";
import { BadgeCheck, Building2, Calculator, CheckCircle2, Home, MapPin, ShieldCheck, Truck } from "lucide-react";
import { createClient, User } from "@supabase/supabase-js";
import HomeBookingCta from "./components/home/HomeBookingCta";
import HomeFaq from "./components/home/HomeFaq";
import HomeHeader from "./components/home/HomeHeader";
import HomeHero from "./components/home/HomeHero";
import ReviewShowcase from "./components/reviews/ReviewShowcase";
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

const trustPoints = [
  {
    icon: Calculator,
    title: "Tydlig prisbild",
    body: "Se en prisuppskattning innan du skickar din förfrågan."
  },
  {
    icon: ShieldCheck,
    title: "RUT-avdrag",
    body: "För privata tjänster när villkoren för RUT är uppfyllda."
  },
  {
    icon: MapPin,
    title: "Lokalt fokus",
    body: "Vi tar emot förfrågningar i Södertälje och Stockholm."
  },
  {
    icon: BadgeCheck,
    title: "Ingen bindning direkt",
    body: "Tid, omfattning och slutpris bekräftas innan bokning."
  }
];

const processSteps = [
  {
    title: "Välj tjänst",
    body: "Välj hemstädning, flyttstädning, kontorsstädning eller fönsterputs."
  },
  {
    title: "Fyll i uppgifter",
    body: "Lägg till område, storlek och de uppgifter som påverkar priset."
  },
  {
    title: "Se prisindikation",
    body: "Se en tydlig uppskattning med RUT-avdrag när villkoren är uppfyllda."
  },
  {
    title: "Skicka förfrågan",
    body: "Iboren bekräftar tid, omfattning och slutpris innan något bokas."
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
  const reduceMotion = useReducedMotion();

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

  return (
    <main className="min-h-screen overflow-x-hidden bg-night text-porcelain">
      <HomeHeader user={user} />

      <HomeHero user={user} image={frames[2].image} />

      <section id="cinematic-scroll" className="relative min-h-[34rem] overflow-hidden bg-night sm:min-h-[38rem] lg:min-h-[42rem]">
        <div className="relative min-h-[34rem] overflow-hidden bg-night sm:min-h-[38rem] lg:min-h-[42rem]">
          {frames.map((frame, index) => <img key={frame.counter} src={frame.image} alt={frame.title} loading={index === 0 ? "eager" : "lazy"} decoding="async" fetchPriority={index === 0 ? "auto" : "low"} sizes="100vw" style={{ opacity: activeFrame === index ? 1 : 0, transform: activeFrame === index ? "scale(1)" : "scale(1.025)", zIndex: activeFrame === index ? 2 : 1 }} className="absolute inset-0 h-full w-full object-cover transition-[opacity,transform] duration-500 ease-out motion-reduce:transition-none" />)}
          <div className="absolute inset-0 z-10 bg-[linear-gradient(90deg,rgba(2,5,4,.50),rgba(2,5,4,.06)_48%,rgba(2,5,4,.50)),radial-gradient(circle_at_52%_46%,transparent_0_42%,rgba(0,0,0,.34)_100%)]" />
          <div className="absolute left-5 right-5 top-24 z-20 flex items-start justify-between md:left-[8vw] md:right-[8vw] md:top-[12vh]"><div><p className="text-[10px] font-black uppercase tracking-[.34em] text-gold/85">{activeScene.kicker}</p><p className="display mt-1 text-4xl font-normal uppercase tracking-[.02em] text-porcelain md:text-6xl">{activeScene.counter}</p></div><div className="h-24 w-1 overflow-hidden rounded-full bg-porcelain/15"><div className="w-full rounded-full bg-gold transition-all" style={{ height: `${Math.round(progress * 100)}%` }} /></div></div>
          <div className="absolute inset-x-0 bottom-10 z-20 px-5 md:bottom-16">
            <div className="luxe-container">
              <AnimatePresence initial={false} mode="wait">
                <motion.div
                  key={activeScene.counter}
                  initial={reduceMotion ? false : { opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={reduceMotion ? undefined : { opacity: 0, y: -8 }}
                  transition={{ duration: reduceMotion ? 0 : 0.38, ease: [0.22, 1, 0.36, 1] }}
                >
                  <h2 className="display max-w-4xl text-[clamp(2.75rem,6vw,5.8rem)] font-normal uppercase leading-[.84] tracking-[.02em] text-porcelain">{activeScene.title}</h2>
                  <p className="mt-5 max-w-2xl text-base leading-8 text-porcelain/86 md:text-xl">{activeScene.body}</p>
                </motion.div>
              </AnimatePresence>
              <div className="mt-7 flex flex-wrap gap-3">
                {activeFrame > 0 && <button type="button" onClick={() => stepFrame(-1)} className="rounded-full border border-gold/40 px-5 py-3 text-[11px] font-bold uppercase tracking-[.22em] text-gold transition hover:bg-gold/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold motion-reduce:transition-none">Föregående</button>}
                {activeFrame < frames.length - 1 ? <button type="button" onClick={() => stepFrame(1)} className="rounded-full border border-gold/50 bg-gold/10 px-5 py-3 text-[11px] font-bold uppercase tracking-[.22em] text-gold backdrop-blur transition hover:bg-gold hover:text-night focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold motion-reduce:transition-none">Nästa bild</button> : <Link href="/boka-utan-konto" data-site-analytics-event="booking_cta_click" className="rounded-full border border-gold/50 bg-gold/10 px-5 py-3 text-[11px] font-bold uppercase tracking-[.22em] text-gold backdrop-blur transition hover:bg-gold hover:text-night focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold motion-reduce:transition-none">Skicka förfrågan</Link>}
              </div>
            </div>
          </div>
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

      <section aria-labelledby="trust-heading" className="relative overflow-hidden bg-[#111411] py-20 md:py-28">
        <div aria-hidden="true" className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_8%_20%,rgba(212,165,116,.12),transparent_28%),radial-gradient(circle_at_88%_78%,rgba(212,165,116,.08),transparent_26%)]" />
        <div className="luxe-container relative">
          <p className="text-[11px] font-bold uppercase tracking-[.38em] text-gold">II / Varför Iboren</p>
          <div className="mt-4 flex flex-col justify-between gap-5 lg:flex-row lg:items-end">
            <h2 id="trust-heading" className="display max-w-4xl text-5xl font-normal uppercase leading-[.9] text-porcelain md:text-7xl">Tydligt från första steget.</h2>
            <p className="max-w-md text-sm leading-7 text-porcelain/65">Du får en klar grund innan något blir bindande.</p>
          </div>
          <div className="mt-12 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            {trustPoints.map((point, index) => {
              const Icon = point.icon;

              return (
                <article key={point.title} className="iboren-card-glass iboren-card-glass-hover relative overflow-hidden rounded-[2rem] border border-gold/15 p-6">
                  <div className="mb-10 flex items-start justify-between gap-4">
                    <div className="grid h-12 w-12 place-items-center rounded-full border border-gold/30 bg-gold/10 text-gold"><Icon size={22} /></div>
                    <span className="text-[10px] font-bold uppercase tracking-[.24em] text-gold/70">0{index + 1}</span>
                  </div>
                  <h3 className="display text-3xl font-normal uppercase text-porcelain">{point.title}</h3>
                  <p className="mt-4 max-w-[30ch] leading-7 text-porcelain/65">{point.body}</p>
                </article>
              );
            })}
          </div>
        </div>
      </section>

      <ReviewShowcase language="sv" />

      <HomeFaq />

      <section id="process" aria-labelledby="process-heading" className="iboren-section-dark py-24 md:py-32">
        <div className="luxe-container">
          <p className="iboren-gold-accent text-[11px] font-bold uppercase tracking-[.38em]">III / Så fungerar det</p>
          <h2 id="process-heading" className="display mt-4 max-w-4xl text-5xl font-normal uppercase leading-[.9] text-porcelain md:text-7xl">Fyra steg. En tydlig förfrågan.</h2>
          <div className="relative mt-12">
            <div aria-hidden="true" className="absolute bottom-8 left-7 top-7 w-px bg-gold/25 md:bottom-auto md:left-[12.5%] md:right-[12.5%] md:top-7 md:h-px md:w-auto" />
            <div className="relative grid gap-8 md:grid-cols-4 md:gap-5">
              {processSteps.map((step, index) => (
                <motion.article
                  key={step.title}
                  initial={reduceMotion ? false : { opacity: 0, y: 12 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, amount: 0.35 }}
                  transition={{ duration: reduceMotion ? 0 : 0.34, delay: reduceMotion ? 0 : index * 0.06, ease: [0.22, 1, 0.36, 1] }}
                  className="relative min-w-0 pl-20 md:px-3 md:pt-20"
                >
                  <div className="absolute left-0 top-0 grid h-14 w-14 place-items-center rounded-full border border-gold/40 bg-night text-gold shadow-[0_0_0_6px_rgba(2,5,4,1)] md:left-1/2 md:-translate-x-1/2">
                    <span className="display text-2xl">0{index + 1}</span>
                  </div>
                  <div className="border-b border-gold/15 pb-7 md:border-b-0 md:pb-0">
                    <h3 className="display font-normal uppercase text-porcelain">{step.title}</h3>
                    <p className="iboren-text-muted-dark mt-4 text-sm leading-7">{step.body}</p>
                  </div>
                </motion.article>
              ))}
            </div>
          </div>
        </div>
      </section>

      <HomeBookingCta user={user} />

      <footer className="border-t border-gold/10 bg-night py-10"><div className="luxe-container grid gap-8 md:grid-cols-[1.1fr_1fr_1fr]"><div><p className="display text-4xl font-normal uppercase text-gold">Iboren</p><p className="mt-2 max-w-sm text-sm leading-7 text-porcelain/65">Städning i Södertälje och Stockholm med tydlig prisbild, RUT-avdrag och ej bindande förfrågan.</p></div><div><p className="mb-3 text-xs font-black uppercase tracking-[.22em] text-gold">Tjänster</p><div className="grid gap-2 text-sm font-semibold text-porcelain/70"><Link href="/hemstadning" className="hover:text-gold">Hemstädning</Link><Link href="/flyttstadning" className="hover:text-gold">Flyttstädning</Link><Link href="/kontorsstadning" className="hover:text-gold">Kontorsstädning</Link><Link href="/fonsterputs" className="hover:text-gold">Fönsterputs</Link></div></div><div><p className="mb-3 text-xs font-black uppercase tracking-[.22em] text-gold">Iboren</p><div className="grid gap-2 text-sm font-semibold text-porcelain/70"><Link href="/priser" className="hover:text-gold">Priser</Link><Link href="/jobb" className="hover:text-gold">Jobba hos oss</Link><Link href="/om-iboren" className="hover:text-gold">Om oss</Link><Link href="/privacy" className="hover:text-gold">Integritet</Link><Link href="/terms" className="hover:text-gold">Villkor</Link><a href="mailto:hej@iboren.se" className="hover:text-gold">hej@iboren.se</a><a href="tel:+46760354141" className="hover:text-gold">076 035 41 41</a></div></div></div></footer>
    </main>
  );
}
