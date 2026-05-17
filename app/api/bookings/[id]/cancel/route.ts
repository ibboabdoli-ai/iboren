import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export const runtime = "nodejs";

function getAdminClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !serviceKey) return null;

  return createClient(url, serviceKey, {
    auth: { persistSession: false, autoRefreshToken: false }
  });
}

async function getUserFromRequest(request: Request) {
  const supabase = getAdminClient();
  if (!supabase) {
    return { ok: false as const, status: 500, message: "Missing Supabase service role key." };
  }

  const authHeader = request.headers.get("authorization") || "";
  const token = authHeader.replace(/^Bearer\s+/i, "").trim();

  if (!token) {
    return { ok: false as const, status: 401, message: "Missing access token." };
  }

  const { data, error } = await supabase.auth.getUser(token);

  if (error || !data.user) {
    return { ok: false as const, status: 401, message: "Invalid session." };
  }

  return { ok: true as const, supabase, user: data.user };
}

export async function PATCH(request: Request, { params }: { params: { id: string } }) {
  const auth = await getUserFromRequest(request);
  if (!auth.ok) {
    return NextResponse.json({ ok: false, message: auth.message }, { status: auth.status });
  }

  const { data, error } = await auth.supabase
    .from("bookings")
    .update({ status: "cancelled" })
    .eq("id", params.id)
    .eq("user_id", auth.user.id)
    .select("id, status")
    .single();

  if (error) {
    return NextResponse.json({ ok: false, message: error.message }, { status: 500 });
  }

  return NextResponse.json({ ok: true, booking: data });
}
