"use client";

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence, useInView } from "framer-motion";
import Link from "next/link";

// ─── THE LIVING PAGE ────────────────────────────────────────────────────────
// The signature moment of Tintaxis. One page, zero friction, everything alive.
// This is not a demo. This is the experience.
//
// A reader opens this and sees:
// - Text that breathes (paragraphs that fade in as you scroll)
// - Passages glowing where others paused (heat traces)
// - Margin voices from other readers (raw, emotional)
// - Author whispers woven into the text (Chico is present)
// - A presence indicator (you are not alone)
// - A question thread (living conversation in the margins)
//
// No login. No signup. No gate. Just the moment.

const MONO = '"JetBrains Mono", monospace';
const SERIF = '"EB Garamond", Garamond, Georgia, serif';

// ─── THE TEXT (from The Hunt, Chapter One) ──────────────────────────────────

interface LivingParagraph {
  text: string;
  heat?: number;         // 0-1, how many "readers" lingered here
  marginVoice?: {        // a reader's raw reaction
    name: string;
    text: string;
    time: string;
  };
  authorWhisper?: {      // Chico's voice, woven in
    text: string;
  };
  thread?: {             // a question + author response
    question: { name: string; text: string };
    response: { text: string };
  };
}

const PARAGRAPHS: LivingParagraph[] = [
  {
    text: `Robbin sat with the new nurse, Alma Mae, discussing the events of Gertrude's death.`,
    heat: 0.15,
  },
  {
    text: `Alma didn't know what she was in for. That within forty-five minutes the story of a teacher's suicide would be mustered over lunch like fries. Some of Robbin's information isn't reliable, for she wasn't there, but she's as close to the truth as anyone else.`,
    heat: 0.6,
    marginVoice: {
      name: "Daniela",
      text: "The way this pulls you in before you even realize what you're reading about.",
      time: "3 days ago",
    },
  },
  {
    text: `"So, where should I begin?" Robbin said. "Mrs.\u00a0Gertrude Barrow was a teacher at the Little Pines School. Loved and respected by everyone; she lit up the room with her Colgate smile!"`,
    heat: 0.3,
  },
  {
    text: `Robbin was a fat slob, a careless waste. Her jealousy oozed through her pores and pig-haired skin like the ketchup from its glass bottle.`,
    heat: 0.85,
    marginVoice: {
      name: "Marcus",
      text: "This line is brutal. You can feel the narrator turning on Robbin mid-sentence.",
      time: "1 week ago",
    },
    authorWhisper: {
      text: "I wanted the reader to distrust Robbin before she even finishes speaking. The narrator betrays her in real time.",
    },
  },
  {
    text: `She continued her explanations in an envious tone to Alma.`,
  },
  {
    text: `"Growing up, her dedication to schooling, her authority and leadership among us left many in awe. Her parents, the Sanders, die-hard community members! Always at Sunday mass, members of the school board... to add, college funds in place; declaring them THE best parents you can imagine. No wonder she turned out so perfect..." she paused and smirked.`,
    heat: 0.45,
    thread: {
      question: {
        name: "Anya",
        text: "Is Robbin telling this story to connect with Alma, or to perform for her?",
      },
      response: {
        text: "Both. That's what makes her dangerous. She believes her own performance.",
      },
    },
  },
  {
    text: `"Gertrude was so popular we created a darn chart so everyone knew when she was available! Can you believe that?! Sunday dinner, birthday parties and baptisms were booked months in advance," she laughed throwing her head back.`,
    heat: 0.2,
  },
  {
    text: `"You can imagine how the town felt when we heard the news of her death... I was one of the first to hear, I'll have you know... My friend in the department called me late that very afternoon. I cried the second he hung up the phone. Couldn't believe she was dead... I thought it was a joke!"`,
    heat: 0.7,
    marginVoice: {
      name: "Tomás",
      text: "\"I was one of the first to hear, I'll have you know\" — she's proud of her proximity to tragedy. That's the whole character right there.",
      time: "5 days ago",
    },
  },
  {
    text: `"It was the talk of town; people drew their own conclusions, and, Honey, suicide was not one of them," she said, touching Alma's arm. As she reached over for her coffee some had spilled in the process.`,
    heat: 0.55,
    authorWhisper: {
      text: "The coffee spill. Nobody notices it the first time. But it tells you everything about how careless Robbin is with other people's space.",
    },
  },
  {
    text: `"How's that coffee, Alma?"`,
  },
  {
    text: `"It'll do!"`,
    heat: 0.1,
  },
  {
    text: `"You sure don't drink coffee for a nurse. Well, where was I?"`,
  },
  {
    text: `"People and something about conclusions...?" Alma replied.`,
    heat: 0.35,
    marginVoice: {
      name: "Keiko",
      text: "Alma is the smartest person in this room and she's pretending not to be.",
      time: "2 weeks ago",
    },
  },
];

