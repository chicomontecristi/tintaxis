import type { Metadata } from "next";
import HomeClient from "./HomeClient";

const BASE_URL = "https://tintaxis.vercel.app";

// ─── HOME PAGE — SERVER WRAPPER ──────────────────────────────────────────────
// Exports metadata + JSON-LD for SEO. Delegates render to HomeClient.

export const metadata: Metadata = {
  title: {
    absolute: "Tintaxis — A Living Literary Platform",
  },
  description:
    "Tintaxis is a literary platform where writers publish and readers arrive. Featuring Chico Montecristi, José La Luz, and Rosalva Flores-Alemán — free to read, in English, Spanish, and Mandarin.",
  keywords: [
    "Tintaxis",
    "literary platform",
    "read free books online",
    "Chico Montecristi",
    "José La Luz",
    "Rosalva Flores-Alemán",
    "The Hunt novella",
    "bilingual literature",
    "literary fiction",
    "Dominican American writer",
    "Latin American literature",
    "Caribbean literature",
    "free online reading platform",
    "independent writers",
  ],
  openGraph: {
    title: "Tintaxis — A Living Literary Platform",
    description:
      "Three writers. Six works. Three languages. Read free. Where writers publish and readers arrive.",
    type: "website",
    url: BASE_URL,
    siteName: "Tintaxis",
  },
  twitter: {
    card: "summary_large_image",
    title: "Tintaxis — A Living Literary Platform",
    description:
      "Three writers. Six works. Three languages. Read free. Where writers publish and readers arrive.",
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
        "A living literary platform featuring writers from the Americas. Read free in English, Spanish, and Mandarin.",
      publisher: {
        "@type": "Organization",
        name: "Tintaxis",
        url: BASE_URL,
      },
      inLanguage: ["en", "es", "zh"],
    },
    {
      "@context": "https://schema.org",
      "@type": "CollectionPage",
      name: "Tintaxis — A Living Literary Platform",
      url: BASE_URL,
      description:
        "Featuring Chico Montecristi, José La Luz, and Rosalva Flores-Alemán. Free to read.",
      mainEntity: {
        "@type": "ItemList",
        numberOfItems: 6,
        itemListElement: [
          {
            "@type": "ListItem",
            position: 1,
            url: `${BASE_URL}/book/the-hunt`,
            name: "The Hunt — Chico Montecristi",
          },
          {
            "@type": "ListItem",
            position: 2,
            url: `${BASE_URL}/book/recoleta`,
            name: "Recoleta — Chico Montecristi",
          },
          {
            "@type": "ListItem",
            position: 3,
            url: `${BASE_URL}/book/noches-de-maya`,
            name: "Noches de maya — Chico Montecristi",
          },
          {
            "@type": "ListItem",
            position: 4,
            url: `${BASE_URL}/book/mi-pajaro-del-rio`,
            name: "Mi Pájaro del Río — Chico Montecristi",
          },
          {
            "@type": "ListItem",
            position: 5,
            url: `${BASE_URL}/writers/jose-la-luz`,
            name: "Escritos de un Hombre Político — José La Luz",
          },
          {
            "@type": "ListItem",
            position: 6,
            url: `${BASE_URL}/writers/rosalva-flores-aleman`,
            name: "Subalternity, 21st Century Diaspora — Rosalva Flores-Alemán",
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
