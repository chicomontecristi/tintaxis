import { redirect } from "next/navigation";
import { getAllChapterSlugs } from "@/lib/content/chapters";

// ─── LEGACY CHAPTER ROUTE REDIRECT ───────────────────────────────────────────
// Old URL: /chapter/[slug]
// New URL: /book/the-hunt/chapter/[slug]
// All The Hunt chapter URLs are permanently redirected to the canonical book route.

interface Props {
  params: { slug: string };
}

export async function generateStaticParams() {
  return getAllChapterSlugs().map((slug) => ({ slug }));
}

export default function LegacyChapterRedirect({ params }: Props) {
  redirect(`/book/the-hunt/chapter/${params.slug}`);
}
