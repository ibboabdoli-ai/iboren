import type { Metadata } from "next";
import { EnglishServicePage } from "../EnglishServicePage";

export const metadata: Metadata = {
  title: "Office cleaning in Södertälje and Stockholm – Iboren",
  description: "Send a clear request for office cleaning in Södertälje and Stockholm. Iboren collects location, area, frequency, preferred time and notes for a business quote.",
  alternates: { canonical: "https://iboren.se/en/office-cleaning", languages: { sv: "https://iboren.se/kontorsstadning", en: "https://iboren.se/en/office-cleaning" } }
};

export default function EnglishOfficeCleaningPage() {
  return <EnglishServicePage service="office" />;
}
