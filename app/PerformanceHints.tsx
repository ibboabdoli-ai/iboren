"use client";

import { useEffect } from "react";

export default function PerformanceHints() {
  useEffect(() => {
    const heroImage = document.querySelector<HTMLImageElement>("#top img");
    if (heroImage) {
      heroImage.loading = "eager";
      heroImage.decoding = "async";
      heroImage.fetchPriority = "high";
      heroImage.sizes = "100vw";
    }

    const images = Array.from(document.querySelectorAll<HTMLImageElement>("#cinematic-scroll img"));
    images.forEach((image, index) => {
      image.decoding = "async";
      image.sizes = "100vw";
      image.fetchPriority = index === 0 ? "auto" : "low";
    });

    const style = document.createElement("style");
    style.id = "iboren-performance-hints";
    style.textContent = "#services,#process,#booking,footer{content-visibility:auto;contain-intrinsic-size:900px;}";
    if (!document.getElementById(style.id)) document.head.appendChild(style);

    return () => {
      document.getElementById(style.id)?.remove();
    };
  }, []);

  return null;
}
