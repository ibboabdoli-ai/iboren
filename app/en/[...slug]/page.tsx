import type { Metadata } from "next";
import EnglishInfoPage from "../../EnglishInfoPage";

type PageContent = {
  title: string;
  eyebrow: string;
  description: string;
  city?: string;
  points: string[];
  faq?: Array<{ q: string; a: string }>;
};

const serviceContent: Record<string, PageContent> = {
  "jobs": {
    title: "Work with Iboren",
    eyebrow: "Jobs",
    description: "Iboren is looking for reliable and detail-oriented people who want to work with cleaning services in Södertälje and Stockholm.",
    points: ["Send an interest application", "Tell us your availability", "Describe your cleaning experience", "Attach CV or profile link when possible"],
    faq: [{ q: "Can I send an application online?", a: "Yes. Use the job form and Iboren will review your interest application." }]
  },
  "about": {
    title: "About Iboren",
    eyebrow: "About us",
    description: "Iboren helps customers send clear cleaning requests with price indications, RUT information and fast follow-up in Södertälje and Stockholm.",
    points: ["Clear booking requests", "Price indication before confirmation", "Services for homes and companies", "Focus on Södertälje and Stockholm"]
  },
  "privacy": {
    title: "Privacy",
    eyebrow: "Legal",
    description: "Information about how Iboren handles personal information in connection with booking requests and contact forms.",
    points: ["Data is used to handle requests", "Contact details are used for follow-up", "Information is handled with care", "Contact Iboren for questions"]
  },
  "terms": {
    title: "Terms",
    eyebrow: "Legal",
    description: "Terms for booking requests, price indications, RUT information and service confirmation with Iboren.",
    points: ["A request is not a confirmed booking", "Availability is checked before confirmation", "Final price is confirmed before work starts", "RUT may apply according to Skatteverket rules"]
  },
  "home-cleaning": {
    title: "Home cleaning",
    eyebrow: "Service",
    description: "Home cleaning for one-time or recurring needs. Send a request with address, size, date and preferences.",
    points: ["One-time or recurring cleaning", "RUT may apply for private customers", "Clear request before confirmation", "Suitable for apartments, houses and townhouses"]
  },
  "move-out-cleaning": {
    title: "Move-out cleaning",
    eyebrow: "Service",
    description: "Move-out cleaning for handover and relocation. Price depends on size, condition, bathrooms, windows and add-ons.",
    points: ["Price indication by size", "RUT may apply for private customers", "Final price confirmed before work", "Suitable before handover"]
  },
  "office-cleaning": {
    title: "Office cleaning",
    eyebrow: "Business service",
    description: "Office cleaning for companies and workplaces. Request a quote based on size, frequency and time window.",
    points: ["Business quote", "Recurring service possible", "RUT does not apply to company cleaning", "Adapted to workplace needs"]
  },
  "window-cleaning": {
    title: "Window cleaning",
    eyebrow: "Service",
    description: "Window cleaning for homes and workplaces. Price depends on number of windows, access, floor level and condition.",
    points: ["Can be booked separately or as an add-on", "RUT may apply for private customers", "Access and window type affect price", "Confirmation before work starts"]
  }
};

const cityContent: Record<string, PageContent> = {
  "home-cleaning-sodertalje": { ...serviceContent["home-cleaning"], title: "Home cleaning in Södertälje", city: "Södertälje", description: "Send a request for home cleaning in Södertälje with preferred date, address, size and cleaning needs." },
  "move-out-cleaning-sodertalje": { ...serviceContent["move-out-cleaning"], title: "Move-out cleaning in Södertälje", city: "Södertälje", description: "Send a request for move-out cleaning in Södertälje. Iboren checks the details and gets back with confirmation." },
  "window-cleaning-sodertalje": { ...serviceContent["window-cleaning"], title: "Window cleaning in Södertälje", city: "Södertälje" },
  "office-cleaning-sodertalje": { ...serviceContent["office-cleaning"], title: "Office cleaning in Södertälje", city: "Södertälje" },
  "home-cleaning-stockholm": { ...serviceContent["home-cleaning"], title: "Home cleaning in Stockholm", city: "Stockholm", description: "Send a request for home cleaning in Stockholm with preferred date, address, size and cleaning needs." },
  "move-out-cleaning-stockholm": { ...serviceContent["move-out-cleaning"], title: "Move-out cleaning in Stockholm", city: "Stockholm", description: "Send a request for move-out cleaning in Stockholm. Iboren checks the details and gets back with confirmation." },
  "window-cleaning-stockholm": { ...serviceContent["window-cleaning"], title: "Window cleaning in Stockholm", city: "Stockholm" },
  "office-cleaning-stockholm": { ...serviceContent["office-cleaning"], title: "Office cleaning in Stockholm", city: "Stockholm" }
};

const allContent = { ...serviceContent, ...cityContent };

function slugFromParams(params: { slug: string[] }) {
  return params.slug.join("/");
}

function getContent(slug: string): PageContent {
  return allContent[slug] || {
    title: "Iboren cleaning",
    eyebrow: "Iboren",
    description: "Send a clear cleaning request to Iboren. Choose service, area, address, preferred date and time.",
    points: ["Clear booking request", "Availability checked before confirmation", "Price indication before work", "Services in Södertälje and Stockholm"]
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
