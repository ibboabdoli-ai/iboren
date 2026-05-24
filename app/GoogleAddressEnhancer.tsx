"use client";

import { useEffect } from "react";

declare global {
  interface Window {
    google?: any;
    __iborenGoogleMapsLoading?: Promise<void>;
  }
}

const GOOGLE_MAPS_SCRIPT_ID = "iboren-google-maps-places";
const ADDRESS_SELECTORS = ['input[placeholder="Gatuadress"]', 'input[placeholder="Street address"]'];
const AREA_SELECTORS = ['input[placeholder="Stockholm, Södertälje..."]'];

function loadGooglePlaces(apiKey: string) {
  if (typeof window === "undefined") return Promise.resolve();
  if (window.google?.maps?.places) return Promise.resolve();
  if (window.__iborenGoogleMapsLoading) return window.__iborenGoogleMapsLoading;

  window.__iborenGoogleMapsLoading = new Promise<void>((resolve, reject) => {
    const existing = document.getElementById(GOOGLE_MAPS_SCRIPT_ID) as HTMLScriptElement | null;
    if (existing) {
      existing.addEventListener("load", () => resolve(), { once: true });
      existing.addEventListener("error", () => reject(new Error("Google Maps script failed to load.")), { once: true });
      return;
    }

    const script = document.createElement("script");
    script.id = GOOGLE_MAPS_SCRIPT_ID;
    script.async = true;
    script.defer = true;
    script.src = `https://maps.googleapis.com/maps/api/js?key=${encodeURIComponent(apiKey)}&libraries=places&loading=async`;
    script.onload = () => resolve();
    script.onerror = () => reject(new Error("Google Maps script failed to load."));
    document.head.appendChild(script);
  });

  return window.__iborenGoogleMapsLoading;
}

function setNativeInputValue(input: HTMLInputElement, value: string) {
  const setter = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, "value")?.set;
  setter?.call(input, value);
  input.dispatchEvent(new Event("input", { bubbles: true }));
  input.dispatchEvent(new Event("change", { bubbles: true }));
}

function addressComponent(place: any, types: string[]) {
  const component = (place?.address_components || []).find((item: any) => types.some((type) => item.types?.includes(type)));
  return component?.long_name || "";
}

function cityFromPlace(place: any) {
  return addressComponent(place, ["postal_town"]) || addressComponent(place, ["locality"]) || addressComponent(place, ["administrative_area_level_2"]) || addressComponent(place, ["administrative_area_level_1"]);
}

function attachAutocomplete(input: HTMLInputElement) {
  if (input.dataset.iborenGoogleAutocomplete === "1") return;
  if (!window.google?.maps?.places?.Autocomplete) return;
  input.dataset.iborenGoogleAutocomplete = "1";

  const autocomplete = new window.google.maps.places.Autocomplete(input, {
    componentRestrictions: { country: "se" },
    fields: ["formatted_address", "address_components"],
    types: ["address"]
  });

  autocomplete.addListener("place_changed", () => {
    const place = autocomplete.getPlace();
    const formattedAddress = place?.formatted_address || input.value;
    if (formattedAddress) setNativeInputValue(input, formattedAddress);

    const form = input.closest("form");
    const areaInput = AREA_SELECTORS.map((selector) => form?.querySelector(selector) as HTMLInputElement | null).find(Boolean);
    const city = cityFromPlace(place);
    if (areaInput && city) setNativeInputValue(areaInput, city);
  });
}

function attachAll() {
  ADDRESS_SELECTORS.forEach((selector) => {
    document.querySelectorAll<HTMLInputElement>(selector).forEach(attachAutocomplete);
  });
}

export default function GoogleAddressEnhancer() {
  useEffect(() => {
    const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;
    if (!apiKey) return;

    let observer: MutationObserver | null = null;
    loadGooglePlaces(apiKey)
      .then(() => {
        attachAll();
        observer = new MutationObserver(() => attachAll());
        observer.observe(document.body, { childList: true, subtree: true });
      })
      .catch(() => undefined);

    return () => observer?.disconnect();
  }, []);

  return null;
}
