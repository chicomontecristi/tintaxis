// ─── JOURNAL / BEHIND THE INK ────────────────────────────────────────────────
// Content-marketing landing page. Top-of-funnel SEO entry.
// Server component with metadata; delegates rendering to JournalClient.

import type { Metadata } from "next";
import JournalClient from "./JournalClient";

export const metadata: Metadata = {
  title: "Behind the Ink — Tintaxis Journal",
  description:
    "Field notes from Tintaxis: the future of digital publishing, interactive storytelling, the 85% writer economy, and the craft of living books.",
  keywords: [
    "digital publishing",
    "interactive storytelling",
    "indie publishing",
    "living books",
    "author economy",
    "writer royalties",
    "interactive literature",
    "author voiceovers",
    "tintaxis",
  ],
  openGraph: {
    title: "Behind the Ink — Tintaxis Journal",
    description:
      "Field notes on the future of digital publishing and living books.",
    url: "https://tintaxis.com/journal",
    siteName: "Tintaxis",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Behind the Ink — Tintaxis Journal",
    description:
      "Field notes on the future of digital publishing and living books.",
  },
  alternates: {
    canonical: "https://tintaxis.com/journal",
  },
};

export default function JournalPage() {
  return <JournalClient />;
}
