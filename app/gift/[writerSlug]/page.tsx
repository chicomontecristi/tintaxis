import { Suspense } from "react";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { getWriterBySlug, getAllWriterSlugs } from "@/lib/featured-writers";
import GiftClient from "./GiftClient";

export async function generateStaticParams() {
  return getAllWriterSlugs().map((slug) => ({ writerSlug: slug }));
}

export async function generateMetadata({
  params,
}: {
  params: { writerSlug: string };
}): Promise<Metadata> {
  const writer = getWriterBySlug(params.writerSlug);
  if (!writer) return {};
  const name = writer.artistName ?? writer.name;
  return {
    title: `Gift ${name}'s Work — Tintaxis`,
    description: `Give a friend one month of access to ${name}'s writing on Tintaxis.`,
  };
}

export default function GiftPage({ params }: { params: { writerSlug: string } }) {
  const writer = getWriterBySlug(params.writerSlug);
  if (!writer) notFound();

  return (
    <Suspense fallback={<div style={{ minHeight: "100vh", backgroundColor: "#0D0B08" }} />}>
      <GiftClient writer={writer} />
    </Suspense>
  );
}
