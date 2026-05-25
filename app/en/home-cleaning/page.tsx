import type { Metadata } from "next";
import { EnglishServicePage } from "../EnglishServicePage";

export const metadata: Metadata = {
  title: "Home cleaning in Södertälje and Stockholm – Iboren",
  description: "Send a clear request for home cleaning in Södertälje and Stockholm. Iboren collects address, size, rooms, date and special requests.",
  alternates: { canonical: "https://iboren.se/en/home-cleaning", languages: { sv: "https://iboren.se/hemstadning", en: "https://iboren.se/en/home-cleaning" } }
};

export default function EnglishHomeCleaningPage() {
  return <EnglishServicePage service="home" />;
}
