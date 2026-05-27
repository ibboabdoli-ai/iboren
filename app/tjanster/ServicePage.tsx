import Link from "next/link";
import { ArrowRight, CheckCircle2, ShieldCheck, Sparkles } from "lucide-react";

export type ServicePageData = {
  title: string;
  intro: string;
  priceText: string;
  included: string[];
  faq: Array<{ question: string; answer: string }>;
};

export default function ServicePage({ service }: { service: ServicePageData }) {
  return (
    <main className="min-h-screen bg-cream text-ink">
      <section className="relative overflow-hidden py-20 md:py-28">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_20%,rgba(212,165,116,.35),transparent_32%),radial-gradient(circle_at_18%_75%,rgba(107,39,55,.14),transparent_34%)]" />
        <div className="luxe-container relative grid gap-10 md:grid-cols-[1fr_.9fr] md:items-start">
          <div>
            <Link href="/tjanster" className="mb-10 inline-flex text-sm font-bold text-burgundy">← Alla tjänster</Link>
            <p className="eyebrow">Tjänst</p>
            <h1 className="display mt-4 max-w-full break-words text-[clamp(3rem,15vw,4.25rem)] font-bold leading-[.88] text-burgundy [overflow-wrap:anywhere] md:text-8xl">{service.title}</h1>
            <p className="mt-7 max-w-2xl text-lg leading-8 text-ink/75 md:text-xl">{service.intro}</p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Link href="/priser" className="btn-primary">Beräkna pris <ArrowRight size={18} /></Link>
              <Link href="/#booking" className="btn-secondary">Boka städning</Link>
            </div>
          </div>

          <aside className="rounded-[2.5rem] border border-burgundy/10 bg-porcelain/80 p-8 shadow-luxe backdrop-blur-xl">
            <div className="mb-10 grid h-16 w-16 place-items-center rounded-full bg-burgundy text-porcelain"><Sparkles size={30} /></div>
            <h2 className="display text-4xl font-bold text-burgundy">Pris och RUT</h2>
            <p className="mt-5 leading-8 text-ink/75">{service.priceText}</p>
            <p className="mt-5 rounded-2xl bg-cream p-4 text-sm leading-7 text-ink/75">Priset är en uppskattning. Slutligt pris bekräftas efter bokningsförfrågan.</p>
          </aside>
        </div>
      </section>

      <section className="bg-porcelain py-16">
        <div className="luxe-container grid gap-10 md:grid-cols-[.9fr_1.1fr] md:items-start">
          <div>
            <p className="eyebrow">Ingår</p>
            <h2 className="display mt-3 text-4xl font-bold text-burgundy md:text-6xl">Vad ingår?</h2>
            <p className="mt-5 leading-8 text-ink/75">Omfattningen anpassas efter bostad, lokal, skick och önskemål. Här är vanliga delar i förfrågan.</p>
          </div>
          <div className="grid gap-4">
            {service.included.map((item) => <p key={item} className="flex gap-3 rounded-2xl bg-cream p-5 text-ink/75 shadow-sm"><CheckCircle2 className="mt-1 h-5 w-5 shrink-0 text-burgundy" /> {item}</p>)}
          </div>
        </div>
      </section>

      <section className="bg-cream py-16">
        <div className="luxe-container grid gap-5 md:grid-cols-3">
          {["Tydlig prisbild", "RUT-avdrag", "Snabb återkoppling"].map((item) => <article key={item} className="rounded-[2rem] bg-porcelain p-6 shadow-soft"><ShieldCheck className="mb-5 text-burgundy" /><h3 className="display text-3xl font-bold text-burgundy">{item}</h3><p className="mt-3 leading-7 text-ink/75">Iboren gör första steget enkelt, tydligt och lätt att följa upp.</p></article>)}
        </div>
      </section>

      <section className="bg-porcelain py-16">
        <div className="luxe-container max-w-4xl">
          <p className="eyebrow">FAQ</p>
          <h2 className="display mt-3 text-4xl font-bold text-burgundy md:text-6xl">Vanliga frågor</h2>
          <div className="mt-10 grid gap-4">
            {service.faq.map((item) => <article key={item.question} className="rounded-[1.5rem] bg-cream p-6 shadow-sm"><h3 className="font-bold text-burgundy">{item.question}</h3><p className="mt-2 leading-7 text-ink/75">{item.answer}</p></article>)}
          </div>
          <div className="mt-10 rounded-[2rem] bg-burgundy p-7 text-porcelain"><h2 className="display text-4xl font-bold">Vill du gå vidare?</h2><p className="mt-3 text-porcelain/80">Beräkna ett uppskattat pris eller skicka en bokningsförfrågan.</p><div className="mt-6 flex flex-col gap-3 sm:flex-row"><Link href="/priser" className="inline-flex rounded-full bg-gold px-5 py-3 text-sm font-black uppercase tracking-[.12em] text-ink">Beräkna pris</Link><Link href="/#booking" className="inline-flex rounded-full border border-gold/35 px-5 py-3 text-sm font-bold text-gold">Boka städning</Link></div></div>
        </div>
      </section>
    </main>
  );
}
