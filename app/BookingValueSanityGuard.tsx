"use client";

import { useEffect } from "react";

function cleanText(value: unknown) {
  return String(value ?? "").replace(/\s+/g, " ").trim();
}

function normalize(value: unknown) {
  return cleanText(value).toLowerCase();
}

function numberValue(value: unknown) {
  const parsed = Number.parseInt(cleanText(value).replace(/[^0-9-]/g, ""), 10);
  return Number.isFinite(parsed) ? parsed : null;
}

function nativeSetValue(element: HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement, value: string) {
  const prototype = Object.getPrototypeOf(element);
  const setter = Object.getOwnPropertyDescriptor(prototype, "value")?.set;
  setter?.call(element, value);
  element.dispatchEvent(new Event("input", { bubbles: true }));
  element.dispatchEvent(new Event("change", { bubbles: true }));
}

function findControlByLabel(form: HTMLElement, labels: string[]) {
  const wanted = labels.map(normalize);
  const label = Array.from(form.querySelectorAll<HTMLLabelElement>("label")).find((item) => {
    const labelText = normalize(item.textContent);
    return wanted.some((candidate) => labelText === candidate || labelText.startsWith(candidate));
  });
  return label?.querySelector("input, textarea, select") as HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement | null;
}

function maxBathroomsForSize(size: number | null) {
  if (!size) return 10;
  if (size <= 60) return 2;
  if (size <= 100) return 3;
  if (size <= 150) return 4;
  if (size <= 220) return 5;
  return 10;
}

function cleanBookingValues() {
  const form = document.querySelector<HTMLElement>("#booking form");
  if (!form) return;

  const sizeControl = findControlByLabel(form, ["Storlek kvm", "Size", "Size sqm", "Size (sqm)"]);
  const roomsControl = findControlByLabel(form, ["Antal rum", "Rooms"]);
  const bathroomsControl = findControlByLabel(form, ["Antal badrum", "Bathrooms"]);
  const floorControl = findControlByLabel(form, ["Våning", "Floor"]);

  const size = numberValue(sizeControl?.value);
  const rooms = numberValue(roomsControl?.value);
  const bathrooms = numberValue(bathroomsControl?.value);
  const floor = numberValue(floorControl?.value);

  if (roomsControl && rooms !== null && (rooms < 1 || rooms > 20)) nativeSetValue(roomsControl, "");
  if (bathroomsControl && bathrooms !== null && (bathrooms < 1 || bathrooms > maxBathroomsForSize(size))) nativeSetValue(bathroomsControl, "");
  if (floorControl && floor !== null && (floor < 0 || floor > 60)) nativeSetValue(floorControl, "");
}

export default function BookingValueSanityGuard() {
  useEffect(() => {
    const timers = [700, 1200, 2200, 3600, 5200].map((delay) => window.setTimeout(cleanBookingValues, delay));
    return () => timers.forEach((timer) => window.clearTimeout(timer));
  }, []);

  return null;
}
