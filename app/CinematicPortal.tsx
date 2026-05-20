"use client";

import { useEffect, useRef, useState } from "react";
import { createRoot, Root } from "react-dom/client";

const scenes = [
  {
    counter: "01 / 06",
    kicker: "HEM · FÖRE",
    title: "Före städningen",
    body: "Ett hem innan återställningen: rörigt, tungt och svårt att slappna av i.",
    image: "/cinematic/01-home-before.webp"
  },
  {
    counter: "02 / 06",
    kicker: "STÄDNING · PÅGÅR",
    title: "Arbetet börjar",
    body: "Yta för yta återställs med metod, rytm och precision.",
    image: "/cinematic/02-home-cleaner.webp"
  },
  {
    counter: "03 / 06",
    kicker: "HEM · EFTER",
    title: "Lugnet efteråt",
    body: "Ett rent, ljust och lugnt hem där allt känns lättare.",
    image: "/cinematic/03-home-after.webp"
  },
  {
    counter: "04 / 06",
    kicker: "KONTOR · FÖRE",
    title: "När arbetsplatsen behöver lyftas",
    body: "Kontoret innan städning: ytor, detaljer och saker som tar fokus.",
    image: "/cinematic/04-office-before.webp"
  },
  {
    counter: "05 / 06",
    kicker: "KONTOR · PÅGÅR",
    title: "Yta för yta",
    body: "Arbetsytor, mötesrum och entré återställs utan att störa verksamheten.",
    image: "/cinematic/05-office-cleaner.webp"
  },
  {
    counter: "06 / 06",
    kicker: "KLART · EFTER",
    title: "Redo igen",
    body: "En renare arbetsplats, redo för fokus, kunder och nästa produktiva dag.",
    image: "/cinematic/06-office-after.webp"
  }
];

function clamp(value: number, min: number, max: number) {
  return Math.max(min, Math.min(max, value));
}

function CinematicSection() {
  const sectionRef = useRef<HTMLElement | null>(null);
  const [activeIndex, setActiveIndex] = useState(0);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    let ticking = false;

    function update() {
      ticking = false;
      const section = sectionRef.current;
      if (!section) return;

      const rect = section.getBoundingClientRect();
      const scrollable = Math.max(1, section.offsetHeight - window.innerHeight);
      const nextProgress = clamp(-rect.top / scrollable, 0, 1);
      const nextIndex = clamp(Math.floor(nextProgress * scenes.length), 0, scenes.length - 1);

      setProgress(nextProgress);
      setActiveIndex(nextIndex);
    }

    function onScroll() {
      if (ticking) return;
      ticking = true;
      window.requestAnimationFrame(update);
    }

    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, []);

  const activeScene = scenes[activeIndex];
  const sceneProgress = (activeIndex + 1) / scenes.length;

  return (
    <section ref={sectionRef} id="cinematic-scroll" className="relative h-[620vh] bg-night text-porcelain" aria-label="Cinematic före och efter">
      <div className="sticky top-0 h-screen min-h-screen overflow-hidden bg-night">
        {scenes.map((scene, index) => {
          const active = index === activeIndex;
          const near = Math.abs(index - activeIndex) <= 1;
          return (
            <img
              key={scene.counter}
              src={scene.image}
              alt={scene.title}
              loading={index <= 1 ? "eager" : "lazy"}
              decoding="async"
              className="absolute inset-0 h-full w-full object-cover transition-[opacity,transform] duration-700 ease-out"
              style={{
                opacity: active ? 1 : 0,
                transform: active ? "scale(1)" : near ? "scale(1.035)" : "scale(1.07)",
                zIndex: active ? 2 : 1
              }}
            />
          );
        })}

        <div className="absolute inset-0 z-10 bg-[linear-gradient(90deg,rgba(2,5,4,.64),rgba(2,5,4,.16)_48%,rgba(2,5,4,.58)),radial-gradient(circle_at_52%_46%,transparent_0_36%,rgba(0,0,0,.42)_100%)]" />

        <div className="absolute left-5 right-5 top-24 z-20 flex items-start justify-between md:left-[8vw] md:right-[8vw] md:top-[12vh]">
          <div>
            <p className="text-[10px] font-black uppercase tracking-[.34em] text-gold/85">{activeScene.kicker}</p>
            <p className="display mt-1 text-4xl font-normal uppercase tracking-[.02em] text-porcelain md:text-6xl">{activeScene.counter}</p>
          </div>
          <div className="h-24 w-1 overflow-hidden rounded-full bg-porcelain/15">
            <div className="w-full rounded-full bg-gold transition-all duration-300" style={{ height: `${Math.round(sceneProgress * 100)}%` }} />
          </div>
        </div>

        <div className="absolute inset-x-0 bottom-12 z-20 px-5 md:bottom-20">
          <div className="luxe-container">
            <div className="mb-5 flex gap-2">
              {scenes.map((scene, index) => (
                <span
                  key={scene.counter}
                  className={`h-1.5 rounded-full transition-all duration-300 ${index === activeIndex ? "w-10 bg-gold" : "w-3 bg-porcelain/25"}`}
                />
              ))}
            </div>
            <h2 className="display max-w-4xl text-[clamp(3rem,8vw,7rem)] font-normal uppercase leading-[.84] tracking-[.02em] text-porcelain">
              {activeScene.title}
            </h2>
            <p className="mt-5 max-w-2xl text-base leading-8 text-porcelain/86 md:text-xl">{activeScene.body}</p>
            <div className="mt-7 flex items-center gap-4 text-[11px] font-bold uppercase tracking-[.28em] text-gold/80">
              <span>Scrolla</span>
              <span className="h-px w-12 bg-gold/40" />
              <span>{Math.round(progress * 100)}%</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

export default function CinematicPortal() {
  useEffect(() => {
    const original = document.querySelector<HTMLElement>("#cinematic-scroll");
    if (!original || document.querySelector("#iboren-cinematic-portal")) return;

    const host = document.createElement("div");
    host.id = "iboren-cinematic-portal";
    original.insertAdjacentElement("beforebegin", host);
    original.style.display = "none";
    original.setAttribute("aria-hidden", "true");

    const root: Root = createRoot(host);
    root.render(<CinematicSection />);

    return () => {
      root.unmount();
      host.remove();
      original.style.display = "";
      original.removeAttribute("aria-hidden");
    };
  }, []);

  return null;
}
