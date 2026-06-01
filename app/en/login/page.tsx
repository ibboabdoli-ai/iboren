"use client";

import Link from "next/link";
import { useState } from "react";
import { ArrowLeft, Loader2, Mail, ShieldCheck } from "lucide-react";
import { createClient } from "@supabase/supabase-js";

const providers = [
  { id: "google", label: "Continue with Google" },
  { id: "linkedin_oidc", label: "Continue with LinkedIn" },
  { id: "azure", label: "Continue with Microsoft" }
] as const;

type ProviderId = (typeof providers)[number]["id"];

function getSupabase() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !key) return null;
  return createClient(url, key, {
    auth: {
      flowType: "implicit",
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: true
    }
  });
}

export default function EnglishLoginPage() {
  const [loading, setLoading] = useState<string | null>(null);
  const [message, setMessage] = useState("");

  async function signIn(provider: ProviderId) {
    const supabase = getSupabase();
    if (!supabase) {
      setMessage("Supabase is missing. Add NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY in Vercel.");
      return;
    }

    setLoading(provider);
    setMessage("");

    const redirectBase = window.location.origin;
    const { error } = await supabase.auth.signInWithOAuth({
      provider,
      options: {
        redirectTo: `${redirectBase}/en/profile`,
        ...(provider === "azure" ? { scopes: "email" } : {})
      }
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
          <div className="bg-[#06131A] p-8 text-porcelain md:p-10">
            <Link href="/en" className="mb-10 inline-flex items-center gap-2 text-sm font-bold text-porcelain/80"><ArrowLeft size={17} /> Back</Link>
            <img src="/logo.svg" alt="Iboren" className="mb-10 h-auto w-full max-w-[320px] rounded-[1.6rem] shadow-2xl" />
            <p className="mb-4 text-[11px] font-bold uppercase tracking-[.38em] text-gold">Iboren Account</p>
            <h1 className="display text-5xl font-bold leading-[.9] md:text-7xl">Log in with a verified email.</h1>
            <p className="mt-6 leading-8 text-porcelain/72">For safer bookings, Iboren uses login through established providers where your email address is verified.</p>
          </div>
          <div className="p-8 md:p-10">
            <div className="mb-8 max-w-[260px] overflow-hidden rounded-[1.35rem] bg-[#06131A] shadow-lg">
              <img src="/logo.svg" alt="Iboren" className="h-auto w-full" />
            </div>
            <div className="mb-4 flex flex-wrap gap-2 text-xs font-black uppercase tracking-[.14em]">
              <Link href="/login" className="rounded-full bg-cream px-3 py-1 text-burgundy ring-1 ring-burgundy/10">SV</Link>
              <span className="rounded-full bg-burgundy px-3 py-1 text-porcelain">EN</span>
            </div>
            <h2 className="display text-4xl font-bold text-burgundy">Choose login</h2>
            <p className="mt-3 leading-7 text-ink/65">An account is created automatically the first time. Your email comes from Google, LinkedIn or Microsoft.</p>
            <div className="mt-5 flex items-start gap-3 rounded-2xl border border-burgundy/10 bg-cream p-4 text-sm leading-6 text-ink/68">
              <ShieldCheck className="mt-0.5 h-5 w-5 shrink-0 text-burgundy" />
              <span>We use verified OAuth login to reduce incorrect bookings and invalid email addresses.</span>
            </div>
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
