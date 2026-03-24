"use client";

import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import TintaxisLogo from "@/components/ui/TintaxisLogo";
import { TrustLine } from "@/components/ui/TrustSignals";
import type { Book, Chapter } from "@/lib/types";

// ─── BOOK LANDING PAGE (client) ───────────────────────────────────────────────
// Table of contents for a single book.
// Shows: cover, description, chapter list with lock status.

export default function BookPageClient() {
  const params = useParams<{ bookSlug: string }>();
  const bookSlug = params?.bookSlug ?? "";

  const [book, setBook] = useState<Book | null>(null);
  const [chapters, setChapters] = useState<Chapter[]>([]);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    // Load book data from API to avoid SSR issues with dynamic client component
    fetch(`/api/book/${bookSlug}`)
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => {
        if (data) {
          setBook(data.book);
          setChapters(data.chapters);
        }
        setReady(true);
      })
      .catch(() => setReady(true));
  }, [bookSlug]);

  if (!ready) {
    return (
      <div
        style={{
          minHeight: "100vh",
          backgroundColor: "#0D0B08",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <span
          style={{
            fontFamily: '"JetBrains Mono", monospace',
            fontSize: "0.6rem",
            letterSpacing: "0.3em",
            color: "rgba(201,168,76,0.4)",
            textTransform: "uppercase",
          }}
        >
          Loading…
        </span>
      </div>
    );
  }

  if (!book) {
    return (
      <div
        style={{
          minHeight: "100vh",
          backgroundColor: "#0D0B08",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          gap: "1.5rem",
        }}
      >
        <span
          style={{
            fontFamily: '"EB Garamond", Garamond, Georgia, serif',
            fontSize: "1.5rem",
            color: "rgba(245,230,200,0.5)",
          }}
        >
          Book not found.
        </span>
        <Link
          href="/"
          style={{
            fontFamily: '"JetBrains Mono", monospace',
            fontSize: "0.6rem",
            letterSpacing: "0.25em",
            color: "rgba(201,168,76,0.6)",
            textDecoration: "none",
            textTransform: "uppercase",
          }}
        >
          ← Back to Tintaxis
        </Link>
      </div>
    );
  }

  const accentRgb = hexToRgb(book.accentColor);
  const accentFade = accentRgb ? `rgba(${accentRgb}, 0.15)` : "rgba(201,168,76,0.1)";
  const accentMid = accentRgb ? `rgba(${accentRgb}, 0.6)` : "rgba(201,168,76,0.6)";
  const accentFull = book.accentColor;

  return (
    <div style={{ minHeight: "100vh", backgroundColor: "#0D0B08" }}>
      {/* ── Main content ──────────────────────────────── */}
      <main
        style={{
          maxWidth: "680px",
          margin: "0 auto",
          padding: "100px 2rem 4rem",
        }}
      >
        {/* Book header */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, ease: [0.2, 0, 0.1, 1] }}
        >
          {/* Cover label badge */}
          <div
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "6px",
              background: accentFade,
              border: `1px solid ${accentFull}30`,
              borderRadius: "3px",
              padding: "3px 10px",
              marginBottom: "1.5rem",
            }}
          >
            <span
              style={{
                fontFamily: '"JetBrains Mono", monospace',
                fontSize: "0.5rem",
                letterSpacing: "0.3em",
                color: accentMid,
                textTransform: "uppercase",
              }}
            >
              {book.coverLabel} · {book.year}
            </span>
          </div>

          {/* Title */}
          <h1
            style={{
              fontFamily: '"EB Garamond", Garamond, Georgia, serif',
              fontSize: "clamp(2.2rem, 5vw, 3.5rem)",
              fontStyle: "italic",
              color: "rgba(245,230,200,0.92)",
              margin: "0 0 0.4rem",
              lineHeight: 1.1,
              letterSpacing: "-0.01em",
            }}
          >
            {book.title}
          </h1>

          {/* Subtitle */}
          {book.subtitle && (
            <p
              style={{
                fontFamily: '"EB Garamond", Garamond, Georgia, serif',
                fontSize: "1.1rem",
                color: "rgba(245,230,200,0.45)",
                margin: "0 0 0.5rem",
                fontStyle: "italic",
              }}
            >
              {book.subtitle}
            </p>
          )}

          {/* Author */}
          <p
            style={{
              fontFamily: '"JetBrains Mono", monospace',
              fontSize: "0.6rem",
              letterSpacing: "0.25em",
              color: "rgba(201,168,76,0.5)",
              textTransform: "uppercase",
              margin: "0 0 2rem",
            }}
          >
            {book.author}
          </p>

          {/* Tagline */}
          <p
            style={{
              fontFamily: '"EB Garamond", Garamond, Georgia, serif',
              fontSize: "1.25rem",
              fontStyle: "italic",
              color: "rgba(245,230,200,0.55)",
              borderLeft: `2px solid ${accentFull}60`,
              paddingLeft: "1rem",
              margin: "0 0 1.5rem",
              lineHeight: 1.5,
            }}
          >
            "{book.tagline}"
          </p>

          {/* Description */}
          <p
            style={{
              fontFamily: '"EB Garamond", Garamond, Georgia, serif',
              fontSize: "1.05rem",
              color: "rgba(245,230,200,0.65)",
              lineHeight: 1.75,
              margin: "0 0 2.5rem",
            }}
          >
            {book.description}
          </p>

          {/* Trust signals */}
          <TrustLine />

          {/* Free signal */}
          <p
            style={{
              fontFamily: '"JetBrains Mono", monospace',
              fontSize: "0.5rem",
              letterSpacing: "0.15em",
              color: "rgba(0,229,204,0.5)",
              textTransform: "uppercase",
              marginBottom: "0.75rem",
            }}
          >
            Free to read · No account required
          </p>

          {/* Start reading CTA */}
          <Link
            href={`/book/${book.slug}/chapter/${book.firstChapterSlug}`}
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "10px",
              background: `${accentFull}18`,
              border: `1px solid ${accentFull}50`,
              borderRadius: "4px",
              padding: "12px 24px",
              textDecoration: "none",
              marginBottom: "3.5rem",
              transition: "all 0.2s ease",
            }}
            onMouseEnter={(e) => {
              (e.currentTarget as HTMLAnchorElement).style.background = `${accentFull}28`;
              (e.currentTarget as HTMLAnchorElement).style.borderColor = `${accentFull}80`;
            }}
            onMouseLeave={(e) => {
              (e.currentTarget as HTMLAnchorElement).style.background = `${accentFull}18`;
              (e.currentTarget as HTMLAnchorElement).style.borderColor = `${accentFull}50`;
            }}
          >
            <span
              style={{
                fontFamily: '"EB Garamond", Garamond, Georgia, serif',
                fontSize: "1.1rem",
                color: "rgba(245,230,200,0.85)",
              }}
            >
              Begin Reading
            </span>
            <span style={{ color: accentMid, fontSize: "1rem" }}>→</span>
          </Link>
        </motion.div>

        {/* Divider */}
        <div
          style={{
            borderTop: "1px solid rgba(201,168,76,0.12)",
            marginBottom: "2.5rem",
          }}
        />

        {/* Chapter list */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.3 }}
        >
          <p
            style={{
              fontFamily: '"JetBrains Mono", monospace',
              fontSize: "0.5rem",
              letterSpacing: "0.3em",
              color: "rgba(201,168,76,0.4)",
              textTransform: "uppercase",
              marginBottom: "1.5rem",
            }}
          >
            Contents · {chapters.length} {book.chapterLabel}{chapters.length !== 1 ? "s" : ""}
          </p>

          <div style={{ display: "flex", flexDirection: "column", gap: "0" }}>
            {chapters.map((ch, i) => (
              <ChapterRow
                key={ch.slug}
                chapter={ch}
                bookSlug={book.slug}
                chapterLabel={book.chapterLabel}
                accentColor={accentFull}
                delay={i * 0.06}
              />
            ))}
          </div>
        </motion.div>

        {/* Footer */}
        <div style={{ marginTop: "4rem", textAlign: "center" }}>
          <span
            style={{
              fontFamily: '"JetBrains Mono", monospace',
              fontSize: "0.45rem",
              letterSpacing: "0.3em",
              color: "rgba(245,230,200,0.15)",
              textTransform: "uppercase",
            }}
          >
            Tintaxis · {book.wordCount.toLocaleString()} words
          </span>
        </div>
      </main>
    </div>
  );
}

