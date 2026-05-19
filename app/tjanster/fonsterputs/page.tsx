import type { Metadata } from "next";
import ServicePage from "../ServicePage";

export const metadata: Metadata = {
  title: "Fönsterputs | Iboren",
  description: "Fönsterputs i Södertälje och Stockholm.",
  alternates: { canonical: "https://iboren.se/tjanster/fonsterputs" }
};

export default function Page() {
  return <ServicePage service={{ title: "Fönsterputs", intro: "Fönsterputs i Södertälje och Stockholm som egen tjänst eller som tillval.", priceText: "Priset beror på omfattning, antal fönster och tillgänglighet.", included: ["Tydlig förfrågan", "Antal fönster", "Datum och område", "Pris innan start"], faq: [{ question: "Kan jag boka fönsterputs separat?", answer: "Ja, fönsterputs kan bokas som egen tjänst eller som tillval." }] }} />;
}
