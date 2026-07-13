import type { Metadata } from "next";
import type { ReactNode } from "react";
import ProfileAvatarPolish from "./ProfileAvatarPolish";
import ProfileBookingNotesPolish from "./ProfileBookingNotesPolish";
import ProfileBookingReferencePolish from "./ProfileBookingReferencePolish";
import ProfileCancellationPolicy from "./ProfileCancellationPolicy";

const title = "Iboren Kund";
const description = "Se och hantera dina bokningar hos Iboren.";

export const metadata: Metadata = {
  title,
  description,
  applicationName: "Iboren Kund",
  manifest: "/api/pwa-manifest?start=/profile",
  alternates: { canonical: "https://iboren.se/profile" },
  robots: { index: false, follow: false, nocache: true }
};

export default function ProfileLayout({ children }: { children: ReactNode }) {
  return (
    <>
      <ProfileCancellationPolicy />
      <ProfileAvatarPolish />
      <ProfileBookingReferencePolish />
      <ProfileBookingNotesPolish />
      {children}
    </>
  );
}
