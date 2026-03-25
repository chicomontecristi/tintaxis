import type { Metadata } from "next";
import PublishClient from "./PublishClient";

const BASE_URL = "https://tintaxis.com";

// ─── PUBLISH PAGE — SERVER WRAPPER ───────────────────────────────────────────

export const metadata: Metadata = {
  title: "Publish on Tintaxis",
  description:
    "Submit your manuscript to Tintaxis — an independent literary platform by Chico Montecristi. We publish fiction, poetry, and essays in English, Spanish, and more.",
  keywords: [
    "publish book online",
    "submit manuscript",
    "independent publisher",
    "Tintaxis submissions",
    "literary platform",
    "bilingual publishing",
    "free book publishing",
  ],
  openGraph: {
    title: "Publish on Tintaxis",
    description:
      "Submit your work to an independent literary platform. Fiction, poetry, essays — in any language.",
    type: "website",
    url: `${BASE_URL}/publish`,
    siteName: "Tintaxis",
  },
  twitter: {
    card: "summary",
    title: "Publish on Tintaxis",
    description: "Submit your manuscript to an independent literary platform.",
    creator: "@chicomontecristi",
  },
  alternates: {
    canonical: `${BASE_URL}/publish`,
  },
};

export default function PublishPage() {
  return <PublishClient />;
}
