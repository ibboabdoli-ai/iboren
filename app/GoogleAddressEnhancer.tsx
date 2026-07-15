"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";

declare global {
  interface Window {
    google?: any;
    initIborenGooglePlaces?: () => void;
    __iborenGoogleMapsLoading?: Promise<void>;
  }
}

const GOOGLE_MAPS_SCRIPT_ID = "iboren-google-maps-places";
const ADDRESS_SELECTORS = [
  'input[placeholder="Gatuadress"]',
  'input[placeholder="Gatuadress och nummer"]',
  'input[placeholder="Street address"]',
  'input[placeholder="Street address and number"]'
];
const AREA_SELECTORS = [
  'input[placeholder="Stockholm, Södertälje..."]',
  'input[placeholder="Södertälje"]'
];
const ADDRESS_LABELS = ["adress", "address"];
const AREA_LABELS = ["område", "area"];

function loadGooglePlaces(apiKey: string) {
  if (typeof window === "undefined") return Promise.resolve();
  if (window.google?.maps?.places?.Autocomplete) return Promise.resolve();
  if (window.__iborenGoogleMapsLoading) return window.__iborenGoogleMapsLoading;

  window.__iborenGoogleMapsLoading = new Promise<void>((resolve, reject) => {
    const finish = () => {
      if (window.google?.maps?.places?.Autocomplete) resolve();
      else reject(new Error("Google Places Autocomplete did not load."));
    };

    window.initIborenGooglePlaces = finish;

    const existing = document.getElementById(GOOGLE_MAPS_SCRIPT_ID) as HTMLScriptElement | null;
    if (existing) {
      let tries = 0;
      const timer = window.setInterval(() => {
        tries += 1;
        if (window.google?.maps?.places?.Autocomplete) {
          window.clearInterval(timer);
          resolve();
        }
        if (tries > 40) {
          window.clearInterval(timer);
          reject(new Error("Google Maps script timeout."));
        }
      }, 250);
      return;
    }

    const script = document.createElement("script");
    script.id = GOOGLE_MAPS_SCRIPT_ID;
    script.async = true;
    script.defer = true;
    script.src = `https://maps.googleapis.com/maps/api/js?key=${encodeURIComponent(apiKey)}&libraries=places&callback=initIborenGooglePlaces`;
    script.onerror = () => reject(new Error("Google Maps script failed to load."));
    document.head.appendChild(script);
  });

  return window.__iborenGoogleMapsLoading;
}

function setNativeInputValue(input: HTMLInputElement, value: string) {
  const setter = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, "value")?.set;
  setter?.call(input, value);
  input.dispatchEvent(new InputEvent("input", { bubbles: true, inputType: "insertReplacementText", data: value }));
  input.dispatchEvent(new Event("change", { bubbles: true }));
}

function addressComponent(place: any, types: string[]) {
  const component = (place?.address_components || []).find((item: any) => types.some((type) => item.types?.includes(type)));
  return component?.long_name || "";
}

function cityFromPlace(place: any) {
  return addressComponent(place, ["postal_town"]) || addressComponent(place, ["locality"]) || addressComponent(place, ["administrative_area_level_2"]) || addressComponent(place, ["administrative_area_level_1"]);
}

function labelMatches(label: HTMLLabelElement, labels: string[]) {
  const text = (label.textContent || "").toLowerCase();
  return labels.some((labelText) => text.includes(labelText));
}

function inputsByLabel(labels: string[], root: ParentNode = document) {
  return Array.from(root.querySelectorAll<HTMLLabelElement>("label"))
    .filter((label) => labelMatches(label, labels))
    .map((label) => label.querySelector<HTMLInputElement>('input[type="text"], input:not([type])'))
    .filter((input): input is HTMLInputElement => Boolean(input));
}

function areaInputForForm(form: HTMLFormElement | null) {
  if (!form) return null;
  return AREA_SELECTORS.map((selector) => form.querySelector(selector) as HTMLInputElement | null).find(Boolean) || inputsByLabel(AREA_LABELS, form)[0] || null;
}

function attachAutocomplete(input: HTMLInputElement) {
  if (input.dataset.iborenGoogleAutocomplete === "1") return;
  if (!window.google?.maps?.places?.Autocomplete) return;
  input.dataset.iborenGoogleAutocomplete = "1";
  input.setAttribute("autocomplete", "off");

  const autocomplete = new window.google.maps.places.Autocomplete(input, {
    componentRestrictions: { country: "se" },
    fields: ["formatted_address", "address_components"],
    types: ["address"]
  });

  autocomplete.addListener("place_changed", () => {
    const place = autocomplete.getPlace();
    const formattedAddress = place?.formatted_address || input.value;
    if (formattedAddress) setNativeInputValue(input, formattedAddress);

    const city = cityFromPlace(place);
    const areaInput = areaInputForForm(input.closest("form"));
    if (areaInput && city) setNativeInputValue(areaInput, city);
  });
}

function collectAddressInputs() {
  const bySelector = ADDRESS_SELECTORS.flatMap((selector) => Array.from(document.querySelectorAll<HTMLInputElement>(selector)));
  const byLabel = inputsByLabel(ADDRESS_LABELS);
  return Array.from(new Set([...bySelector, ...byLabel]));
}

function attachAll() {
  collectAddressInputs().forEach(attachAutocomplete);
}

export default function GoogleAddressEnhancer() {
  const pathname = usePathname();
  const isBookingPage = pathname === "/boka-utan-konto" || pathname === "/en/boka-utan-konto";

  useEffect(() => {
    if (!isBookingPage) return;
    const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;
    if (!apiKey) return;

    let observer: MutationObserver | null = null;
    let retryTimer: number | null = null;
    let retryTimeout: number | null = null;
    let cancelled = false;

    loadGooglePlaces(apiKey)
      .then(() => {
        if (cancelled) return;
        attachAll();
        retryTimer = window.setInterval(attachAll, 1000);
        retryTimeout = window.setTimeout(() => { if (retryTimer) window.clearInterval(retryTimer); }, 15000);
        observer = new MutationObserver(() => attachAll());
        observer.observe(document.body, { childList: true, subtree: true, attributes: true, attributeFilter: ["placeholder", "value"] });
      })
      .catch((error) => console.warn("Iboren Google address autocomplete disabled:", error));

    return () => {
      cancelled = true;
      observer?.disconnect();
      if (retryTimer) window.clearInterval(retryTimer);
      if (retryTimeout) window.clearTimeout(retryTimeout);
    };
  }, [isBookingPage]);

  return null;
}
