import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Privacy Policy",
  description: "Privacy och GDPR-information för Iboren."
};

export default function PrivacyPage() {
  return (
    <main className="min-h-screen bg-cream py-16 text-ink">
      <article className="luxe-container max-w-3xl rounded-[2rem] bg-porcelain p-7 shadow-lg md:p-10">
        <Link href="/" className="text-sm font-semibold text-burgundy">← Tillbaka till startsidan</Link>
        <p className="eyebrow mt-10">Iboren · Privacy</p>
        <h1 className="display mt-4 text-5xl font-bold leading-[0.9] text-burgundy md:text-7xl">Privacy Policy</h1>
        <div className="mt-8 space-y-6 text-base leading-8 text-ink/70">
          <p>Iboren samlar endast in de uppgifter som behövs för att hantera en bokningsförfrågan: namn, kontaktuppgifter, område, tjänst, storlek, önskat datum och eventuella anteckningar.</p>
          <p>Platsdelning är frivillig. Om användaren väljer att dela plats används positionen bara för att underlätta bokningsunderlaget. Exakt adress kan alltid skrivas manuellt.</p>
          <p>Uppgifter ska inte säljas eller delas med obehöriga parter. Vid framtida användning av leverantörer, e-posttjänster eller analysverktyg ska detta dokument uppdateras.</p>
          <p>För frågor eller begäran om radering, kontakta: <a href="mailto:hej@iboren.se" className="font-semibold text-burgundy">hej@iboren.se</a>.</p>
        </div>
      </article>
    </main>
  );
}
