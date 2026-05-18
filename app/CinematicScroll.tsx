"use client";

export default function CinematicScroll() {
  return (
    <section id="cinematic-scroll" className="relative bg-night py-24 text-porcelain">
      <div className="luxe-container rounded-[2.5rem] border border-gold/20 bg-porcelain/5 p-8 text-center">
        <p className="text-[11px] font-black uppercase tracking-[.35em] text-gold">Cinematic scroll</p>
        <h2 className="display mt-4 text-5xl font-normal uppercase leading-[.9] text-porcelain md:text-7xl">Before. During. After.</h2>
        <p className="mx-auto mt-5 max-w-2xl leading-8 text-porcelain/65">A premium scroll section for Iboren.</p>
        <a href="#booking" className="mt-8 inline-flex rounded-full bg-gold px-5 py-3 text-sm font-black uppercase tracking-[.12em] text-night">Boka städning</a>
      </div>
    </section>
  );
}
