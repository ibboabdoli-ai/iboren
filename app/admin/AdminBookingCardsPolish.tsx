"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";

function findCleanerAssignment(article: HTMLElement) {
  const candidates = Array.from(article.children) as HTMLElement[];
  return candidates.find((child) => (child.textContent || "").includes("Cleaner assignment")) || null;
}

function createCollapsedCleanerBox(source: HTMLElement) {
  const details = document.createElement("details");
  details.dataset.iborenCleanerAssignmentPolish = "1";
  details.className = "mt-4 rounded-2xl border border-burgundy/10 bg-porcelain p-4";

  const summary = document.createElement("summary");
  summary.className = "cursor-pointer text-xs font-black uppercase tracking-[.16em] text-burgundy";
  summary.textContent = "Cleaner assignment / bemanning";

  const body = document.createElement("div");
  body.className = "mt-4";
  body.appendChild(source.cloneNode(true));

  details.appendChild(summary);
  details.appendChild(body);
  return details;
}

function polishArticle(article: HTMLElement) {
  if (article.dataset.iborenBookingCardPolished === "1") return;
  const cleanerBox = findCleanerAssignment(article);
  if (!cleanerBox) return;

  const replacement = createCollapsedCleanerBox(cleanerBox);
  cleanerBox.insertAdjacentElement("afterend", replacement);
  cleanerBox.style.display = "none";
  article.dataset.iborenBookingCardPolished = "1";
}

function apply() {
  if (window.location.pathname !== "/admin") return;
  document.querySelectorAll<HTMLElement>("article").forEach(polishArticle);
}

export default function AdminBookingCardsPolish() {
  const pathname = usePathname();

  useEffect(() => {
    if (pathname !== "/admin") return;
    apply();
    const observer = new MutationObserver(apply);
    observer.observe(document.body, { childList: true, subtree: true });
    window.setTimeout(apply, 500);
    window.setTimeout(apply, 1500);
    return () => observer.disconnect();
  }, [pathname]);

  return null;
}
