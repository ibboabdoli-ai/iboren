import Link from "next/link";
import { ArrowRight, BadgePercent, CheckCircle2, ShieldCheck } from "lucide-react";

export type ServicePageData = {
  title: string;
  intro: string;
  priceText: string;
  included: string[];
  faq: Array<{ question: string; answer: string }>;
};

export default function ServicePage({ service }: { service: ServicePageData }) {
  const isOfficeCleaning = service.title === "Kontorsstädning";
  const trustItems = isOfficeCleaning
    ? [
        { title: "Tydlig offert", text: "Vi anpassar upplägg, tider och omfattning efter lokalen och återkommer med en tydlig offert." },
        { title: "Företagsanpassat upplägg", text: "Välj städfrekvens, tider och kontaktväg som passar verksamheten." },
        { title: "Tydlig uppföljning", text: "Förfrågan samlar underlaget som behövs innan upplägg och pris bekräftas." },
      ]
    : [
        { title: "Tydlig prisbild", text: "Iboren gör första steget enkelt, tydligt och lätt att följa upp." },
        { title: "RUT-avdrag", text: "RUT gäller normalt för upp till 50% av godkänd arbetskostnad, om kunden uppfyller villkoren och har RUT kvar. Material, resor och andra kostnader ingår inte." },
        { title: "Snabb återkoppling", text: "Iboren gör första steget enkelt, tydligt och lätt att följa upp." },
      ];

  return (
    <main className="service-page-dark min-h-screen">
      <section className="service-hero relative overflow-hidden py-20 md:py-28">
        <div className="luxe-container relative grid gap-10 md:grid-cols-[1fr_.9fr] md:items-start">
          <div>
            <Link href="/tjanster" className="service-back-link mb-10 inline-flex text-sm font-bold">← Alla tjänster</Link>
            <p className="service-eyebrow text-xs font-black uppercase tracking-[.32em]">Tjänst</p>
            <h1 className="service-title display mt-4 max-w-full text-[clamp(2.35rem,10vw,3.15rem)] font-bold leading-[.9] md:text-8xl">{service.title}</h1>
            <p className="service-lead mt-7 max-w-2xl text-lg leading-8 md:text-xl">{service.intro}</p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Link href="/priser" className="btn-primary">Beräkna pris <ArrowRight size={18} /></Link>
              <Link href="/boka-utan-konto" className="btn-secondary">Boka städning</Link>
            </div>
          </div>

          <aside className="service-panel iboren-card-glass iboren-card-glass-hover rounded-[2.5rem] p-8 shadow-luxe backdrop-blur-xl">
            <div className="service-icon mb-10 grid h-16 w-16 place-items-center rounded-full"><BadgePercent size={30} /></div>
            <h2 className="display text-4xl font-bold">{isOfficeCleaning ? "Offert och upplägg" : "Pris och RUT"}</h2>
            <p className="mt-5 leading-8">{service.priceText}</p>
            <p className="service-card mt-5 rounded-2xl p-4 text-sm leading-7">Priset är en uppskattning. Slutligt pris bekräftas efter bokningsförfrågan.</p>
          </aside>
        </div>
      </section>

      <section className="py-16">
        <div className="luxe-container grid gap-10 md:grid-cols-[.9fr_1.1fr] md:items-start">
          <div>
            <p className="service-eyebrow text-xs font-black uppercase tracking-[.32em]">Ingår</p>
            <h2 className="display mt-3 text-4xl font-bold md:text-6xl">Vad ingår?</h2>
            <p className="mt-5 leading-8">Omfattningen anpassas efter bostad, lokal, skick och önskemål. Här är vanliga delar i förfrågan.</p>
          </div>
          <div className="grid gap-4">
            {service.included.map((item) => <p key={item} className="service-card iboren-card-glass iboren-card-glass-hover flex gap-3 rounded-2xl p-5 shadow-sm"><CheckCircle2 className="iboren-gold-accent mt-1 h-5 w-5 shrink-0" /> {item}</p>)}
          </div>
        </div>
      </section>

      <section className="py-16">
        <div className="luxe-container grid gap-5 md:grid-cols-3">
          {trustItems.map((item) => <article key={item.title} className="iboren-card-glass iboren-card-glass-hover rounded-[2rem] p-6 shadow-soft"><ShieldCheck className="iboren-gold-accent mb-5" /><h3 className="display text-3xl font-bold">{item.title}</h3><p className="iboren-text-muted-dark mt-3 leading-7">{item.text}</p></article>)}
        </div>
      </section>

      <section className="py-16">
        <div className="luxe-container max-w-4xl">
          <p className="service-eyebrow text-xs font-black uppercase tracking-[.32em]">FAQ</p>
          <h2 className="display mt-3 text-4xl font-bold md:text-6xl">Vanliga frågor</h2>
          <div className="mt-10 grid gap-4">
            {service.faq.map((item) => <article key={item.question} className="iboren-card-glass iboren-card-glass-hover rounded-[1.5rem] p-6 shadow-sm"><h3 className="font-bold">{item.question}</h3><p className="iboren-text-muted-dark mt-2 leading-7">{item.answer}</p></article>)}
          </div>
          <div className="service-cta-card iboren-card-glass iboren-card-glass-hover mt-10 rounded-[2rem] p-7"><h2 className="display text-4xl font-bold">Vill du gå vidare?</h2><p className="iboren-text-muted-dark mt-3">Beräkna ett uppskattat pris eller skicka en bokningsförfrågan.</p><div className="mt-6 flex flex-col gap-3 sm:flex-row"><Link href="/priser" className="inline-flex rounded-full bg-gold px-5 py-3 text-sm font-black uppercase tracking-[.12em] text-ink">Beräkna pris</Link><Link href="/boka-utan-konto" className="inline-flex rounded-full border border-gold/35 px-5 py-3 text-sm font-bold text-gold">Boka städning</Link></div></div>
        </div>
      </section>
    </main>
  );
}
