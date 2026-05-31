"use client";

import { usePathname } from "next/navigation";
import { useEffect } from "react";

const STYLE_ID = "iboren-admin-simple-style";
const PROCESSED = "data-iboren-simple-processed";

function addStyles() {
  if (document.getElementById(STYLE_ID)) return;
  const style = document.createElement("style");
  style.id = STYLE_ID;
  style.textContent = `
    @media (max-width: 900px) {
      a[href="/admin/time-reports"],
      a[href="/admin/payroll-basis"],
      a[href="/supervisor"],
      a[href="/cleaner"],
      a[href="/en/cleaner"],
      a[href="/profile"] {
        min-height: 0 !important;
        border-radius: 1.1rem !important;
        padding: .95rem !important;
      }
      a[href="/admin/time-reports"] h2,
      a[href="/admin/payroll-basis"] h2,
      a[href="/supervisor"] h2,
      a[href="/cleaner"] h2,
      a[href="/en/cleaner"] h2,
      a[href="/profile"] h2 {
        font-size: 1.15rem !important;
        line-height: 1.15 !important;
      }
      a[href="/admin/time-reports"] p,
      a[href="/admin/payroll-basis"] p,
      a[href="/supervisor"] p,
      a[href="/cleaner"] p,
      a[href="/en/cleaner"] p,
      a[href="/profile"] p {
        display: none !important;
      }
      a[href="/cleaner"],
      a[href="/en/cleaner"],
      a[href="/profile"] {
        display: none !important;
      }
      article[data-iboren-simple-processed="booking"] {
        border-radius: 1.65rem !important;
        padding: 1.1rem !important;
        background: #fffdf7 !important;
        box-shadow: 0 16px 42px rgba(11, 14, 12, .08) !important;
      }
      article[data-iboren-simple-processed="booking"] h2,
      article[data-iboren-simple-processed="booking"] h3 {
        font-size: clamp(2.1rem, 12vw, 3.6rem) !important;
        line-height: .95 !important;
        word-break: break-word !important;
      }
      article[data-iboren-simple-processed="booking"] select {
        min-height: 3.7rem !important;
        border: 2px solid rgba(119, 38, 68, .16) !important;
        background: #fffdf7 !important;
        color: #1f1b18 !important;
        font-size: 1.05rem !important;
        font-weight: 900 !important;
      }
      article[data-iboren-simple-processed="booking"] button:not(.iboren-simple-toggle) {
        opacity: 1 !important;
        min-height: 3.25rem !important;
        box-shadow: 0 10px 22px rgba(11, 14, 12, .08) !important;
        filter: saturate(1.15) contrast(1.05) !important;
      }
    }
    .iboren-admin-simple-actions {
      position: sticky;
      top: 0;
      z-index: 35;
      margin: 1rem 0;
      border-radius: 1.3rem;
      border: 1px solid rgba(119, 38, 68, .14);
      background: rgba(248, 244, 237, .94);
      padding: .75rem;
      box-shadow: 0 18px 45px rgba(11, 14, 12, .08);
      backdrop-filter: blur(14px);
    }
    .iboren-admin-simple-actions-inner {
      display: grid;
      grid-template-columns: repeat(2, minmax(0, 1fr));
      gap: .55rem;
    }
    @media (min-width: 760px) {
      .iboren-admin-simple-actions-inner { grid-template-columns: repeat(4, minmax(0, 1fr)); }
    }
    .iboren-admin-simple-actions a,
    .iboren-admin-simple-actions button {
      border-radius: 999px;
      padding: .75rem .9rem;
      font-weight: 900;
      font-size: .82rem;
      text-align: center;
      background: #fffdf7;
      color: #772644;
      border: 1px solid rgba(119, 38, 68, .14);
    }
    .iboren-simple-card-collapsed {
      max-height: 34rem;
      overflow: hidden;
      position: relative;
    }
    .iboren-simple-toggle {
      margin-top: .85rem;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      border-radius: 999px;
      padding: .75rem 1.05rem;
      font-size: .85rem;
      font-weight: 900;
      background: #772644;
      color: #fffdf7;
      box-shadow: 0 12px 26px rgba(119, 38, 68, .18);
    }
    .iboren-simple-hidden-section {
      display: none !important;
    }
  `;
  document.head.appendChild(style);
}

