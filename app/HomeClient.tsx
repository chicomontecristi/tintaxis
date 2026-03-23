"use client";

import { useEffect, useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import TintaxisLogo from "@/components/ui/TintaxisLogo";
import { WelcomeBackToast } from "@/components/ui/ReturnCapture";
import { DeepReaderNudge } from "@/components/ui/SessionDepth";
import { SocialProofStrip, FeaturedAt } from "@/components/ui/TrustSignals";

// ─── INITIATION SCREEN ─────────────────────────────────────────────────────
// The entry point. The reader is not yet a reader — they are a supplicant.
// The platform reveals itself slowly. Awe before access.

const TAGLINE_LINES = [
  "A book is not a document.",
  "It is a living entity.",
  "You are about to read differently.",
];

const EDITION_TEXT = "TINTAXIS · A LITERARY PLATFORM · EST. 2026";
const SUBJECT_LINE = "WHERE WRITERS PUBLISH. WHERE READERS ARRIVE.";

// Mechanical boot-up sequence for the decorative UI chrome
const BOOT_LINES = [
  "TINTAXIS v0.1.0 ... ONLINE",
  "INK CHAMBER PRESSURIZED ... READY",
  "MARGIN WORLD INITIALIZED ... STABLE",
  "QUESTION QUEUE OPEN ... LISTENING",
  "AUTHOR PRESENCE DETECTED ... STANDING BY",
];

export default function HomeClient() {
  const [phase, setPhase] = useState<"boot" | "title" | "ready">("boot");
  const [bootIndex, setBootIndex] = useState(0);
  const [titleVisible, setTitleVisible] = useState(false);
  const [taglineIndex, setTaglineIndex] = useState(-1);
  const [enterReady, setEnterReady] = useState(false);

  // Boot sequence
  useEffect(() => {
    if (phase !== "boot") return;

    const interval = setInterval(() => {
      setBootIndex((i) => {
        if (i >= BOOT_LINES.length - 1) {
          clearInterval(interval);
          setTimeout(() => setPhase("title"), 600);
          return i;
        }
        return i + 1;
      });
    }, 380);

    return () => clearInterval(interval);
  }, [phase]);

  // Title reveal sequence
  useEffect(() => {
    if (phase !== "title") return;

    const t1 = setTimeout(() => setTitleVisible(true), 100);
    const t2 = setTimeout(() => setTaglineIndex(0), 900);
    const t3 = setTimeout(() => setTaglineIndex(1), 1600);
    const t4 = setTimeout(() => setTaglineIndex(2), 2300);
    const t5 = setTimeout(() => {
      setPhase("ready");
      setEnterReady(true);
    }, 3400);

    return () => [t1, t2, t3, t4, t5].forEach(clearTimeout);
  }, [phase]);

  return (
    <div
      className="relative min-h-screen flex flex-col items-center justify-center overflow-x-hidden"
      style={{ backgroundColor: "#0D0B08" }}
    >
      {/* ── TOP NAV ───────────────────────────────────────────── */}
      <nav
        style={{
          position: "fixed",
          top: 0,
          left: 0,
          right: 0,
          zIndex: 50,
          display: "flex",
          justifyContent: "flex-end",
          alignItems: "center",
          gap: "1.75rem",
          padding: "0.85rem clamp(1rem, 4vw, 2rem)",
          borderBottom: "1px solid rgba(201,168,76,0.07)",
          background: "rgba(13,11,8,0.85)",
          backdropFilter: "blur(8px)",
        }}
      >
        <a
          href="/publish"
          style={{
            fontFamily: '"JetBrains Mono", monospace',
            fontSize: "0.7rem",
            letterSpacing: "0.25em",
            color: "rgba(201,168,76,0.45)",
            textDecoration: "none",
            textTransform: "uppercase",
          }}
        >
          Publish on Tintaxis
        </a>
        <a
          href="/library"
          style={{
            fontFamily: '"JetBrains Mono", monospace',
            fontSize: "0.7rem",
            letterSpacing: "0.25em",
            color: "rgba(201,168,76,0.7)",
            textDecoration: "none",
            textTransform: "uppercase",
          }}
        >
          Library
        </a>
        <a
          href="/writers"
          style={{
            fontFamily: '"JetBrains Mono", monospace',
            fontSize: "0.7rem",
            letterSpacing: "0.25em",
            color: "rgba(201,168,76,0.6)",
            textDecoration: "none",
            textTransform: "uppercase",
          }}
        >
          Featured Artists
        </a>
        <a
          href="/account"
          style={{
            fontFamily: '"JetBrains Mono", monospace',
            fontSize: "0.7rem",
            letterSpacing: "0.25em",
            color: "rgba(245,230,200,0.35)",
            textDecoration: "none",
            textTransform: "uppercase",
          }}
        >
          My Account
        </a>
        <a
          href="/author/login"
          style={{
            fontFamily: '"JetBrains Mono", monospace',
            fontSize: "0.7rem",
            letterSpacing: "0.25em",
            color: "rgba(245,230,200,0.2)",
            textDecoration: "none",
            textTransform: "uppercase",
          }}
        >
          Author Login →
        </a>
      </nav>

      {/* ── BACKGROUND RADIAL GLOW ─────────────────────────────── */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            "radial-gradient(ellipse at 50% 40%, rgba(44,26,0,0.55) 0%, transparent 65%)",
        }}
      />

      {/* ── CORNER BRASS ORNAMENTS ────────────────────────────── */}
      <CornerOrnament position="top-left" />
      <CornerOrnament position="top-right" />
      <CornerOrnament position="bottom-left" />
      <CornerOrnament position="bottom-right" />

      {/* ── HORIZONTAL BRASS RULES ────────────────────────────── */}
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

      {/* ── BOOT SEQUENCE ─────────────────────────────────────── */}
      <AnimatePresence>
        {phase === "boot" && (
          <motion.div
            key="boot"
            className="absolute top-24 left-1/2 -translate-x-1/2 w-full max-w-lg px-8"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0, transition: { duration: 0.5 } }}
          >
            {BOOT_LINES.slice(0, bootIndex + 1).map((line, i) => (
              <motion.p
                key={line}
                className="font-mono text-xs mb-1"
                style={{
                  color: i === bootIndex ? "#C9A84C" : "rgba(201,168,76,0.35)",
                  letterSpacing: "0.12em",
                  fontFamily: '"JetBrains Mono", monospace',
                }}
                initial={{ opacity: 0, x: -8 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.25 }}
              >
                {">"} {line}
              </motion.p>
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── MAIN CONTENT ──────────────────────────────────────── */}
      <div className="relative z-10 flex flex-col items-center text-center px-8 max-w-3xl w-full">

        {/* Edition label */}
        <AnimatePresence>
          {titleVisible && (
            <motion.p
              className="chapter-number mb-8 tracking-widest"
              style={{
                color: "rgba(201,168,76,0.6)",
                fontSize: "0.75rem",
                letterSpacing: "0.3em",
                fontFamily: '"JetBrains Mono", monospace',
              }}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, ease: "easeOut" }}
            >
              {EDITION_TEXT}
            </motion.p>
          )}
        </AnimatePresence>

        {/* TINTAXIS sigil + wordmark */}

        <AnimatePresence>
          {titleVisible && (
            <motion.div
              className="relative mb-3 select-none flex flex-col items-center"
              initial={{ opacity: 0, y: 20, filter: "blur(4px)" }}
              animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
              transition={{ duration: 1.0, ease: [0.2, 0, 0.1, 1] }}
            >
              {/* Brass sigil — pulsing glow */}
              <motion.div
                className="mb-5"
                animate={{
                  filter: [
                    "drop-shadow(0 0 8px rgba(201,168,76,0.3))",
                    "drop-shadow(0 0 20px rgba(201,168,76,0.55))",
                    "drop-shadow(0 0 8px rgba(201,168,76,0.3))",
                  ],
                }}
                transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
              >
                <TintaxisLogo size={72} />
              </motion.div>

              <h1
                style={{
                  fontFamily: '"EB Garamond", Garamond, Georgia, serif',
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
          )}
        </AnimatePresence>

        {/* Brass rule under title */}
        <AnimatePresence>
          {titleVisible && (
            <motion.div
              className="mb-6"
              style={{ width: "100%", maxWidth: "420px" }}
              initial={{ scaleX: 0, opacity: 0 }}
              animate={{ scaleX: 1, opacity: 1 }}
              transition={{ duration: 0.8, delay: 0.3, ease: "easeOut" }}
            >
              <div className="brass-line" />
            </motion.div>
          )}
        </AnimatePresence>

        {/* Subject line */}
        <AnimatePresence>
          {titleVisible && (
            <motion.div
              className="mb-12"
              style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "6px" }}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.6, delay: 0.5 }}
            >
              <p
                style={{
                  fontFamily: '"JetBrains Mono", monospace',
                  fontSize: "0.85rem",
                  letterSpacing: "0.22em",
                  color: "rgba(201,168,76,0.75)",
                  textTransform: "uppercase",
                  margin: 0,
                }}
              >
                {SUBJECT_LINE}
              </p>
              <p
                style={{
                  fontFamily: '"JetBrains Mono", monospace',
                  fontSize: "0.7rem",
                  letterSpacing: "0.2em",
                  color: "rgba(201,168,76,0.35)",
                  textTransform: "uppercase",
                  margin: 0,
                }}
              >
                3 Writers · 6 Works · English · Spanish · Mandarin
              </p>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Taglines */}
        <div className="mb-14 space-y-2 min-h-[5rem]">
          {TAGLINE_LINES.map((line, i) => (
            <AnimatePresence key={line}>
              {taglineIndex >= i && (
                <motion.p
                  style={{
                    fontFamily: '"EB Garamond", Garamond, Georgia, serif',
                    fontSize: "clamp(1rem, 2.5vw, 1.3rem)",
                    fontStyle: "italic",
                    color:
                      i === 2
                        ? "rgba(245,230,200,0.9)"
                        : "rgba(245,230,200,0.55)",
                    lineHeight: 1.5,
                  }}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.7, ease: "easeOut" }}
                >
                  {line}
                </motion.p>
              )}
            </AnimatePresence>
          ))}
        </div>

        {/* ENTER button */}
        <AnimatePresence>
          {enterReady && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, ease: "easeOut" }}
            >
              <Link href="/experience" passHref>
                <motion.button
                  className="relative group"
                  style={{
                    fontFamily: '"JetBrains Mono", monospace',
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
                  {/* Corner accents */}
                  <span
                    className="absolute top-0 left-0 w-2 h-2 border-t border-l"
                    style={{ borderColor: "#C9A84C" }}
                  />
                  <span
                    className="absolute top-0 right-0 w-2 h-2 border-t border-r"
                    style={{ borderColor: "#C9A84C" }}
                  />
                  <span
                    className="absolute bottom-0 left-0 w-2 h-2 border-b border-l"
                    style={{ borderColor: "#C9A84C" }}
                  />
                  <span
                    className="absolute bottom-0 right-0 w-2 h-2 border-b border-r"
                    style={{ borderColor: "#C9A84C" }}
                  />
                  EXPERIENCE A LIVING PAGE
                </motion.button>
              </Link>

              <motion.p
                className="mt-4 text-center"
                style={{
                  fontFamily: '"EB Garamond", Garamond, Georgia, serif',
                  fontSize: "0.95rem",
                  fontStyle: "italic",
                  color: "rgba(245,230,200,0.3)",
                  letterSpacing: "0.04em",
                }}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.4, duration: 0.6 }}
              >
                A page that remembers everyone who read it.
              </motion.p>

              {/* ── Featured Writers strip ── */}
              <motion.div
                className="mt-10"
                style={{
                  display: "flex",
                  gap: "1rem",
                  justifyContent: "center",
                  flexWrap: "wrap",
                  maxWidth: "min(960px, 100%)",
                  margin: "0 auto",
                  padding: "0 0.5rem",
                }}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.8, duration: 0.6 }}
              >
                <WriterCard
                  name="Chico Montecristi"
                  genre="Fiction · Oil Painter"
                  origin="Dominican Republic · South Bronx"
                  work="The Hunt, Recoleta, +2"
                  href="/writers/chico-montecristi"
                  accent="rgba(192,57,43"
                />
                <WriterCard
                  name="José La Luz"
                  genre="Political Essay · Dominican Letters"
                  origin="Dominican Republic"
                  work="Escritos de un Hombre Político"
                  href="/writers/jose-la-luz"
                  accent="rgba(70,130,180"
                />
                <WriterCard
                  name="Rosalva Flores-Alemán"
                  genre="Scholarship · Latin American Fiction"
                  origin="Sonora, México · Tucson · Tennessee"
                  work="Subalternity, 21st Century Diaspora"
                  href="/writers/rosalva-flores-aleman"
                  accent="rgba(184,115,51"
                />
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* ── TRUST & AUTHORITY SIGNALS ─────────────────────────── */}
      <AnimatePresence>
        {phase === "ready" && (
          <motion.div
            className="w-full"
            style={{ maxWidth: "960px", padding: "0 clamp(1rem, 4vw, 2rem)", marginBottom: "2rem" }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.0, duration: 0.8 }}
          >
            <SocialProofStrip />
            <FeaturedAt />
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── FULL ARCHIVE CATALOG ─────────────────────────────── */}
      <AnimatePresence>
        {phase === "ready" && (
          <motion.div
            className="w-full"
            style={{ maxWidth: "960px", padding: "0 clamp(1rem, 4vw, 2rem)", marginBottom: "4rem" }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.2, duration: 0.8 }}
          >
            {/* Section divider */}
            <div style={{ display: "flex", alignItems: "center", gap: "1rem", marginBottom: "2rem" }}>
              <div style={{ flex: 1, height: "1px", background: "linear-gradient(90deg, transparent, rgba(201,168,76,0.15))" }} />
              <p style={{
                fontFamily: '"JetBrains Mono", monospace',
                fontSize: "0.7rem",
                letterSpacing: "0.3em",
                color: "rgba(201,168,76,0.3)",
                textTransform: "uppercase",
                whiteSpace: "nowrap",
              }}>
                THE ARCHIVE
              </p>
              <div style={{ flex: 1, height: "1px", background: "linear-gradient(90deg, rgba(201,168,76,0.15), transparent)" }} />
            </div>

            {/* ── Chico Montecristi ── */}
            <WriterSection
              writerName="Chico Montecristi"
              accent="rgba(192,57,43"
              writerHref="/writers/chico-montecristi"
            >
              <LibraryWorkCard
                title="The Hunt"
                subtitle="Novella · Dark psychological thriller"
                byline="25,003 words · 7 chapters"
                description="A teacher's death in a small Colorado town. Gossip, guilt, and a monster hiding in plain sight."
                language="EN"
                href="/book/the-hunt"
              />
              <LibraryWorkCard
                title="Recoleta"
                subtitle="Novela corta"
                byline="~12,000 palabras"
                description="A narrator arrives in the Bronx — cold February, an uncle, a tenement, and the weight of belonging."
                language="ES"
                href="/book/recoleta"
              />
              <LibraryWorkCard
                title="Noches de maya"
                subtitle="Cuentos"
                byline="9 relatos"
                description="Old men, river birds, and the silence of old buildings. Nine stories of the Caribbean and the desert."
                language="ES"
                href="/book/noches-de-maya"
              />
              <LibraryWorkCard
                title="Mi Pájaro del Río"
                subtitle="Cartas"
                byline="Diciembre 2017"
                description="Letters written in Mandarin and Spanish to the one called the river mouth bird."
                language="ZH/ES"
                href="/book/mi-pajaro-del-rio"
              />
            </WriterSection>

            {/* ── José La Luz ── */}
            <WriterSection
              writerName="José La Luz"
              accent="rgba(70,130,180"
              writerHref="/writers/jose-la-luz"
            >
              <LibraryWorkCard
                title="Escritos de un Hombre Político"
                subtitle="Ensayos · Español"
                byline="Coming Soon"
                description="Political essays from thirty years of public life in the Dominican Republic. On power, community, and conviction."
                language="ES"
              />
            </WriterSection>

            {/* ── Rosalva Flores-Alemán ── */}
            <WriterSection
              writerName="Rosalva Flores-Alemán, Ph.D."
              accent="rgba(184,115,51"
              writerHref="/writers/rosalva-flores-aleman"
            >
              <LibraryWorkCard
                title="Subalternity, 21st Century Diaspora"
                subtitle="Essays · Poetry · PHaiLOSOPHY"
                byline="Coming Soon"
                description="On silence, inheritance, and what it means to carry a culture across borders, languages, and generations."
                language="EN"
              />
            </WriterSection>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── EMAIL CAPTURE ─────────────────────────────────────── */}
      <AnimatePresence>
        {phase === "ready" && (
          <motion.div
            style={{
              width: "100%",
              maxWidth: "520px",
              padding: "0 clamp(1rem, 4vw, 2rem)",
              marginBottom: "5rem",
            }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.6, duration: 0.8 }}
          >
            <EmailCapture />
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── BOTTOM SYSTEM STATUS ──────────────────────────────── */}
      <AnimatePresence>
        {phase === "ready" && (
          <motion.div
            className="absolute bottom-12 left-1/2 -translate-x-1/2 flex flex-wrap items-center justify-center gap-4 px-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5, duration: 0.6 }}
          >
            <StatusDot label="ARCHIVE" active />
            <StatusDot label="3 WRITERS" active />
            <StatusDot label="6 WORKS" active />
            <StatusDot label="LIVE" pulse />
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── RETURN PATH: Welcome back toast (returning visitors) ── */}
      <WelcomeBackToast />

      {/* ── SESSION DEPTH: Library nudge (3+ pages deep) ────────── */}
      <DeepReaderNudge />
    </div>
  );
}

