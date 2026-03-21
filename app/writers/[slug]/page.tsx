import { notFound } from "next/navigation";
import { getWriterBySlug, getAllWriterSlugs } from "@/lib/featured-writers";
import WriterProfileClient from "./WriterProfileClient";

// ─── STATIC GENERATION ───────────────────────────────────────────────────────

export async function generateStaticParams() {
  return getAllWriterSlugs().map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: { params: { slug: string } }) {
  const writer = getWriterBySlug(params.slug);
  if (!writer) return {};
  const name = writer.artistName ?? writer.name;
  return {
    title: `${name} — Tintaxis`,
    description: writer.shortBio,
  };
}

// ─── PAGE ─────────────────────────────────────────────────────────────────────

export default function WriterProfilePage({ params }: { params: { slug: string } }) {
  const writer = getWriterBySlug(params.slug);
  if (!writer) notFound();
  return <WriterProfileClient writer={writer} />;
}
