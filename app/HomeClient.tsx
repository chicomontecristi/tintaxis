"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import TintaxisLogo from "@/components/ui/TintaxisLogo";
import { WelcomeBackToast, getLastRead } from "@/components/ui/ReturnCapture";
import { getChapterProgress } from "@/lib/ink";
import { BOOKS } from "@/lib/content/books";

// ─── HOMEPAGE ─────────────────────────────────────────────────────────────────
// Conversion-focused: hero → writer pitch (85%) → features → catalog → footer.
// Every section gives visitors a reason to stay or click.

const MONO  = '"JetBrains Mono", monospace';
const SERIF = '"EB Garamond", Garamond, Georgia, serif';

// ─── FEATURE DATA ──────────────────────────────────────────────────
const FEATURES = [
  {
    icon: "🎙",
    title: "Author voiceovers",
    desc: "Writers record their voice for page one. You hear the story in the voice it was written.",
  },
  {
    icon: "🤖",
    title: "4 AI narrators",
    desc: "Choose a narrator for the rest of the chapter — Warm, Deep, Clear, or Soft. Each sounds different.",
  },
  {
    icon: "🖋",
    title: "Margin annotations",
    desc: "Highlight, question, connect, ghost-note. Four ink types to mark the text as you read.",
  },
  {
    icon: "💬",
    title: "Author whispers",
    desc: "Writers leave notes in the margins — context, secrets, behind-the-scenes. You see them as you read.",
  },
  {
    icon: "🌗",
    title: "Day & night modes",
    desc: "Sepia cream for daylight, deep parchment for night. Designed for long reading sessions.",
  },
  {
    icon: "🌍",
    title: "Multilingual",
    desc: "English, Spanish, Mandarin Chinese, Portuguese, Tamil, and Italian — on the same platform, with the same tools.",
  },
];

