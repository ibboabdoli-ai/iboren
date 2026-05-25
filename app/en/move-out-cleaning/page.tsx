import type { Metadata } from "next";
import { EnglishServicePage } from "../EnglishServicePage";

export const metadata: Metadata = {
  title: "Move-out cleaning in Södertälje and Stockholm – Iboren",
  description: "Send a structured request for move-out cleaning in Södertälje and Stockholm. Iboren collects size, address, date and special requirements.",
  alternates: { canonical: "https://iboren.se/en/move-out-cleaning", languages: { sv: "https://iboren.se/flyttstadning", en: "https://iboren.se/en/move-out-cleaning" } }
};

export default function EnglishMoveOutCleaningPage() {
  return <EnglishServicePage service="move" />;
}
