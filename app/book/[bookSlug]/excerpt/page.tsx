import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";
import Link from "next/link";
import { getBook, getBookChapter, getAllBookSlugs } from "@/lib/content/books";

const BASE_URL = "https://tintaxis.vercel.app";
const EXCERPT_PARAGRAPH_COUNT = 8;

// ─── EXCERPT PAGE ────────────────────────────────────────────────────────────
// A lightweight, shareable prose page — designed for social media links.
// Shows the first N paragraphs of a book's opening chapter + a CTA.
// No ink toolbar, no margins, no framer motion — just prose and a hook.
// This is the page you paste into Instagram bio, tweets, and messages.

interface Props {
  params: { bookSlug: string };
}

export function generateStaticParams() {
  return getAllBookSlugs().map((slug) => ({ bookSlug: slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const book = getBook(params.bookSlug);
  if (!book) return {};

  const chapter = getBookChapter(params.bookSlug, book.firstChapterSlug);
  const excerpt = chapter?.paragraphs[0]?.text?.slice(0, 160) ?? book.description;

  return {
    title: `Read: ${book.title} — Free Excerpt`,
    description: excerpt,
    openGraph: {
      title: `${book.title} — Free Excerpt · Tintaxis`,
      description: `Read the opening of ${book.title} by ${book.author}. ${book.tagline}`,
      type: "article",
      url: `${BASE_URL}/book/${book.slug}/excerpt`,
      siteName: "Tintaxis",
    },
    twitter: {
      card: "summary_large_image",
      title: `${book.title} — Read the Opening · Tintaxis`,
      description: `"${book.tagline}" — Free excerpt from ${book.title} by ${book.author}.`,
      creator: "@chicomontecristi",
    },
    alternates: {
      canonical: `${BASE_URL}/book/${book.slug}/excerpt`,
    },
  };
}

export default function ExcerptPage({ params }: Props) {
  const book = getBook(params.bookSlug);
  if (!book) notFound();

  const chapter = getBookChapter(params.bookSlug, book.firstChapterSlug);
  if (!chapter || chapter.paragraphs.length === 0) {
    redirect(`/book/${params.bookSlug}`);
  }

  const paragraphs = chapter.paragraphs
    .filter((p) => !p.isSectionBreak && p.text.trim().length > 0)
    .slice(0, EXCERPT_PARAGRAPH_COUNT);

  const readUrl = `/book/${book.slug}/chapter/${book.firstChapterSlug}`;
  const libraryUrl = `/book/${book.slug}`;

  function hexToRgb(hex: string): string {
    const r = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return r ? `${parseInt(r[1], 16)}, ${parseInt(r[2], 16)}, ${parseInt(r[3], 16)}` : "201,168,76";
  }

  const rgb = hexToRgb(book.accentColor);

  // JSON-LD Article for Google
  const articleSchema = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: `${book.title} — Free Excerpt`,
    description: paragraphs[0]?.text?.slice(0, 200) ?? book.description,
    author: {
      "@type": "Person",
      name: book.author,
      url: "https://chicomontecristi.com",
    },
    publisher: {
      "@type": "Organization",
      name: "Tintaxis",
      url: BASE_URL,
    },
    datePublished: `${book.year}-01-01`,
    url: `${BASE_URL}/book/${book.slug}/excerpt`,
    isAccessibleForFree: true,
    mainEntityOfPage: {
      "@type": "WebPage",
      "@id": `${BASE_URL}/book/${book.slug}/excerpt`,
    },
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(articleSchema) }}
      />

      <div style={{ minHeight: "100vh", backgroundColor: "#0D0B08" }}>

        {/* ── Minimal nav ──────────────────────────────── */}
        <header
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            height: "48px",
            zIndex: 40,
            background: "rgba(13,11,8,0.94)",
            borderBottom: `1px solid rgba(${rgb}, 0.1)`,
            backdropFilter: "blur(8px)",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            padding: "0 1.5rem",
          }}
        >
          <Link
            href="/"
            style={{
              fontFamily: '"EB Garamond", Garamond, Georgia, serif',
              fontSize: "0.85rem",
              letterSpacing: "0.1em",
              color: "rgba(245,230,200,0.55)",
              textDecoration: "none",
            }}
          >
            Tintaxis
          </Link>
          <Link
            href={readUrl}
            style={{
              fontFamily: '"JetBrains Mono", monospace',
              fontSize: "0.5rem",
              letterSpacing: "0.2em",
              color: `rgba(${rgb}, 0.6)`,
              textDecoration: "none",
              textTransform: "uppercase",
            }}
          >
            Read Full Chapter →
          </Link>
        </header>

        {/* ── Prose ────────────────────────────────────── */}
        <main
          style={{
            maxWidth: "620px",
            margin: "0 auto",
            padding: "84px 2rem 2rem",
          }}
        >
          {/* Book badge */}
          <div
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "8px",
              marginBottom: "1.5rem",
            }}
          >
            <span
              style={{
                fontFamily: '"JetBrains Mono", monospace',
                fontSize: "0.45rem",
                letterSpacing: "0.25em",
                color: `rgba(${rgb}, 0.55)`,
                textTransform: "uppercase",
                background: `rgba(${rgb}, 0.08)`,
                border: `1px solid rgba(${rgb}, 0.2)`,
                padding: "3px 8px",
                borderRadius: "2px",
              }}
            >
              Excerpt · {book.coverLabel}
            </span>
          </div>

          {/* Title */}
          <h1
            style={{
              fontFamily: '"EB Garamond", Garamond, Georgia, serif',
              fontSize: "clamp(1.8rem, 4vw, 2.8rem)",
              fontStyle: "italic",
              color: "rgba(245,230,200,0.9)",
              margin: "0 0 0.3rem",
              lineHeight: 1.15,
            }}
          >
            {book.title}
          </h1>

          {book.subtitle && (
            <p
              style={{
                fontFamily: '"EB Garamond", Garamond, Georgia, serif',
                fontSize: "1rem",
                fontStyle: "italic",
                color: "rgba(245,230,200,0.35)",
                margin: "0 0 0.3rem",
              }}
            >
              {book.subtitle}
            </p>
          )}

          <p
            style={{
              fontFamily: '"JetBrains Mono", monospace',
              fontSize: "0.5rem",
              letterSpacing: "0.2em",
              color: "rgba(201,168,76,0.4)",
              textTransform: "uppercase",
              margin: "0 0 2rem",
            }}
          >
            by {book.author}
          </p>

          {/* Chapter label */}
          <p
            style={{
              fontFamily: '"JetBrains Mono", monospace',
              fontSize: "0.45rem",
              letterSpacing: "0.3em",
              color: `rgba(${rgb}, 0.4)`,
              textTransform: "uppercase",
              marginBottom: "1.25rem",
            }}
          >
            {book.chapterLabel} {chapter.romanNumeral}: {chapter.title}
          </p>

          {/* Paragraphs */}
          {paragraphs.map((p, i) => (
            <p
              key={i}
              style={{
                fontFamily: '"EB Garamond", Garamond, Georgia, serif',
                fontSize: "1.1rem",
                color: "rgba(245,230,200,0.78)",
                lineHeight: 1.85,
                marginBottom: "1.2rem",
                textIndent: i > 0 ? "2rem" : undefined,
              }}
            >
              {p.text}
            </p>
          ))}

          {/* Fade-out gradient over last paragraph */}
          <div
            style={{
              marginTop: "-3rem",
              height: "4rem",
              background: "linear-gradient(transparent, #0D0B08)",
              position: "relative",
              zIndex: 2,
              pointerEvents: "none",
            }}
          />

          {/* CTA block */}
          <div
            style={{
              textAlign: "center",
              paddingTop: "1rem",
              paddingBottom: "3rem",
            }}
          >
            <p
              style={{
                fontFamily: '"EB Garamond", Garamond, Georgia, serif',
                fontSize: "1.1rem",
                fontStyle: "italic",
                color: "rgba(245,230,200,0.45)",
                marginBottom: "1.5rem",
              }}
            >
              Continue reading — free, no account needed.
            </p>

            <Link
              href={readUrl}
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "10px",
                fontFamily: '"JetBrains Mono", monospace',
                fontSize: "0.55rem",
                letterSpacing: "0.2em",
                textTransform: "uppercase",
                color: `rgba(${rgb}, 0.85)`,
                border: `1px solid rgba(${rgb}, 0.4)`,
                background: `rgba(${rgb}, 0.06)`,
                padding: "12px 28px",
                borderRadius: "2px",
                textDecoration: "none",
              }}
            >
              Read the Full Chapter →
            </Link>

            <p
              style={{
                fontFamily: '"JetBrains Mono", monospace',
                fontSize: "0.4rem",
                letterSpacing: "0.2em",
                color: "rgba(201,168,76,0.2)",
                textTransform: "uppercase",
                marginTop: "1.5rem",
              }}
            >
              Or explore <Link href={libraryUrl} style={{ color: `rgba(${rgb}, 0.4)`, textDecoration: "none" }}>the full book</Link> · <Link href="/library" style={{ color: "rgba(201,168,76,0.35)", textDecoration: "none" }}>the library</Link>
            </p>
          </div>
        </main>
      </div>
    </>
  );
}
