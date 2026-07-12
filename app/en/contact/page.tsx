import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, CheckCircle2, Clock, Mail, MapPin, Phone } from "lucide-react";

export const metadata: Metadata = {
  title: "Contact Iboren | Cleaning in Södertälje and Stockholm",
  description: "Contact Iboren about home cleaning, move-out cleaning, office cleaning or window cleaning in Södertälje and Stockholm.",
  alternates: {
    canonical: "https://iboren.se/en/contact",
    languages: {
      sv: "https://iboren.se/kontakt",
      en: "https://iboren.se/en/contact",
    },
  },
  openGraph: {
    title: "Contact Iboren | Cleaning in Södertälje and Stockholm",
    description: "Contact Iboren about home cleaning, move-out cleaning, office cleaning or window cleaning in Södertälje and Stockholm.",
    url: "https://iboren.se/en/contact",
  },
};

const topics: Array<[string, string]> = [
  ["Price questions", "Use the calculator for an estimate, or email Iboren if you need help with the details."],
  ["Booking questions", "Send a request with the service, address and preferred date. Time and price are confirmed before booking."],
  ["Job applications", "Use the jobs page to send an interest application and share your experience and availability."]
];

export default function ContactPage() {
  return (
    <main className="iboren-page-dark min-h-screen">
      <section className="relative overflow-hidden py-20 md:py-28">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_20%,rgba(212,165,116,.35),transparent_32%),radial-gradient(circle_at_18%_75%,rgba(107,39,55,.14),transparent_34%)]" />
        <div className="luxe-container relative grid gap-10 md:grid-cols-[1fr_.9fr] md:items-start">
          <div>
            <Link href="/en" className="iboren-gold-accent mb-10 inline-flex text-sm font-bold">← Back</Link>
            <p className="iboren-gold-accent text-[11px] font-bold uppercase tracking-[.38em]">Contact</p>
            <h1 className="display mt-4 text-6xl font-bold leading-[.88] text-porcelain md:text-8xl">Contact Iboren</h1>
            <p className="iboren-text-muted-dark mt-7 max-w-2xl text-lg leading-8 md:text-xl">Questions about cleaning, prices, RUT deductions or a booking request? Contact Iboren and we will get back to you as soon as possible.</p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Link href="/en/prices" className="btn-primary">Get a price estimate <ArrowRight size={18} /></Link>
              <Link href="/en/boka-utan-konto" className="btn-secondary">Send a request</Link>
            </div>
          </div>

          <aside className="iboren-card-glass iboren-card-glass-hover rounded-[2.5rem] p-8">
            <h2 className="iboren-gold-accent display text-4xl font-bold">Contact details</h2>
            <div className="mt-7 grid gap-5">
              <a href="mailto:hej@iboren.se" className="iboren-card-glass iboren-card-glass-hover iboren-text-muted-dark flex gap-3 rounded-2xl p-5"><Mail className="iboren-gold-accent mt-1 h-5 w-5 shrink-0" /> hej@iboren.se</a>
              <a href="tel:+46760354141" className="iboren-card-glass iboren-card-glass-hover iboren-text-muted-dark flex gap-3 rounded-2xl p-5"><Phone className="iboren-gold-accent mt-1 h-5 w-5 shrink-0" /> 076 035 41 41</a>
              <p className="iboren-card-glass iboren-card-glass-hover iboren-text-muted-dark flex gap-3 rounded-2xl p-5"><MapPin className="iboren-gold-accent mt-1 h-5 w-5 shrink-0" /> Södertälje and Stockholm</p>
              <p className="iboren-card-glass iboren-card-glass-hover iboren-text-muted-dark flex gap-3 rounded-2xl p-5"><Clock className="iboren-gold-accent mt-1 h-5 w-5 shrink-0" /> We normally reply as soon as we can.</p>
            </div>
          </aside>
        </div>
      </section>

      <section className="iboren-section-dark py-16">
        <div className="luxe-container grid gap-5 md:grid-cols-3">
          {topics.map(([title, text]) => <article key={title} className="iboren-card-glass iboren-card-glass-hover rounded-[2rem] p-6"><CheckCircle2 className="iboren-gold-accent mb-5" /><h2 className="iboren-gold-accent display text-3xl font-bold">{title}</h2><p className="iboren-text-muted-dark mt-3 leading-7">{text}</p></article>)}
        </div>
      </section>
    </main>
  );
}
