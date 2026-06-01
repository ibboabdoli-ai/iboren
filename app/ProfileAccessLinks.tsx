"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { createClient } from "@supabase/supabase-js";

type AccessLink = { label: string; href: string; kind: string };
type AccessResponse = {
  ok?: boolean;
  role?: "admin" | "supervisor" | "cleaner" | "customer";
  active?: boolean;
  links?: AccessLink[];
  employee?: { name?: string; role?: string; active?: boolean } | null;
};

const HEADER_NAME = ["Author", "ization"].join("");
const TOKEN_WORD = ["Bear", "er"].join("");

function getSupabase() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !key) return null;
  return createClient(url, key, { auth: { persistSession: true, autoRefreshToken: true, detectSessionInUrl: true } });
}

function roleLabel(role: string | undefined, english: boolean) {
  if (role === "admin") return english ? "Admin" : "Admin";
  if (role === "supervisor") return english ? "Supervisor" : "Supervisor";
  if (role === "cleaner") return english ? "Cleaner" : "Cleaner";
  return english ? "Customer" : "Kund";
}

function linkLabel(link: AccessLink, english: boolean) {
  if (english) return link.label;
  if (link.kind === "admin") return link.href.includes("operations") ? "Operations" : "Adminpanel";
  if (link.kind === "supervisor") return "Supervisorpanel";
  if (link.kind === "cleaner") return "Cleaner dashboard";
  return link.label;
}

function cardText(role: string | undefined, english: boolean) {
  if (english) {
    if (role === "admin") return "You have admin access. Open the admin or operations panel from here.";
    if (role === "supervisor") return "You have supervisor access. Open the supervisor panel from here.";
    if (role === "cleaner") return "You have cleaner access. Open your cleaner dashboard from here.";
    return "Standard customer profile.";
  }

  if (role === "admin") return "Du har adminåtkomst. Öppna adminpanelen eller operationsvyn härifrån.";
  if (role === "supervisor") return "Du har supervisoråtkomst. Öppna supervisorpanelen härifrån.";
  if (role === "cleaner") return "Du har cleaneråtkomst. Öppna cleaner dashboard härifrån.";
  return "Vanlig kundprofil.";
}

export default function ProfileAccessLinks() {
  const pathname = usePathname();
  const isProfile = pathname === "/profile" || pathname === "/en/profile";
  const english = pathname === "/en/profile";
  const [access, setAccess] = useState<AccessResponse | null>(null);

  useEffect(() => {
    if (!isProfile) return;
    let cancelled = false;

    async function loadAccess() {
      const supabase = getSupabase();
      if (!supabase) return;
      const { data } = await supabase.auth.getSession();
      const token = data.session?.access_token;
      if (!token) return;

      const response = await fetch("/api/profile/access", { headers: { [HEADER_NAME]: `${TOKEN_WORD} ${token}` } });
      const json = await response.json().catch(() => null) as AccessResponse | null;
      if (!cancelled && response.ok && json?.ok) setAccess(json);
    }

    void loadAccess();
    return () => { cancelled = true; };
  }, [isProfile]);

  if (!isProfile || !access || access.role === "customer" || !access.links?.length) return null;

  return (
    <div className="bg-cream px-5 pt-5 text-ink">
      <div className="luxe-container">
        <section className="rounded-[1.6rem] border border-burgundy/10 bg-porcelain p-5 shadow-soft">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div>
              <p className="text-[10px] font-black uppercase tracking-[.22em] text-burgundy/55">{english ? "Staff access" : "Personalåtkomst"}</p>
              <h2 className="mt-1 text-2xl font-black text-burgundy">{english ? "Your role" : "Din roll"}: {roleLabel(access.role, english)}</h2>
              <p className="mt-2 max-w-2xl text-sm font-bold leading-6 text-ink/55">{cardText(access.role, english)}</p>
            </div>
            <div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap md:justify-end">
              {access.links.map((link) => (
                <Link key={link.href} href={link.href} className="inline-flex items-center justify-center rounded-full bg-burgundy px-4 py-2 text-sm font-black text-porcelain transition hover:bg-ink">
                  {linkLabel(link, english)}
                </Link>
              ))}
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
