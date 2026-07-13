"use client";

import Link from "next/link";

export default function AnalyticsBookingLink() {
  return <Link href="/priser#pris-kalkylator" data-site-analytics-event="quote_cta_click" className="btn-primary">Få pris direkt</Link>;
}
