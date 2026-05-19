import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Vad kostar hemstädning? – Iboren",
  description: "Guide om vad som påverkar priset för hemstädning och hur RUT-avdrag påverkar kundpriset.",
  alternates: { canonical: "https://iboren.se/blogg/vad-kostar-hemstadning" }
};

export default function Page() {
  return (
    <main className="min-h-screen bg-cream text-ink">
      <article className="luxe-container max-w-4xl py-24">
        <Link href="/blogg" className="mb-10 inline-flex text-sm font-bold text-burgundy">← Städguide</Link>
        <p className="eyebrow">Prisguide</p>
        <h1 className="display mt-4 text-5xl font-bold leading-[.9] text-burgundy md:text-7xl">Vad kostar hemstädning?</h1>
        <p className="mt-7 text-lg leading-8 text-ink/75">Priset för hemstädning påverkas främst av bostadens storlek, antal badrum, frekvens och vilka tillval som behövs.</p>
        <section className="mt-10 grid gap-5">
          <div className="rounded-[2rem] bg-porcelain p-6 shadow-soft"><h2 className="display text-3xl font-bold text-burgundy">Vanliga prisfaktorer</h2><p className="mt-3 leading-8 text-ink/75">Yta, antal rum, antal badrum, husdjur, tillval och om städningen är återkommande påverkar tiden och priset.</p></div>
          <div className="rounded-[2rem] bg-porcelain p-6 shadow-soft"><h2 className="display text-3xl font-bold text-burgundy">RUT-avdrag</h2><p className="mt-3 leading-8 text-ink/75">För hemstädning kan RUT-avdrag normalt minska kundens kostnad om villkoren är uppfyllda.</p></div>
          <div className="rounded-[2rem] bg-burgundy p-6 text-porcelain shadow-soft"><h2 className="display text-3xl font-bold">Vill du räkna själv?</h2><p className="mt-3 leading-8 text-porcelain/80">Använd Iborens prisindikator för att få en uppskattning innan du skickar en förfrågan.</p><Link href="/priser" className="mt-6 inline-flex rounded-full bg-gold px-5 py-3 text-sm font-black uppercase tracking-[.12em] text-ink">Beräkna pris</Link></div>
        </section>
      </article>
    </main>
  );
}
