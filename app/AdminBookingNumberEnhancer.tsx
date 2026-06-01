"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";
import { createClient } from "@supabase/supabase-js";

type AdminBooking = {
  id: string;
  booking_number?: string | null;
  service?: string | null;
  area?: string | null;
  address?: string | null;
  customer_name?: string | null;
  preferred_date?: string | null;
};

function getSupabase() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !key) return null;
  return createClient(url, key, { auth: { persistSession: true, autoRefreshToken: true, detectSessionInUrl: false } });
}

function referenceText(booking: AdminBooking) {
  if (booking.booking_number) return `Bokningsnummer: ${booking.booking_number}`;
  return `Boknings-ID: ${String(booking.id || "").slice(0, 8) || "—"}`;
}

function hasBookingText(article: Element, booking: AdminBooking) {
  const text = article.textContent || "";
  const required = [booking.service, booking.customer_name, booking.preferred_date].filter(Boolean) as string[];
  if (!required.every((value) => text.includes(value))) return false;
  if (booking.address && text.includes(booking.address)) return true;
  if (booking.area && text.includes(booking.area)) return true;
  return true;
}

function insertBookingNumber(bookings: AdminBooking[]) {
  if (window.location.pathname !== "/admin") return;

  const articles = Array.from(document.querySelectorAll("article"));
  for (const booking of bookings) {
    const reference = referenceText(booking);
    const article = articles.find((candidate) => hasBookingText(candidate, booking));
    if (!article || article.querySelector(`[data-booking-number="${booking.id}"]`)) continue;

    const target = article.querySelector("h2")?.parentElement || article.firstElementChild || article;
    const badge = document.createElement("p");
    badge.dataset.bookingNumber = booking.id;
    badge.className = "mt-2 inline-flex rounded-full bg-gold/20 px-3 py-1 text-xs font-black uppercase tracking-[.14em] text-burgundy ring-1 ring-gold/30";
    badge.textContent = reference;
    target.appendChild(badge);
  }
}

export default function AdminBookingNumberEnhancer() {
  const pathname = usePathname();

  useEffect(() => {
    if (pathname !== "/admin") return;
    let cancelled = false;

    async function load() {
      const supabase = getSupabase();
      if (!supabase) return;
      const { data } = await supabase.auth.getSession();
      const token = data.session?.access_token;
      if (!token) return;

      const response = await fetch("/api/admin/bookings", { headers: { Authorization: `Bearer ${token}` } });
      const result = await response.json().catch(() => null) as { ok?: boolean; bookings?: AdminBooking[] } | null;
      if (!cancelled && response.ok && result?.ok && Array.isArray(result.bookings)) {
        requestAnimationFrame(() => insertBookingNumber(result.bookings || []));
        setTimeout(() => insertBookingNumber(result.bookings || []), 600);
        setTimeout(() => insertBookingNumber(result.bookings || []), 1600);
      }
    }

    void load();
    return () => { cancelled = true; };
  }, [pathname]);

  return null;
}
