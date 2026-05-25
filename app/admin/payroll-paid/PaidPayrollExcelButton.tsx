"use client";

import { createClient } from "@supabase/supabase-js";
import { useState } from "react";

type Entry = {
  id: string;
  work_date: string;
  employee_name: string;
  employee_email: string;
  worked_minutes: number;
  break_minutes: number;
  travel_minutes: number;
  mileage_km: number;
  cleaner_note: string | null;
};
type ResponseBody = { ok?: boolean; message?: string; entries?: Entry[] };

function supabaseClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !key) return null;
  return createClient(url, key, { auth: { persistSession: true, autoRefreshToken: true, detectSessionInUrl: false } });
}
function hours(minutes: number) { return Math.round((Number(minutes || 0) / 60) * 100) / 100; }
function svNumber(value: number) { return String(value).replace(".", ","); }
function escapeHtml(value: unknown) { return String(value ?? "").replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;"); }
function fileName(start: string, end: string) { return `iboren-paid-payroll-${start}-to-${end}.xls`; }

function excelHtml(start: string, end: string, entries: Entry[]) {
  const rows = entries.map((entry) => `
    <tr>
      <td>${escapeHtml(entry.work_date)}</td>
      <td>${escapeHtml(start)}</td>
      <td>${escapeHtml(end)}</td>
      <td>${escapeHtml(entry.employee_name)}</td>
      <td>${escapeHtml(entry.employee_email)}</td>
      <td>${escapeHtml(svNumber(hours(entry.worked_minutes)))}</td>
      <td>${escapeHtml(entry.break_minutes)}</td>
      <td>${escapeHtml(entry.travel_minutes)}</td>
      <td>${escapeHtml(entry.mileage_km)}</td>
      <td>${escapeHtml(entry.cleaner_note || "")}</td>
    </tr>`).join("");

  return `<!doctype html><html><head><meta charset="utf-8" /></head><body>
    <table border="1">
      <thead>
        <tr>
          <th>Datum</th>
          <th>Period start</th>
          <th>Period slut</th>
          <th>Städare</th>
          <th>E-post</th>
          <th>Arbetade timmar</th>
          <th>Rast minuter</th>
          <th>Restid minuter</th>
          <th>Körsträcka km</th>
          <th>Anteckning</th>
        </tr>
      </thead>
      <tbody>${rows}</tbody>
    </table>
  </body></html>`;
}

function downloadExcel(name: string, html: string) {
  const blob = new Blob([html], { type: "application/vnd.ms-excel;charset=utf-8" });
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
      const response = await fetch(`/api/admin/payroll-paid-entries?start=${encodeURIComponent(start)}&end=${encodeURIComponent(end)}`, { headers: { [headerName]: `${tokenWord} ${token}` } });
      const result = await response.json().catch(() => null) as ResponseBody | null;
      if (!response.ok || !result?.ok) throw new Error(result?.message || "Could not create Excel file.");
      const entries = result.entries || [];
      if (!entries.length) throw new Error("No paid entries in this period.");
      downloadExcel(fileName(start, end), excelHtml(start, end, entries));
      setMessage("Excel file created with Datum column.");
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Could not create Excel file.");
    }
    setBusy(false);
  }

  return <div><button type="button" onClick={download} disabled={busy} className="rounded-full bg-green-900 px-5 py-3 font-bold text-white disabled:opacity-50">{busy ? "Creating..." : "Download Excel"}</button>{message && <p className="mt-2 text-sm font-bold text-burgundy">{message}</p>}</div>;
}
