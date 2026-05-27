"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect } from "react";
import BookingSubmitController from "./BookingSubmitController";

const hiddenPrefixes = ["/admin", "/profile", "/login"];

const localLinks = [
  { href: "/om-iboren", label: "Om Iboren" },
  { href: "/stadning-sodertalje", label: "Städning i Södertälje" },
  { href: "/stadning-stockholm", label: "Städning i Stockholm" },
  { href: "/hemstadning", label: "Hemstädning" },
  { href: "/flyttstadning", label: "Flyttstädning" },
  { href: "/kontorsstadning", label: "Kontorsstädning" },
  { href: "/fonsterputs", label: "Fönsterputs" }
];

const englishLocalLinks = [
  { href: "/en/about", label: "About Iboren" },
  { href: "/en/home-cleaning-sodertalje", label: "Cleaning in Södertälje" },
  { href: "/en/home-cleaning-stockholm", label: "Cleaning in Stockholm" },
  { href: "/en/home-cleaning", label: "Home cleaning" },
  { href: "/en/move-out-cleaning", label: "Move-out cleaning" },
  { href: "/en/office-cleaning", label: "Office cleaning" },
  { href: "/en/window-cleaning", label: "Window cleaning" }
];

const keywordLinks = [
  { href: "/stadning-sodertalje", label: "Hemstädning Södertälje" },
  { href: "/stadning-sodertalje", label: "Flyttstädning Södertälje" },
  { href: "/stadning-sodertalje", label: "Städfirma Södertälje" },
  { href: "/stadning-sodertalje", label: "Fönsterputs Södertälje" },
  { href: "/stadning-stockholm", label: "Kontorsstädning Stockholm" },
  { href: "/stadning-stockholm", label: "Städfirma Stockholm" }
];

const englishKeywordLinks = [
  { href: "/en/home-cleaning-sodertalje", label: "Home cleaning Södertälje" },
  { href: "/en/move-out-cleaning-sodertalje", label: "Move-out cleaning Södertälje" },
  { href: "/en/home-cleaning-sodertalje", label: "Cleaning company Södertälje" },
  { href: "/en/window-cleaning-sodertalje", label: "Window cleaning Södertälje" },
  { href: "/en/office-cleaning-stockholm", label: "Office cleaning Stockholm" },
  { href: "/en/home-cleaning-stockholm", label: "Cleaning company Stockholm" }
];

type StoredSession = {
  access_token?: string;
  user?: { email?: string };
};

type IborenWindow = Window & {
  __iborenFetchPatched?: boolean;
  __iborenGetSession?: () => StoredSession | null;
};

function getStoredSession() {
  for (let index = 0; index < localStorage.length; index += 1) {
    const key = localStorage.key(index) || "";
    if (!key.includes("auth-token")) continue;
    try {
      const data = JSON.parse(localStorage.getItem(key) || "{}") as StoredSession;
      if (data?.access_token) return data;
    } catch {
      return null;
    }
  }
  return null;
}

function getSessionEmail() {
  return getStoredSession()?.user?.email?.toLowerCase() || "";
}

function patchBookingFetch() {
  const scopedWindow = window as IborenWindow;
  if (scopedWindow.__iborenFetchPatched) return;
  scopedWindow.__iborenFetchPatched = true;
  scopedWindow.__iborenGetSession = getStoredSession;

  const originalFetch = window.fetch.bind(window);
  let bookingPostInFlight = false;

  window.fetch = (input: RequestInfo | URL, init?: RequestInit) => {
    const url = typeof input === "string" ? input : input instanceof URL ? input.toString() : input.url;
    const method = ((init?.method || (input instanceof Request ? input.method : "GET")) || "GET").toUpperCase();

    if (url.includes("/api/bookings") && method === "POST") {
      if (bookingPostInFlight) {
        return Promise.resolve(new Response(JSON.stringify({ ok: false, message: "Bokningen skickas redan. Vänta tills den första förfrågan är klar." }), { status: 429, headers: { "Content-Type": "application/json" } }));
      }

      bookingPostInFlight = true;
      const token = getStoredSession()?.access_token;
      const headers = new Headers(init?.headers || (input instanceof Request ? input.headers : undefined));
      if (token && !headers.has("Authorization")) headers.set("Authorization", `Bearer ${token}`);

      return originalFetch(input, { ...(init || {}), headers }).finally(() => {
        window.setTimeout(() => { bookingPostInFlight = false; }, 1200);
      });
    }

    return originalFetch(input, init);
  };
}

