import { MetadataRoute } from "next";

const BASE_URL = "https://tintaxis.vercel.app";

// ─── ROBOTS ──────────────────────────────────────────────────────────────────
// Allow all crawlers on public pages.
// Block author dashboard, account, and reader auth routes.

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: ["/", "/library", "/book/", "/writers", "/publish"],
        disallow: [
          "/author/",
          "/account",
          "/reader/",
          "/api/",
          "/onboard",
        ],
      },
    ],
    sitemap: `${BASE_URL}/sitemap.xml`,
    host: BASE_URL,
  };
}
