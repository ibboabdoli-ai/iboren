import Link from "next/link";
import { ArrowRight, CheckCircle2, Info } from "lucide-react";

export const metadata = {
  title: "Prices for cleaning | Iboren",
  description: "Get a price indication for cleaning services in Södertälje and Stockholm. RUT deductions may apply according to Skatteverket rules.",
  alternates: { canonical: "https://iboren.se/en/prices", languages: { sv: "https://iboren.se/priser", en: "https://iboren.se/en/prices" } }
};

const notes = [
  "Prices are estimates and final price is confirmed before the request becomes binding.",
  "RUT deductions may apply according to Skatteverket rules when the conditions are fulfilled.",
  "Add-ons, condition, accessibility and windows may affect the final price."
];

const links = [
  { label: "Home cleaning", href: "/en/home-cleaning-sodertalje" },
  { label: "Move-out cleaning", href: "/en/move-out-cleaning-sodertalje" },
  { label: "Home cleaning Stockholm", href: "/en/home-cleaning-stockholm" },
  { label: "Move-out cleaning Stockholm", href: "/en/move-out-cleaning-stockholm" }
];

export default function EnglishPricesPage() {
  return (
    <main className="min-h-screen bg-cream text-ink">
      <section className="relative overflow-hidden py-20 md:py-28">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_20%,rgba(212,165,116,.35),transparent_32%),radial-gradient(circle_at_18%_75%,rgba(107,39,55,.14),transparent_34%)]" />
        <div className="luxe-container relative grid gap-10 lg:grid-cols-[.9fr_1.1fr] lg:items-start">
          <div>
            <Link href="/en" className="mb-10 inline-flex text-sm font-bold text-burgundy">← Back</Link>
            <p className="eyebrow">Price indication</p>
            <h1 className="display mt-4 text-6xl font-bold leading-[.88] text-burgundy md:text-8xl">Cleaning prices</h1>
            <p className="mt-7 max-w-2xl text-lg leading-8 text-ink/75 md:text-xl">Get a price indication for home cleaning, move-out cleaning, office cleaning and window cleaning in Södertälje and Stockholm.</p>
            <div className="mt-8 rounded-2xl border border-burgundy/10 bg-porcelain p-5 text-sm leading-7 text-ink/75">
              <p className="flex gap-3"><Info className="mt-1 h-5 w-5 shrink-0 text-burgundy" /> Choose your preferred date and time in the request form. Iboren checks availability and gets back to you with confirmation.</p>
            </div>
          </div>
          <div className="rounded-[2rem] border border-burgundy/10 bg-porcelain p-6 shadow-luxe md:p-8">
            <p className="text-xs font-black uppercase tracking-[.28em] text-burgundy">RUT</p>
            <h2 className="display mt-2 text-4xl font-bold text-burgundy">Safe price information</h2>
            <div className="mt-6 grid gap-3">
              {notes.map((item) => <p key={item} className="flex gap-3 rounded-2xl bg-cream p-4 text-sm leading-7 text-ink/75"><CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-burgundy" /> {item}</p>)}
            </div>
            <div className="mt-7 flex flex-col gap-3 sm:flex-row"><Link href="/priser" className="btn-primary">Open calculator <ArrowRight size={18} /></Link><Link href="/#booking" className="btn-secondary">Send request</Link></div>
          </div>
        </div>
      </section>
      <section className="bg-porcelain py-16"><div className="luxe-container"><p className="eyebrow">Services</p><h2 className="display mt-4 max-w-3xl text-5xl font-bold leading-[.92] text-burgundy md:text-6xl">Choose service page.</h2><div className="mt-10 grid gap-4 md:grid-cols-4">{links.map((item) => <Link key={item.href} href={item.href} className="rounded-[1.6rem] bg-cream p-5 font-black text-burgundy shadow-soft transition hover:-translate-y-1 hover:bg-white">{item.label}<ArrowRight className="mt-4 h-4 w-4" /></Link>)}</div></div></section>
    </main>
  );
}
