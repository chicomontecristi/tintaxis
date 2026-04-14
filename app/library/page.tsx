"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import TintaxisLogo from "@/components/ui/TintaxisLogo";
import { useI18n } from "@/lib/i18n";
import { BOOKS } from "@/lib/content/books";
import type { Book } from "@/lib/types";

// ─── LIBRARY PAGE ────────────────────────────────────────────────────────────
// Full catalog of all works on Tintaxis.
// Sortable: alphabetical (A→Z) or by genre grouping.
// The Hunt retains ★ featured status in both views.

type SortMode = "alpha" | "genre";

const LANGUAGE_LABEL: Record<string, string> = {
  en: "English",
  es: "Español",
  zh: "中文",
};

const GENRE_ORDER = [
  "Dark psychological thriller / Southern Gothic",
  "Ficción literaria / Narrativa familiar",
  "Cuentos / Prosa literaria",
  "书信",
];

function hexToRgb(hex: string): string | null {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result
    ? `${parseInt(result[1], 16)}, ${parseInt(result[2], 16)}, ${parseInt(result[3], 16)}`
    : null;
}

function genreShort(genre: string): string {
  const map: Record<string, string> = {
    "Dark psychological thriller / Southern Gothic": "Psychological Thriller",
    "Ficción literaria / Narrativa familiar": "Literary Fiction",
    "Cuentos / Prosa literaria": "Short Stories",
    "书信": "书信",
  };
  return map[genre] ?? genre;
}

