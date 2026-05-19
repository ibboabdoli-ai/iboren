import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, Building2, CalendarClock, CheckCircle2, ShieldCheck, Users } from "lucide-react";
import FaqStructuredData from "../FaqStructuredData";

export const metadata: Metadata = {
  title: "Kontorsstädning i Södertälje och Stockholm – Iboren",
  description: "Skicka en tydlig förfrågan för kontorsstädning i Södertälje och Stockholm. Iboren samlar lokal, yta, frekvens, tider och kontaktperson.",
  keywords: ["kontorsstädning", "kontorsstädning Södertälje", "kontorsstädning Stockholm", "företagsstädning", "städning kontor", "Iboren kontorsstädning"]
};

const points = [
  "Lokalstorlek och typ av arbetsplats",
  "Frekvens och önskade tider",
  "Praktiska instruktioner för uppdraget",
  "Kontaktperson och uppföljning"
];

const included = [
  "Information om lokal, yta och typ av arbetsplats",
  "Frekvens, önskade tider och praktiska begränsningar",
  "Kontaktperson och instruktioner inför offert",
  "Tydlig förfrågan innan återkommande service bekräftas"
];

const faq = [
  { q: "Kan företag skicka en förfrågan för kontorsstädning?", a: "Ja. Iboren hjälper företag att skicka en strukturerad förfrågan med lokal, yta, frekvens, tider och kontaktperson." },
  { q: "Kan kontorsstädning vara återkommande?", a: "Ja. I formuläret kan frekvens väljas, till exempel varje vecka, varannan vecka eller varje månad." },
  { q: "Vilka uppgifter behövs för kontorsstädning?", a: "Det är bra att ange lokalstorlek, typ av arbetsplats, önskade tider, parkering, kontaktperson och praktiska instruktioner." },
  { q: "Är förfrågan bindande direkt?", a: "Nej. Slutligt pris, omfattning, tider och villkor behöver bekräftas innan uppdrag startar." }
];

export default function KontorsstadningPage() {
  return (
    <main className="min-h-screen bg-cream text-ink">
      <FaqStructuredData items={faq} />
      <section className="relative overflow-hidden py-20 md:py-28">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_25%,rgba(212,165,116,.34),transparent_32%),radial-gradient(circle_at_20%_78%,rgba(107,39,55,.13),transparent_36%)]" />
        <div className="luxe-container relative grid gap-10 md:grid-cols-[.95fr_1.05fr] md:items-center">
          <div>
            <Link href="/" className="mb-10 inline-flex text-sm font-bold text-burgundy">← Tillbaka</Link>
            <p className="eyebrow">Iboren Business</p>
            <h1 className="display mt-4 text-6xl font-bold leading-[.88] text-burgundy md:text-8xl">Kontorsstädning</h1>
            <p className="mt-7 max-w-2xl text-lg leading-8 text-ink/70 md:text-xl">För företag i Södertälje och Stockholm som vill ha ett strukturerat sätt att skicka in förfrågan för kontor, lokaler och återkommande städning.</p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row"><Link href="/#booking" className="btn-primary">Skapa företagsförfrågan <ArrowRight size={18} /></Link><Link href="/stadning-stockholm" className="btn-secondary">Städning Stockholm</Link></div>
          </div>
          <div className="rounded-[2.5rem] border border-burgundy/10 bg-porcelain p-8 shadow-luxe">
            <div className="mb-12 flex items-center justify-between"><div className="grid h-16 w-16 place-items-center rounded-full bg-burgundy text-porcelain"><Building2 size={31} /></div><span className="rounded-full bg-gold/25 px-4 py-2 text-xs font-bold uppercase tracking-[.24em] text-burgundy">B2B</span></div>
            <h2 className="display text-4xl font-bold text-burgundy">Tydligare underlag för återkommande service.</h2>
            <div className="mt-7 grid gap-4">{points.map((item) => <p key={item} className="flex gap-3 text-ink/70"><CheckCircle2 className="mt-1 h-5 w-5 shrink-0 text-burgundy" /> {item}</p>)}</div>
          </div>
        </div>
      </section>

      <section className="bg-ink py-16 text-porcelain"><div className="luxe-container grid gap-5 md:grid-cols-2"><Info icon={<CalendarClock />} title="Planering" text="Samla önskade dagar, tider och frekvens redan i första förfrågan." /><Info icon={<Users />} title="Kontaktperson" text="Gör det lättare att följa upp med rätt person hos företaget." /></div></section>

      <section className="bg-cream py-16">
        <div className="luxe-container grid gap-10 md:grid-cols-[.9fr_1.1fr] md:items-start">
          <div><p className="eyebrow">Vad ingår i underlaget?</p><h2 className="display mt-3 text-4xl font-bold text-burgundy md:text-6xl">Kontorsstädning med tydligare driftplanering.</h2><p className="mt-5 leading-8 text-ink/65">För företag är detaljer som tider, omfattning och kontaktperson avgörande. Iboren gör första förfrågan mer komplett.</p></div>
          <div className="grid gap-4">{included.map((item) => <p key={item} className="flex gap-3 rounded-2xl bg-porcelain p-5 text-ink/70 shadow-sm"><ShieldCheck className="mt-1 h-5 w-5 shrink-0 text-burgundy" /> {item}</p>)}</div>
        </div>
      </section>

      <section className="bg-porcelain py-16">
        <div className="luxe-container max-w-4xl">
          <p className="eyebrow">FAQ</p><h2 className="display mt-3 text-4xl font-bold text-burgundy md:text-6xl">Vanliga frågor om kontorsstädning.</h2>
          <div className="mt-10 grid gap-4">{faq.map((item) => <article key={item.q} className="rounded-[1.5rem] bg-cream p-6 shadow-sm"><h3 className="font-bold text-burgundy">{item.q}</h3><p className="mt-2 leading-7 text-ink/65">{item.a}</p></article>)}</div>
          <div className="mt-10 rounded-[2rem] bg-burgundy p-7 text-porcelain"><h2 className="display text-4xl font-bold">Redo att skicka företagsförfrågan?</h2><p className="mt-3 text-porcelain/70">Fyll i lokal, frekvens och kontaktuppgifter så återkommer Iboren.</p><Link href="/#booking" className="mt-6 inline-flex rounded-full bg-gold px-5 py-3 text-sm font-black uppercase tracking-[.12em] text-ink">Starta bokning</Link></div>
        </div>
      </section>
    </main>
  );
}

function Info({ icon, title, text }: { icon: React.ReactNode; title: string; text: string }) {
  return <article className="rounded-[2rem] border border-porcelain/10 bg-porcelain/8 p-7"><div className="mb-6 grid h-12 w-12 place-items-center rounded-full bg-gold text-ink">{icon}</div><h3 className="display text-3xl font-bold text-gold">{title}</h3><p className="mt-3 leading-7 text-porcelain/65">{text}</p></article>;
}
