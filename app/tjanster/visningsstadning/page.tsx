import type { Metadata } from "next";
import ServicePage from "../ServicePage";

export const metadata: Metadata = {
  title: "Visningsstädning | Iboren",
  description: "Visningsstädning i Södertälje och Stockholm inför försäljning eller fotografering.",
  alternates: { canonical: "https://iboren.se/tjanster/visningsstadning", languages: { sv: "https://iboren.se/tjanster/visningsstadning", en: "https://iboren.se/en/viewing-cleaning" } }
};

export default function Page() {
  return <ServicePage service={{ title: "Visningsstädning", intro: "Visningsstädning passar inför visning, fotografering eller när bostaden ska ge ett extra bra första intryck.", priceText: "Priset beror på yta, skick och hur nära inpå visningen städningen ska utföras.", included: ["Extra noggranna synliga ytor", "Kök och badrum", "Detaljer inför visning", "Pris innan start"], faq: [{ question: "När ska jag boka?", answer: "Boka gärna i god tid innan fotografering eller visning." }] }} />;
}
