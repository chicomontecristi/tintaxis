"use client";

import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { useI18n } from "@/lib/i18n";
import TintaxisLogo from "@/components/ui/TintaxisLogo";
import { TrustLine } from "@/components/ui/TrustSignals";
import { getChapterProgress } from "@/lib/ink";
import { cacheBookForOffline } from "@/components/ui/ServiceWorkerRegistration";
import type { Book, Chapter } from "@/lib/types";

// ─── BOOK LANDING PAGE (client) ───────────────────────────────────────────────
// Table of contents for a single book.
// Shows: cover, description, chapter list with lock status.

export default function BookPageClient() {
  const params = useParams<{ bookSlug: string }>();
  const bookSlug = params?.bookSlug ?? "";
  const { t } = useI18n();

  const [book, setBook] = useState<Book | null>(null);
  const [chapters, setChapters] = useState<Chapter[]>([]);
  const [ready, setReady] = useState(false);
  const [dcLoading, setDcLoading] = useState(false);

  // Reset loading state when reader returns from Stripe (back button / tab switch)
  useEffect(() => {
    const resetLoading = () => {
      if (document.visibilityState === "visible") setDcLoading(false);
    };
    document.addEventListener("visibilitychange", resetLoading);
    window.addEventListener("pageshow", () => setDcLoading(false));
    return () => {
      document.removeEventListener("visibilitychange", resetLoading);
      window.removeEventListener("pageshow", () => setDcLoading(false));
    };
  }, []);

  useEffect(() => {
    // Load book data from API to avoid SSR issues with dynamic client component
    fetch(`/api/book/${bookSlug}`)
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => {
        if (data) {
          setBook(data.book);
          setChapters(data.chapters);
          // Pre-cache all chapters for offline reading
          const slugs = (data.chapters as Chapter[])
            .filter((ch) => !ch.isLocked)
            .map((ch) => ch.slug);
          cacheBookForOffline(bookSlug, slugs);
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
          {t("book.loading")}
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
          {t("book.notFound")}
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
          ← {t("book.backToTintaxis")}
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
            {t("book.noAccount")}
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
              marginBottom: "1.5rem",
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
              {t("book.beginReading")}
            </span>
            <span style={{ color: accentMid, fontSize: "1rem" }}>→</span>
          </Link>

          {/* Digital Copy CTA */}
          <button
            onClick={async () => {
              setDcLoading(true);
              try {
                const res = await fetch("/api/stripe/digital-copy", {
                  method: "POST",
                  headers: { "Content-Type": "application/json" },
                  body: JSON.stringify({
                    bookSlug: book.slug,
                    returnUrl: `/book/${book.slug}`,
                  }),
                });
                const data = await res.json();
                if (data.url) {
                  window.location.href = data.url;
                } else {
                  console.error("Failed to create checkout session", data.error);
                  setDcLoading(false);
                }
              } catch (err) {
                console.error("Error:", err);
                setDcLoading(false);
              }
            }}
            disabled={dcLoading}
            style={{
              display: "inline-flex",
              flexDirection: "column",
              alignItems: "flex-start",
              gap: "6px",
              background: "transparent",
              border: `1px solid #C9A84C`,
              borderRadius: "4px",
              padding: "10px 16px",
              textDecoration: "none",
              marginBottom: "3.5rem",
              transition: "all 0.2s ease",
              cursor: dcLoading ? "not-allowed" : "pointer",
              opacity: dcLoading ? 0.6 : 1,
            }}
            onMouseEnter={(e) => {
              if (!dcLoading) {
                (e.currentTarget as HTMLButtonElement).style.borderColor = "#C9A84C";
                (e.currentTarget as HTMLButtonElement).style.background = "rgba(201,168,76,0.08)";
              }
            }}
            onMouseLeave={(e) => {
              if (!dcLoading) {
                (e.currentTarget as HTMLButtonElement).style.borderColor = "#C9A84C";
                (e.currentTarget as HTMLButtonElement).style.background = "transparent";
              }
            }}
          >
            <span
              style={{
                fontFamily: '"JetBrains Mono", monospace',
                fontSize: "0.65rem",
                letterSpacing: "0.2em",
                color: "#C9A84C",
                textTransform: "uppercase",
                fontWeight: 600,
              }}
            >
              {dcLoading ? t("book.openingCheckout") : `${t("book.digitalCopy")} — $1.50`}
            </span>
            <span
              style={{
                fontFamily: '"JetBrains Mono", monospace',
                fontSize: "0.45rem",
                letterSpacing: "0.1em",
                color: "rgba(0,229,204,0.6)",
                textTransform: "uppercase",
              }}
            >
              {t("book.oneTimePdf")}
            </span>
          </button>

          {/* Legal notice */}
          <p
            style={{
              fontFamily: '"JetBrains Mono", monospace',
              fontSize: "0.4rem",
              letterSpacing: "0.05em",
              color: "rgba(201,168,76,0.35)",
              marginBottom: "3rem",
              lineHeight: 1.6,
            }}
          >
            {t("book.copyright")}
          </p>
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
            {t("book.contents")} · {chapters.length} {book.chapterLabel}{chapters.length !== 1 ? "s" : ""}
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
                t={t}
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
            Tintaxis · {book.wordCount.toLocaleString()} {t("book.words")}
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
  t,
}: {
  chapter: Chapter;
  bookSlug: string;
  chapterLabel: string;
  accentColor: string;
  delay: number;
  t: (key: string) => string;
}) {
  const href = `/book/${bookSlug}/chapter/${chapter.slug}`;

  // Read progress from localStorage
  const [progress, setProgress] = useState<{
    scrollProgress: number;
    isComplete: boolean;
    lastParagraph: number;
    totalParagraphs: number;
  } | null>(null);

  useEffect(() => {
    const p = getChapterProgress(chapter.slug);
    if (p) setProgress(p);
  }, [chapter.slug]);

  const isComplete = progress?.isComplete ?? false;
  const isStarted = progress !== null && progress.scrollProgress > 0.02 && !isComplete;
  const progressPct = progress ? Math.round(progress.scrollProgress * 100) : 0;

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
        position: "relative",
      }}
    >
      {/* Progress indicator dot */}
      {!chapter.isLocked && (
        <span style={{
          width: "6px",
          height: "6px",
          borderRadius: "50%",
          flexShrink: 0,
          background: isComplete
            ? "rgba(0,200,120,0.7)"
            : isStarted
              ? `${accentColor}`
              : "rgba(201,168,76,0.12)",
          boxShadow: isComplete
            ? "0 0 6px rgba(0,200,120,0.3)"
            : isStarted
              ? `0 0 6px ${accentColor}40`
              : "none",
          transition: "all 0.3s ease",
        }} />
      )}

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

      {/* Status / read time */}
      <span
        style={{
          fontFamily: '"JetBrains Mono", monospace',
          fontSize: "0.45rem",
          letterSpacing: "0.15em",
          color: isComplete
            ? "rgba(0,200,120,0.6)"
            : chapter.isLocked
              ? "rgba(201,168,76,0.25)"
              : isStarted
                ? `${accentColor}90`
                : "rgba(245,230,200,0.2)",
          textTransform: "uppercase",
          minWidth: "70px",
          textAlign: "right",
        }}
      >
        {chapter.isLocked
          ? t("book.comingSoon")
          : isComplete
            ? `✓ ${t("book.complete")}`
            : isStarted
              ? `${progressPct}% ${t("book.read")}`
              : `${Math.ceil(chapter.wordCount / 250)} ${t("book.minRead")}`}
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
