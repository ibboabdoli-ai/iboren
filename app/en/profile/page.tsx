import type { Metadata } from "next";
import ProfileEnglishCopyFix from "../../ProfileEnglishCopyFix";
import ProfilePage from "../../profile/page";

export const metadata: Metadata = {
  title: "My profile | Iboren",
  description: "View your Iboren profile and booking requests.",
  alternates: { canonical: "https://iboren.se/en/profile", languages: { sv: "https://iboren.se/profile", en: "https://iboren.se/en/profile" } }
};

export default function EnglishProfilePage() {
  return (
    <>
      <ProfileEnglishCopyFix />
      <ProfilePage />
    </>
  );
}
