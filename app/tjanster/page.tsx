import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, Building2, Home, Sparkles, Truck, Waves } from "lucide-react";

export const metadata: Metadata = {
  title: "Tjänster – Städning i Södertälje och Stockholm | Iboren",
  description: "Se Iborens städtjänster: hemstädning, flyttstädning, kontorsstädning och fönsterputs i Södertälje och Stockholm.",
  alternates: { canonical: "https://iboren.se/tjanster" }
};

const services = [
  { icon: Home, title: "Hemstädning", href: "/tjanster/hemstadning", text: "För återkommande eller enstaka städning hemma." },
  { icon: Truck, title: "Flyttstädning", href: "/tjanster/flyttstadning", text: "För flytt, överlämning och tydlig offertförfrågan." },
  { icon: Building2, title: "Kontorsstädning", href: "/tjanster/kontorsstadning", text: "För företag, kontor och återkommande service." },
  { icon: Waves, title: "Fönsterputs", href: "/tjanster/fonsterputs", text: "Som separat tjänst eller tillval till annan städning." }
];

export default function TjansterPage() {
  return (
    <main className="min-h-screen bg-cream text-ink">
      <section className="relative overflow-hidden py-20 md:py-28">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_20%,rgba(212,165,116,.35),transparent_32%),radial-gradient(circle_at_18%_75%,rgba(107,39,55,.14),transparent_34%)]" />
        <div className="luxe-container relative">
          <Link href="/" className="mb-10 inline-flex text-sm font-bold text-burgundy">← Tillbaka</Link>
          <p className="eyebrow">Tjänster</p>
          <h1 className="display mt-4 max-w-5xl text-6xl font-bold leading-[.88] text-burgundy md:text-8xl">Städtjänster i Södertälje och Stockholm</h1>
          <p className="mt-7 max-w-3xl text-lg leading-8 text-ink/75 md:text-xl">Välj rätt städning för ditt hem, din flytt eller din arbetsplats. Du kan även beräkna ungefärligt pris innan du bokar.</p>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <Link href="/priser" className="btn-primary">Beräkna pris <ArrowRight size={18} /></Link>
            <Link href="/#booking" className="btn-secondary">Boka städning</Link>
          </div>
        </div>
      </section>

      <section className="bg-porcelain py-16">
        <div className="luxe-container grid gap-5 md:grid-cols-2">
          {services.map((service) => {
            const Icon = service.icon;
            return (
              <Link key={service.href} href={service.href} className="group rounded-[2rem] bg-cream p-7 shadow-soft transition hover:-translate-y-1">
                <div className="mb-8 flex items-center justify-between">
                  <div className="grid h-14 w-14 place-items-center rounded-full bg-burgundy text-porcelain"><Icon size={27} /></div>
                  <span className="text-sm font-bold text-burgundy group-hover:text-ink">Läs mer →</span>
                </div>
                <h2 className="display text-4xl font-bold text-burgundy">{service.title}</h2>
                <p className="mt-4 leading-7 text-ink/75">{service.text}</p>
              </Link>
            );
          })}
        </div>
      </section>

      <section className="bg-cream py-16">
        <div className="luxe-container max-w-4xl rounded-[2rem] bg-burgundy p-8 text-porcelain shadow-luxe">
          <div className="grid h-14 w-14 place-items-center rounded-full bg-gold text-ink"><Sparkles /></div>
          <h2 className="display mt-6 text-4xl font-bold md:text-6xl">Osäker på vilken tjänst du behöver?</h2>
          <p className="mt-5 max-w-2xl leading-8 text-porcelain/80">Börja med prisindikatorn eller skicka en bokningsförfrågan. Iboren återkommer med nästa steg.</p>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row"><Link href="/priser" className="inline-flex rounded-full bg-gold px-5 py-3 text-sm font-black uppercase tracking-[.12em] text-ink">Beräkna pris</Link><a href="mailto:hej@iboren.se" className="inline-flex rounded-full border border-gold/35 px-5 py-3 text-sm font-bold text-gold">Kontakta oss</a></div>
        </div>
      </section>
    </main>
  );
}
