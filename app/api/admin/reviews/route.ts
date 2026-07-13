import { NextResponse } from "next/server";
import { getReviewAdminClient } from "../../../lib/reviews";

export const runtime = "nodejs";

function getAdminEmails() {
  return (process.env.ADMIN_EMAILS || "ibbo.abdoli@gmail.com").split(",").map((email) => email.trim().toLowerCase()).filter(Boolean);
}

async function verifyAdmin(request: Request) {
  const supabase = getReviewAdminClient();
  if (!supabase) return { ok: false as const, status: 500, message: "Adminmiljön är inte korrekt konfigurerad." };
  const token = (request.headers.get("authorization") || "").replace(/^Bearer\s+/i, "").trim();
  if (!token) return { ok: false as const, status: 401, message: "Du behöver logga in igen." };
  const { data, error } = await supabase.auth.getUser(token);
  const email = data.user?.email?.toLowerCase();
  if (error || !email) return { ok: false as const, status: 401, message: "Sessionen är inte giltig." };
  const { data: roles, error: roleError } = await supabase.from("user_roles").select("role, active").or(`user_id.eq.${data.user.id},email.ilike.${email}`).limit(2);
  if (roleError) return { ok: false as const, status: 500, message: "Kunde inte kontrollera adminåtkomst." };
  const isAdminByRole = Boolean((roles || []).find((row) => row.active && row.role === "admin"));
  if (!getAdminEmails().includes(email) && !isAdminByRole) return { ok: false as const, status: 403, message: "Adminåtkomst krävs." };
  return { ok: true as const, supabase };
}

export async function GET(request: Request) {
  const admin = await verifyAdmin(request);
  if (!admin.ok) return NextResponse.json({ ok: false, message: admin.message }, { status: admin.status });
  const { data, error } = await admin.supabase
    .from("booking_reviews")
    .select("id, customer_name, customer_email, language, rating, comment, status, invited_at, submitted_at, moderated_at, booking:bookings(booking_number, service, area)")
    .in("status", ["submitted", "approved", "rejected"])
    .order("submitted_at", { ascending: false })
    .limit(100);
  if (error) return NextResponse.json({ ok: false, message: "Kunde inte hämta omdömen." }, { status: 500 });
  return NextResponse.json({ ok: true, reviews: data || [] });
}

export async function PATCH(request: Request) {
  const admin = await verifyAdmin(request);
  if (!admin.ok) return NextResponse.json({ ok: false, message: admin.message }, { status: admin.status });
  const body = await request.json().catch(() => null) as { id?: unknown; status?: unknown } | null;
  const id = String(body?.id || "").trim();
  const status = String(body?.status || "").trim();
  if (!id || !["approved", "rejected"].includes(status)) return NextResponse.json({ ok: false, message: "Ogiltigt omdöme eller status." }, { status: 400 });
  const { error } = await admin.supabase.from("booking_reviews").update({ status, moderated_at: new Date().toISOString() }).eq("id", id).eq("status", "submitted");
  if (error) return NextResponse.json({ ok: false, message: "Kunde inte uppdatera omdömet." }, { status: 500 });
  return NextResponse.json({ ok: true });
}
