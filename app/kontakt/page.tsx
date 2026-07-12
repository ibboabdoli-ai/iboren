import type { Metadata } from "next";
import Link from "next/link";
import { Mail, MapPin, Clock, ArrowRight, CheckCircle2, Phone } from "lucide-react";

export const metadata: Metadata = {
  title: "Kontakt – Iboren Städning i Södertälje och Stockholm",
  description: "Kontakta Iboren för hemstädning, flyttstädning, kontorsstädning och fönsterputs i Södertälje och Stockholm.",
  alternates: {
    canonical: "https://iboren.se/kontakt",
    languages: {
      sv: "https://iboren.se/kontakt",
      en: "https://iboren.se/en/contact",
    },
  }
};

export default function KontaktPage() {
  return (
    <main className="iboren-page-dark min-h-screen">
      <section className="relative overflow-hidden py-20 md:py-28">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_20%,rgba(212,165,116,.35),transparent_32%),radial-gradient(circle_at_18%_75%,rgba(107,39,55,.14),transparent_34%)]" />
        <div className="luxe-container relative grid gap-10 md:grid-cols-[1fr_.9fr] md:items-start">
          <div>
            <Link href="/" className="iboren-gold-accent mb-10 inline-flex text-sm font-bold">← Tillbaka</Link>
            <p className="iboren-gold-accent text-[11px] font-bold uppercase tracking-[.38em]">Kontakt</p>
            <h1 className="display mt-4 text-6xl font-bold leading-[.88] text-porcelain md:text-8xl">Kontakta Iboren</h1>
            <p className="iboren-text-muted-dark mt-7 max-w-2xl text-lg leading-8 md:text-xl">Har du frågor om städning, pris, RUT-avdrag eller en bokningsförfrågan? Kontakta Iboren så återkommer vi så snart som möjligt.</p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Link href="/priser" className="btn-primary">Beräkna pris <ArrowRight size={18} /></Link>
              <Link href="/#booking" className="btn-secondary">Boka städning</Link>
            </div>
          </div>

          <aside className="iboren-card-glass iboren-card-glass-hover rounded-[2.5rem] p-8">
            <h2 className="iboren-gold-accent display text-4xl font-bold">Kontaktuppgifter</h2>
            <div className="mt-7 grid gap-5">
              <a href="mailto:hej@iboren.se" className="iboren-card-glass iboren-card-glass-hover iboren-text-muted-dark flex gap-3 rounded-2xl p-5"><Mail className="iboren-gold-accent mt-1 h-5 w-5 shrink-0" /> hej@iboren.se</a>
              <a href="tel:+46760354141" className="iboren-card-glass iboren-card-glass-hover iboren-text-muted-dark flex gap-3 rounded-2xl p-5"><Phone className="iboren-gold-accent mt-1 h-5 w-5 shrink-0" /> 076 035 41 41</a>
              <p className="iboren-card-glass iboren-card-glass-hover iboren-text-muted-dark flex gap-3 rounded-2xl p-5"><MapPin className="iboren-gold-accent mt-1 h-5 w-5 shrink-0" /> Södertälje och Stockholm</p>
              <p className="iboren-card-glass iboren-card-glass-hover iboren-text-muted-dark flex gap-3 rounded-2xl p-5"><Clock className="iboren-gold-accent mt-1 h-5 w-5 shrink-0" /> Vi återkommer normalt så snart vi kan.</p>
            </div>
          </aside>
        </div>
      </section>

      <section className="iboren-section-dark py-16">
        <div className="luxe-container grid gap-5 md:grid-cols-3">
          {["Prisfrågor", "Bokningsfrågor", "Jobbansökan"].map((item) => <article key={item} className="iboren-card-glass iboren-card-glass-hover rounded-[2rem] p-6"><CheckCircle2 className="iboren-gold-accent mb-5" /><h2 className="iboren-gold-accent display text-3xl font-bold">{item}</h2><p className="iboren-text-muted-dark mt-3 leading-7">Skicka din fråga via e-post eller använd rätt sida för pris, bokning eller jobb.</p></article>)}
        </div>
      </section>
    </main>
  );
}
