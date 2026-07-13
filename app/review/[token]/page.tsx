"use client";

import { useEffect, useState } from "react";

type Review = { status: string; rating: number | null; language: "sv" | "en"; service: string; area: string };

export default function ReviewPage({ params }: { params: { token: string } }) {
  const [review, setReview] = useState<Review | null>(null);
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState("");
  const [state, setState] = useState<"loading" | "ready" | "sending" | "sent" | "error">("loading");
  const english = typeof window !== "undefined" && new URLSearchParams(window.location.search).get("lang") === "en";
  const copy = english ? {
    title: "How was your cleaning?", intro: "Your feedback helps Iboren improve.", choose: "Choose a rating", comment: "Tell us more (optional)", placeholder: "What worked well?", send: "Send review", sent: "Thank you for your review.", unavailable: "This review link is not available.", service: "Service"
  } : {
    title: "Hur upplevde du din städning?", intro: "Din återkoppling hjälper Iboren att förbättra servicen.", choose: "Välj ett betyg", comment: "Berätta gärna mer (valfritt)", placeholder: "Vad fungerade bra?", send: "Skicka omdöme", sent: "Tack för ditt omdöme.", unavailable: "Den här omdömeslänken är inte tillgänglig.", service: "Tjänst"
  };

  useEffect(() => {
    fetch(`/api/reviews/${encodeURIComponent(params.token)}`).then(async (response) => {
      if (!response.ok) throw new Error("not_found");
      return response.json();
    }).then((data) => { setReview(data.review); setState(data.review.status === "pending" ? "ready" : "sent"); }).catch(() => setState("error"));
  }, [params.token]);

  async function submit(event: React.FormEvent) {
    event.preventDefault();
    if (!rating) return;
    setState("sending");
    try {
      const response = await fetch(`/api/reviews/${encodeURIComponent(params.token)}`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ rating, comment }) });
      if (!response.ok) throw new Error("submit_failed");
      setState("sent");
    } catch { setState("error"); }
  }

  return <main className="min-h-screen bg-night px-5 py-16 text-porcelain"><section className="mx-auto max-w-xl rounded-[2rem] border border-gold/25 bg-[#121512] p-7 shadow-2xl sm:p-10"><p className="text-xs font-bold uppercase tracking-[.3em] text-gold">Iboren · Kundomdöme</p><h1 className="display mt-5 text-5xl uppercase leading-[.9]">{state === "sent" ? copy.sent : copy.title}</h1>{state === "error" ? <p className="mt-6 text-porcelain/75">{copy.unavailable}</p> : state === "sent" ? <p className="mt-6 text-porcelain/75">{english ? "Your feedback will be reviewed before it is published." : "Din återkoppling granskas innan den publiceras."}</p> : <form onSubmit={submit} className="mt-8"><p className="text-porcelain/75">{copy.intro}</p>{review && <p className="mt-4 text-sm text-gold">{copy.service}: {review.service} · {review.area}</p>}<fieldset className="mt-8"><legend className="text-sm font-bold">{copy.choose}</legend><div className="mt-3 flex gap-2">{[1,2,3,4,5].map((value) => <button key={value} type="button" onClick={() => setRating(value)} aria-label={`${value} stars`} className={`grid h-12 w-12 place-items-center rounded-full border text-2xl ${rating >= value ? "border-gold bg-gold text-night" : "border-porcelain/30 text-gold"}`}>★</button>)}</div></fieldset><label className="mt-7 block text-sm font-bold">{copy.comment}<textarea value={comment} onChange={(event) => setComment(event.target.value)} maxLength={1200} placeholder={copy.placeholder} className="mt-3 min-h-32 w-full rounded-2xl border border-porcelain/20 bg-[#090b09] p-4 text-porcelain outline-none focus:border-gold" /></label><button disabled={!rating || state === "sending"} className="mt-7 w-full rounded-full bg-gold px-6 py-4 font-bold text-night disabled:opacity-50">{state === "sending" ? "…" : copy.send}</button></form>}</section></main>;
}
