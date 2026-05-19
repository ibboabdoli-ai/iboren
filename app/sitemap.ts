import type { MetadataRoute } from "next";

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = "https://iboren.se";
  const now = new Date();
  return [
    { url: baseUrl, lastModified: now, priority: 1 },
    { url: baseUrl + "/priser", lastModified: now, priority: 0.92 },
    { url: baseUrl + "/tjanster", lastModified: now, priority: 0.9 },
    { url: baseUrl + "/tjanster/hemstadning", lastModified: now, priority: 0.86 },
    { url: baseUrl + "/tjanster/flyttstadning", lastModified: now, priority: 0.86 },
    { url: baseUrl + "/tjanster/kontorsstadning", lastModified: now, priority: 0.82 },
    { url: baseUrl + "/tjanster/fonsterputs", lastModified: now, priority: 0.78 },
    { url: baseUrl + "/tjanster/storstadning", lastModified: now, priority: 0.8 },
    { url: baseUrl + "/tjanster/byggstadning", lastModified: now, priority: 0.74 },
    { url: baseUrl + "/tjanster/visningsstadning", lastModified: now, priority: 0.74 },
    { url: baseUrl + "/kontakt", lastModified: now, priority: 0.8 },
    { url: baseUrl + "/jobba-hos-oss", lastModified: now, priority: 0.75 },
    { url: baseUrl + "/om-oss", lastModified: now, priority: 0.9 },
    { url: baseUrl + "/en", lastModified: now, priority: 0.85 },
    { url: baseUrl + "/stadning-sodertalje", lastModified: now, priority: 0.95 },
    { url: baseUrl + "/stadning-stockholm", lastModified: now, priority: 0.9 },
    { url: baseUrl + "/privacy", lastModified: now, priority: 0.3 },
    { url: baseUrl + "/terms", lastModified: now, priority: 0.3 }
  ];
}