// ─── SUB-COMPONENTS ──────────────────────────────────────────────────────────

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

function StatusDot({ label, active, pulse }: { label: string; active?: boolean; pulse?: boolean }) {
  return (
    <div className="flex items-center gap-1.5">
      <motion.div
        className="w-1.5 h-1.5 rounded-full"
        style={{
          backgroundColor: pulse ? "#00E5CC" : active ? "#C9A84C" : "rgba(201,168,76,0.3)",
        }}
        animate={pulse ? { opacity: [1, 0.3, 1] } : undefined}
        transition={pulse ? { duration: 2, repeat: Infinity, ease: "easeInOut" } : undefined}
      />
      <span
        style={{
          fontFamily: '"JetBrains Mono", monospace',
          fontSize: "0.7rem",
          letterSpacing: "0.18em",
          color: active || pulse ? "rgba(201,168,76,0.6)" : "rgba(201,168,76,0.25)",
        }}
      >
        {label}
      </span>
    </div>
  );
}

// ─── WRITER CARD ────────────────────────────────────────────────────────────
// Featured writer card on the initiation screen.

function WriterCard({
  name,
  genre,
  origin,
  work,
  href,
  accent,
}: {
  name: string;
  genre: string;
  origin: string;
  work: string;
  href: string;
  accent: string; // e.g. "rgba(192,57,43"
}) {
  return (
    <Link href={href} style={{ textDecoration: "none" }}>
      <motion.div
        style={{
          flex: "1 1 220px",
          minWidth: "200px",
          maxWidth: "280px",
          padding: "1.1rem 1.2rem",
          border: `1px solid ${accent},0.25)`,
          borderRadius: "2px",
          background: `${accent},0.04)`,
          cursor: "pointer",
          textAlign: "left",
        }}
        whileHover={{
          borderColor: `${accent},0.5)`,
          background: `${accent},0.08)`,
        }}
        transition={{ duration: 0.2 }}
      >
        <p
          style={{
            fontFamily: '"EB Garamond", Garamond, Georgia, serif',
            fontSize: "1.1rem",
            fontStyle: "italic",
            color: "rgba(245,230,200,0.85)",
            lineHeight: 1.2,
            marginBottom: "0.3rem",
          }}
        >
          {name}
        </p>
        <p
          style={{
            fontFamily: '"JetBrains Mono", monospace',
            fontSize: "0.65rem",
            letterSpacing: "0.12em",
            color: `${accent},0.6)`,
            textTransform: "uppercase",
            marginBottom: "0.4rem",
          }}
        >
          {genre}
        </p>
        <p
          style={{
            fontFamily: '"JetBrains Mono", monospace',
            fontSize: "0.6rem",
            letterSpacing: "0.08em",
            color: "rgba(245,230,200,0.3)",
            marginBottom: "0.5rem",
          }}
        >
          {origin}
        </p>
        <div style={{ height: "1px", background: `${accent},0.12)`, marginBottom: "0.5rem" }} />
        <p
          style={{
            fontFamily: '"EB Garamond", Garamond, Georgia, serif',
            fontSize: "0.85rem",
            fontStyle: "italic",
            color: "rgba(245,230,200,0.4)",
            lineHeight: 1.4,
          }}
        >
          {work}
        </p>
      </motion.div>
    </Link>
  );
}

