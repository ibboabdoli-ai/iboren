import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Privacy Policy – Iboren",
  description: "Privacy och GDPR-information för Iboren."
};

const sections = [
  {
    title: "1. Vem ansvarar för personuppgifterna?",
    body: "Iboren ansvarar för behandlingen av personuppgifter som lämnas via webbplatsen, bokningsformulär, konto/profil och e-postkontakt. Kontakt: hej@iboren.se."
  },
  {
    title: "2. Vilka uppgifter samlas in?",
    body: "När du skickar en bokningsförfrågan kan vi behandla namn, e-postadress, telefonnummer, adress, område, önskad tjänst, bostads-/lokalstorlek, antal rum, antal badrum, våning, hiss, parkering, husdjur, extra tjänster, önskat datum, tidsfönster och övriga meddelanden du själv skriver."
  },
  {
    title: "3. Konto och inloggning",
    body: "Om du loggar in via Google, Microsoft eller LinkedIn behandlas grundläggande kontouppgifter som e-postadress, namn och eventuell profilbild. Inloggningen används för att koppla bokningar till rätt kundprofil och minska felaktiga bokningar."
  },
  {
    title: "4. Platsdelning",
    body: "Platsdelning är frivillig. Om du väljer att dela din position används den endast för att försöka fylla i adress/område i bokningsformuläret. Du kan alltid skriva adressen manuellt."
  },
  {
    title: "5. Varför behandlas uppgifterna?",
    body: "Uppgifterna används för att ta emot, administrera och följa upp bokningsförfrågningar, skicka bekräftelsemejl, kontakta dig om uppdraget, visa dina bokningar i din profil och ge admin möjlighet att hantera status och anteckningar."
  },
  {
    title: "6. E-post och leverantörer",
    body: "Iboren använder externa tekniska leverantörer för webbhosting, databas, autentisering och e-postutskick. Exempel på kategorier är hostingplattform, databas/auth-tjänst och e-postleverantör. Dessa används för att webbplatsen, inloggning och bokningsmejl ska fungera."
  },
  {
    title: "7. Lagringstid",
    body: "Bokningsuppgifter sparas så länge de behövs för att hantera bokningen, kundkontakt, uppföljning, administration och eventuell dokumentation. Om du vill få dina uppgifter raderade kan du kontakta oss. Vissa uppgifter kan behöva sparas längre om det krävs för bokföring, säkerhet eller rättsliga krav."
  },
  {
    title: "8. Dina rättigheter",
    body: "Du kan begära information om vilka personuppgifter som behandlas, begära rättelse av felaktiga uppgifter, begära radering när det är möjligt, invända mot viss behandling och begära begränsning av behandling. Kontakta hej@iboren.se för sådana ärenden."
  },
  {
    title: "9. Säkerhet",
    body: "Vi arbetar med åtkomstkontroll, inloggning, serverbaserad behörighetskontroll och begränsad adminåtkomst för att skydda bokningsdata. Endast behöriga användare ska kunna se och hantera relevanta uppgifter."
  },
  {
    title: "10. Ändringar",
    body: "Den här policyn kan uppdateras när webbplatsen, tjänsterna eller leverantörerna ändras. Den senaste versionen publiceras på denna sida."
  }
];

export default function PrivacyPage() {
  return (
    <main className="min-h-screen bg-cream py-16 text-ink">
      <article className="luxe-container max-w-4xl rounded-[2rem] bg-porcelain p-7 shadow-lg md:p-10">
        <Link href="/" className="text-sm font-semibold text-burgundy">← Tillbaka till startsidan</Link>
        <p className="eyebrow mt-10">Iboren · Privacy</p>
        <h1 className="display mt-4 text-5xl font-bold leading-[0.9] text-burgundy md:text-7xl">Privacy Policy</h1>
        <p className="mt-5 text-sm font-semibold text-ink/50">Senast uppdaterad: 19 maj 2026</p>
        <div className="mt-8 rounded-2xl border border-burgundy/10 bg-cream p-5 text-sm leading-7 text-ink/65">
          Denna sida beskriver hur Iboren behandlar personuppgifter i samband med webbplatsen, konto, bokningsförfrågningar och e-postkommunikation.
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
            <p className="mt-2">För frågor om integritet, rättelse eller radering, kontakta: <a href="mailto:hej@iboren.se" className="font-semibold text-burgundy">hej@iboren.se</a>.</p>
          </section>
        </div>
      </article>
    </main>
  );
}
