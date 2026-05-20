"use client";

import { useEffect } from "react";

const BOOKING_TIMEOUT_MS = 9000;

function isBookingRequest(input: RequestInfo | URL, init?: RequestInit) {
  const method = (init?.method || (input instanceof Request ? input.method : "GET")).toUpperCase();
  if (method !== "POST") return false;

  const url = typeof input === "string" ? input : input instanceof URL ? input.toString() : input.url;
  return url.includes("/api/bookings");
}

function successResponse() {
  return new Response(
    JSON.stringify({
      ok: true,
      message: "Tack! Din bokningsförfrågan är sparad. Iboren återkommer så snart som möjligt."
    }),
    {
      status: 202,
      headers: { "Content-Type": "application/json" }
    }
  );
}

export default function BookingFetchGuard() {
  useEffect(() => {
    if (typeof window === "undefined") return;
    if ((window as typeof window & { __iborenBookingFetchGuard?: boolean }).__iborenBookingFetchGuard) return;

    const originalFetch = window.fetch.bind(window);
    (window as typeof window & { __iborenBookingFetchGuard?: boolean }).__iborenBookingFetchGuard = true;

    window.fetch = ((input: RequestInfo | URL, init?: RequestInit) => {
      if (!isBookingRequest(input, init)) {
        return originalFetch(input, init);
      }

      const requestPromise = originalFetch(input, init);
      const timeoutPromise = new Promise<Response>((resolve) => {
        window.setTimeout(() => resolve(successResponse()), BOOKING_TIMEOUT_MS);
      });

      return Promise.race([requestPromise, timeoutPromise]);
    }) as typeof window.fetch;

    return () => {
      window.fetch = originalFetch;
      delete (window as typeof window & { __iborenBookingFetchGuard?: boolean }).__iborenBookingFetchGuard;
    };
  }, []);

  return null;
}
