import type { Metadata } from "next";
import LocalServicePage from "../LocalServicePage";

const faq = [
  { q: "Vad kostar kontorsstädning i Södertälje?", a: "Kontorsstädning offereras normalt utifrån lokalens storlek, frekvens, typ av ytor och önskade tider. Prisindikationen visas som företagspris, ofta per månad." },
  { q: "Gäller RUT för kontorsstädning?", a: "Nej, kontorsstädning för företag omfattas normalt inte av RUT. Priset visas som företagspris/offert." },
  { q: "Kan vi boka återkommande kontorsstädning?", a: "Ja, ange lokalens storlek, önskad frekvens, område och kontaktuppgifter så återkommer Iboren." },
  { q: "Kan städningen ske utanför kontorstid?", a: "Det kan ofta diskuteras beroende på lokal, nyckelhantering och schema. Ange önskat tidsfönster i förfrågan." }
];

export const metadata: Metadata = {
  title: "Kontorsstädning Södertälje | Företagsstädning | Iboren",
  description: "Skicka förfrågan för kontorsstädning i Södertälje. Tydligt underlag för företagsstädning, återkommande service och offert.",
  keywords: ["kontorsstädning Södertälje", "företagsstädning Södertälje", "städfirma företag Södertälje", "kontorsstäd Södertälje"],
  alternates: { canonical: "https://iboren.se/kontorsstadning-sodertalje" }
};

export default function Page() {
  return <LocalServicePage city="Södertälje" service="Kontorsstädning" slug="kontorsstadning-sodertalje" eyebrow="Kontorsstädning Södertälje" title="Kontorsstädning i Södertälje" description="Kontorsstädning i Södertälje med tydlig förfrågan, företagspris och återkommande service." intro="Behöver företaget kontorsstädning i Södertälje? Iboren samlar lokalens storlek, frekvens, område, önskat tidsfönster och kontaktuppgifter för en tydlig offertförfrågan." priceText="Kontorsstädning visas som företagspris/offert och påverkas av kvm, frekvens, lokaltyp och önskade tider." rutText="RUT gäller inte för kontorsstädning åt företag. Priset hanteras som företagspris eller offert." bullets={["För kontor och företagslokaler", "Återkommande service", "Företagspris/offert", "Tydlig förfrågan online"]} included={["Kontorsytor, entré, mötesrum och gemensamma ytor enligt överenskommelse", "Frekvens och tidsfönster anpassas efter verksamhetens behov", "Företagspris utan RUT", "Offert bekräftas innan uppdraget startar"]} faq={faq} />;
}