// ─── WRITER SECTION ─────────────────────────────────────────────────────────
// Groups a writer's works in the archive.

function WriterSection({
  writerName,
  accent,
  writerHref,
  children,
}: {
  writerName: string;
  accent: string;
  writerHref: string;
  children: React.ReactNode;
}) {
  return (
    <div style={{ marginBottom: "2rem" }}>
      <Link href={writerHref} style={{ textDecoration: "none" }}>
        <div style={{
          display: "flex",
          alignItems: "center",
          gap: "0.75rem",
          marginBottom: "0.75rem",
          cursor: "pointer",
        }}>
          <div style={{
            width: "8px",
            height: "8px",
            borderRadius: "50%",
            background: `${accent},0.5)`,
            flexShrink: 0,
          }} />
          <p style={{
            fontFamily: '"EB Garamond", Garamond, Georgia, serif',
            fontSize: "1.05rem",
            fontStyle: "italic",
            color: "rgba(245,230,200,0.7)",
            margin: 0,
          }}>
            {writerName}
          </p>
          <span style={{
            fontFamily: '"JetBrains Mono", monospace',
            fontSize: "0.6rem",
            letterSpacing: "0.15em",
            color: `${accent},0.4)`,
            textTransform: "uppercase",
          }}>
            View profile →
          </span>
        </div>
      </Link>
      <div style={{ display: "flex", gap: "0.75rem", flexWrap: "wrap" }}>
        {children}
      </div>
    </div>
  );
}

