import type { Metadata } from "next";
import type { ReactNode } from "react";
import ProfileAvatarPolish from "./ProfileAvatarPolish";
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
  appleWebApp: {
    capable: true,
    title: "Iboren Kund",
    statusBarStyle: "black-translucent"
  }
};

export default function ProfileLayout({ children }: { children: ReactNode }) {
  return (
    <>
      <ProfileCancellationPolicy />
      <ProfileAvatarPolish />
      <ProfileBookingReferencePolish />
      {children}
    </>
  );
}
