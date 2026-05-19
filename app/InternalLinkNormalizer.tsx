"use client";

import { useEffect } from "react";

const linkMap: Record<string, string> = {
  "/jobb": "/jobba-hos-oss",
  "/om-iboren": "/om-oss",
  "/hemstadning": "/tjanster/hemstadning",
  "/flyttstadning": "/tjanster/flyttstadning",
  "/kontorsstadning": "/tjanster/kontorsstadning",
  "/fonsterputs": "/tjanster/fonsterputs"
};

function normalizeLinks() {
  document.querySelectorAll<HTMLAnchorElement>("a[href]").forEach((anchor) => {
    const href = anchor.getAttribute("href");
    if (!href) return;
    const replacement = linkMap[href];
    if (replacement) anchor.setAttribute("href", replacement);
  });
}

export default function InternalLinkNormalizer() {
  useEffect(() => {
    normalizeLinks();
    const observer = new MutationObserver(normalizeLinks);
    observer.observe(document.documentElement, { childList: true, subtree: true, attributes: true, attributeFilter: ["href"] });
    return () => observer.disconnect();
  }, []);

  return null;
}
