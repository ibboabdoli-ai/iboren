"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { createClient, Session, User } from "@supabase/supabase-js";
import { ArrowLeft, CalendarCheck2, Loader2, LogOut, ShieldCheck, UserRound } from "lucide-react";

function getSupabase() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !key) return null;
  return createClient(url, key);
}

export default function ProfilePage() {
  const [loading, setLoading] = useState(true);
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [message, setMessage] = useState("");

  useEffect(() => {
    const supabase = getSupabase();
    if (!supabase) {
      setMessage("Supabase environment variables saknas i Vercel.");
      setLoading(false);
      return;
    }

    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session);
      setUser(data.session?.user ?? null);
      setLoading(false);
    });

    const { data: listener } = supabase.auth.onAuthStateChange((_event, newSession) => {
      setSession(newSession);
      setUser(newSession?.user ?? null);
    });

    return () => listener.subscription.unsubscribe();
  }, []);

  async function signOut() {
    const supabase = getSupabase();
    if (!supabase) return;
    await supabase.auth.signOut();
    window.location.href = "/";
  }

  if (loading) {
    return <main className="grid min-h-screen place-items-center bg-cream text-burgundy"><Loader2 className="h-8 w-8 animate-spin" /></main>;
  }

  if (!session || !user) {
    return (
      <main className="min-h-screen bg-cream py-16 text-ink">
        <section className="luxe-container max-w-2xl rounded-[2rem] bg-porcelain p-8 shadow-luxe md:p-10">
          <Link href="/" className="mb-8 inline-flex items-center gap-2 text-sm font-bold text-burgundy"><ArrowLeft size={17} /> Tillbaka</Link>
          <div className="mb-6 grid h-14 w-14 place-items-center rounded-full bg-burgundy text-porcelain"><UserRound size={24} /></div>
          <h1 className="display text-5xl font-bold text-burgundy">Profil</h1>
          <p className="mt-4 leading-8 text-ink/70">Du behöver logga in för att se din profil och dina framtida bokningar.</p>
          {message && <p className="mt-4 rounded-2xl bg-burgundy/10 p-4 text-sm text-burgundy">{message}</p>}
          <Link href="/login" className="btn-primary mt-7">Logga in</Link>
        </section>
      </main>
    );
  }

  const fullName = user.user_metadata?.full_name || user.user_metadata?.name || "Iboren customer";
  const avatar = user.user_metadata?.avatar_url || user.user_metadata?.picture;
  const provider = user.app_metadata?.provider || "oauth";

  return (
    <main className="min-h-screen bg-cream py-16 text-ink">
      <section className="luxe-container">
        <Link href="/" className="mb-8 inline-flex items-center gap-2 text-sm font-bold text-burgundy"><ArrowLeft size={17} /> Tillbaka</Link>
        <div className="grid gap-6 lg:grid-cols-[.72fr_1.28fr]">
          <aside className="rounded-[2.5rem] bg-burgundy p-8 text-porcelain shadow-luxe">
            <div className="mb-8 flex items-center gap-4">
              {avatar ? <img src={avatar} alt="Profilbild" className="h-16 w-16 rounded-full object-cover" /> : <div className="grid h-16 w-16 place-items-center rounded-full bg-gold text-ink"><UserRound size={30} /></div>}
              <div>
                <p className="text-xs font-bold uppercase tracking-[.28em] text-gold">Logged in</p>
                <h1 className="display mt-1 text-4xl font-bold">{fullName}</h1>
              </div>
            </div>
            <div className="space-y-3 text-sm text-porcelain/74">
              <p><strong className="text-gold">Email:</strong> {user.email}</p>
              <p><strong className="text-gold">Provider:</strong> {provider}</p>
              <p><strong className="text-gold">User ID:</strong> {user.id}</p>
            </div>
            <button onClick={signOut} className="mt-8 inline-flex items-center gap-2 rounded-full bg-porcelain px-5 py-3 text-sm font-bold text-burgundy"><LogOut size={17} /> Logga ut</button>
          </aside>
          <div className="grid gap-5">
            <article className="rounded-[2.5rem] bg-porcelain p-8 shadow-soft">
              <div className="mb-6 grid h-14 w-14 place-items-center rounded-full bg-burgundy text-porcelain"><CalendarCheck2 size={25} /></div>
              <h2 className="display text-4xl font-bold text-burgundy">Mina bokningar</h2>
              <p className="mt-4 leading-8 text-ink/65">Nästa steg är att spara bokningsförfrågningar i Supabase database och visa dem här per inloggad användare.</p>
            </article>
            <article className="rounded-[2.5rem] bg-porcelain p-8 shadow-soft">
              <div className="mb-6 grid h-14 w-14 place-items-center rounded-full bg-gold text-ink"><ShieldCheck size={25} /></div>
              <h2 className="display text-4xl font-bold text-burgundy">Profiluppgifter</h2>
              <p className="mt-4 leading-8 text-ink/65">Här kan kunden senare spara standardadress, telefonnummer, preferenser och fakturaunderlag.</p>
            </article>
          </div>
        </div>
      </section>
    </main>
  );
}
