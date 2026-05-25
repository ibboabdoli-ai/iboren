import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Iboren Supervisor",
  applicationName: "Iboren Supervisor",
  manifest: "/api/pwa-manifest?start=/supervisor",
  appleWebApp: {
    capable: true,
    title: "Iboren Supervisor",
    statusBarStyle: "black-translucent"
  },
  icons: {
    icon: [
      { url: "/icon", type: "image/png" },
      { url: "/favicon.svg", type: "image/svg+xml" }
    ],
    apple: [{ url: "/apple-icon", type: "image/png" }]
  }
};

export default function SupervisorLayout({ children }: { children: React.ReactNode }) {
  return children;
}
