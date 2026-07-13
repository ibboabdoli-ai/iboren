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
  const since = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString();
  const { data, error } = await admin.supabase.from("site_events").select("event_name, path, language, created_at").gte("created_at", since).order("created_at", { ascending: false }).limit(5000);
  if (error) return NextResponse.json({ ok: false, message: "Kunde inte hämta statistik." }, { status: 500 });
  const events = data || [];
  const totals = { pageViews: 0, quoteClicks: 0, bookingClicks: 0 };
  const pages = new Map<string, number>();
  for (const event of events) {
    if (event.event_name === "page_view") { totals.pageViews += 1; pages.set(event.path, (pages.get(event.path) || 0) + 1); }
    if (event.event_name === "quote_cta_click") totals.quoteClicks += 1;
    if (event.event_name === "booking_cta_click") totals.bookingClicks += 1;
  }
  return NextResponse.json({ ok: true, totals, pages: Array.from(pages, ([path, count]) => ({ path, count })).sort((a, b) => b.count - a.count).slice(0, 10) });
}
