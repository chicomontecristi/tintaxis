import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getWriterBySlug, getAllWriterSlugs } from "@/lib/featured-writers";
import WriterProfileClient from "./WriterProfileClient";

const BASE_URL = "https://tintaxis.vercel.app";

// ─── STATIC GENERATION (ISR: rebuild every 60s) ────────────────────────────
export const revalidate = 60;

export async function generateStaticParams() {
  return getAllWriterSlugs().map((slug) => ({ slug }));
}

export async function generateMetadata({
  params,
}: {
  params: { slug: string };
}): Promise<Metadata> {
  const writer = getWriterBySlug(params.slug);
  if (!writer) return {};
  const name = writer.artistName ?? writer.name;
  const isHonorary = writer.honorific && writer.works.every(w => w.comingSoon);
  const description = isHonorary
    ? `${writer.shortBio} ${name} is an honorary writer of Tintaxis.`
    : `${writer.shortBio} Read ${name}'s work on Tintaxis.`;

  return {
    title: `${name} — Tintaxis`,
    description,
    keywords: [
      name,
      writer.name,
      writer.genre,
      "Tintaxis",
      "featured writer",
      "independent author",
    ].filter(Boolean),
    openGraph: {
      title: `${name} — Tintaxis`,
      description,
      type: "profile",
      url: `${BASE_URL}/writers/${writer.slug}`,
      siteName: "Tintaxis",
    },
    twitter: {
      card: "summary",
      title: `${name} — Tintaxis`,
      description: writer.shortBio,
      creator: writer.instagram ? `@${writer.instagram}` : "@chicomontecristi",
    },
    alternates: {
      canonical: `${BASE_URL}/writers/${writer.slug}`,
    },
  };
}

// ─── JSON-LD ─────────────────────────────────────────────────────────────────

function WriterJsonLd({ slug }: { slug: string }) {
  const writer = getWriterBySlug(slug);
  if (!writer) return null;
  const name = writer.artistName ?? writer.name;

  const jsonLd = [
    {
      "@context": "https://schema.org",
      "@type": "Person",
      name,
      description: writer.shortBio,
      url: `${BASE_URL}/writers/${writer.slug}`,
      ...(writer.instagram && {
        sameAs: [`https://www.instagram.com/${writer.instagram}`],
      }),
      ...(writer.website && {
        sameAs: [
          `https://${writer.website}`,
          ...(writer.instagram
            ? [`https://www.instagram.com/${writer.instagram}`]
            : []),
        ],
      }),
    },
    {
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      itemListElement: [
        {
          "@type": "ListItem",
          position: 1,
          name: "Tintaxis",
          item: BASE_URL,
        },
        {
          "@type": "ListItem",
          position: 2,
          name: "Featured Artists",
          item: `${BASE_URL}/writers`,
        },
        {
          "@type": "ListItem",
          position: 3,
          name,
          item: `${BASE_URL}/writers/${writer.slug}`,
        },
      ],
    },
  ];

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
    />
  );
}

// ─── PAGE ─────────────────────────────────────────────────────────────────────

export default function WriterProfilePage({
  params,
}: {
  params: { slug: string };
}) {
  const writer = getWriterBySlug(params.slug);
  if (!writer) notFound();
  return (
    <>
      <WriterJsonLd slug={params.slug} />
      <WriterProfileClient writer={writer} />
    </>
  );
}
