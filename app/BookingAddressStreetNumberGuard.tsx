"use client";

import { useEffect } from "react";

function isEnglishPage() {
  return window.location.pathname.startsWith("/en");
}

function addressHasStreetNumber(address: string) {
  const streetPart = address.split(",")[0] || address;
  return /\b\d+[A-Za-zÅÄÖåäö]?\b/.test(streetPart);
}

function message() {
  return isEnglishPage()
    ? "Add the street number to the address before sending the request."
    : "Lägg till gatunummer i adressen innan du skickar förfrågan.";
}

function fieldContainer(input: HTMLInputElement) {
  return input.closest("label") || input.parentElement?.parentElement || input.parentElement || input;
}

function showAddressError(input: HTMLInputElement) {
  const container = fieldContainer(input);
  let node = container.querySelector<HTMLParagraphElement>('[data-iboren-error="address-street-number"]');
  if (!node) {
    node = document.createElement("p");
    node.dataset.iborenError = "address-street-number";
    node.className = "mt-2 rounded-xl bg-red-500/10 px-3 py-2 text-xs font-bold text-red-200";
    container.appendChild(node);
  }

  node.textContent = message();
  node.style.display = "block";
  input.setAttribute("aria-invalid", "true");
  input.classList.add("ring-2", "ring-red-400");
  input.focus();
  input.scrollIntoView({ behavior: "smooth", block: "center" });
}

function clearAddressError(input: HTMLInputElement) {
  const container = fieldContainer(input);
  const node = container.querySelector<HTMLParagraphElement>('[data-iboren-error="address-street-number"]');
  if (node) node.style.display = "none";
  input.removeAttribute("aria-invalid");
  input.classList.remove("ring-2", "ring-red-400");
}

function validateAddress(input: HTMLInputElement) {
  const value = input.value.trim();
  if (!value || addressHasStreetNumber(value)) {
    clearAddressError(input);
    return true;
  }

  showAddressError(input);
  return false;
}

export default function BookingAddressStreetNumberGuard() {
  useEffect(() => {
    const onSubmit = (event: SubmitEvent) => {
      const form = event.target as HTMLFormElement | null;
      if (!form) return;
      const input = form.querySelector<HTMLInputElement>("#booking-address");
      if (!input) return;
      if (validateAddress(input)) return;

      event.preventDefault();
      event.stopImmediatePropagation();
    };

    const onInput = (event: Event) => {
      const input = event.target as HTMLInputElement | null;
      if (!input || input.id !== "booking-address") return;
      validateAddress(input);
    };

    document.addEventListener("submit", onSubmit, true);
    document.addEventListener("input", onInput, true);

    return () => {
      document.removeEventListener("submit", onSubmit, true);
      document.removeEventListener("input", onInput, true);
    };
  }, []);

  return null;
}
