import type { Metadata, Viewport } from "next";
import Script from "next/script";
import StructuredData from "./StructuredData";
import BookingMobilePolish from "./BookingMobilePolish";
import GoogleAddressEnhancer from "./GoogleAddressEnhancer";
import BookingFormValidationEnhancer from "./BookingFormValidationEnhancer";
import BookingAddressStreetNumberGuard from "./BookingAddressStreetNumberGuard";
import BookingEstimateQueryHydrator from "./BookingEstimateQueryHydrator";
import BookingAddonDetailsEnhancer from "./BookingAddonDetailsEnhancer";
import MobileMenuPolish from "./MobileMenuPolish";
import PwaManifestSwitcher from "./PwaManifestSwitcher";
import PublicBookingRequestEnhancer from "./PublicBookingRequestEnhancer";
import PublicBookingRequestLink from "./PublicBookingRequestLink";
import AdminBookingNotesFormatter from "./AdminBookingNotesFormatter";
import AdminOperationsQuickLink from "./AdminOperationsQuickLink";
import ProfileAccessLinks from "./ProfileAccessLinks";
import BookingNumberUiEnhancer from "./BookingNumberUiEnhancer";
import ThemeProvider from "./components/theme/ThemeProvider";
import "./globals.css";
import "./premium-hover.css";
import "./booking-date-mobile-fix.css";
import "./booking-page-mobile-safe.css";
import "./header-mobile-polish.css";
import "./footer-trust-polish.css";
import "./profile-dashboard-polish.css";
import "./price-page-dark-polish.css";
import "./service-page-dark-polish.css";
import "./site-visual-polish.css";

const title = "Iboren – Städning i Södertälje och Stockholm";
const description = "Skicka bokningsförfrågan för hemstädning, flyttstädning, kontorsstädning och fönsterputs med Iboren. Prisindikation, RUT-information och snabb återkoppling i Södertälje och Stockholm.";
const previewImage = "/og-image.png";
const serviceChatApiBase = "https://chat.proffera.se";
const serviceChatWidgetSrc = `${serviceChatApiBase}/widget.js?v=20260616-4`;

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
    images: [previewImage]
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
    <html lang="sv" suppressHydrationWarning>
      <head>
        <script
          id="iboren-theme-init"
          dangerouslySetInnerHTML={{
            __html: `(function(){try{var t=localStorage.getItem("iboren-theme");var m=t==="light"||t==="dark"||t==="system"?t:"system";var d=m==="system"?(window.matchMedia("(prefers-color-scheme: dark)").matches?"dark":"light"):m;document.documentElement.dataset.theme=d;}catch(e){document.documentElement.dataset.theme="dark";}})();`
          }}
        />
        <link rel="preload" as="image" href="/cinematic/03-home-after.webp" fetchPriority="high" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        <meta name="apple-mobile-web-app-title" content="Iboren" />
      </head>
      <body>
        <ThemeProvider>
          <StructuredData />
          <GoogleAddressEnhancer />
          <BookingFormValidationEnhancer />
          <BookingAddressStreetNumberGuard />
          <BookingEstimateQueryHydrator />
          <BookingAddonDetailsEnhancer />
          <PwaManifestSwitcher />
          <MobileMenuPolish />
          <BookingMobilePolish />
          <PublicBookingRequestEnhancer />
          <PublicBookingRequestLink />
          <AdminBookingNotesFormatter />
          <AdminOperationsQuickLink />
          <ProfileAccessLinks />
          <BookingNumberUiEnhancer />
          {children}
          <Script
            id="iboren-proffera-chat"
            src={serviceChatWidgetSrc}
            data-client-id="iboren"
            data-api-base={serviceChatApiBase}
            strategy="afterInteractive"
          />
        </ThemeProvider>
      </body>
    </html>
  );
}
