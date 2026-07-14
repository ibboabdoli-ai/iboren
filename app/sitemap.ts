import type { MetadataRoute } from "next";

const baseUrl = "https://iboren.se";

const routes = [
  { path: "", priority: 1, changeFrequency: "weekly" as const },
  { path: "/priser", priority: 0.95, changeFrequency: "weekly" as const },
  { path: "/tjanster", priority: 0.9, changeFrequency: "monthly" as const },
  { path: "/tjanster/hemstadning", priority: 0.86, changeFrequency: "monthly" as const },
  { path: "/tjanster/flyttstadning", priority: 0.86, changeFrequency: "monthly" as const },
  { path: "/tjanster/kontorsstadning", priority: 0.82, changeFrequency: "monthly" as const },
  { path: "/tjanster/fonsterputs", priority: 0.8, changeFrequency: "monthly" as const },
  { path: "/tjanster/storstadning", priority: 0.78, changeFrequency: "monthly" as const },
  { path: "/tjanster/byggstadning", priority: 0.74, changeFrequency: "monthly" as const },
  { path: "/tjanster/visningsstadning", priority: 0.74, changeFrequency: "monthly" as const },
  { path: "/stadning-sodertalje", priority: 0.95, changeFrequency: "monthly" as const },
  { path: "/stadning-stockholm", priority: 0.92, changeFrequency: "monthly" as const },
  { path: "/hemstadning-sodertalje", priority: 0.9, changeFrequency: "monthly" as const },
  { path: "/flyttstadning-sodertalje", priority: 0.88, changeFrequency: "monthly" as const },
  { path: "/fonsterputs-sodertalje", priority: 0.86, changeFrequency: "monthly" as const },
  { path: "/kontorsstadning-sodertalje", priority: 0.84, changeFrequency: "monthly" as const },
  { path: "/hemstadning-stockholm", priority: 0.9, changeFrequency: "monthly" as const },
  { path: "/flyttstadning-stockholm", priority: 0.88, changeFrequency: "monthly" as const },
  { path: "/fonsterputs-stockholm", priority: 0.86, changeFrequency: "monthly" as const },
  { path: "/kontorsstadning-stockholm", priority: 0.84, changeFrequency: "monthly" as const },
  { path: "/om-oss", priority: 0.75, changeFrequency: "monthly" as const },
  { path: "/jobba-hos-oss", priority: 0.7, changeFrequency: "monthly" as const },
  { path: "/boka-utan-konto", priority: 0.82, changeFrequency: "weekly" as const },
  { path: "/kontakt", priority: 0.7, changeFrequency: "monthly" as const },
  { path: "/blogg", priority: 0.66, changeFrequency: "monthly" as const },
  { path: "/blogg/vad-kostar-hemstadning", priority: 0.62, changeFrequency: "monthly" as const },
  { path: "/blogg/rut-avdrag-stadning", priority: 0.62, changeFrequency: "monthly" as const },
  { path: "/blogg/checklista-infor-flytt", priority: 0.62, changeFrequency: "monthly" as const },
  { path: "/privacy", priority: 0.25, changeFrequency: "yearly" as const },
  { path: "/terms", priority: 0.25, changeFrequency: "yearly" as const },
  { path: "/en", priority: 0.75, changeFrequency: "monthly" as const },
  { path: "/en/cleaning-stockholm", priority: 0.72, changeFrequency: "monthly" as const },
  { path: "/en/cleaning-sodertalje", priority: 0.72, changeFrequency: "monthly" as const },
  { path: "/en/services", priority: 0.7, changeFrequency: "monthly" as const },
  { path: "/en/prices", priority: 0.76, changeFrequency: "monthly" as const },
  { path: "/en/jobs", priority: 0.56, changeFrequency: "monthly" as const },
  { path: "/en/about", priority: 0.6, changeFrequency: "monthly" as const },
  { path: "/en/contact", priority: 0.58, changeFrequency: "monthly" as const },
  { path: "/en/boka-utan-konto", priority: 0.68, changeFrequency: "weekly" as const },
  { path: "/en/blog", priority: 0.52, changeFrequency: "monthly" as const },
  { path: "/en/blog/home-cleaning-prices", priority: 0.5, changeFrequency: "monthly" as const },
  { path: "/en/blog/rut-deduction-cleaning", priority: 0.5, changeFrequency: "monthly" as const },
  { path: "/en/blog/move-out-checklist", priority: 0.5, changeFrequency: "monthly" as const },
  { path: "/en/privacy", priority: 0.2, changeFrequency: "yearly" as const },
  { path: "/en/terms", priority: 0.2, changeFrequency: "yearly" as const },
  { path: "/en/home-cleaning", priority: 0.68, changeFrequency: "monthly" as const },
  { path: "/en/move-out-cleaning", priority: 0.68, changeFrequency: "monthly" as const },
  { path: "/en/office-cleaning", priority: 0.62, changeFrequency: "monthly" as const },
  { path: "/en/window-cleaning", priority: 0.62, changeFrequency: "monthly" as const },
  { path: "/en/deep-cleaning", priority: 0.6, changeFrequency: "monthly" as const },
  { path: "/en/construction-cleaning", priority: 0.56, changeFrequency: "monthly" as const },
  { path: "/en/viewing-cleaning", priority: 0.56, changeFrequency: "monthly" as const },
  { path: "/en/home-cleaning-sodertalje", priority: 0.72, changeFrequency: "monthly" as const },
  { path: "/en/move-out-cleaning-sodertalje", priority: 0.7, changeFrequency: "monthly" as const },
  { path: "/en/window-cleaning-sodertalje", priority: 0.66, changeFrequency: "monthly" as const },
  { path: "/en/office-cleaning-sodertalje", priority: 0.64, changeFrequency: "monthly" as const },
  { path: "/en/home-cleaning-stockholm", priority: 0.72, changeFrequency: "monthly" as const },
  { path: "/en/move-out-cleaning-stockholm", priority: 0.7, changeFrequency: "monthly" as const },
  { path: "/en/window-cleaning-stockholm", priority: 0.66, changeFrequency: "monthly" as const },
  { path: "/en/office-cleaning-stockholm", priority: 0.64, changeFrequency: "monthly" as const }
];

