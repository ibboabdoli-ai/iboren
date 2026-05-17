import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, CheckCircle2, ClipboardCheck, Truck } from "lucide-react";

export const metadata: Metadata = {
  title: "Flyttstädning – Iboren",
  description: "Boka flyttstädning med Iboren. CleanAI samlar adress, yta, datum och önskemål för en tydlig offertförfrågan."
};

const checklist = [
  "Yta och bostadstyp",
  "Önskat datum och tidsfönster",
  "Adress och åtkomstinformation",
  "Särskilda önskemål inför offert"
];

export default function FlyttstadningPage() {
  return (
    <main className="min-h-screen bg-cream text-ink">
      <section className="relative overflow-hidden py-20 md:py-28">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_75%_20%,rgba(107,39,55,.17),transparent_32%),radial-gradient(circle_at_18%_75%,rgba(212,165,116,.35),transparent_34%)]" />
        <div className="luxe-container relative grid gap-10 md:grid-cols-[1fr_.95fr] md:items-center">
          <div>
            <Link href="/" className="mb-10 inline-flex text-sm font-bold text-burgundy">← Tillbaka</Link>
            <p className="eyebrow">Iboren Services</p>
            <h1 className="display mt-4 text-6xl font-bold leading-[.88] text-burgundy md:text-8xl">Flyttstädning</h1>
            <p className="mt-7 max-w-2xl text-lg leading-8 text-ink/70 md:text-xl">Flyttstädning kräver tydligt underlag. Iboren samlar rätt detaljer direkt så att offert och planering blir enklare.</p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row"><Link href="/#booking" className="btn-primary">Starta förfrågan <ArrowRight size={18} /></Link><Link href="/#services" className="btn-secondary">Alla tjänster</Link></div>
          </div>
          <aside className="rounded-[2.5rem] bg-ink p-8 text-porcelain shadow-luxe">
            <div className="mb-12 flex items-center justify-between"><div className="grid h-16 w-16 place-items-center rounded-full bg-gold text-ink"><Truck size={31} /></div><span className="rounded-full border border-gold/30 px-4 py-2 text-xs font-bold uppercase tracking-[.24em] text-gold">Move-out</span></div>
            <h2 className="display text-4xl font-bold">CleanAI frågar rätt saker.</h2>
            <div className="mt-7 grid gap-4">{checklist.map((item) => <p key={item} className="flex gap-3 text-porcelain/72"><CheckCircle2 className="mt-1 h-5 w-5 shrink-0 text-gold" /> {item}</p>)}</div>
          </aside>
        </div>
      </section>
      <section className="bg-porcelain py-16"><div className="luxe-container rounded-[2rem] bg-cream p-8 shadow-soft"><div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between"><div><p className="eyebrow">Offertunderlag</p><h2 className="display mt-3 text-4xl font-bold text-burgundy">Ingen bindande bokning innan bekräftelse.</h2></div><ClipboardCheck className="h-14 w-14 text-burgundy" /></div><p className="mt-5 max-w-3xl leading-8 text-ink/65">Formuläret skapar en tydlig förfrågan. Slutligt pris och tid ska alltid bekräftas innan uppdrag utförs.</p></div></section>
    </main>
  );
}
