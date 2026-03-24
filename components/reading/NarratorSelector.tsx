"use client";

import { useState, useCallback, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import type { NarratorVoice } from "@/lib/types";

// ─── NARRATOR SELECTOR ──────────────────────────────────────────────────────
// After the author's page-1 voiceover ends, this panel slides into view.
// Reader picks an AI narrator voice similar to the author's style.
// The selected voice narrates the remaining chapter as the reader scrolls.

// ── Default narrator voices ──────────────────────────────
// These map to Web Speech API voices as a free fallback,
// or to provider-specific voice IDs (OpenAI TTS / ElevenLabs) when configured.

const DEFAULT_VOICES: NarratorVoice[] = [
  {
    id: "warm",
    label: "Warm",
    description: "Intimate, measured — like the author beside you",
    ttsVoice: "alloy",
    accent: "#C9A84C",
  },
  {
    id: "deep",
    label: "Deep",
    description: "Rich, resonant — a fireside reading",
    ttsVoice: "onyx",
    accent: "#B87333",
  },
  {
    id: "clear",
    label: "Clear",
    description: "Bright, articulate — every word cut sharp",
    ttsVoice: "nova",
    accent: "#00E5CC",
  },
  {
    id: "soft",
    label: "Soft",
    description: "Gentle, unhurried — a whisper that carries",
    ttsVoice: "shimmer",
    accent: "#6B3FA0",
  },
];

interface NarratorSelectorProps {
  authorName: string;
  bookLanguage: "en" | "es" | "zh" | "es-zh";
  accentColor?: string;
  voices?: NarratorVoice[];
  onSelect: (voice: NarratorVoice) => void;
  onDismiss: () => void;      // Reader chooses to read without narration
}

export default function NarratorSelector({
  authorName,
  bookLanguage,
  accentColor = "#C9A84C",
  voices = DEFAULT_VOICES,
  onSelect,
  onDismiss,
}: NarratorSelectorProps) {
  const [previewingId, setPreviewingId] = useState<string | null>(null);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const synthRef = useRef<SpeechSynthesisUtterance | null>(null);

  // ── Preview a voice using Web Speech API ────────────────
  const previewVoice = useCallback(
    (voice: NarratorVoice) => {
      // Stop any current preview
      window.speechSynthesis?.cancel();

      if (previewingId === voice.id) {
        setPreviewingId(null);
        return;
      }

      const sampleText =
        bookLanguage === "es"
          ? "Y en la penumbra de la habitación, el silencio lo dijo todo."
          : bookLanguage === "zh" || bookLanguage === "es-zh"
          ? "在那个安静的房间里，沉默说出了一切。"
          : "And in the dim light of the room, the silence said everything.";

      const utterance = new SpeechSynthesisUtterance(voice.sampleText || sampleText);
      utterance.rate = 0.9;
      utterance.pitch = voice.id === "deep" ? 0.8 : voice.id === "soft" ? 1.1 : 1.0;
      utterance.lang =
        bookLanguage === "es" ? "es-ES" :
        bookLanguage === "zh" ? "zh-CN" :
        "en-US";

      utterance.onend = () => setPreviewingId(null);
      utterance.onerror = () => setPreviewingId(null);

      synthRef.current = utterance;
      setPreviewingId(voice.id);
      window.speechSynthesis?.speak(utterance);
    },
    [previewingId, bookLanguage]
  );

  // Clean up on unmount
  useEffect(() => {
    return () => {
      window.speechSynthesis?.cancel();
    };
  }, []);

  const handleSelect = useCallback(
    (voice: NarratorVoice) => {
      window.speechSynthesis?.cancel();
      setSelectedId(voice.id);
      // Brief delay for visual feedback
      setTimeout(() => onSelect(voice), 300);
    },
    [onSelect]
  );

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -8 }}
      transition={{ duration: 0.5, ease: [0.2, 0, 0.1, 1] }}
      style={{
        margin: "0 auto 3rem",
        maxWidth: "520px",
        padding: "1.5rem",
        border: `1px solid ${accentColor}18`,
        borderRadius: "4px",
        background: "#0D0B08",
        position: "relative",
      }}
    >
      {/* ── Subtle top accent line ── */}
      <div
        style={{
          position: "absolute",
          top: 0,
          left: "10%",
          right: "10%",
          height: "1px",
          background: `linear-gradient(90deg, transparent, ${accentColor}40, transparent)`,
        }}
      />

      {/* ── Header ── */}
      <div style={{ textAlign: "center", marginBottom: "1.25rem" }}>
        <p
          style={{
            fontFamily: '"JetBrains Mono", monospace',
            fontSize: "0.5rem",
            letterSpacing: "0.3em",
            textTransform: "uppercase",
            color: `${accentColor}88`,
            marginBottom: "0.5rem",
          }}
        >
          Continue Listening
        </p>
        <p
          style={{
            fontFamily: '"EB Garamond", Garamond, Georgia, serif',
            fontSize: "1rem",
            fontStyle: "italic",
            color: "rgba(245,230,200,0.55)",
            lineHeight: 1.5,
            margin: 0,
          }}
        >
          Choose a narrator to read the rest of this chapter
        </p>
      </div>

      {/* ── Voice cards ── */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gap: "0.75rem",
          marginBottom: "1rem",
        }}
      >
        {voices.map((voice, i) => {
          const isSelected = selectedId === voice.id;
          const isPreviewing = previewingId === voice.id;

          return (
            <motion.button
              key={voice.id}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 + i * 0.08, duration: 0.4 }}
              onClick={() => handleSelect(voice)}
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "flex-start",
                gap: "0.35rem",
                padding: "0.85rem 0.75rem",
                border: `1px solid ${
                  isSelected
                    ? `${voice.accent}88`
                    : isPreviewing
                    ? `${voice.accent}44`
                    : `${accentColor}12`
                }`,
                borderRadius: "3px",
                background: isSelected
                  ? `${voice.accent}12`
                  : "transparent",
                cursor: "pointer",
                textAlign: "left",
                transition: "all 0.2s ease",
              }}
            >
              {/* Voice name + accent dot */}
              <div style={{ display: "flex", alignItems: "center", gap: "0.4rem" }}>
                <div
                  style={{
                    width: "6px",
                    height: "6px",
                    borderRadius: "50%",
                    backgroundColor: voice.accent,
                    opacity: isSelected ? 1 : 0.5,
                    boxShadow: isPreviewing ? `0 0 8px ${voice.accent}66` : "none",
                    transition: "all 0.3s ease",
                  }}
                />
                <span
                  style={{
                    fontFamily: '"JetBrains Mono", monospace',
                    fontSize: "0.6rem",
                    letterSpacing: "0.15em",
                    textTransform: "uppercase",
                    color: isSelected ? voice.accent : "rgba(245,230,200,0.6)",
                  }}
                >
                  {voice.label}
                </span>
              </div>

              {/* Description */}
              <span
                style={{
                  fontFamily: '"EB Garamond", Garamond, Georgia, serif',
                  fontSize: "0.8rem",
                  fontStyle: "italic",
                  color: "rgba(245,230,200,0.35)",
                  lineHeight: 1.4,
                }}
              >
                {voice.description}
              </span>

              {/* Preview button */}
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  previewVoice(voice);
                }}
                style={{
                  fontFamily: '"JetBrains Mono", monospace',
                  fontSize: "0.4rem",
                  letterSpacing: "0.2em",
                  textTransform: "uppercase",
                  color: isPreviewing ? voice.accent : "rgba(245,230,200,0.25)",
                  background: "none",
                  border: "none",
                  cursor: "pointer",
                  padding: "2px 0",
                  marginTop: "0.15rem",
                }}
              >
                {isPreviewing ? "◼ Stop" : "▶ Preview"}
              </button>
            </motion.button>
          );
        })}
      </div>

      {/* ── Dismiss — read without narration ── */}
      <div style={{ textAlign: "center" }}>
        <button
          onClick={onDismiss}
          style={{
            fontFamily: '"JetBrains Mono", monospace',
            fontSize: "0.45rem",
            letterSpacing: "0.18em",
            textTransform: "uppercase",
            color: "rgba(245,230,200,0.25)",
            background: "none",
            border: "none",
            cursor: "pointer",
            padding: "4px 8px",
          }}
        >
          Read without narration
        </button>
      </div>
    </motion.div>
  );
}

