import type { Metadata } from "next";
import EnglishInfoPage from "../../EnglishInfoPage";

type FaqItem = { q: string; a: string };

type PageContent = {
  title: string;
  eyebrow: string;
  description: string;
  city?: string;
  service?: string;
  urlPath?: string;
  points: string[];
  included?: string[];
  priceText?: string;
  rutText?: string;
  faq?: FaqItem[];
};

const rutPrivate = "RUT deductions may apply for private customers according to Skatteverket rules when the conditions are fulfilled. RUT normally applies to labour cost, not material or travel costs.";
const noRutCompany = "RUT does not apply to company cleaning. Office cleaning is handled as a business price or quote.";

const homeFaq: FaqItem[] = [
  { q: "Is home cleaning a confirmed booking immediately?", a: "No. The form sends a booking request. Iboren checks availability and gets back with confirmation." },
  { q: "Can RUT apply to home cleaning?", a: "Yes, RUT deductions may apply for private customers according to Skatteverket rules when the conditions are fulfilled." },
  { q: "What affects the price?", a: "Size, number of bathrooms, frequency, add-ons and the condition of the home can affect the final price." }
];

const moveFaq: FaqItem[] = [
  { q: "What affects the price for move-out cleaning?", a: "Size, condition, bathrooms, windows, balcony, access and selected add-ons can affect the final price." },
  { q: "Can RUT apply to move-out cleaning?", a: "Yes, RUT deductions may apply for private customers according to Skatteverket rules when the conditions are fulfilled." },
  { q: "When is the request confirmed?", a: "Iboren checks the details and availability first. The request becomes confirmed only after Iboren confirms time and scope." }
];

const windowFaq: FaqItem[] = [
  { q: "What affects the price for window cleaning?", a: "Number of windows, access, floor level, window type and condition can affect the final price." },
  { q: "Can window cleaning be added to another service?", a: "Yes. Window cleaning can be requested as a separate service or as an add-on to home cleaning or move-out cleaning." },
  { q: "Can RUT apply to window cleaning?", a: "RUT deductions may apply for private customers according to Skatteverket rules when the conditions are fulfilled." }
];

const officeFaq: FaqItem[] = [
  { q: "Does RUT apply to office cleaning?", a: "No. RUT does not apply to company cleaning. Office cleaning is handled as a business price or quote." },
  { q: "Can office cleaning be recurring?", a: "Yes. The request can include frequency, size, preferred time window and workplace needs." },
  { q: "What affects the price?", a: "Size, frequency, type of premises, access, time window and service scope can affect the quote." }
];

const serviceContent: Record<string, PageContent> = {
  "jobs": {
    title: "Work with Iboren",
    eyebrow: "Jobs",
    description: "Iboren is looking for reliable and detail-oriented people who want to work with cleaning services in Södertälje and Stockholm.",
    urlPath: "/en/jobs",
    points: ["Send an interest application", "Tell us your availability", "Describe your cleaning experience", "Attach CV or profile link when possible"],
    included: ["Interest application for cleaning work", "Information about availability and experience", "Review before any contact or interview", "Focus on reliability, quality and customer service"],
    faq: [{ q: "Can I send an application online?", a: "Yes. Use the job form and Iboren will review your interest application." }]
  },
  "about": {
    title: "About Iboren",
    eyebrow: "About us",
    description: "Iboren helps customers send clear cleaning requests with price indications, RUT information and fast follow-up in Södertälje and Stockholm.",
    urlPath: "/en/about",
    points: ["Clear booking requests", "Price indication before confirmation", "Services for homes and companies", "Focus on Södertälje and Stockholm"],
    included: ["Cleaning requests for private customers and companies", "Clear wording before confirmation", "RUT information for eligible private services", "Local focus in Södertälje and Stockholm"]
  },
  "privacy": {
    title: "Privacy",
    eyebrow: "Legal",
    description: "Information about how Iboren handles personal information in connection with booking requests and contact forms.",
    urlPath: "/en/privacy",
    points: ["Data is used to handle requests", "Contact details are used for follow-up", "Information is handled with care", "Contact Iboren for questions"]
  },
  "terms": {
    title: "Terms",
    eyebrow: "Legal",
    description: "Terms for booking requests, price indications, RUT information and service confirmation with Iboren.",
    urlPath: "/en/terms",
    points: ["A request is not a confirmed booking", "Availability is checked before confirmation", "Final price is confirmed before work starts", "RUT may apply according to Skatteverket rules"]
  },
  "home-cleaning": {
    title: "Home cleaning",
    eyebrow: "Service",
    service: "Home cleaning",
    urlPath: "/en/home-cleaning",
    description: "Home cleaning for one-time or recurring needs. Send a request with address, size, date, frequency and preferences.",
    points: ["One-time or recurring cleaning", "RUT may apply for private customers", "Clear request before confirmation", "Suitable for apartments, houses and townhouses"],
    included: ["Vacuuming and surface cleaning based on agreed scope", "Kitchen and bathroom cleaning according to selected details", "Optional add-ons such as oven, fridge/freezer, balcony and window cleaning", "Final time and price are confirmed before work starts"],
    priceText: "Home cleaning is estimated based on size, bathrooms, frequency and selected add-ons. The final price is confirmed before the request becomes a booking.",
    rutText: rutPrivate,
    faq: homeFaq
  },
  "move-out-cleaning": {
    title: "Move-out cleaning",
    eyebrow: "Service",
    service: "Move-out cleaning",
    urlPath: "/en/move-out-cleaning",
    description: "Move-out cleaning for handover and relocation. Price depends on size, condition, bathrooms, windows and add-ons.",
    points: ["Price indication by size", "RUT may apply for private customers", "Final price confirmed before work", "Suitable before handover"],
    included: ["Cleaning before moving or handover based on agreed scope", "Kitchen, bathrooms and living areas assessed by size and condition", "Add-ons such as windows, balcony or extra dirty condition can affect price", "Final price and time are confirmed before work starts"],
    priceText: "Move-out cleaning is usually estimated by square metres, condition, bathrooms, windows and access. The final price is confirmed before work starts.",
    rutText: rutPrivate,
    faq: moveFaq
  },
  "office-cleaning": {
    title: "Office cleaning",
    eyebrow: "Business service",
    service: "Office cleaning",
    urlPath: "/en/office-cleaning",
    description: "Office cleaning for companies and workplaces. Request a quote based on size, frequency, service scope and preferred time window.",
    points: ["Business quote", "Recurring service possible", "RUT does not apply to company cleaning", "Adapted to workplace needs"],
    included: ["Office areas, meeting rooms, entrances and shared spaces according to agreed scope", "Frequency and time window adapted to workplace needs", "Business price without RUT", "Quote confirmed before the service starts"],
    priceText: "Office cleaning is quoted based on square metres, frequency, type of premises, access and requested service level.",
    rutText: noRutCompany,
    faq: officeFaq
  },
  "window-cleaning": {
    title: "Window cleaning",
    eyebrow: "Service",
    service: "Window cleaning",
    urlPath: "/en/window-cleaning",
    description: "Window cleaning for homes and workplaces. Price depends on number of windows, access, floor level and condition.",
    points: ["Can be booked separately or as an add-on", "RUT may apply for private customers", "Access and window type affect price", "Confirmation before work starts"],
    included: ["Window cleaning according to agreed scope", "Assessment based on access, window type and condition", "Can be combined with home cleaning or move-out cleaning", "Final price and practical details are confirmed before work starts"],
    priceText: "Window cleaning is estimated based on number of windows, access, floor level, window type and condition.",
    rutText: rutPrivate,
    faq: windowFaq
  }
};

