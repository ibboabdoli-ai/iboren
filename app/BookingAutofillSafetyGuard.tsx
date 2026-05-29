"use client";

import { useEffect } from "react";

export default function BookingAutofillSafetyGuard() {
  useEffect(() => {
    function disableLegacyAutofill() {
      const form = document.querySelector<HTMLElement>("#booking form");
      if (!form) return;
      form.dataset.iborenEstimateAutofilled = "1";
    }

    disableLegacyAutofill();
    const timers = [100, 300, 800, 1600].map((delay) => window.setTimeout(disableLegacyAutofill, delay));

    return () => timers.forEach((timer) => window.clearTimeout(timer));
  }, []);

  return null;
}