// ─── PRESENCE DATA ──────────────────────────────────────────────────────────

const READER_COUNT = 47;
const ACTIVE_NOW = 3;

// ─── COMPONENT ──────────────────────────────────────────────────────────────

export default function LivingPage() {
  const [entered, setEntered] = useState(false);
  const [presenceVisible, setPresenceVisible] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Show presence indicator after 3 seconds
    const timer = setTimeout(() => setPresenceVisible(true), 3000);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div
      ref={containerRef}
      style={{
        minHeight: "100vh",
        backgroundColor: "#0D0B08",
        position: "relative",
        overflow: "hidden",
      }}
    >
      {/* ── Ambient noise texture ──────────────────────────────── */}
      <div
        className="vault-noise"
        style={{ position: "fixed", inset: 0, pointerEvents: "none", zIndex: 0 }}
      />

      {/* ── Presence indicator (top right, breathing) ──────────── */}
      <AnimatePresence>
        {presenceVisible && (
          <motion.div
            initial={{ opacity: 0, x: 12 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
            style={{
              position: "fixed",
              top: "1.25rem",
              right: "clamp(1rem, 3vw, 2rem)",
              zIndex: 50,
              display: "flex",
              alignItems: "center",
              gap: "8px",
            }}
          >
            <motion.div
              animate={{ opacity: [0.4, 0.8, 0.4] }}
              transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
              style={{
                width: "6px",
                height: "6px",
                borderRadius: "50%",
                background: "rgba(201,168,76,0.7)",
              }}
            />
            <span
              style={{
                fontFamily: MONO,
                fontSize: "0.35rem",
                letterSpacing: "0.15em",
                color: "rgba(201,168,76,0.3)",
                textTransform: "uppercase",
              }}
            >
              {ACTIVE_NOW} reading now
            </span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Entry threshold ────────────────────────────────────── */}
      <AnimatePresence mode="wait">
        {!entered ? (
          <motion.div
            key="threshold"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.6 }}
            style={{
              minHeight: "100vh",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              padding: "2rem",
              position: "relative",
              zIndex: 10,
            }}
          >
            <motion.p
              style={{
                fontFamily: MONO,
                fontSize: "0.4rem",
                letterSpacing: "0.35em",
                color: "rgba(201,168,76,0.3)",
                textTransform: "uppercase",
                marginBottom: "2rem",
              }}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3, duration: 0.8 }}
            >
              Tintaxis
            </motion.p>

            <motion.h1
              style={{
                fontFamily: SERIF,
                fontSize: "clamp(1.5rem, 5vw, 2.5rem)",
                fontWeight: 400,
                fontStyle: "italic",
                color: "rgba(245,230,200,0.85)",
                textAlign: "center",
                lineHeight: 1.3,
                margin: "0 0 1rem",
                maxWidth: "20ch",
              }}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6, duration: 0.8 }}
            >
              This page remembers everyone who read it.
            </motion.h1>

            <motion.p
              style={{
                fontFamily: SERIF,
                fontSize: "clamp(0.9rem, 2.5vw, 1.05rem)",
                fontStyle: "italic",
                color: "rgba(245,230,200,0.35)",
                textAlign: "center",
                lineHeight: 1.7,
                maxWidth: "38ch",
                margin: "0 0 2.5rem",
              }}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1.0, duration: 0.8 }}
            >
              {READER_COUNT} readers have been here. Some left traces. The author is present. You are not reading alone.
            </motion.p>

            <motion.button
              onClick={() => setEntered(true)}
              style={{
                fontFamily: MONO,
                fontSize: "0.5rem",
                letterSpacing: "0.25em",
                textTransform: "uppercase",
                padding: "14px 36px",
                border: "1px solid rgba(201,168,76,0.35)",
                borderRadius: "2px",
                background: "rgba(201,168,76,0.05)",
                color: "rgba(201,168,76,0.7)",
                cursor: "pointer",
                position: "relative",
                transition: "all 0.25s ease",
              }}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1.4, duration: 0.6 }}
              whileHover={{
                borderColor: "rgba(201,168,76,0.6)",
                background: "rgba(201,168,76,0.1)",
                color: "rgba(201,168,76,0.9)",
              }}
              whileTap={{ scale: 0.98 }}
            >
              Enter the Page
            </motion.button>

            <motion.p
              style={{
                fontFamily: MONO,
                fontSize: "0.32rem",
                letterSpacing: "0.2em",
                color: "rgba(245,230,200,0.12)",
                textTransform: "uppercase",
                marginTop: "3rem",
              }}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1.8, duration: 0.6 }}
            >
              No login required
            </motion.p>
          </motion.div>
        ) : (
          <motion.div
            key="living"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            style={{
              maxWidth: "860px",
              margin: "0 auto",
              padding: "clamp(3rem, 8vw, 6rem) clamp(1.25rem, 5vw, 2.5rem) 8rem",
              position: "relative",
              zIndex: 10,
            }}
          >
            {/* ── Chapter header ──────────────────────────────── */}
            <motion.div
              style={{ marginBottom: "3rem", textAlign: "center" }}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
            >
              <p
                style={{
                  fontFamily: MONO,
                  fontSize: "0.4rem",
                  letterSpacing: "0.35em",
                  color: "rgba(192,57,43,0.5)",
                  textTransform: "uppercase",
                  marginBottom: "0.75rem",
                }}
              >
                The Hunt · Chapter One
              </p>
              <h2
                style={{
                  fontFamily: SERIF,
                  fontSize: "clamp(1.5rem, 5vw, 2.25rem)",
                  fontWeight: 400,
                  fontStyle: "italic",
                  color: "rgba(245,230,200,0.85)",
                  margin: "0 0 0.4rem",
                  lineHeight: 1.2,
                }}
              >
                What Robbin Told Alma
              </h2>
              <p
                style={{
                  fontFamily: SERIF,
                  fontSize: "0.9rem",
                  fontStyle: "italic",
                  color: "rgba(245,230,200,0.3)",
                  margin: 0,
                }}
              >
                The Diner at the Edge of Little Pines
              </p>
            </motion.div>

            {/* ── Epigraph ──────────────────────────────────── */}
            <motion.div
              style={{
                borderLeft: "2px solid rgba(192,57,43,0.25)",
                paddingLeft: "1.25rem",
                marginBottom: "3rem",
                maxWidth: "32ch",
              }}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3, duration: 0.6 }}
            >
              <p
                style={{
                  fontFamily: SERIF,
                  fontSize: "0.95rem",
                  fontStyle: "italic",
                  color: "rgba(245,230,200,0.45)",
                  lineHeight: 1.7,
                  margin: "0 0 0.5rem",
                }}
              >
                &ldquo;You can&rsquo;t really trust the voices you hear.&rdquo;
              </p>
              <p
                style={{
                  fontFamily: MONO,
                  fontSize: "0.35rem",
                  letterSpacing: "0.15em",
                  color: "rgba(192,57,43,0.35)",
                  textTransform: "uppercase",
                }}
              >
                — The Hunt
              </p>
            </motion.div>

            {/* ── Brass rule ────────────────────────────────── */}
            <div
              style={{
                height: "1px",
                background:
                  "linear-gradient(90deg, transparent, rgba(201,168,76,0.2) 30%, rgba(201,168,76,0.2) 70%, transparent)",
                marginBottom: "3rem",
              }}
            />

            {/* ── Reader count whisper ──────────────────────── */}
            <motion.p
              style={{
                fontFamily: MONO,
                fontSize: "0.35rem",
                letterSpacing: "0.2em",
                color: "rgba(201,168,76,0.2)",
                textTransform: "uppercase",
                textAlign: "center",
                marginBottom: "3rem",
              }}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5, duration: 0.8 }}
            >
              {READER_COUNT} readers have passed through this chapter
            </motion.p>

            {/* ── The living text ───────────────────────────── */}
            <div style={{ position: "relative" }}>
              {PARAGRAPHS.map((para, i) => (
                <LivingParagraphBlock key={i} para={para} index={i} />
              ))}
            </div>

            {/* ── Fade out + CTA ───────────────────────────── */}
            <div
              style={{
                position: "relative",
                marginTop: "-4rem",
                paddingTop: "4rem",
                background:
                  "linear-gradient(to bottom, transparent 0%, #0D0B08 60%)",
              }}
            >
              <div
                style={{
                  textAlign: "center",
                  padding: "3rem 0 2rem",
                }}
              >
                <motion.p
                  style={{
                    fontFamily: SERIF,
                    fontSize: "clamp(1.1rem, 3vw, 1.35rem)",
                    fontStyle: "italic",
                    color: "rgba(245,230,200,0.65)",
                    lineHeight: 1.6,
                    maxWidth: "28ch",
                    margin: "0 auto 0.75rem",
                  }}
                  initial={{ opacity: 0, y: 12 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.6 }}
                >
                  This is how books should feel.
                </motion.p>

                <motion.p
                  style={{
                    fontFamily: MONO,
                    fontSize: "0.38rem",
                    letterSpacing: "0.2em",
                    color: "rgba(201,168,76,0.3)",
                    textTransform: "uppercase",
                    marginBottom: "2rem",
                  }}
                  initial={{ opacity: 0 }}
                  whileInView={{ opacity: 1 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.2, duration: 0.6 }}
                >
                  The rest of Chapter One is waiting
                </motion.p>

                <motion.div
                  initial={{ opacity: 0, y: 8 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.3, duration: 0.5 }}
                >
                  <Link
                    href="/book/the-hunt/chapter/one"
                    style={{
                      display: "inline-block",
                      fontFamily: MONO,
                      fontSize: "0.5rem",
                      letterSpacing: "0.25em",
                      textTransform: "uppercase",
                      padding: "14px 36px",
                      border: "1px solid rgba(192,57,43,0.4)",
                      borderRadius: "2px",
                      background: "rgba(192,57,43,0.06)",
                      color: "rgba(192,57,43,0.8)",
                      textDecoration: "none",
                      transition: "all 0.25s ease",
                    }}
                  >
                    Continue Reading
                  </Link>
                </motion.div>

                <motion.div
                  style={{
                    marginTop: "2rem",
                    display: "flex",
                    justifyContent: "center",
                    gap: "1.5rem",
                    flexWrap: "wrap",
                  }}
                  initial={{ opacity: 0 }}
                  whileInView={{ opacity: 1 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.5, duration: 0.5 }}
                >
                  <Link
                    href="/library"
                    style={{
                      fontFamily: MONO,
                      fontSize: "0.38rem",
                      letterSpacing: "0.15em",
                      color: "rgba(201,168,76,0.35)",
                      textDecoration: "none",
                      textTransform: "uppercase",
                    }}
                  >
                    Browse the library →
                  </Link>
                  <Link
                    href="/"
                    style={{
                      fontFamily: MONO,
                      fontSize: "0.38rem",
                      letterSpacing: "0.15em",
                      color: "rgba(201,168,76,0.2)",
                      textDecoration: "none",
                      textTransform: "uppercase",
                    }}
                  >
                    What is Tintaxis?
                  </Link>
                </motion.div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// LIVING PARAGRAPH — The core unit. Text + heat + margin voice + whisper.
