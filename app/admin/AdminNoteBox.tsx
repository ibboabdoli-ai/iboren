"use client";

import { useState } from "react";
import { createClient } from "@supabase/supabase-js";
import { Loader2, Save } from "lucide-react";

function getSupabase() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !key) return null;
  return createClient(url, key, {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: false
    }
  });
}

export default function AdminNoteBox({ bookingId, initialNote }: { bookingId: string; initialNote: string }) {
  const [note, setNote] = useState(initialNote || "");
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");

  async function saveNote() {
    setSaving(true);
    setMessage("");

    try {
      const supabase = getSupabase();
      if (!supabase) throw new Error("Supabase saknas.");
      const { data } = await supabase.auth.getSession();
      const token = data.session?.access_token;
      if (!token) throw new Error("Du behöver logga in igen.");

      const response = await fetch(`/api/admin/bookings/${bookingId}`, {
        method: "PATCH",
        headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
        body: JSON.stringify({ admin_notes: note })
      });

      const result = await response.json();
      if (!response.ok || !result.ok) throw new Error(result.message || "Kunde inte spara anteckning.");
      setMessage("Adminanteckning sparad.");
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Något gick fel.");
    }

    setSaving(false);
  }

  return (
    <div className="mt-4 rounded-2xl border border-burgundy/10 bg-porcelain p-4">
      <label className="block">
        <span className="mb-2 block text-sm font-bold text-burgundy">Intern adminanteckning</span>
        <textarea
          value={note}
          onChange={(event) => setNote(event.target.value)}
          className="min-h-24 w-full rounded-2xl border border-burgundy/10 bg-cream px-4 py-3 text-sm text-ink outline-none focus:border-burgundy/40"
          placeholder="Ex: ring kund, särskild info, intern uppföljning..."
        />
      </label>
      <button onClick={saveNote} disabled={saving} className="mt-3 inline-flex items-center gap-2 rounded-full bg-burgundy px-4 py-2 text-sm font-bold text-porcelain disabled:opacity-50">
        {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
        Spara anteckning
      </button>
      {message && <p className="mt-3 rounded-xl bg-burgundy/10 px-3 py-2 text-sm text-burgundy">{message}</p>}
    </div>
  );
}
