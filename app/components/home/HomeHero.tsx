import type { User } from "@supabase/supabase-js";
import { ArrowUpRight } from "lucide-react";
import Link from "next/link";

const trustBadges = ["RUT-avdrag", "Prisindikation online", "Ej bindande förfrågan"];

type Props = {
  user: User | null;
  image: string;
};

export default function HomeHero({ user, image }: Props) {
  return (
    <section id="top" className="relative grid min-h-screen place-items-center overflow-hidden px-5 pt-28 text-center">
      <img src={image} alt="Rent hem" loading="eager" decoding="async" fetchPriority="high" sizes="100vw" className="absolute inset-0 h-full w-full object-cover" />
      <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(2,5,4,.58),rgba(2,5,4,.16)_48%,rgba(2,5,4,.62)),radial-gradient(circle_at_center,transparent_0_38%,rgba(0,0,0,.34)_100%)]" />
      <div className="relative z-10 mx-auto max-w-6xl">
        <p className="text-[11px] font-bold uppercase tracking-[0.36em] text-gold/90 md:tracking-[0.44em]">Södertälje · Stockholm · RUT-avdrag</p>
        <h1 className="display mt-5 text-[clamp(3rem,12vw,8.5rem)] font-normal uppercase leading-[.9] tracking-[.01em] text-porcelain md:mt-6 md:leading-[.86]">Städning i Södertälje & Stockholm</h1>
        <p className="mx-auto mt-6 max-w-3xl text-base font-semibold leading-7 text-porcelain/88 md:mt-7 md:text-2xl md:leading-8">Hemstädning, flyttstädning, kontorsstädning och fönsterputs. Beräkna pris online och skicka en ej bindande förfrågan.</p>
        {user && <p className="mt-5 inline-flex rounded-full border border-gold/25 bg-night/50 px-4 py-2 text-sm font-bold text-gold">Inloggad som {user.email}</p>}
        <div className="mt-7 flex flex-wrap items-center justify-center gap-2 md:mt-8">{trustBadges.map((badge) => <span key={badge} className="rounded-full border border-gold/25 bg-night/45 px-3 py-2 text-[10px] font-bold uppercase tracking-[.16em] text-gold md:px-4 md:text-xs md:tracking-[.18em]">{badge}</span>)}</div>
        <div className="mt-9 flex flex-col items-center justify-center gap-3 sm:flex-row md:mt-10"><Link href="/priser" className="btn-primary">Beräkna pris <ArrowUpRight size={17} /></Link><Link href="/boka-utan-konto" className="btn-secondary">Skicka förfrågan</Link></div>
        <p className="mx-auto mt-5 max-w-xl text-sm font-bold leading-6 text-porcelain/75">Vi bekräftar alltid tid och slutligt pris innan förfrågan blir bindande.</p>
        <div className="mt-8 inline-flex items-center gap-4 text-[11px] font-bold uppercase tracking-[0.32em] text-gold/75 before:h-px before:w-10 before:bg-gold/40 after:h-px after:w-10 after:bg-gold/40 md:mt-10">Se före och efter</div>
      </div>
    </section>
  );
}
