import type { Metadata } from "next";
import ServicePage from "../ServicePage";

export const metadata: Metadata = {
  title: "Flyttstädning | Iboren",
  description: "Städning i samband med flytt i Södertälje och Stockholm.",
  alternates: { canonical: "https://iboren.se/tjanster/flyttstadning" }
};

export default function Page() {
  return <ServicePage service={{ title: "Flyttstädning", intro: "Städning i samband med flytt i Södertälje och Stockholm.", priceText: "Priset beror på yta, antal rum och eventuella tillval.", included: ["Tydlig förfrågan", "Yta och datum", "Tillval vid behov", "Pris innan start"], faq: [{ question: "Hur får jag pris?", answer: "Använd prisberäknaren eller skicka en bokningsförfrågan." }] }} />;
}
