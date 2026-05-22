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
  "RUT deduction is normally deducted directly on the invoice for private customers.",
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
    <main className="min-h-screen bg-cream text-ink">
      <section className="relative overflow-hidden py-20 md:py-28">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_20%,rgba(212,165,116,.35),transparent_32%),radial-gradient(circle_at_18%_75%,rgba(107,39,55,.14),transparent_34%)]" />
        <div className="luxe-container relative grid gap-10 lg:grid-cols-[.86fr_1.14fr] lg:items-start">
          <div>
            <Link href="/en" className="mb-10 inline-flex text-sm font-bold text-burgundy">← Back</Link>
            <p className="eyebrow">Price directly</p>
            <h1 className="display mt-4 text-6xl font-bold leading-[.88] text-burgundy md:text-8xl">Calculate cleaning price</h1>
            <p className="mt-7 max-w-2xl text-lg leading-8 text-ink/75 md:text-xl">Calculate an estimated price for home cleaning, move-out cleaning, deep cleaning, office cleaning or window cleaning in Södertälje and Stockholm.</p>
            <div className="mt-8 rounded-2xl border border-burgundy/10 bg-porcelain p-5 text-sm leading-7 text-ink/75">
              <p className="flex gap-3"><Info className="mt-1 h-5 w-5 shrink-0 text-burgundy" /> The calculator shows a price indication with clear RUT calculation. After your request, Iboren confirms final price, time and any add-ons.</p>
            </div>
            <div className="mt-8 grid gap-3 text-sm font-bold text-ink/72">
              {priceNotes.map((item) => <p key={item} className="flex gap-3"><CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-burgundy" /> {item}</p>)}
            </div>
          </div>

          <EnglishPriceCalculator />
        </div>
      </section>

      <EnglishRutInfo />

      <section className="bg-porcelain py-16">
        <div className="luxe-container">
          <p className="eyebrow">Services</p>
          <h2 className="display mt-4 max-w-3xl text-5xl font-bold leading-[.92] text-burgundy md:text-6xl">Continue to the right service or send a request.</h2>
          <div className="mt-10 grid gap-4 md:grid-cols-5">
            {serviceLinks.map((item) => <Link key={item.href} href={item.href} className="rounded-[1.6rem] bg-cream p-5 font-black text-burgundy shadow-soft transition hover:-translate-y-1 hover:bg-white">{item.label}<ArrowRight className="mt-4 h-4 w-4" /></Link>)}
          </div>
        </div>
      </section>
    </main>
  );
}
