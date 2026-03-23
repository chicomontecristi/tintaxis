import type { Metadata } from "next";
import LivingPage from "./LivingPage";

const BASE_URL = "https://tintaxis.vercel.app";

export const metadata: Metadata = {
  title: {
    absolute: "Experience a Living Page — Tintaxis",
  },
  description:
    "Read a page that remembers. Where other readers leave traces, the author responds, and the margins breathe. This is how books should feel.",
  openGraph: {
    title: "Experience a Living Page — Tintaxis",
    description:
      "A page that remembers. Other readers left traces. The author is here. The margins breathe.",
    type: "website",
    url: `${BASE_URL}/experience`,
    siteName: "Tintaxis",
  },
  twitter: {
    card: "summary_large_image",
    title: "Experience a Living Page — Tintaxis",
    description: "Read a page that remembers. This is how books should feel.",
    creator: "@chicomontecristi",
  },
  alternates: {
    canonical: `${BASE_URL}/experience`,
  },
};

export default function ExperiencePage() {
  return <LivingPage />;
}
