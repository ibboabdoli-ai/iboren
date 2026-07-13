"use client";

import Link from "next/link";
import { trackSiteEvent } from "../../lib/analytics";

export default function AnalyticsBookingLink() {
  return <Link href="/priser#pris-kalkylator" onClick={() => trackSiteEvent("quote_cta_click")} className="btn-primary">Få pris direkt</Link>;
}
