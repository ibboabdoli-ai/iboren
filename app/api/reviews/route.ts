import { NextResponse } from "next/server";
import { getReviewAdminClient } from "../../lib/reviews";

export const runtime = "nodejs";

function publicName(value: unknown) {
  const firstName = String(value || "").replace(/[<>]/g, "").trim().split(/\s+/)[0] || "";
  return firstName.slice(0, 60);
}

export async function GET() {
  const supabase = getReviewAdminClient();
  if (!supabase) return NextResponse.json({ ok: false, reviews: [] }, { status: 503 });
  const { data, error } = await supabase
    .from("booking_reviews")
    .select("rating, comment, customer_name, language, moderated_at")
    .eq("status", "approved")
    .not("rating", "is", null)
    .order("moderated_at", { ascending: false })
    .limit(12);
  if (error) {
    console.warn("IBOREN_PUBLIC_REVIEWS_LOAD_FAILED", { code: error.code });
    return NextResponse.json({ ok: false, reviews: [] }, { status: 503 });
  }
  const reviews = (data || []).map((review) => ({
    rating: Number(review.rating),
    comment: String(review.comment || "").replace(/[<>]/g, "").trim().slice(0, 1200),
    name: publicName(review.customer_name),
    language: review.language === "en" ? "en" : "sv"
  }));
  const averageRating = reviews.length ? Number((reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length).toFixed(1)) : null;
  return NextResponse.json({ ok: true, averageRating, count: reviews.length, reviews });
}
