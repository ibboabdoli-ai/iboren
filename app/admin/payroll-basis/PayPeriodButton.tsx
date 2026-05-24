"use client";

import { useState } from "react";
import { createClient } from "@supabase/supabase-js";

function getSupabase() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !key) return null;
  return createClient(url, key, { auth: { persistSession: true, autoRefreshToken: true, detectSessionInUrl: false } });
}

export default function PayPeriodButton({ start, end }: { start: string; end: string }) {
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");

  async function run() {
    setBusy(true);
    setMessage("");
    try {
      const supabase = getSupabase();
      if (!supabase) throw new Error("Supabase saknas.");
      const { data } = await supabase.auth.getSession();
      const token = data.session?.access_token;
      if (!token) throw new Error("Du behöver logga in igen.");
      const response = await fetch("/api/admin/payroll-basis/mark-paid", {
        method: "POST",
        headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
        body: JSON.stringify({ start, end })
      });
      const result = await response.json().catch(() => null) as { ok?: boolean; message?: string; paid_count?: number } | null;
      if (!response.ok || !result?.ok) throw new Error(result?.message || "Could not update period.");
      setMessage(`${result.paid_count || 0} approved entries moved to paid.`);
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Could not update period.");
    }
    setBusy(false);
  }

  return <div><button type="button" onClick={run} disabled={busy} className="rounded-full bg-green-900 px-5 py-3 font-bold text-white disabled:opacity-50">{busy ? "Saving..." : "Mark as paid"}</button>{message && <p className="mt-2 text-sm font-bold text-burgundy">{message}</p>}</div>;
}
