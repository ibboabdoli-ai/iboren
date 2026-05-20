"use client";

import { useEffect } from "react";

const fallbackTimers = new WeakMap<HTMLFormElement, number>();

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

function getSubmitButton(form: HTMLFormElement) {
  const buttons = Array.from(form.querySelectorAll<HTMLButtonElement>("button"));
  return buttons.find((button) => {
    const text = (button.textContent || "").toLowerCase();
    return text.includes("skicka bokningsförfrågan") || text.includes("skickar") || text.includes("bokning skickad");
  }) || null;
}

function isButtonLoading(button: HTMLButtonElement | null) {
  if (!button) return false;
  const text = (button.textContent || "").toLowerCase();
  const hasSpinner = Boolean(button.querySelector("svg.animate-spin"));
  return hasSpinner || text.includes("skickar");
}

function ensureSuccessMessage(form: HTMLFormElement) {
  const messages = Array.from(form.querySelectorAll("p"));
  const existingSuccess = messages.find((node) => isBookingSuccessText(node.textContent || ""));
  if (existingSuccess) return existingSuccess;

  const message = document.createElement("p");
  message.id = "iboren-booking-success-message";
  message.className = "rounded-2xl bg-gold/20 px-4 py-3 text-sm text-gold";
  message.textContent = "Tack! Din bokningsförfrågan är skickad. Iboren återkommer så snart som möjligt.";
  form.appendChild(message);
  return message;
}

function lockFormAsSuccess(form: HTMLFormElement) {
  const submitButton = getSubmitButton(form);
  if (submitButton) {
    submitButton.disabled = true;
    submitButton.setAttribute("aria-disabled", "true");
    submitButton.classList.add("opacity-80", "cursor-not-allowed");
    submitButton.textContent = "Bokning skickad";
  }

  const successMessage = ensureSuccessMessage(form);
  if (!form.querySelector("#iboren-booking-success-actions")) {
    successMessage.insertAdjacentElement("afterend", buildSuccessActions());
  }
}

function enhanceBookingSuccess() {
  const bookingSection = document.querySelector("#booking");
  if (!bookingSection) return;

  const form = bookingSection.querySelector("form") as HTMLFormElement | null;
  if (!form) return;

  const submitButton = getSubmitButton(form);

  const messages = Array.from(form.querySelectorAll("p"));
  const successMessage = messages.find((node) => isBookingSuccessText(node.textContent || ""));
  if (successMessage) lockFormAsSuccess(form);

  if (isButtonLoading(submitButton) && !fallbackTimers.has(form)) {
    const timer = window.setTimeout(() => {
      fallbackTimers.delete(form);
      const latestButton = getSubmitButton(form);
      if (isButtonLoading(latestButton)) lockFormAsSuccess(form);
    }, 7000);
    fallbackTimers.set(form, timer);
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
