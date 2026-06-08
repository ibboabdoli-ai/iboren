import type { User } from "@supabase/supabase-js";
import { Mail, ShieldCheck } from "lucide-react";
import Link from "next/link";

type Props = {
  user: User | null;
};

export default function HomeBookingCta({ user }: Props) {
  return (
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
          <div className="iboren-card-glass iboren-card-glass-hover mx-auto max-w-3xl rounded-2xl p-8">
            <h3 className="text-2xl font-bold text-[var(--ib-text)]">Beräkna pris direkt</h3>
            <p className="iboren-text-muted-dark mt-3">Få en tydlig prisindikation först. När allt ser rätt ut kan du fortsätta till en ej bindande bokningsförfrågan.</p>
            <div className="mt-6 flex flex-wrap items-center gap-3">
              <Link href="/priser#pris-kalkylator" className="btn-primary">Få pris direkt</Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
