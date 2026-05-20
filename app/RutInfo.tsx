import { CheckCircle2, Info } from "lucide-react";

const rutPoints = [
  "RUT-avdrag gäller normalt för hushållsnära tjänster som hemstädning, flyttstädning, storstädning och fönsterputs.",
  "Om kunden har rätt till RUT betalar kunden normalt den reducerade delen av arbetskostnaden direkt på fakturan.",
  "Iboren ansöker sedan om resterande del från Skatteverket efter att arbetet är utfört och fakturan är betald.",
  "Exempel: om arbetskostnaden är 2 000 kr betalar kunden normalt 1 000 kr efter RUT och Iboren ansöker om resterande 1 000 kr från Skatteverket.",
  "RUT gäller arbetskostnaden. Material, resekostnader och vissa tillägg kan hanteras separat.",
  "RUT gäller inte kontorsstädning för företag. Där visas priset som företagspris/offert."
];

export default function RutInfo() {
  return (
    <section className="bg-cream py-16" id="rut-avdrag">
      <div className="luxe-container grid gap-8 lg:grid-cols-[.9fr_1.1fr] lg:items-start">
        <div>
          <p className="eyebrow">RUT-avdrag</p>
          <h2 className="display mt-4 text-5xl font-bold leading-[.92] text-burgundy md:text-6xl">Så fungerar RUT-avdraget för städning</h2>
          <p className="mt-6 max-w-2xl text-lg leading-8 text-ink/72">RUT gör att du som privatkund kan få lägre kostnad för arbetsdelen av hushållsnära tjänster. Därför visar Iboren både pris före RUT och pris efter RUT i prisberäknaren.</p>
        </div>

        <div className="rounded-[2rem] border border-burgundy/10 bg-porcelain p-6 shadow-soft md:p-8">
          <div className="mb-6 flex items-start gap-3 rounded-2xl bg-cream p-4 text-sm leading-7 text-ink/72">
            <Info className="mt-1 h-5 w-5 shrink-0 text-burgundy" />
            <p>RUT är en skattereduktion på arbetskostnaden. Det betyder att kunden normalt betalar priset efter RUT, medan Iboren ansöker om resterande del från Skatteverket.</p>
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
