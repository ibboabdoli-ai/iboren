import type { Metadata } from "next";
import EnglishHomeTranslator from "../EnglishHomeTranslator";
import HomePage from "../page";

export const metadata: Metadata = {
  title: "Iboren – Cleaning request in Södertälje and Stockholm",
  description: "Send a cleaning request for home cleaning, move-out cleaning, office cleaning and window cleaning in Södertälje and Stockholm with Iboren.",
  alternates: { canonical: "https://iboren.se/en", languages: { sv: "https://iboren.se/", en: "https://iboren.se/en" } }
};

export default function EnglishPage() {
  return (
    <>
      <EnglishHomeTranslator />
      <HomePage />
    </>
  );
}
