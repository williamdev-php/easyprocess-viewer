import type { MetadataRoute } from "next";

const BASE_DOMAIN = process.env.BASE_DOMAIN || "qvickosite.com";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
    },
    sitemap: `https://${BASE_DOMAIN}/sitemap.xml`,
  };
}
