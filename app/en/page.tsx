import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, Building2, CheckCircle2, Home, Languages, Sparkles, Truck } from "lucide-react";

export const metadata: Metadata = {
  title: "Iboren – Cleaning request in Södertälje and Stockholm",
  description: "Send a cleaning request for home cleaning, move-out cleaning, office cleaning and window cleaning in Södertälje and Stockholm with Iboren.",
  alternates: { canonical: "https://iboren.se/en", languages: { sv: "https://iboren.se/", en: "https://iboren.se/en" } }
};

const services = [
  { icon: <Home />, title: "Home cleaning", text: "For one-time or recurring cleaning at home." },
  { icon: <Truck />, title: "Move-out cleaning", text: "For moving, handover and structured cleaning requests." },
  { icon: <Building2 />, title: "Office cleaning", text: "For offices, workplaces and recurring business cleaning." }
];

const requestSteps = [
  "Choose service",
  "Enter address and size",
  "Select preferred date and time window",
  "Iboren checks availability and gets back to you"
];

export default function EnglishPage() {
  return (
    <main className="min-h-screen bg-cream text-ink">
      <section className="relative overflow-hidden py-20 md:py-28">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_20%,rgba(212,165,116,.35),transparent_32%),radial-gradient(circle_at_18%_75%,rgba(107,39,55,.14),transparent_34%)]" />
        <div className="luxe-container relative grid gap-10 md:grid-cols-[1fr_.9fr] md:items-center">
          <div>
            <div className="mb-10 flex gap-3"><Link href="/" className="inline-flex rounded-full border border-burgundy/15 px-4 py-2 text-sm font-bold text-burgundy">Svenska</Link><Link href="/en" className="inline-flex rounded-full bg-burgundy px-4 py-2 text-sm font-bold text-porcelain">English</Link></div>
            <p className="eyebrow">Iboren cleaning</p>
            <h1 className="display mt-4 text-6xl font-bold leading-[.88] text-burgundy md:text-8xl">Cleaning in Södertälje and Stockholm</h1>
            <p className="mt-7 max-w-2xl text-lg leading-8 text-ink/75 md:text-xl">Iboren helps customers send clear booking requests for home cleaning, move-out cleaning, office cleaning and window cleaning.</p>
            <p className="mt-5 max-w-2xl rounded-2xl border border-burgundy/10 bg-porcelain p-4 text-sm leading-7 text-ink/70">Choose your preferred date and time. We check availability and get back to you with confirmation.</p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Link href="/#booking" className="btn-primary">Send request <ArrowRight size={18} /></Link>
              <Link href="/priser" className="btn-secondary">Price calculator</Link>
            </div>
          </div>
          <aside className="rounded-[2.5rem] border border-burgundy/10 bg-porcelain/80 p-8 shadow-luxe backdrop-blur-xl">
            <div className="mb-12 grid h-16 w-16 place-items-center rounded-full bg-burgundy text-porcelain"><Languages size={30} /></div>
            <h2 className="display text-4xl font-bold text-burgundy">A clearer first step.</h2>
            <div className="mt-7 grid gap-4">
              {requestSteps.map((item) => <p key={item} className="flex gap-3 text-ink/75"><CheckCircle2 className="mt-1 h-5 w-5 shrink-0 text-burgundy" /> {item}</p>)}
            </div>
          </aside>
        </div>
      </section>

      <section className="bg-porcelain py-16">
        <div className="luxe-container">
          <p className="eyebrow">Services</p>
          <h2 className="display mt-3 text-4xl font-bold text-burgundy md:text-6xl">Cleaning services</h2>
          <div className="mt-10 grid gap-5 md:grid-cols-3">
            {services.map((service) => <article key={service.title} className="rounded-[2rem] bg-cream p-6 shadow-soft"><div className="mb-6 grid h-12 w-12 place-items-center rounded-full bg-burgundy text-porcelain">{service.icon}</div><h3 className="display text-3xl font-bold text-burgundy">{service.title}</h3><p className="mt-3 leading-7 text-ink/75">{service.text}</p></article>)}
          </div>
        </div>
      </section>

      <section className="bg-cream py-16">
        <div className="luxe-container max-w-4xl rounded-[2rem] bg-burgundy p-8 text-porcelain shadow-luxe">
          <p className="text-xs font-black uppercase tracking-[.28em] text-gold">Iboren</p>
          <h2 className="display mt-3 text-4xl font-bold md:text-6xl">Ready to send a request?</h2>
          <p className="mt-5 max-w-2xl leading-8 text-porcelain/80">Fill in service, address, size, preferred date and contact details. Iboren will check availability and get back to you.</p>
          <p className="mt-4 text-sm leading-7 text-porcelain/70">RUT deductions may apply according to Skatteverket rules when the conditions are fulfilled.</p>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row"><Link href="/#booking" className="inline-flex rounded-full bg-gold px-5 py-3 text-sm font-black uppercase tracking-[.12em] text-ink">Send request</Link><Link href="/jobb" className="inline-flex rounded-full border border-gold/35 px-5 py-3 text-sm font-bold text-gold">Work with Iboren</Link></div>
        </div>
      </section>
    </main>
  );
}
