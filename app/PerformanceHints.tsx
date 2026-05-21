"use client";

import { useLayoutEffect } from "react";

function optimizedImageSrc(src: string) {
  if (!src || src.startsWith("/_next/image")) return src;
  const url = new URL(src, window.location.origin);
  if (!url.pathname.startsWith("/cinematic/") || !url.pathname.endsWith(".webp")) return src;
  const width = window.innerWidth <= 768 ? 828 : 1920;
  return `/_next/image?url=${encodeURIComponent(url.pathname)}&w=${width}&q=65`;
}

function optimizeImageElement(image: HTMLImageElement) {
  const original = image.getAttribute("src") || image.src;
  const optimized = optimizedImageSrc(original);
  if (optimized !== original) image.setAttribute("src", optimized);
}

export default function PerformanceHints() {
  useLayoutEffect(() => {
    const heroImage = document.querySelector<HTMLImageElement>("#top img");
    if (heroImage) {
      optimizeImageElement(heroImage);
      heroImage.loading = "eager";
      heroImage.decoding = "async";
      heroImage.fetchPriority = "high";
      heroImage.sizes = "100vw";
    }

    const images = Array.from(document.querySelectorAll<HTMLImageElement>("#cinematic-scroll img"));
    images.forEach((image, index) => {
      optimizeImageElement(image);
      image.loading = index === 0 ? "eager" : "lazy";
      image.decoding = "async";
      image.sizes = "100vw";
      image.fetchPriority = index === 0 ? "auto" : "low";
    });

    const style = document.createElement("style");
    style.id = "iboren-performance-hints";
    style.textContent = "#services,#process,#booking,footer{content-visibility:auto;contain-intrinsic-size:900px;}#cinematic-scroll img[loading='lazy']{content-visibility:auto;}";
    if (!document.getElementById(style.id)) document.head.appendChild(style);

    return () => {
      document.getElementById(style.id)?.remove();
    };
  }, []);

  return null;
}
