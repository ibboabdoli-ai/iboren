"use client";

import { usePathname } from "next/navigation";
import { useEffect } from "react";

const CARD_CLASS = "iboren-admin-public-requests-link";

function removeCard() {
  document.querySelectorAll(`.${CARD_CLASS}`).forEach((element) => element.remove());
}

function createCard() {
  const link = document.createElement("a");
  link.href = "/admin/public-requests";
  link.className = `${CARD_CLASS} rounded-[1.5rem] bg-porcelain p-5 text-burgundy shadow-soft ring-1 ring-burgundy/10 transition hover:-translate-y-0.5`;
  link.innerHTML = [
    '<div class="mb-4 grid h-6 w-6 place-items-center rounded-full bg-burgundy text-porcelain text-[11px] font-black">PR</div>',
    '<h2 class="display text-3xl font-bold">Public requests</h2>',
    '<p class="mt-2 text-sm font-bold text-ink/55">Review requests sent without account before they become bookings.</p>'
  ].join("");
  return link;
}

function insertCard() {
  const firstAdminCard = document.querySelector<HTMLAnchorElement>('a[href="/admin/time-reports"]');
  const grid = firstAdminCard?.parentElement;
  if (!firstAdminCard || !grid || grid.querySelector(`.${CARD_CLASS}`)) return false;

  grid.insertBefore(createCard(), firstAdminCard);
  return true;
}

export default function AdminPublicRequestsDashboardLink() {
  const pathname = usePathname();

  useEffect(() => {
    removeCard();
    if (pathname !== "/admin") return;

    let attempts = 0;
    let intervalId: number | undefined;

    const tryInsert = () => {
      attempts += 1;
      const inserted = insertCard();
      if ((inserted || attempts >= 40) && intervalId !== undefined) window.clearInterval(intervalId);
    };

    tryInsert();
    intervalId = window.setInterval(tryInsert, 125);

    const observer = new MutationObserver(() => insertCard());
    observer.observe(document.body, { childList: true, subtree: true });

    return () => {
      if (intervalId !== undefined) window.clearInterval(intervalId);
      observer.disconnect();
      removeCard();
    };
  }, [pathname]);

  return null;
}
