import type { Metadata } from "next";
import BookingPage from "../booking/page";

export const metadata: Metadata = {
  title: "Boka städning | Iboren – Södertälje & Stockholm",
  description: "Logga in och skicka en bokningsförfrågan för hemstädning, flyttstädning, kontorsstädning eller fönsterputs i Södertälje och Stockholm.",
  alternates: { canonical: "https://iboren.se/boka" },
  openGraph: {
    title: "Boka städning | Iboren",
    description: "Skicka en bokningsförfrågan till Iboren och få bekräftelse på tid, omfattning och slutligt pris.",
    url: "https://iboren.se/boka",
    siteName: "Iboren",
    locale: "sv_SE",
    type: "website"
  }
};

export default function BokaPage() {
  return <BookingPage />;
}
