import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, CheckCircle2, ClipboardCheck, ShieldCheck, Truck } from "lucide-react";
import FaqStructuredData from "../FaqStructuredData";

export const metadata: Metadata = {
  title: "Flyttstädning i Södertälje och Stockholm – Iboren",
  description: "Skicka en tydlig förfrågan för flyttstädning i Södertälje och Stockholm. Iboren samlar adress, yta, datum, bostadstyp och önskemål inför offert.",
  keywords: ["flyttstädning", "flyttstädning Södertälje", "flyttstädning Stockholm", "flyttstäd", "städ inför flytt", "Iboren flyttstädning"]
};

const checklist = [
  "Yta och bostadstyp",
  "Önskat datum och tidsfönster",
  "Adress och åtkomstinformation",
  "Särskilda önskemål inför offert"
];

const included = [
  "Bokningsunderlag med adress, storlek, antal rum och badrum",
  "Datum, tidsfönster och praktiska tillträdesuppgifter",
  "Möjlighet att ange extra behov som fönster, ugn, skåp eller balkong",
  "Offert och bekräftelse innan uppdraget utförs"
];

const faq = [
  { q: "Är flyttstädningen bokad direkt när jag skickar formuläret?", a: "Nej. Formuläret skickar en bokningsförfrågan. Tid, omfattning och villkor behöver bekräftas innan uppdrag utförs." },
  { q: "Vilka uppgifter behövs för flyttstädning?", a: "Vanligtvis behövs adress, yta, bostadstyp, antal rum, antal badrum, önskat datum, tidsfönster och eventuella extra önskemål." },
  { q: "Kan jag fråga om flyttstädning i Södertälje?", a: "Ja. Iboren har en lokal sida för städning i Södertälje och formuläret kan användas för flyttstädning där." },
  { q: "Kan fönsterputs ingå i förfrågan?", a: "Du kan välja fönsterputs som extra tjänst eller skriva särskilda önskemål i formuläret. Slutlig omfattning bekräftas innan uppdrag." }
];

export default function FlyttstadningPage() {
  return (
    <main className="min-h-screen bg-cream text-ink">
      <FaqStructuredData items={faq} />
      <section className="relative overflow-hidden py-20 md:py-28">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_75%_20%,rgba(107,39,55,.17),transparent_32%),radial-gradient(circle_at_18%_75%,rgba(212,165,116,.35),transparent_34%)]" />
        <div className="luxe-container relative grid gap-10 md:grid-cols-[1fr_.95fr] md:items-center">
          <div>
            <Link href="/" className="mb-10 inline-flex text-sm font-bold text-burgundy">← Tillbaka</Link>
            <p className="eyebrow">Iboren Services</p>
            <h1 className="display mt-4 text-6xl font-bold leading-[.88] text-burgundy md:text-8xl">Flyttstädning</h1>
            <p className="mt-7 max-w-2xl text-lg leading-8 text-ink/70 md:text-xl">Flyttstädning kräver tydligt underlag. Iboren samlar rätt detaljer direkt så att offert och planering blir enklare för flyttstädning i Södertälje och Stockholm.</p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row"><Link href="/#booking" className="btn-primary">Starta förfrågan <ArrowRight size={18} /></Link><Link href="/stadning-sodertalje" className="btn-secondary">Flyttstädning Södertälje</Link></div>
          </div>
          <aside className="rounded-[2.5rem] bg-ink p-8 text-porcelain shadow-luxe">
            <div className="mb-12 flex items-center justify-between"><div className="grid h-16 w-16 place-items-center rounded-full bg-gold text-ink"><Truck size={31} /></div><span className="rounded-full border border-gold/30 px-4 py-2 text-xs font-bold uppercase tracking-[.24em] text-gold">Move-out</span></div>
            <h2 className="display text-4xl font-bold">Rätt detaljer innan offert.</h2>
            <div className="mt-7 grid gap-4">{checklist.map((item) => <p key={item} className="flex gap-3 text-porcelain/72"><CheckCircle2 className="mt-1 h-5 w-5 shrink-0 text-gold" /> {item}</p>)}</div>
          </aside>
        </div>
      </section>

      <section className="bg-porcelain py-16"><div className="luxe-container rounded-[2rem] bg-cream p-8 shadow-soft"><div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between"><div><p className="eyebrow">Offertunderlag</p><h2 className="display mt-3 text-4xl font-bold text-burgundy">Ingen bindande bokning innan bekräftelse.</h2></div><ClipboardCheck className="h-14 w-14 text-burgundy" /></div><p className="mt-5 max-w-3xl leading-8 text-ink/65">Formuläret skapar en tydlig förfrågan. Slutligt pris, datum, garanti, RUT och omfattning ska alltid bekräftas innan uppdrag utförs.</p></div></section>

      <section className="bg-cream py-16">
        <div className="luxe-container grid gap-10 md:grid-cols-[.9fr_1.1fr] md:items-start">
          <div><p className="eyebrow">Vad ingår i förfrågan?</p><h2 className="display mt-3 text-4xl font-bold text-burgundy md:text-6xl">Flyttstädning med tydligare planering.</h2><p className="mt-5 leading-8 text-ink/65">En bra flyttstädning börjar med rätt information. Iboren gör första steget tydligt innan bokningen bekräftas.</p></div>
          <div className="grid gap-4">{included.map((item) => <p key={item} className="flex gap-3 rounded-2xl bg-porcelain p-5 text-ink/70 shadow-sm"><ShieldCheck className="mt-1 h-5 w-5 shrink-0 text-burgundy" /> {item}</p>)}</div>
        </div>
      </section>

      <section className="bg-porcelain py-16">
        <div className="luxe-container max-w-4xl">
          <p className="eyebrow">FAQ</p><h2 className="display mt-3 text-4xl font-bold text-burgundy md:text-6xl">Vanliga frågor om flyttstädning.</h2>
          <div className="mt-10 grid gap-4">{faq.map((item) => <article key={item.q} className="rounded-[1.5rem] bg-cream p-6 shadow-sm"><h3 className="font-bold text-burgundy">{item.q}</h3><p className="mt-2 leading-7 text-ink/65">{item.a}</p></article>)}</div>
          <div className="mt-10 rounded-[2rem] bg-burgundy p-7 text-porcelain"><h2 className="display text-4xl font-bold">Redo att skicka flyttstädningsförfrågan?</h2><p className="mt-3 text-porcelain/70">Fyll i adress, yta och önskat datum så återkommer Iboren.</p><Link href="/#booking" className="mt-6 inline-flex rounded-full bg-gold px-5 py-3 text-sm font-black uppercase tracking-[.12em] text-ink">Starta bokning</Link></div>
        </div>
      </section>
    </main>
  );
}
