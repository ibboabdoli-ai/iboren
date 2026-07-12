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
  "deep-cleaning": { title: "Deep cleaning", eyebrow: "Service", service: "Deep cleaning", urlPath: "/en/deep-cleaning", description: "Deep cleaning for homes that need a more thorough cleaning before the next step.", points: ["Clear request before confirmation", "Scope based on home size and needs", "Suitable as a one-time service"], included: ["A more thorough cleaning based on agreed scope", "Details such as size, rooms and special needs collected in the request", "Final time and price confirmed before work starts"] },
  "construction-cleaning": { title: "Construction cleaning", eyebrow: "Service", service: "Construction cleaning", urlPath: "/en/construction-cleaning", description: "Construction cleaning for spaces after renovation, project work or building activity.", points: ["For renovated or project spaces", "Clear notes for dust, surfaces and access", "Quote confirmed before work starts"], included: ["Cleaning scope agreed after project or renovation work", "Area, access and special requirements collected in the request", "Final price confirmed before the service starts"] },
  "viewing-cleaning": { title: "Viewing cleaning", eyebrow: "Service", service: "Viewing cleaning", urlPath: "/en/viewing-cleaning", description: "Viewing cleaning before property viewings, photography or sale.", points: ["For viewings and photography", "Clear scope before confirmation", "Practical date and property details collected"], included: ["Cleaning based on the agreed viewing scope", "Property details and preferred date collected in the request", "Final time and price confirmed before work starts"] },
  "blog": {
    title: "Cleaning guides",
    eyebrow: "Guides",
    urlPath: "/en/blog",
    description: "Practical guides about cleaning, prices, RUT deductions and booking requests.",
    points: ["Home cleaning price guide", "RUT deduction information", "Move-out cleaning checklist"],
    included: ["Home cleaning prices: what affects the estimate", "RUT deductions for eligible private cleaning services", "A practical checklist before requesting move-out cleaning"]
  },
  "blog/home-cleaning-prices": {
    title: "What does home cleaning cost?",
    eyebrow: "Price guide",
    urlPath: "/en/blog/home-cleaning-prices",
    description: "A short guide to the factors that affect the price of home cleaning and how RUT deductions can affect the customer price.",
    points: ["Size, rooms and bathrooms", "Frequency and add-ons", "RUT information before confirmation"],
    included: ["The estimate is affected by the home size, number of bathrooms, pets and selected add-ons", "Recurring cleaning and the requested service scope can affect time and price", "RUT may reduce the labour cost for eligible private customers when conditions are fulfilled"]
  },
  "blog/rut-deduction-cleaning": {
    title: "RUT deduction for cleaning",
    eyebrow: "RUT guide",
    urlPath: "/en/blog/rut-deduction-cleaning",
    description: "A short guide to RUT deductions for cleaning and how they can affect the price indication.",
    points: ["Eligible private cleaning services", "Labour cost and customer conditions", "Final price confirmed before work starts"],
    included: ["The price indication can show the total price and estimated customer price after RUT when relevant", "RUT depends on the customer's conditions and the type of service", "The final price is confirmed before the work starts"]
  },
  "blog/move-out-checklist": {
    title: "Move-out cleaning checklist",
    eyebrow: "Checklist",
    urlPath: "/en/blog/move-out-checklist",
    description: "A practical checklist of the details that help Iboren review a move-out cleaning request.",
    points: ["Size in square metres", "Rooms, bathrooms and add-ons", "Date and contact details"],
    included: ["Property size in square metres", "Number of rooms and bathrooms", "Preferred date and selected add-ons", "Address and contact details for a clear request"]
  },
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
  "cleaning-sodertalje": {
    title: "Cleaning in Södertälje",
    eyebrow: "Local cleaning services",
    city: "Södertälje",
    urlPath: "/en/cleaning-sodertalje",
    description: "Send a clear cleaning request in Södertälje for home cleaning, move-out cleaning, office cleaning or window cleaning.",
    points: ["Home and business cleaning", "Clear request before confirmation", "Price indication and RUT information", "Preferred date, address and service details"],
    included: ["Home cleaning for one-time or recurring needs", "Move-out cleaning before relocation or handover", "Office cleaning based on a business quote", "Window cleaning as a separate service or add-on"],
    priceText: "Use the price calculator for a first estimate. The final time, scope and price are confirmed before work starts.",
    rutText: "RUT deductions may apply to eligible private cleaning services. Office cleaning for companies is handled as a business quote.",
    faq: [
      { q: "Can I send a cleaning request in Södertälje online?", a: "Yes. Choose the service, add the address and preferred date, and Iboren reviews the request before confirmation." },
      { q: "Is the request binding immediately?", a: "No. Iboren confirms the time, scope and final price before the request becomes binding." },
      { q: "Which cleaning services can I request?", a: "You can request home cleaning, move-out cleaning, office cleaning and window cleaning." }
    ]
  },
  "cleaning-stockholm": {
    title: "Cleaning in Stockholm",
    eyebrow: "Local cleaning services",
    city: "Stockholm",
    urlPath: "/en/cleaning-stockholm",
    description: "Send a clear cleaning request in Stockholm for home cleaning, move-out cleaning, office cleaning or window cleaning.",
    points: ["Home and business cleaning", "Clear request before confirmation", "Price indication and RUT information", "Preferred date, address and service details"],
    included: ["Home cleaning for one-time or recurring needs", "Move-out cleaning before relocation or handover", "Office cleaning based on a business quote", "Window cleaning as a separate service or add-on"],
    priceText: "Use the price calculator for a first estimate. The final time, scope and price are confirmed before work starts.",
    rutText: "RUT deductions may apply to eligible private cleaning services. Office cleaning for companies is handled as a business quote.",
    faq: [
      { q: "Can I send a cleaning request in Stockholm online?", a: "Yes. Choose the service, add the address and preferred date, and Iboren reviews the request before confirmation." },
      { q: "Is the request binding immediately?", a: "No. Iboren confirms the time, scope and final price before the request becomes binding." },
      { q: "Which cleaning services can I request?", a: "You can request home cleaning, move-out cleaning, office cleaning and window cleaning." }
    ]
  },
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
  const canonical = `https://iboren.se/en/${slug}`;
  const swedishCounterparts: Record<string, string> = {
    "blog": "https://iboren.se/blogg",
    "blog/home-cleaning-prices": "https://iboren.se/blogg/vad-kostar-hemstadning",
    "blog/rut-deduction-cleaning": "https://iboren.se/blogg/rut-avdrag-stadning",
    "blog/move-out-checklist": "https://iboren.se/blogg/checklista-infor-flytt",
    "cleaning-sodertalje": "https://iboren.se/stadning-sodertalje",
    "cleaning-stockholm": "https://iboren.se/stadning-stockholm",
    "home-cleaning-stockholm": "https://iboren.se/hemstadning-stockholm",
  };
  const swedishCounterpart = swedishCounterparts[slug];

  return {
    title: `${content.title} | Iboren`,
    description: content.description,
    alternates: {
      canonical,
      ...(swedishCounterpart
        ? {
            languages: {
              en: canonical,
              sv: swedishCounterpart,
            },
          }
        : {}),
    },
    ...(swedishCounterpart
      ? {
          openGraph: {
            title: `${content.title} | Iboren`,
            description: content.description,
            url: canonical,
          },
        }
      : {}),
  };
}

export default function Page({ params }: { params: { slug: string[] } }) {
  const slug = slugFromParams(params);
  const content = getContent(slug);
  return <EnglishInfoPage {...content} />;
}
