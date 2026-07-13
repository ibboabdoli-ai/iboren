import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Terms | Iboren",
  description: "Terms for using the Iboren website and sending booking requests."
};

const sections = [
  ["1. About Iboren", "Iboren has its public contact location in Södertälje, Sweden. The website helps customers create and send cleaning-service booking requests."],
  ["2. Requests and confirmation", "A submitted request is not a confirmed booking. Iboren confirms the time, scope, final price and practical conditions before a booking becomes binding."],
  ["3. Customer information", "You are responsible for providing accurate details, including address, contact details, property size, access, preferred date and special requests. Incomplete or incorrect details can affect price, timing or the ability to carry out the service."],
  ["4. Price and RUT", "Website prices are estimates unless stated otherwise. The final scope, price and any RUT deduction are confirmed before work starts. Extra services and practical conditions can affect price and duration."],
  ["5. Changes and cancellation", "You may request a change or cancellation. Additional terms for late cancellation, rescheduling or lack of access may apply to confirmed work and will be communicated before the service is carried out."],
  ["6. Communication", "Iboren may send email about received requests, confirmation, status changes, cancellation and follow-up. You are responsible for keeping your email address and phone number accurate."],
  ["7. Availability and updates", "Iboren aims to keep the website available but cannot guarantee uninterrupted operation. These terms may be updated when services or working processes change; the latest version is published here."]
];

export default function EnglishTermsPage() {
  return <main className="min-h-screen bg-cream py-16 text-ink"><article className="luxe-container max-w-4xl rounded-[2rem] bg-porcelain p-7 shadow-lg md:p-10"><Link href="/en" className="text-sm font-semibold text-burgundy">← Back to homepage</Link><p className="eyebrow mt-10">Iboren · Legal</p><h1 className="display mt-4 text-5xl font-bold leading-[0.9] text-burgundy md:text-7xl">Terms</h1><p className="mt-5 text-sm font-semibold text-ink/50">Last updated: 13 July 2026</p><div className="mt-8 rounded-2xl border border-burgundy/10 bg-cream p-5 text-sm leading-7 text-ink/65">These terms apply to use of the Iboren website and its digital booking-request flow.</div><div className="mt-8 space-y-7 text-base leading-8 text-ink/70">{sections.map(([title, body]) => <section key={title}><h2 className="display text-2xl font-bold text-burgundy">{title}</h2><p className="mt-2">{body}</p></section>)}<section className="rounded-2xl border border-burgundy/10 bg-cream p-5"><h2 className="display text-2xl font-bold text-burgundy">Contact</h2><p className="mt-2">For questions about these terms, contact <a href="mailto:hej@iboren.se" className="font-semibold text-burgundy">hej@iboren.se</a>.</p></section></div></article></main>;
}
