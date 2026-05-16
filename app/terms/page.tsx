import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Terms",
  description: "Villkor för användning av Iboren."
};

export default function TermsPage() {
  return (
    <main className="min-h-screen bg-cream py-16 text-ink">
      <article className="luxe-container max-w-3xl rounded-[2rem] bg-porcelain p-7 shadow-lg md:p-10">
        <Link href="/" className="text-sm font-semibold text-burgundy">← Tillbaka till startsidan</Link>
        <p className="eyebrow mt-10">Iboren · Terms</p>
        <h1 className="display mt-4 text-5xl font-bold leading-[0.9] text-burgundy md:text-7xl">Terms of Use</h1>
        <div className="mt-8 space-y-6 text-base leading-8 text-ink/70">
          <p>Iboren är en digital bokningsyta för att skapa och skicka bokningsförfrågningar för städtjänster. En inskickad förfrågan är inte automatiskt en bekräftad bokning.</p>
          <p>Pris, tid, omfattning, RUT-avdrag och praktiska villkor ska bekräftas innan ett uppdrag utförs.</p>
          <p>Informationen på sidan kan ändras. Om företagsuppgifter, leverantörsavtal eller betalningslösning läggs till ska villkoren uppdateras innan publik lansering.</p>
          <p>Kontakt: <a href="mailto:hej@iboren.se" className="font-semibold text-burgundy">hej@iboren.se</a>.</p>
        </div>
      </article>
    </main>
  );
}
