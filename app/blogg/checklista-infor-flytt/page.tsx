import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Checklista inför flytt – Iboren",
  description: "Praktisk checklista inför bokning av städning vid flytt.",
  alternates: { canonical: "https://iboren.se/blogg/checklista-infor-flytt", languages: { sv: "https://iboren.se/blogg/checklista-infor-flytt", en: "https://iboren.se/en/blog/move-out-checklist" } }
};

const items = ["Yta i kvm", "Antal rum", "Antal badrum", "Datum", "Tillval", "Kontaktuppgifter"];

export default function Page() {
  return (
    <main className="iboren-page-dark min-h-screen">
      <article className="luxe-container max-w-4xl py-24">
        <Link href="/blogg" className="iboren-gold-accent mb-10 inline-flex text-sm font-bold">← Städguide</Link>
        <p className="eyebrow">Checklista</p>
        <h1 className="display mt-4 text-5xl font-bold leading-[.9] text-porcelain md:text-7xl">Checklista inför flytt</h1>
        <p className="iboren-text-muted-dark mt-7 text-lg leading-8">Samla rätt information innan du skickar en bokningsförfrågan.</p>
        <section className="mt-10 grid gap-4">
          {items.map((item) => <div key={item} className="iboren-card-glass iboren-card-glass-hover iboren-text-muted-dark rounded-[1.5rem] p-5 font-semibold">✓ {item}</div>)}
          <div className="iboren-card-glass iboren-card-glass-hover rounded-[2rem] p-6 text-porcelain"><h2 className="display text-3xl font-bold">Gå vidare</h2><p className="iboren-text-muted-dark mt-3 leading-8">Beräkna pris eller skicka en bokningsförfrågan.</p><div className="mt-6 flex flex-col gap-3 sm:flex-row"><Link href="/priser" className="inline-flex rounded-full bg-gold px-5 py-3 text-sm font-black uppercase tracking-[.12em] text-ink">Beräkna pris</Link><Link href="/#booking" className="inline-flex rounded-full border border-gold/35 px-5 py-3 text-sm font-bold text-gold">Boka städning</Link></div></div>
        </section>
      </article>
    </main>
  );
}
