"use client";

import { useEffect } from "react";

function manifestHref(pathname: string) {
  const start = pathname && pathname.startsWith("/") ? pathname : "/";
  return `/api/pwa-manifest?start=${encodeURIComponent(start)}`;
}

function appTitle(pathname: string) {
  if (pathname.startsWith("/admin")) return "Iboren Admin";
  if (pathname.startsWith("/cleaner")) return "Iboren Cleaner";
  if (pathname.startsWith("/supervisor")) return "Iboren Supervisor";
  if (pathname.startsWith("/profile")) return "Iboren Kund";
  if (pathname.startsWith("/en/profile")) return "Iboren Customer";
  return "Iboren";
}

function setMeta(name: string, content: string) {
  let meta = document.querySelector<HTMLMetaElement>(`meta[name="${name}"]`);
  if (!meta) {
    meta = document.createElement("meta");
    meta.name = name;
    document.head.appendChild(meta);
  }
  meta.content = content;
}

export default function PwaManifestSwitcher() {
  useEffect(() => {
    const update = () => {
      const pathname = window.location.pathname;
      const href = manifestHref(pathname);
      let link = document.querySelector<HTMLLinkElement>('link[rel="manifest"]');
      if (!link) {
        link = document.createElement("link");
        link.rel = "manifest";
        document.head.appendChild(link);
      }
      link.href = href;
      setMeta("apple-mobile-web-app-title", appTitle(pathname));
      setMeta("application-name", appTitle(pathname));
    };

    update();
    window.addEventListener("popstate", update);
    window.addEventListener("hashchange", update);
    return () => {
      window.removeEventListener("popstate", update);
      window.removeEventListener("hashchange", update);
    };
  }, []);

  return null;
}
