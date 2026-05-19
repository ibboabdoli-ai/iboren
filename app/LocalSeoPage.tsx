import Link from "next/link";
import { ArrowRight, CheckCircle2, MapPin } from "lucide-react";

export type LocalSeoPageData = {
  service: string;
  city: string;
  intro: string;
  priceNote: string;
  benefits: string[];
};

export default function LocalSeoPage({ data }: { data: LocalSeoPageData }) {
  return (
    <main className="min-h-screen bg-cream text-ink">
      <section className="relative overflow-hidden py-20 md:py-28">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_20%,rgba(212,165,116,.35),transparent_32%),radial-gradient(circle_at_18%_75%,rgba(107,39,55,.14),transparent_34%)]" />
        <div className="luxe-container relative grid gap-10 md:grid-cols-[1fr_.85fr] md:items-start">
          <div>
            <Link href="/tjanster" className="mb-10 inline-flex text-sm font-bold text-burgundy">← Alla tjänster</Link>
            <p className="eyebrow">{data.city}</p>
            <h1 className="display mt-4 text-6xl font-bold leading-[.88] text-burgundy md:text-8xl">{data.service} {data.city}</h1>
            <p className="mt-7 max-w-2xl text-lg leading-8 text-ink/75 md:text-xl">{data.intro}</p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Link href="/priser" className="btn-primary">Beräkna pris <ArrowRight size={18} /></Link>
              <Link href="/#booking" className="btn-secondary">Boka städning</Link>
            </div>
          </div>
          <aside className="rounded-[2.5rem] border border-burgundy/10 bg-porcelain/80 p-8 shadow-luxe">
            <MapPin className="mb-6 h-10 w-10 text-burgundy" />
            <h2 className="display text-4xl font-bold text-burgundy">Lokalt i {data.city}</h2>
            <p className="mt-5 leading-8 text-ink/75">{data.priceNote}</p>
          </aside>
        </div>
      </section>
      <section className="bg-porcelain py-16">
        <div className="luxe-container grid gap-5 md:grid-cols-3">
          {data.benefits.map((item) => (
            <article key={item} className="rounded-[2rem] bg-cream p-6 shadow-soft">
              <CheckCircle2 className="mb-5 text-burgundy" />
              <h2 className="display text-3xl font-bold text-burgundy">{item}</h2>
              <p className="mt-3 leading-7 text-ink/75">Skicka en tydlig förfrågan och få nästa steg bekräftat.</p>
            </article>
          ))}
        </div>
      </section>
    </main>
  );
}