// ─── LIBRARY WORK CARD ───────────────────────────────────────────────────────
// Shows other works by the author — sealed, coming to Tintaxis.

function LibraryWorkCard({
  title,
  subtitle,
  byline,
  description,
  language,
  href,
}: {
  title: string;
  subtitle: string;
  byline: string;
  description: string;
  language: string;
  href?: string;
}) {
  return (
    <Link href={href ?? "#"} style={{ textDecoration: "none" }}>
    <motion.div
      style={{
        flex: "1 1 180px",
        minWidth: "160px",
        maxWidth: "240px",
        padding: "1rem",
        border: "1px solid rgba(201,168,76,0.1)",
        borderRadius: "1px",
        background: "rgba(13,11,8,0.5)",
        cursor: href ? "pointer" : "default",
        textAlign: "left",
        position: "relative",
        overflow: "hidden",
      }}
      whileHover={{
        borderColor: "rgba(201,168,76,0.28)",
        background: "rgba(201,168,76,0.05)",
      }}
      transition={{ duration: 0.25 }}
    >
      {/* Language badge */}
      <div
        style={{
          position: "absolute",
          top: 0,
          right: 0,
          padding: "0.2rem 0.4rem",
          background: "rgba(201,168,76,0.06)",
          borderLeft: "1px solid rgba(201,168,76,0.1)",
          borderBottom: "1px solid rgba(201,168,76,0.1)",
        }}
      >
        <span style={{
          fontFamily: '"JetBrains Mono", monospace',
          fontSize: "0.45rem",
          letterSpacing: "0.1em",
          color: "rgba(201,168,76,0.4)",
          textTransform: "uppercase",
        }}>
          {language}
        </span>
      </div>

      {/* Title */}
      <p style={{
        fontFamily: '"EB Garamond", Garamond, Georgia, serif',
        fontSize: "1rem",
        fontStyle: "italic",
        color: "rgba(245,230,200,0.4)",
        lineHeight: 1.2,
        marginBottom: "0.2rem",
        paddingRight: "1.5rem",
      }}>
        {title}
      </p>

      {/* Subtitle */}
      <p style={{
        fontFamily: '"JetBrains Mono", monospace',
        fontSize: "0.45rem",
        letterSpacing: "0.1em",
        color: "rgba(201,168,76,0.25)",
        textTransform: "uppercase",
        marginBottom: "0.15rem",
      }}>
        {subtitle}
      </p>

      {/* Byline */}
      <p style={{
        fontFamily: '"JetBrains Mono", monospace',
        fontSize: "0.45rem",
        letterSpacing: "0.08em",
        color: "rgba(201,168,76,0.2)",
        marginBottom: "0.6rem",
      }}>
        {byline}
      </p>

      {/* Brass divider */}
      <div style={{ height: "1px", background: "rgba(201,168,76,0.08)", marginBottom: "0.6rem" }} />

      {/* Description */}
      <p style={{
        fontFamily: '"EB Garamond", Garamond, Georgia, serif',
        fontSize: "0.75rem",
        fontStyle: "italic",
        color: "rgba(245,230,200,0.25)",
        lineHeight: 1.5,
        marginBottom: "0.6rem",
      }}>
        {description}
      </p>

      {/* CTA */}
      <p style={{
        fontFamily: '"JetBrains Mono", monospace',
        fontSize: "0.45rem",
        letterSpacing: "0.2em",
        color: "rgba(201,168,76,0.4)",
        textTransform: "uppercase",
      }}>
        {href ? "→ ENTER ARCHIVE" : "⚿ COMING SOON"}
      </p>
    </motion.div>
    </Link>
  );
}

