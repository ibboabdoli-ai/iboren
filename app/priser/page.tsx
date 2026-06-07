import Link from "next/link";
import { ArrowRight, CheckCircle2, Info } from "lucide-react";
import PriceCalculator from "../PriceCalculator";
import RutInfo from "../RutInfo";

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
  "Alla priser för privatpersoner visas inklusive moms.",
  "Pris efter RUT är kundens uppskattade pris att betala när RUT-avdrag kan användas.",
  "RUT-avdrag dras normalt direkt på fakturan för privatpersoner när Skatteverkets villkor är uppfyllda.",
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
    <main className="price-page-dark min-h-screen">
      <section className="price-page-hero relative overflow-hidden py-20 md:py-28">
        <div className="luxe-container relative grid gap-10 lg:grid-cols-[.86fr_1.14fr] lg:items-start">
          <div>
            <Link href="/" className="price-back-link mb-10 inline-flex text-sm font-bold">← Tillbaka</Link>
            <p className="price-page-eyebrow text-xs font-black uppercase tracking-[.32em]">Pris direkt</p>
            <h1 className="price-page-title display mt-4 text-6xl font-bold leading-[.88] md:text-8xl">Beräkna pris för städning</h1>
            <p className="price-page-lead mt-7 max-w-2xl text-lg leading-8 md:text-xl">Räkna fram ett uppskattat pris för hemstädning, flyttstädning, storstädning, kontorsstädning eller fönsterputs i Södertälje och Stockholm.</p>
            <div className="price-info-card iboren-card-glass iboren-card-glass-hover mt-8 rounded-2xl border p-5 text-sm leading-7">
              <p className="iboren-text-muted-dark flex gap-3"><Info className="iboren-gold-accent mt-1 h-5 w-5 shrink-0" /> Kalkylen visar en prisindikation med tydlig RUT-beräkning. Alla priser för privatpersoner visas inklusive moms. Efter din förfrågan bekräftar Iboren slutligt pris, tid och eventuella tillval.</p>
            </div>
            <div className="price-check-list mt-8 grid gap-3 text-sm font-bold">
              {priceNotes.map((item) => <p key={item} className="flex gap-3"><CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0" /> {item}</p>)}
            </div>
          </div>

          <PriceCalculator />
        </div>
      </section>

      <RutInfo />

      <section className="price-service-section py-16">
        <div className="luxe-container">
          <p className="price-page-eyebrow text-xs font-black uppercase tracking-[.32em]">Tjänster</p>
          <h2 className="price-page-title display mt-4 max-w-3xl text-5xl font-bold leading-[.92] md:text-6xl">Gå vidare till rätt tjänst eller skicka förfrågan.</h2>
          <div className="mt-10 grid gap-4 md:grid-cols-5">
            {serviceLinks.map((item) => <Link key={item.href} href={item.href} className="price-service-card iboren-card-glass iboren-card-glass-hover iboren-gold-accent rounded-[1.6rem] p-5 font-black">{item.label}<ArrowRight className="mt-4 h-4 w-4" /></Link>)}
          </div>
        </div>
      </section>
    </main>
  );
}
