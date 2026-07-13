import { NextResponse } from "next/server";
import { getReviewAdminClient, isReviewExpired } from "../../../lib/reviews";

export const runtime = "nodejs";

function clean(value: unknown, max: number) {
  return String(value ?? "").replace(/[<>]/g, "").trim().slice(0, max);
}

async function loadReview(token: string) {
  const supabase = getReviewAdminClient();
  if (!supabase) return { error: "configuration" as const };
  const { data, error } = await supabase
    .from("booking_reviews")
    .select("id, token, status, rating, comment, language, expires_at, booking:bookings(service, area)")
    .eq("token", token)
    .maybeSingle();
  if (error) return { error: "database" as const };
  if (!data) return { error: "not_found" as const };
  if (isReviewExpired(data.expires_at)) return { error: "expired" as const };
  return { supabase, review: data };
}

export async function GET(_request: Request, { params }: { params: { token: string } }) {
  const loaded = await loadReview(params.token);
  if ("error" in loaded) return NextResponse.json({ ok: false, message: loaded.error === "expired" ? "This review link has expired." : "Review link not found." }, { status: loaded.error === "expired" ? 410 : loaded.error === "not_found" ? 404 : 503 });
  const booking = Array.isArray(loaded.review.booking) ? loaded.review.booking[0] : loaded.review.booking;
  return NextResponse.json({ ok: true, review: { status: loaded.review.status, rating: loaded.review.rating, language: loaded.review.language, service: booking?.service || "", area: booking?.area || "" } });
}

export async function POST(request: Request, { params }: { params: { token: string } }) {
  const loaded = await loadReview(params.token);
  if ("error" in loaded) return NextResponse.json({ ok: false, message: loaded.error === "expired" ? "This review link has expired." : "Review link not found." }, { status: loaded.error === "expired" ? 410 : loaded.error === "not_found" ? 404 : 503 });
  if (loaded.review.status !== "pending") return NextResponse.json({ ok: false, message: "This review has already been submitted." }, { status: 409 });
  const body = await request.json().catch(() => null) as { rating?: unknown; comment?: unknown } | null;
  const rating = Number(body?.rating);
  const comment = clean(body?.comment, 1200);
  if (!Number.isInteger(rating) || rating < 1 || rating > 5) return NextResponse.json({ ok: false, message: "Choose a rating between 1 and 5." }, { status: 400 });
  const { error } = await loaded.supabase.from("booking_reviews").update({ rating, comment: comment || null, status: "submitted", submitted_at: new Date().toISOString() }).eq("id", loaded.review.id).eq("status", "pending");
  if (error) return NextResponse.json({ ok: false, message: "Could not save your review." }, { status: 500 });
  return NextResponse.json({ ok: true });
}
