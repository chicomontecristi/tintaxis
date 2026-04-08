import type { Metadata } from "next";
import WritersClient from "./WritersClient";

const BASE_URL = "https://tintaxis.vercel.app";

// ─── DYNAMIC RENDERING — never serve stale cache ────────────────────────────
export const dynamic = "force-dynamic";

// ─── FEATURED ARTISTS PAGE — SERVER WRAPPER ─────────────────────────────────

export const metadata: Metadata = {
  title: "Featured Artists",
  description:
    "Meet the writers of Tintaxis — invited authors whose work is published on this independent literary platform by Chico Montecristi.",
  keywords: [
    "Tintaxis writers",
    "featured authors",
    "independent writers",
    "literary fiction authors",
    "Chico Montecristi",
    "bilingual authors",
  ],
  openGraph: {
    title: "Featured Artists — Tintaxis",
    description:
      "Meet the writers of this archive. Invited directly. No application. No committee.",
    type: "website",
    url: `${BASE_URL}/writers`,
    siteName: "Tintaxis",
  },
  twitter: {
    card: "summary",
    title: "Featured Artists — Tintaxis",
    description: "Meet the writers of this archive.",
    creator: "@chicomontecristi",
  },
  alternates: {
    canonical: `${BASE_URL}/writers`,
  },
};

export default function WritersPage() {
  return <WritersClient />;
}
