import type { Metadata, Viewport } from "next";
import "./globals.css";

const BASE_URL = "https://tintaxis.vercel.app";

export const metadata: Metadata = {
  title: {
    default: "Tintaxis",
    template: "%s — Tintaxis",
  },
  description: "A living reading platform. The Hunt — a novella by Chico Montecristi. Year 2250.",
  keywords: ["tintaxis", "reading", "novel", "Chico Montecristi", "interactive", "annotation", "The Hunt"],
  metadataBase: new URL(BASE_URL),
  openGraph: {
    title: "Tintaxis",
    description: "Books are living entities. Reading is not receiving.",
    type: "website",
    url: BASE_URL,
    siteName: "Tintaxis",
    locale: "en_US",
  },
  twitter: {
    card: "summary_large_image",
    title: "Tintaxis",
    description: "A living reading platform. The Hunt — a novella by Chico Montecristi.",
    creator: "@chicomontecristi",
  },
  robots: {
    index: true,
    follow: true,
  },
};


export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  themeColor: "#0D0B08",
};

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
      </head>
      <body className="vault-noise antialiased">
        {children}
      </body>
    </html>
  );
}
