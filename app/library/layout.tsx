import type { Metadata } from "next";
import { BOOKS } from "@/lib/content/books";

const BASE_URL = "https://tintaxis.vercel.app";

export const metadata: Metadata = {
  title: "The Library",
  description:
    "All works by Chico Montecristi — The Hunt, Recoleta, Noches de maya, Mi Pájaro del Río. A living reading platform in English, Spanish, and Mandarin.",
  keywords: [
    "Chico Montecristi books",
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
      "Four books. Three languages. One writer. The complete catalog of Chico Montecristi on Tintaxis.",
    type: "website",
    url: `${BASE_URL}/library`,
  },
  twitter: {
    card: "summary",
    title: "The Library — Tintaxis",
    description:
      "Four books. Three languages. One writer. The complete catalog of Chico Montecristi on Tintaxis.",
    creator: "@chicomontecristi",
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
    description: "The complete catalog of works by Chico Montecristi on Tintaxis.",
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
