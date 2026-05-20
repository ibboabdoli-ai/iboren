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
    <main className="min-h-screen bg-cream text-ink">
      <FaqStructuredData items={props.faq} />
      <JsonLd data={serviceSchema} />
      <JsonLd data={breadcrumbSchema} />

      <section className="relative overflow-hidden py-20 md:py-28">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_20%,rgba(212,165,116,.35),transparent_32%),radial-gradient(circle_at_18%_75%,rgba(107,39,55,.14),transparent_34%)]" />
        <div className="luxe-container relative grid gap-10 lg:grid-cols-[.95fr_1.05fr] lg:items-center">
          <div>
            <Link href="/" className="mb-10 inline-flex text-sm font-bold text-burgundy">← Tillbaka</Link>
            <p className="eyebrow">{props.eyebrow}</p>
            <h1 className="display mt-4 text-6xl font-bold leading-[.88] text-burgundy md:text-8xl">{props.title}</h1>
            <p className="mt-7 max-w-2xl text-lg leading-8 text-ink/72 md:text-xl">{props.intro}</p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Link href="/priser" className="btn-primary">Beräkna pris <ArrowRight size={18} /></Link>
              <Link href="/#booking" className="btn-secondary">Boka online</Link>
            </div>
          </div>

          <div className="rounded-[2.5rem] border border-burgundy/10 bg-porcelain/75 p-8 shadow-luxe backdrop-blur-xl">
            <div className="mb-10 flex items-center justify-between gap-4">
              <div className="grid h-16 w-16 place-items-center rounded-full bg-burgundy text-porcelain"><MapPin size={30} /></div>
              <span className="rounded-full border border-gold/50 bg-gold/20 px-4 py-2 text-xs font-bold uppercase tracking-[.24em] text-burgundy">{props.city}</span>
            </div>
            <h2 className="display text-4xl font-bold text-ink">Tydlig offert innan uppdraget bekräftas.</h2>
            <div className="mt-7 grid gap-4">
              {props.bullets.map((item) => <p key={item} className="flex gap-3 text-ink/70"><CheckCircle2 className="mt-1 h-5 w-5 shrink-0 text-burgundy" /> {item}</p>)}
            </div>
          </div>
        </div>
      </section>

      <section className="bg-porcelain py-16">
        <div className="luxe-container grid gap-5 md:grid-cols-3">
          <Info icon={<Sparkles />} title="Prisindikation" text={props.priceText} />
          <Info icon={<ShieldCheck />} title="RUT & villkor" text={props.rutText} />
          <Info icon={<MapPin />} title={`Lokalt i ${props.city}`} text={`Bokningsformuläret samlar område, adress, yta, datum och önskemål för ${props.service.toLowerCase()} i ${props.city}.`} />
        </div>
      </section>

      <section className="bg-cream py-16">
        <div className="luxe-container grid gap-10 md:grid-cols-[.9fr_1.1fr] md:items-start">
          <div>
            <p className="eyebrow">Om tjänsten</p>
            <h2 className="display mt-3 text-4xl font-bold text-burgundy md:text-6xl">Vad ingår i {props.service.toLowerCase()}?</h2>
            <p className="mt-5 leading-8 text-ink/65">Iboren använder uppgifterna i bokningsförfrågan för att ge ett tydligt underlag innan tid, omfattning och pris bekräftas.</p>
          </div>
          <div className="grid gap-4">
            {props.included.map((item) => <p key={item} className="flex gap-3 rounded-2xl bg-porcelain p-5 text-ink/70 shadow-sm"><CheckCircle2 className="mt-1 h-5 w-5 shrink-0 text-burgundy" /> {item}</p>)}
          </div>
        </div>
      </section>

      <section className="bg-porcelain py-16">
        <div className="luxe-container max-w-4xl">
          <p className="eyebrow">FAQ</p>
          <h2 className="display mt-3 text-4xl font-bold text-burgundy md:text-6xl">Vanliga frågor.</h2>
          <div className="mt-10 grid gap-4">
            {props.faq.map((item) => <article key={item.q} className="rounded-[1.5rem] bg-cream p-6 shadow-sm"><h3 className="font-bold text-burgundy">{item.q}</h3><p className="mt-2 leading-7 text-ink/65">{item.a}</p></article>)}
          </div>
          <div className="mt-10 rounded-[2rem] bg-burgundy p-7 text-porcelain">
            <h2 className="display text-4xl font-bold">Redo att skicka förfrågan?</h2>
            <p className="mt-3 text-porcelain/70">Beräkna pris eller gå direkt till bokningsformuläret.</p>
            <div className="mt-6 flex flex-col gap-3 sm:flex-row">
              <Link href="/priser" className="inline-flex rounded-full bg-gold px-5 py-3 text-sm font-black uppercase tracking-[.12em] text-ink">Beräkna pris</Link>
              <Link href="/#booking" className="inline-flex rounded-full border border-gold/40 px-5 py-3 text-sm font-black uppercase tracking-[.12em] text-gold">Boka online</Link>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}

function Info({ icon, title, text }: { icon: React.ReactNode; title: string; text: string }) {
  return <article className="rounded-[2rem] bg-cream p-6 shadow-soft"><div className="mb-6 grid h-12 w-12 place-items-center rounded-full bg-burgundy text-porcelain">{icon}</div><h3 className="display text-3xl font-bold text-burgundy">{title}</h3><p className="mt-3 leading-7 text-ink/65">{text}</p></article>;
}
