import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Privacy policy | Iboren",
  description: "Information about how Iboren handles personal data in connection with booking requests and contact."
};

const sections = [
  ["1. Who is responsible?", "Iboren is responsible for personal data submitted through the website, price calculator, booking forms, profile and email contact. The public contact location is Södertälje, Sweden. Contact: hej@iboren.se."],
  ["2. What data is collected?", "We may process name, email address, phone number, address, service, property details, preferred date and time, price-estimate details and messages you provide when using the calculator or sending a booking request."],
  ["3. Why is the data used?", "The data is used to prepare price estimates, receive and manage booking requests, send confirmation emails, contact you about a request and, when applicable, show requests in your profile."],
  ["4. Login and location", "If you sign in through a supported provider, basic account details such as name and email may be used to connect requests to your profile. Location sharing is optional and is used only to help suggest an address or area."],
  ["5. Technical providers", "Iboren uses technical providers for hosting, database and authentication services, and booking email delivery. They are used only as needed to operate the website and booking flow."],
  ["6. Retention", "Booking and estimate information is kept for as long as needed to handle the request, customer contact, administration and any legal or accounting obligations."],
  ["7. Your choices", "You can contact Iboren to request access to your data, correction of incorrect information or deletion where applicable. Some data may need to be kept when required for security, accounting or legal reasons."],
  ["8. Updates", "This policy may be updated when the website, services or providers change. The latest version is published on this page."]
];

export default function EnglishPrivacyPage() {
  return <main className="min-h-screen bg-cream py-16 text-ink"><article className="luxe-container max-w-4xl rounded-[2rem] bg-porcelain p-7 shadow-lg md:p-10"><Link href="/en" className="text-sm font-semibold text-burgundy">← Back to homepage</Link><p className="eyebrow mt-10">Iboren · Legal</p><h1 className="display mt-4 break-words text-4xl font-bold leading-[0.95] text-burgundy sm:text-5xl md:text-7xl">Privacy policy</h1><p className="mt-5 text-sm font-semibold text-ink/50">Last updated: 13 July 2026</p><div className="mt-8 rounded-2xl border border-burgundy/10 bg-cream p-5 text-sm leading-7 text-ink/65">This page explains how Iboren handles personal data connected to the website, price estimates, booking requests and email communication.</div><div className="mt-8 space-y-7 text-base leading-8 text-ink/70">{sections.map(([title, body]) => <section key={title}><h2 className="display text-2xl font-bold text-burgundy">{title}</h2><p className="mt-2">{body}</p></section>)}<section className="rounded-2xl border border-burgundy/10 bg-cream p-5"><h2 className="display text-2xl font-bold text-burgundy">Contact</h2><p className="mt-2">For privacy questions, contact <a href="mailto:hej@iboren.se" className="font-semibold text-burgundy">hej@iboren.se</a>.</p></section></div></article></main>;
}