export default function LibraryPage() {
  const { t } = useI18n();
  const [sort, setSort] = useState<SortMode>("alpha");

  const allBooks = useMemo(() => Object.values(BOOKS), []);

  // ── Alphabetical sort (The Hunt pinned first as featured) ──
  const alphaBooks = useMemo(() => {
    const featured = allBooks.find((b) => b.slug === "the-hunt");
    const rest = allBooks
      .filter((b) => b.slug !== "the-hunt")
      .sort((a, b) => a.title.localeCompare(b.title));
    return featured ? [featured, ...rest] : rest;
  }, [allBooks]);

  // ── Genre grouping ──
  const genreGroups = useMemo(() => {
    const groups: Record<string, Book[]> = {};
    for (const book of allBooks) {
      if (!groups[book.genre]) groups[book.genre] = [];
      groups[book.genre].push(book);
    }
    // Sort books within each group: featured first, then alpha
    for (const g of Object.keys(groups)) {
      groups[g].sort((a, b) => {
        if (a.slug === "the-hunt") return -1;
        if (b.slug === "the-hunt") return 1;
        return a.title.localeCompare(b.title);
      });
    }
    // Return ordered by GENRE_ORDER
    return GENRE_ORDER.filter((g) => groups[g]).map((g) => ({
      label: genreShort(g),
      books: groups[g],
    }));
  }, [allBooks]);

  return (
    <div style={{ minHeight: "100vh", backgroundColor: "#0D0B08" }}>


      {/* ── Main ──────────────────────────────────────── */}
      <main style={{ maxWidth: "760px", margin: "0 auto", padding: "88px 2rem 6rem" }}>

        {/* Page header */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: [0.2, 0, 0.1, 1] }}
          style={{ marginBottom: "3rem" }}
        >
          <p style={{
            fontFamily: '"JetBrains Mono", monospace',
            fontSize: "0.75rem",
            letterSpacing: "0.35em",
            color: "rgba(201,168,76,0.35)",
            textTransform: "uppercase",
            marginBottom: "0.75rem",
          }}>
            {t("lib.header")}
          </p>
          <h1 style={{
            fontFamily: '"EB Garamond", Garamond, Georgia, serif',
            fontSize: "clamp(2rem, 4vw, 3rem)",
            fontStyle: "italic",
            color: "rgba(245,230,200,0.88)",
            margin: "0 0 0.5rem",
            lineHeight: 1.1,
          }}>
            {t("lib.title")}
          </h1>
          <p style={{
            fontFamily: '"EB Garamond", Garamond, Georgia, serif',
            fontSize: "1rem",
            fontStyle: "italic",
            color: "rgba(245,230,200,0.35)",
            margin: 0,
          }}>
            {allBooks.length} {t("lib.subtitle")}
          </p>
        </motion.div>

        {/* ── ALPHA VIEW ─────────────────────────────── */}
        <AnimatePresence mode="wait">
          {sort === "alpha" && (
            <motion.div
              key="alpha"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.32, ease: "easeOut" }}
            >
              <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
                {alphaBooks.map((book, i) => (
                  <BookCard
                    key={book.slug}
                    book={book}
                    featured={book.slug === "the-hunt"}
                    delay={i * 0.07}
                  />
                ))}
              </div>
            </motion.div>
          )}

          {/* ── GENRE VIEW ──────────────────────────── */}
          {sort === "genre" && (
            <motion.div
              key="genre"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.32, ease: "easeOut" }}
            >
              <div style={{ display: "flex", flexDirection: "column", gap: "2.5rem" }}>
                {genreGroups.map((group, gi) => (
                  <div key={group.label}>
                    {/* Genre label */}
                    <div style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "1rem",
                      marginBottom: "1rem",
                    }}>
                      <p style={{
                        fontFamily: '"JetBrains Mono", monospace',
                        fontSize: "0.75rem",
                        letterSpacing: "0.3em",
                        color: "rgba(201,168,76,0.35)",
                        textTransform: "uppercase",
                        margin: 0,
                        whiteSpace: "nowrap",
                      }}>
                        {group.label}
                      </p>
                      <div style={{
                        flex: 1,
                        height: "1px",
                        background: "rgba(201,168,76,0.08)",
                      }} />
                    </div>

                    {/* Books in group */}
                    <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
                      {group.books.map((book, i) => (
                        <BookCard
                          key={book.slug}
                          book={book}
                          featured={book.slug === "the-hunt"}
                          delay={gi * 0.08 + i * 0.06}
                          compact
                        />
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* ── Experience nudge ───────────────────────── */}
        <div style={{
          marginTop: "3.5rem",
          paddingTop: "2rem",
          borderTop: "1px solid rgba(201,168,76,0.1)",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: "0.75rem",
        }}>
          <p style={{
            fontFamily: '"EB Garamond", Garamond, Georgia, serif',
            fontSize: "1rem",
            fontStyle: "italic",
            color: "rgba(245,230,200,0.5)",
            textAlign: "center",
            maxWidth: "400px",
            lineHeight: 1.6,
          }}>
            {t("lib.curious")}
          </p>
          <Link href="/experience" style={{
            fontFamily: '"JetBrains Mono", monospace',
            fontSize: "0.8rem",
            letterSpacing: "0.2em",
            color: "rgba(201,168,76,0.6)",
            textDecoration: "none",
            textTransform: "uppercase",
            border: "1px solid rgba(201,168,76,0.2)",
            padding: "0.6rem 1.5rem",
            transition: "all 0.2s ease",
          }}>
            {t("lib.seeExperience")}
          </Link>
        </div>

        {/* Footer */}
        <div style={{ marginTop: "3rem", textAlign: "center" }}>
          <span style={{
            fontFamily: '"JetBrains Mono", monospace',
            fontSize: "0.75rem",
            letterSpacing: "0.3em",
            color: "rgba(245,230,200,0.1)",
            textTransform: "uppercase",
          }}>
            {t("lib.footerBrand")}
          </span>
        </div>
      </main>
    </div>
  );
}

// ─── BOOK CARD ───────────────────────────────────────────────────────────────

function BookCard({
  book,
  featured,
  delay,
  compact = false,
}: {
  book: Book;
  featured: boolean;
  delay: number;
  compact?: boolean;
}) {
  const { t } = useI18n();
  const [hovered, setHovered] = useState(false);
  const rgb = hexToRgb(book.accentColor);
  const accent = book.accentColor;
  const accentFade = rgb ? `rgba(${rgb}, ${hovered ? 0.09 : 0.04})` : "rgba(201,168,76,0.04)";
  const accentBorder = rgb ? `rgba(${rgb}, ${hovered ? 0.55 : featured ? 0.3 : 0.15})` : "rgba(201,168,76,0.15)";

  return (
    <motion.div
      initial={{ opacity: 0, x: -10 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.38, delay, ease: "easeOut" }}
    >
      <Link href={`/book/${book.slug}`} style={{ textDecoration: "none", display: "block" }}>
        <div
          onMouseEnter={() => setHovered(true)}
          onMouseLeave={() => setHovered(false)}
          style={{
            padding: compact ? "1rem 1.25rem" : "1.25rem 1.5rem",
            border: `1px solid ${accentBorder}`,
            borderRadius: "2px",
            background: accentFade,
            display: "flex",
            alignItems: compact ? "center" : "flex-start",
            justifyContent: "space-between",
            gap: "1rem",
            flexWrap: "wrap",
            transition: "background 0.2s ease, border-color 0.2s ease",
            cursor: "pointer",
          }}
        >
          {/* Left: cover thumb + badges + title block */}
          <div style={{ display: "flex", alignItems: "center", gap: "1.25rem", minWidth: 0 }}>

            {/* Cover thumbnail or accent swatch fallback */}
            {book.coverImage ? (
              <div style={{
                width: compact ? "40px" : "52px",
                aspectRatio: "2 / 3",
                borderRadius: "2px",
                overflow: "hidden",
                flexShrink: 0,
                border: `1px solid ${accentBorder}`,
                boxShadow: hovered ? `0 2px 12px ${accent}30` : "none",
                transition: "box-shadow 0.2s ease",
              }}>
                <img
                  src={book.coverImage}
                  alt={book.title}
                  loading="lazy"
                  style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }}
                />
              </div>
            ) : (
              <div style={{
                width: "3px",
                alignSelf: "stretch",
                minHeight: compact ? "36px" : "48px",
                background: accent,
                opacity: hovered ? 0.8 : 0.35,
                borderRadius: "2px",
                flexShrink: 0,
                transition: "opacity 0.2s ease",
              }} />
            )}

            <div style={{ minWidth: 0 }}>
              {/* Badges row */}
              <div style={{ display: "flex", alignItems: "center", gap: "6px", marginBottom: "0.4rem", flexWrap: "wrap" }}>
                {featured && (
                  <span style={{
                    fontFamily: '"JetBrains Mono", monospace',
                    fontSize: "0.75rem",
                    letterSpacing: "0.2em",
                    color: `rgba(${rgb}, 0.75)`,
                    background: `rgba(${rgb}, 0.1)`,
                    border: `1px solid rgba(${rgb}, 0.25)`,
                    padding: "2px 6px",
                    borderRadius: "2px",
                    textTransform: "uppercase",
                    whiteSpace: "nowrap",
                  }}>
                    ★ {t("lib.featured")}
                  </span>
                )}
                <span style={{
                  fontFamily: '"JetBrains Mono", monospace',
                  fontSize: "0.75rem",
                  letterSpacing: "0.2em",
                  color: "rgba(201,168,76,0.35)",
                  background: "rgba(201,168,76,0.06)",
                  border: "1px solid rgba(201,168,76,0.12)",
                  padding: "2px 6px",
                  borderRadius: "2px",
                  textTransform: "uppercase",
                  whiteSpace: "nowrap",
                }}>
                  {book.coverLabel}
                </span>
                <span style={{
                  fontFamily: '"JetBrains Mono", monospace',
                  fontSize: "0.75rem",
                  letterSpacing: "0.15em",
                  color: "rgba(245,230,200,0.2)",
                  textTransform: "uppercase",
                }}>
                  {book.year}
                </span>
              </div>

              {/* Title + subtitle */}
              <p style={{
                fontFamily: '"EB Garamond", Garamond, Georgia, serif',
                fontSize: compact ? "1.05rem" : "1.2rem",
                fontStyle: "italic",
                color: hovered ? "rgba(245,230,200,0.95)" : "rgba(245,230,200,0.82)",
                margin: "0 0 2px",
                lineHeight: 1.2,
                transition: "color 0.2s ease",
              }}>
                {book.title}
              </p>
              {book.subtitle && (
                <p style={{
                  fontFamily: '"EB Garamond", Garamond, Georgia, serif',
                  fontSize: "0.8rem",
                  fontStyle: "italic",
                  color: "rgba(245,230,200,0.32)",
                  margin: 0,
                }}>
                  {book.subtitle}
                </p>
              )}

              {/* Tagline — shown only in full (non-compact) view */}
              {!compact && (
                <p style={{
                  fontFamily: '"EB Garamond", Garamond, Georgia, serif',
                  fontSize: "0.9rem",
                  fontStyle: "italic",
                  color: "rgba(245,230,200,0.38)",
                  margin: "0.5rem 0 0",
                  lineHeight: 1.5,
                }}>
                  "{book.tagline}"
                </p>
              )}
            </div>
          </div>

          {/* Right: stats */}
          <div style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "flex-end",
            gap: "4px",
            flexShrink: 0,
          }}>
            <span style={{
              fontFamily: '"JetBrains Mono", monospace',
              fontSize: "0.75rem",
              letterSpacing: "0.15em",
              color: "rgba(245,230,200,0.22)",
              textTransform: "uppercase",
            }}>
              {book.wordCount.toLocaleString()} wds
            </span>
            <span style={{
              fontFamily: '"JetBrains Mono", monospace',
              fontSize: "0.75rem",
              letterSpacing: "0.15em",
              color: "rgba(245,230,200,0.18)",
              textTransform: "uppercase",
            }}>
              {book.totalChapters} {book.chapterLabel.toLowerCase()}s
            </span>
            <span style={{
              fontFamily: '"JetBrains Mono", monospace',
              fontSize: "0.75rem",
              letterSpacing: "0.15em",
              color: `rgba(${rgb}, ${hovered ? 0.7 : 0.4})`,
              textTransform: "uppercase",
              transition: "color 0.2s ease",
              marginTop: "4px",
            }}>
              {t("lib.read")}
            </span>
          </div>
        </div>
      </Link>
    </motion.div>
  );
}

// ─── SORT BUTTON ─────────────────────────────────────────────────────────────

function SortButton({
  label,
  active,
  onClick,
}: {
  label: string;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      style={{
        fontFamily: '"JetBrains Mono", monospace',
        fontSize: "0.75rem",
        letterSpacing: "0.2em",
        textTransform: "uppercase",
        padding: "4px 10px",
        borderRadius: "2px",
        border: active
          ? "1px solid rgba(201,168,76,0.4)"
          : "1px solid rgba(201,168,76,0.12)",
        background: active ? "rgba(201,168,76,0.1)" : "transparent",
        color: active ? "rgba(201,168,76,0.75)" : "rgba(201,168,76,0.3)",
        cursor: "pointer",
        transition: "all 0.18s ease",
      }}
    >
      {label}
    </button>
  );
}
