"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import TintaxisLogo from "@/components/ui/TintaxisLogo";
import { WelcomeBackToast } from "@/components/ui/ReturnCapture";

// ─── HOMEPAGE ─────────────────────────────────────────────────────────────────
// Everything visible immediately. No gates. No boot sequence.
// Headline + value prop + CTA above the fold in under 1 second.

const MONO  = '"JetBrains Mono", monospace';
const SERIF = '"EB Garamond", Garamond, Georgia, serif';

export default function HomeClient() {
  return (
    <div
      className="relative min-h-screen flex flex-col items-center justify-center overflow-x-hidden"
      style={{ backgroundColor: "#0D0B08" }}
    >
      {/* ── BACKGROUND GLOW ───────────────────────────────────── */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            "radial-gradient(ellipse at 50% 40%, rgba(44,26,0,0.55) 0%, transparent 65%)",
        }}
      />

      {/* ── CORNER ORNAMENTS ──────────────────────────────────── */}
      <CornerOrnament position="top-left" />
      <CornerOrnament position="top-right" />
      <CornerOrnament position="bottom-left" />
      <CornerOrnament position="bottom-right" />

      {/* ── BRASS RULES ───────────────────────────────────────── */}
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

      {/* ── MAIN CONTENT — ALL VISIBLE IMMEDIATELY ────────────── */}
      <div className="relative z-10 flex flex-col items-center text-center px-8 max-w-3xl w-full">

        {/* Platform label */}
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

        {/* Sigil + Wordmark */}
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

        {/* Brass rule */}
        <motion.div
          className="mb-6"
          style={{ width: "100%", maxWidth: "420px" }}
          initial={{ scaleX: 0, opacity: 0 }}
          animate={{ scaleX: 1, opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.2, ease: "easeOut" }}
        >
          <div className="brass-line" />
        </motion.div>

        {/* Value proposition — clear, immediate */}
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

        {/* CTA — visible immediately */}
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
      </div>

      {/* ── Return visitor toast ── */}
      <WelcomeBackToast />
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
