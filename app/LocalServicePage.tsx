import Link from "next/link";
import { ArrowRight, CheckCircle2, MapPin, ShieldCheck, Sparkles } from "lucide-react";
import FaqStructuredData from "./FaqStructuredData";

type FaqItem = { q: string; a: string };

type LocalServicePageProps = {
  city: string;
  service: string;
  slug: string;
  eyebrow: string;
  title: string;
  description: string;
  intro: string;
  bullets: string[];
  included: string[];
  faq: FaqItem[];
  priceText: string;
  rutText: string;
};

function JsonLd({ data }: { data: Record<string, unknown> }) {
  return <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(data).replace(/</g, "\\u003c") }} />;
}

export default function LocalServicePage(props: LocalServicePageProps) {
  const isOfficeCleaning = props.service === "Kontorsstädning";
  const serviceSchema = {
    "@context": "https://schema.org",
    "@type": "Service",
    name: `${props.service} i ${props.city}`,
    provider: {
      "@type": "LocalBusiness",
      name: "Iboren",
      url: "https://iboren.se",
      areaServed: props.city,
      email: "hej@iboren.se"
    },
    areaServed: {
      "@type": "City",
      name: props.city
    },
    serviceType: props.service,
    url: `https://iboren.se/${props.slug}`,
    description: props.description
  };

  const breadcrumbSchema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Iboren", item: "https://iboren.se" },
      { "@type": "ListItem", position: 2, name: props.title, item: `https://iboren.se/${props.slug}` }
    ]
  };

  return (
    <main className="iboren-page-dark min-h-screen">
      <FaqStructuredData items={props.faq} />
      <JsonLd data={serviceSchema} />
      <JsonLd data={breadcrumbSchema} />

      <section className="relative overflow-hidden py-20 md:py-28">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_20%,rgba(212,165,116,.35),transparent_32%),radial-gradient(circle_at_18%_75%,rgba(107,39,55,.14),transparent_34%)]" />
        <div className="luxe-container relative grid gap-10 lg:grid-cols-[.95fr_1.05fr] lg:items-center">
          <div>
            <Link href="/" className="iboren-gold-accent mb-10 inline-flex text-sm font-bold">← Tillbaka</Link>
            <p className="iboren-gold-accent text-[11px] font-bold uppercase tracking-[.38em]">{props.eyebrow}</p>
            <h1 className="display mt-4 text-6xl font-bold leading-[.88] text-porcelain md:text-8xl">{props.title}</h1>
            <p className="iboren-text-muted-dark mt-7 max-w-2xl text-lg leading-8 md:text-xl">{props.intro}</p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Link href="/priser#pris-kalkylator" className="btn-primary">Få pris direkt <ArrowRight size={18} /></Link>
              <Link href="/boka-utan-konto" className="btn-secondary">Skicka förfrågan</Link>
            </div>
          </div>

          <div className="iboren-card-glass iboren-card-glass-hover rounded-[2.5rem] p-8">
            <div className="mb-10 flex items-center justify-between gap-4">
              <div className="iboren-gold-accent grid h-16 w-16 place-items-center rounded-full border border-gold/30 bg-gold/10"><MapPin size={30} /></div>
              <span className="iboren-gold-accent rounded-full border border-gold/50 bg-gold/20 px-4 py-2 text-xs font-bold uppercase tracking-[.24em]">{props.city}</span>
            </div>
            <h2 className="display text-4xl font-bold text-porcelain">Tydlig offert innan uppdraget bekräftas.</h2>
            <div className="mt-7 grid gap-4">
              {props.bullets.map((item) => <p key={item} className="iboren-text-muted-dark flex gap-3"><CheckCircle2 className="iboren-gold-accent mt-1 h-5 w-5 shrink-0" /> {item}</p>)}
            </div>
          </div>
        </div>
      </section>

      <section className="iboren-section-dark py-16">
        <div className="luxe-container grid gap-5 md:grid-cols-3">
          <Info icon={<Sparkles />} title="Prisindikation" text={props.priceText} />
          <Info
            icon={<ShieldCheck />}
            title={isOfficeCleaning ? "Företagsanpassat upplägg" : "RUT & villkor"}
            text={isOfficeCleaning ? "Välj städfrekvens, tider och kontaktväg som passar verksamheten. Offerten bekräftas innan uppdraget startar." : "RUT gäller normalt för upp till 50% av godkänd arbetskostnad, om kunden uppfyller villkoren och har RUT kvar. Material, resor och andra kostnader ingår inte."}
          />
          <Info icon={<MapPin />} title={`Lokalt i ${props.city}`} text={`Bokningsformuläret samlar område, adress, yta, datum och önskemål för ${props.service.toLowerCase()} i ${props.city}.`} />
        </div>
      </section>

      <section className="iboren-page-dark py-16">
        <div className="luxe-container grid gap-10 md:grid-cols-[.9fr_1.1fr] md:items-start">
          <div>
            <p className="iboren-gold-accent text-[11px] font-bold uppercase tracking-[.38em]">Om tjänsten</p>
            <h2 className="display mt-3 text-4xl font-bold text-porcelain md:text-6xl">Vad ingår i {props.service.toLowerCase()}?</h2>
            <p className="iboren-text-muted-dark mt-5 leading-8">Iboren använder uppgifterna i bokningsförfrågan för att ge ett tydligt underlag innan tid, omfattning och pris bekräftas.</p>
          </div>
          <div className="grid gap-4">
            {props.included.map((item) => <p key={item} className="iboren-card-glass iboren-card-glass-hover iboren-text-muted-dark flex gap-3 rounded-2xl p-5"><CheckCircle2 className="iboren-gold-accent mt-1 h-5 w-5 shrink-0" /> {item}</p>)}
          </div>
        </div>
      </section>

      <section className="iboren-section-dark py-16">
        <div className="luxe-container max-w-4xl">
          <p className="iboren-gold-accent text-[11px] font-bold uppercase tracking-[.38em]">FAQ</p>
          <h2 className="display mt-3 text-4xl font-bold text-porcelain md:text-6xl">Vanliga frågor.</h2>
          <div className="mt-10 grid gap-4">
            {props.faq.map((item) => <article key={item.q} className="iboren-card-glass iboren-card-glass-hover rounded-[1.5rem] p-6"><h3 className="iboren-gold-accent font-bold">{item.q}</h3><p className="iboren-text-muted-dark mt-2 leading-7">{item.a}</p></article>)}
          </div>
          <div className="iboren-card-glass iboren-card-glass-hover mt-10 rounded-[2rem] p-7 text-porcelain">
            <h2 className="display text-4xl font-bold">Redo att skicka förfrågan?</h2>
            <p className="mt-3 text-porcelain/70">Beräkna pris eller gå direkt till bokningsformuläret.</p>
            <div className="mt-6 flex flex-col gap-3 sm:flex-row">
              <Link href="/priser#pris-kalkylator" className="inline-flex rounded-full bg-gold px-5 py-3 text-sm font-black uppercase tracking-[.12em] text-ink">Få pris direkt</Link>
              <Link href="/boka-utan-konto" className="inline-flex rounded-full border border-gold/40 px-5 py-3 text-sm font-black uppercase tracking-[.12em] text-gold">Skicka förfrågan</Link>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}

function Info({ icon, title, text }: { icon: React.ReactNode; title: string; text: string }) {
  return <article className="iboren-card-glass iboren-card-glass-hover rounded-[2rem] p-6"><div className="iboren-gold-accent mb-6 grid h-12 w-12 place-items-center rounded-full border border-gold/30 bg-gold/10">{icon}</div><h3 className="iboren-gold-accent display text-3xl font-bold">{title}</h3><p className="iboren-text-muted-dark mt-3 leading-7">{text}</p></article>;
}
