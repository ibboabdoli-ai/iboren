"use client";

import { useEffect } from "react";

function insertNotice(form: HTMLFormElement, text: string) {
  if (form.querySelector("[data-iboren-privacy-notice='1']")) return;
  const submitButton = form.querySelector("button[type='submit'], button:not([type])");
  if (!submitButton?.parentElement) return;

  const notice = document.createElement("p");
  notice.dataset.iborenPrivacyNotice = "1";
  notice.className = "rounded-2xl border border-porcelain/10 bg-porcelain/8 px-4 py-3 text-xs leading-6 text-porcelain/60";
  notice.textContent = text;
  submitButton.parentElement.insertBefore(notice, submitButton);
}

export default function BookingPrivacyNotice() {
  useEffect(() => {
    const isEnglish = window.location.pathname === "/en" || window.location.pathname.startsWith("/en/");
    const text = isEnglish
      ? "We use the details in your request to calculate the price, handle the booking request and improve our services."
      : "Vi använder uppgifterna i din förfrågan för att beräkna pris, hantera bokningsförfrågan och förbättra våra tjänster.";

    const apply = () => {
      document.querySelectorAll("section#booking form").forEach((form) => insertNotice(form as HTMLFormElement, text));
    };

    apply();
    const observer = new MutationObserver(apply);
    observer.observe(document.body, { childList: true, subtree: true });
    return () => observer.disconnect();
  }, []);

  return null;
}
