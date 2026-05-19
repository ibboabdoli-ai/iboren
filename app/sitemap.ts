import type { MetadataRoute } from "next";

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = "https://iboren.se";
  const now = new Date();
  return [
    { url: baseUrl, lastModified: now, priority: 1 },
    { url: baseUrl + "/hemstadning", lastModified: now, priority: 0.85 },
    { url: baseUrl + "/flyttstadning", lastModified: now, priority: 0.85 },
    { url: baseUrl + "/kontorsstadning", lastModified: now, priority: 0.8 },
    { url: baseUrl + "/fonsterputs", lastModified: now, priority: 0.75 },
    { url: baseUrl + "/privacy", lastModified: now, priority: 0.3 },
    { url: baseUrl + "/terms", lastModified: now, priority: 0.3 }
  ];
}
