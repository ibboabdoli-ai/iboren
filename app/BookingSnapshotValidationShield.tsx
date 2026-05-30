"use client";

import { useEffect } from "react";

function shieldCalculatorSnapshotLabels(notes: string) {
  const marker = "--- Calculator snapshot ---";
  const finalMarker = "--- Final booking submitted ---";
  const markerIndex = notes.indexOf(marker);
  if (markerIndex < 0) return notes;

  const before = notes.slice(0, markerIndex);
  const afterMarker = notes.slice(markerIndex);
  const finalIndex = afterMarker.indexOf(finalMarker);
  const snapshot = finalIndex >= 0 ? afterMarker.slice(0, finalIndex) : afterMarker;
  const rest = finalIndex >= 0 ? afterMarker.slice(finalIndex) : "";

  const safeSnapshot = snapshot
    .replace(/^Antal rum:\s*/gim, "Antal rum (calculator): ")
    .replace(/^Rooms:\s*/gim, "Rooms (calculator): ")
    .replace(/^Number of rooms:\s*/gim, "Number of rooms (calculator): ")
    .replace(/^Antal badrum:\s*/gim, "Antal badrum (calculator): ")
    .replace(/^Bathrooms:\s*/gim, "Bathrooms (calculator): ")
    .replace(/^Number of bathrooms:\s*/gim, "Number of bathrooms (calculator): ")
    .replace(/^Våning:\s*/gim, "Våning (calculator): ")
    .replace(/^Floor:\s*/gim, "Floor (calculator): ");

  return `${before}${safeSnapshot}${rest}`;
}

function shieldBookingBody(body: Record<string, unknown>) {
  if (typeof body.notes !== "string") return body;
  const nextNotes = shieldCalculatorSnapshotLabels(body.notes);
  if (nextNotes === body.notes) return body;
  return { ...body, notes: nextNotes };
}

export default function BookingSnapshotValidationShield() {
  useEffect(() => {
    const previousFetch = window.fetch.bind(window);

    window.fetch = ((input: RequestInfo | URL, init?: RequestInit) => {
      const url = typeof input === "string" ? input : input instanceof URL ? input.toString() : input.url;
      const method = init?.method?.toUpperCase();

      if (url.includes("/api/bookings") && method === "POST" && typeof init?.body === "string") {
        try {
          const body = JSON.parse(init.body) as Record<string, unknown>;
          init = { ...init, body: JSON.stringify(shieldBookingBody(body)) };
        } catch {
          // Never block booking submission if snapshot label shielding fails.
        }
      }

      return previousFetch(input, init);
    }) as typeof window.fetch;

    return () => {
      window.fetch = previousFetch;
    };
  }, []);

  return null;
}
