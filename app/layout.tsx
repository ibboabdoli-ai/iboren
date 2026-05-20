import type { Metadata, Viewport } from "next";
import StructuredData from "./StructuredData";
import "./globals.css";

const title = "Iboren – Städning i Södertälje och Stockholm";
const description = "Boka hemstädning, flyttstädning, kontorsstädning och fönsterputs med Iboren. Enkel bokning, tydliga priser och snabb återkoppling i Södertälje och Stockholm.";
const previewImage = "/opengraph-image";

export const metadata: Metadata = {
  metadataBase: new URL("https://iboren.se"),
  title,
  description,
  applicationName: "Iboren",
  keywords: ["Iboren", "städning Södertälje", "hemstädning Södertälje", "flyttstädning Södertälje", "städning Stockholm", "kontorsstädning Stockholm", "fönsterputs", "städbokning"],
  openGraph: {
    title,
    description,
    url: "https://iboren.se/",
    siteName: "Iboren",
    locale: "sv_SE",
    type: "website",
    images: [{ url: previewImage, width: 1200, height: 630, alt: "Iboren" }]
  },
  twitter: {
    card: "summary_large_image",
    title,
    description,
    images: ["/twitter-image"]
  },
  alternates: { canonical: "https://iboren.se" },
  manifest: "/manifest.webmanifest",
  icons: {
    icon: [
      { url: "/icon", type: "image/png" },
      { url: "/favicon.svg", type: "image/svg+xml" }
    ],
    apple: [{ url: "/apple-icon", type: "image/png" }]
  }
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
      <head>
        <link rel="preload" as="image" href="/cinematic/03-home-after.webp" fetchPriority="high" />
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function () {
                var mark = function () {
                  var hero = document.querySelector('img[src="/cinematic/03-home-after.webp"][alt="Rent hem"]');
                  if (!hero) return;
                  hero.setAttribute('loading', 'eager');
                  hero.setAttribute('fetchpriority', 'high');
                  hero.setAttribute('decoding', 'async');
                };
                mark();
                document.addEventListener('DOMContentLoaded', mark, { once: true });
              })();
            `
          }}
        />
      </head>
      <body>
        <StructuredData />
        {children}
      </body>
    </html>
  );
}
