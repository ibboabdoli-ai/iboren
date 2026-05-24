import { NextResponse } from "next/server";

export const runtime = "nodejs";

function safeStartUrl(value: string | null) {
  const raw = String(value || "/").trim();
  if (!raw.startsWith("/")) return "/";
  if (raw.startsWith("//")) return "/";
  return raw.slice(0, 180);
}

function appName(startUrl: string) {
  if (startUrl.startsWith("/admin")) return { name: "Iboren Admin", short_name: "Admin" };
  if (startUrl.startsWith("/cleaner")) return { name: "Iboren Cleaner", short_name: "Cleaner" };
  if (startUrl.startsWith("/profile")) return { name: "Iboren Kund", short_name: "Iboren" };
  if (startUrl.startsWith("/supervisor")) return { name: "Iboren Supervisor", short_name: "Supervisor" };
  return { name: "Iboren", short_name: "Iboren" };
}

export async function GET(request: Request) {
  const url = new URL(request.url);
  const startUrl = safeStartUrl(url.searchParams.get("start"));
  const names = appName(startUrl);

  return NextResponse.json({
    ...names,
    description: "Iboren dashboard och bokningsapp",
    start_url: startUrl,
    scope: "/",
    display: "standalone",
    display_override: ["standalone", "minimal-ui"],
    background_color: "#0B0E0C",
    theme_color: "#0B0E0C",
    orientation: "portrait",
    icons: [
      { src: "/icon", sizes: "256x256", type: "image/png", purpose: "any" },
      { src: "/apple-icon", sizes: "256x256", type: "image/png", purpose: "any maskable" }
    ]
  }, {
    headers: {
      "Content-Type": "application/manifest+json; charset=utf-8",
      "Cache-Control": "no-store"
    }
  });
}
