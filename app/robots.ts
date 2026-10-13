import type { MetadataRoute } from "next";
import { siteUrl } from "@/lib/site";

export default function robots(): MetadataRoute.Robots {
  const base = siteUrl();
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: ["/admin", "/account", "/api/", "/checkout", "/cart", "/login", "/register"],
      },
    ],
    sitemap: `${base}/sitemap.xml`,
    host: base,
  };
}
