"use client";

import { motion, useReducedMotion } from "framer-motion";
import { useEffect, useState } from "react";

type Review = { rating: number; comment: string; name: string; language: "sv" | "en" };
type ReviewResponse = { averageRating: number | null; count: number; reviews: Review[] };

export default function ReviewShowcase({ language }: { language: "sv" | "en" }) {
  const [data, setData] = useState<ReviewResponse | null>(null);
  const reduceMotion = useReducedMotion();
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
  if (!reviews.length) return null;

  const featuredReview = reviews.find((review) => review.comment) ?? reviews[0];
  const supportingReviews = reviews.filter((review) => review !== featuredReview).slice(0, 2);
  const reviewerName = (review: Review) => review.name || (english ? "Verified customer" : "Verifierad kund");
  const motionProps = (delay = 0) => reduceMotion ? {} : {
    initial: { opacity: 0, y: 12 },
    whileInView: { opacity: 1, y: 0 },
    viewport: { once: true, amount: 0.3 },
    transition: { duration: 0.45, delay, ease: [0.22, 1, 0.36, 1] as const },
  };

  return <section className="relative overflow-hidden bg-[#111411] py-24 text-porcelain md:py-32">
    <div className="luxe-container">
      <p className="text-[11px] font-bold uppercase tracking-[.38em] text-gold">{kicker}</p>
      <div className="mt-4 flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
        <h2 className="display max-w-3xl text-5xl font-normal uppercase leading-[.9] md:text-7xl">{title}</h2>
        <div className="rounded-[1.5rem] border border-gold/25 bg-night/50 px-5 py-4">
          <p className="text-3xl font-bold text-gold">{data.averageRating?.toFixed(1)} <span className="text-lg">★★★★★</span></p>
          <p className="mt-1 text-xs text-porcelain/65">{basedOn}</p>
        </div>
      </div>

      <div className="mt-12 grid gap-4 md:grid-cols-[minmax(0,1.45fr)_minmax(0,1fr)]">
        <motion.article {...motionProps()} className="flex min-h-[17rem] flex-col justify-between rounded-[2rem] border border-gold/25 bg-[radial-gradient(circle_at_top_right,rgba(202,162,71,0.15),transparent_42%),rgba(6,10,7,0.7)] p-7 md:p-9">
          <div>
            <p className="text-gold">{"★".repeat(featuredReview.rating)}<span className="text-porcelain/20">{"★".repeat(5 - featuredReview.rating)}</span></p>
            {featuredReview.comment && <p className="mt-7 max-w-2xl text-xl leading-8 text-porcelain/90 md:text-2xl md:leading-9">“{featuredReview.comment}”</p>}
          </div>
          <p className="mt-7 text-sm font-bold text-gold">{reviewerName(featuredReview)}</p>
        </motion.article>

        {supportingReviews.length > 0 && <div className="grid gap-4">
          {supportingReviews.map((review, index) => <motion.article {...motionProps(0.08 * (index + 1))} key={`${review.name}-${index}`} className="flex min-h-[8rem] flex-col justify-between rounded-[1.5rem] border border-gold/15 bg-night/45 p-6">
            <div>
              <p className="text-sm text-gold">{"★".repeat(review.rating)}<span className="text-porcelain/20">{"★".repeat(5 - review.rating)}</span></p>
              {review.comment && <p className="mt-3 text-base leading-6 text-porcelain/80">“{review.comment}”</p>}
            </div>
            <p className="mt-4 text-sm font-bold text-gold">{reviewerName(review)}</p>
          </motion.article>)}
        </div>}
      </div>
    </div>
  </section>;
}
