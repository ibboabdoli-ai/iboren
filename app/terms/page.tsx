import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Villkor – Iboren",
  description: "Villkor för användning av Iborens webbplats och bokningsförfrågningar."
};

const sections = [
  {
    title: "1. Om tjänsten",
    body: "Iboren har offentlig kontaktort i Södertälje, Sweden och erbjuder en digital bokningsyta för att skapa och skicka bokningsförfrågningar för städtjänster. Webbplatsen hjälper kunden att lämna tydliga uppgifter om tjänst, plats, storlek, datum och praktiska detaljer."
  },
  {
    title: "2. Bokningsförfrågan och bekräftelse",
    body: "En inskickad förfrågan är inte automatiskt en bekräftad bokning. Bokningen blir bekräftad först när Iboren eller behörig representant uttryckligen bekräftar tid, omfattning och villkor."
  },
  {
    title: "3. Kundens ansvar",
    body: "Kunden ansvarar för att uppgifterna i bokningsformuläret är korrekta, inklusive adress, kontaktuppgifter, storlek, antal rum, önskat datum, tillträde, parkering, hiss och särskilda önskemål. Felaktiga eller ofullständiga uppgifter kan påverka pris, tid eller möjlighet att utföra uppdraget."
  },
  {
    title: "4. Pris och omfattning",
    body: "Prisuppgifter på webbplatsen är indikativa om inget annat anges. Slutligt pris, omfattning, eventuellt RUT-avdrag och praktiska villkor ska bekräftas innan uppdrag utförs. Extra tjänster kan påverka pris och tidsåtgång."
  },
  {
    title: "5. Avbokning och ändringar",
    body: "Kunden kan begära avbokning eller ändring. En bokning som är markerad som avbokad hanteras inte vidare om inget annat överenskommits. För bekräftade uppdrag kan särskilda villkor för sen avbokning, ombokning eller utebliven tillgång till lokalen tillkomma."
  },
  {
    title: "6. Kommunikation",
    body: "Iboren kan skicka e-post om mottagen bokningsförfrågan, bekräftelse, statusändringar, avbokning och uppföljning. Kunden ansvarar för att e-postadress och telefonnummer är korrekta."
  },
  {
    title: "7. Konto och åtkomst",
    body: "För att skapa och följa bokningar kan inloggning krävas. Kunden ansvarar för att använda sitt eget konto och inte lämna felaktiga kontaktuppgifter. Adminsidor är endast för behöriga användare."
  },
  {
    title: "8. Webbplatsens tillgänglighet",
    body: "Iboren strävar efter att webbplatsen ska vara tillgänglig och fungera korrekt, men kan inte garantera att tjänsten alltid är fri från avbrott, tekniska fel eller tillfälliga begränsningar."
  },
  {
    title: "9. Begränsning",
    body: "Information på webbplatsen kan ändras. Iboren ansvarar inte för indirekta förluster som uppstår på grund av felaktigt ifyllda uppgifter, tekniska avbrott eller missförstånd innan en bokning är bekräftad."
  },
  {
    title: "10. Ändringar av villkoren",
    body: "Dessa villkor kan uppdateras när tjänsten, betalningsflöden, företagsuppgifter eller arbetsprocesser ändras. Den senaste versionen publiceras på denna sida."
  }
];

export default function TermsPage() {
  return (
    <main className="min-h-screen bg-cream py-16 text-ink">
      <article className="luxe-container max-w-4xl rounded-[2rem] bg-porcelain p-7 shadow-lg md:p-10">
        <Link href="/" className="text-sm font-semibold text-burgundy">← Tillbaka till startsidan</Link>
        <p className="eyebrow mt-10">Iboren · Juridiskt</p>
        <h1 className="display mt-4 text-5xl font-bold leading-[0.9] text-burgundy md:text-7xl">Villkor</h1>
        <p className="mt-5 text-sm font-semibold text-ink/50">Senast uppdaterad: 13 juli 2026</p>
        <div className="mt-8 rounded-2xl border border-burgundy/10 bg-cream p-5 text-sm leading-7 text-ink/65">
          Dessa villkor gäller användning av Iborens webbplats och digitala bokningsflöde.
        </div>
        <div className="mt-8 space-y-7 text-base leading-8 text-ink/70">
          {sections.map((section) => (
            <section key={section.title}>
              <h2 className="display text-2xl font-bold text-burgundy">{section.title}</h2>
              <p className="mt-2">{section.body}</p>
            </section>
          ))}
          <section className="rounded-2xl border border-burgundy/10 bg-cream p-5">
            <h2 className="display text-2xl font-bold text-burgundy">Kontakt</h2>
            <p className="mt-2">För frågor om villkoren, kontakta: <a href="mailto:hej@iboren.se" className="font-semibold text-burgundy">hej@iboren.se</a>.</p>
          </section>
        </div>
      </article>
    </main>
  );
}
