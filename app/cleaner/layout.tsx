import type { Metadata } from "next";
import type { ReactNode } from "react";

const title = "Iboren Cleaner";
const description = "Hantera jobb, tillgänglighet och tidrapportering i Iboren.";

export const metadata: Metadata = {
  title,
  description,
  applicationName: "Iboren Cleaner",
  manifest: "/api/pwa-manifest?start=/cleaner",
  alternates: { canonical: "https://iboren.se/cleaner" },
  appleWebApp: {
    capable: true,
    title: "Iboren Cleaner",
    statusBarStyle: "black-translucent"
  }
};

export default function CleanerLayout({ children }: { children: ReactNode }) {
  return children;
}
