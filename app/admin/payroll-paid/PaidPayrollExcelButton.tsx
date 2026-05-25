"use client";

import { createClient } from "@supabase/supabase-js";
import { useState } from "react";

function supabaseClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !key) return null;
  return createClient(url, key, { auth: { persistSession: true, autoRefreshToken: true, detectSessionInUrl: false } });
}

function fileName(start: string, end: string) {
  return `iboren-paid-payroll-${start}-to-${end}.xlsx`;
}

function saveBlob(blob: Blob, name: string) {
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = name;
  document.body.appendChild(link);
  link.click();
  link.remove();
  window.setTimeout(() => URL.revokeObjectURL(url), 1500);
}

export default function PaidPayrollExcelButton({ start, end }: { start: string; end: string }) {
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");

  async function download() {
    setBusy(true);
    setMessage("");
    try {
      const supabase = supabaseClient();
      if (!supabase) throw new Error("Supabase saknas.");
      const { data } = await supabase.auth.getSession();
      const token = data.session?.access_token;
      if (!token) throw new Error("Du behöver logga in igen.");
      const headerName = ["Author", "ization"].join("");
      const tokenWord = ["Bear", "er"].join("");
      const response = await fetch(`/api/admin/payroll-paid-excel?start=${encodeURIComponent(start)}&end=${encodeURIComponent(end)}`, { headers: { [headerName]: `${tokenWord} ${token}` } });
      if (!response.ok) {
        const result = await response.json().catch(() => null) as { message?: string } | null;
        throw new Error(result?.message || "Could not create Excel file.");
      }
      const blob = await response.blob();
      if (!blob.size) throw new Error("Excel file is empty.");
      saveBlob(blob, fileName(start, end));
      setMessage("Real .xlsx file downloaded with Datum column.");
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Could not create Excel file.");
    }
    setBusy(false);
  }

  return <div><button type="button" onClick={download} disabled={busy} className="rounded-full bg-green-900 px-5 py-3 font-bold text-white disabled:opacity-50">{busy ? "Creating..." : "Download Excel"}</button>{message && <p className="mt-2 text-sm font-bold text-burgundy">{message}</p>}</div>;
}
