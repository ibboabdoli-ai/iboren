import type { Metadata } from "next";
import LocalServicePage from "../LocalServicePage";

const faq = [
  { q: "Vad kostar flyttstädning i Södertälje?", a: "Flyttstädning beräknas främst på bostadens storlek, skick, antal badrum, fönster, balkong och tillval. Iborens kalkylator ger en prisindikation." },
  { q: "Gäller RUT för flyttstädning?", a: "Ja, flyttstädning för privatpersoner kan normalt omfattas av RUT om Skatteverkets villkor uppfylls." },
  { q: "Behöver jag ange adress och storlek?", a: "Ja, adress, yta, antal rum och badrum behövs för att ge rätt underlag och rimlig prisindikation." },
  { q: "Får jag ett fast pris direkt?", a: "Priset i kalkylatorn är en uppskattning. Slutpris bekräftas innan uppdraget utförs." }
];

export const metadata: Metadata = {
  title: "Flyttstädning Södertälje | Pris med RUT | Iboren",
  description: "Skicka förfrågan för flyttstädning i Södertälje. Få prisindikation efter kvm, RUT-information och enkel bokning online.",
  keywords: ["flyttstädning Södertälje", "flyttstäd Södertälje", "städfirma flyttstädning Södertälje", "RUT flyttstädning"],
  alternates: { canonical: "https://iboren.se/flyttstadning-sodertalje" }
};

export default function Page() {
  return <LocalServicePage city="Södertälje" service="Flyttstädning" slug="flyttstadning-sodertalje" eyebrow="Flyttstädning Södertälje" title="Flyttstädning i Södertälje" description="Flyttstädning i Södertälje med prisindikation per kvm, RUT-avdrag och tydlig bokningsförfrågan." intro="Planerar du flytt i Södertälje? Iboren hjälper dig skicka en tydlig förfrågan för flyttstädning med adress, yta, badrum, datum och eventuella tillval." priceText="Flyttstädning räknas med kvm-modell och påverkas av skick, fönster, våtrum, balkong och tillval." rutText="För privatpersoner kan flyttstädning normalt ha RUT på arbetskostnaden om villkoren är uppfyllda." bullets={["Prisindikation per kvm", "RUT för privatpersoner", "Tydlig checklista innan bekräftelse", "Passar flytt och överlämning"]} included={["Städning av bostad inför flytt enligt överenskommen omfattning", "Kök, badrum och ytor bedöms utifrån bostadens storlek och skick", "Tillval som fönster, balkong eller extra smutsigt kan påverka priset", "Slutpris och tid bekräftas innan uppdraget utförs"]} faq={faq} />;
}
