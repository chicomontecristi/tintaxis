// ─── JOURNAL POST DETAIL ─────────────────────────────────────────────────────
// Dynamic route for a single published journal entry.
// Server component: generates metadata per-post and passes data to the client.

import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getJournalPost, getAllJournalSlugs } from "@/lib/content/journal-posts";
import PostClient from "./PostClient";

interface PageProps {
  params: Promise<{ slug: string }>;
}

export async function generateStaticParams() {
  return getAllJournalSlugs().map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const post = getJournalPost(slug);
  if (!post) return { title: "Journal — Tintaxis" };

  // Use the first body paragraph as the description for OG/SEO.
  const description = post.body[0]?.slice(0, 200) ?? "";
  const url = `https://tintaxis.com/journal/${slug}`;

  return {
    title: `Dispatch — Tintaxis Journal`,
    description,
    openGraph: {
      title: "Behind the Ink — Tintaxis Journal",
      description,
      url,
      siteName: "Tintaxis",
      type: "article",
      publishedTime: post.publishedAt,
      authors: [post.author],
    },
    twitter: {
      card: "summary_large_image",
      title: "Behind the Ink — Tintaxis Journal",
      description,
    },
    alternates: {
      canonical: url,
    },
  };
}

export default async function JournalPostPage({ params }: PageProps) {
  const { slug } = await params;
  const post = getJournalPost(slug);
  if (!post) notFound();
  return <PostClient post={post} />;
}
