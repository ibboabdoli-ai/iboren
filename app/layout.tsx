import type { Metadata, Viewport } from "next";
import StructuredData from "./StructuredData";
import "./globals.css";

const title = "Iboren – Städning i Södertälje och Stockholm";
const description = "Boka hemstädning, flyttstädning, kontorsstädning och fönsterputs med Iboren. Enkel bokning, tydliga priser och snabb återkoppling i Södertälje och Stockholm.";

export const metadata: Metadata = {
  metadataBase: new URL("https://iboren.se"),
  title,
  description,
  applicationName: "Iboren",
  keywords: ["Iboren", "städning Södertälje", "hemstädning Södertälje", "flyttstädning Södertälje", "städning Stockholm", "kontorsstädning Stockholm", "fönsterputs", "städbokning"],
  openGraph: {
    title,
    description,
    url: "https://iboren.se",
    siteName: "Iboren",
    locale: "sv_SE",
    type: "website",
    images: [{ url: "/og.svg", width: 1200, height: 630, alt: "Iboren" }]
  },
  twitter: {
    card: "summary_large_image",
    title,
    description,
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
  themeColor: "#0B0E0C"
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
