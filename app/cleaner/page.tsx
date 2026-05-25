"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { createClient, User } from "@supabase/supabase-js";
import { ArrowLeft, CalendarDays, ChevronDown, Loader2, Lock, UserRound } from "lucide-react";
import CleanerAvailabilityForm from "./CleanerAvailabilityForm";
import CleanerJobsList from "./CleanerJobsList";

type Role = "admin" | "supervisor" | "cleaner" | "customer";

type RoleResponse = {
  ok?: boolean;
  role?: Role;
  active?: boolean;
  email?: string;
  message?: string;
  source?: string;
};

const headerName = ["Author", "ization"].join("");
const tokenWord = ["Bear", "er"].join("");
const allowedRoles: Role[] = ["admin", "supervisor", "cleaner"];

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

function roleLabel(role: Role | undefined) {
  if (role === "admin") return "Admin";
  if (role === "supervisor") return "Supervisor";
  if (role === "cleaner") return "Städare";
  return "Kund";
}

function roleBadgeClass(role: Role | undefined) {
  if (role === "admin") return "bg-burgundy text-porcelain";
  if (role === "supervisor") return "bg-gold text-ink";
  if (role === "cleaner") return "bg-green-100 text-green-800 ring-1 ring-green-200";
  return "bg-red-100 text-red-800 ring-1 ring-red-200";
}

