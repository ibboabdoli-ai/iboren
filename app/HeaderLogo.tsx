"use client";

import { useEffect } from "react";

function applyHeaderLogo() {
  const headerLogoLink = document.querySelector<HTMLAnchorElement>('header nav a[href="#top"]');
  if (!headerLogoLink || headerLogoLink.dataset.iborenLogoApplied === "1") return;

  headerLogoLink.dataset.iborenLogoApplied = "1";
  headerLogoLink.classList.add("iboren-header-logo-link");
  headerLogoLink.innerHTML = `
    <span class="sr-only">Iboren startsida</span>
    <img
      src="/logo.svg"
      alt="Iboren"
      width="180"
      height="60"
      class="iboren-header-logo"
      decoding="async"
    />
  `;
}

export default function HeaderLogo() {
  useEffect(() => {
    applyHeaderLogo();
    const observer = new MutationObserver(applyHeaderLogo);
    observer.observe(document.documentElement, { childList: true, subtree: true });
    return () => observer.disconnect();
  }, []);

  return null;
}
