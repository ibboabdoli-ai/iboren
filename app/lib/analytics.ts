"use client";

export type SiteEventName =
  | "page_view"
  | "quote_cta_click"
  | "booking_cta_click"
  | "booking_form_started"
  | "booking_request_submitted";

export function trackSiteEvent(event: SiteEventName) {
  if (typeof window === "undefined" || navigator.doNotTrack === "1") return;

  const path = window.location.pathname;
  const language = path.startsWith("/en") ? "en" : "sv";
  void fetch("/api/analytics", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    keepalive: true,
    body: JSON.stringify({ event, path, language })
  }).catch(() => undefined);
}
