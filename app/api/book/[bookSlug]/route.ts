import { NextRequest, NextResponse } from "next/server";
import { getBook, getBookChaptersOrdered } from "@/lib/content/books";

// ─── GET /api/book/[bookSlug] ────────────────────────────────────────────────
// Returns book metadata and ordered chapter list (without full paragraph content).

export async function GET(
  _req: NextRequest,
  { params }: { params: { bookSlug: string } }
) {
  const book = getBook(params.bookSlug);
  if (!book) {
    return NextResponse.json({ error: "Book not found" }, { status: 404 });
  }

  const chapters = getBookChaptersOrdered(params.bookSlug).map((ch) => ({
    slug: ch.slug,
    bookSlug: ch.bookSlug,
    number: ch.number,
    romanNumeral: ch.romanNumeral,
    title: ch.title,
    subtitle: ch.subtitle,
    isLocked: ch.isLocked,
    wordCount: ch.wordCount,
    epigraph: ch.epigraph,
    // omit paragraphs — heavy
  }));

  return NextResponse.json({ book, chapters });
}
