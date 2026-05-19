import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, CheckCircle2, Mail, MapPin, ShieldCheck, Sparkles } from "lucide-react";

export const metadata: Metadata = {
  title: "Om Iboren – Städning i Södertälje och Stockholm",
  description: "Läs mer om Iboren, en svensk bokningstjänst för hemstädning, flyttstädning, kontorsstädning och fönsterputs i Södertälje och Stockholm.",
  keywords: ["Iboren", "om Iboren", "Iboren städning", "Iboren Södertälje", "Iboren Stockholm", "städbokning Sverige"]
};

const points = [
  "Digital bokning för hemstädning, flyttstädning, kontorsstädning och fönsterputs",
  "Fokus på Södertälje och Stockholm",
  "Tydligt bokningsunderlag innan uppdrag bekräftas",
  "E-postbekräftelse och statusuppdateringar för kunden"
];

const schema = {
  "@context": "https://schema.org",
  "@type": "AboutPage",
  "@id": "https://iboren.se/om-iboren#about",
  url: "https://iboren.se/om-iboren",
  name: "Om Iboren",
  description: "Iboren är en svensk städbokningstjänst för Södertälje och Stockholm.",
  mainEntity: { "@id": "https://iboren.se/#organization" }
};

export default function OmIborenPage() {
  return (
    <main className="min-h-screen bg-cream text-ink">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schema).replace(/</g, "\\u003c") }} />
      <section className="relative overflow-hidden py-20 md:py-28">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_20%,rgba(212,165,116,.35),transparent_32%),radial-gradient(circle_at_18%_75%,rgba(107,39,55,.14),transparent_34%)]" />
        <div className="luxe-container relative grid gap-10 md:grid-cols-[1fr_.9fr] md:items-center">
          <div>
            <Link href="/" className="mb-10 inline-flex text-sm font-bold text-burgundy">← Tillbaka</Link>
            <p className="eyebrow">Om varumärket</p>
            <h1 className="display mt-4 text-6xl font-bold leading-[.88] text-burgundy md:text-8xl">Om Iboren</h1>
            <p className="mt-7 max-w-2xl text-lg leading-8 text-ink/70 md:text-xl">Iboren är en svensk digital bokningstjänst för städning. Målet är att göra det enklare att skicka en tydlig förfrågan för hemstädning, flyttstädning, kontorsstädning och fönsterputs.</p>
            <p className="mt-5 max-w-2xl leading-8 text-ink/65">Tjänsten är byggd för kunder i Södertälje och Stockholm som vill samla rätt uppgifter från början: tjänst, adress, storlek, datum, kontaktuppgifter och särskilda önskemål.</p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Link href="/#booking" className="btn-primary">Starta bokning <ArrowRight size={18} /></Link>
              <Link href="/stadning-sodertalje" className="btn-secondary">Städning i Södertälje</Link>
            </div>
          </div>
          <aside className="rounded-[2.5rem] border border-burgundy/10 bg-porcelain/80 p-8 shadow-luxe backdrop-blur-xl">
            <div className="mb-12 grid h-16 w-16 place-items-center rounded-full bg-burgundy text-porcelain"><Sparkles size={30} /></div>
            <h2 className="display text-4xl font-bold text-burgundy">Iboren gör bokningen tydligare.</h2>
            <div className="mt-7 grid gap-4">
              {points.map((item) => <p key={item} className="flex gap-3 text-ink/70"><CheckCircle2 className="mt-1 h-5 w-5 shrink-0 text-burgundy" /> {item}</p>)}
            </div>
          </aside>
        </div>
      </section>

      <section className="bg-porcelain py-16">
        <div className="luxe-container grid gap-5 md:grid-cols-3">
          <Info icon={<MapPin />} title="Område" text="Iboren fokuserar på Södertälje och Stockholm med lokala servicesidor för städning." />
          <Info icon={<ShieldCheck />} title="Tryggt flöde" text="En förfrågan är inte automatiskt bekräftad. Tid, omfattning och villkor bekräftas innan uppdrag." />
          <Info icon={<Mail />} title="Kontakt" text="Kunder får e-postbekräftelse och kan kontakta Iboren via hej@iboren.se." />
        </div>
      </section>

      <section className="bg-cream py-16">
        <div className="luxe-container max-w-4xl rounded-[2rem] bg-burgundy p-8 text-porcelain shadow-luxe">
          <p className="text-xs font-black uppercase tracking-[.28em] text-gold">Iboren</p>
          <h2 className="display mt-3 text-4xl font-bold md:text-6xl">Städning med tydligare första steg.</h2>
          <p className="mt-5 max-w-2xl leading-8 text-porcelain/72">Iboren hjälper kunden att lämna rätt information från början, så att bokningsförfrågan blir enklare att följa upp och bekräfta.</p>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <Link href="/#booking" className="inline-flex rounded-full bg-gold px-5 py-3 text-sm font-black uppercase tracking-[.12em] text-ink">Boka städning</Link>
            <a href="mailto:hej@iboren.se" className="inline-flex rounded-full border border-gold/35 px-5 py-3 text-sm font-bold text-gold">hej@iboren.se</a>
          </div>
        </div>
      </section>
    </main>
  );
}

function Info({ icon, title, text }: { icon: React.ReactNode; title: string; text: string }) {
  return <article className="rounded-[2rem] bg-cream p-6 shadow-soft"><div className="mb-6 grid h-12 w-12 place-items-center rounded-full bg-burgundy text-porcelain">{icon}</div><h3 className="display text-3xl font-bold text-burgundy">{title}</h3><p className="mt-3 leading-7 text-ink/65">{text}</p></article>;
}
