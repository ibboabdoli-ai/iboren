import type { Metadata } from "next";
import Link from "next/link";
import type { ReactNode } from "react";
import AdminBookingNotesPolish from "./AdminBookingNotesPolish";
import styles from "./admin.module.css";

const title = "Iboren Admin";
const description = "Administrera bokningar, kunder och arbetsflöden i Iboren.";

export const metadata: Metadata = {
  title,
  description,
  applicationName: "Iboren Admin",
  manifest: "/api/pwa-manifest?start=/admin",
  alternates: { canonical: "https://iboren.se/admin" },
  appleWebApp: {
    capable: true,
    title: "Iboren Admin",
    statusBarStyle: "black-translucent"
  }
};

const adminLinks = [
  { href: "/admin", label: "Dashboard" },
  { href: "/admin/operations", label: "Operations" },
  { href: "/admin/public-requests", label: "Public requests" },
  { href: "/admin/time-reports", label: "Time reports" },
  { href: "/admin/payroll-basis", label: "Payroll basis" },
  { href: "/admin/payroll-paid", label: "Paid archive" },
  { href: "/supervisor", label: "Supervisor" },
  { href: "/profile", label: "Profile" }
];

export default function AdminLayout({ children }: { children: ReactNode }) {
  return (
    <div className={styles.adminShell}>
      <AdminBookingNotesPolish />
      <nav className="sticky top-0 z-50 border-b border-burgundy/10 bg-cream/95 px-3 py-3 backdrop-blur md:px-6" aria-label="Admin quick navigation">
        <div className="mx-auto flex max-w-7xl gap-2 overflow-x-auto">
          {adminLinks.map((link) => (
            <Link key={link.href} href={link.href} className="shrink-0 rounded-full bg-porcelain px-4 py-2 text-xs font-black uppercase tracking-[.12em] text-burgundy ring-1 ring-burgundy/10">
              {link.label}
            </Link>
          ))}
        </div>
      </nav>
      {children}
    </div>
  );
}
