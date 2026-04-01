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
    desc: "English, Spanish, and Mandarin Chinese — on the same platform, with the same tools.",
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
          SECTION 3B — THE ENVIRONMENTAL CASE FOR DIGITAL READING
          ══════════════════════════════════════════════════════════ */}
      <section
        style={{
          padding: "6rem 2rem",
          borderTop: "1px solid rgba(201,168,76,0.08)",
          borderBottom: "1px solid rgba(201,168,76,0.08)",
          background: "linear-gradient(180deg, rgba(0,0,0,0) 0%, rgba(0,40,20,0.08) 50%, rgba(0,0,0,0) 100%)",
        }}
      >
        <div style={{ maxWidth: "1000px", margin: "0 auto" }}>
          <SectionHeader
            tag="THE COST OF PAPER"
            title="Every printed book has a price the reader never sees."
          />

          {/* ── Key statistics row ── */}
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
              gap: "1.5rem",
              marginTop: "3.5rem",
              marginBottom: "3rem",
            }}
          >
            {[
              { value: "417M", unit: "metric tons", label: "of paper consumed globally each year" },
              { value: "33%", unit: "of all trees", label: "harvested go to paper production" },
              { value: "7.5L", unit: "of water", label: "to produce a single sheet of paper" },
              { value: "26M", unit: "tons of books", label: "end in landfills or are pulped annually" },
            ].map((stat, i) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-40px" }}
                transition={{ duration: 0.6, delay: i * 0.1 }}
                style={{
                  textAlign: "center",
                  padding: "1.5rem 1rem",
                  border: "1px solid rgba(0,200,170,0.12)",
                  borderRadius: "4px",
                  background: "rgba(0,200,170,0.03)",
                }}
              >
                <AnimatedCounter value={stat.value} />
                <p style={{
                  fontFamily: MONO,
                  fontSize: "0.75rem",
                  letterSpacing: "0.15em",
                  textTransform: "uppercase",
                  color: "rgba(0,200,170,0.6)",
                  marginTop: "0.15rem",
                  marginBottom: "0.5rem",
                }}>
                  {stat.unit}
                </p>
                <p style={{
                  fontFamily: SERIF,
                  fontSize: "1.05rem",
                  color: "rgba(245,230,200,0.5)",
                  lineHeight: 1.5,
                }}>
                  {stat.label}
                </p>
              </motion.div>
            ))}
          </div>

          {/* ── The lifecycle: Print vs Digital ── */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7 }}
            style={{
              padding: "2rem",
              border: "1px solid rgba(201,168,76,0.12)",
              borderRadius: "4px",
              background: "rgba(201,168,76,0.02)",
              marginBottom: "3rem",
            }}
          >
            <p style={{
              fontFamily: MONO,
              fontSize: "0.8rem",
              letterSpacing: "0.25em",
              textTransform: "uppercase",
              color: "#C9A84C",
              marginBottom: "1.25rem",
              textAlign: "center",
            }}>
              LIFECYCLE COST PER BOOK
            </p>

            {/* Horizontal bar comparisons */}
            {[
              { label: "Trees consumed", print: 100, digital: 0, printLabel: "1 tree per 62 books", digitalLabel: "0 trees" },
              { label: "Water used", print: 100, digital: 3, printLabel: "8 liters per book", digitalLabel: "0.24 liters (server cooling)" },
              { label: "CO₂ emitted", print: 100, digital: 12, printLabel: "~7.5 kg per book", digitalLabel: "~0.9 kg (amortized)" },
              { label: "Waste generated", print: 100, digital: 0, printLabel: "30% unsold, pulped", digitalLabel: "Zero physical waste" },
            ].map((row, i) => (
              <div key={row.label} style={{ marginBottom: i < 3 ? "1.25rem" : 0 }}>
                <p style={{
                  fontFamily: MONO,
                  fontSize: "0.75rem",
                  letterSpacing: "0.1em",
                  textTransform: "uppercase",
                  color: "rgba(245,230,200,0.55)",
                  marginBottom: "0.5rem",
                }}>
                  {row.label}
                </p>
                <div style={{ display: "flex", flexDirection: "column", gap: "0.35rem" }}>
                  {/* Print bar */}
                  <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
                    <span style={{ fontFamily: MONO, fontSize: "0.7rem", color: "rgba(245,230,200,0.4)", width: "55px", flexShrink: 0 }}>PRINT</span>
                    <div style={{ flex: 1, height: "22px", background: "rgba(255,255,255,0.03)", borderRadius: "2px", overflow: "hidden", position: "relative" }}>
                      <motion.div
                        initial={{ width: 0 }}
                        whileInView={{ width: `${row.print}%` }}
                        viewport={{ once: true }}
                        transition={{ duration: 1, delay: 0.3 + i * 0.15, ease: "easeOut" }}
                        style={{
                          height: "100%",
                          background: "linear-gradient(90deg, rgba(180,80,60,0.6), rgba(180,80,60,0.35))",
                          borderRadius: "2px",
                        }}
                      />
                    </div>
                    <span style={{ fontFamily: MONO, fontSize: "0.65rem", color: "rgba(180,80,60,0.7)", minWidth: "160px", textAlign: "right" }}>{row.printLabel}</span>
                  </div>
                  {/* Digital bar */}
                  <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
                    <span style={{ fontFamily: MONO, fontSize: "0.7rem", color: "rgba(0,200,170,0.6)", width: "55px", flexShrink: 0 }}>DIGITAL</span>
                    <div style={{ flex: 1, height: "22px", background: "rgba(255,255,255,0.03)", borderRadius: "2px", overflow: "hidden", position: "relative" }}>
                      <motion.div
                        initial={{ width: 0 }}
                        whileInView={{ width: `${Math.max(row.digital, 1)}%` }}
                        viewport={{ once: true }}
                        transition={{ duration: 1, delay: 0.4 + i * 0.15, ease: "easeOut" }}
                        style={{
                          height: "100%",
                          background: "linear-gradient(90deg, rgba(0,200,170,0.6), rgba(0,200,170,0.35))",
                          borderRadius: "2px",
                          minWidth: row.digital > 0 ? "4px" : "0px",
                        }}
                      />
                    </div>
                    <span style={{ fontFamily: MONO, fontSize: "0.65rem", color: "rgba(0,200,170,0.6)", minWidth: "160px", textAlign: "right" }}>{row.digitalLabel}</span>
                  </div>
                </div>
              </div>
            ))}
          </motion.div>

          {/* ── The compounding advantage chart ── */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7 }}
            style={{
              padding: "2rem",
              border: "1px solid rgba(201,168,76,0.12)",
              borderRadius: "4px",
              background: "rgba(201,168,76,0.02)",
              marginBottom: "3rem",
            }}
          >
            <p style={{
              fontFamily: MONO,
              fontSize: "0.8rem",
              letterSpacing: "0.25em",
              textTransform: "uppercase",
              color: "#C9A84C",
              marginBottom: "0.5rem",
              textAlign: "center",
            }}>
              THE COMPOUNDING ADVANTAGE
            </p>
            <p style={{
              fontFamily: SERIF,
              fontSize: "1.1rem",
              color: "rgba(245,230,200,0.45)",
              textAlign: "center",
              marginBottom: "1.5rem",
              lineHeight: 1.6,
            }}>
              Print cost grows with every copy. Digital cost stays flat after the first.
            </p>

            {/* SVG chart: Print (linear) vs Digital (flat) */}
            <CostComparisonChart />
          </motion.div>

          {/* ── The recycling myth ── */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
              gap: "1.5rem",
              marginBottom: "3rem",
            }}
          >
            <div style={{
              padding: "1.5rem",
              border: "1px solid rgba(180,80,60,0.15)",
              borderRadius: "4px",
              background: "rgba(180,80,60,0.03)",
            }}>
              <p style={{
                fontFamily: MONO,
                fontSize: "0.8rem",
                letterSpacing: "0.2em",
                textTransform: "uppercase",
                color: "rgba(180,80,60,0.7)",
                marginBottom: "0.75rem",
              }}>
                THE RECYCLING MYTH
              </p>
              <p style={{
                fontFamily: SERIF,
                fontSize: "1.1rem",
                color: "rgba(245,230,200,0.55)",
                lineHeight: 1.7,
              }}>
                Paper degrades after 5 to 7 recycling cycles. Each round shortens the fibers, producing weaker material. Coated papers, glued bindings, and ink-laden covers often cannot be recycled at all. Less than half of all paper is actually recovered — the rest is burned or buried.
              </p>
            </div>
            <div style={{
              padding: "1.5rem",
              border: "1px solid rgba(0,200,170,0.15)",
              borderRadius: "4px",
              background: "rgba(0,200,170,0.03)",
            }}>
              <p style={{
                fontFamily: MONO,
                fontSize: "0.8rem",
                letterSpacing: "0.2em",
                textTransform: "uppercase",
                color: "rgba(0,200,170,0.7)",
                marginBottom: "0.75rem",
              }}>
                THE DIGITAL ALTERNATIVE
              </p>
              <p style={{
                fontFamily: SERIF,
                fontSize: "1.1rem",
                color: "rgba(245,230,200,0.55)",
                lineHeight: 1.7,
              }}>
                A digital book is distributed once and read infinitely. No shipping fleets, no warehouse waste, no remaindered copies pulped at the end of a sales cycle. The environmental cost of the 10th reader is identical to the 10 millionth.
              </p>
            </div>
          </motion.div>

          {/* ── Closing argument ── */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            style={{ textAlign: "center", maxWidth: "700px", margin: "0 auto" }}
          >
            <div style={{
              width: "60px",
              height: "1px",
              background: "rgba(201,168,76,0.3)",
              margin: "0 auto 2rem",
            }} />
            <p style={{
              fontFamily: SERIF,
              fontSize: "clamp(1.2rem, 3vw, 1.6rem)",
              fontStyle: "italic",
              color: "rgba(245,230,200,0.75)",
              lineHeight: 1.6,
              marginBottom: "1rem",
            }}>
              A printed book is a tree&apos;s past.<br />
              A digital book is humanity&apos;s future.
            </p>
            <p style={{
              fontFamily: SERIF,
              fontSize: "1.05rem",
              color: "rgba(245,230,200,0.45)",
              lineHeight: 1.7,
              marginBottom: "2rem",
            }}>
              You are not replacing books — you are freeing stories from material limits. Tintaxis is a platform built for the era when words no longer require weight.
            </p>
            <Link href="/library" passHref>
              <motion.button
                className="relative"
                style={{
                  fontFamily: MONO,
                  fontSize: "0.8rem",
                  letterSpacing: "0.25em",
                  textTransform: "uppercase",
                  color: "rgba(0,200,170,0.85)",
                  background: "transparent",
                  border: "1px solid rgba(0,200,170,0.4)",
                  padding: "0.9rem 2.5rem",
                  cursor: "pointer",
                  transition: "all 0.3s ease",
                }}
                whileHover={{
                  borderColor: "rgba(0,200,170,0.8)",
                  boxShadow: "0 0 24px rgba(0,200,170,0.15)",
                  color: "rgba(0,230,190,1)",
                }}
                whileTap={{ scale: 0.98 }}
              >
                READ WITHOUT WASTE
              </motion.button>
            </Link>
            <p style={{
              fontFamily: MONO,
              fontSize: "0.6rem",
              letterSpacing: "0.15em",
              color: "rgba(201,168,76,0.25)",
              textTransform: "uppercase",
              marginTop: "1rem",
            }}>
              Data sourced from EPA, TAPPI, and Environmental Paper Network
            </p>
          </motion.div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════════
          SECTION 2 — FOR WRITERS (the money pitch — FIRST thing they see)
          ══════════════════════════════════════════════════════════ */}
      <section
        style={{
          padding: "5rem 2rem",
          borderTop: "1px solid rgba(201,168,76,0.08)",
          borderBottom: "1px solid rgba(201,168,76,0.08)",
        }}
      >
        <div style={{ maxWidth: "800px", margin: "0 auto", textAlign: "center" }}>
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
              marginBottom: "0.75rem",
            }}
          >
            You keep{" "}
            <span style={{ color: "#C9A84C", fontWeight: 600 }}>85%</span>{" "}
            of every dollar.
          </motion.h2>

          <motion.p
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1, duration: 0.6 }}
            style={{
              fontFamily: SERIF,
              fontSize: "1.15rem",
              color: "rgba(245,230,200,0.55)",
              lineHeight: 1.7,
              maxWidth: "600px",
              margin: "0 auto 1rem",
            }}
          >
            Tintaxis keeps 15% to run the platform. No ads. No data harvesting. No middlemen.
            Your readers&apos; money goes directly to you — the person who wrote the words.
          </motion.p>

          {/* Revenue breakdown */}
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2, duration: 0.5 }}
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
              gap: "1rem",
              maxWidth: "700px",
              margin: "2.5rem auto",
            }}
          >
            {[
              { tier: "Codex", price: "$1.99/mo", writer: "$1.69" },
              { tier: "Scribe", price: "$3.99/mo", writer: "$3.39" },
              { tier: "Archive", price: "$7.99/mo", writer: "$6.79" },
              { tier: "Chronicler", price: "$9.99/mo", writer: "$8.49" },
            ].map((t) => (
              <div
                key={t.tier}
                style={{
                  padding: "1rem",
                  border: "1px solid rgba(0,200,170,0.15)",
                  borderRadius: "4px",
                  background: "rgba(0,200,170,0.03)",
                  textAlign: "center",
                }}
              >
                <p
                  style={{
                    fontFamily: MONO,
                    fontSize: "0.6rem",
                    letterSpacing: "0.15em",
                    textTransform: "uppercase",
                    color: "rgba(245,230,200,0.4)",
                    marginBottom: "0.5rem",
                  }}
                >
                  {t.tier} · {t.price}
                </p>
                <p
                  style={{
                    fontFamily: SERIF,
                    fontSize: "1.4rem",
                    fontWeight: 600,
                    color: "rgba(0,200,170,0.85)",
                  }}
                >
                  {t.writer}
                </p>
                <p
                  style={{
                    fontFamily: MONO,
                    fontSize: "0.5rem",
                    color: "rgba(245,230,200,0.25)",
                    marginTop: "0.25rem",
                  }}
                >
                  → the writer
                </p>
              </div>
            ))}
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.3, duration: 0.5 }}
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
                PUBLISH YOUR WORK
              </motion.button>
            </Link>
          </motion.div>

          {/* Stripe trust badge */}
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.45, duration: 0.5 }}
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: "0.5rem",
              marginTop: "1.25rem",
            }}
          >
            <img src="/stripe-badge.png" alt="Stripe" width={18} height={18} style={{ borderRadius: "3px" }} />
            <span style={{
              fontFamily: MONO,
              fontSize: "0.6rem",
              letterSpacing: "0.15em",
              color: "rgba(201,168,76,0.3)",
              textTransform: "uppercase",
            }}>
              Secure payments via <span style={{ color: "rgba(201,168,76,0.5)", fontWeight: 600 }}>Stripe</span>
            </span>
          </motion.div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════════
          SECTION 3 — WHAT MAKES THIS DIFFERENT
          ══════════════════════════════════════════════════════════ */}
      <section style={{ padding: "5rem 2rem", maxWidth: "1100px", margin: "0 auto" }}>
        <SectionHeader
          tag="NOT ANOTHER READING APP"
          title="A reading experience that doesn't exist anywhere else."
        />

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))",
            gap: "1.5rem",
            marginTop: "3rem",
          }}
        >
          {FEATURES.map((f, i) => (
            <motion.div
              key={f.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-50px" }}
              transition={{ duration: 0.5, delay: i * 0.08 }}
              style={{
                padding: "1.5rem",
                border: "1px solid rgba(201,168,76,0.1)",
                borderRadius: "4px",
                background: "rgba(201,168,76,0.02)",
              }}
            >
              <div style={{ fontSize: "1.5rem", marginBottom: "0.75rem" }}>{f.icon}</div>
              <h3
                style={{
                  fontFamily: MONO,
                  fontSize: "0.75rem",
                  letterSpacing: "0.15em",
                  textTransform: "uppercase",
                  color: "#C9A84C",
                  marginBottom: "0.5rem",
                }}
              >
                {f.title}
              </h3>
              <p
                style={{
                  fontFamily: SERIF,
                  fontSize: "1rem",
                  color: "rgba(245,230,200,0.55)",
                  lineHeight: 1.6,
                }}
              >
                {f.desc}
              </p>
            </motion.div>
          ))}
        </div>
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
          <Link href={lastRead.url} style={{ textDecoration: "none" }}>
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

// ─── ANIMATED COUNTER (scroll-triggered number reveal) ─────────────────────
function AnimatedCounter({ value }: { value: string }) {
  const [displayed, setDisplayed] = useState(value);
  const [hasAnimated, setHasAnimated] = useState(false);

  // Extract numeric part and suffix (e.g., "417M" → 417, "M")
  const numMatch = value.match(/^([\d.]+)(.*)$/);
  const targetNum = numMatch ? parseFloat(numMatch[1]) : 0;
  const suffix = numMatch ? numMatch[2] : value;

  useEffect(() => {
    if (hasAnimated) return;
    // Will be triggered by intersection observer below
  }, [hasAnimated]);

  return (
    <motion.p
      style={{
        fontFamily: MONO,
        fontSize: "clamp(1.8rem, 4vw, 2.4rem)",
        fontWeight: 700,
        color: "rgba(0,200,170,0.9)",
        lineHeight: 1,
      }}
      initial={{ opacity: 0, scale: 0.8 }}
      whileInView={{ opacity: 1, scale: 1 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5, ease: "easeOut" }}
      onViewportEnter={() => {
        if (hasAnimated) return;
        setHasAnimated(true);
        const duration = 1200;
        const startTime = Date.now();
        const tick = () => {
          const elapsed = Date.now() - startTime;
          const progress = Math.min(elapsed / duration, 1);
          const eased = 1 - Math.pow(1 - progress, 3); // ease-out cubic
          const current = targetNum * eased;
          if (targetNum >= 100) {
            setDisplayed(Math.round(current) + suffix);
          } else if (targetNum >= 10) {
            setDisplayed(current.toFixed(1) + suffix);
          } else {
            setDisplayed(current.toFixed(1) + suffix);
          }
          if (progress < 1) requestAnimationFrame(tick);
          else setDisplayed(value);
        };
        requestAnimationFrame(tick);
      }}
    >
      {displayed}
    </motion.p>
  );
}

// ─── COST COMPARISON CHART (SVG: linear print vs flat digital) ────────────
function CostComparisonChart() {
  const W = 600;
  const H = 260;
  const PAD = { top: 20, right: 20, bottom: 40, left: 50 };
  const chartW = W - PAD.left - PAD.right;
  const chartH = H - PAD.top - PAD.bottom;

  // Data: books read (x) → environmental cost index (y)
  // Print: linear growth. Digital: flat after initial device cost.
  const points = [0, 5, 10, 20, 30, 50, 75, 100];
  const printCost = points.map((x) => x * 7.5); // 7.5 kg CO₂ per book
  const digitalCost = points.map((x) => 30 + x * 0.1); // device amortized + marginal
  const maxY = 750;

  const toX = (val: number) => PAD.left + (val / 100) * chartW;
  const toY = (val: number) => PAD.top + chartH - (val / maxY) * chartH;

  const printPath = points.map((x, i) => `${i === 0 ? "M" : "L"}${toX(x)},${toY(printCost[i])}`).join(" ");
  const digitalPath = points.map((x, i) => `${i === 0 ? "M" : "L"}${toX(x)},${toY(digitalCost[i])}`).join(" ");

  return (
    <div style={{ width: "100%", maxWidth: `${W}px`, margin: "0 auto" }}>
      <svg
        viewBox={`0 0 ${W} ${H}`}
        style={{ width: "100%", height: "auto" }}
        preserveAspectRatio="xMidYMid meet"
      >
        {/* Grid lines */}
        {[0, 150, 300, 450, 600, 750].map((y) => (
          <line
            key={y}
            x1={PAD.left}
            y1={toY(y)}
            x2={W - PAD.right}
            y2={toY(y)}
            stroke="rgba(245,230,200,0.06)"
            strokeWidth="1"
          />
        ))}

        {/* Y-axis labels */}
        {[0, 150, 300, 450, 600, 750].map((y) => (
          <text
            key={`label-${y}`}
            x={PAD.left - 8}
            y={toY(y) + 3}
            textAnchor="end"
            style={{ fontFamily: MONO, fontSize: "10px", fill: "rgba(245,230,200,0.3)" }}
          >
            {y}
          </text>
        ))}

        {/* X-axis labels */}
        {[0, 25, 50, 75, 100].map((x) => (
          <text
            key={`x-${x}`}
            x={toX(x)}
            y={H - PAD.bottom + 18}
            textAnchor="middle"
            style={{ fontFamily: MONO, fontSize: "10px", fill: "rgba(245,230,200,0.3)" }}
          >
            {x}
          </text>
        ))}

        {/* Axis labels */}
        <text
          x={W / 2}
          y={H - 4}
          textAnchor="middle"
          style={{ fontFamily: MONO, fontSize: "9px", fill: "rgba(245,230,200,0.3)", letterSpacing: "0.1em" }}
        >
          BOOKS READ
        </text>
        <text
          x={12}
          y={PAD.top + chartH / 2}
          textAnchor="middle"
          transform={`rotate(-90, 12, ${PAD.top + chartH / 2})`}
          style={{ fontFamily: MONO, fontSize: "9px", fill: "rgba(245,230,200,0.3)", letterSpacing: "0.1em" }}
        >
          CO₂ (kg)
        </text>

        {/* Print line (red/warm) */}
        <motion.path
          d={printPath}
          fill="none"
          stroke="rgba(180,80,60,0.7)"
          strokeWidth="2"
          strokeLinecap="round"
          initial={{ pathLength: 0 }}
          whileInView={{ pathLength: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 1.5, delay: 0.3, ease: "easeOut" }}
        />

        {/* Digital line (green/teal) */}
        <motion.path
          d={digitalPath}
          fill="none"
          stroke="rgba(0,200,170,0.7)"
          strokeWidth="2"
          strokeLinecap="round"
          initial={{ pathLength: 0 }}
          whileInView={{ pathLength: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 1.5, delay: 0.5, ease: "easeOut" }}
        />

        {/* Legend */}
        <rect x={PAD.left + 10} y={PAD.top + 8} width="12" height="2" rx="1" fill="rgba(180,80,60,0.7)" />
        <text x={PAD.left + 28} y={PAD.top + 12} style={{ fontFamily: MONO, fontSize: "9px", fill: "rgba(180,80,60,0.7)" }}>
          Print (linear)
        </text>
        <rect x={PAD.left + 10} y={PAD.top + 22} width="12" height="2" rx="1" fill="rgba(0,200,170,0.7)" />
        <text x={PAD.left + 28} y={PAD.top + 26} style={{ fontFamily: MONO, fontSize: "9px", fill: "rgba(0,200,170,0.7)" }}>
          Digital (flat)
        </text>
      </svg>
    </div>
  );
}