// ─── MAIN COMPONENT ──────────────────────────────────────────────────
export default function HomeClient() {
  const allBooks = Object.values(BOOKS);

  // ── Continue Reading state ──────────────────────────────────
  const [lastRead, setLastRead] = useState<{
    bookSlug: string;
    bookTitle: string;
    chapterSlug: string;
    chapterTitle: string;
    chapterNumber: number;
    totalChapters: number;
    url: string;
    progressPct: number;
  } | null>(null);

  useEffect(() => {
    const record = getLastRead();
    if (!record) return;
    const chProgress = getChapterProgress(record.chapterSlug);
    const scrollPct = chProgress ? Math.round(chProgress.scrollProgress * 100) : 0;
    setLastRead({
      ...record,
      progressPct: scrollPct,
    });
  }, []);

  return (
    <div style={{ backgroundColor: "#0D0B08", color: "#F5E6C8" }}>

      {/* ══════════════════════════════════════════════════════════
          SECTION 1 — HERO (kept, refined)
          ══════════════════════════════════════════════════════════ */}
      <section
        className="relative min-h-screen flex flex-col items-center justify-center overflow-x-hidden"
        style={{ backgroundColor: "#0D0B08" }}
      >
        {/* Background glow */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background:
              "radial-gradient(ellipse at 50% 40%, rgba(44,26,0,0.55) 0%, transparent 65%)",
          }}
        />

        {/* Corner ornaments */}
        <CornerOrnament position="top-left" />
        <CornerOrnament position="top-right" />
        <CornerOrnament position="bottom-left" />
        <CornerOrnament position="bottom-right" />

        {/* Brass rules */}
        <div
          className="absolute top-16 left-16 right-16 h-px"
          style={{
            background:
              "linear-gradient(90deg, transparent, rgba(201,168,76,0.4) 20%, rgba(201,168,76,0.6) 50%, rgba(201,168,76,0.4) 80%, transparent)",
          }}
        />
        <div
          className="absolute bottom-16 left-16 right-16 h-px"
          style={{
            background:
              "linear-gradient(90deg, transparent, rgba(201,168,76,0.4) 20%, rgba(201,168,76,0.6) 50%, rgba(201,168,76,0.4) 80%, transparent)",
          }}
        />

        {/* Main hero content */}
        <div className="relative z-10 flex flex-col items-center text-center px-8 max-w-3xl w-full">

          <motion.p
            className="mb-6"
            style={{
              color: "rgba(201,168,76,0.5)",
              fontSize: "0.75rem",
              letterSpacing: "0.3em",
              fontFamily: MONO,
              textTransform: "uppercase",
            }}
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: "easeOut" }}
          >
            A LITERARY PLATFORM
          </motion.p>

          <motion.div
            className="relative mb-4 select-none flex flex-col items-center"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: [0.2, 0, 0.1, 1] }}
          >
            <motion.div
              className="mb-4"
              animate={{
                filter: [
                  "drop-shadow(0 0 8px rgba(201,168,76,0.3))",
                  "drop-shadow(0 0 20px rgba(201,168,76,0.55))",
                  "drop-shadow(0 0 8px rgba(201,168,76,0.3))",
                ],
              }}
              transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
            >
              <TintaxisLogo size={64} />
            </motion.div>

            <h1
              style={{
                fontFamily: SERIF,
                fontSize: "clamp(2.5rem, 8vw, 5.5rem)",
                fontWeight: 400,
                letterSpacing: "0.12em",
                lineHeight: 1,
                color: "#F5E6C8",
                textShadow:
                  "0 0 60px rgba(201,168,76,0.2), 0 2px 4px rgba(0,0,0,0.8)",
              }}
            >
              TINTAXIS
            </h1>
          </motion.div>

          <motion.div
            className="mb-6"
            style={{ width: "100%", maxWidth: "420px" }}
            initial={{ scaleX: 0, opacity: 0 }}
            animate={{ scaleX: 1, opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.2, ease: "easeOut" }}
          >
            <div className="brass-line" />
          </motion.div>

          <motion.p
            className="mb-3"
            style={{
              fontFamily: SERIF,
              fontSize: "clamp(1.1rem, 2.5vw, 1.4rem)",
              color: "rgba(245,230,200,0.85)",
              lineHeight: 1.6,
              maxWidth: "520px",
            }}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.15 }}
          >
            Where writers publish, readers arrive,
            <br />
            and <span style={{ color: "#C9A84C", fontWeight: 600 }}>85% of the money</span> stays with the author.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.35 }}
            style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "1rem" }}
          >
            <Link href="/library" passHref>
              <motion.button
                className="relative"
                style={{
                  fontFamily: MONO,
                  fontSize: "0.85rem",
                  letterSpacing: "0.3em",
                  textTransform: "uppercase",
                  color: "#C9A84C",
                  background: "transparent",
                  border: "1px solid rgba(201,168,76,0.5)",
                  padding: "1rem 3rem",
                  cursor: "pointer",
                  transition: "all 0.3s ease",
                }}
                whileHover={{
                  borderColor: "rgba(201,168,76,0.9)",
                  boxShadow: "0 0 24px rgba(201,168,76,0.2)",
                  color: "#E8C97A",
                }}
                whileTap={{ scale: 0.98 }}
              >
                <span className="absolute top-0 left-0 w-2 h-2 border-t border-l" style={{ borderColor: "#C9A84C" }} />
                <span className="absolute top-0 right-0 w-2 h-2 border-t border-r" style={{ borderColor: "#C9A84C" }} />
                <span className="absolute bottom-0 left-0 w-2 h-2 border-b border-l" style={{ borderColor: "#C9A84C" }} />
                <span className="absolute bottom-0 right-0 w-2 h-2 border-b border-r" style={{ borderColor: "#C9A84C" }} />
                START READING
              </motion.button>
            </Link>

            <Link href="/publish" passHref>
              <motion.span
                style={{
                  fontFamily: MONO,
                  fontSize: "0.6rem",
                  letterSpacing: "0.2em",
                  color: "rgba(201,168,76,0.35)",
                  textTransform: "uppercase",
                  cursor: "pointer",
                }}
                whileHover={{ color: "rgba(201,168,76,0.7)" }}
              >
                I&apos;m a writer →
              </motion.span>
            </Link>
          </motion.div>

          {/* Scroll indicator */}
          <motion.div
            className="absolute bottom-24"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.5, duration: 1 }}
          >
            <motion.div
              animate={{ y: [0, 8, 0] }}
              transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
              style={{
                fontFamily: MONO,
                fontSize: "0.55rem",
                letterSpacing: "0.2em",
                color: "rgba(201,168,76,0.25)",
                textTransform: "uppercase",
                textAlign: "center",
              }}
            >
              Scroll to explore
              <br />
              <span style={{ fontSize: "1rem" }}>↓</span>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════════
          SECTION 2 — FOR WRITERS (THE 85% FLIP)
          ══════════════════════════════════════════════════════════ */}
      <section
        style={{
          padding: "5rem 2rem",
          borderTop: "1px solid rgba(201,168,76,0.08)",
          borderBottom: "1px solid rgba(201,168,76,0.08)",
        }}
      >
        <div style={{ maxWidth: "900px", margin: "0 auto" }}>
          <motion.p
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            style={{
              fontFamily: MONO,
              fontSize: "0.7rem",
              letterSpacing: "0.3em",
              textTransform: "uppercase",
              color: "#C9A84C",
              marginBottom: "1.5rem",
              textAlign: "center",
            }}
          >
            FOR WRITERS
          </motion.p>

          <motion.h2
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            style={{
              fontFamily: SERIF,
              fontSize: "clamp(2rem, 5vw, 3.2rem)",
              fontWeight: 400,
              color: "#F5E6C8",
              lineHeight: 1.2,
              marginBottom: "2rem",
              textAlign: "center",
            }}
          >
            We flipped the switch.{" "}
            <span style={{ color: "rgba(0,200,170,0.85)", fontWeight: 600 }}>85% to writers.</span>
          </motion.h2>

          {/* THE FLIP: Visual comparison */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1, duration: 0.6 }}
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              gap: "2rem",
              marginBottom: "3rem",
              maxWidth: "700px",
              margin: "0 auto 3rem",
            }}
          >
            {/* Traditional Publishing */}
            <div
              style={{
                padding: "1.5rem",
                border: "1px solid rgba(180,80,60,0.3)",
                borderRadius: "4px",
                background: "rgba(180,80,60,0.04)",
                textAlign: "center",
              }}
            >
              <p
                style={{
                  fontFamily: MONO,
                  fontSize: "0.65rem",
                  letterSpacing: "0.2em",
                  textTransform: "uppercase",
                  color: "rgba(180,80,60,0.8)",
                  marginBottom: "1rem",
                  fontWeight: 600,
                }}
              >
                Traditional Publishing
              </p>
              <div
                style={{
                  fontFamily: SERIF,
                  fontSize: "1.3rem",
                  lineHeight: 1.8,
                  color: "#F5E6C8",
                }}
              >
                <div style={{ marginBottom: "0.5rem" }}>
                  <span style={{ color: "rgba(180,80,60,0.85)", fontWeight: 600 }}>75–90%</span>
                  <span style={{ color: "rgba(245,230,200,0.4)" }}> Publisher</span>
                </div>
                <div>
                  <span style={{ color: "rgba(245,230,200,0.3)", fontWeight: 600 }}>10–25%</span>
                  <span style={{ color: "rgba(245,230,200,0.4)" }}> Author</span>
                </div>
              </div>
            </div>

            {/* Tintaxis */}
            <div
              style={{
                padding: "1.5rem",
                border: "1px solid rgba(0,200,170,0.3)",
                borderRadius: "4px",
                background: "rgba(0,200,170,0.04)",
                textAlign: "center",
              }}
            >
              <p
                style={{
                  fontFamily: MONO,
                  fontSize: "0.65rem",
                  letterSpacing: "0.2em",
                  textTransform: "uppercase",
                  color: "rgba(0,200,170,0.85)",
                  marginBottom: "1rem",
                  fontWeight: 600,
                }}
              >
                TINTAXIS
              </p>
              <div
                style={{
                  fontFamily: SERIF,
                  fontSize: "1.3rem",
                  lineHeight: 1.8,
                  color: "#F5E6C8",
                }}
              >
                <div style={{ marginBottom: "0.5rem" }}>
                  <span style={{ color: "rgba(0,200,170,0.85)", fontWeight: 600 }}>85%</span>
                  <span style={{ color: "rgba(245,230,200,0.4)" }}> Author</span>
                </div>
                <div>
                  <span style={{ color: "rgba(245,230,200,0.3)", fontWeight: 600 }}>15%</span>
                  <span style={{ color: "rgba(245,230,200,0.4)" }}> Platform</span>
                </div>
              </div>
            </div>
          </motion.div>

          {/* The catch + reframing */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.15, duration: 0.6 }}
            style={{
              maxWidth: "650px",
              margin: "0 auto 2rem",
              textAlign: "center",
            }}
          >
            <p
              style={{
                fontFamily: SERIF,
                fontSize: "1.1rem",
                color: "rgba(245,230,200,0.65)",
                lineHeight: 1.8,
                marginBottom: "1.25rem",
              }}
            >
              Tintaxis is a digital publisher in its Genesis. We are not a self-publishing platform. Writers submit. We read. We select.
            </p>
            <p
              style={{
                fontFamily: SERIF,
                fontSize: "1rem",
                color: "rgba(245,230,200,0.55)",
                lineHeight: 1.8,
                fontStyle: "italic",
              }}
            >
              You&apos;re not gifting us 15%. You&apos;re earning access to a platform that amplifies your reach. Your readers, your marketing, your momentum — that&apos;s what drives your revenue. Tintaxis pushes your work through social media and every digital reading channel we can reach. But the engine is you.
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.25, duration: 0.5 }}
            style={{ textAlign: "center" }}
          >
            <Link href="/publish" passHref>
              <motion.button
                className="relative"
                style={{
                  fontFamily: MONO,
                  fontSize: "0.8rem",
                  letterSpacing: "0.25em",
                  textTransform: "uppercase",
                  color: "#C9A84C",
                  background: "transparent",
                  border: "1px solid rgba(201,168,76,0.5)",
                  padding: "0.9rem 2.5rem",
                  cursor: "pointer",
                  transition: "all 0.3s ease",
                }}
                whileHover={{
                  borderColor: "rgba(201,168,76,0.9)",
                  boxShadow: "0 0 24px rgba(201,168,76,0.2)",
                  color: "#E8C97A",
                }}
                whileTap={{ scale: 0.98 }}
              >
                SUBMIT YOUR WORK
              </motion.button>
            </Link>
          </motion.div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════════
          SECTION 3 — WHY TINTAXIS OVER SOCIAL MEDIA?
          ══════════════════════════════════════════════════════════ */}
      <section style={{ padding: "4rem 2rem", maxWidth: "900px", margin: "0 auto", textAlign: "center" }}>
        <motion.p
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          style={{
            fontFamily: SERIF,
            fontSize: "1.15rem",
            color: "rgba(245,230,200,0.65)",
            lineHeight: 1.8,
            marginBottom: "1.5rem",
          }}
        >
          On X, your thread disappears in 24 hours. On Instagram, your caption has a character limit. On Tintaxis, your book has a permanent home, a reading experience built for long-form, and readers who pay to read — not scroll past.
        </motion.p>
        <motion.p
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.1 }}
          style={{
            fontFamily: SERIF,
            fontSize: "1.15rem",
            color: "rgba(0,200,170,0.85)",
            lineHeight: 1.8,
            fontWeight: 600,
          }}
        >
          This isn&apos;t another social media profile. This is a publishing house that sends 85% of revenue back to you.
        </motion.p>
      </section>

      {/* ══════════════════════════════════════════════════════════
          SECTION 3.5 — FEATURES (simplified single line)
          ══════════════════════════════════════════════════════════ */}
      <section style={{ padding: "2rem 2rem 4rem", maxWidth: "900px", margin: "0 auto", textAlign: "center" }}>
        <motion.p
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          style={{
            fontFamily: MONO,
            fontSize: "0.75rem",
            letterSpacing: "0.2em",
            textTransform: "uppercase",
            color: "rgba(201,168,76,0.4)",
            marginBottom: "1rem",
          }}
        >
          TOOLS BUILT FOR READERS
        </motion.p>
        <motion.p
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.1 }}
          style={{
            fontFamily: SERIF,
            fontSize: "1.1rem",
            color: "rgba(245,230,200,0.55)",
            lineHeight: 1.7,
          }}
        >
          Author voiceovers. AI narration. Margin annotations. Day &amp; night modes. Multilingual.
        </motion.p>
      </section>

      {/* ══════════════════════════════════════════════════════════
          COMMUNITY IMAGE — humor break
          ══════════════════════════════════════════════════════════ */}
      <section style={{ padding: "3rem 2rem 1rem", maxWidth: "800px", margin: "0 auto", textAlign: "center" }}>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7 }}
        >
          <img
            src="/community-penguins.png"
            alt="Shakespeare surrounded by penguins reading books — Codex and Scribe subscribers in the Tintaxis library"
            style={{
              width: "100%",
              maxWidth: "700px",
              borderRadius: "6px",
              border: "1px solid rgba(201,168,76,0.12)",
              marginBottom: "1.25rem",
            }}
          />
          <p
            style={{
              fontFamily: SERIF,
              fontSize: "1.1rem",
              fontStyle: "italic",
              color: "rgba(245,230,200,0.5)",
              lineHeight: 1.6,
            }}
          >
            Your readers are waiting.
          </p>
          <p
            style={{
              fontFamily: MONO,
              fontSize: "0.45rem",
              letterSpacing: "0.15em",
              color: "rgba(201,168,76,0.2)",
              textTransform: "uppercase",
              marginTop: "0.75rem",
            }}
          >
            Image generated with Google Gemini
          </p>
        </motion.div>
      </section>

      {/* ══════════════════════════════════════════════════════════
          SECTION 3.5 — CONTINUE READING (personalized)
          ══════════════════════════════════════════════════════════ */}
      {lastRead && lastRead.progressPct > 0 && lastRead.progressPct < 95 && (
        <section style={{ padding: "2rem 2rem 0", maxWidth: "1100px", margin: "0 auto" }}>
          <Link href={`${lastRead.url}?resume=1`} style={{ textDecoration: "none" }}>
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
              style={{
                border: "1px solid rgba(201,168,76,0.2)",
                background: "rgba(201,168,76,0.03)",
                padding: "1.25rem 1.5rem",
                cursor: "pointer",
                transition: "all 0.3s ease",
                position: "relative",
                overflow: "hidden",
              }}
              whileHover={{ borderColor: "rgba(201,168,76,0.4)", background: "rgba(201,168,76,0.06)" }}
            >
              {/* Progress bar at top */}
              <div style={{
                position: "absolute",
                top: 0,
                left: 0,
                width: "100%",
                height: "2px",
                background: "rgba(201,168,76,0.08)",
              }}>
                <motion.div
                  initial={{ width: 0 }}
                  whileInView={{ width: `${lastRead.progressPct}%` }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.8, delay: 0.3, ease: "easeOut" }}
                  style={{
                    height: "100%",
                    background: "rgba(201,168,76,0.5)",
                  }}
                />
              </div>

              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: "1rem", flexWrap: "wrap", overflow: "hidden" }}>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <p style={{
                    fontFamily: MONO,
                    fontSize: "0.5rem",
                    letterSpacing: "0.25em",
                    color: "rgba(201,168,76,0.4)",
                    textTransform: "uppercase",
                    marginBottom: "0.35rem",
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    whiteSpace: "nowrap",
                  }}>
                    Continue reading · {lastRead.progressPct}% · Ch. {lastRead.chapterNumber}/{lastRead.totalChapters}
                  </p>
                  <p style={{
                    fontFamily: SERIF,
                    fontSize: "1.1rem",
                    fontStyle: "italic",
                    color: "rgba(245,230,200,0.8)",
                    lineHeight: 1.3,
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    whiteSpace: "nowrap",
                  }}>
                    {lastRead.chapterTitle}
                    <span style={{ color: "rgba(245,230,200,0.35)", fontSize: "0.95rem" }}>
                      {" "}— {lastRead.bookTitle}
                    </span>
                  </p>
                </div>
                <span style={{
                  fontFamily: MONO,
                  fontSize: "0.55rem",
                  letterSpacing: "0.2em",
                  color: "#C9A84C",
                  textTransform: "uppercase",
                  opacity: 0.7,
                  flexShrink: 0,
                }}>
                  Resume →
                </span>
              </div>
            </motion.div>
          </Link>
        </section>
      )}

      {/* ══════════════════════════════════════════════════════════
          SECTION 4 — NOW READING (Book catalog)
          ══════════════════════════════════════════════════════════ */}
      <section style={{ padding: "4rem 2rem 5rem", maxWidth: "1100px", margin: "0 auto" }}>
        <SectionHeader
          tag="NOW ON TINTAXIS"
          title="Real books. Real writers. Start reading in seconds."
        />

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(min(260px, 100%), 1fr))",
            gap: "1.25rem",
            marginTop: "3rem",
          }}
        >
          {allBooks.map((book, i) => (
            <motion.div
              key={book.slug}
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-40px" }}
              transition={{ duration: 0.5, delay: i * 0.06 }}
            >
              <Link href={`/book/${book.slug}`} style={{ textDecoration: "none" }}>
                <div
                  style={{
                    padding: "1.25rem",
                    border: `1px solid ${book.accentColor}20`,
                    borderRadius: "4px",
                    background: `${book.accentColor}06`,
                    cursor: "pointer",
                    transition: "all 0.3s ease",
                    minHeight: "180px",
                    display: "flex",
                    flexDirection: "column",
                    justifyContent: "space-between",
                  }}
                  className="book-card-hover"
                >
                  {/* Language badge */}
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                    <span
                      style={{
                        fontFamily: MONO,
                        fontSize: "0.55rem",
                        letterSpacing: "0.2em",
                        color: book.accentColor,
                        textTransform: "uppercase",
                        opacity: 0.7,
                      }}
                    >
                      {book.coverLabel}
                    </span>
                    <span
                      style={{
                        fontFamily: MONO,
                        fontSize: "0.5rem",
                        color: "rgba(245,230,200,0.3)",
                      }}
                    >
                      {book.totalChapters} {book.chapterLabel?.toLowerCase()}s
                    </span>
                  </div>

                  {/* Title + author */}
                  <div style={{ marginTop: "0.75rem" }}>
                    <h3
                      style={{
                        fontFamily: SERIF,
                        fontSize: "1.2rem",
                        fontStyle: "italic",
                        color: "#F5E6C8",
                        marginBottom: "0.25rem",
                        lineHeight: 1.3,
                      }}
                    >
                      {book.title}
                    </h3>
                    <p
                      style={{
                        fontFamily: MONO,
                        fontSize: "0.55rem",
                        letterSpacing: "0.1em",
                        color: "rgba(245,230,200,0.35)",
                        textTransform: "uppercase",
                      }}
                    >
                      {book.author}
                    </p>
                  </div>

                  {/* Tagline */}
                  <p
                    style={{
                      fontFamily: SERIF,
                      fontSize: "0.9rem",
                      fontStyle: "italic",
                      color: "rgba(245,230,200,0.4)",
                      lineHeight: 1.5,
                      marginTop: "0.75rem",
                    }}
                  >
                    &ldquo;{book.tagline}&rdquo;
                  </p>

                  {/* Read button */}
                  <div
                    style={{
                      marginTop: "1rem",
                      fontFamily: MONO,
                      fontSize: "0.55rem",
                      letterSpacing: "0.2em",
                      textTransform: "uppercase",
                      color: book.accentColor,
                      opacity: 0.6,
                    }}
                  >
                    Read now →
                  </div>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════════
          SECTION 5 — FOOTER
          ══════════════════════════════════════════════════════════ */}
      <footer style={{ padding: "3rem 2rem", textAlign: "center" }}>
        <div
          style={{
            maxWidth: "600px",
            margin: "0 auto",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            gap: "2rem",
          }}
        >
          <Link
            href="/library"
            style={{
              fontFamily: MONO,
              fontSize: "0.55rem",
              letterSpacing: "0.15em",
              textTransform: "uppercase",
              color: "rgba(245,230,200,0.3)",
              textDecoration: "none",
            }}
          >
            Library
          </Link>
          <Link
            href="/writers"
            style={{
              fontFamily: MONO,
              fontSize: "0.55rem",
              letterSpacing: "0.15em",
              textTransform: "uppercase",
              color: "rgba(245,230,200,0.3)",
              textDecoration: "none",
            }}
          >
            Writers
          </Link>
          <Link
            href="/publish"
            style={{
              fontFamily: MONO,
              fontSize: "0.55rem",
              letterSpacing: "0.15em",
              textTransform: "uppercase",
              color: "rgba(245,230,200,0.3)",
              textDecoration: "none",
            }}
          >
            Publish
          </Link>
        </div>
        <p
          style={{
            fontFamily: MONO,
            fontSize: "0.5rem",
            letterSpacing: "0.2em",
            color: "rgba(201,168,76,0.2)",
            textTransform: "uppercase",
            marginTop: "1.5rem",
          }}
        >
          Tintaxis · tintaxis.com
        </p>
      </footer>

      <WelcomeBackToast />
    </div>
  );
}