function removeStyles() {
  document.getElementById(STYLE_ID)?.remove();
}

function hasText(element: Element, text: string) {
  return (element.textContent || "").toLowerCase().includes(text.toLowerCase());
}

function addQuickActions() {
  if (document.querySelector(".iboren-admin-simple-actions")) return;
  const hero = Array.from(document.querySelectorAll("div")).find((element) => hasText(element, "Booking dashboard") && hasText(element, "Hantera inkommande bokningar"));
  const container = hero?.parentElement;
  if (!container) return;

  const panel = document.createElement("div");
  panel.className = "iboren-admin-simple-actions";
  panel.innerHTML = `
    <div class="iboren-admin-simple-actions-inner">
      <a href="#bookings">Bokningar</a>
      <a href="/admin/public-requests">Public requests</a>
      <button type="button" data-iboren-jump-staff="true">Personal</button>
      <a href="/admin/time-reports">Tider</a>
    </div>
  `;
  container.insertBefore(panel, container.children[1] || null);

  panel.querySelector<HTMLButtonElement>("[data-iboren-jump-staff]")?.addEventListener("click", () => {
    const staff = document.querySelector<HTMLElement>('[data-iboren-simple-section="staff"]');
    if (staff) {
      staff.classList.remove("iboren-simple-hidden-section");
      staff.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  });
}

function markBookingsList() {
  const searchInput = document.querySelector<HTMLInputElement>('input[placeholder="Sök namn, email, telefon, adress, stad, tjänst..."]');
  const block = searchInput?.closest("div")?.parentElement?.parentElement;
  if (block && !block.id) block.id = "bookings";
}

function simplifyStaffAccess() {
  const heading = Array.from(document.querySelectorAll("p,h2,h3,div")).find((element) => element.textContent?.trim() === "STAFF ACCESS");
  let wrapper = heading?.parentElement;
  for (let i = 0; wrapper && i < 5; i += 1) {
    const text = wrapper.textContent || "";
    if (text.includes("User & staff roles") && text.includes("SAVE ROLE")) break;
    wrapper = wrapper.parentElement;
  }
  if (!wrapper || wrapper.getAttribute(PROCESSED) === "staff") return;
  wrapper.setAttribute(PROCESSED, "staff");
  wrapper.setAttribute("data-iboren-simple-section", "staff");
  wrapper.classList.add("iboren-simple-hidden-section");

  const button = document.createElement("button");
  button.type = "button";
  button.className = "iboren-simple-toggle";
  button.textContent = "Visa/dölj personalhantering";
  button.addEventListener("click", () => wrapper?.classList.toggle("iboren-simple-hidden-section"));
  wrapper.parentElement?.insertBefore(button, wrapper);
}

function simplifyBookingCards() {
  const articles = Array.from(document.querySelectorAll<HTMLElement>("article"));
  articles.forEach((article) => {
    if (article.getAttribute(PROCESSED) === "booking") return;
    if (!hasText(article, "Kund:") || !hasText(article, "Cleaner assignment")) return;
    article.setAttribute(PROCESSED, "booking");

    const toggle = document.createElement("button");
    toggle.type = "button";
    toggle.className = "iboren-simple-toggle";
    toggle.textContent = "Dölj detaljer";
    toggle.addEventListener("click", () => {
      const collapsed = article.classList.toggle("iboren-simple-card-collapsed");
      toggle.textContent = collapsed ? "Visa alla detaljer" : "Dölj detaljer";
    });
    article.appendChild(toggle);
  });
}

function simplifyAdmin() {
  addQuickActions();
  markBookingsList();
  simplifyStaffAccess();
  simplifyBookingCards();
}

export default function AdminDashboardSimplifier() {
  const pathname = usePathname();

  useEffect(() => {
    if (pathname !== "/admin") return;
    addStyles();

    let frame = 0;
    const schedule = () => {
      if (frame) window.cancelAnimationFrame(frame);
      frame = window.requestAnimationFrame(simplifyAdmin);
    };

    schedule();
    const observer = new MutationObserver(schedule);
    observer.observe(document.body, { childList: true, subtree: true });

    return () => {
      if (frame) window.cancelAnimationFrame(frame);
      observer.disconnect();
      removeStyles();
      document.querySelectorAll(".iboren-admin-simple-actions").forEach((element) => element.remove());
    };
  }, [pathname]);

  return null;
}
