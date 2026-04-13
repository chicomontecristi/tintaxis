"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

// ─── AUTHOR WHISPER ──────────────────────────────────────────────────────────
// A Whisper is the author's shortest response type — a few sentences.
// It appears anchored to a specific paragraph, brass-gold border, author's
// quasi-handwritten font. The author's presence made visible.
//
// Phase 1: hardcoded, static — for demo purposes.
// Phase 2: fetched from author dashboard, linked to specific annotations.

export interface WhisperData {
  id: string;
  paragraphIndex: number;    // Which paragraph this is anchored to
  anchoredText: string;      // The excerpt that triggered this response
  content: string;           // The author's words
  authorName: string;
  authorAvatar?: string;     // Phase 2: real photo
  timestamp: string;
  type: "whisper" | "anchor"; // Whisper = short text. Anchor = pinned reader insight.
}

// ─── AUTHOR WHISPERS ─────────────────────────────────────────────────────────
// Intentionally empty. Real author whispers are fetched from the database
// via /api/whispers?chapter=... and attributed to whoever wrote them. Placing
// AI-written text under the author's name would be misleading.
// The Experience page has its own self-contained demo data in
// app/experience/LivingPage.tsx — that page is NOT affected by this export.
export const DEMO_WHISPERS: WhisperData[] = [];

// ─── AUTHOR WHISPER COMPONENT ────────────────────────────────────────────────

interface AuthorWhisperProps {
  whisper: WhisperData;
}

export default function AuthorWhisper({ whisper }: AuthorWhisperProps) {
  const [expanded, setExpanded] = useState(false);
  const [materialized, setMaterialized] = useState(false);

  const isAnchor = whisper.type === "anchor";

  return (
    <motion.div
      initial={{ opacity: 0, x: 12 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.6, ease: "easeOut" }}
      onViewportEnter={() => setMaterialized(true)}
      style={{
        marginBottom: "1.25rem",
        borderLeft: isAnchor
          ? "3px solid var(--brass-primary)"
          : "2px solid var(--brass-dim)",
        paddingLeft: "0.75rem",
        background: isAnchor
          ? "rgba(var(--text-primary-rgb),0.04)"
          : "transparent",
        borderRadius: "0 2px 2px 0",
      }}
    >
      {/* ── Author tag ─────────────────────────────────────── */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: "0.4rem",
          marginBottom: "0.35rem",
        }}
      >
        {/* Avatar placeholder — materializes like light assembling */}
        <motion.div
          style={{
            width: "18px",
            height: "18px",
            borderRadius: "50%",
            border: "1px solid var(--brass-dim)",
            background: "var(--bg-page)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            flexShrink: 0,
          }}
          animate={materialized ? {
            boxShadow: ["0 0 0px rgba(201,168,76,0)", "0 0 8px rgba(201,168,76,0.4)", "0 0 3px rgba(201,168,76,0.2)"],
          } : {}}
          transition={{ duration: 1.2, ease: "easeOut" }}
        >
          <span style={{ fontSize: "0.65rem", color: "var(--brass-primary)" }}>C</span>
        </motion.div>

        <span
          style={{
            fontFamily: '"JetBrains Mono", monospace',
            fontSize: "0.75rem",
            letterSpacing: "0.15em",
            color: "var(--brass-dim)",
            textTransform: "uppercase",
          }}
        >
          {isAnchor ? "Anchored" : "Whisper"} · {whisper.authorName}
        </span>
      </div>

      {/* ── Anchored text excerpt ──────────────────────────── */}
      <p
        style={{
          fontFamily: '"EB Garamond", Garamond, Georgia, serif',
          fontSize: "0.72rem",
          fontStyle: "italic",
          color: "var(--text-dim)",
          lineHeight: 1.5,
          marginBottom: "0.4rem",
          overflow: "hidden",
          display: "-webkit-box",
          WebkitLineClamp: 2,
          WebkitBoxOrient: "vertical",
        }}
      >
        &ldquo;{whisper.anchoredText}&rdquo;
      </p>

      {/* ── Author's words ─────────────────────────────────── */}
      <button
        onClick={() => setExpanded((e) => !e)}
        style={{
          background: "transparent",
          border: "none",
          cursor: "pointer",
          padding: 0,
          textAlign: "left",
          width: "100%",
        }}
      >
        <AnimatePresence mode="wait">
          <motion.p
            key={expanded ? "expanded" : "collapsed"}
            style={{
              fontFamily: '"Cormorant Garamond", "EB Garamond", Georgia, serif',
              fontSize: "0.875rem",
              fontStyle: "italic",
              color: "var(--text-primary)",
              lineHeight: 1.7,
              letterSpacing: "0.01em",
              overflow: expanded ? "visible" : "hidden",
              display: "-webkit-box",
              WebkitLineClamp: expanded ? undefined : 2,
              WebkitBoxOrient: "vertical",
            }}
            initial={{ opacity: 0.6 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.3 }}
          >
            {whisper.content}
          </motion.p>
        </AnimatePresence>

        {/* Expand hint */}
        {!expanded && whisper.content.length > 80 && (
          <span
            style={{
              fontFamily: '"JetBrains Mono", monospace',
              fontSize: "0.75rem",
              letterSpacing: "0.12em",
              color: "var(--brass-dim)",
              textTransform: "uppercase",
              display: "block",
              marginTop: "0.2rem",
            }}
          >
            read more ↓
          </span>
        )}
      </button>

      {/* ── Timestamp ─────────────────────────────────────── */}
      <p
        style={{
          fontFamily: '"JetBrains Mono", monospace',
          fontSize: "0.75rem",
          color: "var(--text-dim)",
          letterSpacing: "0.1em",
          marginTop: "0.35rem",
        }}
      >
        {whisper.timestamp}
      </p>
    </motion.div>
  );
}
