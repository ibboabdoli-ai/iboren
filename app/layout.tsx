import type { Metadata, Viewport } from "next";
import StructuredData from "./StructuredData";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL("https://iboren.se"),
  title: "Iboren – Städning i Södertälje & Stockholm",
  description: "Boka hemstädning, flyttstädning, kontorsstädning och fönsterputs i Södertälje och Stockholm. Iboren hjälper dig skapa en tydlig bokningsförfrågan steg för steg.",
  applicationName: "Iboren",
  keywords: ["Iboren", "städning Södertälje", "hemstädning Södertälje", "flyttstädning Södertälje", "städning Stockholm", "kontorsstädning Stockholm", "fönsterputs", "städbokning"],
  openGraph: {
    title: "Iboren – Städning i Södertälje & Stockholm",
    description: "Skapa en tydlig bokningsförfrågan för hemstädning, flyttstädning, kontorsstädning och fönsterputs.",
    url: "https://iboren.se",
    siteName: "Iboren",
    locale: "sv_SE",
    type: "website",
    images: [{ url: "/og.svg", width: 1200, height: 630, alt: "Iboren" }]
  },
  twitter: {
    card: "summary_large_image",
    title: "Iboren – Städning i Södertälje & Stockholm",
    description: "Boka städning smartare med Iboren.",
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
      <body>
        <StructuredData />
        {children}
      </body>
    </html>
  );
}