// ─── CHAPTER ROW ─────────────────────────────────────────────────────────────

function ChapterRow({
  chapter,
  bookSlug,
  chapterLabel,
  accentColor,
  delay,
}: {
  chapter: Chapter;
  bookSlug: string;
  chapterLabel: string;
  accentColor: string;
  delay: number;
}) {
  const href = `/book/${bookSlug}/chapter/${chapter.slug}`;

  const content = (
    <motion.div
      initial={{ opacity: 0, x: -12 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.4, delay }}
      style={{
        display: "flex",
        alignItems: "center",
        padding: "1rem 0",
        borderBottom: "1px solid rgba(201,168,76,0.07)",
        cursor: chapter.isLocked ? "default" : "pointer",
        gap: "1rem",
      }}
    >
      {/* Number */}
      <span
        style={{
          fontFamily: '"JetBrains Mono", monospace',
          fontSize: "0.5rem",
          letterSpacing: "0.2em",
          color: chapter.isLocked
            ? "rgba(245,230,200,0.15)"
            : `${accentColor}80`,
          textTransform: "uppercase",
          minWidth: "60px",
        }}
      >
        {chapterLabel} {chapter.romanNumeral}
      </span>

      {/* Title */}
      <div style={{ flex: 1 }}>
        <span
          style={{
            fontFamily: '"EB Garamond", Garamond, Georgia, serif',
            fontSize: "1.05rem",
            fontStyle: "italic",
            color: chapter.isLocked
              ? "rgba(245,230,200,0.3)"
              : "rgba(245,230,200,0.85)",
          }}
        >
          {chapter.title}
        </span>
        {chapter.subtitle && (
          <span
            style={{
              display: "block",
              fontFamily: '"EB Garamond", Garamond, Georgia, serif',
              fontSize: "0.8rem",
              color: "rgba(245,230,200,0.25)",
              marginTop: "2px",
            }}
          >
            {chapter.subtitle}
          </span>
        )}
      </div>

      {/* Lock / word count */}
      <span
        style={{
          fontFamily: '"JetBrains Mono", monospace',
          fontSize: "0.45rem",
          letterSpacing: "0.15em",
          color: chapter.isLocked
            ? "rgba(201,168,76,0.25)"
            : "rgba(245,230,200,0.2)",
          textTransform: "uppercase",
          minWidth: "60px",
          textAlign: "right",
        }}
      >
        {chapter.isLocked ? "Coming soon" : `${chapter.wordCount.toLocaleString()} wds`}
      </span>
    </motion.div>
  );

  if (chapter.isLocked) return <div>{content}</div>;
  return <Link href={href} style={{ textDecoration: "none" }}>{content}</Link>;
}

// ─── HELPERS ─────────────────────────────────────────────────────────────────

function hexToRgb(hex: string): string | null {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result
    ? `${parseInt(result[1], 16)}, ${parseInt(result[2], 16)}, ${parseInt(result[3], 16)}`
    : null;
}
