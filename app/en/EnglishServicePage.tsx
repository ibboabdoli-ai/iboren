import Link from "next/link";
import { ArrowRight, Building2, CheckCircle2, Home, ShieldCheck, Sparkles, Truck } from "lucide-react";

export type EnglishServiceKey = "home" | "move" | "office" | "windows";

const serviceContent = {
  home: {
    icon: Home,
    title: "Home cleaning",
    kicker: "Iboren services",
    intro: "Send a clear request for home cleaning in Södertälje and Stockholm. Iboren collects address, size, rooms, preferred date, frequency and special requests in one structured flow.",
    badge: "RUT-ready",
    cardTitle: "For homes that should feel ready.",
    items: [
      "Booking request in a few minutes",
      "Address, size, date and notes are collected clearly",
      "Works for both one-time and recurring home cleaning",
      "Prepared for quote and RUT information"
    ],
    includedTitle: "Home cleaning with clearer quote details.",
    includedIntro: "Iboren collects the practical information before the booking is confirmed, so scope, frequency and expectations are easier to understand.",
    included: [
      "Kitchen, bathroom and living areas according to agreed scope",
      "Vacuuming, wiping and general cleaning based on need",
      "Possibility to add oven, cabinets, balcony and window cleaning",
      "Clear quote basis before the booking is confirmed"
    ],
    faq: [
      { q: "Can I book home cleaning online?", a: "You can send a booking request online. The booking is confirmed only after time, scope and terms have been agreed." },
      { q: "Can I choose recurring home cleaning?", a: "Yes. The form supports one-time, weekly, every other week and monthly cleaning." },
      { q: "What information is needed?", a: "Address, area, size, rooms, bathrooms, preferred date, time window and special requests." },
      { q: "Is the price binding immediately?", a: "No. Final price and any RUT information must be confirmed before the work is carried out." }
    ]
  },
  move: {
    icon: Truck,
    title: "Move-out cleaning",
    kicker: "Moving cleaning",
    intro: "Send a structured request for move-out cleaning. Iboren collects property size, address, date and special requirements so the handover can be planned clearly.",
    badge: "Checklist-ready",
    cardTitle: "For a cleaner handover.",
    items: [
      "Clear request for move-out cleaning",
      "Size, date and property details in one place",
      "Good basis for quote and scope confirmation",
      "Suitable before handover or inspection"
    ],
    includedTitle: "Move-out cleaning with clear scope before confirmation.",
    includedIntro: "Move-out cleaning depends on size, condition, accessibility and any extra requirements. Iboren helps collect the information before confirmation.",
    included: [
      "Kitchen, bathroom and living spaces according to agreed checklist",
      "Information about size, rooms, bathrooms and property type",
      "Possibility to note special conditions or add-ons",
      "Quote and scope are confirmed before the job becomes binding"
    ],
    faq: [
      { q: "Can I request move-out cleaning online?", a: "Yes. Send the request online and Iboren will confirm scope, time and final price." },
      { q: "Is the request binding?", a: "No. The request becomes a confirmed job only after Iboren confirms details with you." },
      { q: "What affects the price?", a: "Size, condition, windows, accessibility and extra services can affect the final price." },
      { q: "Can I add notes for inspection or key handling?", a: "Yes. Use the special requests field in the booking form." }
    ]
  },
  office: {
    icon: Building2,
    title: "Office cleaning",
    kicker: "Business cleaning",
    intro: "Send a request for office cleaning in Södertälje and Stockholm. Iboren collects location, area, frequency, preferred time and notes for recurring business cleaning.",
    badge: "Business quote",
    cardTitle: "For workplaces that need structure.",
    items: [
      "Request office cleaning online",
      "Suitable for recurring workplace cleaning",
      "Clear basis for business quote",
      "Flexible notes for access, areas and timing"
    ],
    includedTitle: "Office cleaning with a clearer operational basis.",
    includedIntro: "Office cleaning is usually handled through a business quote. Iboren collects the details needed to understand the location, frequency and scope.",
    included: [
      "Office areas, meeting rooms and entrance areas according to agreement",
      "Frequency and preferred time window collected in the request",
      "Notes for access, keys, alarms or special routines",
      "Final scope and price are confirmed before work starts"
    ],
    faq: [
      { q: "Can companies send requests online?", a: "Yes. Companies can send a request for office cleaning and receive a tailored quote." },
      { q: "Does RUT apply to office cleaning?", a: "No. Office cleaning is handled as a business price or quote." },
      { q: "Can we request recurring cleaning?", a: "Yes. The request can include weekly, every other week or monthly frequency." },
      { q: "Can we add access notes?", a: "Yes. Add access, alarm, key handling or other operational notes in the form." }
    ]
  },
  windows: {
    icon: Sparkles,
    title: "Window cleaning",
    kicker: "Window service",
    intro: "Send a request for window cleaning as a separate service or as an add-on to home, move-out or office cleaning.",
    badge: "Add-on ready",
    cardTitle: "For brighter rooms and clearer views.",
    items: [
      "Request window cleaning online",
      "Can be selected as an extra service",
      "Good basis for quote and planning",
      "Works for private homes and offices"
    ],
    includedTitle: "Window cleaning with clearer planning details.",
    includedIntro: "Window cleaning can vary depending on number of windows, access, height and condition. Iboren collects notes before confirmation.",
    included: [
      "Window cleaning as separate service or add-on",
      "Property and access information collected in the request",
      "Special notes for balcony, floor and accessibility",
      "Final scope and price are confirmed before the job starts"
    ],
    faq: [
      { q: "Can I request window cleaning separately?", a: "Yes. Select window cleaning as the service in the request form." },
      { q: "Can I add it to home cleaning?", a: "Yes. Window cleaning can also be selected as an extra service." },
      { q: "What affects the price?", a: "Number of windows, access, height, condition and add-ons may affect the final price." },
      { q: "Is the request binding immediately?", a: "No. Iboren confirms scope, price and time before the job is binding." }
    ]
  }
} as const;

