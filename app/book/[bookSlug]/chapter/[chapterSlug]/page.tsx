import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getBook, getBookChapter, getAdjacentChapters, getAllBookSlugs, getBookChapterSlugs, getBookChaptersOrdered } from "@/lib/content/books";
import ChapterPageClient from "@/app/chapter/[slug]/ChapterPageClient";

const BASE_URL = "https://tintaxis.vercel.app";

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

// ─── METADATA ────────────────────────────────────────────────────────────────
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const book = getBook(params.bookSlug);
  const chapter = getBookChapter(params.bookSlug, params.chapterSlug);
  if (!book || !chapter) return {};

  const chapterTitle = `${book.chapterLabel} ${chapter.romanNumeral}: ${chapter.title}`;
  const pageTitle = `${chapterTitle} — ${book.title}`;

  // Build a meaningful description from the chapter's first paragraph (truncated)
  const firstParagraph = chapter.paragraphs[0]?.text ?? "";
  const excerpt = firstParagraph.length > 160
    ? firstParagraph.slice(0, 157) + "…"
    : firstParagraph;
  const description = chapter.subtitle
    ? `${chapter.subtitle} — ${excerpt}`
    : excerpt || book.tagline;

  const chapterUrl = `${BASE_URL}/book/${book.slug}/chapter/${chapter.slug}`;

  return {
    title: pageTitle,
    description,
    keywords: [
      book.title,
      chapter.title,
      "Chico Montecristi",
      book.genre,
      "Tintaxis",
      "read online free",
      "literary fiction",
    ],
    openGraph: {
      title: `${pageTitle} · Tintaxis`,
      description,
      type: "article",
      url: chapterUrl,
      siteName: "Tintaxis",
      authors: [book.author],
    },
    twitter: {
      card: "summary",
      title: `${pageTitle} · Tintaxis`,
      description,
      creator: "@chicomontecristi",
    },
    alternates: {
      canonical: chapterUrl,
    },
  };
}

// ─── JSON-LD: BREADCRUMB + CHAPTER ───────────────────────────────────────────
function ChapterJsonLd({ bookSlug, chapterSlug }: { bookSlug: string; chapterSlug: string }) {
  const book = getBook(bookSlug);
  const chapter = getBookChapter(bookSlug, chapterSlug);
  if (!book || !chapter) return null;

  const chapterUrl = `${BASE_URL}/book/${book.slug}/chapter/${chapter.slug}`;

  // BreadcrumbList: Tintaxis > Library > Book Title > Chapter
  const breadcrumb = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      {
        "@type": "ListItem",
        position: 1,
        name: "Tintaxis",
        item: BASE_URL,
      },
      {
        "@type": "ListItem",
        position: 2,
        name: "Library",
        item: `${BASE_URL}/library`,
      },
      {
        "@type": "ListItem",
        position: 3,
        name: book.title,
        item: `${BASE_URL}/book/${book.slug}`,
      },
      {
        "@type": "ListItem",
        position: 4,
        name: `${book.chapterLabel} ${chapter.romanNumeral}`,
        item: chapterUrl,
      },
    ],
  };

  // Chapter as Article (so Google indexes the chapter text as content)
  const article = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: `${book.chapterLabel} ${chapter.romanNumeral}: ${chapter.title} — ${book.title}`,
    author: {
      "@type": "Person",
      name: book.author,
      url: "https://chicomontecristi.com",
    },
    isPartOf: {
      "@type": "Book",
      name: book.title,
      url: `${BASE_URL}/book/${book.slug}`,
    },
    wordCount: chapter.wordCount,
    inLanguage: book.language === "en" ? "en" : book.language === "es" ? "es" : "es",
    url: chapterUrl,
    isAccessibleForFree: !chapter.isLocked,
    publisher: {
      "@type": "Organization",
      name: "Tintaxis",
      url: BASE_URL,
    },
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumb) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(article) }}
      />
    </>
  );
}

// ─── PAGE ────────────────────────────────────────────────────────────────────
export default function BookChapterPage({ params }: Props) {
  const book = getBook(params.bookSlug);
  const chapter = getBookChapter(params.bookSlug, params.chapterSlug);

  if (!book || !chapter) {
    notFound();
  }

  const { prev, next } = getAdjacentChapters(params.bookSlug, params.chapterSlug);

  return (
    <>
      <ChapterJsonLd bookSlug={params.bookSlug} chapterSlug={params.chapterSlug} />
      <ChapterPageClient
        chapter={chapter}
        nextChapter={next}
        prevChapter={prev}
      />
    </>
  );
}
