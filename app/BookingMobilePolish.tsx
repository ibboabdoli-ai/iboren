"use client";

import { useEffect } from "react";

const css = `
.home-mobile-language-link {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  height: 2.75rem;
  min-width: 2.75rem;
  border-radius: 999px;
  border: 1px solid rgba(212, 165, 116, .35);
  background: rgba(255, 253, 248, .06);
  color: #D4A574;
  font-size: .78rem;
  font-weight: 900;
  letter-spacing: .16em;
  text-decoration: none;
}

@media (min-width: 768px) {
  .home-mobile-language-link {
    display: none !important;
  }
}

@media (max-width: 767px) {
  #booking {
    padding-top: 3.5rem !important;
    padding-bottom: 4rem !important;
  }

  #booking h2.display,
  #booking h3.display {
    max-width: 100% !important;
    font-size: clamp(2rem, 9vw, 2.85rem) !important;
    line-height: .96 !important;
    letter-spacing: -0.035em !important;
    overflow-wrap: anywhere !important;
    word-break: normal !important;
    hyphens: auto !important;
  }

  #booking form,
  #booking aside {
    border-radius: 1.5rem !important;
    padding: 1.15rem !important;
  }

  #booking form > div:first-child {
    align-items: flex-start !important;
    gap: .75rem !important;
  }

  #booking form > div:first-child span,
  #booking aside p[class*="tracking"] {
    letter-spacing: .16em !important;
  }

  #booking form .grid.gap-4 {
    gap: .9rem !important;
  }

  #booking input,
  #booking select,
  #booking textarea {
    min-height: 3.25rem !important;
    border-radius: 1.15rem !important;
    padding: .95rem 1rem !important;
    font-size: 16px !important;
    line-height: 1.35 !important;
  }

  #booking textarea {
    min-height: 7rem !important;
  }

  #booking button.rounded-2xl,
  #booking button.btn-primary,
  #booking .btn-primary {
    border-radius: 1.15rem !important;
    padding-top: .85rem !important;
    padding-bottom: .85rem !important;
  }

  #booking aside h3.display {
    font-size: clamp(1.9rem, 8vw, 2.35rem) !important;
    line-height: 1 !important;
  }

  #booking pre {
    max-height: none !important;
    overflow-x: hidden !important;
    white-space: pre-wrap !important;
    overflow-wrap: break-word !important;
    word-break: normal !important;
    font-family: Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif !important;
    font-size: .95rem !important;
    line-height: 1.65 !important;
    letter-spacing: 0 !important;
    border-radius: 1.25rem !important;
    padding: 1.1rem !important;
  }
}
`;

function addHomepageLanguageLink() {
  if (window.location.pathname !== "/") return;

  const nav = document.querySelector<HTMLElement>("header nav");
  const menuButton = nav?.querySelector<HTMLButtonElement>("button");
  if (!nav || !menuButton || nav.querySelector(".home-mobile-language-link")) return;

  const link = document.createElement("a");
  link.className = "home-mobile-language-link";
  link.href = "/en";
  link.textContent = "EN";
  link.setAttribute("aria-label", "Switch to English");
  nav.insertBefore(link, menuButton);
}

export default function BookingMobilePolish() {
  useEffect(() => {
    if (!document.getElementById("iboren-booking-mobile-polish")) {
      const style = document.createElement("style");
      style.id = "iboren-booking-mobile-polish";
      style.textContent = css;
      document.head.appendChild(style);
    }

    addHomepageLanguageLink();
  }, []);

  return null;
}
