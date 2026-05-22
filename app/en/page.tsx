import type { Metadata } from "next";
import EnglishBookingPage from "../EnglishBookingPage";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export const metadata: Metadata = {
  title: "Iboren – Cleaning request in Södertälje and Stockholm",
  description: "Send a cleaning request for home cleaning, move-out cleaning, office cleaning and window cleaning in Södertälje and Stockholm with Iboren.",
  alternates: { canonical: "https://iboren.se/en", languages: { sv: "https://iboren.se/", en: "https://iboren.se/en" } }
};

export default function EnglishPage() {
  return <EnglishBookingPage />;
}
