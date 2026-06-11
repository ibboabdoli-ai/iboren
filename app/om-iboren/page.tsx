import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, CheckCircle2, Mail, MapPin, ShieldCheck } from "lucide-react";

export const metadata: Metadata = {
  title: "Om Iboren – Lokal städfirma i Södertälje och Stockholm",
  description: "Läs mer om Iboren, en lokal städfirma som hjälper privatpersoner och företag med hemstädning, flyttstädning, kontorsstädning och fönsterputs i Södertälje och Stockholm.",
  keywords: ["Iboren", "om Iboren", "städfirma Södertälje", "städfirma Stockholm", "hemstädning Södertälje", "flyttstädning Stockholm"],
  alternates: { canonical: "https://iboren.se/om-oss", languages: { sv: "https://iboren.se/om-oss", en: "https://iboren.se/en/about" } }
};

const points = [
  "Lokal städning för hem och företag i Södertälje och Stockholm",
  "Tydlig kommunikation från första förfrågan till utfört uppdrag",
  "Prisbild, omfattning och önskat datum gås igenom innan uppdrag bekräftas",
  "RUT-avdrag hanteras tydligt för privatpersoner där det är aktuellt"
];

const schema = {
  "@context": "https://schema.org",
  "@type": "AboutPage",
  "@id": "https://iboren.se/om-oss#about",
  url: "https://iboren.se/om-oss",
  name: "Om Iboren",
  description: "Iboren är en lokal städfirma för privatpersoner och företag i Södertälje och Stockholm.",
  mainEntity: { "@id": "https://iboren.se/#organization" }
};

export default function OmIborenPage() {
  return (
    <main className="service-page-dark min-h-screen bg-cream text-ink">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schema).replace(/</g, "\u003c") }} />
      <section className="service-hero relative overflow-hidden bg-cream py-20 md:py-28">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_20%,rgba(212,165,116,.35),transparent_32%),radial-gradient(circle_at_18%_75%,rgba(107,39,55,.14),transparent_34%)]" />
        <div className="luxe-container relative grid gap-10 md:grid-cols-[1fr_.9fr] md:items-center">
          <div>
            <Link href="/" className="service-back-link mb-10 inline-flex text-sm font-bold text-burgundy">← Tillbaka</Link>
            <p className="service-eyebrow eyebrow">Lokal städfirma</p>
            <h1 className="service-title display mt-4 text-6xl font-bold leading-[.88] text-burgundy md:text-8xl">Om Iboren</h1>
            <p className="service-lead mt-7 max-w-2xl text-lg leading-8 text-ink/70 md:text-xl">Iboren hjälper privatpersoner och företag med noggrann städning i Södertälje och Stockholm. Vi fokuserar på tydlig kommunikation, pålitlig service och enkel bokning från första kontakt till utfört uppdrag.</p>
            <p className="mt-5 max-w-2xl leading-8 text-ink/65">När du skickar en förfrågan samlar vi rätt information från början: tjänst, adress, storlek, datum, kontaktuppgifter och särskilda önskemål. Det gör det enklare att ge rätt återkoppling och bekräfta uppdraget på ett tryggt sätt.</p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Link href="/#booking" className="btn-primary">Starta förfrågan <ArrowRight size={18} /></Link>
              <Link href="/stadning-sodertalje" className="btn-secondary">Städning i Södertälje</Link>
            </div>
          </div>
          <aside className="service-panel iboren-card-glass iboren-card-glass-hover rounded-[2.5rem] p-8 shadow-luxe">
            <div className="mb-12 grid h-16 w-16 place-items-center rounded-full bg-burgundy text-porcelain"><ShieldCheck size={30} /></div>
            <h2 className="display text-4xl font-bold text-burgundy">Tryggare städning från första kontakt.</h2>
            <div className="mt-7 grid gap-4">
              {points.map((item) => <p key={item} className="flex gap-3 text-ink/70"><CheckCircle2 className="mt-1 h-5 w-5 shrink-0 text-burgundy" /> {item}</p>)}
            </div>
          </aside>
        </div>
      </section>

      <section className="bg-porcelain py-16">
        <div className="luxe-container grid gap-5 md:grid-cols-3">
          <Info icon={<MapPin />} title="Lokalt fokus" text="Iboren arbetar med städning i Södertälje och Stockholm och bygger innehåll och serviceflöde runt lokala kundbehov." />
          <Info icon={<ShieldCheck />} title="Tydlig bekräftelse" text="En förfrågan är inte automatiskt bekräftad. Tid, omfattning, prisbild och villkor gås igenom innan uppdraget startar." />
          <Info icon={<Mail />} title="Enkel kontakt" text="Kunder får bekräftelse via e-post och kan kontakta Iboren direkt via hej@iboren.se." />
        </div>
      </section>

      <section className="bg-cream py-16">
        <div className="service-cta-card iboren-card-glass iboren-card-glass-hover luxe-container max-w-4xl rounded-[2rem] p-8 text-porcelain shadow-luxe">
          <p className="text-xs font-black uppercase tracking-[.28em] text-gold">Iboren</p>
          <h2 className="display mt-3 text-4xl font-bold md:text-6xl">Städning med tydlighet och ansvar.</h2>
          <p className="mt-5 max-w-2xl leading-8 text-porcelain/72">Målet är att göra det enkelt att beskriva vad som ska städas, få rätt återkoppling och känna sig trygg innan uppdraget bekräftas.</p>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <Link href="/#booking" className="inline-flex rounded-full bg-gold px-5 py-3 text-sm font-black uppercase tracking-[.12em] text-ink">Skicka förfrågan</Link>
            <a href="mailto:hej@iboren.se" className="inline-flex rounded-full border border-gold/35 px-5 py-3 text-sm font-bold text-gold">hej@iboren.se</a>
            <a href="tel:+46760354141" className="inline-flex rounded-full border border-gold/35 px-5 py-3 text-sm font-bold text-gold">076 035 41 41</a>
          </div>
        </div>
      </section>
    </main>
  );
}

function Info({ icon, title, text }: { icon: React.ReactNode; title: string; text: string }) {
  return <article className="service-card iboren-card-glass iboren-card-glass-hover rounded-[2rem] p-6 shadow-soft"><div className="service-icon mb-6 grid h-12 w-12 place-items-center rounded-full">{icon}</div><h3 className="display text-3xl font-bold">{title}</h3><p className="iboren-text-muted-dark mt-3 leading-7">{text}</p></article>;
}
