import type { Metadata } from "next";
import ServicePage from "../ServicePage";

export const metadata: Metadata = {
  title: "Hemstädning – Iboren Städning i Södertälje och Stockholm",
  description: "Hemstädning i Södertälje och Stockholm med tydlig prisbild, RUT-avdrag och enkel bokning online.",
  alternates: { canonical: "https://iboren.se/tjanster/hemstadning" }
};

export default function Page() {
  return (
    <ServicePage
      service={{
        title: "Hemstädning",
        intro: "Iboren hjälper dig med hemstädning i Södertälje och Stockholm. Passar både återkommande städning och enstaka städtillfällen när vardagen inte räcker till.",
        priceText: "Hemstädning beräknas normalt utifrån bostadens storlek, antal badrum, städfrekvens och eventuella tillval. Du kan beräkna ett uppskattat pris direkt med RUT-avdrag.",
        included: [
          "Dammsugning och rengöring av golvytor",
          "Rengöring av kök, badrum och vardagsytor enligt överenskommelse",
          "Avtorkning av fria ytor och allmän ordning",
          "Möjlighet till tillval som ugn, kyl, balkong och fönsterputs"
        ],
        faq: [
          { question: "Vad kostar hemstädning?", answer: "Priset beror på bostadens storlek, frekvens och tillval. Använd prisberäknaren för att få ett uppskattat pris direkt." },
          { question: "Kan jag boka återkommande hemstädning?", answer: "Ja, du kan välja engång, varje vecka, varannan vecka eller varje månad i bokningsflödet." },
          { question: "Gäller RUT-avdrag?", answer: "RUT-avdrag kan normalt användas för hemstädning om villkoren är uppfyllda." }
        ]
      }}
    />
  );
}
