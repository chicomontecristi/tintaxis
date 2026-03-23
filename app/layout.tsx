import type { Metadata, Viewport } from "next";
import { Analytics } from "@vercel/analytics/react";
import "./globals.css";

const BASE_URL = "https://tintaxis.vercel.app";

export const metadata: Metadata = {
  title: {
    default: "Tintaxis",
    template: "%s — Tintaxis",
  },
  description:
    "Tintaxis is a living reading platform by Chico Montecristi — featuring The Hunt (a psychological thriller novella), Recoleta, Noches de maya, and Mi Pájaro del Río. Read free chapters in English, Spanish, and Mandarin.",
  keywords: [
    "Tintaxis",
    "Chico Montecristi",
    "The Hunt novella",
    "Recoleta",
    "Noches de maya",
    "Mi Pájaro del Río",
    "literary fiction",
    "read online free",
    "Dominican American writer",
    "psychological thriller",
    "bilingual literature",
    "Spanish literature",
    "interactive reading",
    "annotations",
  ],
  metadataBase: new URL(BASE_URL),
  openGraph: {
    title: "Tintaxis — A Living Reading Platform",
    description:
      "Four books. Three languages. One writer. Read free chapters from The Hunt, Recoleta, Noches de maya, and Mi Pájaro del Río by Chico Montecristi.",
    type: "website",
    url: BASE_URL,
    siteName: "Tintaxis",
    locale: "en_US",
  },
  twitter: {
    card: "summary_large_image",
    title: "Tintaxis — A Living Reading Platform",
    description:
      "Four books. Three languages. Read free chapters from The Hunt, Recoleta, Noches de maya, and Mi Pájaro del Río by Chico Montecristi.",
    creator: "@chicomontecristi",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-snippet": -1,
      "max-image-preview": "large",
      "max-video-preview": -1,
    },
  },
  alternates: {
    canonical: BASE_URL,
  },
  // Google Search Console — replace with your verification code after setup
  verification: {
    google: "PASTE_YOUR_GSC_VERIFICATION_CODE_HERE",
  },
  other: {
    "pinterest-rich-pin": "true",
  },
};


export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  themeColor: "#0D0B08",
};

// ─── JSON-LD: WEBSITE + PERSON (AUTHOR) ──────────────────────────────────────
// WebSite schema — Google uses this for sitelinks. Injected globally.
const WEBSITE_JSONLD = JSON.stringify([
  {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: "Tintaxis",
    alternateName: "Tintaxis Reading Platform",
    url: BASE_URL,
    description:
      "A living reading platform by Chico Montecristi. Four books in English, Spanish, and Mandarin.",
    publisher: {
      "@type": "Person",
      name: "Chico Montecristi",
      alternateName: "José Elisaúl Chávez Martínez",
      url: "https://chicomontecristi.com",
      sameAs: [
        "https://www.instagram.com/chicomontecristi",
        `${BASE_URL}/writers/chico-montecristi`,
      ],
      jobTitle: "Writer and Oil Painter",
      knowsLanguage: ["en", "es", "pt", "zh"],
    },
    inLanguage: ["en", "es", "zh"],
  },
  {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: "Tintaxis — A Living Reading Platform by Chico Montecristi",
    description:
      "Four books. Three languages. Read free chapters from The Hunt, Recoleta, Noches de maya, and Mi Pájaro del Río.",
    author: {
      "@type": "Person",
      name: "Chico Montecristi",
      url: "https://chicomontecristi.com",
    },
    publisher: {
      "@type": "Organization",
      name: "Tintaxis",
      url: BASE_URL,
    },
    datePublished: "2024-01-01",
    dateModified: "2026-03-22",
    mainEntityOfPage: {
      "@type": "WebPage",
      "@id": BASE_URL,
    },
    url: BASE_URL,
  },
]);

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        {/* Preconnect for Google Fonts */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        {/* Favicon — brass sigil */}
        <link rel="icon" href="/favicon.svg" type="image/svg+xml" />
        <link rel="icon" href="/favicon.svg" sizes="any" />
        {/* JSON-LD: WebSite + Author entity */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: WEBSITE_JSONLD }}
        />
      </head>
      <body className="vault-noise antialiased">
        {children}
        <Analytics />
      </body>
    </html>
  );
}
