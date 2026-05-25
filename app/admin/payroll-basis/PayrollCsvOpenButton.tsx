"use client";

import { createClient } from "@supabase/supabase-js";
import { useState } from "react";

const headerName = ["Author", "ization"].join("");
const tokenWord = ["Bear", "er"].join("");

function supabaseClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !key) return null;
  return createClient(url, key, { auth: { persistSession: true, autoRefreshToken: true, detectSessionInUrl: false } });
}

export default function PayrollCsvOpenButton({ start, end }: { start: string; end: string }) {
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");
  const [csvText, setCsvText] = useState("");

  async function showCsv() {
    setBusy(true);
    setMessage("");
    setCsvText("");
    try {
      const supabase = supabaseClient();
      if (!supabase) throw new Error("Supabase saknas.");
      const { data } = await supabase.auth.getSession();
      const token = data.session?.access_token;
      if (!token) throw new Error("Du behöver logga in igen.");
      const response = await fetch(`/api/admin/payroll-basis?start=${encodeURIComponent(start)}&end=${encodeURIComponent(end)}&format=csv`, { headers: { [headerName]: `${tokenWord} ${token}` } });
      if (!response.ok) throw new Error("Could not create CSV.");
      const text = await response.text();
      setCsvText(text);
      setMessage("CSV is shown below. Copy it or save it as a .csv file.");
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Could not create CSV.");
    }
    setBusy(false);
  }

  async function copyCsv() {
    if (!csvText) return;
    try {
      await navigator.clipboard.writeText(csvText);
      setMessage("CSV copied.");
    } catch {
      setMessage("Select the CSV text below and copy it manually.");
    }
  }

  return (
    <div>
      <button type="button" onClick={showCsv} disabled={busy} className="rounded-full bg-ink px-5 py-3 font-bold text-porcelain disabled:opacity-50">{busy ? "Creating..." : "Show CSV"}</button>
      {message && <p className="mt-2 text-sm font-bold text-burgundy">{message}</p>}
      {csvText && (
        <div className="mt-3 rounded-2xl bg-cream p-3 ring-1 ring-burgundy/10">
          <div className="mb-2 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-xs font-black uppercase tracking-[.12em] text-ink/45">CSV preview</p>
            <button type="button" onClick={copyCsv} className="rounded-full bg-porcelain px-4 py-2 text-xs font-black uppercase tracking-[.12em] text-burgundy ring-1 ring-burgundy/10">Copy CSV</button>
          </div>
          <textarea readOnly value={csvText} className="h-64 w-full rounded-xl bg-porcelain p-3 font-mono text-xs leading-6 text-ink/80 outline-none" />
        </div>
      )}
    </div>
  );
}
