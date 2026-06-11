import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, CheckCircle2, Home, MapPin, Truck, Building2 } from "lucide-react";
import FaqStructuredData from "../FaqStructuredData";

export const metadata: Metadata = {
  title: "Städning i Södertälje – Hemstädning, flyttstädning & kontor | Iboren",
  description: "Boka städning i Södertälje med Iboren. Skapa en tydlig förfrågan för hemstädning, flyttstädning, kontorsstädning och fönsterputs.",
  keywords: ["städning Södertälje", "hemstädning Södertälje", "flyttstädning Södertälje", "städfirma Södertälje", "kontorsstädning Södertälje", "fönsterputs Södertälje"],
  alternates: { canonical: "https://iboren.se/stadning-sodertalje" },
  openGraph: {
    title: "Städning i Södertälje – Hemstädning, flyttstädning & kontor | Iboren",
    description: "Boka städning i Södertälje med Iboren. Skapa en tydlig förfrågan för hemstädning, flyttstädning, kontorsstädning och fönsterputs.",
    url: "https://iboren.se/stadning-sodertalje",
  },
};

const services = [
  { icon: <Home />, title: "Hemstädning i Södertälje", text: "För enstaka eller återkommande städning hemma med tydlig bokningsförfrågan." },
  { icon: <Truck />, title: "Flyttstädning i Södertälje", text: "För flytt, överlämning och offertunderlag med yta, adress och datum." },
  { icon: <Building2 />, title: "Kontorsstädning i Södertälje", text: "För företag och lokaler där frekvens, tider och kontaktperson behöver vara tydliga." }
];

const faq = [
  { q: "Kan jag boka städning i Södertälje direkt online?", a: "Du kan skicka en bokningsförfrågan direkt via Iboren. Bokningen blir bekräftad först när tid, omfattning och villkor har stämts av." },
  { q: "Vilka städtjänster kan jag fråga om?", a: "Du kan skapa förfrågan för hemstädning, flyttstädning, kontorsstädning och fönsterputs." },
  { q: "Behöver jag logga in?", a: "Nej, du kan skicka en förfrågan utan konto. Om du loggar in kan du spara och följa dina förfrågningar på din profil." },
  { q: "Kan jag använda min nuvarande position?", a: "Ja, platsdelning är frivillig och används bara för att föreslå adress eller område. Du kan alltid skriva adressen manuellt." }
];

export default function StadningSodertaljePage() {
  return (
    <main className="iboren-page-dark min-h-screen overflow-x-hidden">
      <FaqStructuredData items={faq} />
      <section className="relative overflow-hidden py-20 md:py-28">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_20%,rgba(212,165,116,.35),transparent_32%),radial-gradient(circle_at_18%_75%,rgba(107,39,55,.14),transparent_34%)]" />
        <div className="luxe-container relative grid gap-10 md:grid-cols-[1fr_.9fr] md:items-center">
          <div>
            <Link href="/" className="iboren-gold-accent mb-10 inline-flex text-sm font-bold">← Tillbaka</Link>
            <p className="iboren-gold-accent text-[11px] font-bold uppercase tracking-[.38em]">Lokal städservice</p>
            <h1 className="display mt-4 max-w-full text-5xl font-bold leading-[.9] text-porcelain md:text-8xl">Städning i Södertälje</h1>
            <p className="iboren-text-muted-dark mt-7 max-w-2xl text-lg leading-8 md:text-xl">Iboren hjälper dig skapa en tydlig bokningsförfrågan för städning i Södertälje: hemstädning, flyttstädning, kontorsstädning och fönsterputs.</p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Link href="/priser#pris-kalkylator" className="btn-primary">Få pris direkt <ArrowRight size={18} /></Link>
              <Link href="/tjanster" className="btn-secondary">Se tjänster</Link>
            </div>
          </div>
          <aside className="iboren-card-glass iboren-card-glass-hover rounded-[2.5rem] p-8">
            <div className="iboren-gold-accent mb-12 grid h-16 w-16 place-items-center rounded-full border border-gold/30 bg-gold/10"><MapPin size={30} /></div>
            <h2 className="display text-4xl font-bold text-porcelain">Tydligt underlag från första kontakt.</h2>
            <div className="mt-7 grid gap-4">
              {["Adress och område", "Storlek och antal rum", "Önskat datum och tidsfönster", "Extra tjänster och önskemål"].map((item) => <p key={item} className="iboren-text-muted-dark flex gap-3"><CheckCircle2 className="iboren-gold-accent mt-1 h-5 w-5 shrink-0" /> {item}</p>)}
            </div>
          </aside>
        </div>
      </section>

      <section className="iboren-section-dark py-16">
        <div className="luxe-container">
          <p className="iboren-gold-accent text-[11px] font-bold uppercase tracking-[.38em]">Tjänster i Södertälje</p>
          <h2 className="display mt-3 text-4xl font-bold text-porcelain md:text-6xl">Välj rätt städning för behovet.</h2>
          <div className="mt-10 grid gap-5 md:grid-cols-3">
            {services.map((service) => <article key={service.title} className="iboren-card-glass iboren-card-glass-hover rounded-[2rem] p-6"><div className="iboren-gold-accent mb-6 grid h-12 w-12 place-items-center rounded-full border border-gold/30 bg-gold/10">{service.icon}</div><h3 className="display text-3xl font-bold text-porcelain">{service.title}</h3><p className="iboren-text-muted-dark mt-3 leading-7">{service.text}</p></article>)}
          </div>
        </div>
      </section>

      <section className="iboren-page-dark py-16">
        <div className="luxe-container max-w-4xl">
          <p className="iboren-gold-accent text-[11px] font-bold uppercase tracking-[.38em]">FAQ</p>
          <h2 className="display mt-3 text-4xl font-bold text-porcelain md:text-6xl">Vanliga frågor om städning i Södertälje.</h2>
          <div className="mt-10 grid gap-4">
            {faq.map((item) => <article key={item.q} className="iboren-card-glass iboren-card-glass-hover rounded-[1.5rem] p-6"><h3 className="iboren-gold-accent font-bold">{item.q}</h3><p className="iboren-text-muted-dark mt-2 leading-7">{item.a}</p></article>)}
          </div>
          <div className="iboren-card-glass iboren-card-glass-hover mt-10 rounded-[2rem] p-7"><h2 className="display text-4xl font-bold text-porcelain">Redo att skicka förfrågan?</h2><p className="iboren-text-muted-dark mt-3">Fyll i tjänst, adress, datum och kontaktuppgifter så återkommer Iboren.</p><Link href="/priser#pris-kalkylator" className="mt-6 inline-flex rounded-full bg-gold px-5 py-3 text-sm font-black uppercase tracking-[.12em] text-ink">Få pris direkt</Link></div>
        </div>
      </section>
    </main>
  );
}
