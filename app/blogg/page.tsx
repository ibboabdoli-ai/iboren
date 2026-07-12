import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Städguide – Iboren",
  description: "Guider om städning, pris, RUT-avdrag och bokning.",
  alternates: { canonical: "https://iboren.se/blogg", languages: { sv: "https://iboren.se/blogg", en: "https://iboren.se/en/blog" } }
};

const posts = [
  { href: "/blogg/vad-kostar-hemstadning", title: "Vad kostar hemstädning?", text: "Faktorer som påverkar priset för hemstädning." },
  { href: "/blogg/rut-avdrag-stadning", title: "RUT-avdrag för städning", text: "Kort guide om hur RUT påverkar priset." },
  { href: "/blogg/checklista-infor-flytt", title: "Checklista inför flytt", text: "Praktiska punkter inför flytt och städning." }
];

export default function Page() {
  return (
    <main className="iboren-page-dark min-h-screen">
      <section className="py-24">
        <div className="luxe-container">
          <Link href="/" className="iboren-gold-accent mb-10 inline-flex text-sm font-bold">← Tillbaka</Link>
          <p className="iboren-gold-accent text-[11px] font-bold uppercase tracking-[.38em]">Guide</p>
          <h1 className="display mt-4 text-6xl font-bold leading-[.88] text-porcelain md:text-8xl">Städguide</h1>
          <p className="iboren-text-muted-dark mt-7 max-w-2xl text-lg leading-8">Praktiska guider om städning, pris, RUT-avdrag och bokning.</p>
          <div className="mt-12 grid gap-5 md:grid-cols-3">
            {posts.map((post) => <Link key={post.href} href={post.href} className="iboren-card-glass iboren-card-glass-hover rounded-[2rem] p-6"><h2 className="iboren-gold-accent display text-3xl font-bold">{post.title}</h2><p className="iboren-text-muted-dark mt-3 leading-7">{post.text}</p><span className="iboren-gold-accent mt-6 inline-flex font-bold">Läs mer →</span></Link>)}
          </div>
        </div>
      </section>
    </main>
  );
}
