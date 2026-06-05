import Link from "next/link";
import { ArrowRight, CheckCircle2, Info } from "lucide-react";
import EnglishPriceCalculator from "../../EnglishPriceCalculator";
import EnglishRutInfo from "../../EnglishRutInfo";

export const metadata = {
  title: "Cleaning prices in Södertälje & Stockholm | Iboren",
  description: "Calculate an estimated price for home cleaning, move-out cleaning, deep cleaning, office cleaning and window cleaning in Södertälje and Stockholm with RUT deduction information.",
  alternates: { canonical: "https://iboren.se/en/prices", languages: { sv: "https://iboren.se/priser", en: "https://iboren.se/en/prices" } },
  openGraph: {
    title: "Cleaning prices in Södertälje & Stockholm | Iboren",
    description: "Get a clear price indication for cleaning with RUT information and send a booking request online.",
    url: "https://iboren.se/en/prices",
    siteName: "Iboren",
    locale: "en_SE",
    type: "website"
  }
};

const priceNotes = [
  "RUT deduction is normally applied directly on the invoice for private customers.",
  "The price is an estimate. Final price is confirmed before the request becomes binding.",
  "Add-ons, property condition, accessibility and windows may affect the final price."
];

const serviceLinks = [
  { label: "Home cleaning", href: "/en/home-cleaning" },
  { label: "Move-out cleaning", href: "/en/move-out-cleaning" },
  { label: "Office cleaning", href: "/en/office-cleaning" },
  { label: "Window cleaning", href: "/en/window-cleaning" },
  { label: "Work with us", href: "/en/jobs" }
];

export default function EnglishPricesPage() {
  return (
    <main className="price-page-dark min-h-screen">
      <section className="price-page-hero relative overflow-hidden py-20 md:py-28">
        <div className="luxe-container relative grid gap-10 lg:grid-cols-[.86fr_1.14fr] lg:items-start">
          <div>
            <Link href="/en" className="price-back-link mb-10 inline-flex text-sm font-bold">← Back</Link>
            <p className="price-page-eyebrow text-xs font-black uppercase tracking-[.32em]">Instant price estimate</p>
            <h1 className="price-page-title display mt-4 text-6xl font-bold leading-[.88] md:text-8xl">Get a cleaning price estimate</h1>
            <p className="price-page-lead mt-7 max-w-2xl text-lg leading-8 md:text-xl">Estimate the cost of home cleaning, move-out cleaning, deep cleaning, office cleaning or window cleaning in Södertälje and Stockholm.</p>
            <div className="price-info-card mt-8 rounded-2xl border p-5 text-sm leading-7">
              <p className="flex gap-3"><Info className="mt-1 h-5 w-5 shrink-0" /> The calculator gives a detailed price estimate with RUT information. After your request, Iboren confirms the final price, time and any add-ons.</p>
            </div>
            <div className="price-check-list mt-8 grid gap-3 text-sm font-bold">
              {priceNotes.map((item) => <p key={item} className="flex gap-3"><CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0" /> {item}</p>)}
            </div>
          </div>

          <EnglishPriceCalculator />
        </div>
      </section>

      <EnglishRutInfo />

      <section className="price-service-section py-16">
        <div className="luxe-container">
          <p className="price-page-eyebrow text-xs font-black uppercase tracking-[.32em]">Services</p>
          <h2 className="price-page-title display mt-4 max-w-3xl text-5xl font-bold leading-[.92] md:text-6xl">Continue to the right service or send a request.</h2>
          <div className="mt-10 grid gap-4 md:grid-cols-5">
            {serviceLinks.map((item) => <Link key={item.href} href={item.href} className="price-service-card rounded-[1.6rem] p-5 font-black transition hover:-translate-y-1">{item.label}<ArrowRight className="mt-4 h-4 w-4" /></Link>)}
          </div>
        </div>
      </section>
    </main>
  );
}
