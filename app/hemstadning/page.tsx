import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, CheckCircle2, Home, ShieldCheck, Sparkles } from "lucide-react";
import FaqStructuredData from "../FaqStructuredData";

export const metadata: Metadata = {
  title: "Hemstädning i Södertälje och Stockholm – Iboren",
  description: "Skicka en tydlig bokningsförfrågan för hemstädning i Södertälje och Stockholm. Ange bostadsyta, rum, badrum, frekvens, datum och extra önskemål.",
  keywords: ["hemstädning", "hemstädning Södertälje", "hemstädning Stockholm", "städhjälp hemma", "Iboren hemstädning"]
};

const items = [
  "För engångsstädning eller återkommande hemstädning",
  "Ange bostadsyta, antal rum, badrum, frekvens och önskat datum",
  "Lägg till extra behov som ugn, skåp, balkong eller fönsterputs",
  "Prisbild, RUT och omfattning bekräftas innan uppdrag"
];

const included = [
  "Kök, badrum, vardagsytor och sovrum enligt överenskommen omfattning",
  "Dammsugning, dammtorkning, avtorkning av ytor och våttorkning av golv efter behov",
  "Extra tjänster som ugn, kyl/frys, skåp, lådor, balkong och fönsterputs kan anges i förfrågan",
  "Frekvens, prisbild, RUT-information och särskilda önskemål bekräftas innan uppdraget planeras"
];

const faq = [
  { q: "Kan jag boka hemstädning direkt online?", a: "Du kan skicka en bokningsförfrågan online. Bokningen bekräftas först när tid, omfattning, prisbild och villkor har stämts av." },
  { q: "Kan jag välja återkommande hemstädning?", a: "Ja. I formuläret kan du välja engångsstädning, varje vecka, varannan vecka eller varje månad." },
  { q: "Vad brukar ingå i hemstädning?", a: "Hemstädning omfattar normalt kök, badrum, vardagsytor, sovrum, dammsugning, dammtorkning, avtorkning och våttorkning enligt överenskommen omfattning." },
  { q: "Kan jag lägga till extra tjänster?", a: "Ja. Du kan ange extra behov som ugn, kyl/frys, skåp, lådor, balkong eller fönsterputs i förfrågan." }
];

export default function HemstadningPage() {
  return (
    <main className="service-page-dark min-h-screen">
      <FaqStructuredData items={faq} />
      <section className="service-hero relative isolate overflow-hidden py-20 md:py-28">
        <img src="/service-heroes/home-cleaning.webp" alt="" aria-hidden="true" className="absolute inset-0 z-0 block h-full w-full object-cover" />
        <div aria-hidden="true" className="absolute inset-0 z-10 bg-[linear-gradient(90deg,rgba(24,25,23,.76)_0%,rgba(24,25,23,.52)_43%,rgba(24,25,23,.18)_100%)]" />
        <div className="luxe-container relative z-20 grid gap-10 md:grid-cols-[.95fr_1.05fr] md:items-center">
          <div>
            <Link href="/" className="service-back-link mb-10 inline-flex text-sm font-bold">← Tillbaka</Link>
            <p className="service-eyebrow text-xs font-black uppercase tracking-[.32em]">Iboren Services</p>
            <h1 className="service-title display mt-4 text-6xl font-bold leading-[.88] md:text-8xl">Hemstädning</h1>
            <p className="service-lead mt-7 max-w-2xl text-lg leading-8 md:text-xl">Skicka en tydlig förfrågan för hemstädning i Södertälje och Stockholm. Ange bostadsyta, antal rum, badrum, frekvens, datum och extra behov så att omfattning och prisbild kan bekräftas innan uppdraget planeras.</p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Link href="/boka-utan-konto" className="btn-primary">Starta bokning <ArrowRight size={18} /></Link>
              <Link href="/stadning-sodertalje" className="btn-secondary">Städning i Södertälje</Link>
            </div>
          </div>
          <div className="service-panel rounded-[2.5rem] p-8 shadow-luxe backdrop-blur-xl">
            <div className="mb-16 flex items-center justify-between">
              <div className="service-icon grid h-16 w-16 place-items-center rounded-full"><Home size={30} /></div>
              <span className="rounded-full border px-4 py-2 text-xs font-bold uppercase tracking-[.24em]">RUT-ready</span>
            </div>
            <h2 className="display text-4xl font-bold">För hem som ska kännas rena och omhändertagna.</h2>
            <div className="mt-7 grid gap-4">
              {items.map((item) => <p key={item} className="flex gap-3"><CheckCircle2 className="mt-1 h-5 w-5 shrink-0" /> {item}</p>)}
            </div>
          </div>
        </div>
      </section>

      <section className="py-16"><div className="luxe-container grid gap-5 md:grid-cols-3"><Info icon={<Sparkles />} title="Tydlig omfattning" text="Bostadsyta, rum, badrum, frekvens och extra behov samlas in från första förfrågan." /><Info icon={<ShieldCheck />} title="Tryggt underlag" text="Ingen bindande bokning innan pris, tid, RUT och omfattning bekräftas." /><Info icon={<Home />} title="Flexibelt" text="Passar både enstaka hemstädning, återkommande städning och tillval." /></div></section>

      <section className="py-16">
        <div className="luxe-container grid gap-10 md:grid-cols-[.9fr_1.1fr] md:items-start">
          <div>
            <p className="service-eyebrow text-xs font-black uppercase tracking-[.32em]">Vad ingår?</p>
            <h2 className="service-title display mt-3 text-4xl font-bold md:text-6xl">Hemstädning med tydlig omfattning innan offert.</h2>
            <p className="mt-5 leading-8">Hemstädning kan vara återkommande eller enstaka. Iboren samlar information om bostaden, frekvens, tillval och särskilda önskemål innan bokningen bekräftas.</p>
          </div>
          <div className="grid gap-4">
            {included.map((item) => <p key={item} className="service-card flex gap-3 rounded-2xl p-5 shadow-sm"><CheckCircle2 className="mt-1 h-5 w-5 shrink-0" /> {item}</p>)}
          </div>
        </div>
      </section>

      <section className="py-16">
        <div className="luxe-container max-w-4xl">
          <p className="service-eyebrow text-xs font-black uppercase tracking-[.32em]">FAQ</p>
          <h2 className="service-title display mt-3 text-4xl font-bold md:text-6xl">Vanliga frågor om hemstädning.</h2>
          <div className="mt-10 grid gap-4">
            {faq.map((item) => <article key={item.q} className="rounded-[1.5rem] p-6 shadow-sm"><h3 className="font-bold">{item.q}</h3><p className="mt-2 leading-7">{item.a}</p></article>)}
          </div>
          <div className="service-cta-card mt-10 rounded-[2rem] p-7"><h2 className="display text-4xl font-bold">Redo att boka hemstädning?</h2><p className="mt-3">Fyll i adress, storlek, rum, badrum, frekvens och önskat datum så återkommer Iboren.</p><Link href="/boka-utan-konto" className="mt-6 inline-flex rounded-full bg-gold px-5 py-3 text-sm font-black uppercase tracking-[.12em] text-ink">Starta bokning</Link></div>
        </div>
      </section>
    </main>
  );
}

function Info({ icon, title, text }: { icon: React.ReactNode; title: string; text: string }) {
  return <article className="rounded-[2rem] p-6 shadow-soft"><div className="service-icon mb-6 grid h-12 w-12 place-items-center rounded-full">{icon}</div><h3 className="display text-3xl font-bold">{title}</h3><p className="mt-3 leading-7">{text}</p></article>;
}
