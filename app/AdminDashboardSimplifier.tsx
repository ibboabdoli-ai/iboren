"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { createClient } from "@supabase/supabase-js";
import { ArrowRight, CalendarCheck2, ClipboardList, Clock3, CreditCard, LayoutDashboard, ShieldCheck, UsersRound } from "lucide-react";

const adminEmails = ["ibbo.abdoli@gmail.com"];

type AdminCard = {
  href: string;
  title: string;
  description: string;
  badge: string;
  icon: "operations" | "bookings" | "public" | "staff" | "time" | "payroll" | "supervisor" | "profile";
  primary?: boolean;
};

const cards: AdminCard[] = [
  {
    href: "/admin/operations",
    title: "Operations",
    description: "Daglig Need Action-vy: nya förfrågningar, saknad personal, problem och tidrapporter.",
    badge: "Start här",
    icon: "operations",
    primary: true
  },
  {
    href: "/admin?dashboard=1",
    title: "Booking dashboard",
    description: "Full lista med bokningar, status, cleaner assignment, anteckningar och CSV-export.",
    badge: "Full vy",
    icon: "bookings"
  },
  {
    href: "/admin/public-requests",
    title: "Public requests",
    description: "Förfrågningar utan konto. Granska, avvisa eller konvertera till riktig bokning.",
    badge: "Leads",
    icon: "public"
  },
  {
    href: "/admin?dashboard=1#staff-access",
    title: "Staff access",
    description: "Hantera admin, supervisor och cleaner roles utan Supabase SQL.",
    badge: "Roller",
    icon: "staff"
  },
  {
    href: "/admin/time-reports",
    title: "Time reports",
    description: "Granska, godkänn eller avvisa cleaner-rapporterade timmar.",
    badge: "Timmar",
    icon: "time"
  },
  {
    href: "/admin/payroll-basis",
    title: "Payroll basis",
    description: "Exportera löneunderlag och markera godkända poster som paid.",
    badge: "Lön",
    icon: "payroll"
  },
  {
    href: "/supervisor",
    title: "Supervisor",
    description: "Read-only översikt över dagens och kommande jobb samt assigned cleaners.",
    badge: "Översikt",
    icon: "supervisor"
  },
  {
    href: "/profile",
    title: "Profile",
    description: "Öppna kundprofilen och kontrollera role-länkar från användarens vy.",
    badge: "Konto",
    icon: "profile"
  }
];

function getSupabase() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !key) return null;
  return createClient(url, key, { auth: { persistSession: true, autoRefreshToken: true, detectSessionInUrl: false } });
}

function CardIcon({ icon }: { icon: AdminCard["icon"] }) {
  const className = "h-6 w-6";
  if (icon === "operations") return <LayoutDashboard className={className} />;
  if (icon === "bookings") return <CalendarCheck2 className={className} />;
  if (icon === "public") return <ClipboardList className={className} />;
  if (icon === "staff") return <UsersRound className={className} />;
  if (icon === "time") return <Clock3 className={className} />;
  if (icon === "payroll") return <CreditCard className={className} />;
  if (icon === "supervisor") return <ShieldCheck className={className} />;
  return <ArrowRight className={className} />;
}

function isFullDashboardUrl() {
  if (typeof window === "undefined") return false;
  return new URLSearchParams(window.location.search).get("dashboard") === "1";
}

export default function AdminDashboardSimplifier() {
  const pathname = usePathname();
  const [isAdmin, setIsAdmin] = useState(false);
  const [showFullDashboard, setShowFullDashboard] = useState(false);
  const showHub = pathname === "/admin" && !showFullDashboard && isAdmin;

  useEffect(() => {
    setShowFullDashboard(isFullDashboardUrl());
  }, [pathname]);

  useEffect(() => {
    let cancelled = false;

    async function checkAdmin() {
      if (pathname !== "/admin") {
        setIsAdmin(false);
        return;
      }
      const supabase = getSupabase();
      if (!supabase) return;
      const { data } = await supabase.auth.getUser();
      if (cancelled) return;
      setIsAdmin(Boolean(data.user?.email && adminEmails.includes(data.user.email.toLowerCase())));
    }

    void checkAdmin();
    return () => { cancelled = true; };
  }, [pathname]);

  useEffect(() => {
    document.body.classList.toggle("iboren-admin-hub-active", showHub);
    return () => document.body.classList.remove("iboren-admin-hub-active");
  }, [showHub]);

  if (!showHub) return null;

  return (
    <div className="iboren-admin-hub min-h-screen bg-cream py-10 text-ink md:py-14">
      <style jsx global>{`
        body.iboren-admin-hub-active > main,
        body.iboren-admin-hub-active > div:not(.iboren-admin-hub) main {
          display: none !important;
        }
      `}</style>
      <section className="luxe-container">
        <div className="rounded-[2.5rem] bg-burgundy p-7 text-porcelain shadow-luxe md:p-9">
          <p className="text-xs font-black uppercase tracking-[.32em] text-gold">Iboren Admin</p>
          <h1 className="display mt-3 text-5xl font-bold leading-[.92] md:text-7xl">Admin start</h1>
          <p className="mt-5 max-w-2xl leading-8 text-porcelain/72">
            Välj rätt arbetsyta. Operations är för dagliga beslut. Booking dashboard är den fulla listan när du behöver ändra status, tilldela cleaner eller exportera CSV.
          </p>
        </div>

        <div className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {cards.map((card) => (
            <Link
              key={card.href + card.title}
              href={card.href}
              className={`group rounded-[1.8rem] border p-5 shadow-soft transition hover:-translate-y-0.5 hover:shadow-luxe ${card.primary ? "border-burgundy bg-burgundy text-porcelain" : "border-burgundy/10 bg-porcelain text-ink"}`}
            >
              <div className="flex items-start justify-between gap-4">
                <span className={`grid h-12 w-12 place-items-center rounded-full ${card.primary ? "bg-gold text-ink" : "bg-cream text-burgundy"}`}>
                  <CardIcon icon={card.icon} />
                </span>
                <span className={`rounded-full px-3 py-1 text-[10px] font-black uppercase tracking-[.16em] ${card.primary ? "bg-night/25 text-gold" : "bg-cream text-ink/55 ring-1 ring-burgundy/10"}`}>
                  {card.badge}
                </span>
              </div>
              <h2 className={`display mt-5 text-3xl font-bold ${card.primary ? "text-porcelain" : "text-burgundy"}`}>{card.title}</h2>
              <p className={`mt-3 text-sm font-bold leading-6 ${card.primary ? "text-porcelain/70" : "text-ink/58"}`}>{card.description}</p>
              <span className={`mt-5 inline-flex items-center gap-2 text-sm font-black ${card.primary ? "text-gold" : "text-burgundy"}`}>
                Öppna <ArrowRight className="h-4 w-4 transition group-hover:translate-x-1" />
              </span>
            </Link>
          ))}
        </div>

        <div className="mt-6 rounded-[1.8rem] border border-burgundy/10 bg-porcelain p-5 text-sm leading-7 text-ink/62 shadow-sm">
          <p><strong className="text-ink">Tips:</strong> använd <span className="font-black text-burgundy">Operations</span> först. Gå till fulla Booking dashboard bara när du behöver detaljhantera en bokning.</p>
        </div>
      </section>
    </div>
  );
}