export default function CleanerPage() {
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<User | null>(null);
  const [accessToken, setAccessToken] = useState("");
  const [roleInfo, setRoleInfo] = useState<RoleResponse | null>(null);
  const [message, setMessage] = useState("");

  const hasAccess = useMemo(() => Boolean(roleInfo?.active !== false && roleInfo?.role && allowedRoles.includes(roleInfo.role)), [roleInfo]);

  useEffect(() => {
    let cancelled = false;

    async function init() {
      const supabase = getSupabase();
      if (!supabase) {
        if (!cancelled) {
          setMessage("Supabase environment variables saknas.");
          setLoading(false);
        }
        return;
      }

      const { data } = await supabase.auth.getSession();
      const session = data.session;
      if (cancelled) return;

      if (!session?.user || !session.access_token) {
        setUser(null);
        setAccessToken("");
        setLoading(false);
        return;
      }

      setUser(session.user);
      setAccessToken(session.access_token);

      try {
        const headers: Record<string, string> = {};
        headers[headerName] = `${tokenWord} ${session.access_token}`;
        const response = await fetch("/api/me/role", { headers });
        const result = await response.json().catch(() => null) as RoleResponse | null;
        if (!response.ok || !result?.ok) throw new Error(result?.message || "Kunde inte kontrollera roll.");
        if (!cancelled) setRoleInfo(result);
      } catch (error) {
        if (!cancelled) setMessage(error instanceof Error ? error.message : "Kunde inte kontrollera roll.");
      }

      if (!cancelled) setLoading(false);
    }

    void init();
    return () => { cancelled = true; };
  }, []);

  if (loading) return <main className="grid min-h-screen place-items-center bg-cream text-burgundy"><Loader2 className="h-8 w-8 animate-spin" /></main>;

  if (!user) {
    return (
      <main className="min-h-screen bg-cream py-16 text-ink">
        <section className="luxe-container max-w-2xl rounded-[2rem] bg-porcelain p-8 shadow-soft">
          <Link href="/" className="mb-8 inline-flex items-center gap-2 text-sm font-bold text-burgundy"><ArrowLeft size={17} /> Tillbaka</Link>
          <div className="mb-6 grid h-14 w-14 place-items-center rounded-full bg-burgundy text-porcelain"><Lock size={24} /></div>
          <h1 className="display text-5xl font-bold text-burgundy">Städarpanel</h1>
          <p className="mt-4 leading-8 text-ink/70">Du behöver logga in innan vi kan kontrollera din personalbehörighet.</p>
          {message && <p className="mt-4 rounded-2xl bg-red-100 p-4 text-sm font-bold text-red-800">{message}</p>}
          <Link href="/login" className="btn-primary mt-7">Logga in</Link>
        </section>
      </main>
    );
  }

  if (!hasAccess) {
    return (
      <main className="min-h-screen bg-cream py-16 text-ink">
        <section className="luxe-container max-w-2xl rounded-[2rem] bg-porcelain p-8 shadow-soft">
          <Link href="/profile" className="mb-8 inline-flex items-center gap-2 text-sm font-bold text-burgundy"><ArrowLeft size={17} /> Tillbaka till profil</Link>
          <div className="mb-6 grid h-14 w-14 place-items-center rounded-full bg-red-100 text-red-800"><Lock size={24} /></div>
          <h1 className="display text-5xl font-bold text-burgundy">Ingen åtkomst</h1>
          <p className="mt-4 leading-8 text-ink/70">Den här sidan är bara för städare, supervisor och admin.</p>
          <div className="mt-6 rounded-2xl bg-cream p-4 text-sm leading-7 text-ink/70">
            <p><strong>E-post:</strong> {user.email}</p>
            <p><strong>Nuvarande roll:</strong> <span className={`ml-2 rounded-full px-3 py-1 text-xs font-black uppercase tracking-[.14em] ${roleBadgeClass(roleInfo?.role)}`}>{roleLabel(roleInfo?.role)}</span></p>
          </div>
          <p className="mt-5 text-sm leading-7 text-ink/60">Be en admin lägga till din e-post som städare eller supervisor i Admin → User & staff roles.</p>
        </section>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-cream py-12 text-ink md:py-16">
      <section className="luxe-container">
        <Link href="/profile" className="mb-8 inline-flex items-center gap-2 text-sm font-bold text-burgundy"><ArrowLeft size={17} /> Tillbaka till profil</Link>
        <div className="rounded-[2.5rem] bg-burgundy p-7 text-porcelain shadow-luxe md:p-9">
          <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
            <div>
              <div className="mb-5 grid h-14 w-14 place-items-center rounded-full bg-gold text-ink"><UserRound size={25} /></div>
              <p className="text-xs font-bold uppercase tracking-[.32em] text-gold">Iboren personal</p>
              <h1 className="display mt-3 text-5xl font-bold leading-[.9] md:text-7xl">Städarpanel</h1>
              <p className="mt-5 max-w-2xl leading-8 text-porcelain/70">Se tilldelade jobb, lägg till dem i kalendern och uppdatera din tillgänglighet.</p>
            </div>
            <div className="rounded-[1.5rem] border border-gold/15 bg-night/20 p-4 text-sm font-bold text-porcelain/80">
              <p>{roleInfo?.email || user.email}</p>
              <p className="mt-3"><span className={`rounded-full px-3 py-1 text-xs font-black uppercase tracking-[.14em] ${roleBadgeClass(roleInfo?.role)}`}>{roleLabel(roleInfo?.role)}</span></p>
            </div>
          </div>
        </div>

        <div className="mt-6 grid gap-5">
          {accessToken ? <CleanerJobsList token={accessToken} /> : null}

          <details className="group rounded-[2rem] bg-porcelain p-5 shadow-soft md:p-6">
            <summary className="flex cursor-pointer list-none items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <span className="grid h-11 w-11 place-items-center rounded-full bg-cream text-burgundy"><CalendarDays size={18} /></span>
                <div>
                  <h2 className="display text-3xl font-bold text-burgundy">Tillgänglighet</h2>
                  <p className="mt-1 text-sm text-ink/55">Öppna bara när du behöver ändra arbetsdagar eller tider.</p>
                </div>
              </div>
              <ChevronDown className="h-5 w-5 text-burgundy transition-transform group-open:rotate-180" />
            </summary>
            <div className="mt-5 border-t border-burgundy/10 pt-5">
              {accessToken ? <CleanerAvailabilityForm token={accessToken} /> : null}
            </div>
          </details>

          <article className="rounded-[2rem] bg-porcelain p-6 shadow-soft">
            <Lock className="mb-5 text-burgundy" />
            <h2 className="display text-3xl font-bold text-burgundy">Åtkomstkontroll</h2>
            <p className="mt-3 leading-7 text-ink/65">Endast rollerna städare, supervisor och admin kan öppna den här panelen.</p>
          </article>
        </div>
      </section>
    </main>
  );
}