// ═══════════════════════════════════════════════════════════════════════════════

function LivingParagraphBlock({ para, index }: { para: LivingParagraph; index: number }) {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, margin: "-60px" });
  const [showMargin, setShowMargin] = useState(false);
  const [showThread, setShowThread] = useState(false);

  // Stagger margin voice reveal
  useEffect(() => {
    if (isInView && (para.marginVoice || para.thread)) {
      const timer = setTimeout(() => {
        if (para.marginVoice) setShowMargin(true);
        if (para.thread) setShowThread(true);
      }, 600 + index * 80);
      return () => clearTimeout(timer);
    }
  }, [isInView, para.marginVoice, para.thread, index]);

  const heat = para.heat ?? 0;
  const heatColor = `rgba(192, 57, 43, ${heat * 0.08})`;
  const heatBorder = heat > 0.5 ? `rgba(192, 57, 43, ${heat * 0.18})` : "transparent";

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 14 }}
      animate={isInView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.5, delay: 0.05 * Math.min(index, 6) }}
      style={{
        position: "relative",
        marginBottom: "1.75rem",
        display: "grid",
        gridTemplateColumns: "1fr minmax(0, 220px)",
        gap: "clamp(1rem, 3vw, 2rem)",
        alignItems: "start",
      }}
    >
      {/* ── Text column ──────────────────────────────── */}
      <div style={{ position: "relative" }}>
        {/* Heat glow */}
        {heat > 0.4 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={isInView ? { opacity: 1 } : {}}
            transition={{ duration: 1.2, delay: 0.3 }}
            style={{
              position: "absolute",
              inset: "-4px -8px",
              background: heatColor,
              borderLeft: `2px solid ${heatBorder}`,
              borderRadius: "2px",
              pointerEvents: "none",
            }}
          />
        )}

        {/* The text */}
        <p
          style={{
            fontFamily: SERIF,
            fontSize: "clamp(1rem, 2.5vw, 1.1rem)",
            lineHeight: 1.85,
            color: "rgba(245,230,200,0.78)",
            margin: 0,
            position: "relative",
            textIndent: index > 0 ? "2rem" : undefined,
          }}
        >
          {para.text}
        </p>

        {/* Heat count badge */}
        {heat > 0.5 && (
          <motion.span
            initial={{ opacity: 0 }}
            animate={isInView ? { opacity: 1 } : {}}
            transition={{ delay: 0.8, duration: 0.5 }}
            style={{
              position: "absolute",
              bottom: "-12px",
              left: "0",
              fontFamily: MONO,
              fontSize: "0.3rem",
              letterSpacing: "0.12em",
              color: "rgba(192,57,43,0.3)",
              textTransform: "uppercase",
            }}
          >
            {Math.round(heat * READER_COUNT)} readers lingered here
          </motion.span>
        )}

        {/* Author whisper (inline, below the paragraph) */}
        {para.authorWhisper && (
          <AnimatePresence>
            {isInView && (
              <motion.div
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 1.0, duration: 0.6 }}
                style={{
                  marginTop: heat > 0.5 ? "1.25rem" : "0.75rem",
                  paddingLeft: "1rem",
                  borderLeft: "1px solid rgba(201,168,76,0.2)",
                }}
              >
                <p
                  style={{
                    fontFamily: MONO,
                    fontSize: "0.32rem",
                    letterSpacing: "0.2em",
                    color: "rgba(201,168,76,0.4)",
                    textTransform: "uppercase",
                    marginBottom: "4px",
                  }}
                >
                  Author
                </p>
                <p
                  style={{
                    fontFamily: SERIF,
                    fontSize: "0.85rem",
                    fontStyle: "italic",
                    color: "rgba(201,168,76,0.55)",
                    lineHeight: 1.65,
                    margin: 0,
                  }}
                >
                  {para.authorWhisper.text}
                </p>
              </motion.div>
            )}
          </AnimatePresence>
        )}
      </div>

      {/* ── Margin column (desktop: beside text, mobile: below) ── */}
      <div
        style={{
          minHeight: "1px",
        }}
      >
        {/* Margin voice */}
        <AnimatePresence>
          {showMargin && para.marginVoice && (
            <motion.div
              initial={{ opacity: 0, x: 8 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5 }}
              style={{
                padding: "10px 12px",
                borderLeft: "1px solid rgba(245,230,200,0.08)",
              }}
            >
              <p
                style={{
                  fontFamily: MONO,
                  fontSize: "0.3rem",
                  letterSpacing: "0.12em",
                  color: "rgba(245,230,200,0.2)",
                  textTransform: "uppercase",
                  marginBottom: "4px",
                }}
              >
                {para.marginVoice.name} · {para.marginVoice.time}
              </p>
              <p
                style={{
                  fontFamily: SERIF,
                  fontSize: "0.8rem",
                  fontStyle: "italic",
                  color: "rgba(245,230,200,0.4)",
                  lineHeight: 1.55,
                  margin: 0,
                }}
              >
                {para.marginVoice.text}
              </p>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Thread (question + author response) */}
        <AnimatePresence>
          {showThread && para.thread && (
            <motion.div
              initial={{ opacity: 0, x: 8 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5 }}
              style={{
                padding: "10px 12px",
                borderLeft: "1px solid rgba(201,168,76,0.12)",
              }}
            >
              {/* Question */}
              <p
                style={{
                  fontFamily: MONO,
                  fontSize: "0.3rem",
                  letterSpacing: "0.12em",
                  color: "rgba(245,230,200,0.18)",
                  textTransform: "uppercase",
                  marginBottom: "3px",
                }}
              >
                {para.thread.question.name} asked
              </p>
              <p
                style={{
                  fontFamily: SERIF,
                  fontSize: "0.8rem",
                  fontStyle: "italic",
                  color: "rgba(245,230,200,0.4)",
                  lineHeight: 1.55,
                  margin: "0 0 10px",
                }}
              >
                {para.thread.question.text}
              </p>

              {/* Author response */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.6, duration: 0.5 }}
              >
                <p
                  style={{
                    fontFamily: MONO,
                    fontSize: "0.3rem",
                    letterSpacing: "0.12em",
                    color: "rgba(201,168,76,0.35)",
                    textTransform: "uppercase",
                    marginBottom: "3px",
                  }}
                >
                  Chico Montecristi
                </p>
                <p
                  style={{
                    fontFamily: SERIF,
                    fontSize: "0.8rem",
                    fontStyle: "italic",
                    color: "rgba(201,168,76,0.5)",
                    lineHeight: 1.55,
                    margin: 0,
                  }}
                >
                  {para.thread.response.text}
                </p>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
}
