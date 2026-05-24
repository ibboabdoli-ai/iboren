"use client";

import { createClient } from "@supabase/supabase-js";
import { useState } from "react";

function supabaseClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !key) return null;
  return createClient(url, key, { auth: { persistSession: true, autoRefreshToken: true, detectSessionInUrl: false } });
}

export default function PayrollCsvOpenButton({ start, end }: { start: string; end: string }) {
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");

  async function openCsv() {
    setBusy(true);
    setMessage("");
    try {
      const supabase = supabaseClient();
      if (!supabase) throw new Error("Supabase saknas.");
      const { data } = await supabase.auth.getSession();
      const token = data.session?.access_token;
      if (!token) throw new Error("Du behöver logga in igen.");
      const response = await fetch(`/api/admin/payroll-basis?start=${encodeURIComponent(start)}&end=${encodeURIComponent(end)}&format=csv`, { headers: { Authorization: `Bearer ${token}` } });
      if (!response.ok) throw new Error("Could not create CSV.");
      const text = await response.text();
      const page = window.open("", "_blank");
      if (!page) throw new Error("Popup blocked. Allow popups for this site.");
      page.document.write(`<pre>${text.replace(/[&<>]/g, (char) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;" }[char] || char))}</pre>`);
      page.document.title = `iboren-payroll-basis-${start}-to-${end}.csv`;
      setMessage("CSV opened in a new tab.");
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Could not create CSV.");
    }
    setBusy(false);
  }

  return <div><button type="button" onClick={openCsv} disabled={busy} className="rounded-full bg-ink px-5 py-3 font-bold text-porcelain disabled:opacity-50">{busy ? "Opening..." : "Open CSV"}</button>{message && <p className="mt-2 text-sm font-bold text-burgundy">{message}</p>}</div>;
}
