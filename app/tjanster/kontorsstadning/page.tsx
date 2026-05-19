import type { Metadata } from "next";
import ServicePage from "../ServicePage";

export const metadata: Metadata = {
  title: "Kontorsstädning | Iboren",
  description: "Kontorsstädning i Södertälje och Stockholm.",
  alternates: { canonical: "https://iboren.se/tjanster/kontorsstadning" }
};

export default function Page() {
  return <ServicePage service={{ title: "Kontorsstädning", intro: "Städning för kontor och lokaler i Södertälje och Stockholm.", priceText: "Priset beror på yta, frekvens och lokalens behov.", included: ["Tydlig förfrågan", "Frekvens och tider", "Kontaktperson", "Offert innan start"], faq: [{ question: "Hur får jag pris?", answer: "Använd prisberäknaren eller skicka en förfrågan." }] }} />;
}
