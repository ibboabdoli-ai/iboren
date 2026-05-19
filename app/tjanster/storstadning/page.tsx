import type { Metadata } from "next";
import ServicePage from "../ServicePage";

export const metadata: Metadata = {
  title: "Storstädning | Iboren",
  description: "Storstädning i Södertälje och Stockholm för hem som behöver en mer omfattande städning.",
  alternates: { canonical: "https://iboren.se/tjanster/storstadning" }
};

export default function Page() {
  return <ServicePage service={{ title: "Storstädning", intro: "Storstädning passar när hemmet behöver en mer omfattande genomgång än vanlig hemstädning.", priceText: "Priset beror på yta, skick, antal rum och vilka moment som ska ingå.", included: ["Grundlig genomgång", "Kök och badrum", "Extra detaljer", "Pris innan start"], faq: [{ question: "När passar storstädning?", answer: "När hemmet behöver mer än vanlig löpande städning." }] }} />;
}