function withCity(base: PageContent, city: "Södertälje" | "Stockholm", title: string, slug: string, description: string): PageContent {
  return {
    ...base,
    title,
    city,
    urlPath: `/en/${slug}`,
    description,
    points: [`For customers in ${city}`, ...base.points],
    included: base.included,
    priceText: base.priceText,
    rutText: base.rutText,
    faq: base.faq
  };
}

const cityContent: Record<string, PageContent> = {
  "home-cleaning-sodertalje": withCity(serviceContent["home-cleaning"], "Södertälje", "Home cleaning in Södertälje", "home-cleaning-sodertalje", "Send a request for home cleaning in Södertälje with preferred date, address, size, frequency and cleaning needs."),
  "move-out-cleaning-sodertalje": withCity(serviceContent["move-out-cleaning"], "Södertälje", "Move-out cleaning in Södertälje", "move-out-cleaning-sodertalje", "Send a request for move-out cleaning in Södertälje. Iboren checks size, condition, access and availability before confirmation."),
  "window-cleaning-sodertalje": withCity(serviceContent["window-cleaning"], "Södertälje", "Window cleaning in Södertälje", "window-cleaning-sodertalje", "Send a request for window cleaning in Södertälje. Price depends on windows, access, floor level and condition."),
  "office-cleaning-sodertalje": withCity(serviceContent["office-cleaning"], "Södertälje", "Office cleaning in Södertälje", "office-cleaning-sodertalje", "Request office cleaning in Södertälje for workplaces, offices and recurring business cleaning needs."),
  "home-cleaning-stockholm": withCity(serviceContent["home-cleaning"], "Stockholm", "Home cleaning in Stockholm", "home-cleaning-stockholm", "Send a request for home cleaning in Stockholm with preferred date, address, size, frequency and cleaning needs."),
  "move-out-cleaning-stockholm": withCity(serviceContent["move-out-cleaning"], "Stockholm", "Move-out cleaning in Stockholm", "move-out-cleaning-stockholm", "Send a request for move-out cleaning in Stockholm. Iboren checks size, condition, access and availability before confirmation."),
  "window-cleaning-stockholm": withCity(serviceContent["window-cleaning"], "Stockholm", "Window cleaning in Stockholm", "window-cleaning-stockholm", "Send a request for window cleaning in Stockholm. Price depends on windows, access, floor level and condition."),
  "office-cleaning-stockholm": withCity(serviceContent["office-cleaning"], "Stockholm", "Office cleaning in Stockholm", "office-cleaning-stockholm", "Request office cleaning in Stockholm for workplaces, offices and recurring business cleaning needs.")
};

const allContent = { ...serviceContent, ...cityContent };

function slugFromParams(params: { slug: string[] }) {
  return params.slug.join("/");
}

function getContent(slug: string): PageContent {
  return allContent[slug] || {
    title: "Iboren cleaning",
    eyebrow: "Iboren",
    urlPath: `/en/${slug}`,
    description: "Send a clear cleaning request to Iboren. Choose service, area, address, preferred date and time.",
    points: ["Clear booking request", "Availability checked before confirmation", "Price indication before work", "Services in Södertälje and Stockholm"],
    priceText: "Final price is confirmed before work starts.",
    rutText: "RUT deductions may apply according to Skatteverket rules when the conditions are fulfilled."
  };
}

export function generateMetadata({ params }: { params: { slug: string[] } }): Metadata {
  const slug = slugFromParams(params);
  const content = getContent(slug);
  return {
    title: `${content.title} | Iboren`,
    description: content.description,
    alternates: { canonical: `https://iboren.se/en/${slug}` }
  };
}

export default function Page({ params }: { params: { slug: string[] } }) {
  const slug = slugFromParams(params);
  const content = getContent(slug);
  return <EnglishInfoPage {...content} />;
}
