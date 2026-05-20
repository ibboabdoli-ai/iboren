import type { MetadataRoute } from "next";

const baseUrl = "https://iboren.se";

const routes = [
  { path: "", priority: 1, changeFrequency: "weekly" as const },
  { path: "/priser", priority: 0.95, changeFrequency: "weekly" as const },
  { path: "/hemstadning", priority: 0.86, changeFrequency: "monthly" as const },
  { path: "/flyttstadning", priority: 0.86, changeFrequency: "monthly" as const },
  { path: "/kontorsstadning", priority: 0.82, changeFrequency: "monthly" as const },
  { path: "/fonsterputs", priority: 0.8, changeFrequency: "monthly" as const },
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
  { path: "/om-iboren", priority: 0.75, changeFrequency: "monthly" as const },
  { path: "/jobb", priority: 0.7, changeFrequency: "monthly" as const },
  { path: "/en", priority: 0.65, changeFrequency: "monthly" as const },
  { path: "/privacy", priority: 0.25, changeFrequency: "yearly" as const },
  { path: "/terms", priority: 0.25, changeFrequency: "yearly" as const }
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
