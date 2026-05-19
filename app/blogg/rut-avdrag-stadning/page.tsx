import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "RUT-avdrag för städning – Iboren",
  description: "Kort guide om RUT-avdrag för städning och hur det påverkar priset.",
  alternates: { canonical: "https://iboren.se/blogg/rut-avdrag-stadning" }
};

export default function Page() {
  return (
    <main className="min-h-screen bg-cream text-ink">
      <article className="luxe-container max-w-4xl py-24">
        <Link href="/blogg" className="mb-10 inline-flex text-sm font-bold text-burgundy">← Städguide</Link>
        <p className="eyebrow">RUT-avdrag</p>
        <h1 className="display mt-4 text-5xl font-bold leading-[.9] text-burgundy md:text-7xl">RUT-avdrag för städning</h1>
        <p className="mt-7 text-lg leading-8 text-ink/75">RUT-avdrag kan normalt användas för hushållsnära tjänster som hemstädning och vissa tillval när villkoren är uppfyllda.</p>
        <section className="mt-10 grid gap-5">
          <div className="rounded-[2rem] bg-porcelain p-6 shadow-soft"><h2 className="display text-3xl font-bold text-burgundy">Hur påverkar RUT priset?</h2><p className="mt-3 leading-8 text-ink/75">Prisindikatorn visar både totalpris och uppskattat kundpris efter RUT där det är relevant.</p></div>
          <div className="rounded-[2rem] bg-porcelain p-6 shadow-soft"><h2 className="display text-3xl font-bold text-burgundy">Viktigt</h2><p className="mt-3 leading-8 text-ink/75">RUT beror på kundens villkor och tjänstens typ. Slutligt pris bekräftas innan uppdraget startar.</p></div>
          <div className="rounded-[2rem] bg-burgundy p-6 text-porcelain shadow-soft"><h2 className="display text-3xl font-bold">Se pris direkt</h2><p className="mt-3 leading-8 text-porcelain/80">Använd prisindikatorn för en uppskattning.</p><Link href="/priser" className="mt-6 inline-flex rounded-full bg-gold px-5 py-3 text-sm font-black uppercase tracking-[.12em] text-ink">Beräkna pris</Link></div>
        </section>
      </article>
    </main>
  );
}