const languagePairs = [
  ["", "/en"],
  ["/priser", "/en/prices"],
  ["/tjanster", "/en/services"],
  ["/tjanster/hemstadning", "/en/home-cleaning"],
  ["/tjanster/flyttstadning", "/en/move-out-cleaning"],
  ["/tjanster/kontorsstadning", "/en/office-cleaning"],
  ["/tjanster/fonsterputs", "/en/window-cleaning"],
  ["/tjanster/storstadning", "/en/deep-cleaning"],
  ["/tjanster/byggstadning", "/en/construction-cleaning"],
  ["/tjanster/visningsstadning", "/en/viewing-cleaning"],
  ["/stadning-sodertalje", "/en/cleaning-sodertalje"],
  ["/stadning-stockholm", "/en/cleaning-stockholm"],
  ["/hemstadning-sodertalje", "/en/home-cleaning-sodertalje"],
  ["/flyttstadning-sodertalje", "/en/move-out-cleaning-sodertalje"],
  ["/fonsterputs-sodertalje", "/en/window-cleaning-sodertalje"],
  ["/kontorsstadning-sodertalje", "/en/office-cleaning-sodertalje"],
  ["/hemstadning-stockholm", "/en/home-cleaning-stockholm"],
  ["/flyttstadning-stockholm", "/en/move-out-cleaning-stockholm"],
  ["/fonsterputs-stockholm", "/en/window-cleaning-stockholm"],
  ["/kontorsstadning-stockholm", "/en/office-cleaning-stockholm"],
  ["/om-oss", "/en/about"],
  ["/jobba-hos-oss", "/en/jobs"],
  ["/boka-utan-konto", "/en/boka-utan-konto"],
  ["/kontakt", "/en/contact"],
  ["/blogg", "/en/blog"],
  ["/blogg/vad-kostar-hemstadning", "/en/blog/home-cleaning-prices"],
  ["/blogg/rut-avdrag-stadning", "/en/blog/rut-deduction-cleaning"],
  ["/blogg/checklista-infor-flytt", "/en/blog/move-out-checklist"],
  ["/privacy", "/en/privacy"],
  ["/terms", "/en/terms"],
] as const;

function alternatePathFor(path: string) {
  const pair = languagePairs.find(([swedish, english]) => path === swedish || path === english);
  if (!pair) return undefined;
  return path === pair[0] ? pair[1] : pair[0];
}

export default function sitemap(): MetadataRoute.Sitemap {
  return routes.map((route) => {
    const url = `${baseUrl}${route.path}`;
    const alternatePath = alternatePathFor(route.path);
    const isEnglish = route.path === "/en" || route.path.startsWith("/en/");

    return {
      url,
      changeFrequency: route.changeFrequency,
      priority: route.priority,
      ...(alternatePath !== undefined
        ? {
            alternates: {
              languages: {
                [isEnglish ? "en" : "sv"]: url,
                [isEnglish ? "sv" : "en"]: `${baseUrl}${alternatePath}`,
                "x-default": isEnglish ? `${baseUrl}${alternatePath}` : url,
              },
            },
          }
        : {}),
    };
  });
}
