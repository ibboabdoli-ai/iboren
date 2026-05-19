"use client";

import { useEffect } from "react";

function isBookingSuccessText(text: string) {
  const normalized = text.toLowerCase();
  return normalized.includes("bokningen är sparad") || normalized.includes("bokningsförfrågan är sparad") || normalized.includes("tack!");
}

function createActionLink(href: string, label: string, className: string) {
  const link = document.createElement("a");
  link.href = href;
  link.textContent = label;
  link.className = className;
  return link;
}

function buildSuccessActions() {
  const wrapper = document.createElement("div");
  wrapper.id = "iboren-booking-success-actions";
  wrapper.className = "mt-3 grid gap-2 sm:grid-cols-2";

  const profileLink = createActionLink(
    "/profile",
    "Gå till min profil",
    "inline-flex items-center justify-center rounded-full bg-gold px-4 py-3 text-sm font-black uppercase tracking-[.12em] text-ink"
  );

  const newBookingLink = createActionLink(
    "/#booking",
    "Ny bokning",
    "inline-flex items-center justify-center rounded-full border border-gold/40 px-4 py-3 text-sm font-bold text-gold"
  );
  newBookingLink.dataset.iborenNewBooking = "1";

  wrapper.append(profileLink, newBookingLink);
  return wrapper;
}

function enhanceBookingSuccess() {
  const bookingSection = document.querySelector("#booking");
  if (!bookingSection) return;

  const form = bookingSection.querySelector("form");
  if (!form) return;

  const messages = Array.from(form.querySelectorAll("p"));
  const successMessage = messages.find((node) => isBookingSuccessText(node.textContent || ""));
  if (!successMessage) return;

  const submitButton = form.querySelector<HTMLButtonElement>('button[type="submit"], button:not([type])');
  if (submitButton) {
    submitButton.disabled = true;
    submitButton.setAttribute("aria-disabled", "true");
    submitButton.classList.add("opacity-80", "cursor-not-allowed");
    submitButton.textContent = "Bokning skickad";
  }

  if (!form.querySelector("#iboren-booking-success-actions")) {
    successMessage.insertAdjacentElement("afterend", buildSuccessActions());
  }

  const newBookingLink = form.querySelector<HTMLAnchorElement>('[data-iboren-new-booking="1"]');
  if (newBookingLink && !newBookingLink.dataset.ready) {
    newBookingLink.dataset.ready = "1";
    newBookingLink.addEventListener("click", (event) => {
      event.preventDefault();
      window.location.href = "/#booking";
      window.location.reload();
    });
  }
}

export default function BookingSuccessUx() {
  useEffect(() => {
    enhanceBookingSuccess();
    const observer = new MutationObserver(enhanceBookingSuccess);
    observer.observe(document.documentElement, { childList: true, subtree: true, characterData: true });
    return () => observer.disconnect();
  }, []);

  return null;
}
