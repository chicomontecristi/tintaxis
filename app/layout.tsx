import type { Metadata, Viewport } from "next";
import FilteredAnalytics from "@/components/ui/FilteredAnalytics";
import SiteNav from "@/components/ui/SiteNav";
import ServiceWorkerRegistration from "@/components/ui/ServiceWorkerRegistration";
import I18nWrapper from "@/components/ui/I18nWrapper";
import "./globals.css";

const BASE_URL = "https://tintaxis.com";

export const metadata: Metadata = {
  title: {
    default: "Tintaxis",
    template: "%s — Tintaxis",
  },
  description:
    "Tintaxis is a literary platform where writers publish and readers arrive. Featuring Chico Montecristi, José La Luz, and Rosalva Flores-Alemán — in English, Spanish, Mandarin, Portuguese, Tamil, and Italian. First chapter free.",
  keywords: [
    "Tintaxis",
    "literary platform",
    "Chico Montecristi",
    "José La Luz",
    "Rosalva Flores-Alemán",
    "read online free",
    "literary fiction",
    "bilingual literature",
    "Caribbean literature",
    "Latin American literature",
    "interactive reading",
  ],
  metadataBase: new URL(BASE_URL),
  openGraph: {
    title: "Tintaxis — A Living Literary Platform",
    description:
      "Where writers publish, readers arrive, and 85% of the money stays with the author.",
    type: "website",
    url: BASE_URL,
    siteName: "Tintaxis",
    locale: "en_US",
    images: [
      {
        url: `${BASE_URL}/opengraph-image`,
        width: 1200,
        height: 630,
        alt: "Tintaxis — A Living Literary Platform",
        type: "image/png",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Tintaxis — A Living Literary Platform",
    description:
      "Where writers publish, readers arrive, and 85% of the money stays with the author.",
    images: [`${BASE_URL}/opengraph-image`],
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
    languages: {
      "en": BASE_URL,
      "es": `${BASE_URL}/book/recoleta`,
      "zh": `${BASE_URL}/book/mi-pajaro-del-rio`,
      "x-default": BASE_URL,
    },
  },
  verification: {
    google: "google4e1b9f75f9d53898",
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
    alternateName: "Tintaxis Literary Platform",
    url: BASE_URL,
    description:
      "A literary platform featuring writers from the Americas. First chapter free. In English, Spanish, Mandarin, Portuguese, Tamil, and Italian.",
    publisher: {
      "@type": "Organization",
      name: "Tintaxis",
      url: BASE_URL,
    },
    inLanguage: ["en", "es", "zh", "pt", "ta", "it"],
  },
  {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    name: "Tintaxis",
    applicationCategory: "EntertainmentApplication",
    applicationSubCategory: "Reading",
    operatingSystem: "Web, iOS, Android",
    description:
      "A progressive web app for reading literary fiction. Features interactive annotations, author whispers, Signal Ink questions, paragraph-level progress tracking, and offline reading.",
    offers: {
      "@type": "Offer",
      price: "0",
      priceCurrency: "USD",
    },
    author: {
      "@type": "Person",
      name: "Chico Montecristi",
      url: "https://chicomontecristi.com",
      sameAs: [
        "https://www.instagram.com/chicomontecristi",
        `${BASE_URL}/writers/chico-montecristi`,
      ],
    },
    url: BASE_URL,
    inLanguage: ["en", "es", "zh", "pt", "ta", "it"],
    featureList: "Interactive annotations, Author whispers, Signal Ink, Reading progress tracking, Offline reading, Multilingual (English, Spanish, Mandarin, Portuguese, Tamil, Italian)",
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
        {/* PWA */}
        <link rel="manifest" href="/manifest.json" />
        <link rel="apple-touch-icon" href="/icon-192x192.png" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        <meta name="apple-mobile-web-app-title" content="Tintaxis" />
        {/* AI crawler discovery */}
        <link rel="alternate" type="text/plain" href="/llms.txt" title="LLMs.txt — AI-readable site description" />
        {/* JSON-LD: WebSite + Author entity */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: WEBSITE_JSONLD }}
        />
      </head>
      <body className="vault-noise antialiased">
        <I18nWrapper>
          <SiteNav />
          <div style={{ paddingTop: "3rem" }}>
            {children}
          </div>
          <ServiceWorkerRegistration />
          <FilteredAnalytics />
        </I18nWrapper>
      </body>
    </html>
  );
}
