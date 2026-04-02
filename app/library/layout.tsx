import type { Metadata } from "next";
import { BOOKS } from "@/lib/content/books";

const BASE_URL = "https://tintaxis.com";

export const metadata: Metadata = {
  title: "The Library",
  description:
    "The Tintaxis library — The Hunt, Recoleta, Noches de maya, Mi Pájaro del Río, and more on the way. Read free in English, Spanish, and Mandarin.",
  keywords: [
    "Tintaxis library",
    "The Hunt novella",
    "Recoleta",
    "Noches de maya",
    "Mi Pájaro del Río",
    "Dominican American literature",
    "bilingual books",
    "read free online",
    "literary fiction catalog",
    "Tintaxis library",
  ],
  openGraph: {
    title: "The Library — Tintaxis",
    description:
      "A curated literary archive. Read free in English, Spanish, and Mandarin.",
    type: "website",
    url: `${BASE_URL}/library`,
  },
  twitter: {
    card: "summary",
    title: "The Library — Tintaxis",
    description:
      "A curated literary archive. Read free in English, Spanish, and Mandarin.",
  },
  alternates: {
    canonical: `${BASE_URL}/library`,
  },
};

// ─── JSON-LD: COLLECTION PAGE ────────────────────────────────────────────────
// Tells Google this page is a curated collection of books.
function LibraryJsonLd() {
  const books = Object.values(BOOKS);

  // ItemList — Google Rich Results supported type (renders carousel/list)
  const itemList = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: "The Library — Tintaxis",
    description: "The Tintaxis catalog — works by multiple writers, more arriving soon.",
    url: `${BASE_URL}/library`,
    numberOfItems: books.length,
    itemListElement: books.map((book, i) => ({
      "@type": "ListItem",
      position: i + 1,
      url: `${BASE_URL}/book/${book.slug}`,
      name: book.title,
    })),
  };

  // BreadcrumbList — Google renders breadcrumb trails
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
    ],
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(itemList) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumb) }}
      />
    </>
  );
}

export default function LibraryLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <LibraryJsonLd />
      {children}
    </>
  );
}
