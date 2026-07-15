"use client";

import type { User } from "@supabase/supabase-js";
import { motion, useReducedMotion } from "framer-motion";
import { Mail, ShieldCheck } from "lucide-react";
import AnalyticsBookingLink from "./AnalyticsBookingLink";

type Props = {
  user: User | null;
};

export default function HomeBookingCta({ user }: Props) {
  const reduceMotion = useReducedMotion();

  return (
    <section id="booking" className="relative overflow-hidden bg-ink py-24 text-porcelain md:py-32">
      <div aria-hidden="true" className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -right-24 -top-44 h-[34rem] w-[52rem] rotate-[18deg] border border-gold/10" />
        <div className="absolute -right-16 -top-28 h-[28rem] w-[46rem] rotate-[18deg] border border-gold/10" />
        <div className="absolute -right-8 -top-12 h-[22rem] w-[40rem] rotate-[18deg] border border-gold/10" />
        <div className="absolute -bottom-36 left-[8%] h-72 w-72 rounded-full bg-gold/[0.035] blur-3xl" />
      </div>
      <div className="luxe-container relative grid gap-10">
        <div className="max-w-4xl">
          <p className="mb-4 text-[11px] font-bold uppercase tracking-[.38em] text-gold">Förfrågan</p>
          <h2 className="display text-5xl font-normal uppercase leading-[.9] md:text-7xl">Skapa en tydlig förfrågan.</h2>
          <p className="mt-6 max-w-xl text-lg leading-8 text-porcelain/70">Formuläret samlar rätt information direkt: tjänst, plats, storlek, rum, datum, kontakt och särskilda önskemål.</p>
          <div className="mt-8 grid gap-3 text-sm text-porcelain/70">
            <p className="flex items-center gap-3"><ShieldCheck className="h-5 w-5 text-gold" /> Plats delas bara efter aktivt val.</p>
            <p className="flex items-center gap-3"><Mail className="h-5 w-5 text-gold" /> {user ? "Din förfrågan sparas även på din profil." : "Du kan skicka en förfrågan utan konto. Logga in om du vill spara och följa den på din profil."}</p>
          </div>
        </div>

        <motion.div
          className="w-full"
          initial={reduceMotion ? false : { opacity: 0, y: 12 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.35 }}
          transition={{ duration: reduceMotion ? 0 : 0.42, ease: [0.22, 1, 0.36, 1] }}
        >
          <div className="iboren-card-glass iboren-card-glass-hover mx-auto max-w-3xl rounded-2xl p-8">
            <h3 className="text-2xl font-bold text-porcelain">Beräkna pris direkt</h3>
            <p className="iboren-text-muted-dark mt-3">Få en tydlig prisindikation först. När allt ser rätt ut kan du skicka en ej bindande förfrågan.</p>
            <div className="mt-6 flex flex-wrap items-center gap-3">
              <AnalyticsBookingLink />
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
