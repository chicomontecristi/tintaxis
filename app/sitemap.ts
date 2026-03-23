import { MetadataRoute } from "next";
import { BOOKS, getAllBookSlugs, getBookChaptersOrdered } from "@/lib/content/books";

const BASE_URL = "https://tintaxis.vercel.app";

// ─── SITEMAP ─────────────────────────────────────────────────────────────────
// Generated at build time. Covers:
//   - Static pages (home, library, writers, publish)
//   - Book landing pages (one per book)
//   - Chapter pages (one per unlocked chapter per book)
// Locked chapters are excluded — no SEO value for sealed content.

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();

  // ── Static pages ─────────────────────────────────────────────────────────
  const staticPages: MetadataRoute.Sitemap = [
    {
      url: BASE_URL,
      lastModified: now,
      changeFrequency: "weekly",
      priority: 1.0,
    },
    {
      url: `${BASE_URL}/library`,
      lastModified: now,
      changeFrequency: "monthly",
      priority: 0.9,
    },
    {
      url: `${BASE_URL}/writers`,
      lastModified: now,
      changeFrequency: "monthly",
      priority: 0.6,
    },
    {
      url: `${BASE_URL}/publish`,
      lastModified: now,
      changeFrequency: "monthly",
      priority: 0.5,
    },
  ];

  // ── Book landing pages ────────────────────────────────────────────────────
  const bookPages: MetadataRoute.Sitemap = getAllBookSlugs().map((slug) => ({
    url: `${BASE_URL}/book/${slug}`,
    lastModified: now,
    changeFrequency: "monthly" as const,
    priority: slug === "the-hunt" ? 0.95 : 0.85,
  }));

  // ── Chapter pages (unlocked only) ────────────────────────────────────────
  const chapterPages: MetadataRoute.Sitemap = [];
  for (const bookSlug of getAllBookSlugs()) {
    const chapters = getBookChaptersOrdered(bookSlug);
    for (const chapter of chapters) {
      if (!chapter.isLocked) {
        chapterPages.push({
          url: `${BASE_URL}/book/${bookSlug}/chapter/${chapter.slug}`,
          lastModified: now,
          changeFrequency: "yearly" as const,
          priority: bookSlug === "the-hunt" ? 0.8 : 0.7,
        });
      }
    }
  }

  return [...staticPages, ...bookPages, ...chapterPages];
}
