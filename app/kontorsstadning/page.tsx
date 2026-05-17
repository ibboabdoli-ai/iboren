import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, Building2, CalendarClock, CheckCircle2, Users } from "lucide-react";

export const metadata: Metadata = {
  title: "Kontorsstädning – Iboren",
  description: "Boka kontorsstädning med Iboren. Skapa en tydlig förfrågan för lokal, yta, frekvens och tider."
};

const points = [
  "Lokalstorlek och typ av arbetsplats",
  "Frekvens och önskade tider",
  "Åtkomst, larm och praktiska instruktioner",
  "Kontaktperson och uppföljning"
];

export default function KontorsstadningPage() {
  return (
    <main className="min-h-screen bg-cream text-ink">
      <section className="relative overflow-hidden py-20 md:py-28">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_25%,rgba(212,165,116,.34),transparent_32%),radial-gradient(circle_at_20%_78%,rgba(107,39,55,.13),transparent_36%)]" />
        <div className="luxe-container relative grid gap-10 md:grid-cols-[.95fr_1.05fr] md:items-center">
          <div>
            <Link href="/" className="mb-10 inline-flex text-sm font-bold text-burgundy">← Tillbaka</Link>
            <p className="eyebrow">Iboren Business</p>
            <h1 className="display mt-4 text-6xl font-bold leading-[.88] text-burgundy md:text-8xl">Kontorsstädning</h1>
            <p className="mt-7 max-w-2xl text-lg leading-8 text-ink/70 md:text-xl">För företag som vill ha ett strukturerat sätt att skicka in förfrågan för kontor, lokaler och återkommande städning.</p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row"><Link href="/#booking" className="btn-primary">Skapa företagsförfrågan <ArrowRight size={18} /></Link><Link href="/#services" className="btn-secondary">Till startsidan</Link></div>
          </div>
          <div className="rounded-[2.5rem] border border-burgundy/10 bg-porcelain p-8 shadow-luxe">
            <div className="mb-12 flex items-center justify-between"><div className="grid h-16 w-16 place-items-center rounded-full bg-burgundy text-porcelain"><Building2 size={31} /></div><span className="rounded-full bg-gold/25 px-4 py-2 text-xs font-bold uppercase tracking-[.24em] text-burgundy">B2B</span></div>
            <h2 className="display text-4xl font-bold text-burgundy">Tydligare underlag för återkommande service.</h2>
            <div className="mt-7 grid gap-4">{points.map((item) => <p key={item} className="flex gap-3 text-ink/70"><CheckCircle2 className="mt-1 h-5 w-5 shrink-0 text-burgundy" /> {item}</p>)}</div>
          </div>
        </div>
      </section>
      <section className="bg-ink py-16 text-porcelain"><div className="luxe-container grid gap-5 md:grid-cols-2"><Info icon={<CalendarClock />} title="Planering" text="Samla önskade dagar, tider och frekvens redan i första förfrågan." /><Info icon={<Users />} title="Kontaktperson" text="Gör det lättare att följa upp med rätt person hos företaget." /></div></section>
    </main>
  );
}

function Info({ icon, title, text }: { icon: React.ReactNode; title: string; text: string }) {
  return <article className="rounded-[2rem] border border-porcelain/10 bg-porcelain/8 p-7"><div className="mb-6 grid h-12 w-12 place-items-center rounded-full bg-gold text-ink">{icon}</div><h3 className="display text-3xl font-bold text-gold">{title}</h3><p className="mt-3 leading-7 text-porcelain/65">{text}</p></article>;
}
