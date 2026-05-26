import type { Metadata, Viewport } from "next";
import Script from "next/script";
import StructuredData from "./StructuredData";
import GoogleAddressEnhancer from "./GoogleAddressEnhancer";
import BookingFormValidationEnhancer from "./BookingFormValidationEnhancer";
import PwaManifestSwitcher from "./PwaManifestSwitcher";
import "./globals.css";

const title = "Iboren – Städning i Södertälje och Stockholm";
const description = "Skicka bokningsförfrågan för hemstädning, flyttstädning, kontorsstädning och fönsterputs med Iboren. Prisindikation, RUT-information och snabb återkoppling i Södertälje och Stockholm.";
const previewImage = "/opengraph-image";

export const metadata: Metadata = {
  metadataBase: new URL("https://iboren.se"),
  title,
  description,
  applicationName: "Iboren",
  keywords: ["Iboren", "städning Södertälje", "hemstädning Södertälje", "flyttstädning Södertälje", "städning Stockholm", "kontorsstädning Stockholm", "fönsterputs", "bokningsförfrågan städning"],
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
  manifest: "/api/pwa-manifest?start=/",
  icons: {
    icon: [
      { url: "/icon", type: "image/png" },
      { url: "/favicon.svg", type: "image/svg+xml" }
    ],
    apple: [{ url: "/apple-icon", type: "image/png" }]
  },
  appleWebApp: {
    capable: true,
    title: "Iboren",
    statusBarStyle: "black-translucent"
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
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        <meta name="apple-mobile-web-app-title" content="Iboren" />
      </head>
      <body>
        <StructuredData />
        <GoogleAddressEnhancer />
        <BookingFormValidationEnhancer />
        <PwaManifestSwitcher />
        {children}
        <div id="tawk_6895ddde56ddd81926b30080" />
        <Script id="tawk-to-chat" strategy="afterInteractive">
          {`var Tawk_API=Tawk_API||{}, Tawk_LoadStart=new Date();
Tawk_API.embedded='tawk_6895ddde56ddd81926b30080';
(function(){
var s1=document.createElement("script"),s0=document.getElementsByTagName("script")[0];
s1.async=true;
s1.src='https://embed.tawk.to/6895ddde56ddd81926b30080/1jpi1456c';
s1.charset='UTF-8';
s1.setAttribute('crossorigin','*');
s0.parentNode.insertBefore(s1,s0);
})();`}
        </Script>
      </body>
    </html>
  );
}
