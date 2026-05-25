import type { Metadata } from "next";
import type { ReactNode } from "react";

const title = "Iboren Admin";
const description = "Administrera bokningar, kunder och arbetsflöden i Iboren.";

export const metadata: Metadata = {
  title,
  description,
  applicationName: "Iboren Admin",
  manifest: "/api/pwa-manifest?start=/admin",
  alternates: { canonical: "https://iboren.se/admin" },
  openGraph: {
    title,
    description,
    url: "https://iboren.se/admin",
    siteName: "Iboren",
    locale: "sv_SE",
    type: "website"
  },
  appleWebApp: {
    capable: true,
    title: "Iboren Admin",
    statusBarStyle: "black-translucent"
  }
};

export default function AdminLayout({ children }: { children: ReactNode }) {
  return <>{children}</>;
}