function createLoginCard() {
  const card = document.createElement("div");
  card.id = "iboren-login-required";
  card.className = "rounded-[2rem] border border-gold/20 bg-cream p-7 text-ink shadow-2xl md:p-9";

  const eyebrow = document.createElement("p");
  eyebrow.className = "text-xs font-black uppercase tracking-[.28em] text-burgundy";
  eyebrow.textContent = "Logga in krävs";

  const heading = document.createElement("h3");
  heading.className = "display mt-3 text-4xl font-bold leading-none text-burgundy";
  heading.textContent = "Logga in för att boka.";

  const text = document.createElement("p");
  text.className = "mt-5 leading-8 text-ink/75";
  text.textContent = "För att undvika felaktiga bokningar behöver du logga in med Google, Microsoft eller LinkedIn innan du fyller i bokningsformuläret.";

  const actions = document.createElement("div");
  actions.className = "mt-6 flex flex-col gap-3 sm:flex-row";

  const login = document.createElement("a");
  login.href = "/login";
  login.className = "inline-flex items-center justify-center rounded-full bg-burgundy px-5 py-3 text-sm font-black uppercase tracking-[.12em] text-porcelain";
  login.textContent = "Logga in / Skapa konto";

  const privacy = document.createElement("a");
  privacy.href = "/privacy";
  privacy.className = "inline-flex items-center justify-center rounded-full border border-burgundy/15 bg-porcelain px-5 py-3 text-sm font-bold text-burgundy";
  privacy.textContent = "Privacy";

  actions.append(login, privacy);
  card.append(eyebrow, heading, text, actions);
  return card;
}

function applyBookingLoginGuard() {
  const section = document.querySelector("#booking");
  const form = section?.querySelector("form") as HTMLFormElement | null;
  const aside = section?.querySelector("aside") as HTMLElement | null;
  if (!section || !form) return;

  if (!form.dataset.loginGuarded) {
    form.dataset.loginGuarded = "1";
    form.addEventListener("submit", (event) => {
      if (!getStoredSession()?.access_token) {
        event.preventDefault();
        event.stopPropagation();
        window.location.href = "/login";
        return;
      }

      const sessionEmail = getSessionEmail();
      const emailInput = form.querySelector<HTMLInputElement>('input[type="email"]');
      const formEmail = emailInput?.value.trim().toLowerCase() || "";
      if (sessionEmail && formEmail && sessionEmail !== formEmail) {
        event.preventDefault();
        event.stopPropagation();
        alert(`Bokningens e-post måste matcha ditt inloggade konto: ${sessionEmail}`);
      }
    }, true);
  }

  const existingCard = section.querySelector("#iboren-login-required");
  const loggedIn = Boolean(getStoredSession()?.access_token) || Boolean(document.querySelector('a[href="/profile"]'));

  if (loggedIn) {
    form.style.display = "";
    if (aside) aside.style.display = "";
    existingCard?.remove();
    return;
  }

  form.style.display = "none";
  if (aside) aside.style.display = "none";
  if (!existingCard) form.parentElement?.insertBefore(createLoginCard(), form);
}

function isBookingSuccessText(text: string) {
  const normalized = text.toLowerCase();
  return normalized.includes("bokningen är sparad") || normalized.includes("bokningsförfrågan är sparad") || normalized.includes("tack!");
}

function createSuccessLink(href: string, label: string, className: string) {
  const link = document.createElement("a");
  link.href = href;
  link.textContent = label;
  link.className = className;
  return link;
}

function addBookingSuccessActions(form: Element, afterElement: Element) {
  if (form.querySelector("#iboren-booking-success-actions")) return;

  const wrapper = document.createElement("div");
  wrapper.id = "iboren-booking-success-actions";
  wrapper.className = "mt-3 grid gap-2 sm:grid-cols-2";

  const profileLink = createSuccessLink("/profile", "Gå till min profil", "inline-flex items-center justify-center rounded-full bg-gold px-4 py-3 text-sm font-black uppercase tracking-[.12em] text-ink");
  const newBookingLink = createSuccessLink("/#booking", "Ny bokning", "inline-flex items-center justify-center rounded-full border border-gold/40 px-4 py-3 text-sm font-bold text-gold");
  newBookingLink.addEventListener("click", (event) => {
    event.preventDefault();
    window.location.href = "/#booking";
    window.location.reload();
  });

  wrapper.append(profileLink, newBookingLink);
  afterElement.insertAdjacentElement("afterend", wrapper);
}

