import type { Metadata } from "next";
import LocalServicePage from "../LocalServicePage";

const faq = [
  { q: "Vad kostar hemstädning i Stockholm?", a: "Priset beror på bostadens storlek, antal badrum, frekvens, adress och tillval. Iborens prisberäknare ger en uppskattning före och efter RUT." },
  { q: "Gäller RUT för hemstädning i Stockholm?", a: "Ja, hemstädning för privatpersoner kan normalt omfattas av RUT om Skatteverkets villkor uppfylls. RUT gäller arbetskostnaden." },
  { q: "Kan jag boka återkommande hemstädning i Stockholm?", a: "Ja, du kan skicka förfrågan för engångsstädning, varje vecka, varannan vecka eller varje månad." },
  { q: "Är bokningen bindande direkt?", a: "Nej. Iboren återkommer och bekräftar tid, omfattning och pris innan uppdraget blir bindande." }
];

export const metadata: Metadata = {
  title: "Hemstädning Stockholm | Pris med RUT | Iboren",
  description: "Boka hemstädning i Stockholm med tydlig prisindikation, RUT-avdrag och enkel bokningsförfrågan online hos Iboren.",
  keywords: ["hemstädning Stockholm", "städhjälp Stockholm", "städfirma Stockholm", "RUT hemstädning Stockholm"],
  alternates: { canonical: "https://iboren.se/hemstadning-stockholm" }
};

export default function Page() {
  return <LocalServicePage city="Stockholm" service="Hemstädning" slug="hemstadning-stockholm" eyebrow="Hemstädning Stockholm" title="Hemstädning i Stockholm" description="Hemstädning i Stockholm med prisindikation, RUT-avdrag och enkel bokningsförfrågan online." intro="Få hjälp med hemstädning i Stockholm. Iboren samlar adress, yta, rum, badrum, datum och önskemål så att du får ett tydligt underlag innan pris och tid bekräftas." priceText="Pris beräknas utifrån yta, badrum, frekvens och tillval. På sidan Priser kan kunden se uppskattat pris före och efter RUT." rutText="RUT visas för privatpersoner och gäller normalt arbetskostnaden om Skatteverkets villkor uppfylls." bullets={["För privatpersoner i Stockholm", "Engång eller återkommande städning", "Pris före och efter RUT", "Bokning med tydlig sammanfattning"]} included={["Dammsugning och avtorkning av vardagsytor enligt överenskommelse", "Kök och badrum utifrån vald omfattning", "Möjlighet att välja till exempel ugn, kyl/frys, balkong och fönsterputs", "Tydligt underlag innan tid och pris bekräftas"]} faq={faq} />;
}
