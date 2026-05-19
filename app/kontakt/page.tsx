import type { Metadata } from "next";
import Link from "next/link";
import { Mail, MapPin, Clock, ArrowRight, CheckCircle2 } from "lucide-react";

export const metadata: Metadata = {
  title: "Kontakt – Iboren Städning i Södertälje och Stockholm",
  description: "Kontakta Iboren för hemstädning, flyttstädning, kontorsstädning och fönsterputs i Södertälje och Stockholm.",
  alternates: { canonical: "https://iboren.se/kontakt" }
};

export default function KontaktPage() {
  return (
    <main className="min-h-screen bg-cream text-ink">
      <section className="relative overflow-hidden py-20 md:py-28">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_20%,rgba(212,165,116,.35),transparent_32%),radial-gradient(circle_at_18%_75%,rgba(107,39,55,.14),transparent_34%)]" />
        <div className="luxe-container relative grid gap-10 md:grid-cols-[1fr_.9fr] md:items-start">
          <div>
            <Link href="/" className="mb-10 inline-flex text-sm font-bold text-burgundy">← Tillbaka</Link>
            <p className="eyebrow">Kontakt</p>
            <h1 className="display mt-4 text-6xl font-bold leading-[.88] text-burgundy md:text-8xl">Kontakta Iboren</h1>
            <p className="mt-7 max-w-2xl text-lg leading-8 text-ink/75 md:text-xl">Har du frågor om städning, pris, RUT-avdrag eller en bokningsförfrågan? Kontakta Iboren så återkommer vi så snart som möjligt.</p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Link href="/priser" className="btn-primary">Beräkna pris <ArrowRight size={18} /></Link>
              <Link href="/#booking" className="btn-secondary">Boka städning</Link>
            </div>
          </div>

          <aside className="rounded-[2.5rem] border border-burgundy/10 bg-porcelain/80 p-8 shadow-luxe backdrop-blur-xl">
            <h2 className="display text-4xl font-bold text-burgundy">Kontaktuppgifter</h2>
            <div className="mt-7 grid gap-5">
              <a href="mailto:hej@iboren.se" className="flex gap-3 rounded-2xl bg-cream p-5 text-ink/80 shadow-sm hover:text-burgundy"><Mail className="mt-1 h-5 w-5 shrink-0 text-burgundy" /> hej@iboren.se</a>
              <p className="flex gap-3 rounded-2xl bg-cream p-5 text-ink/80 shadow-sm"><MapPin className="mt-1 h-5 w-5 shrink-0 text-burgundy" /> Södertälje och Stockholm</p>
              <p className="flex gap-3 rounded-2xl bg-cream p-5 text-ink/80 shadow-sm"><Clock className="mt-1 h-5 w-5 shrink-0 text-burgundy" /> Vi återkommer normalt så snart vi kan.</p>
            </div>
          </aside>
        </div>
      </section>

      <section className="bg-porcelain py-16">
        <div className="luxe-container grid gap-5 md:grid-cols-3">
          {["Prisfrågor", "Bokningsfrågor", "Jobbansökan"].map((item) => <article key={item} className="rounded-[2rem] bg-cream p-6 shadow-soft"><CheckCircle2 className="mb-5 text-burgundy" /><h2 className="display text-3xl font-bold text-burgundy">{item}</h2><p className="mt-3 leading-7 text-ink/75">Skicka din fråga via e-post eller använd rätt sida för pris, bokning eller jobb.</p></article>)}
        </div>
      </section>
    </main>
  );
}