function enhanceBookingSuccess() {
  const form = document.querySelector("#booking form");
  if (!form) return;

  const message = Array.from(form.querySelectorAll("p")).find((node) => isBookingSuccessText(node.textContent || ""));
  if (!message) return;

  const submitButton = form.querySelector<HTMLButtonElement>('button[type="submit"], button:not([type])');
  if (submitButton) {
    submitButton.disabled = true;
    submitButton.setAttribute("aria-disabled", "true");
    submitButton.classList.add("opacity-80", "cursor-not-allowed");
    submitButton.textContent = "Bokning skickad";
  }

  addBookingSuccessActions(form, message);
}

function applyAccessibilityLabels() {
  const menuButton = document.querySelector<HTMLButtonElement>('header nav > button');
  if (menuButton) {
    const isOpen = Boolean(document.querySelector('header div.border-t'));
    menuButton.setAttribute("aria-label", isOpen ? "Stäng meny" : "Öppna meny");
    menuButton.setAttribute("aria-expanded", String(isOpen));
    menuButton.setAttribute("type", "button");
  }

  const locationButton = document.querySelector<HTMLButtonElement>('#booking form button[type="button"]:has(svg)');
  if (locationButton && !locationButton.textContent?.trim()) {
    locationButton.setAttribute("aria-label", "Hämta adress från plats");
  }

  const copyButton = document.querySelector<HTMLButtonElement>('#booking aside button');
  if (copyButton) {
    copyButton.setAttribute("aria-label", "Kopiera bokningssammanfattning");
    copyButton.setAttribute("type", "button");
  }
}

function applyClientEnhancements() {
  patchBookingFetch();
  applyBookingLoginGuard();
  enhanceBookingSuccess();
  applyAccessibilityLabels();
}

export default function SeoInternalLinks() {
  const pathname = usePathname();
  const isEnglish = pathname === "/en" || Boolean(pathname?.startsWith("/en/"));
  const sectionLinks = isEnglish ? englishLocalLinks : localLinks;
  const searchLinks = isEnglish ? englishKeywordLinks : keywordLinks;

  useEffect(() => {
    applyClientEnhancements();
    const observer = new MutationObserver(applyClientEnhancements);
    observer.observe(document.documentElement, { childList: true, subtree: true, characterData: true });
    return () => observer.disconnect();
  }, []);

  if (hiddenPrefixes.some((prefix) => pathname?.startsWith(prefix))) return null;

  return (
    <>
      <BookingSubmitController />
      <section aria-label={isEnglish ? "Popular cleaning pages" : "Populära städsidor"} className="border-t border-gold/10 bg-night py-10 text-porcelain">
      <div className="luxe-container grid gap-8 md:grid-cols-[1fr_1.2fr] md:items-start">
        <div>
          <p className="text-[10px] font-bold uppercase tracking-[.32em] text-gold/70">{isEnglish ? "Local cleaning services" : "Lokala städtjänster"}</p>
          <h2 className="display mt-3 text-3xl font-normal uppercase text-porcelain md:text-4xl">{isEnglish ? "Find the right cleaning service faster." : "Hitta rätt städning snabbare."}</h2>
          <p className="mt-4 max-w-xl text-sm leading-7 text-porcelain/55">{isEnglish ? "Iboren helps customers create clear cleaning requests in Södertälje and Stockholm." : "Iboren hjälper kunder skapa tydliga bokningsförfrågningar för städning i Södertälje och Stockholm."}</p>
        </div>
        <div className="grid gap-5 sm:grid-cols-2">
          <div>
            <p className="mb-3 text-xs font-black uppercase tracking-[.22em] text-gold">{isEnglish ? "Important pages" : "Viktiga sidor"}</p>
            <div className="flex flex-wrap gap-2">
              {sectionLinks.map((link) => (
                <Link key={link.href + link.label} href={link.href} className="rounded-full border border-gold/20 px-4 py-2 text-sm font-semibold text-porcelain/70 hover:border-gold hover:text-gold">
                  {link.label}
                </Link>
              ))}
            </div>
          </div>
          <div>
            <p className="mb-3 text-xs font-black uppercase tracking-[.22em] text-gold">{isEnglish ? "Popular searches" : "Populära sökningar"}</p>
            <div className="flex flex-wrap gap-2">
              {searchLinks.map((link) => (
                <Link key={link.label} href={link.href} className="rounded-full border border-porcelain/10 px-4 py-2 text-sm font-semibold text-porcelain/55 hover:border-gold hover:text-gold">
                  {link.label}
                </Link>
              ))}
            </div>
          </div>
        </div>
      </div>
      </section>
    </>
  );
}
