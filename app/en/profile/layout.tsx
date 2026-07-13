import type { Metadata } from "next";
import type { ReactNode } from "react";

export const metadata: Metadata = {
  title: "Your profile | Iboren",
  robots: { index: false, follow: false, nocache: true },
};

export default function EnglishProfileLayout({ children }: { children: ReactNode }) {
  return children;
}
