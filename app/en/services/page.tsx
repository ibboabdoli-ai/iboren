import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, Building2, CircleHelp, Home, Sparkles, Truck } from "lucide-react";

export const metadata: Metadata = {
  title: "Cleaning services in Södertälje and Stockholm | Iboren",
  description: "Explore Iboren cleaning services: home cleaning, move-out cleaning, office cleaning and window cleaning.",
  alternates: { canonical: "https://iboren.se/en/services", languages: { sv: "https://iboren.se/tjanster", en: "https://iboren.se/en/services" } },
};

const services = [
  { icon: Home, title: "Home cleaning", href: "/en/home-cleaning", text: "For recurring or one-time cleaning at home." },
  { icon: Truck, title: "Move-out cleaning", href: "/en/move-out-cleaning", text: "For moving, handover and a clear request." },
  { icon: Building2, title: "Office cleaning", href: "/en/office-cleaning", text: "For companies, offices and recurring service." },
  { icon: Sparkles, title: "Window cleaning", href: "/en/window-cleaning", text: "As a separate service or an add-on to other cleaning." },
  { icon: Sparkles, title: "Deep cleaning", href: "/en/deep-cleaning", text: "For homes that need a more thorough cleaning." },
  { icon: Building2, title: "Construction cleaning", href: "/en/construction-cleaning", text: "For spaces after renovation or project work." },
  { icon: Home, title: "Viewing cleaning", href: "/en/viewing-cleaning", text: "Before viewings, photography or sale." },
];

export default function ServicesPage() {
  return <main className="service-page-dark min-h-screen"><section className="service-hero relative overflow-hidden py-20 md:py-28"><div className="luxe-container relative"><Link href="/en" className="service-back-link mb-10 inline-flex text-sm font-bold">← Back</Link><p className="service-eyebrow text-xs font-black uppercase tracking-[.32em]">Services</p><h1 className="service-title display mt-4 max-w-5xl text-6xl font-bold leading-[.88] md:text-8xl">Cleaning services in Södertälje and Stockholm</h1><p className="service-lead mt-7 max-w-3xl text-lg leading-8 md:text-xl">Choose the right cleaning service for your home, move or workplace. You can also calculate an estimated price before sending a request.</p><div className="mt-8 flex flex-col gap-3 sm:flex-row"><Link href="/en/prices" className="btn-primary">Calculate price <ArrowRight size={18} /></Link><Link href="/en/boka-utan-konto" className="btn-secondary">Send request</Link></div></div></section><section className="py-16"><div className="luxe-container grid gap-5 md:grid-cols-2">{services.map((service) => { const Icon = service.icon; return <Link key={service.href} href={service.href} className="service-card iboren-card-glass iboren-card-glass-hover group rounded-[2rem] p-7 shadow-soft"><div className="mb-8 flex items-center justify-between"><div className="service-icon grid h-14 w-14 place-items-center rounded-full"><Icon size={27} /></div><span className="text-sm font-bold text-gold">Learn more →</span></div><h2 className="display text-4xl font-bold">{service.title}</h2><p className="mt-4 leading-7">{service.text}</p></Link>; })}</div></section><section className="py-16"><div className="service-cta-card iboren-card-glass iboren-card-glass-hover luxe-container max-w-4xl rounded-[2rem] p-8 shadow-luxe"><div className="service-icon grid h-14 w-14 place-items-center rounded-full"><CircleHelp /></div><h2 className="display mt-6 text-4xl font-bold md:text-6xl">Not sure which service you need?</h2><p className="mt-5 max-w-2xl leading-8">Start with the price calculator or send a request. Iboren gets back to you with the next step.</p><div className="mt-8 flex flex-col gap-3 sm:flex-row"><Link href="/en/prices" className="inline-flex rounded-full bg-gold px-5 py-3 text-sm font-black uppercase tracking-[.12em] text-ink">Calculate price</Link><Link href="/en/boka-utan-konto" className="inline-flex rounded-full border border-gold/35 px-5 py-3 text-sm font-bold text-gold">Send request</Link></div></div></section></main>;
}
