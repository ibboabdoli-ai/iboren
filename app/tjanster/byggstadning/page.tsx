import type { Metadata } from "next";
import ServicePage from "../ServicePage";

export const metadata: Metadata = {
  title: "Byggstädning | Iboren",
  description: "Byggstädning i Södertälje och Stockholm efter renovering eller projekt.",
  alternates: { canonical: "https://iboren.se/tjanster/byggstadning", languages: { sv: "https://iboren.se/tjanster/byggstadning", en: "https://iboren.se/en/construction-cleaning" } }
};

export default function Page() {
  return <ServicePage service={{ title: "Byggstädning", intro: "Byggstädning passar efter renovering, projekt eller arbete där ytor behöver göras redo igen.", priceText: "Priset beror på yta, skick och omfattning.", included: ["Ytor efter projekt", "Grovare rengöring", "Tydlig offert", "Planering innan start"], faq: [{ question: "När passar byggstädning?", answer: "Efter renovering, mindre projekt eller när lokaler behöver återställas." }] }} />;
}
