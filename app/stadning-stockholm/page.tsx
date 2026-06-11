import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, Building2, CheckCircle2, Home, MapPin, Sparkles, Truck } from "lucide-react";
import FaqStructuredData from "../FaqStructuredData";

export const metadata: Metadata = {
  title: "Städning i Stockholm – Hemstädning, flyttstädning & kontor | Iboren",
  description: "Boka städning i Stockholm med Iboren. Skapa en tydlig förfrågan för hemstädning, flyttstädning, kontorsstädning och fönsterputs.",
  keywords: ["städning Stockholm", "hemstädning Stockholm", "flyttstädning Stockholm", "städfirma Stockholm", "kontorsstädning Stockholm", "fönsterputs Stockholm"],
  alternates: {
    canonical: "https://iboren.se/stadning-stockholm",
    languages: {
      sv: "https://iboren.se/stadning-stockholm",
      en: "https://iboren.se/en/cleaning-stockholm",
    },
  },
  openGraph: {
    title: "Städning i Stockholm – Hemstädning, flyttstädning & kontor | Iboren",
    description: "Boka städning i Stockholm med Iboren. Skapa en tydlig förfrågan för hemstädning, flyttstädning, kontorsstädning och fönsterputs.",
    url: "https://iboren.se/stadning-stockholm",
  },
};

const services = [
  { icon: <Home />, title: "Hemstädning i Stockholm", text: "För hem, lägenheter och återkommande bokningsförfrågningar med tydligt underlag." },
  { icon: <Truck />, title: "Flyttstädning i Stockholm", text: "För flyttstädning där adress, yta, datum och praktiska detaljer behöver stämmas av." },
  { icon: <Building2 />, title: "Kontorsstädning i Stockholm", text: "För kontor och lokaler med behov av återkommande service och tydlig kontaktväg." },
  { icon: <Sparkles />, title: "Fönsterputs", text: "För hem och arbetsplatser, som separat tjänst eller tillval till annan städning." }
];

const faq = [
  { q: "Kan jag skicka en städförfrågan i Stockholm online?", a: "Ja, Iboren samlar uppgifter om tjänst, adress, storlek, datum och kontakt så att förfrågan blir lättare att hantera." },
  { q: "Är bokningen bindande direkt?", a: "Nej. En inskickad förfrågan blir bekräftad först när tid, omfattning och villkor har stämts av." },
  { q: "Vilka tjänster går att välja?", a: "Du kan välja hemstädning, flyttstädning, kontorsstädning och fönsterputs samt extra tjänster i formuläret." },
  { q: "Får jag bekräftelse via e-post?", a: "Ja. När förfrågan skickas får du en bekräftelse via e-post, och statusuppdateringar kan skickas när bokningen hanteras." }
];

export default function StadningStockholmPage() {
  return (
    <main className="iboren-page-dark min-h-screen overflow-x-hidden">
      <FaqStructuredData items={faq} />
      <section className="relative overflow-hidden py-20 md:py-28">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_20%,rgba(212,165,116,.35),transparent_32%),radial-gradient(circle_at_18%_75%,rgba(107,39,55,.14),transparent_34%)]" />
        <div className="luxe-container relative grid gap-10 md:grid-cols-[1fr_.9fr] md:items-center">
          <div>
            <Link href="/" className="iboren-gold-accent mb-10 inline-flex text-sm font-bold">← Tillbaka</Link>
            <p className="iboren-gold-accent text-[11px] font-bold uppercase tracking-[.38em]">Lokal städservice</p>
            <h1 className="display mt-4 max-w-full text-5xl font-bold leading-[.9] text-porcelain md:text-8xl">Städning i Stockholm</h1>
            <p className="iboren-text-muted-dark mt-7 max-w-2xl text-lg leading-8 md:text-xl">Iboren hjälper kunder i Stockholm att skapa tydliga bokningsförfrågningar för hemstädning, flyttstädning, kontorsstädning och fönsterputs.</p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Link href="/priser#pris-kalkylator" className="btn-primary">Få pris direkt <ArrowRight size={18} /></Link>
              <Link href="/tjanster" className="btn-secondary">Se tjänster</Link>
            </div>
          </div>
          <aside className="iboren-card-glass iboren-card-glass-hover rounded-[2.5rem] p-8">
            <div className="iboren-gold-accent mb-12 grid h-16 w-16 place-items-center rounded-full border border-gold/30 bg-gold/10"><MapPin size={30} /></div>
            <h2 className="display text-4xl font-bold text-porcelain">Strukturerad bokning för en större stad.</h2>
            <div className="mt-7 grid gap-4">
              {["Tjänst och område", "Adress och praktiska detaljer", "Storlek och omfattning", "Datum, tidsfönster och kontakt"].map((item) => <p key={item} className="iboren-text-muted-dark flex gap-3"><CheckCircle2 className="iboren-gold-accent mt-1 h-5 w-5 shrink-0" /> {item}</p>)}
            </div>
          </aside>
        </div>
      </section>

      <section className="iboren-section-dark py-16">
        <div className="luxe-container">
          <p className="iboren-gold-accent text-[11px] font-bold uppercase tracking-[.38em]">Tjänster i Stockholm</p>
          <h2 className="display mt-3 text-4xl font-bold text-porcelain md:text-6xl">Städning för hem, flytt och arbetsplats.</h2>
          <div className="mt-10 grid gap-5 md:grid-cols-2">
            {services.map((service) => <article key={service.title} className="iboren-card-glass iboren-card-glass-hover rounded-[2rem] p-6"><div className="iboren-gold-accent mb-6 grid h-12 w-12 place-items-center rounded-full border border-gold/30 bg-gold/10">{service.icon}</div><h3 className="display text-3xl font-bold text-porcelain">{service.title}</h3><p className="iboren-text-muted-dark mt-3 leading-7">{service.text}</p></article>)}
          </div>
        </div>
      </section>

      <section className="iboren-page-dark py-16">
        <div className="luxe-container max-w-4xl">
          <p className="iboren-gold-accent text-[11px] font-bold uppercase tracking-[.38em]">FAQ</p>
          <h2 className="display mt-3 text-4xl font-bold text-porcelain md:text-6xl">Vanliga frågor om städning i Stockholm.</h2>
          <div className="mt-10 grid gap-4">
            {faq.map((item) => <article key={item.q} className="iboren-card-glass iboren-card-glass-hover rounded-[1.5rem] p-6"><h3 className="iboren-gold-accent font-bold">{item.q}</h3><p className="iboren-text-muted-dark mt-2 leading-7">{item.a}</p></article>)}
          </div>
          <div className="iboren-card-glass iboren-card-glass-hover mt-10 rounded-[2rem] p-7"><h2 className="display text-4xl font-bold text-porcelain">Skicka en tydlig förfrågan.</h2><p className="iboren-text-muted-dark mt-3">Fyll i tjänst, plats, datum och önskemål så återkommer Iboren.</p><Link href="/priser#pris-kalkylator" className="mt-6 inline-flex rounded-full bg-gold px-5 py-3 text-sm font-black uppercase tracking-[.12em] text-ink">Få pris direkt</Link></div>
        </div>
      </section>
    </main>
  );
}
