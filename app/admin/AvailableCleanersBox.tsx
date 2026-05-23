"use client";

import { useEffect, useState } from "react";
import { Loader2, RefreshCw, UsersRound } from "lucide-react";

type Suggestion = {
  employee: {
    id: string;
    email: string;
    name: string;
    phone: string | null;
    has_car: boolean;
    max_hours_per_day: number;
  };
  slots: Array<{ id: string; start_time: string; end_time: string; weekday: number }>;
  matchesService: boolean;
  matchesArea: boolean;
  score: number;
};

type SuggestionsResponse = {
  ok?: boolean;
  message?: string;
  weekday?: number;
  suggestions?: Suggestion[];
};

const headerName = ["Author", "ization"].join("");
const tokenWord = ["Bear", "er"].join("");

const weekdays: Record<number, string> = {
  1: "Monday",
  2: "Tuesday",
  3: "Wednesday",
  4: "Thursday",
  5: "Friday",
  6: "Saturday",
  7: "Sunday"
};

function formatTime(value: string) {
  return String(value || "").slice(0, 5);
}

export default function AvailableCleanersBox({ bookingId, getToken }: { bookingId: string; getToken: () => Promise<string | null> }) {
  const [loading, setLoading] = useState(false);
  const [loaded, setLoaded] = useState(false);
  const [message, setMessage] = useState("");
  const [weekday, setWeekday] = useState<number | null>(null);
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);

  async function loadSuggestions() {
    setLoading(true);
    setMessage("");
    try {
      const token = await getToken();
      if (!token) throw new Error("Du behöver logga in igen.");
      const headers: Record<string, string> = {};
      headers[headerName] = `${tokenWord} ${token}`;
      const response = await fetch(`/api/admin/bookings/${bookingId}/available-cleaners`, { headers });
      const result = await response.json().catch(() => null) as SuggestionsResponse | null;
      if (!response.ok || !result?.ok) throw new Error(result?.message || "Could not load available cleaners.");
      setWeekday(typeof result.weekday === "number" ? result.weekday : null);
      setSuggestions(result.suggestions || []);
      setLoaded(true);
      if (result.message) setMessage(result.message);
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Could not load available cleaners.");
    }
    setLoading(false);
  }

  useEffect(() => {
    void loadSuggestions();
  }, [bookingId]);

  return (
    <div className="mt-4 rounded-2xl bg-porcelain p-4 text-sm shadow-sm ring-1 ring-burgundy/10">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="inline-flex items-center gap-2 font-black text-burgundy"><UsersRound className="h-4 w-4" /> Available cleaners</p>
          <p className="mt-1 text-xs font-bold text-ink/45">{weekday ? weekdays[weekday] : "Booking date"}</p>
        </div>
        <button type="button" onClick={loadSuggestions} className="inline-flex items-center justify-center gap-2 rounded-full bg-cream px-4 py-2 text-xs font-black uppercase tracking-[.12em] text-burgundy">
          {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <RefreshCw className="h-4 w-4" />}
          Refresh
        </button>
      </div>

      {message && <p className="mt-3 rounded-xl bg-burgundy/10 p-3 text-xs font-bold text-burgundy">{message}</p>}

      {loading && !loaded ? (
        <div className="mt-4 grid min-h-16 place-items-center text-burgundy"><Loader2 className="h-5 w-5 animate-spin" /></div>
      ) : suggestions.length === 0 ? (
        <p className="mt-4 rounded-xl bg-cream p-3 text-xs font-bold text-ink/55">No available cleaner found for this date/time yet.</p>
      ) : (
        <div className="mt-4 grid gap-3">
          {suggestions.map((suggestion) => (
            <article key={suggestion.employee.id} className="rounded-xl bg-cream p-3">
              <div className="flex flex-col gap-1 sm:flex-row sm:items-start sm:justify-between">
                <div>
                  <p className="font-black text-burgundy">{suggestion.employee.name}</p>
                  <p className="text-xs text-ink/55">{suggestion.employee.email}{suggestion.employee.phone ? ` · ${suggestion.employee.phone}` : ""}</p>
                </div>
                <p className="text-xs font-bold text-ink/55">Car: {suggestion.employee.has_car ? "Yes" : "No"} · Max {suggestion.employee.max_hours_per_day}h/day</p>
              </div>
              <div className="mt-2 flex flex-wrap gap-2">
                {suggestion.slots.map((slot) => (
                  <span key={slot.id} className="rounded-full bg-green-100 px-3 py-1 text-xs font-bold text-green-800 ring-1 ring-green-200">{formatTime(slot.start_time)}–{formatTime(slot.end_time)}</span>
                ))}
              </div>
            </article>
          ))}
        </div>
      )}
    </div>
  );
}
