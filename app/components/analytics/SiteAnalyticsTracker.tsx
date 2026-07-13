"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";
import { trackSiteEvent, type SiteEventName } from "../../lib/analytics";

function normalizePathname(pathname: string) {
  return pathname === "/" ? pathname : pathname.replace(/\/+$/, "");
}

function eventForLink(link: HTMLAnchorElement): SiteEventName | null {
  const explicitEvent = link.dataset.siteAnalyticsEvent;
  if (explicitEvent === "quote_cta_click" || explicitEvent === "booking_cta_click") return explicitEvent;

  const href = link.getAttribute("href");
  if (!href) return null;

  try {
    const destination = new URL(href, window.location.href);
    if (destination.origin !== window.location.origin) return null;

    const pathname = normalizePathname(destination.pathname);
    if (pathname === "/priser" || pathname === "/en/prices") return "quote_cta_click";
    if (pathname === "/boka-utan-konto" || pathname === "/en/boka-utan-konto" || destination.hash === "#booking") return "booking_cta_click";
  } catch {
    return null;
  }

  return null;
}

export default function SiteAnalyticsTracker() {
  const pathname = usePathname();

  useEffect(() => {
    if (pathname) trackSiteEvent("page_view");
  }, [pathname]);

  useEffect(() => {
    function trackCtaClick(event: MouseEvent) {
      if (event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
      const target = event.target;
      if (!(target instanceof Element)) return;

      const link = target.closest<HTMLAnchorElement>("a[href]");
      if (!link || link.target === "_blank" || link.hasAttribute("download")) return;

      const siteEvent = eventForLink(link);
      if (siteEvent) trackSiteEvent(siteEvent);
    }

    document.addEventListener("click", trackCtaClick, true);
    return () => document.removeEventListener("click", trackCtaClick, true);
  }, []);

  return null;
}
