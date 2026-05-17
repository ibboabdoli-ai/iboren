import type { Metadata, Viewport } from "next";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL("https://iboren.se"),
  title: "Iboren – Smart städbokning med AI i Sverige",
  description: "Boka hemstädning, flyttstädning och kontorsstädning med Iboren. CleanAI hjälper dig skapa en tydlig bokningsförfrågan steg för steg.",
  applicationName: "Iboren",
  keywords: ["Iboren", "städbokning", "hemstädning", "flyttstädning", "kontorsstädning", "CleanAI"],
  openGraph: {
    title: "Iboren – Smart städbokning med AI",
    description: "En lyxig, enkel och AI-assisterad bokningsupplevelse för städtjänster i Sverige.",
    url: "https://iboren.se",
    siteName: "Iboren",
    locale: "sv_SE",
    type: "website",
    images: [{ url: "/og.svg", width: 1200, height: 630, alt: "Iboren" }]
  },
  twitter: {
    card: "summary_large_image",
    title: "Iboren – Smart städbokning med AI",
    description: "Boka städning smartare med CleanAI by Iboren.",
    images: ["/og.svg"]
  },
  alternates: { canonical: "https://iboren.se" },
  manifest: "/manifest.webmanifest",
  icons: { icon: "/favicon.svg", apple: "/favicon.svg" }
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  themeColor: "#F5F0E8"
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="sv">
      <body>{children}</body>
    </html>
  );
}
