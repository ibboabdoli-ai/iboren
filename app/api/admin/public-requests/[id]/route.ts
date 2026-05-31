import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export const runtime = "nodejs";

const allowedStatuses = ["new", "reviewed", "rejected"];

type RouteContext = {
  params: {
    id: string;
  };
};

function getAdminEmails() {
  return (process.env.ADMIN_EMAILS || "ibbo.abdoli@gmail.com")
    .split(",")
    .map((email) => email.trim().toLowerCase())
    .filter(Boolean);
}

function getAdminClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !serviceKey) return null;
  return createClient(url, serviceKey, { auth: { persistSession: false, autoRefreshToken: false } });
}

async function verifyAdmin(request: Request) {
  const supabase = getAdminClient();
  if (!supabase) return { ok: false as const, status: 500, message: "Missing Supabase admin environment variables." };

  const authHeader = request.headers.get("authorization") || "";
  const token = authHeader.replace(/^Bearer\s+/i, "").trim();
  if (!token) return { ok: false as const, status: 401, message: "Missing access token." };

  const { data, error } = await supabase.auth.getUser(token);
  const email = data.user?.email?.toLowerCase();
  if (error || !email) return { ok: false as const, status: 401, message: "Invalid session." };
  if (!getAdminEmails().includes(email)) return { ok: false as const, status: 403, message: "Admin access required." };

  return { ok: true as const, supabase, user: data.user };
}

function sanitize(value: unknown) {
  return String(value ?? "").replace(/[<>]/g, "").trim().slice(0, 3000);
}

export async function PATCH(request: Request, context: RouteContext) {
  const admin = await verifyAdmin(request);
  if (!admin.ok) return NextResponse.json({ ok: false, message: admin.message }, { status: admin.status });

  const id = sanitize(context.params.id);
  if (!id) return NextResponse.json({ ok: false, message: "Missing request id." }, { status: 400 });

  const json = await request.json().catch(() => ({})) as { status?: string; admin_notes?: string; adminNotes?: string };
  const status = sanitize(json.status || "");
  const adminNotes = sanitize(json.admin_notes ?? json.adminNotes ?? "");

  const update: Record<string, string | null> = {};
  if (status) {
    if (!allowedStatuses.includes(status)) return NextResponse.json({ ok: false, message: "Invalid status." }, { status: 400 });
    update.status = status;
  }
  if ("admin_notes" in json || "adminNotes" in json) update.admin_notes = adminNotes || null;

  if (!Object.keys(update).length) return NextResponse.json({ ok: false, message: "Nothing to update." }, { status: 400 });

  const { data, error } = await admin.supabase
    .from("public_booking_requests")
    .update(update)
    .eq("id", id)
    .select("id, status, admin_notes, updated_at")
    .single();

  if (error) return NextResponse.json({ ok: false, message: error.message }, { status: 500 });
  return NextResponse.json({ ok: true, request: data });
}
