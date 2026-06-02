"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";
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

function referenceText(item: BookingLike, fallbackLabel = "Boknings-ID") {
  if (item.booking_number) return `Bokningsnummer: ${item.booking_number}`;
  return `${fallbackLabel}: ${String(item.id || "").slice(0, 8) || "—"}`;
}

function articleMatches(article: Element, item: BookingLike) {
  const text = article.textContent || "";
  const anchors = [item.service, item.customer_name, item.preferred_date].filter(Boolean) as string[];
  if (anchors.length && !anchors.every((value) => text.includes(value))) return false;
  if (item.address && text.includes(item.address)) return true;
  if (item.area && text.includes(item.area)) return true;
  if (!item.address && !item.area) return true;
  return anchors.length > 0;
}

function addBadge(article: Element, key: string, text: string) {
  if (article.querySelector(`[data-iboren-booking-number="${key}"]`)) return;
  const target = article.querySelector("h2, h3")?.parentElement || article.firstElementChild || article;
  const badge = document.createElement("p");
  badge.dataset.iborenBookingNumber = key;
  badge.className = "mt-2 inline-flex rounded-full bg-gold/20 px-3 py-1 text-xs font-black uppercase tracking-[.14em] text-burgundy ring-1 ring-gold/30";
  badge.textContent = text;
  target.appendChild(badge);
}

function addHiddenSearchToken(article: Element, key: string, token: string) {
  if (!token || article.querySelector(`[data-iboren-booking-search="${key}"]`)) return;
  const hidden = document.createElement("span");
  hidden.dataset.iborenBookingSearch = key;
  hidden.className = "sr-only";
  hidden.textContent = token;
  article.appendChild(hidden);
}

function injectBookingNumbers(items: BookingLike[], path: string) {
  const articles = Array.from(document.querySelectorAll("article"));
  for (const item of items) {
    const key = item.id || item.booking_number || item.preferred_date || "unknown";
    const article = articles.find((candidate) => articleMatches(candidate, item));
    if (!article) continue;
    const label = path.includes("public-requests") ? "Förfrågnings-ID" : "Boknings-ID";
    addBadge(article, key, referenceText(item, label));
    addHiddenSearchToken(article, `${key}-search`, [item.booking_number, item.id].filter(Boolean).join(" "));
  }
}

function injectPublicRequestNumbers(items: PublicRequestLike[]) {
  const articles = Array.from(document.querySelectorAll("article"));
  for (const item of items) {
    const key = item.id || item.external_id || item.booking_number || "unknown";
    const article = articles.find((candidate) => {
      const text = candidate.textContent || "";
      if (item.external_id && text.includes(item.external_id)) return true;
      return articleMatches(candidate, item);
    });
    if (!article) continue;
    addBadge(article, key, item.booking_number ? `Bokningsnummer: ${item.booking_number}` : `Förfrågnings-ID: ${item.external_id || String(item.id || "").slice(0, 8)}`);
    addHiddenSearchToken(article, `${key}-search`, [item.booking_number, item.external_id, item.id].filter(Boolean).join(" "));
  }
}

async function getToken() {
  const supabase = getSupabase();
  if (!supabase) return null;
  const { data } = await supabase.auth.getSession();
  return data.session?.access_token || null;
}

async function fetchAdminBookings(token: string) {
  const response = await fetch("/api/admin/bookings", { headers: { [AUTH_HEADER]: `${TOKEN_PREFIX} ${token}`, Authorization: `${TOKEN_PREFIX} ${token}` } });
  const result = await response.json().catch(() => null) as { ok?: boolean; bookings?: BookingLike[] } | null;
  return response.ok && result?.ok ? result.bookings || [] : [];
}

async function fetchPublicRequests(token: string) {
  const response = await fetch("/api/admin/public-requests", { headers: { [AUTH_HEADER]: `${TOKEN_PREFIX} ${token}`, Authorization: `${TOKEN_PREFIX} ${token}` } });
  const result = await response.json().catch(() => null) as { ok?: boolean; requests?: PublicRequestLike[] } | null;
  return response.ok && result?.ok ? result.requests || [] : [];
}

export default function BookingNumberUiEnhancer() {
  const pathname = usePathname();

  useEffect(() => {
    let cancelled = false;

    async function run() {
      const path = window.location.pathname;
      if (!["/admin/operations", "/admin/public-requests"].includes(path)) return;

      const token = await getToken();
      if (!token) return;

      let bookings: BookingLike[] = [];
      let publicRequests: PublicRequestLike[] = [];

      if (path === "/admin/operations") bookings = await fetchAdminBookings(token);
      if (path === "/admin/public-requests" || path === "/admin/operations") publicRequests = await fetchPublicRequests(token);

      if (cancelled) return;
      const paint = () => {
        if (bookings.length) injectBookingNumbers(bookings, path);
        if (publicRequests.length) injectPublicRequestNumbers(publicRequests);
      };
      requestAnimationFrame(paint);
      setTimeout(paint, 500);
      setTimeout(paint, 1500);
    }

    void run();
    return () => { cancelled = true; };
  }, [pathname]);

  return null;
}
