import type { Metadata } from "next";
import LocalServicePage from "../LocalServicePage";

const faq = [
  { q: "Vad kostar fönsterputs i Södertälje?", a: "Priset beror på antal fönster, storlek, åtkomst, våningsplan och skick. Iborens prisberäknare ger en första indikation." },
  { q: "Gäller RUT för fönsterputs?", a: "Ja, fönsterputs för privatpersoner kan normalt omfattas av RUT på arbetskostnaden om Skatteverkets villkor uppfylls." },
  { q: "Kan fönsterputs kombineras med hemstädning?", a: "Ja, du kan ange fönsterputs som tillval eller välja fönsterputs som egen tjänst i förfrågan." },
  { q: "Behöver jag vara hemma?", a: "Det beror på uppdragets upplägg, åtkomst och nyckelhantering. Iboren bekräftar praktiska detaljer innan uppdraget utförs." }
];

export const metadata: Metadata = {
  title: "Fönsterputs Södertälje | Pris med RUT | Iboren",
  description: "Boka fönsterputs i Södertälje. Få prisindikation, RUT-information och enkel bokningsförfrågan online hos Iboren.",
  keywords: ["fönsterputs Södertälje", "putsa fönster Södertälje", "fönsterputs pris Södertälje", "RUT fönsterputs"],
  alternates: { canonical: "https://iboren.se/fonsterputs-sodertalje" }
};

export default function Page() {
  return <LocalServicePage city="Södertälje" service="Fönsterputs" slug="fonsterputs-sodertalje" eyebrow="Fönsterputs Södertälje" title="Fönsterputs i Södertälje" description="Fönsterputs i Södertälje med prisindikation, RUT-avdrag och enkel bokningsförfrågan online." intro="Boka fönsterputs i Södertälje med tydligt underlag. Ange bostadens storlek, område, önskat datum och eventuella tillval så återkommer Iboren med bekräftelse." priceText="Fönsterputs påverkas av antal fönster, åtkomst, våningsplan, skick och om tjänsten kombineras med annan städning." rutText="För privatpersoner kan fönsterputs normalt omfattas av RUT på arbetskostnaden om villkoren är uppfyllda." bullets={["För lägenhet, villa och radhus", "RUT för privatpersoner", "Kan bokas separat eller som tillval", "Tydligt underlag innan bekräftelse"]} included={["Fönsterputs enligt överenskommen omfattning", "Bedömning utifrån åtkomst, fönstertyp och skick", "Möjlighet att kombinera med hemstädning eller flyttstädning", "Slutpris och praktiska detaljer bekräftas innan uppdraget utförs"]} faq={faq} />;
}
