import Link from "next/link";
import { ArrowRight, CheckCircle2, Info, MapPin, ShieldCheck, Sparkles } from "lucide-react";

type FaqItem = { q: string; a: string };

type Props = {
  title: string;
  eyebrow: string;
  description: string;
  city?: string;
  service?: string;
  urlPath?: string;
  points: string[];
  included?: string[];
  priceText?: string;
  rutText?: string;
  faq?: FaqItem[];
  swedishHref?: string;
};

function JsonLd({ data }: { data: Record<string, unknown> }) {
  return <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(data).replace(/</g, "\\u003c") }} />;
}

export default function EnglishInfoPage({ title, eyebrow, description, city, service, urlPath, points, included = [], priceText, rutText, faq = [], swedishHref = "/" }: Props) {
  const absoluteUrl = urlPath ? `https://iboren.se${urlPath}` : "https://iboren.se/en";
  const hasServiceSchema = Boolean(service || city);
  const isOfficeCleaning = service === "Office cleaning";

  const serviceSchema = hasServiceSchema ? {
    "@context": "https://schema.org",
    "@type": "Service",
    name: title,
    serviceType: service || title,
    areaServed: city ? { "@type": "City", name: city } : ["Södertälje", "Stockholm"],
    provider: { "@type": "LocalBusiness", name: "Iboren", url: "https://iboren.se", email: "hej@iboren.se" },
    url: absoluteUrl,
    description
  } : null;

  const faqSchema = faq.length ? {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faq.map((item) => ({ "@type": "Question", name: item.q, acceptedAnswer: { "@type": "Answer", text: item.a } }))
  } : null;

  return (
    <main className="iboren-page-dark min-h-screen">
      {serviceSchema && <JsonLd data={serviceSchema} />}
      {faqSchema && <JsonLd data={faqSchema} />}

      <section className="relative overflow-hidden py-20 md:py-28">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_20%,rgba(212,165,116,.35),transparent_32%),radial-gradient(circle_at_18%_75%,rgba(107,39,55,.14),transparent_34%)]" />
        <div className="luxe-container relative grid gap-10 lg:grid-cols-[.95fr_1.05fr] lg:items-center">
          <div>
            <Link href="/en" className="iboren-gold-accent mb-10 inline-flex text-sm font-bold">← Back</Link>
            <p className="iboren-gold-accent text-[11px] font-bold uppercase tracking-[.38em]">{eyebrow}</p>
            <h1 className="display mt-4 text-6xl font-bold leading-[.88] text-porcelain md:text-8xl">{title}</h1>
            <p className="iboren-text-muted-dark mt-7 max-w-2xl text-lg leading-8 md:text-xl">{description}</p>
            <p className="iboren-card-glass iboren-card-glass-hover iboren-text-muted-dark mt-5 max-w-2xl rounded-2xl p-4 text-sm leading-7">Choose your preferred date and time. Iboren checks availability and gets back to you with confirmation.</p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              {hasServiceSchema ? (
                <>
                  <Link href="/en/prices#price-calculator" className="btn-primary">Get price directly <ArrowRight size={18} /></Link>
                  <Link href="/en/boka-utan-konto" className="btn-secondary">Send request</Link>
                </>
              ) : (
                <>
                  <Link href="/en#booking" className="btn-primary">Send request <ArrowRight size={18} /></Link>
                  <Link href="/en/prices" className="btn-secondary">Prices</Link>
                </>
              )}
            </div>
          </div>
          <div className="iboren-card-glass iboren-card-glass-hover rounded-[2.5rem] p-8">
            <div className="mb-10 flex items-center justify-between gap-4">
              <div className="iboren-gold-accent grid h-16 w-16 place-items-center rounded-full border border-gold/30 bg-gold/10"><MapPin size={30} /></div>
              {city && <span className="iboren-gold-accent rounded-full border border-gold/50 bg-gold/20 px-4 py-2 text-xs font-bold uppercase tracking-[.24em]">{city}</span>}
            </div>
            <h2 className="display text-4xl font-bold text-porcelain">Clear request before confirmation.</h2>
            <div className="mt-7 grid gap-4">
              {points.map((item) => <p key={item} className="iboren-text-muted-dark flex gap-3"><CheckCircle2 className="iboren-gold-accent mt-1 h-5 w-5 shrink-0" /> {item}</p>)}
            </div>
          </div>
        </div>
      </section>

      {(priceText || rutText) && <section className="iboren-section-dark py-16"><div className="luxe-container grid gap-5 md:grid-cols-3"><InfoCard icon={<Sparkles />} title="Price indication" text={priceText || "Final price is confirmed before the work starts."} /><InfoCard icon={<ShieldCheck />} title={isOfficeCleaning ? "Business quote" : "RUT information"} text={isOfficeCleaning ? "Choose a cleaning frequency, preferred times and contact method that suit the business. The quote is confirmed before work starts." : "RUT normally covers up to 50% of approved labour cost if the customer meets the conditions and has RUT remaining. Materials, travel and other costs are not included."} /><InfoCard icon={<Info />} title="Request first" text="A submitted form is a booking request, not a confirmed appointment. Iboren checks availability first." /></div></section>}

      {included.length > 0 && <section className="iboren-page-dark py-16"><div className="luxe-container grid gap-10 md:grid-cols-[.9fr_1.1fr] md:items-start"><div><p className="iboren-gold-accent text-[11px] font-bold uppercase tracking-[.38em]">What is included</p><h2 className="display mt-3 text-4xl font-bold text-porcelain md:text-6xl">Service overview.</h2><p className="iboren-text-muted-dark mt-5 leading-8">The exact scope is confirmed before the request becomes a booking. The list below describes the typical basis for this service.</p></div><div className="grid gap-4">{included.map((item) => <p key={item} className="iboren-card-glass iboren-card-glass-hover iboren-text-muted-dark flex gap-3 rounded-2xl p-5"><CheckCircle2 className="iboren-gold-accent mt-1 h-5 w-5 shrink-0" /> {item}</p>)}</div></div></section>}

      {faq.length > 0 && <section className="iboren-section-dark py-16"><div className="luxe-container max-w-4xl"><p className="iboren-gold-accent text-[11px] font-bold uppercase tracking-[.38em]">FAQ</p><h2 className="display mt-3 text-4xl font-bold text-porcelain md:text-6xl">Common questions.</h2><div className="mt-10 grid gap-4">{faq.map((item) => <article key={item.q} className="iboren-card-glass iboren-card-glass-hover rounded-[1.5rem] p-6"><h3 className="iboren-gold-accent font-bold">{item.q}</h3><p className="iboren-text-muted-dark mt-2 leading-7">{item.a}</p></article>)}</div></div></section>}

      <section className="iboren-section-dark py-16 text-porcelain"><div className="luxe-container"><h2 className="display max-w-3xl text-4xl font-bold md:text-6xl">Ready to send a booking request?</h2><p className="mt-5 max-w-2xl leading-8 text-porcelain/75">Choose your preferred date and time. Iboren checks availability and gets back to you with confirmation.</p><div className="mt-8 flex flex-col gap-3 sm:flex-row">{hasServiceSchema ? <><Link href="/en/prices#price-calculator" className="inline-flex rounded-full bg-gold px-5 py-3 text-sm font-black uppercase tracking-[.12em] text-ink">Get price directly</Link><Link href="/en/boka-utan-konto" className="inline-flex rounded-full border border-gold/35 px-5 py-3 text-sm font-bold text-gold">Send request</Link></> : <Link href="/en#booking" className="inline-flex rounded-full bg-gold px-5 py-3 text-sm font-black uppercase tracking-[.12em] text-ink">Send request</Link>}<Link href={swedishHref} className="inline-flex rounded-full border border-gold/35 px-5 py-3 text-sm font-bold text-gold">Svenska</Link></div></div></section>
    </main>
  );
}

function InfoCard({ icon, title, text }: { icon: React.ReactNode; title: string; text: string }) {
  return <article className="iboren-card-glass iboren-card-glass-hover rounded-[2rem] p-6"><div className="iboren-gold-accent mb-6 grid h-12 w-12 place-items-center rounded-full border border-gold/30 bg-gold/10">{icon}</div><h3 className="iboren-gold-accent display text-3xl font-bold">{title}</h3><p className="iboren-text-muted-dark mt-3 leading-7">{text}</p></article>;
}
