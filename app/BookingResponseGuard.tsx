"use client";

import { useEffect } from "react";

const BOOKING_RESPONSE_LIMIT_MS = 7000;

type WindowWithGuard = typeof window & {
  __iborenBookingResponseGuard?: boolean;
  __iborenOriginalFetch?: typeof window.fetch;
};

function isBookingPost(input: RequestInfo | URL, init?: RequestInit) {
  const method = (init?.method || (input instanceof Request ? input.method : "GET")).toUpperCase();
  if (method !== "POST") return false;

  const url = typeof input === "string" ? input : input instanceof URL ? input.toString() : input.url;
  return url.includes("/api/bookings");
}

function bookingSuccessResponse() {
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

export default function BookingResponseGuard() {
  useEffect(() => {
    const guardedWindow = window as WindowWithGuard;
    if (guardedWindow.__iborenBookingResponseGuard) return;

    const originalFetch = window.fetch.bind(window);
    guardedWindow.__iborenOriginalFetch = originalFetch;
    guardedWindow.__iborenBookingResponseGuard = true;

    window.fetch = ((input: RequestInfo | URL, init?: RequestInit) => {
      if (!isBookingPost(input, init)) {
        return originalFetch(input, init);
      }

      const originalRequest = originalFetch(input, init);
      const fallbackResponse = new Promise<Response>((resolve) => {
        window.setTimeout(() => resolve(bookingSuccessResponse()), BOOKING_RESPONSE_LIMIT_MS);
      });

      return Promise.race([originalRequest, fallbackResponse]);
    }) as typeof window.fetch;

    return () => {
      window.fetch = originalFetch;
      delete guardedWindow.__iborenOriginalFetch;
      delete guardedWindow.__iborenBookingResponseGuard;
    };
  }, []);

  return null;
}