// ─── NARRATOR CONTROL BAR ───────────────────────────────────────────────────
// Compact floating bar that appears while the AI narrator is active.
// Shows play/pause, current paragraph, and voice info.

interface NarratorControlBarProps {
  voice: NarratorVoice;
  isPlaying: boolean;
  currentParagraph: number;
  totalParagraphs: number;
  onTogglePlay: () => void;
  onStop: () => void;
}

export function NarratorControlBar({
  voice,
  isPlaying,
  currentParagraph,
  totalParagraphs,
  onTogglePlay,
  onStop,
}: NarratorControlBarProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 12 }}
      style={{
        position: "fixed",
        bottom: "1.5rem",
        left: "50%",
        transform: "translateX(-50%)",
        display: "flex",
        alignItems: "center",
        gap: "0.75rem",
        padding: "0.6rem 1.2rem",
        background: "rgba(13,11,8,0.95)",
        border: `1px solid ${voice.accent}30`,
        borderRadius: "32px",
        backdropFilter: "blur(12px)",
        boxShadow: `0 4px 24px rgba(0,0,0,0.5), 0 0 12px ${voice.accent}10`,
        zIndex: 50,
      }}
    >
      {/* Voice indicator dot */}
      <motion.div
        animate={{
          boxShadow: isPlaying
            ? [`0 0 4px ${voice.accent}44`, `0 0 12px ${voice.accent}66`, `0 0 4px ${voice.accent}44`]
            : `0 0 0px transparent`,
        }}
        transition={{ duration: 1.5, repeat: Infinity }}
        style={{
          width: "8px",
          height: "8px",
          borderRadius: "50%",
          backgroundColor: voice.accent,
          opacity: isPlaying ? 1 : 0.4,
        }}
      />

      {/* Voice label */}
      <span
        style={{
          fontFamily: '"JetBrains Mono", monospace',
          fontSize: "0.5rem",
          letterSpacing: "0.12em",
          textTransform: "uppercase",
          color: "rgba(245,230,200,0.5)",
        }}
      >
        {voice.label}
      </span>

      {/* Play / Pause */}
      <button
        onClick={onTogglePlay}
        style={{
          width: "28px",
          height: "28px",
          borderRadius: "50%",
          border: `1px solid ${voice.accent}44`,
          background: isPlaying ? `${voice.accent}15` : "transparent",
          cursor: "pointer",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        {isPlaying ? (
          <svg width="8" height="10" viewBox="0 0 8 10" fill={voice.accent}>
            <rect x="0" y="0" width="2.5" height="10" rx="0.5" />
            <rect x="5.5" y="0" width="2.5" height="10" rx="0.5" />
          </svg>
        ) : (
          <svg width="8" height="10" viewBox="0 0 8 10" fill={voice.accent}>
            <path d="M0 0.5v9l8-4.5z" />
          </svg>
        )}
      </button>

      {/* Progress */}
      <span
        style={{
          fontFamily: '"JetBrains Mono", monospace',
          fontSize: "0.45rem",
          color: "rgba(245,230,200,0.3)",
        }}
      >
        {currentParagraph}/{totalParagraphs}
      </span>

      {/* Stop / close */}
      <button
        onClick={onStop}
        style={{
          fontFamily: '"JetBrains Mono", monospace',
          fontSize: "0.4rem",
          letterSpacing: "0.15em",
          textTransform: "uppercase",
          color: "rgba(245,230,200,0.25)",
          background: "none",
          border: "none",
          cursor: "pointer",
          padding: "2px 4px",
        }}
      >
        ✕
      </button>
    </motion.div>
  );
}
