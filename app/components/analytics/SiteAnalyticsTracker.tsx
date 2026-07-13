"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";
import { trackSiteEvent } from "../../lib/analytics";

export default function SiteAnalyticsTracker() {
  const pathname = usePathname();

  useEffect(() => {
    if (pathname) trackSiteEvent("page_view");
  }, [pathname]);

  return null;
}
