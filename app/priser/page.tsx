import Link from "next/link";
import { ArrowRight, CheckCircle2, Info } from "lucide-react";
import PriceCalculator from "../PriceCalculator";

export const metadata = {
  title: "Priser städning Södertälje & Stockholm | Iboren",
  description: "Beräkna uppskattat pris för hemstädning, flyttstädning, storstädning, kontorsstädning och fönsterputs i Södertälje och Stockholm med RUT-avdrag.",
  alternates: { canonical: "https://iboren.se/priser" },
  openGraph: {
    title: "Priser städning Södertälje & Stockholm | Iboren",
    description: "Få en tydlig prisindikation för städning med RUT-avdrag och skicka bokningsförfrågan online.",
    url: "https://iboren.se/priser",
    siteName: "Iboren",
    locale: "sv_SE",
    type: "website"
  }
};

const priceNotes = [
  "RUT-avdrag dras normalt direkt på fakturan för privatpersoner.",
  "Priset är en uppskattning. Slutligt pris bekräftas innan bokningen blir bindande.",
  "Tillval, bostadens skick, tillgänglighet och fönster kan påverka slutpriset."
];

const serviceLinks = [
  { label: "Hemstädning", href: "/hemstadning" },
  { label: "Flyttstädning", href: "/flyttstadning" },
  { label: "Kontorsstädning", href: "/kontorsstadning" },
  { label: "Fönsterputs", href: "/fonsterputs" },
  { label: "Jobba hos oss", href: "/jobb" }
];

export default function PriserPage() {
  return (
    <main className="min-h-screen bg-cream text-ink">
      <section className="relative overflow-hidden py-20 md:py-28">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_20%,rgba(212,165,116,.35),transparent_32%),radial-gradient(circle_at_18%_75%,rgba(107,39,55,.14),transparent_34%)]" />
        <div className="luxe-container relative grid gap-10 lg:grid-cols-[.86fr_1.14fr] lg:items-start">
          <div>
            <Link href="/" className="mb-10 inline-flex text-sm font-bold text-burgundy">← Tillbaka</Link>
            <p className="eyebrow">Pris direkt</p>
            <h1 className="display mt-4 text-6xl font-bold leading-[.88] text-burgundy md:text-8xl">Beräkna pris för städning</h1>
            <p className="mt-7 max-w-2xl text-lg leading-8 text-ink/75 md:text-xl">Räkna fram ett uppskattat pris för hemstädning, flyttstädning, storstädning, kontorsstädning eller fönsterputs i Södertälje och Stockholm.</p>
            <div className="mt-8 rounded-2xl border border-burgundy/10 bg-porcelain p-5 text-sm leading-7 text-ink/75">
              <p className="flex gap-3"><Info className="mt-1 h-5 w-5 shrink-0 text-burgundy" /> Kalkylen visar en prisindikation med tydlig RUT-beräkning. Efter din förfrågan bekräftar Iboren slutligt pris, tid och eventuella tillval.</p>
            </div>
            <div className="mt-8 grid gap-3 text-sm font-bold text-ink/72">
              {priceNotes.map((item) => <p key={item} className="flex gap-3"><CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-burgundy" /> {item}</p>)}
            </div>
          </div>

          <PriceCalculator />
        </div>
      </section>

      <section className="bg-porcelain py-16">
        <div className="luxe-container">
          <p className="eyebrow">Tjänster</p>
          <h2 className="display mt-4 max-w-3xl text-5xl font-bold leading-[.92] text-burgundy md:text-6xl">Gå vidare till rätt tjänst eller skicka förfrågan.</h2>
          <div className="mt-10 grid gap-4 md:grid-cols-5">
            {serviceLinks.map((item) => <Link key={item.href} href={item.href} className="rounded-[1.6rem] bg-cream p-5 font-black text-burgundy shadow-soft transition hover:-translate-y-1 hover:bg-white">{item.label}<ArrowRight className="mt-4 h-4 w-4" /></Link>)}
          </div>
        </div>
      </section>
    </main>
  );
}