// ─── EMAIL CAPTURE COMPONENT ──────────────────────────────────────────────────

function EmailCapture() {
  const [email, setEmail] = useState("");
  const [state, setState] = useState<"idle" | "submitting" | "done" | "error">("idle");
  const inputRef = useRef<HTMLInputElement>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!email.trim()) return;
    setState("submitting");
    try {
      const res = await fetch("/api/email-capture", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim(), source: "homepage" }),
      });
      if (res.ok) {
        setState("done");
      } else {
        setState("error");
      }
    } catch {
      setState("error");
    }
  }

  return (
    <div style={{ textAlign: "center" }}>
      {/* Divider */}
      <div style={{
        height: "1px",
        background: "linear-gradient(90deg, transparent, rgba(201,168,76,0.15) 40%, rgba(201,168,76,0.15) 60%, transparent)",
        marginBottom: "2rem",
      }} />

      {state === "done" ? (
        <motion.p
          initial={{ opacity: 0, y: 4 }}
          animate={{ opacity: 1, y: 0 }}
          style={{
            fontFamily: '"EB Garamond", Garamond, Georgia, serif',
            fontSize: "0.95rem",
            fontStyle: "italic",
            color: "rgba(245,230,200,0.45)",
            letterSpacing: "0.02em",
          }}
        >
          You're on the list. New chapters find you.
        </motion.p>
      ) : (
        <>
          <p style={{
            fontFamily: '"JetBrains Mono", monospace',
            fontSize: "0.45rem",
            letterSpacing: "0.3em",
            color: "rgba(201,168,76,0.3)",
            textTransform: "uppercase",
            marginBottom: "0.75rem",
          }}>
            When new work arrives
          </p>
          <p style={{
            fontFamily: '"EB Garamond", Garamond, Georgia, serif',
            fontSize: "1rem",
            fontStyle: "italic",
            color: "rgba(245,230,200,0.35)",
            marginBottom: "1.25rem",
            lineHeight: 1.6,
          }}>
            New chapters. New writers. No noise.
          </p>

          <form
            onSubmit={handleSubmit}
            style={{ display: "flex", gap: "0", maxWidth: "420px", margin: "0 auto" }}
          >
            <input
              ref={inputRef}
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="your@email.com"
              required
              style={{
                flex: 1,
                background: "rgba(201,168,76,0.03)",
                border: "1px solid rgba(201,168,76,0.15)",
                borderRight: "none",
                color: "rgba(245,230,200,0.7)",
                fontFamily: '"EB Garamond", Garamond, Georgia, serif',
                fontSize: "0.9rem",
                padding: "0.6rem 0.9rem",
                outline: "none",
              }}
            />
            <motion.button
              type="submit"
              disabled={state === "submitting"}
              style={{
                background: state === "submitting" ? "rgba(201,168,76,0.3)" : "rgba(201,168,76,0.12)",
                border: "1px solid rgba(201,168,76,0.15)",
                color: "rgba(201,168,76,0.6)",
                fontFamily: '"JetBrains Mono", monospace',
                fontSize: "0.45rem",
                letterSpacing: "0.2em",
                textTransform: "uppercase",
                padding: "0.6rem 1.1rem",
                cursor: state === "submitting" ? "default" : "pointer",
                whiteSpace: "nowrap",
              }}
              whileHover={state === "idle" ? { background: "rgba(201,168,76,0.2)" } : {}}
            >
              {state === "submitting" ? "…" : "Notify me"}
            </motion.button>
          </form>

          {state === "error" && (
            <p style={{
              marginTop: "0.5rem",
              fontFamily: '"JetBrains Mono", monospace',
              fontSize: "0.4rem",
              letterSpacing: "0.1em",
              color: "rgba(220,60,60,0.6)",
            }}>
              Something went wrong. Try again.
            </p>
          )}
        </>
      )}
    </div>
  );
}
