"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";

const QUICK_CARD_HREFS = [
  "/admin/time-reports",
  "/admin/payroll-basis",
  "/supervisor",
  "/cleaner",
  "/en/cleaner",
  "/profile"
];

function applyCompactStyles(link: HTMLAnchorElement) {
  if (link.dataset.iborenAdminQuickCardCompact === "1") return;
  link.dataset.iborenAdminQuickCardCompact = "1";
  link.style.padding = "0.95rem 1rem";
  link.style.borderRadius = "1.1rem";
  link.style.display = "grid";
  link.style.gridTemplateColumns = "auto 1fr";
  link.style.alignItems = "center";
  link.style.columnGap = "0.75rem";
  link.style.minHeight = "auto";

  const icon = link.querySelector("svg") as SVGElement | null;
  if (icon) {
    icon.style.marginBottom = "0";
    icon.style.width = "1.1rem";
    icon.style.height = "1.1rem";
  }

  const title = link.querySelector("h2") as HTMLElement | null;
  if (title) {
    title.style.fontSize = "1.15rem";
    title.style.lineHeight = "1";
    title.style.margin = "0";
  }

  const description = link.querySelector("p") as HTMLElement | null;
  if (description) {
    description.style.gridColumn = "2";
    description.style.marginTop = "0.25rem";
    description.style.fontSize = "0.72rem";
    description.style.lineHeight = "1.25";
  }
}

function apply() {
  if (window.location.pathname !== "/admin") return;
  const links = QUICK_CARD_HREFS
    .map((href) => document.querySelector<HTMLAnchorElement>(`a[href="${href}"]`))
    .filter(Boolean) as HTMLAnchorElement[];

  if (!links.length) return;
  const grid = links[0]?.parentElement;
  if (grid && !grid.dataset.iborenAdminQuickCardsCompact) {
    grid.dataset.iborenAdminQuickCardsCompact = "1";
    grid.style.gap = "0.7rem";
  }

  links.forEach(applyCompactStyles);
}

export default function AdminQuickCardsPolish() {
  const pathname = usePathname();

  useEffect(() => {
    if (pathname !== "/admin") return;
    apply();
    const observer = new MutationObserver(apply);
    observer.observe(document.body, { childList: true, subtree: true });
    window.setTimeout(apply, 500);
    return () => observer.disconnect();
  }, [pathname]);

  return null;
}
