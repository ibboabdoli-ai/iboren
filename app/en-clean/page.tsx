import type { Metadata } from "next";
import EnglishBookingPage from "../EnglishBookingPage";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export const metadata: Metadata = {
  title: "Iboren – English booking request",
  description: "Clean English booking request page for Iboren."
};

export default function EnglishCleanPage() {
  return <EnglishBookingPage />;
}
