import type { Metadata } from "next";
import LinksClient from "./LinksClient";

const BASE_URL = "https://tintaxis.vercel.app";

// ─── LINK IN BIO ─────────────────────────────────────────────────────────────
// Server wrapper — exports metadata for SEO, delegates render to client component.

export const metadata: Metadata = {
  title: "Chico Montecristi — Links",
  description:
    "Read The Hunt, Recoleta, Noches de maya, and 我河口的鸟 — free on Tintaxis. Links to all books, art, and social by Chico Montecristi.",
  openGraph: {
    title: "Chico Montecristi — Links",
    description: "Books. Art. Everything by Chico Montecristi.",
    type: "website",
    url: `${BASE_URL}/links`,
  },
  robots: { index: true, follow: true },
};

export default function LinksPage() {
  return <LinksClient />;
}
