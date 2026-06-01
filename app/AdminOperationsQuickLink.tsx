"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export default function AdminOperationsQuickLink() {
  const pathname = usePathname();
  if (pathname !== "/admin") return null;

  return (
    <div className="bg-cream px-5 pt-5 text-ink">
      <div className="luxe-container">
        <Link
          href="/admin/operations"
          className="group flex flex-col gap-3 rounded-[1.35rem] border border-burgundy/10 bg-porcelain p-4 shadow-soft transition hover:-translate-y-0.5 hover:border-burgundy/25 sm:flex-row sm:items-center sm:justify-between"
        >
          <div>
            <p className="text-[10px] font-black uppercase tracking-[.22em] text-burgundy/55">Operations</p>
            <h2 className="mt-1 text-xl font-black text-burgundy sm:text-2xl">Need Action dashboard</h2>
            <p className="mt-1 text-sm font-bold leading-6 text-ink/55">Se vad som behöver beslut: nya förfrågningar, saknad personal, problem och väntande tidrapporter.</p>
          </div>
          <span className="inline-flex shrink-0 items-center justify-center rounded-full bg-burgundy px-4 py-2 text-sm font-black text-porcelain group-hover:bg-ink">
            Öppna
          </span>
        </Link>
      </div>
    </div>
  );
}