// ─── SECTION HEADER (reused) ───────────────────────────────────────────────
function SectionHeader({ tag, title }: { tag: string; title: string }) {
  return (
    <div style={{ textAlign: "center" }}>
      <motion.p
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        style={{
          fontFamily: MONO,
          fontSize: "0.7rem",
          letterSpacing: "0.3em",
          textTransform: "uppercase",
          color: "#C9A84C",
          marginBottom: "1rem",
        }}
      >
        {tag}
      </motion.p>
      <motion.h2
        initial={{ opacity: 0, y: 12 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6 }}
        style={{
          fontFamily: SERIF,
          fontSize: "clamp(1.5rem, 4vw, 2.2rem)",
          fontWeight: 400,
          fontStyle: "italic",
          color: "rgba(245,230,200,0.7)",
          lineHeight: 1.4,
          maxWidth: "600px",
          margin: "0 auto",
        }}
      >
        {title}
      </motion.h2>
    </div>
  );
}

// ─── CORNER ORNAMENT ─────────────────────────────────────────────────────────
function CornerOrnament({
  position,
}: {
  position: "top-left" | "top-right" | "bottom-left" | "bottom-right";
}) {
  const styles: Record<string, string> = {
    "top-left":     "top-8 left-8",
    "top-right":    "top-8 right-8",
    "bottom-left":  "bottom-8 left-8",
    "bottom-right": "bottom-8 right-8",
  };

  const rotate: Record<string, string> = {
    "top-left":     "rotate-0",
    "top-right":    "rotate-90",
    "bottom-left":  "-rotate-90",
    "bottom-right": "rotate-180",
  };

  return (
    <svg
      className={`absolute ${styles[position]} ${rotate[position]} opacity-40`}
      width="32"
      height="32"
      viewBox="0 0 32 32"
      fill="none"
    >
      <path
        d="M2 30 L2 2 L30 2"
        stroke="#C9A84C"
        strokeWidth="1"
        fill="none"
      />
      <path d="M2 10 L8 10" stroke="#C9A84C" strokeWidth="0.5" />
      <path d="M10 2 L10 8" stroke="#C9A84C" strokeWidth="0.5" />
      <circle cx="2" cy="2" r="1.5" fill="#C9A84C" />
    </svg>
  );
}

