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

const cinematicImagePatch = `
(function () {
  var cinematicImages = [
    "/cinematic/01-home-before.webp",
    "/cinematic/02-home-cleaner.webp",
    "/cinematic/03-home-after.webp",
    "/cinematic/04-office-before.webp",
    "/cinematic/05-office-cleaner.webp",
    "/cinematic/06-office-after.webp"
  ];

  function applyCinematicImages() {
    var heroImage = document.querySelector('#top img');
    if (heroImage) heroImage.setAttribute('src', '/cinematic/03-home-after.webp');

    var images = document.querySelectorAll('#cinematic-scroll img');
    images.forEach(function (image, index) {
      if (cinematicImages[index]) image.setAttribute('src', cinematicImages[index]);
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', applyCinematicImages);
  } else {
    applyCinematicImages();
  }

  var observer = new MutationObserver(applyCinematicImages);
  observer.observe(document.documentElement, { childList: true, subtree: true });
})();
`;

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="sv">
      <body>
        {children}
        <script dangerouslySetInnerHTML={{ __html: cinematicImagePatch }} />
      </body>
    </html>
  );
}
