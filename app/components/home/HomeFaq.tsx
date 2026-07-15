import { ArrowUpRight, ChevronDown } from "lucide-react";
import Link from "next/link";

const faqs = [
  {
    question: "När får jag ett slutligt pris?",
    answer: "Du ser en prisindikation först. Tid, omfattning och slutpris bekräftas innan något bokas."
  },
  {
    question: "Hur fungerar RUT-avdraget?",
    answer: "RUT kan ge avdrag med upp till 50 procent av godkänd arbetskostnad när villkoren är uppfyllda och du har RUT-utrymme kvar."
  },
  {
    question: "Vilka områden tar ni emot förfrågningar i?",
    answer: "Vi tar emot förfrågningar för städning i Södertälje och Stockholm."
  },
  {
    question: "Kan jag skicka en förfrågan utan att boka direkt?",
    answer: "Ja. En förfrågan är inte bindande. Vi bekräftar detaljerna med dig innan en bokning blir klar."
  },
  {
    question: "Vilka tjänster kan jag få hjälp med?",
    answer: "Du kan fråga om hemstädning, flyttstädning, kontorsstädning och fönsterputs."
  }
];

const faqSchema = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: faqs.map((faq) => ({
    "@type": "Question",
    name: faq.question,
    acceptedAnswer: {
      "@type": "Answer",
      text: faq.answer
    }
  }))
};

export default function HomeFaq() {
  return (
    <section id="faq" aria-labelledby="faq-heading" className="relative overflow-hidden bg-night py-24 text-porcelain md:py-32">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema).replace(/</g, "\\u003c") }} />
      <div aria-hidden="true" className="pointer-events-none absolute inset-y-0 right-0 hidden w-[58%] overflow-hidden lg:block">
        <div className="absolute -right-48 top-[-7rem] h-[28rem] w-[49rem] -rotate-12 border border-gold/10" />
        <div className="absolute -right-40 top-20 h-[22rem] w-[43rem] -rotate-12 border border-gold/10" />
        <div className="absolute -right-32 top-52 h-[16rem] w-[36rem] -rotate-12 border border-gold/10" />
      </div>
      <div className="luxe-container relative grid gap-10 lg:grid-cols-[.82fr_1.18fr] lg:gap-16">
        <div className="lg:sticky lg:top-28 lg:self-start">
          <p className="text-[11px] font-bold uppercase tracking-[.38em] text-gold">IV / Vanliga frågor</p>
          <h2 id="faq-heading" className="display mt-4 max-w-lg text-5xl font-normal uppercase leading-[.9] md:text-7xl">Tydliga svar innan du skickar.</h2>
          <p className="mt-6 max-w-md leading-7 text-porcelain/65">Allt viktigt ska vara enkelt att förstå redan innan du går vidare.</p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link href="/priser#pris-kalkylator" data-site-analytics-event="quote_cta_click" className="btn-secondary">Få pris direkt <ArrowUpRight size={17} /></Link>
            <Link href="/boka-utan-konto" data-site-analytics-event="booking_cta_click" className="rounded-full border border-gold/35 px-5 py-3 text-[11px] font-bold uppercase tracking-[.18em] text-gold transition hover:bg-gold/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold motion-reduce:transition-none">Skicka förfrågan</Link>
          </div>
        </div>

        <div className="border-y border-gold/15">
          {faqs.map((faq) => (
            <details key={faq.question} className="group border-b border-gold/15 last:border-b-0">
              <summary className="flex cursor-pointer list-none items-center justify-between gap-5 py-6 text-left text-lg font-bold text-porcelain outline-none transition hover:text-gold focus-visible:ring-2 focus-visible:ring-gold focus-visible:ring-inset md:py-7 md:text-xl">
                <span>{faq.question}</span>
                <ChevronDown aria-hidden="true" className="h-5 w-5 shrink-0 text-gold transition-transform duration-200 group-open:rotate-180 motion-reduce:transition-none" />
              </summary>
              <p className="max-w-2xl pb-7 pr-10 leading-7 text-porcelain/68">{faq.answer}</p>
            </details>
          ))}
        </div>
      </div>
    </section>
  );
}
