import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, Building2, CircleHelp, Home, Sparkles, Truck, Waves } from "lucide-react";

export const metadata: Metadata = {
  title: "Tjänster – Städning i Södertälje och Stockholm | Iboren",
  description: "Se Iborens städtjänster: hemstädning, flyttstädning, kontorsstädning, fönsterputs, storstädning, byggstädning och visningsstädning.",
  alternates: { canonical: "https://iboren.se/tjanster", languages: { sv: "https://iboren.se/tjanster", en: "https://iboren.se/en/services" } }
};

const services = [
  { icon: Home, title: "Hemstädning", href: "/tjanster/hemstadning", text: "För återkommande eller enstaka städning hemma." },
  { icon: Truck, title: "Flyttstädning", href: "/tjanster/flyttstadning", text: "För flytt, överlämning och tydlig offertförfrågan." },
  { icon: Building2, title: "Kontorsstädning", href: "/tjanster/kontorsstadning", text: "För företag, kontor och återkommande service." },
  { icon: Waves, title: "Fönsterputs", href: "/tjanster/fonsterputs", text: "Som separat tjänst eller tillval till annan städning." },
  { icon: Sparkles, title: "Storstädning", href: "/tjanster/storstadning", text: "För hem som behöver en mer omfattande genomgång." },
  { icon: Building2, title: "Byggstädning", href: "/tjanster/byggstadning", text: "För ytor efter renovering, projekt eller arbete." },
  { icon: Home, title: "Visningsstädning", href: "/tjanster/visningsstadning", text: "Inför visning, fotografering eller försäljning." }
];

export default function TjansterPage() {
  return (
    <main className="service-page-dark min-h-screen">
      <section className="service-hero relative overflow-hidden py-20 md:py-28">
        <div className="luxe-container relative">
          <Link href="/" className="service-back-link mb-10 inline-flex text-sm font-bold">← Tillbaka</Link>
          <p className="service-eyebrow text-xs font-black uppercase tracking-[.32em]">Tjänster</p>
          <h1 className="service-title display mt-4 max-w-5xl text-6xl font-bold leading-[.88] md:text-8xl">Städtjänster i Södertälje och Stockholm</h1>
          <p className="service-lead mt-7 max-w-3xl text-lg leading-8 md:text-xl">Välj rätt städning för ditt hem, din flytt eller din arbetsplats. Du kan även beräkna ungefärligt pris innan du bokar.</p>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <Link href="/priser" className="btn-primary">Beräkna pris <ArrowRight size={18} /></Link>
            <Link href="/boka-utan-konto" className="btn-secondary">Boka städning</Link>
          </div>
        </div>
      </section>

      <section className="py-16">
        <div className="luxe-container grid gap-5 md:grid-cols-2">
          {services.map((service) => {
            const Icon = service.icon;
            return (
              <Link key={service.href} href={service.href} className="service-card iboren-card-glass iboren-card-glass-hover group rounded-[2rem] p-7 shadow-soft">
                <div className="mb-8 flex items-center justify-between">
                  <div className="service-icon grid h-14 w-14 place-items-center rounded-full"><Icon size={27} /></div>
                  <span className="text-sm font-bold text-gold group-hover:text-gold">Läs mer →</span>
                </div>
                <h2 className="display text-4xl font-bold">{service.title}</h2>
                <p className="mt-4 leading-7">{service.text}</p>
              </Link>
            );
          })}
        </div>
      </section>

      <section className="py-16">
        <div className="service-cta-card iboren-card-glass iboren-card-glass-hover luxe-container max-w-4xl rounded-[2rem] p-8 shadow-luxe">
          <div className="service-icon grid h-14 w-14 place-items-center rounded-full"><CircleHelp /></div>
          <h2 className="display mt-6 text-4xl font-bold md:text-6xl">Osäker på vilken tjänst du behöver?</h2>
          <p className="mt-5 max-w-2xl leading-8">Börja med prisindikatorn eller skicka en bokningsförfrågan. Iboren återkommer med nästa steg.</p>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row"><Link href="/priser" className="inline-flex rounded-full bg-gold px-5 py-3 text-sm font-black uppercase tracking-[.12em] text-ink">Beräkna pris</Link><Link href="/boka-utan-konto" className="inline-flex rounded-full border border-gold/35 px-5 py-3 text-sm font-bold text-gold">Boka städning</Link></div>
        </div>
      </section>
    </main>
  );
}
