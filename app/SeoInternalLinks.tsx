"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const hiddenPrefixes = ["/admin", "/profile", "/login"];

const localLinks = [
  { href: "/om-iboren", label: "Om Iboren" },
  { href: "/stadning-sodertalje", label: "Städning i Södertälje" },
  { href: "/stadning-stockholm", label: "Städning i Stockholm" },
  { href: "/hemstadning", label: "Hemstädning" },
  { href: "/flyttstadning", label: "Flyttstädning" },
  { href: "/kontorsstadning", label: "Kontorsstädning" },
  { href: "/fonsterputs", label: "Fönsterputs" }
];

const keywordLinks = [
  { href: "/stadning-sodertalje", label: "Hemstädning Södertälje" },
  { href: "/stadning-sodertalje", label: "Flyttstädning Södertälje" },
  { href: "/stadning-sodertalje", label: "Städfirma Södertälje" },
  { href: "/stadning-sodertalje", label: "Fönsterputs Södertälje" },
  { href: "/stadning-stockholm", label: "Kontorsstädning Stockholm" },
  { href: "/stadning-stockholm", label: "Städfirma Stockholm" }
];

export default function SeoInternalLinks() {
  const pathname = usePathname();
  if (hiddenPrefixes.some((prefix) => pathname?.startsWith(prefix))) return null;

  return (
    <section aria-label="Populära städsidor" className="border-t border-gold/10 bg-night py-10 text-porcelain">
      <div className="luxe-container grid gap-8 md:grid-cols-[1fr_1.2fr] md:items-start">
        <div>
          <p className="text-[10px] font-bold uppercase tracking-[.32em] text-gold/70">Lokala städtjänster</p>
          <h2 className="display mt-3 text-3xl font-normal uppercase text-porcelain md:text-4xl">Hitta rätt städning snabbare.</h2>
          <p className="mt-4 max-w-xl text-sm leading-7 text-porcelain/55">Iboren hjälper kunder skapa tydliga bokningsförfrågningar för städning i Södertälje och Stockholm.</p>
        </div>
        <div className="grid gap-5 sm:grid-cols-2">
          <div>
            <p className="mb-3 text-xs font-black uppercase tracking-[.22em] text-gold">Viktiga sidor</p>
            <div className="flex flex-wrap gap-2">
              {localLinks.map((link) => (
                <Link key={link.href + link.label} href={link.href} className="rounded-full border border-gold/20 px-4 py-2 text-sm font-semibold text-porcelain/70 hover:border-gold hover:text-gold">
                  {link.label}
                </Link>
              ))}
            </div>
          </div>
          <div>
            <p className="mb-3 text-xs font-black uppercase tracking-[.22em] text-gold">Populära sökningar</p>
            <div className="flex flex-wrap gap-2">
              {keywordLinks.map((link) => (
                <Link key={link.label} href={link.href} className="rounded-full border border-porcelain/10 px-4 py-2 text-sm font-semibold text-porcelain/55 hover:border-gold hover:text-gold">
                  {link.label}
                </Link>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
