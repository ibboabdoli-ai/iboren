import { CheckCircle2, Info } from "lucide-react";

const rutPoints = [
  "RUT-avdrag kan tillämpas enligt Skatteverkets regler när villkoren är uppfyllda.",
  "Alla priser för privatpersoner visas inklusive moms. Moms ingår i pris före RUT och pris efter RUT.",
  "Pris efter RUT är kundens uppskattade pris att betala när RUT-avdrag kan användas.",
  "RUT gäller normalt bara för privatpersoner och endast på arbetskostnaden.",
  "Material, resekostnader och vissa tillägg kan hanteras separat och omfattas normalt inte av RUT.",
  "Om RUT inte godkänns av Skatteverket kan resterande belopp faktureras kunden.",
  "RUT gäller inte kontorsstädning för företag. Där visas priset som företagspris/offert."
];

export default function RutInfo() {
  return (
    <section className="bg-cream py-16" id="rut-avdrag">
      <div className="luxe-container grid gap-8 lg:grid-cols-[.9fr_1.1fr] lg:items-start">
        <div>
          <p className="eyebrow">RUT-avdrag</p>
          <h2 className="display mt-4 text-5xl font-bold leading-[.92] text-burgundy md:text-6xl">Så fungerar RUT-avdraget för städning</h2>
          <p className="mt-6 max-w-2xl text-lg leading-8 text-ink/72">RUT-avdrag kan tillämpas enligt Skatteverkets regler när villkoren är uppfyllda. Därför visar Iboren pris före RUT och en prisindikation efter RUT i prisberäknaren. För privatpersoner visas priser inklusive moms.</p>
        </div>

        <div className="rounded-[2rem] border border-burgundy/10 bg-porcelain p-6 shadow-soft md:p-8">
          <div className="mb-6 flex items-start gap-3 rounded-2xl bg-cream p-4 text-sm leading-7 text-ink/72">
            <Info className="mt-1 h-5 w-5 shrink-0 text-burgundy" />
            <p>RUT är en skattereduktion på arbetskostnaden. Avdraget kan tillämpas när Skatteverkets villkor är uppfyllda och slutlig hantering sker i samband med fakturering. Moms ingår i priset som visas för privatpersoner.</p>
          </div>
          <div className="grid gap-3">
            {rutPoints.map((point) => (
              <p key={point} className="flex gap-3 rounded-2xl bg-cream p-4 text-sm leading-7 text-ink/75">
                <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-burgundy" />
                <span>{point}</span>
              </p>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
