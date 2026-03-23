import { notFound } from "next/navigation";
import { getBook, getBookChapter, getAdjacentChapters, getAllBookSlugs, getBookChapterSlugs } from "@/lib/content/books";
import ChapterPageClient from "@/app/chapter/[slug]/ChapterPageClient";

// ─── BOOK CHAPTER PAGE ───────────────────────────────────────────────────────
// Canonical route for all books: /book/[bookSlug]/chapter/[chapterSlug]
// Server component — fetches chapter + adjacent chapters, renders client.

interface Props {
  params: { bookSlug: string; chapterSlug: string };
}

export async function generateStaticParams() {
  const paths: { bookSlug: string; chapterSlug: string }[] = [];
  for (const bookSlug of getAllBookSlugs()) {
    for (const chapterSlug of getBookChapterSlugs(bookSlug)) {
      paths.push({ bookSlug, chapterSlug });
    }
  }
  return paths;
}

export async function generateMetadata({ params }: Props) {
  const book = getBook(params.bookSlug);
  const chapter = getBookChapter(params.bookSlug, params.chapterSlug);
  if (!book || !chapter) return {};

  return {
    title: `${chapter.title} — ${book.title} · Tintaxis`,
    description: chapter.subtitle ?? book.tagline,
  };
}

export default function BookChapterPage({ params }: Props) {
  const book = getBook(params.bookSlug);
  const chapter = getBookChapter(params.bookSlug, params.chapterSlug);

  if (!book || !chapter) {
    notFound();
  }

  const { prev, next } = getAdjacentChapters(params.bookSlug, params.chapterSlug);

  return (
    <ChapterPageClient
      chapter={chapter}
      nextChapter={next}
      prevChapter={prev}
    />
  );
}
