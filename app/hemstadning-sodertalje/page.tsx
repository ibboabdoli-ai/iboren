import type { Metadata } from "next";
import LocalServicePage from "../LocalServicePage";

const faq = [
  { q: "Vad kostar hemstädning i Södertälje?", a: "Priset beror på bostadens storlek, antal badrum, frekvens och eventuella tillval. Använd Iborens prisberäknare för en uppskattning före och efter RUT." },
  { q: "Gäller RUT för hemstädning?", a: "Ja, hemstädning för privatpersoner kan normalt omfattas av RUT om Skatteverkets villkor uppfylls. RUT gäller arbetskostnaden, inte material eller resekostnader." },
  { q: "Kan jag boka återkommande hemstädning?", a: "Ja, du kan skicka förfrågan för engångsstädning, varje vecka, varannan vecka eller varje månad." },
  { q: "Är bokningen bindande direkt?", a: "Nej. Iboren återkommer och bekräftar tid, omfattning och pris innan uppdraget blir bindande." }
];

export const metadata: Metadata = {
  title: "Hemstädning Södertälje | Pris med RUT | Iboren",
  description: "Boka hemstädning i Södertälje med tydlig prisindikation, RUT-avdrag och enkel bokningsförfrågan online hos Iboren.",
  keywords: ["hemstädning Södertälje", "städhjälp Södertälje", "städfirma Södertälje", "RUT hemstädning Södertälje"],
  alternates: { canonical: "https://iboren.se/hemstadning-sodertalje" }
};

export default function Page() {
  return <LocalServicePage city="Södertälje" service="Hemstädning" slug="hemstadning-sodertalje" eyebrow="Hemstädning Södertälje" title="Hemstädning i Södertälje" description="Hemstädning i Södertälje med prisindikation, RUT-avdrag och enkel bokningsförfrågan online." intro="Få hjälp med hemstädning i Södertälje. Iboren samlar adress, yta, rum, badrum, datum och önskemål så att du får ett tydligt underlag innan pris och tid bekräftas." priceText="Pris beräknas utifrån yta, badrum, frekvens och tillval. På sidan Priser kan kunden se uppskattat pris före och efter RUT." rutText="RUT visas för privatpersoner och gäller normalt arbetskostnaden om Skatteverkets villkor uppfylls." bullets={["För privatpersoner i Södertälje", "Engång eller återkommande städning", "Pris före och efter RUT", "Bokning med tydlig sammanfattning"]} included={["Dammsugning och avtorkning av vardagsytor enligt överenskommelse", "Kök och badrum utifrån vald omfattning", "Möjlighet att välja till exempel ugn, kyl/frys, balkong och fönsterputs", "Tydligt underlag innan tid och pris bekräftas"]} faq={faq} />;
}
