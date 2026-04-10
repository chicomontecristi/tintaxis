// ─── JOURNAL POSTS ───────────────────────────────────────────────────────────
// Published journal entries. Each body is rendered verbatim — authored by
// Chico Montecristi. No fabrication, no AI rewrites, no machine translation.
//
// Bodies are plain strings; paragraph breaks are preserved on render.

export type JournalPostStatus = "published" | "coming-soon";
export type JournalTopic = "dispatch" | "publishing" | "craft" | "economy";

export interface JournalPost {
  slug: string;
  status: JournalPostStatus;
  topic: JournalTopic;
  // i18n keys for the listing card (title + short excerpt)
  titleKey: string;
  descKey: string;
  // Author-written body. Rendered verbatim. Not translated.
  // Each array entry is one paragraph.
  body: string[];
  // ISO date — used for chronological ordering and display
  publishedAt: string;
  // Display byline
  author: string;
}

// ── Dispatch 001 — first newsletter, authored by José on 2026-04-10 ──────────
const DISPATCH_001: JournalPost = {
  slug: "dispatch-001",
  status: "published",
  topic: "dispatch",
  titleKey: "journal.posts.dispatch001.title",
  descKey: "journal.posts.dispatch001.desc",
  publishedAt: "2026-04-10",
  author: "Chico Montecristi",
  body: [
    "This week in tintaxis,",
    "I've refined some tools to better support our writers and provide readers with an engaging environment. ArtPathways is a tool developed to offer artists engagement in global connections utilizing the shared knowledge of the user. You can now find multiple, free, opportunities to engage and further your career. I've also ensured financial data security is prioritized through Stripe payments and payouts, exclusively, connected to the writer and reader. Finally, I've published the platform's changelog for anyone to stay in touch with our process and growth. I encourage you to take advantage of the free chapters available and remind you of the great impact you have over our present and near future as a digital-first consumer. We are still creator-first and we still offer creators 85% net profit and my commitment to building your reader communities within our platform.",
    "Join our newsletter to stay in touch.",
    "Hope all is well.",
    "—Chico Montecristi",
  ],
};

// ── Registry ─────────────────────────────────────────────────────────────────
// Published posts live here with full bodies. Coming-soon entries live in
// JournalClient.tsx as listing-only stubs.
export const JOURNAL_POSTS: JournalPost[] = [
  DISPATCH_001,
];

export function getJournalPost(slug: string): JournalPost | undefined {
  return JOURNAL_POSTS.find((p) => p.slug === slug);
}

export function getAllJournalSlugs(): string[] {
  return JOURNAL_POSTS.map((p) => p.slug);
}
