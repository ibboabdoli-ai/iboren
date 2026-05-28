import type { Metadata } from "next";
import { EnglishServicePage } from "../EnglishServicePage";

export const metadata: Metadata = {
  title: "Window cleaning in Södertälje and Stockholm – Iboren",
  description: "Send a clear request for window cleaning in Södertälje and Stockholm. Iboren collects property details, access notes and preferred date.",
  alternates: { canonical: "https://iboren.se/en/window-cleaning", languages: { sv: "https://iboren.se/tjanster/fonsterputs", en: "https://iboren.se/en/window-cleaning" } }
};

export default function EnglishWindowCleaningPage() {
  return <EnglishServicePage service="windows" />;
}
