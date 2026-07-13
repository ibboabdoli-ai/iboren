"use client";

import { useEffect, useState } from "react";

type Review = { rating: number; comment: string; name: string; language: "sv" | "en" };
type ReviewResponse = { averageRating: number | null; count: number; reviews: Review[] };

export default function ReviewShowcase({ language }: { language: "sv" | "en" }) {
  const [data, setData] = useState<ReviewResponse | null>(null);
  useEffect(() => {
    fetch("/api/reviews", { cache: "no-store" }).then((response) => response.ok ? response.json() : null).then((result) => {
      if (result?.ok && result.count) setData(result);
    }).catch(() => undefined);
  }, []);
  if (!data) return null;

  const english = language === "en";
  const title = english ? "What customers say." : "Vad kunder säger.";
  const kicker = english ? "Customer reviews" : "Kundomdömen";
  const basedOn = english ? `Based on ${data.count} approved review${data.count === 1 ? "" : "s"}` : `Baserat på ${data.count} godkända omdömen`;
  const visible = data.reviews.filter((review) => review.language === language);
  const reviews = visible.length ? visible : data.reviews;

  return <section className="relative overflow-hidden bg-[#111411] py-24 text-porcelain md:py-32"><div className="luxe-container"><p className="text-[11px] font-bold uppercase tracking-[.38em] text-gold">{kicker}</p><div className="mt-4 flex flex-col gap-6 md:flex-row md:items-end md:justify-between"><h2 className="display max-w-3xl text-5xl font-normal uppercase leading-[.9] md:text-7xl">{title}</h2><div className="rounded-[1.5rem] border border-gold/25 bg-night/50 px-5 py-4"><p className="text-3xl font-bold text-gold">{data.averageRating?.toFixed(1)} <span className="text-lg">★★★★★</span></p><p className="mt-1 text-xs text-porcelain/65">{basedOn}</p></div></div><div className="mt-12 grid gap-4 md:grid-cols-3">{reviews.slice(0, 3).map((review, index) => <article key={`${review.name}-${index}`} className="rounded-[2rem] border border-gold/15 bg-night/45 p-7"><p className="text-gold">{"★".repeat(review.rating)}<span className="text-porcelain/20">{"★".repeat(5 - review.rating)}</span></p>{review.comment && <p className="mt-5 text-lg leading-8 text-porcelain/85">“{review.comment}”</p>}<p className="mt-6 text-sm font-bold text-gold">{review.name || (english ? "Verified customer" : "Verifierad kund")}</p></article>)}</div></div></section>;
}
