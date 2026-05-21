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

function isEnglishRoute(pathname: string) {
  return pathname === "/en" || pathname.startsWith("/en/");
}

function normalizeHref(href: string) {
  if (!href || href.startsWith("#") || href.startsWith("mailto:") || href.startsWith("tel:")) return href;
  if (href === "/") return "/";

  const parsed = href.startsWith("http") ? new URL(href) : null;
  const target = parsed ? `${parsed.pathname}${parsed.hash}` : href;
  const [path, hash = ""] = target.split("#");
  const normalized = path.endsWith("/") && path !== "/" ? path.slice(0, -1) : path;
  const mapped = svToEn[normalized];
  return mapped ? `${mapped}${hash ? `#${hash}` : ""}` : href;
}

function shouldAllowSwedishLink(anchor: HTMLAnchorElement) {
  const label = (anchor.textContent || "").trim().toLowerCase();
  return label === "sv" || label.includes("svenska") || label.includes("swedish calculator");
}

export default function EnglishLinkNormalizer() {
  const pathname = usePathname() || "/";

  useEffect(() => {
    if (!isEnglishRoute(pathname)) return;

    const normalizeExistingLinks = () => {
      document.querySelectorAll<HTMLAnchorElement>("a[href]").forEach((anchor) => {
        if (shouldAllowSwedishLink(anchor)) return;
        const raw = anchor.getAttribute("href") || "";
        const next = normalizeHref(raw);
        if (next !== raw) anchor.setAttribute("href", next);
      });
    };

    function onDocumentClick(event: MouseEvent) {
      if (event.defaultPrevented || event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
      const target = event.target instanceof Element ? event.target.closest<HTMLAnchorElement>("a[href]") : null;
      if (!target || shouldAllowSwedishLink(target)) return;

      const raw = target.getAttribute("href") || "";
      const next = normalizeHref(raw);
      if (next === raw || !next.startsWith("/en")) return;

      event.preventDefault();
      event.stopPropagation();
      window.location.assign(next);
    }

    normalizeExistingLinks();
    document.addEventListener("click", onDocumentClick, true);

    return () => {
      document.removeEventListener("click", onDocumentClick, true);
    };
  }, [pathname]);

  return null;
}
