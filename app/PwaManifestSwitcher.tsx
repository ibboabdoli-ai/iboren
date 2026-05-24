"use client";

import { useEffect } from "react";

function manifestHref(pathname: string) {
  const start = pathname && pathname.startsWith("/") ? pathname : "/";
  return `/api/pwa-manifest?start=${encodeURIComponent(start)}`;
}

export default function PwaManifestSwitcher() {
  useEffect(() => {
    const update = () => {
      const href = manifestHref(window.location.pathname);
      let link = document.querySelector<HTMLLinkElement>('link[rel="manifest"]');
      if (!link) {
        link = document.createElement("link");
        link.rel = "manifest";
        document.head.appendChild(link);
      }
      link.href = href;
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
