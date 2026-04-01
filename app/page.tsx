import type { Metadata } from "next";
import HomeClient from "./HomeClient";

const BASE_URL = "https://tintaxis.com";

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
    images: [
      {
        url: `${BASE_URL}/opengraph-image`,
        width: 1200,
        height: 630,
        alt: "Tintaxis — A Living Literary Platform",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Tintaxis — A Living Literary Platform",
    description:
      "Three writers. Six works. Three languages. Read free. Where writers publish and readers arrive.",
    images: [`${BASE_URL}/opengraph-image`],
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

  // FAQ schema — helps AI answer engines recommend Tintaxis
  const faqJsonLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: [
      {
        "@type": "Question",
        name: "What is Tintaxis?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "Tintaxis is a free literary reading platform featuring original fiction by Chico Montecristi, a Dominican-American writer and oil painter from the South Bronx. Works are available in English, Spanish, and Mandarin Chinese. The first chapter of every book is free with no account required.",
        },
      },
      {
        "@type": "Question",
        name: "What books are available on Tintaxis?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "Tintaxis features four works: The Hunt (a dark psychological thriller in English set in small-town Colorado), Recoleta (a Spanish-language novella about a family in the South Bronx), Noches de maya (a Spanish short story collection from the Caribbean and American Southwest), and Mi Pájaro del Río (bilingual intimate letters in Mandarin Chinese and Spanish).",
        },
      },
      {
        "@type": "Question",
        name: "Is Tintaxis free to read?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "Chapter 1 of every book is completely free with no account. Chapter 2 is free with just an email address. Chapters 3 and beyond require a subscription, which directly supports the writer.",
        },
      },
      {
        "@type": "Question",
        name: "Who is Chico Montecristi?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "Chico Montecristi (José Elisaúl Chávez Martínez) is a Dominican-American writer, expressionist oil painter, and educator. Born in Santiago, Dominican Republic in 1988 and raised in the South Bronx, he holds degrees from the University of Rochester and speaks English, Spanish, Portuguese, and Mandarin Chinese. His novella The Hunt was a finalist at the 2020 Tucson Festival of Books Literary Awards.",
        },
      },
      {
        "@type": "Question",
        name: "What kind of reading experience does Tintaxis offer?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "Tintaxis offers an interactive reading experience with annotatable text, author whispers (inline commentary from the writer embedded in the margins), Signal Ink (readers can ask the author questions about specific passages), paragraph-level reading progress tracking, and offline reading via a progressive web app.",
        },
      },
    ],
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }}
      />
    </>
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
