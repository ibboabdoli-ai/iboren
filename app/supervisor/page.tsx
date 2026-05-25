import Link from "next/link";
import { ArrowLeft, CalendarDays, ShieldCheck } from "lucide-react";

export default function SupervisorPage() {
  return (
    <main className="min-h-screen bg-cream py-12 text-ink md:py-16">
      <section className="luxe-container">
        <Link href="/admin" className="mb-8 inline-flex items-center gap-2 text-sm font-bold text-burgundy">
          <ArrowLeft size={17} /> Back to admin
        </Link>

        <div className="rounded-[2.5rem] bg-burgundy p-7 text-porcelain shadow-luxe md:p-9">
          <div className="mb-5 grid h-14 w-14 place-items-center rounded-full bg-gold text-ink">
            <ShieldCheck size={25} />
          </div>
          <p className="text-xs font-bold uppercase tracking-[.32em] text-gold">Iboren Supervisor</p>
          <h1 className="display mt-3 text-5xl font-bold leading-[.9] md:text-7xl">Daily operations</h1>
          <p className="mt-5 max-w-2xl leading-8 text-porcelain/70">
            Base supervisor page. Next step will connect today&apos;s jobs and the next 7 days.
          </p>
        </div>

        <div className="mt-6 grid gap-4 md:grid-cols-3">
          <article className="rounded-[1.5rem] bg-porcelain p-5 shadow-soft">
            <CalendarDays className="mb-4 h-6 w-6 text-burgundy" />
            <p className="text-xs font-black uppercase tracking-[.2em] text-burgundy/55">Today</p>
            <p className="display mt-3 text-5xl font-bold text-burgundy">—</p>
          </article>
          <article className="rounded-[1.5rem] bg-porcelain p-5 shadow-soft">
            <CalendarDays className="mb-4 h-6 w-6 text-burgundy" />
            <p className="text-xs font-black uppercase tracking-[.2em] text-burgundy/55">Next 7 days</p>
            <p className="display mt-3 text-5xl font-bold text-burgundy">—</p>
          </article>
          <article className="rounded-[1.5rem] bg-porcelain p-5 shadow-soft">
            <ShieldCheck className="mb-4 h-6 w-6 text-burgundy" />
            <p className="text-xs font-black uppercase tracking-[.2em] text-burgundy/55">Status</p>
            <p className="display mt-3 text-4xl font-bold text-burgundy">Base</p>
          </article>
        </div>
      </section>
    </main>
  );
}
