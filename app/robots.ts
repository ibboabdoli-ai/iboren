import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [{
      userAgent: "*",
      allow: "/",
      disallow: ["/admin", "/cleaner", "/supervisor", "/profile", "/login", "/en/cleaner", "/en/profile", "/en/login"],
    }],
    sitemap: "https://iboren.se/sitemap.xml"
  };
}
