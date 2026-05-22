export const dynamic = "force-dynamic";
export const revalidate = 0;

export default function RawEnglishSmokeTestPage() {
  return (
    <main className="min-h-screen bg-night px-6 py-24 text-porcelain">
      <div className="mx-auto max-w-3xl rounded-[2rem] border border-gold/20 bg-porcelain/10 p-8">
        <p className="text-xs font-bold uppercase tracking-[.3em] text-gold">Route smoke test</p>
        <h1 className="display mt-4 text-5xl uppercase">Iboren English raw route</h1>
        <p className="mt-6 text-lg leading-8 text-porcelain/75">This page does not import EnglishBookingPage or the Swedish booking form.</p>
        <p className="mt-6 rounded-2xl bg-gold px-4 py-3 font-bold text-night">Form version: EN-RAW-1</p>
      </div>
    </main>
  );
}
