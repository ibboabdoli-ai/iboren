import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, Building2, CheckCircle2, Home, MapPin, Sparkles, Truck } from "lucide-react";
import FaqStructuredData from "../../FaqStructuredData";

export const metadata: Metadata = {
  title: "Cleaning in Stockholm | Iboren",
  description: "Cleaning in Stockholm with a clear price indication for home cleaning, move-out cleaning, office cleaning and window cleaning, including RUT information for eligible private services.",
  alternates: {
    canonical: "https://iboren.se/en/cleaning-stockholm",
    languages: {
      sv: "https://iboren.se/stadning-stockholm",
      en: "https://iboren.se/en/cleaning-stockholm",
    },
  },
  openGraph: {
    title: "Cleaning in Stockholm | Iboren",
    description: "Cleaning in Stockholm with a clear price indication and RUT information for eligible private cleaning services.",
    url: "https://iboren.se/en/cleaning-stockholm",
  },
};

const services = [
  { icon: <Home />, title: "Home cleaning in Stockholm", text: "For homes, apartments and recurring cleaning requests with a clear basis." },
  { icon: <Truck />, title: "Move-out cleaning in Stockholm", text: "For moves and handovers where address, size, date and practical details need confirmation." },
  { icon: <Building2 />, title: "Office cleaning in Stockholm", text: "For offices and premises that need recurring service and a clear contact path." },
  { icon: <Sparkles />, title: "Window cleaning", text: "For homes and workplaces, as a separate service or an addition to other cleaning." },
];

const faq = [
  { q: "Can I send a cleaning request in Stockholm online?", a: "Yes. Iboren collects service, address, size, preferred date and contact details so the request is clear." },
  { q: "Is the request binding immediately?", a: "No. The request is confirmed only after time, scope, price and practical details have been agreed." },
  { q: "Which services can I request?", a: "You can request home cleaning, move-out cleaning, office cleaning and window cleaning." },
];

export default function CleaningStockholmPage() {
  return (
    <main className="iboren-page-dark min-h-screen overflow-x-hidden">
      <FaqStructuredData items={faq} />
      <section className="relative overflow-hidden py-20 md:py-28">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_20%,rgba(212,165,116,.35),transparent_32%),radial-gradient(circle_at_18%_75%,rgba(107,39,55,.14),transparent_34%)]" />
        <div className="luxe-container relative grid gap-10 md:grid-cols-[1fr_.9fr] md:items-center">
          <div>
            <Link href="/en" className="iboren-gold-accent mb-10 inline-flex text-sm font-bold">← Back</Link>
            <p className="iboren-gold-accent text-[11px] font-bold uppercase tracking-[.38em]">Local cleaning services</p>
            <h1 className="display mt-4 max-w-full text-5xl font-bold leading-[.9] text-porcelain md:text-8xl">Cleaning in Stockholm</h1>
            <p className="iboren-text-muted-dark mt-7 max-w-2xl text-lg leading-8 md:text-xl">Iboren helps customers in Stockholm send clear, non-binding requests for home cleaning, move-out cleaning, office cleaning and window cleaning.</p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Link href="/en/prices" className="btn-primary">Get a price estimate <ArrowRight size={18} /></Link>
              <Link href="/en#services" className="btn-secondary">See services</Link>
            </div>
          </div>
          <aside className="iboren-card-glass iboren-card-glass-hover rounded-[2.5rem] p-8">
            <div className="iboren-gold-accent mb-12 grid h-16 w-16 place-items-center rounded-full border border-gold/30 bg-gold/10"><MapPin size={30} /></div>
            <h2 className="display text-4xl font-bold text-porcelain">Clear details from the first contact.</h2>
            <div className="mt-7 grid gap-4">
              {["Service and area", "Address and practical details", "Size and scope", "Preferred date, time and contact"].map((item) => <p key={item} className="iboren-text-muted-dark flex gap-3"><CheckCircle2 className="iboren-gold-accent mt-1 h-5 w-5 shrink-0" /> {item}</p>)}
            </div>
          </aside>
        </div>
      </section>

      <section className="iboren-section-dark py-16">
        <div className="luxe-container">
          <p className="iboren-gold-accent text-[11px] font-bold uppercase tracking-[.38em]">Services in Stockholm</p>
          <h2 className="display mt-3 text-4xl font-bold text-porcelain md:text-6xl">Cleaning for homes, moves and workplaces.</h2>
          <div className="mt-10 grid gap-5 md:grid-cols-2">
            {services.map((service) => <article key={service.title} className="iboren-card-glass iboren-card-glass-hover rounded-[2rem] p-6"><div className="iboren-gold-accent mb-6 grid h-12 w-12 place-items-center rounded-full border border-gold/30 bg-gold/10">{service.icon}</div><h3 className="display text-3xl font-bold text-porcelain">{service.title}</h3><p className="iboren-text-muted-dark mt-3 leading-7">{service.text}</p></article>)}
          </div>
        </div>
      </section>

      <section className="iboren-page-dark py-16">
        <div className="luxe-container max-w-4xl">
          <div className="iboren-card-glass mb-12 rounded-[2rem] p-7">
            <p className="iboren-gold-accent text-[11px] font-bold uppercase tracking-[.38em]">Price and RUT in Stockholm</p>
            <h2 className="display mt-3 text-4xl font-bold text-porcelain">Review the estimate before sending.</h2>
            <p className="iboren-text-muted-dark mt-4 leading-8">Private cleaning estimates show the price before and after RUT and the estimated time. Private customer prices include VAT. Iboren confirms the scope, time and final price before the request becomes binding.</p>
          </div>
          <p className="iboren-gold-accent text-[11px] font-bold uppercase tracking-[.38em]">FAQ</p>
          <h2 className="display mt-3 text-4xl font-bold text-porcelain md:text-6xl">Common questions about cleaning in Stockholm.</h2>
          <div className="mt-10 grid gap-4">
            {faq.map((item) => <article key={item.q} className="iboren-card-glass iboren-card-glass-hover rounded-[1.5rem] p-6"><h3 className="iboren-gold-accent font-bold">{item.q}</h3><p className="iboren-text-muted-dark mt-2 leading-7">{item.a}</p></article>)}
          </div>
          <div className="iboren-card-glass iboren-card-glass-hover mt-10 rounded-[2rem] p-7"><h2 className="display text-4xl font-bold text-porcelain">Start with a clear price estimate.</h2><p className="iboren-text-muted-dark mt-3">Review the estimate before continuing to a non-binding request.</p><Link href="/en/prices" className="mt-6 inline-flex rounded-full bg-gold px-5 py-3 text-sm font-black uppercase tracking-[.12em] text-ink">Get a price estimate</Link></div>
        </div>
      </section>
    </main>
  );
}
