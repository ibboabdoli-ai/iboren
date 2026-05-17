import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, CheckCircle2, Home, ShieldCheck, Sparkles } from "lucide-react";

export const metadata: Metadata = {
  title: "Hemstädning – Iboren",
  description: "Boka hemstädning med Iboren. CleanAI hjälper dig skapa en tydlig bokningsförfrågan för hemstädning i Sverige."
};

const items = [
  "Bokningsförfrågan på några minuter",
  "Yta, adress, datum och önskemål samlas tydligt",
  "Passar både engångsstädning och återkommande hemstädning",
  "Förberett för offert och RUT-information"
];

export default function HemstadningPage() {
  return (
    <main className="min-h-screen bg-cream text-ink">
      <section className="relative overflow-hidden py-20 md:py-28">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_65%_20%,rgba(212,165,116,.35),transparent_32%),radial-gradient(circle_at_15%_70%,rgba(107,39,55,.14),transparent_34%)]" />
        <div className="luxe-container relative grid gap-10 md:grid-cols-[.95fr_1.05fr] md:items-center">
          <div>
            <Link href="/" className="mb-10 inline-flex text-sm font-bold text-burgundy">← Tillbaka</Link>
            <p className="eyebrow">Iboren Services</p>
            <h1 className="display mt-4 text-6xl font-bold leading-[.88] text-burgundy md:text-8xl">Hemstädning</h1>
            <p className="mt-7 max-w-2xl text-lg leading-8 text-ink/70 md:text-xl">Skapa en tydlig förfrågan för hemstädning. CleanAI hjälper dig steg för steg med storlek, område, frekvens, datum och särskilda behov.</p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Link href="/#booking" className="btn-primary">Starta bokning <ArrowRight size={18} /></Link>
              <Link href="/#services" className="btn-secondary">Se alla tjänster</Link>
            </div>
          </div>
          <div className="rounded-[2.5rem] border border-burgundy/10 bg-porcelain/70 p-8 shadow-luxe backdrop-blur-xl">
            <div className="mb-16 flex items-center justify-between">
              <div className="grid h-16 w-16 place-items-center rounded-full bg-burgundy text-porcelain"><Home size={30} /></div>
              <span className="rounded-full border border-gold/50 bg-gold/20 px-4 py-2 text-xs font-bold uppercase tracking-[.24em] text-burgundy">RUT-ready</span>
            </div>
            <h2 className="display text-4xl font-bold text-ink">För hem som ska kännas klara.</h2>
            <div className="mt-7 grid gap-4">
              {items.map((item) => <p key={item} className="flex gap-3 text-ink/70"><CheckCircle2 className="mt-1 h-5 w-5 shrink-0 text-burgundy" /> {item}</p>)}
            </div>
          </div>
        </div>
      </section>
      <section className="bg-porcelain py-16"><div className="luxe-container grid gap-5 md:grid-cols-3"><Info icon={<Sparkles />} title="Smart flow" text="Formuläret håller kundens svar strukturerade från första kontakt." /><Info icon={<ShieldCheck />} title="Tryggt underlag" text="Ingen bindande bokning innan pris, tid och omfattning bekräftas." /><Info icon={<Home />} title="Flexibelt" text="Passar både enstaka hemstädning och återkommande service." /></div></section>
    </main>
  );
}

function Info({ icon, title, text }: { icon: React.ReactNode; title: string; text: string }) {
  return <article className="rounded-[2rem] bg-cream p-6 shadow-soft"><div className="mb-6 grid h-12 w-12 place-items-center rounded-full bg-burgundy text-porcelain">{icon}</div><h3 className="display text-3xl font-bold text-burgundy">{title}</h3><p className="mt-3 leading-7 text-ink/65">{text}</p></article>;
}
