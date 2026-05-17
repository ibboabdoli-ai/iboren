"use client";

import Link from "next/link";
import { useState } from "react";
import { ArrowLeft, Loader2, LockKeyhole, Mail } from "lucide-react";
import { createClient } from "@supabase/supabase-js";

const providers = [
  { id: "google", label: "Fortsätt med Google" },
  { id: "linkedin_oidc", label: "Fortsätt med LinkedIn" },
  { id: "azure", label: "Fortsätt med Microsoft" }
] as const;

function getSupabase() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !key) return null;
  return createClient(url, key);
}

export default function LoginPage() {
  const [loading, setLoading] = useState<string | null>(null);
  const [message, setMessage] = useState("");

  async function signIn(provider: "google" | "linkedin_oidc" | "azure") {
    const supabase = getSupabase();
    if (!supabase) {
      setMessage("Supabase saknas. Lägg till NEXT_PUBLIC_SUPABASE_URL och NEXT_PUBLIC_SUPABASE_ANON_KEY i Vercel.");
      return;
    }
    setLoading(provider);
    const origin = window.location.origin;
    const { error } = await supabase.auth.signInWithOAuth({
      provider,
      options: { redirectTo: `${origin}/auth/callback?next=/profile` }
    });
    if (error) {
      setMessage(error.message);
      setLoading(null);
    }
  }

  return (
    <main className="min-h-screen bg-cream text-ink">
      <section className="luxe-container flex min-h-screen items-center py-20">
        <div className="mx-auto grid w-full max-w-5xl overflow-hidden rounded-[2.5rem] bg-porcelain shadow-luxe md:grid-cols-[.9fr_1.1fr]">
          <div className="bg-burgundy p-8 text-porcelain md:p-10">
            <Link href="/" className="mb-12 inline-flex items-center gap-2 text-sm font-bold text-porcelain/80"><ArrowLeft size={17} /> Tillbaka</Link>
            <p className="mb-4 text-[11px] font-bold uppercase tracking-[.38em] text-gold">Iboren Account</p>
            <h1 className="display text-5xl font-bold leading-[.9] md:text-7xl">Logga in eller skapa konto.</h1>
            <p className="mt-6 leading-8 text-porcelain/72">Kunder ska kunna spara profil, kontaktuppgifter och framtida bokningar.</p>
          </div>
          <div className="p-8 md:p-10">
            <div className="mb-8 grid h-14 w-14 place-items-center rounded-full bg-burgundy text-porcelain"><LockKeyhole size={24} /></div>
            <h2 className="display text-4xl font-bold text-burgundy">Välj inloggning</h2>
            <p className="mt-3 leading-7 text-ink/65">Använd Google, LinkedIn eller Microsoft. Konto skapas automatiskt första gången.</p>
            <div className="mt-8 grid gap-3">
              {providers.map((provider) => (
                <button key={provider.id} onClick={() => signIn(provider.id)} className="flex items-center justify-between rounded-2xl border border-burgundy/10 bg-cream px-5 py-4 text-left font-bold text-ink transition hover:border-burgundy/25 hover:bg-white">
                  <span>{provider.label}</span>
                  {loading === provider.id ? <Loader2 className="h-5 w-5 animate-spin text-burgundy" /> : <Mail className="h-5 w-5 text-burgundy" />}
                </button>
              ))}
            </div>
            {message && <p className="mt-5 rounded-2xl bg-burgundy/10 px-4 py-3 text-sm text-burgundy">{message}</p>}
          </div>
        </div>
      </section>
    </main>
  );
}
