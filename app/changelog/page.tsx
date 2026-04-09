import type { Metadata } from "next";
import { Suspense } from "react";
import ChangelogClient from "./ChangelogClient";

const BASE_URL = "https://tintaxis.com";

// ─── CHANGELOG PAGE — SERVER WRAPPER ────────────────────────────────────────

export const metadata: Metadata = {
  title: "Changelog — Tintaxis",
  description:
    "Every update, feature, and tool built for Tintaxis — an independent literary platform by Chico Montecristi. Watch the platform evolve in real time.",
  keywords: [
    "Tintaxis changelog",
    "platform updates",
    "literary platform features",
    "Tintaxis development",
    "indie publishing updates",
  ],
  openGraph: {
    title: "Changelog — Tintaxis",
    description:
      "Every update, feature, and tool built for Tintaxis. Watch the platform evolve.",
    type: "website",
    url: `${BASE_URL}/changelog`,
    siteName: "Tintaxis",
  },
  twitter: {
    card: "summary",
    title: "Changelog — Tintaxis",
    description: "Every update shipped to Tintaxis. Follow the build.",
    creator: "@chicomontecristi",
  },
  alternates: {
    canonical: `${BASE_URL}/changelog`,
  },
};

export default function ChangelogPage() {
  return (
    <Suspense fallback={<div style={{ minHeight: "100vh", backgroundColor: "#0D0B08" }} />}>
      <ChangelogClient />
    </Suspense>
  );
}
