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
      languages: {
        [book.language]: `${BASE_URL}/book/${book.slug}`,
        "x-default": `${BASE_URL}/book/${book.slug}`,
      },
    },
  };
}

// ─── JSON-LD SCHEMAS ─────────────────────────────────────────────────────────
// Three schemas per book page:
// 1. Article — Google Rich Results Test detects this and renders rich snippets.
// 2. BreadcrumbList — Google renders breadcrumb trails in search results.
// 3. Book — Schema.org standard for books. Not a Google "rich result" type
//    but helps Google understand the content semantically.
function BookJsonLd({ bookSlug }: { bookSlug: string }) {
  const book = getBook(bookSlug);
  if (!book) return null;

  const langMap: Record<string, string> = {
    en: "en",
    es: "es",
    zh: "zh",
  };

  const bookUrl = `${BASE_URL}/book/${book.slug}`;

  const authorEntity = {
    "@type": "Person" as const,
    name: book.author,
    url: "https://chicomontecristi.com",
    sameAs: [
      "https://www.instagram.com/chicomontecristi",
      `${BASE_URL}/writers/chico-montecristi`,
    ],
  };

  // 1. Article — triggers Google Rich Results
  const article = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: book.subtitle
      ? `${book.title} — ${book.subtitle}`
      : book.title,
    description: book.description,
    author: authorEntity,
    datePublished: `${book.year}-01-01`,
    dateModified: "2026-03-22",
    mainEntityOfPage: {
      "@type": "WebPage",
      "@id": bookUrl,
    },
    publisher: {
      "@type": "Organization",
      name: "Tintaxis",
      url: BASE_URL,
    },
    inLanguage: langMap[book.language] ?? "en",
    wordCount: book.wordCount,
    genre: book.genre,
    isAccessibleForFree: true,
    url: bookUrl,
  };

  // 2. BreadcrumbList — triggers Google breadcrumb rich results
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
        item: bookUrl,
      },
    ],
  };

  // 3. Book — semantic schema (not a Google rich result type, but valid)
  const bookSchema = {
    "@context": "https://schema.org",
    "@type": "Book",
    name: book.title,
    alternateName: book.subtitle ?? undefined,
    author: authorEntity,
    description: book.description,
    abstract: book.tagline,
    inLanguage: langMap[book.language] ?? "en",
    datePublished: String(book.year),
    genre: book.genre,
    numberOfPages: book.totalChapters,
    wordCount: book.wordCount,
    url: bookUrl,
    isAccessibleForFree: true,
    publisher: {
      "@type": "Organization",
      name: "Tintaxis",
      url: BASE_URL,
    },
    offers: [
      {
        "@type": "Offer",
        name: "Free Preview",
        description: "Chapter 1 free, Chapter 2 free with email signup",
        price: "0",
        priceCurrency: "USD",
        availability: "https://schema.org/InStock",
        url: `${bookUrl}/chapter/${book.firstChapterSlug}`,
      },
      {
        "@type": "Offer",
        name: "Full Access Subscription",
        description: "Unlock all chapters, annotations, author whispers, and Signal Ink",
        priceCurrency: "USD",
        availability: "https://schema.org/InStock",
        url: bookUrl,
      },
    ],
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(article) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumb) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(bookSchema) }}
      />
    </>
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
