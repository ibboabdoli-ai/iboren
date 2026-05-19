import type { Metadata } from "next";
import LocalSeoPage from "../LocalSeoPage";

export const metadata: Metadata = {
  title: "Hemstädning Södertälje | Iboren",
  description: "Hemstädning i Södertälje med tydlig prisbild, RUT-avdrag och enkel bokningsförfrågan online.",
  alternates: { canonical: "https://iboren.se/hemstadning-sodertalje" }
};

export default function Page() {
  return <LocalSeoPage data={{ service: "Hemstädning", city: "Södertälje", intro: "Boka hemstädning i Södertälje med tydlig prisbild och enkel förfrågan online. Passar lägenhet, villa och radhus.", priceNote: "Priset påverkas av yta, antal badrum, frekvens och tillval. RUT-avdrag kan normalt användas för hemstädning.", benefits: ["RUT-avdrag", "Tydlig prisbild", "Enkel bokning"] }} />;
}
