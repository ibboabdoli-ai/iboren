import type { MetadataRoute } from "next";

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = "https://iboren.se";
  return [
    { url: baseUrl, lastModified: new Date(), priority: 1 },
    { url: baseUrl + "/privacy", lastModified: new Date(), priority: 0.3 },
    { url: baseUrl + "/terms", lastModified: new Date(), priority: 0.3 }
  ];
}
