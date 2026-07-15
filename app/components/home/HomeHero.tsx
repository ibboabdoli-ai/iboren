"use client";

import type { User } from "@supabase/supabase-js";
import { ArrowUpRight } from "lucide-react";
import Link from "next/link";
import { useState } from "react";

const trustBadges = [
  {
    label: "RUT-avdrag",
    explanation:
      "RUT-avdrag gäller normalt för upp till 50% av godkänd arbetskostnad. Det gäller inte material, resor eller andra kostnader och förutsätter att kunden uppfyller Skatteverkets villkor och har RUT kvar.",
  },
  {
    label: "Prisindikation online",
    explanation:
      "Prisindikationen hjälper dig att få en uppskattning baserad på tjänst, storlek och uppgifter du fyller i. Slutligt pris bekräftas innan bokningen blir bindande.",
  },
  {
    label: "Ej bindande förfrågan",
    explanation:
      "När du skickar en förfrågan är den inte bindande. Iboren återkommer med bekräftelse innan något uppdrag bokas.",
  },
];

type Props = {
  user: User | null;
  image: string;
};

export default function HomeHero({ user, image }: Props) {
  const [activeBadge, setActiveBadge] = useState<string | null>(null);
  const activeTrustBadge = trustBadges.find((badge) => badge.label === activeBadge);

  return (
    <section id="top" className="relative grid min-h-screen place-items-center overflow-hidden px-5 pt-28 text-center lg:justify-items-start lg:px-[8vw] lg:text-left">
      <img src={image} alt="Rent hem" loading="eager" decoding="async" fetchPriority="high" sizes="100vw" className="absolute inset-0 h-full w-full object-cover" />
      <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(2,5,4,.58),rgba(2,5,4,.16)_48%,rgba(2,5,4,.62)),radial-gradient(circle_at_center,transparent_0_38%,rgba(0,0,0,.34)_100%)]" />
      <div className="relative z-10 mx-auto max-w-6xl lg:mx-0 lg:pr-16">
        <p className="text-[11px] font-bold uppercase tracking-[0.36em] text-gold/90 md:tracking-[0.44em]">Södertälje · Stockholm · RUT-avdrag</p>
        <h1 className="display mt-5 max-w-[12ch] text-[clamp(3.2rem,10vw,7.5rem)] font-normal uppercase leading-[.9] tracking-[.01em] text-porcelain md:mt-6 md:leading-[.86] lg:text-[clamp(4.75rem,7.4vw,7.35rem)]">Städning i Södertälje & Stockholm</h1>
        <p className="mx-auto mt-6 max-w-3xl text-base font-semibold leading-7 text-porcelain/88 md:mt-7 md:text-2xl md:leading-8 lg:mx-0 lg:max-w-2xl">Hemstädning, flyttstädning, kontorsstädning och fönsterputs. Beräkna pris online och skicka en ej bindande förfrågan.</p>
        {user && <p className="mt-5 inline-flex rounded-full border border-gold/25 bg-night/50 px-4 py-2 text-sm font-bold text-gold">Inloggad som {user.email}</p>}
        <div className="mt-7 flex flex-wrap items-center justify-center gap-2 md:mt-8 lg:justify-start">
          {trustBadges.map((badge) => {
            const isActive = activeBadge === badge.label;

            return (
              <button
                key={badge.label}
                type="button"
                aria-expanded={isActive}
                aria-controls="hero-trust-explanation"
                onClick={() => setActiveBadge(isActive ? null : badge.label)}
                className={`cursor-pointer rounded-full border px-3 py-2 text-[10px] font-bold uppercase tracking-[.16em] text-gold backdrop-blur-md transition hover:border-gold/55 hover:bg-gold/15 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold focus-visible:ring-offset-2 focus-visible:ring-offset-night md:px-4 md:text-xs md:tracking-[.18em] ${
                  isActive ? "border-gold/60 bg-gold/20 shadow-[0_0_28px_rgba(216,164,111,.18)]" : "border-gold/25 bg-night/45"
                }`}
              >
                {badge.label}
              </button>
            );
          })}
        </div>
        {activeTrustBadge && (
          <div
            id="hero-trust-explanation"
            aria-live="polite"
            className="mx-auto mt-3 max-w-2xl rounded-2xl border border-gold/25 bg-night/85 px-4 py-3 text-left text-xs leading-5 text-porcelain/85 shadow-[0_18px_55px_rgba(0,0,0,.28)] backdrop-blur-xl md:px-5 md:py-4 md:text-sm md:leading-6 lg:mx-0"
          >
            <span className="font-bold text-gold">{activeTrustBadge.label}:</span>{" "}
            {activeTrustBadge.explanation}
          </div>
        )}
        <div className="mt-9 flex flex-col items-center justify-center gap-3 sm:flex-row md:mt-10 lg:items-start lg:justify-start"><Link href="/priser#pris-kalkylator" data-site-analytics-event="quote_cta_click" className="btn-primary">Få pris direkt <ArrowUpRight size={17} /></Link></div>
        <p className="mx-auto mt-5 max-w-xl text-sm font-bold leading-6 text-porcelain/75 lg:mx-0">Beräkna pris först. Du kan gå vidare till en ej bindande bokningsförfrågan när allt ser rätt ut.</p>
        <div className="mt-8 inline-flex items-center gap-4 text-[11px] font-bold uppercase tracking-[0.32em] text-gold/75 before:h-px before:w-10 before:bg-gold/40 after:h-px after:w-10 after:bg-gold/40 md:mt-10">Se före och efter</div>
      </div>
    </section>
  );
}
