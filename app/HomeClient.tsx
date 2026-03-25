"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import TintaxisLogo from "@/components/ui/TintaxisLogo";
import { WelcomeBackToast } from "@/components/ui/ReturnCapture";
import { BOOKS } from "@/lib/content/books";

// ─── HOMEPAGE ─────────────────────────────────────────────────────────────────
// Conversion-focused: hero → features → catalog → writer pitch → footer.
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
            Step inside a book. Annotate it. Question it.
            <br />
            Hear the author whisper back.
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
          SECTION 2 — WHAT MAKES THIS DIFFERENT
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
          SECTION 3 — NOW READING (Book catalog)
          ══════════════════════════════════════════════════════════ */}
      <section style={{ padding: "4rem 2rem 5rem", maxWidth: "1100px", margin: "0 auto" }}>
        <SectionHeader
          tag="NOW ON TINTAXIS"
          title="Real books. Real writers. Start reading in seconds."
        />

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))",
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
          SECTION 4 — FOR WRITERS (the money pitch)
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
