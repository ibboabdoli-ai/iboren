import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Städguide – Iboren",
  description: "Guider om städning, pris, RUT-avdrag och bokning.",
  alternates: { canonical: "https://iboren.se/blogg" }
};

const posts = [
  { href: "/blogg/vad-kostar-hemstadning", title: "Vad kostar hemstädning?", text: "Faktorer som påverkar priset för hemstädning." },
  { href: "/blogg/rut-avdrag-stadning", title: "RUT-avdrag för städning", text: "Kort guide om hur RUT påverkar priset." },
  { href: "/blogg/flyttstadning-checklista", title: "Checklista inför flyttstädning", text: "Praktiska punkter inför flytt och städning." }
];

export default function Page() {
  return (
    <main className="min-h-screen bg-cream text-ink">
      <section className="py-24">
        <div className="luxe-container">
          <Link href="/" className="mb-10 inline-flex text-sm font-bold text-burgundy">← Tillbaka</Link>
          <p className="eyebrow">Guide</p>
          <h1 className="display mt-4 text-6xl font-bold leading-[.88] text-burgundy md:text-8xl">Städguide</h1>
          <p className="mt-7 max-w-2xl text-lg leading-8 text-ink/75">Praktiska guider om städning, pris, RUT-avdrag och bokning.</p>
          <div className="mt-12 grid gap-5 md:grid-cols-3">
            {posts.map((post) => <Link key={post.href} href={post.href} className="rounded-[2rem] bg-porcelain p-6 shadow-soft"><h2 className="display text-3xl font-bold text-burgundy">{post.title}</h2><p className="mt-3 leading-7 text-ink/75">{post.text}</p><span className="mt-6 inline-flex font-bold text-burgundy">Läs mer →</span></Link>)}
          </div>
        </div>
      </section>
    </main>
  );
}
