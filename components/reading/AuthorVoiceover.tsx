"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";

// ─── AUTHOR VOICEOVER ────────────────────────────────────────────────────────
// The author's recorded voice reading the opening of the chapter.
// Appears as a compact, atmospheric audio bar between the chapter header
// and the first paragraph. When it finishes, fires onComplete to trigger
// the AI narrator selection.

interface AuthorVoiceoverProps {
  audioUrl: string;
  authorName: string;
  chapterTitle: string;
  accentColor?: string;
  onComplete: () => void;     // Called when audio finishes — triggers narrator selector
  onSkip: () => void;         // Reader skips the voiceover
}

export default function AuthorVoiceover({
  audioUrl,
  authorName,
  chapterTitle,
  accentColor = "#C9A84C",
  onComplete,
  onSkip,
}: AuthorVoiceoverProps) {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [duration, setDuration] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const [hasStarted, setHasStarted] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);
  const [waveformPhase, setWaveformPhase] = useState(0);
  const animFrameRef = useRef<number>(0);

  // ── Initialize audio element ────────────────────────────
  useEffect(() => {
    const audio = new Audio(audioUrl);
    audio.preload = "metadata";
    audioRef.current = audio;

    audio.addEventListener("loadedmetadata", () => {
      setDuration(audio.duration);
      setIsLoaded(true);
    });

    audio.addEventListener("timeupdate", () => {
      setCurrentTime(audio.currentTime);
      setProgress(audio.duration ? audio.currentTime / audio.duration : 0);
    });

    audio.addEventListener("ended", () => {
      setIsPlaying(false);
      onComplete();
    });

    return () => {
      audio.pause();
      audio.removeEventListener("loadedmetadata", () => {});
      audio.removeEventListener("timeupdate", () => {});
      audio.removeEventListener("ended", () => {});
      audio.src = "";
    };
  }, [audioUrl, onComplete]);

  // ── Waveform animation loop ─────────────────────────────
  useEffect(() => {
    if (!isPlaying) {
      cancelAnimationFrame(animFrameRef.current);
      return;
    }
    const tick = () => {
      setWaveformPhase((p) => p + 0.08);
      animFrameRef.current = requestAnimationFrame(tick);
    };
    animFrameRef.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(animFrameRef.current);
  }, [isPlaying]);

  const togglePlay = useCallback(() => {
    if (!audioRef.current) return;
    if (isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
    } else {
      audioRef.current.play();
      setIsPlaying(true);
      setHasStarted(true);
    }
  }, [isPlaying]);

  const formatTime = (s: number) => {
    const m = Math.floor(s / 60);
    const sec = Math.floor(s % 60);
    return `${m}:${sec.toString().padStart(2, "0")}`;
  };

  // ── Mini waveform bars ──────────────────────────────────
  const bars = 24;
  const waveformBars = Array.from({ length: bars }, (_, i) => {
    const height = isPlaying
      ? 8 + 14 * Math.abs(Math.sin(waveformPhase + i * 0.4))
      : 4 + 4 * Math.abs(Math.sin(i * 0.5));
    return height;
  });

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay: 0.3 }}
      style={{
        margin: "0 auto 2.5rem",
        maxWidth: "480px",
        padding: "1rem 1.25rem",
        border: `1px solid ${accentColor}22`,
        borderRadius: "4px",
        background: `linear-gradient(135deg, ${accentColor}08, transparent 60%)`,
        position: "relative",
        overflow: "hidden",
      }}
    >
      {/* ── Glow pulse behind when playing ── */}
      <AnimatePresence>
        {isPlaying && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            style={{
              position: "absolute",
              inset: 0,
              background: `radial-gradient(ellipse at 30% 50%, ${accentColor}10, transparent 70%)`,
              pointerEvents: "none",
            }}
          />
        )}
      </AnimatePresence>

      {/* ── Top label ── */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          marginBottom: "0.75rem",
        }}
      >
        <p
          style={{
            fontFamily: '"JetBrains Mono", monospace',
            fontSize: "0.75rem",
            letterSpacing: "0.25em",
            textTransform: "uppercase",
            color: `${accentColor}99`,
            margin: 0,
          }}
        >
          Author Voice · {authorName}
        </p>

        {/* Skip button */}
        <button
          onClick={onSkip}
          style={{
            fontFamily: '"JetBrains Mono", monospace',
            fontSize: "0.75rem",
            letterSpacing: "0.15em",
            textTransform: "uppercase",
            color: "rgba(245,230,200,0.3)",
            background: "none",
            border: "none",
            cursor: "pointer",
            padding: "2px 6px",
          }}
        >
          Skip →
        </button>
      </div>

      {/* ── Player row ── */}
      <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
        {/* Play/pause button */}
        <button
          onClick={togglePlay}
          disabled={!isLoaded}
          style={{
            width: "36px",
            height: "36px",
            borderRadius: "50%",
            border: `1.5px solid ${accentColor}55`,
            background: isPlaying ? `${accentColor}18` : "transparent",
            cursor: isLoaded ? "pointer" : "wait",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            flexShrink: 0,
            transition: "all 0.2s ease",
          }}
        >
          {isPlaying ? (
            /* Pause icon */
            <svg width="12" height="14" viewBox="0 0 12 14" fill={accentColor}>
              <rect x="1" y="0" width="3.5" height="14" rx="1" />
              <rect x="7.5" y="0" width="3.5" height="14" rx="1" />
            </svg>
          ) : (
            /* Play icon */
            <svg width="12" height="14" viewBox="0 0 12 14" fill={accentColor}>
              <path d="M1 1.5v11l10-5.5z" />
            </svg>
          )}
        </button>

        {/* Waveform visualization */}
        <div
          style={{
            flex: 1,
            display: "flex",
            alignItems: "center",
            gap: "2px",
            height: "28px",
            position: "relative",
          }}
        >
          {waveformBars.map((h, i) => {
            const filled = progress > i / bars;
            return (
              <div
                key={i}
                style={{
                  width: "2px",
                  height: `${h}px`,
                  borderRadius: "1px",
                  backgroundColor: filled ? accentColor : `${accentColor}30`,
                  transition: isPlaying ? "none" : "height 0.3s ease",
                  flexShrink: 0,
                }}
              />
            );
          })}
        </div>

        {/* Time display */}
        <p
          style={{
            fontFamily: '"JetBrains Mono", monospace',
            fontSize: "0.8rem",
            color: "rgba(245,230,200,0.4)",
            margin: 0,
            minWidth: "60px",
            textAlign: "right",
            flexShrink: 0,
          }}
        >
          {hasStarted ? formatTime(currentTime) : formatTime(duration)} / {formatTime(duration)}
        </p>
      </div>

      {/* ── Progress bar (thin line under waveform) ── */}
      <div
        style={{
          marginTop: "0.5rem",
          height: "1px",
          background: `${accentColor}15`,
          borderRadius: "1px",
          overflow: "hidden",
        }}
      >
        <motion.div
          style={{
            height: "100%",
            background: `linear-gradient(90deg, ${accentColor}60, ${accentColor})`,
            borderRadius: "1px",
          }}
          animate={{ width: `${progress * 100}%` }}
          transition={{ duration: 0.1 }}
        />
      </div>

      {/* ── First-listen prompt ── */}
      {!hasStarted && (
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.2, duration: 0.6 }}
          style={{
            fontFamily: '"EB Garamond", Garamond, Georgia, serif',
            fontSize: "0.95rem",
            fontStyle: "italic",
            color: "rgba(245,230,200,0.35)",
            textAlign: "center",
            marginTop: "0.75rem",
            marginBottom: 0,
          }}
        >
          Hear the author read the opening of this chapter
        </motion.p>
      )}
    </motion.div>
  );
}
