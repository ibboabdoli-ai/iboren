import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, CheckCircle2, Mail, MapPin, ShieldCheck, Sparkles } from "lucide-react";

export const metadata: Metadata = {
  title: "About Iboren – Cleaning in Södertälje and Stockholm",
  description: "Learn more about Iboren, a Swedish digital booking service for home cleaning, move-out cleaning, office cleaning and window cleaning in Södertälje and Stockholm.",
  alternates: { canonical: "https://iboren.se/en/about", languages: { sv: "https://iboren.se/om-iboren", en: "https://iboren.se/en/about" } }
};

const points = [
  "Digital booking for home cleaning, move-out cleaning, office cleaning and window cleaning",
  "Focus on Södertälje and Stockholm",
  "Clear booking details before a job is confirmed",
  "Email confirmation and status updates for the customer"
];

export default function EnglishAboutPage() {
  return (
    <main className="min-h-screen bg-cream text-ink">
      <section className="relative overflow-hidden py-20 md:py-28">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_20%,rgba(212,165,116,.35),transparent_32%),radial-gradient(circle_at_18%_75%,rgba(107,39,55,.14),transparent_34%)]" />
        <div className="luxe-container relative grid gap-10 md:grid-cols-[1fr_.9fr] md:items-center">
          <div>
            <Link href="/en" className="mb-10 inline-flex text-sm font-bold text-burgundy">← Back</Link>
            <p className="eyebrow">About the brand</p>
            <h1 className="display mt-4 text-6xl font-bold leading-[.88] text-burgundy md:text-8xl">About Iboren</h1>
            <p className="mt-7 max-w-2xl text-lg leading-8 text-ink/70 md:text-xl">Iboren is a Swedish digital booking service for cleaning. The goal is to make it easier to send a clear request for home cleaning, move-out cleaning, office cleaning and window cleaning.</p>
            <p className="mt-5 max-w-2xl leading-8 text-ink/65">The service is built for customers in Södertälje and Stockholm who want to provide the right details from the start: service, address, size, date, contact details and special requests.</p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Link href="/en#booking" className="btn-primary">Send request <ArrowRight size={18} /></Link>
              <Link href="/en/prices" className="btn-secondary">Calculate price</Link>
            </div>
          </div>
          <aside className="rounded-[2.5rem] border border-burgundy/10 bg-porcelain/80 p-8 shadow-luxe backdrop-blur-xl">
            <div className="mb-12 grid h-16 w-16 place-items-center rounded-full bg-burgundy text-porcelain"><Sparkles size={30} /></div>
            <h2 className="display text-4xl font-bold text-burgundy">Iboren makes booking clearer.</h2>
            <div className="mt-7 grid gap-4">
              {points.map((item) => <p key={item} className="flex gap-3 text-ink/70"><CheckCircle2 className="mt-1 h-5 w-5 shrink-0 text-burgundy" /> {item}</p>)}
            </div>
          </aside>
        </div>
      </section>

      <section className="bg-porcelain py-16">
        <div className="luxe-container grid gap-5 md:grid-cols-3">
          <Info icon={<MapPin />} title="Area" text="Iboren focuses on Södertälje and Stockholm with local service pages for cleaning." />
          <Info icon={<ShieldCheck />} title="Safe flow" text="A request is not automatically confirmed. Time, scope and terms are confirmed before the job starts." />
          <Info icon={<Mail />} title="Contact" text="Customers receive email confirmation and can contact Iboren at hej@iboren.se." />
        </div>
      </section>

      <section className="bg-cream py-16">
        <div className="luxe-container max-w-4xl rounded-[2rem] bg-burgundy p-8 text-porcelain shadow-luxe">
          <p className="text-xs font-black uppercase tracking-[.28em] text-gold">Iboren</p>
          <h2 className="display mt-3 text-4xl font-bold md:text-6xl">Cleaning with a clearer first step.</h2>
          <p className="mt-5 max-w-2xl leading-8 text-porcelain/72">Iboren helps the customer provide the right information from the beginning, so the booking request becomes easier to follow up and confirm.</p>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <Link href="/en#booking" className="inline-flex rounded-full bg-gold px-5 py-3 text-sm font-black uppercase tracking-[.12em] text-ink">Start request</Link>
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
