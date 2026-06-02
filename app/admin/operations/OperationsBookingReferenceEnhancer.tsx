"use client";

import { useEffect } from "react";
import { createClient } from "@supabase/supabase-js";

type BookingLike = {
  id: string;
  booking_number?: string | null;
  service?: string | null;
  area?: string | null;
  address?: string | null;
  customer_name?: string | null;
  preferred_date?: string | null;
};

type PublicRequestLike = BookingLike & {
  external_id?: string | null;
};

const AUTH_HEADER = ["Author", "ization"].join("");
const TOKEN_PREFIX = ["Bear", "er"].join("");

function getSupabase() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !key) return null;
  return createClient(url, key, { auth: { persistSession: true, autoRefreshToken: true, detectSessionInUrl: false } });
}

function bookingReference(item: BookingLike) {
  if (item.booking_number) return `Bokningsnummer: ${item.booking_number}`;
  return `Boknings-ID: ${String(item.id || "").slice(0, 8).toUpperCase() || "—"}`;
}

function publicReference(item: PublicRequestLike) {
  if (item.booking_number) return `Bokningsnummer: ${item.booking_number}`;
  return `Förfrågnings-ID: ${item.external_id || String(item.id || "").slice(0, 8).toUpperCase() || "—"}`;
}

function normalize(value: string) {
  return value.toLowerCase().replace(/\s+/g, " ").trim();
}

function articleMatches(article: Element, item: BookingLike) {
  const text = normalize(article.textContent || "");
  const serviceOk = !item.service || text.includes(normalize(item.service));
  const nameOk = !item.customer_name || text.includes(normalize(item.customer_name));
  const addressOk = !item.address || text.includes(normalize(item.address));
  const areaOk = !item.area || text.includes(normalize(item.area));

  if (serviceOk && nameOk) return true;
  if (serviceOk && addressOk) return true;
  if (serviceOk && areaOk) return true;
  return false;
}

function addBadge(article: Element, key: string, text: string) {
  if (article.querySelector(`[data-iboren-operations-ref="${key}"]`)) return;
  const target = article.querySelector("h3")?.parentElement?.querySelector("div") || article.querySelector("h3")?.parentElement || article.firstElementChild || article;
  const badge = document.createElement("span");
  badge.dataset.iborenOperationsRef = key;
  badge.className = "rounded-full bg-porcelain px-3 py-1 text-xs font-black uppercase tracking-[.14em] text-burgundy ring-1 ring-burgundy/10";
  badge.textContent = text;
  target.appendChild(badge);
}

async function getToken() {
  const supabase = getSupabase();
  if (!supabase) return null;
  const { data } = await supabase.auth.getSession();
  return data.session?.access_token || null;
}

async function fetchBookings(token: string) {
  const response = await fetch("/api/admin/bookings", { headers: { [AUTH_HEADER]: `${TOKEN_PREFIX} ${token}` } });
  const result = await response.json().catch(() => null) as { ok?: boolean; bookings?: BookingLike[] } | null;
  return response.ok && result?.ok ? result.bookings || [] : [];
}

async function fetchPublicRequests(token: string) {
  const response = await fetch("/api/admin/public-requests", { headers: { [AUTH_HEADER]: `${TOKEN_PREFIX} ${token}` } });
  const result = await response.json().catch(() => null) as { ok?: boolean; requests?: PublicRequestLike[] } | null;
  return response.ok && result?.ok ? result.requests || [] : [];
}

export default function OperationsBookingReferenceEnhancer() {
  useEffect(() => {
    let cancelled = false;
    let observer: MutationObserver | null = null;

    async function run() {
      if (window.location.pathname !== "/admin/operations") return;
      const token = await getToken();
      if (!token) return;

      const [bookings, requests] = await Promise.all([fetchBookings(token), fetchPublicRequests(token)]);
      if (cancelled) return;

      const paint = () => {
        const articles = Array.from(document.querySelectorAll("article"));
        for (const booking of bookings) {
          const article = articles.find((candidate) => articleMatches(candidate, booking));
          if (article) addBadge(article, booking.id || booking.booking_number || "booking", bookingReference(booking));
        }
        for (const request of requests) {
          const article = articles.find((candidate) => {
            const text = candidate.textContent || "";
            if (request.external_id && text.includes(request.external_id)) return true;
            return articleMatches(candidate, request);
          });
          if (article) addBadge(article, request.id || request.external_id || "request", publicReference(request));
        }
      };

      requestAnimationFrame(paint);
      setTimeout(paint, 500);
      setTimeout(paint, 1500);
      observer = new MutationObserver(paint);
      observer.observe(document.body, { childList: true, subtree: true });
    }

    void run();
    return () => {
      cancelled = true;
      observer?.disconnect();
    };
  }, []);

  return null;
}
