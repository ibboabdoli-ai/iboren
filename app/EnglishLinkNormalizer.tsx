"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";

const svToEn: Record<string, string> = {
  "/priser": "/en/prices",
  "/jobb": "/en/jobs",
  "/om-iboren": "/en/about",
  "/privacy": "/en/privacy",
  "/terms": "/en/terms",
  "/hemstadning": "/en/home-cleaning",
  "/flyttstadning": "/en/move-out-cleaning",
  "/kontorsstadning": "/en/office-cleaning",
  "/fonsterputs": "/en/window-cleaning",
  "/hemstadning-sodertalje": "/en/home-cleaning-sodertalje",
  "/flyttstadning-sodertalje": "/en/move-out-cleaning-sodertalje",
  "/fonsterputs-sodertalje": "/en/window-cleaning-sodertalje",
  "/kontorsstadning-sodertalje": "/en/office-cleaning-sodertalje",
  "/hemstadning-stockholm": "/en/home-cleaning-stockholm",
  "/flyttstadning-stockholm": "/en/move-out-cleaning-stockholm",
  "/fonsterputs-stockholm": "/en/window-cleaning-stockholm",
  "/kontorsstadning-stockholm": "/en/office-cleaning-stockholm"
};

function normalizeHref(href: string) {
  if (!href || href.startsWith("#") || href.startsWith("mailto:") || href.startsWith("tel:")) return href;
  if (href === "/") return "/";
  const [path, hash = ""] = href.split("#");
  const normalized = path.endsWith("/") && path !== "/" ? path.slice(0, -1) : path;
  const mapped = svToEn[normalized];
  return mapped ? `${mapped}${hash ? `#${hash}` : ""}` : href;
}

export default function EnglishLinkNormalizer() {
  const pathname = usePathname() || "/";

  useEffect(() => {
    if (!(pathname === "/en" || pathname.startsWith("/en/"))) return;

    document.querySelectorAll<HTMLAnchorElement>("a[href]").forEach((anchor) => {
      const raw = anchor.getAttribute("href") || "";
      const next = normalizeHref(raw);
      if (next !== raw) anchor.setAttribute("href", next);
    });
  }, [pathname]);

  return null;
}
