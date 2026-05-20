"use client";

import { useEffect } from "react";

const cinematicFrames = [
  { counter: "01 / 06", kicker: "HEM · FÖRE", title: "Före städningen", body: "Ett hem innan återställningen: rörigt, tungt och svårt att slappna av i." },
  { counter: "02 / 06", kicker: "STÄDNING · PÅGÅR", title: "Arbetet börjar", body: "Yta för yta återställs med metod, rytm och precision." },
  { counter: "03 / 06", kicker: "HEM · EFTER", title: "Lugnet efteråt", body: "Ett rent, ljust och lugnt hem där allt känns lättare." },
  { counter: "04 / 06", kicker: "KONTOR · FÖRE", title: "När arbetsplatsen behöver lyftas", body: "Kontoret innan städning: ytor, detaljer och saker som tar fokus." },
  { counter: "05 / 06", kicker: "KONTOR · PÅGÅR", title: "Yta för yta", body: "Arbetsytor, mötesrum och entré återställs utan att störa verksamheten." },
  { counter: "06 / 06", kicker: "KLART · EFTER", title: "Redo igen", body: "En renare arbetsplats, redo för fokus, kunder och nästa produktiva dag." }
];

function clamp(value: number, min: number, max: number) {
  return Math.max(min, Math.min(max, value));
}

function getCurrentCounter(section: HTMLElement) {
  const candidates = Array.from(section.querySelectorAll("p"));
  return candidates.find((node) => /^\d{2}\s\/\s06$/.test((node.textContent || "").trim())) as HTMLParagraphElement | undefined;
}

function updateCinematicDom(section: HTMLElement, index: number) {
  const frame = cinematicFrames[index];
  const images = Array.from(section.querySelectorAll<HTMLImageElement>("img"));
  images.forEach((image, imageIndex) => {
    const active = imageIndex === index;
    image.style.opacity = active ? "1" : "0";
    image.style.transform = active ? "scale(1)" : "scale(1.04)";
    image.style.zIndex = active ? "2" : "1";
    image.loading = imageIndex <= 1 ? "eager" : "lazy";
    image.decoding = "async";
  });

  const counter = getCurrentCounter(section);
  const kicker = counter?.previousElementSibling as HTMLParagraphElement | null;
  const title = section.querySelector<HTMLHeadingElement>("h2");
  const body = title?.nextElementSibling as HTMLParagraphElement | null;
  const progressBar = section.querySelector<HTMLDivElement>(".h-24.w-1 div");

  if (kicker) kicker.textContent = frame.kicker;
  if (counter) counter.textContent = frame.counter;
  if (title) title.textContent = frame.title;
  if (body) body.textContent = frame.body;
  if (progressBar) progressBar.style.height = `${Math.round(((index + 1) / cinematicFrames.length) * 100)}%`;
}

export default function CinematicScrollDriver() {
  useEffect(() => {
    const section = document.querySelector<HTMLElement>("#cinematic-scroll");
    const sticky = section?.firstElementChild as HTMLElement | null;
    if (!section || !sticky) return;

    const style = document.createElement("style");
    style.dataset.iborenCinematicDriver = "1";
    style.textContent = `
      #cinematic-scroll {
        height: 620vh !important;
        min-height: 620vh !important;
        overflow: visible !important;
        background: #020504 !important;
      }
      #cinematic-scroll > div {
        position: sticky !important;
        top: 0 !important;
        height: 100vh !important;
        min-height: 100vh !important;
        overflow: hidden !important;
      }
      @supports (height: 100svh) {
        #cinematic-scroll > div {
          height: 100svh !important;
          min-height: 100svh !important;
        }
      }
      #cinematic-scroll img {
        will-change: opacity, transform !important;
      }
    `;
    document.head.appendChild(style);

    const stopReactWheel = (event: Event) => {
      event.stopImmediatePropagation();
    };

    section.addEventListener("wheel", stopReactWheel, { capture: true, passive: true });
    section.addEventListener("touchstart", stopReactWheel, { capture: true, passive: true });
    section.addEventListener("touchend", stopReactWheel, { capture: true, passive: true });

    let lastIndex = -1;
    let ticking = false;

    const updateFromScroll = () => {
      ticking = false;
      const rect = section.getBoundingClientRect();
      const scrollable = Math.max(1, section.offsetHeight - window.innerHeight);
      const progress = clamp(-rect.top / scrollable, 0, 1);
      const nextIndex = clamp(Math.round(progress * (cinematicFrames.length - 1)), 0, cinematicFrames.length - 1);
      if (nextIndex === lastIndex) return;
      lastIndex = nextIndex;
      updateCinematicDom(section, nextIndex);
    };

    const onScroll = () => {
      if (ticking) return;
      ticking = true;
      window.requestAnimationFrame(updateFromScroll);
    };

    updateFromScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll, { passive: true });

    return () => {
      section.removeEventListener("wheel", stopReactWheel, { capture: true });
      section.removeEventListener("touchstart", stopReactWheel, { capture: true });
      section.removeEventListener("touchend", stopReactWheel, { capture: true });
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      style.remove();
    };
  }, []);

  return null;
}
