import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, CheckCircle2, ShieldCheck, Sparkles, Waves } from "lucide-react";
import FaqStructuredData from "../FaqStructuredData";

export const metadata: Metadata = {
  title: "Fönsterputs i Södertälje och Stockholm – Iboren",
  description: "Skicka en tydlig förfrågan för fönsterputs i Södertälje och Stockholm. Ange antal fönster, insida/utsida, våning, åtkomst, datum och särskilda önskemål.",
  keywords: ["fönsterputs", "fönsterputs Södertälje", "fönsterputs Stockholm", "putsa fönster", "städning fönster", "Iboren fönsterputs"]
};

const items = [
  "För lägenhet, villa, radhus och mindre kontor",
  "Ange om du önskar insida, utsida eller båda delar",
  "Beskriv antal fönster, våning, balkong och åtkomst",
  "Omfattning, prisbild och tid bekräftas innan uppdraget planeras"
];

const included = [
  "Invändig och/eller utvändig fönsterputs enligt överenskommen omfattning",
  "Uppgifter om antal fönster, våning, balkong och åtkomst samlas in innan offert",
  "Extra detaljer som spröjs, svåråtkomliga fönster och fönsterbrädor kan anges i förfrågan",
  "Slutlig omfattning, prisbild och tid bekräftas innan uppdraget planeras"
];

const faq = [
  { q: "Kan jag boka fönsterputs som egen tjänst?", a: "Ja. Du kan välja fönsterputs som egen tjänst i bokningsformuläret och beskriva antal fönster, adress, våning och önskat datum." },
  { q: "Kan fönsterputs kombineras med hemstädning?", a: "Ja. Fönsterputs kan väljas som extra tjänst eller skickas som separat förfrågan beroende på behov och omfattning." },
  { q: "Vad påverkar priset för fönsterputs?", a: "Prisbilden påverkas bland annat av antal fönster, om det gäller insida eller utsida, våning, åtkomst, spröjs, balkong och fönstrens skick." },
  { q: "Är förfrågan bindande direkt?", a: "Nej. Bokningen blir bekräftad först när tid, omfattning, prisbild och praktiska villkor har stämts av." }
];

export default function FonsterputsPage() {
  return (
    <main className="service-page-dark min-h-screen">
      <FaqStructuredData items={faq} />
      <section className="service-hero relative overflow-hidden py-20 md:py-28">
        <div className="luxe-container relative grid gap-10 md:grid-cols-[.95fr_1.05fr] md:items-center">
          <div>
            <Link href="/" className="service-back-link mb-10 inline-flex text-sm font-bold">← Tillbaka</Link>
            <p className="service-eyebrow text-xs font-black uppercase tracking-[.32em]">Iboren Services</p>
            <h1 className="service-title display mt-4 text-6xl font-bold leading-[.88] md:text-8xl">Fönsterputs</h1>
            <p className="service-lead mt-7 max-w-2xl text-lg leading-8 md:text-xl">Skicka en tydlig förfrågan för fönsterputs i Södertälje och Stockholm. Ange antal fönster, om du vill ha insida, utsida eller båda delar, samt praktiska detaljer som våning, balkong och åtkomst.</p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Link href="/boka-utan-konto" className="btn-primary">Starta bokning <ArrowRight size={18} /></Link>
              <Link href="/stadning-sodertalje" className="btn-secondary">Fönsterputs Södertälje</Link>
            </div>
          </div>
          <div className="service-panel rounded-[2.5rem] p-8 shadow-luxe backdrop-blur-xl">
            <img src="/service-heroes/window-cleaning.webp" alt="Klara fönster i ett ljust rum" className="mb-8 h-52 w-full rounded-[1.5rem] object-cover shadow-soft" />
            <div className="mb-16 flex items-center justify-between">
              <div className="service-icon grid h-16 w-16 place-items-center rounded-full"><Waves size={30} /></div>
              <span className="rounded-full border px-4 py-2 text-xs font-bold uppercase tracking-[.24em]">Clear finish</span>
            </div>
            <h2 className="display text-4xl font-bold">Klara fönster med rätt omfattning från början.</h2>
            <div className="mt-7 grid gap-4">
              {items.map((item) => <p key={item} className="flex gap-3"><CheckCircle2 className="mt-1 h-5 w-5 shrink-0" /> {item}</p>)}
            </div>
          </div>
        </div>
      </section>

      <section className="py-16"><div className="luxe-container grid gap-5 md:grid-cols-3"><Info icon={<Sparkles />} title="Tydlig omfattning" text="Beskriv antal fönster, insida/utsida, våning och åtkomst redan i första förfrågan." /><Info icon={<ShieldCheck />} title="Ingen bindning direkt" text="Förfrågan blir inte bekräftad förrän tid, prisbild och villkor är överenskomna." /><Info icon={<Waves />} title="Kan kombineras" text="Fönsterputs kan väljas som egen tjänst eller som tillägg till annan städning." /></div></section>

      <section className="py-16">
        <div className="luxe-container grid gap-10 md:grid-cols-[.9fr_1.1fr] md:items-start">
          <div><p className="service-eyebrow text-xs font-black uppercase tracking-[.32em]">Vad ingår i underlaget?</p><h2 className="display mt-3 text-4xl font-bold md:text-6xl">Fönsterputs med tydlig omfattning innan offert.</h2><p className="mt-5 leading-8">Fönsterputs kan variera mycket beroende på antal fönster, åtkomst, våning, spröjs och om arbetet gäller insida, utsida eller båda delar. Därför samlar Iboren in rätt information innan uppdraget bekräftas.</p></div>
          <div className="grid gap-4">{included.map((item) => <p key={item} className="service-card flex gap-3 rounded-2xl p-5 shadow-sm"><ShieldCheck className="mt-1 h-5 w-5 shrink-0" /> {item}</p>)}</div>
        </div>
      </section>

      <section className="py-16">
        <div className="luxe-container max-w-4xl">
          <p className="service-eyebrow text-xs font-black uppercase tracking-[.32em]">FAQ</p><h2 className="display mt-3 text-4xl font-bold md:text-6xl">Vanliga frågor om fönsterputs.</h2>
          <div className="mt-10 grid gap-4">{faq.map((item) => <article key={item.q} className="rounded-[1.5rem] p-6 shadow-sm"><h3 className="font-bold">{item.q}</h3><p className="mt-2 leading-7">{item.a}</p></article>)}</div>
          <div className="service-cta-card mt-10 rounded-[2rem] p-7"><h2 className="display text-4xl font-bold">Redo att skicka förfrågan?</h2><p className="mt-3">Fyll i plats, antal fönster, önskat datum och särskilda önskemål så återkommer Iboren.</p><Link href="/boka-utan-konto" className="mt-6 inline-flex rounded-full bg-gold px-5 py-3 text-sm font-black uppercase tracking-[.12em] text-ink">Starta bokning</Link></div>
        </div>
      </section>
    </main>
  );
}

function Info({ icon, title, text }: { icon: React.ReactNode; title: string; text: string }) {
  return <article className="rounded-[2rem] p-6 shadow-soft"><div className="service-icon mb-6 grid h-12 w-12 place-items-center rounded-full">{icon}</div><h3 className="display text-3xl font-bold">{title}</h3><p className="mt-3 leading-7">{text}</p></article>;
}
