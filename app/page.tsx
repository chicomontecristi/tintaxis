import type { Metadata } from "next";
import HomeClient from "./HomeClient";

const BASE_URL = "https://tintaxis.vercel.app";

// ─── HOME PAGE — SERVER WRAPPER ──────────────────────────────────────────────
// Exports metadata + JSON-LD for SEO. Delegates render to HomeClient.

export const metadata: Metadata = {
  title: {
    absolute: "Tintaxis — Read Free Books by Chico Montecristi",
  },
  description:
    "Tintaxis is a living reading platform by Chico Montecristi. Read The Hunt, Recoleta, Noches de maya, and Mi Pájaro del Río — free, in English, Spanish, and Mandarin.",
  keywords: [
    "Chico Montecristi",
    "Tintaxis",
    "The Hunt novella",
    "Recoleta",
    "Noches de maya",
    "read free books online",
    "Dominican American writer",
    "bilingual literature",
    "literary fiction",
    "dark thriller novella",
    "free online reading platform",
    "independent author",
    "South Bronx writer",
    "Caribbean literature",
  ],
  openGraph: {
    title: "Tintaxis — Read Free Books by Chico Montecristi",
    description:
      "Four books. Three languages. Read free. A living archive by Chico Montecristi.",
    type: "website",
    url: BASE_URL,
    siteName: "Tintaxis",
  },
  twitter: {
    card: "summary_large_image",
    title: "Tintaxis — Read Free Books by Chico Montecristi",
    description:
      "Four books. Three languages. Read free. A living archive by Chico Montecristi.",
    creator: "@chicomontecristi",
  },
  alternates: {
    canonical: BASE_URL,
  },
};

function HomeJsonLd() {
  const jsonLd = [
    {
      "@context": "https://schema.org",
      "@type": "WebSite",
      name: "Tintaxis",
      url: BASE_URL,
      description:
        "A living reading platform by Chico Montecristi — four books in English, Spanish, and Mandarin, free to read.",
      author: {
        "@type": "Person",
        name: "Chico Montecristi",
        url: "https://chicomontecristi.com",
        sameAs: [
          "https://www.instagram.com/chicomontecristi",
          "https://chicomontecristi.com",
        ],
      },
      inLanguage: ["en", "es", "zh"],
    },
    {
      "@context": "https://schema.org",
      "@type": "CollectionPage",
      name: "Tintaxis — Books by Chico Montecristi",
      url: BASE_URL,
      description:
        "Read The Hunt, Recoleta, Noches de maya, and Mi Pájaro del Río — free on Tintaxis.",
      mainEntity: {
        "@type": "ItemList",
        numberOfItems: 4,
        itemListElement: [
          {
            "@type": "ListItem",
            position: 1,
            url: `${BASE_URL}/book/the-hunt`,
            name: "The Hunt",
          },
          {
            "@type": "ListItem",
            position: 2,
            url: `${BASE_URL}/book/recoleta`,
            name: "Recoleta",
          },
          {
            "@type": "ListItem",
            position: 3,
            url: `${BASE_URL}/book/noches-de-maya`,
            name: "Noches de maya",
          },
          {
            "@type": "ListItem",
            position: 4,
            url: `${BASE_URL}/book/mi-pajaro-del-rio`,
            name: "Mi Pájaro del Río",
          },
        ],
      },
    },
  ];

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
    />
  );
}

export default function HomePage() {
  return (
    <>
      <HomeJsonLd />
      <HomeClient />
    </>
  );
}
