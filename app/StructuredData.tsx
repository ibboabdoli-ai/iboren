const organizationSchema = {
  "@context": "https://schema.org",
  "@type": "CleaningService",
  "@id": "https://iboren.se/#organization",
  name: "Iboren",
  url: "https://iboren.se",
  email: "hej@iboren.se",
  logo: "https://iboren.se/logo.svg",
  image: "https://iboren.se/og.svg",
  description: "Iboren hjälper kunder skapa tydliga bokningsförfrågningar för hemstädning, flyttstädning, kontorsstädning och fönsterputs i Södertälje och Stockholm.",
  areaServed: [
    { "@type": "City", name: "Södertälje" },
    { "@type": "City", name: "Stockholm" }
  ],
  serviceType: [
    "Hemstädning",
    "Flyttstädning",
    "Kontorsstädning",
    "Fönsterputs"
  ],
  knowsAbout: [
    "städning Södertälje",
    "hemstädning Södertälje",
    "flyttstädning Södertälje",
    "kontorsstädning Stockholm",
    "fönsterputs",
    "städbokning"
  ],
  sameAs: []
};

const websiteSchema = {
  "@context": "https://schema.org",
  "@type": "WebSite",
  "@id": "https://iboren.se/#website",
  name: "Iboren",
  url: "https://iboren.se",
  inLanguage: "sv-SE",
  publisher: { "@id": "https://iboren.se/#organization" },
  potentialAction: {
    "@type": "SearchAction",
    target: "https://iboren.se/?q={search_term_string}",
    "query-input": "required name=search_term_string"
  }
};

const serviceCatalogSchema = {
  "@context": "https://schema.org",
  "@type": "OfferCatalog",
  "@id": "https://iboren.se/#services",
  name: "Iboren städtjänster",
  itemListElement: [
    {
      "@type": "Offer",
      itemOffered: {
        "@type": "Service",
        name: "Hemstädning",
        areaServed: ["Södertälje", "Stockholm"],
        provider: { "@id": "https://iboren.se/#organization" }
      }
    },
    {
      "@type": "Offer",
      itemOffered: {
        "@type": "Service",
        name: "Flyttstädning",
        areaServed: ["Södertälje", "Stockholm"],
        provider: { "@id": "https://iboren.se/#organization" }
      }
    },
    {
      "@type": "Offer",
      itemOffered: {
        "@type": "Service",
        name: "Kontorsstädning",
        areaServed: ["Södertälje", "Stockholm"],
        provider: { "@id": "https://iboren.se/#organization" }
      }
    },
    {
      "@type": "Offer",
      itemOffered: {
        "@type": "Service",
        name: "Fönsterputs",
        areaServed: ["Södertälje", "Stockholm"],
        provider: { "@id": "https://iboren.se/#organization" }
      }
    }
  ]
};

export default function StructuredData() {
  const graph = {
    "@context": "https://schema.org",
    "@graph": [organizationSchema, websiteSchema, serviceCatalogSchema]
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(graph).replace(/</g, "\\u003c") }}
    />
  );
}
