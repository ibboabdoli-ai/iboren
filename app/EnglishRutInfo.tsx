import { CheckCircle2, Info } from "lucide-react";

const rutPoints = [
  "RUT deduction may apply according to Skatteverket rules when the conditions are fulfilled.",
  "RUT normally applies only to private customers and only to labour cost.",
  "Materials, travel costs and some add-ons may be handled separately and are normally not covered by RUT.",
  "If RUT is not approved by Skatteverket, the remaining amount may be invoiced to the customer.",
  "RUT does not apply to office cleaning for companies. That price is shown as a business price or quote."
];

export default function EnglishRutInfo() {
  return (
    <section className="bg-cream py-16" id="rut-deduction">
      <div className="luxe-container grid gap-8 lg:grid-cols-[.9fr_1.1fr] lg:items-start">
        <div>
          <p className="eyebrow">RUT deduction</p>
          <h2 className="display mt-4 text-5xl font-bold leading-[.92] text-burgundy md:text-6xl">How RUT deduction works for cleaning</h2>
          <p className="mt-6 max-w-2xl text-lg leading-8 text-ink/72">RUT deduction may apply according to Skatteverket rules when the conditions are fulfilled. Iboren therefore shows price before RUT and a price indication after RUT in the calculator.</p>
        </div>

        <div className="iboren-card-glass iboren-card-glass-hover rounded-[2rem] p-6 shadow-soft md:p-8">
          <div className="mb-6 flex items-start gap-3 rounded-2xl bg-cream p-4 text-sm leading-7 text-ink/72">
            <Info className="mt-1 h-5 w-5 shrink-0 text-burgundy" />
          <p>RUT is a tax reduction on labour cost. The deduction may be applied when the requirements from Skatteverket are fulfilled and the final handling is made during invoicing.</p>
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
