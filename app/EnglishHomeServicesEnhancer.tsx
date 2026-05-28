"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";

const cardId = "iboren-english-window-cleaning-card";

export default function EnglishHomeServicesEnhancer() {
  const pathname = usePathname() || "";

  useEffect(() => {
    if (pathname !== "/en") return;

    const grid = document.querySelector<HTMLElement>("#services .grid");
    if (!grid || document.getElementById(cardId) || grid.querySelector('a[href="/en/window-cleaning"]')) return;

    const card = document.createElement("a");
    card.id = cardId;
    card.href = "/en/window-cleaning";
    card.className = "group relative overflow-hidden rounded-[2rem] border border-gold/15 bg-porcelain/[.035] p-7 shadow-[0_28px_90px_rgba(0,0,0,.22)] transition hover:-translate-y-1 hover:border-gold/40";
    card.innerHTML = `
      <div class="mb-20 flex items-start justify-between">
        <div class="grid h-14 w-14 place-items-center rounded-full border border-gold/30 bg-gold/10 text-gold text-2xl">✦</div>
        <span class="rounded-full border border-gold/20 px-3 py-1 text-[10px] font-bold uppercase tracking-[.2em] text-gold/80">custom quote</span>
      </div>
      <p class="mb-3 text-[11px] font-bold uppercase tracking-[.28em] text-porcelain/42">04</p>
      <h3 class="display text-4xl font-normal uppercase text-porcelain">Window cleaning</h3>
      <p class="mt-4 leading-7 text-porcelain/62">For windows, glass surfaces and add-on cleaning.</p>
    `;

    grid.appendChild(card);
  }, [pathname]);

  return null;
}
