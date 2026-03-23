import type { Metadata } from "next";
import { getBook, getAllBookSlugs } from "@/lib/content/books";
import BookPageClient from "./BookPageClient";

const BASE_URL = "https://tintaxis.vercel.app";

interface Props {
  params: { bookSlug: string };
}

// ─── STATIC PARAMS ───────────────────────────────────────────────────────────
export function generateStaticParams() {
  return getAllBookSlugs().map((slug) => ({ bookSlug: slug }));
}

// ─── METADATA ────────────────────────────────────────────────────────────────
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const book = getBook(params.bookSlug);
  if (!book) return { title: "Book not found" };

  const title = book.subtitle
    ? `${book.title} — ${book.subtitle}`
    : book.title;

  const description = `${book.tagline} — ${book.description}`;

  const languageLabel: Record<string, string> = {
    en: "English",
    es: "Español",
    "es-zh": "Español / 中文",
    zh: "中文",
  };

  return {
    title,
    description,
    keywords: [
      book.title,
      "Chico Montecristi",
      book.genre,
      languageLabel[book.language] ?? book.language,
      "Tintaxis",
      "literary fiction",
      "read online",
      "free chapter",
    ],
    openGraph: {
      title: `${title} · Tintaxis`,
      description,
      type: "book",
      url: `${BASE_URL}/book/${book.slug}`,
      siteName: "Tintaxis",
      authors: [book.author],
    },
    twitter: {
      card: "summary_large_image",
      title: `${title} · Tintaxis`,
      description,
      creator: "@chicomontecristi",
    },
    alternates: {
      canonical: `${BASE_URL}/book/${book.slug}`,
    },
  };
}

// ─── JSON-LD BOOK SCHEMA ─────────────────────────────────────────────────────
// Rendered server-side as inline <script> so crawlers see it on first paint.
function BookJsonLd({ bookSlug }: { bookSlug: string }) {
  const book = getBook(bookSlug);
  if (!book) return null;

  const langMap: Record<string, string> = {
    en: "en",
    es: "es",
    "es-zh": "es",
    zh: "zh",
  };

  const schema = {
    "@context": "https://schema.org",
    "@type": "Book",
    name: book.title,
    alternateName: book.subtitle ?? undefined,
    author: {
      "@type": "Person",
      name: book.author,
      url: "https://chicomontecristi.com",
      sameAs: [
        "https://www.instagram.com/chicomontecristi",
        `${BASE_URL}/writers/chico-montecristi`,
      ],
    },
    description: book.description,
    abstract: book.tagline,
    inLanguage: langMap[book.language] ?? "en",
    datePublished: String(book.year),
    genre: book.genre,
    numberOfPages: book.totalChapters,
    wordCount: book.wordCount,
    url: `${BASE_URL}/book/${book.slug}`,
    isAccessibleForFree: true,
    publisher: {
      "@type": "Organization",
      name: "Tintaxis",
      url: BASE_URL,
    },
    offers: {
      "@type": "Offer",
      price: "0",
      priceCurrency: "USD",
      availability: "https://schema.org/InStock",
      url: `${BASE_URL}/book/${book.slug}/chapter/${book.firstChapterSlug}`,
    },
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
}

// ─── PAGE ────────────────────────────────────────────────────────────────────
export default function BookPage({ params }: Props) {
  return (
    <>
      <BookJsonLd bookSlug={params.bookSlug} />
      <BookPageClient />
    </>
  );
}