export function EnglishServicePage({ service }: { service: EnglishServiceKey }) {
  const item = serviceContent[service];
  const Icon = item.icon;
  return (
    <main className="min-h-screen bg-cream text-ink">
      <section className="relative overflow-hidden py-20 md:py-28">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_65%_20%,rgba(212,165,116,.35),transparent_32%),radial-gradient(circle_at_15%_70%,rgba(107,39,55,.14),transparent_34%)]" />
        <div className="luxe-container relative grid gap-10 md:grid-cols-[.95fr_1.05fr] md:items-center">
          <div>
            <Link href="/en" className="mb-10 inline-flex text-sm font-bold text-burgundy">← Back</Link>
            <p className="eyebrow">{item.kicker}</p>
            <h1 className="display mt-4 text-6xl font-bold leading-[.88] text-burgundy md:text-8xl">{item.title}</h1>
            <p className="mt-7 max-w-2xl text-lg leading-8 text-ink/70 md:text-xl">{item.intro}</p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Link href="/en#booking" className="btn-primary">Send request <ArrowRight size={18} /></Link>
              <Link href="/en/prices" className="btn-secondary">Calculate price</Link>
            </div>
          </div>
          <div className="rounded-[2.5rem] border border-burgundy/10 bg-porcelain/70 p-8 shadow-luxe backdrop-blur-xl">
            <div className="mb-16 flex items-center justify-between">
              <div className="grid h-16 w-16 place-items-center rounded-full bg-burgundy text-porcelain"><Icon size={30} /></div>
              <span className="rounded-full border border-gold/50 bg-gold/20 px-4 py-2 text-xs font-bold uppercase tracking-[.24em] text-burgundy">{item.badge}</span>
            </div>
            <h2 className="display text-4xl font-bold text-ink">{item.cardTitle}</h2>
            <div className="mt-7 grid gap-4">
              {item.items.map((point) => <p key={point} className="flex gap-3 text-ink/70"><CheckCircle2 className="mt-1 h-5 w-5 shrink-0 text-burgundy" /> {point}</p>)}
            </div>
          </div>
        </div>
      </section>

      <section className="bg-porcelain py-16"><div className="luxe-container grid gap-5 md:grid-cols-3"><Info icon={<Sparkles />} title="Smart flow" text="The form keeps the customer details structured from the first contact." /><Info icon={<ShieldCheck />} title="Clear basis" text="No binding booking before price, time and scope are confirmed." /><Info icon={<Icon />} title="Flexible" text="Works for one-time requests, recurring services and add-ons." /></div></section>

      <section className="bg-cream py-16">
        <div className="luxe-container grid gap-10 md:grid-cols-[.9fr_1.1fr] md:items-start">
          <div>
            <p className="eyebrow">What is included?</p>
            <h2 className="display mt-3 text-4xl font-bold text-burgundy md:text-6xl">{item.includedTitle}</h2>
            <p className="mt-5 leading-8 text-ink/65">{item.includedIntro}</p>
          </div>
          <div className="grid gap-4">
            {item.included.map((point) => <p key={point} className="flex gap-3 rounded-2xl bg-porcelain p-5 text-ink/70 shadow-sm"><CheckCircle2 className="mt-1 h-5 w-5 shrink-0 text-burgundy" /> {point}</p>)}
          </div>
        </div>
      </section>

      <section className="bg-porcelain py-16">
        <div className="luxe-container max-w-4xl">
          <p className="eyebrow">FAQ</p>
          <h2 className="display mt-3 text-4xl font-bold text-burgundy md:text-6xl">Common questions about {item.title.toLowerCase()}.</h2>
          <div className="mt-10 grid gap-4">
            {item.faq.map((faq) => <article key={faq.q} className="rounded-[1.5rem] bg-cream p-6 shadow-sm"><h3 className="font-bold text-burgundy">{faq.q}</h3><p className="mt-2 leading-7 text-ink/65">{faq.a}</p></article>)}
          </div>
          <div className="mt-10 rounded-[2rem] bg-burgundy p-7 text-porcelain"><h2 className="display text-4xl font-bold">Ready to send a request?</h2><p className="mt-3 text-porcelain/70">Fill in address, size, rooms and preferred date so Iboren can follow up.</p><Link href="/en#booking" className="mt-6 inline-flex rounded-full bg-gold px-5 py-3 text-sm font-black uppercase tracking-[.12em] text-ink">Start request</Link></div>
        </div>
      </section>
    </main>
  );
}

function Info({ icon, title, text }: { icon: React.ReactNode; title: string; text: string }) {
  return <article className="rounded-[2rem] bg-cream p-6 shadow-soft"><div className="mb-6 grid h-12 w-12 place-items-center rounded-full bg-burgundy text-porcelain">{icon}</div><h3 className="display text-3xl font-bold text-burgundy">{title}</h3><p className="mt-3 leading-7 text-ink/65">{text}</p></article>;
}
