"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect } from "react";

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

const keywordLinks = [
  { href: "/stadning-sodertalje", label: "Hemstädning Södertälje" },
  { href: "/stadning-sodertalje", label: "Flyttstädning Södertälje" },
  { href: "/stadning-sodertalje", label: "Städfirma Södertälje" },
  { href: "/stadning-sodertalje", label: "Fönsterputs Södertälje" },
  { href: "/stadning-stockholm", label: "Kontorsstädning Stockholm" },
  { href: "/stadning-stockholm", label: "Städfirma Stockholm" }
];

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

  const profileLink = createSuccessLink(
    "/profile",
    "Gå till min profil",
    "inline-flex items-center justify-center rounded-full bg-gold px-4 py-3 text-sm font-black uppercase tracking-[.12em] text-ink"
  );

  const newBookingLink = createSuccessLink(
    "/#booking",
    "Ny bokning",
    "inline-flex items-center justify-center rounded-full border border-gold/40 px-4 py-3 text-sm font-bold text-gold"
  );
  newBookingLink.addEventListener("click", (event) => {
    event.preventDefault();
    window.location.href = "/#booking";
    window.location.reload();
  });

  wrapper.append(profileLink, newBookingLink);
  afterElement.insertAdjacentElement("afterend", wrapper);
}

function enhanceBookingSuccess() {
  const bookingSection = document.querySelector("#booking");
  const form = bookingSection?.querySelector("form");
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

export default function SeoInternalLinks() {
  const pathname = usePathname();

  useEffect(() => {
    enhanceBookingSuccess();
    const observer = new MutationObserver(enhanceBookingSuccess);
    observer.observe(document.documentElement, { childList: true, subtree: true, characterData: true });
    return () => observer.disconnect();
  }, []);

  if (hiddenPrefixes.some((prefix) => pathname?.startsWith(prefix))) return null;

  return (
    <section aria-label="Populära städsidor" className="border-t border-gold/10 bg-night py-10 text-porcelain">
      <div className="luxe-container grid gap-8 md:grid-cols-[1fr_1.2fr] md:items-start">
        <div>
          <p className="text-[10px] font-bold uppercase tracking-[.32em] text-gold/70">Lokala städtjänster</p>
          <h2 className="display mt-3 text-3xl font-normal uppercase text-porcelain md:text-4xl">Hitta rätt städning snabbare.</h2>
          <p className="mt-4 max-w-xl text-sm leading-7 text-porcelain/55">Iboren hjälper kunder skapa tydliga bokningsförfrågningar för städning i Södertälje och Stockholm.</p>
        </div>
        <div className="grid gap-5 sm:grid-cols-2">
          <div>
            <p className="mb-3 text-xs font-black uppercase tracking-[.22em] text-gold">Viktiga sidor</p>
            <div className="flex flex-wrap gap-2">
              {localLinks.map((link) => (
                <Link key={link.href + link.label} href={link.href} className="rounded-full border border-gold/20 px-4 py-2 text-sm font-semibold text-porcelain/70 hover:border-gold hover:text-gold">
                  {link.label}
                </Link>
              ))}
            </div>
          </div>
          <div>
            <p className="mb-3 text-xs font-black uppercase tracking-[.22em] text-gold">Populära sökningar</p>
            <div className="flex flex-wrap gap-2">
              {keywordLinks.map((link) => (
                <Link key={link.label} href={link.href} className="rounded-full border border-porcelain/10 px-4 py-2 text-sm font-semibold text-porcelain/55 hover:border-gold hover:text-gold">
                  {link.label}
                </Link>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
