"use client";

import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { ArrowUpRight } from "lucide-react";
import Link from "next/link";
import { useState } from "react";

const galleries = [
  {
    id: "home",
    label: "Hem",
    title: "Ett lugnare hem efteråt.",
    body: "Välj mellan före och efter för att se hur känslan i rummet förändras.",
    before: {
      image: "/cinematic/01-home-before.webp",
      alt: "Vardagsrum före hemstädning"
    },
    after: {
      image: "/cinematic/03-home-after.webp",
      alt: "Vardagsrum efter hemstädning"
    }
  },
  {
    id: "office",
    label: "Kontor",
    title: "En arbetsplats redo igen.",
    body: "När ytorna är återställda blir det enklare att fokusera på nästa arbetsdag.",
    before: {
      image: "/cinematic/04-office-before.webp",
      alt: "Kontor före städning"
    },
    after: {
      image: "/cinematic/06-office-after.webp",
      alt: "Kontor efter städning"
    }
  }
];

type GalleryView = "before" | "after";

export default function HomeBeforeAfter() {
  const [activeGalleryId, setActiveGalleryId] = useState(galleries[0].id);
  const [view, setView] = useState<GalleryView>("after");
  const reduceMotion = useReducedMotion();
  const activeGallery = galleries.find((gallery) => gallery.id === activeGalleryId) ?? galleries[0];
  const activeImage = activeGallery[view];

  return (
    <section aria-labelledby="before-after-heading" className="bg-[#111411] py-24 text-porcelain md:py-32">
      <div className="luxe-container grid gap-10 lg:grid-cols-[.82fr_1.18fr] lg:items-end lg:gap-16">
        <div>
          <p className="text-[11px] font-bold uppercase tracking-[.38em] text-gold">II / Före &amp; efter</p>
          <h2 id="before-after-heading" className="display mt-4 max-w-xl text-5xl font-normal uppercase leading-[.9] md:text-7xl">{activeGallery.title}</h2>
          <p className="mt-6 max-w-md leading-7 text-porcelain/65">{activeGallery.body}</p>
          <Link href="/priser#pris-kalkylator" data-site-analytics-event="quote_cta_click" className="btn-primary mt-8">Få pris direkt <ArrowUpRight size={17} /></Link>
        </div>

        <div>
          <div className="mb-5 flex flex-wrap items-center justify-between gap-4">
            <div className="inline-flex rounded-full border border-gold/20 bg-night/55 p-1" role="tablist" aria-label="Välj miljö">
              {galleries.map((gallery) => (
                <button
                  key={gallery.id}
                  type="button"
                  role="tab"
                  aria-selected={activeGallery.id === gallery.id}
                  onClick={() => setActiveGalleryId(gallery.id)}
                  className={`rounded-full px-4 py-2 text-[11px] font-bold uppercase tracking-[.16em] transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold motion-reduce:transition-none ${activeGallery.id === gallery.id ? "bg-gold text-night" : "text-porcelain/72 hover:text-gold"}`}
                >
                  {gallery.label}
                </button>
              ))}
            </div>
            <div className="inline-flex rounded-full border border-gold/20 bg-night/55 p-1" role="tablist" aria-label="Välj före eller efter">
              <button type="button" role="tab" aria-selected={view === "before"} onClick={() => setView("before")} className={`rounded-full px-4 py-2 text-[11px] font-bold uppercase tracking-[.16em] transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold motion-reduce:transition-none ${view === "before" ? "bg-gold text-night" : "text-porcelain/72 hover:text-gold"}`}>Före</button>
              <button type="button" role="tab" aria-selected={view === "after"} onClick={() => setView("after")} className={`rounded-full px-4 py-2 text-[11px] font-bold uppercase tracking-[.16em] transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold motion-reduce:transition-none ${view === "after" ? "bg-gold text-night" : "text-porcelain/72 hover:text-gold"}`}>Efter</button>
            </div>
          </div>

          <div className="relative aspect-[4/3] overflow-hidden rounded-2xl border border-gold/20 bg-night shadow-[0_24px_70px_rgba(2,5,4,.28)]">
            <AnimatePresence initial={false} mode="wait">
              <motion.img
                key={`${activeGallery.id}-${view}`}
                src={activeImage.image}
                alt={activeImage.alt}
                loading="lazy"
                decoding="async"
                initial={reduceMotion ? false : { opacity: 0, scale: 1.02 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={reduceMotion ? undefined : { opacity: 0 }}
                transition={{ duration: reduceMotion ? 0 : 0.38, ease: [0.22, 1, 0.36, 1] }}
                className="absolute inset-0 h-full w-full object-cover"
              />
            </AnimatePresence>
            <div className="pointer-events-none absolute inset-x-0 bottom-0 bg-[linear-gradient(180deg,transparent,rgba(2,5,4,.72))] px-6 pb-6 pt-20">
              <p className="text-[11px] font-bold uppercase tracking-[.3em] text-gold">{view === "before" ? "Före städning" : "Efter städning"}</p>
              <p className="mt-2 text-sm font-semibold text-porcelain/80">{activeGallery.label === "Hem" ? "Hemstädning" : "Kontorsstädning"}</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
