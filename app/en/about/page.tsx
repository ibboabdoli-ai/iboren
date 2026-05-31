import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, CheckCircle2, Mail, MapPin, ShieldCheck, Sparkles } from "lucide-react";

export const metadata: Metadata = {
  title: "About Iboren – Local cleaning company in Södertälje and Stockholm",
  description: "Learn more about Iboren, a local cleaning company helping homes and businesses with home cleaning, move-out cleaning, office cleaning and window cleaning in Södertälje and Stockholm.",
  alternates: { canonical: "https://iboren.se/en/about", languages: { sv: "https://iboren.se/om-oss", en: "https://iboren.se/en/about" } }
};

const points = [
  "Local cleaning for homes and businesses in Södertälje and Stockholm",
  "Clear communication from the first request to the completed job",
  "Scope, price indication and preferred date are reviewed before confirmation",
  "RUT deduction is handled clearly for private customers when applicable"
];

export default function EnglishAboutPage() {
  return (
    <main className="min-h-screen bg-cream text-ink">
      <section className="relative overflow-hidden py-20 md:py-28">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_20%,rgba(212,165,116,.35),transparent_32%),radial-gradient(circle_at_18%_75%,rgba(107,39,55,.14),transparent_34%)]" />
        <div className="luxe-container relative grid gap-10 md:grid-cols-[1fr_.9fr] md:items-center">
          <div>
            <Link href="/en" className="mb-10 inline-flex text-sm font-bold text-burgundy">← Back</Link>
            <p className="eyebrow">Local cleaning company</p>
            <h1 className="display mt-4 text-6xl font-bold leading-[.88] text-burgundy md:text-8xl">About Iboren</h1>
            <p className="mt-7 max-w-2xl text-lg leading-8 text-ink/70 md:text-xl">Iboren helps private customers and businesses with careful cleaning in Södertälje and Stockholm. We focus on clear communication, reliable service and simple booking from first contact to completed job.</p>
            <p className="mt-5 max-w-2xl leading-8 text-ink/65">When you send a request, we collect the right details from the start: service, address, size, date, contact details and special requests. This makes it easier to give the right response and confirm the job safely.</p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Link href="/en#booking" className="btn-primary">Send request <ArrowRight size={18} /></Link>
              <Link href="/en/prices" className="btn-secondary">Calculate price</Link>
            </div>
          </div>
          <aside className="rounded-[2.5rem] border border-burgundy/10 bg-porcelain/80 p-8 shadow-luxe backdrop-blur-xl">
            <div className="mb-12 grid h-16 w-16 place-items-center rounded-full bg-burgundy text-porcelain"><Sparkles size={30} /></div>
            <h2 className="display text-4xl font-bold text-burgundy">Safer cleaning from first contact.</h2>
            <div className="mt-7 grid gap-4">
              {points.map((item) => <p key={item} className="flex gap-3 text-ink/70"><CheckCircle2 className="mt-1 h-5 w-5 shrink-0 text-burgundy" /> {item}</p>)}
            </div>
          </aside>
        </div>
      </section>

      <section className="bg-porcelain py-16">
        <div className="luxe-container grid gap-5 md:grid-cols-3">
          <Info icon={<MapPin />} title="Local focus" text="Iboren works with cleaning in Södertälje and Stockholm and builds the service flow around local customer needs." />
          <Info icon={<ShieldCheck />} title="Clear confirmation" text="A request is not automatically confirmed. Time, scope, price indication and terms are reviewed before the job starts." />
          <Info icon={<Mail />} title="Simple contact" text="Customers receive confirmation by email and can contact Iboren directly at hej@iboren.se." />
        </div>
      </section>

      <section className="bg-cream py-16">
        <div className="luxe-container max-w-4xl rounded-[2rem] bg-burgundy p-8 text-porcelain shadow-luxe">
          <p className="text-xs font-black uppercase tracking-[.28em] text-gold">Iboren</p>
          <h2 className="display mt-3 text-4xl font-bold md:text-6xl">Cleaning with clarity and responsibility.</h2>
          <p className="mt-5 max-w-2xl leading-8 text-porcelain/72">The goal is to make it easy to describe what needs to be cleaned, receive the right response and feel secure before the job is confirmed.</p>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <Link href="/en#booking" className="inline-flex rounded-full bg-gold px-5 py-3 text-sm font-black uppercase tracking-[.12em] text-ink">Send request</Link>
            <a href="mailto:hej@iboren.se" className="inline-flex rounded-full border border-gold/35 px-5 py-3 text-sm font-bold text-gold">hej@iboren.se</a>
          </div>
        </div>
      </section>
    </main>
  );
}

function Info({ icon, title, text }: { icon: React.ReactNode; title: string; text: string }) {
  return <article className="rounded-[2rem] bg-cream p-6 shadow-soft"><div className="mb-6 grid h-12 w-12 place-items-center rounded-full bg-burgundy text-porcelain">{icon}</div><h3 className="display text-3xl font-bold text-burgundy">{title}</h3><p className="mt-3 leading-7 text-ink/65">{text}</p></article>;
}
