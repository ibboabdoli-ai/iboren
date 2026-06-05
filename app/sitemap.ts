import type { MetadataRoute } from "next";

const baseUrl = "https://iboren.se";

const routes = [
  { path: "", priority: 1, changeFrequency: "weekly" as const },
  { path: "/priser", priority: 0.95, changeFrequency: "weekly" as const },
  { path: "/tjanster/hemstadning", priority: 0.86, changeFrequency: "monthly" as const },
  { path: "/tjanster/flyttstadning", priority: 0.86, changeFrequency: "monthly" as const },
  { path: "/tjanster/kontorsstadning", priority: 0.82, changeFrequency: "monthly" as const },
  { path: "/tjanster/fonsterputs", priority: 0.8, changeFrequency: "monthly" as const },
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
  { path: "/privacy", priority: 0.25, changeFrequency: "yearly" as const },
  { path: "/terms", priority: 0.25, changeFrequency: "yearly" as const },
  { path: "/en", priority: 0.75, changeFrequency: "monthly" as const },
  { path: "/en/prices", priority: 0.76, changeFrequency: "monthly" as const },
  { path: "/en/jobs", priority: 0.56, changeFrequency: "monthly" as const },
  { path: "/en/about", priority: 0.6, changeFrequency: "monthly" as const },
  { path: "/en/privacy", priority: 0.2, changeFrequency: "yearly" as const },
  { path: "/en/terms", priority: 0.2, changeFrequency: "yearly" as const },
  { path: "/en/home-cleaning", priority: 0.68, changeFrequency: "monthly" as const },
  { path: "/en/move-out-cleaning", priority: 0.68, changeFrequency: "monthly" as const },
  { path: "/en/office-cleaning", priority: 0.62, changeFrequency: "monthly" as const },
  { path: "/en/window-cleaning", priority: 0.62, changeFrequency: "monthly" as const },
  { path: "/en/home-cleaning-sodertalje", priority: 0.72, changeFrequency: "monthly" as const },
  { path: "/en/move-out-cleaning-sodertalje", priority: 0.7, changeFrequency: "monthly" as const },
  { path: "/en/window-cleaning-sodertalje", priority: 0.66, changeFrequency: "monthly" as const },
  { path: "/en/office-cleaning-sodertalje", priority: 0.64, changeFrequency: "monthly" as const },
  { path: "/en/home-cleaning-stockholm", priority: 0.72, changeFrequency: "monthly" as const },
  { path: "/en/move-out-cleaning-stockholm", priority: 0.7, changeFrequency: "monthly" as const },
  { path: "/en/window-cleaning-stockholm", priority: 0.66, changeFrequency: "monthly" as const },
  { path: "/en/office-cleaning-stockholm", priority: 0.64, changeFrequency: "monthly" as const }
];

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();

  return routes.map((route) => ({
    url: `${baseUrl}${route.path}`,
    lastModified: now,
    changeFrequency: route.changeFrequency,
    priority: route.priority
  }));
}
