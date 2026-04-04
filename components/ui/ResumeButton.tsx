"use client";

// ─── RESUME BUTTON ─────────────────────────────────────────────────────────
// Small "R" button that appears when reader has saved progress (scrollProgress > 0.05).
// Positioned at top of reading area, brass-styled.
// Click to scroll back to saved position.
// Keyboard shortcut: Ctrl+Shift+R (Windows) / Cmd+Shift+R (Mac)

import { useState, useEffect } from "react";
import { getReaderState } from "@/lib/ink";

interface ResumeButtonProps {
  chapterSlug: string;
}

export default function ResumeButton({ chapterSlug }: ResumeButtonProps) {
  const [mounted, setMounted] = useState(false);
  const [hasSavedProgress, setHasSavedProgress] = useState(false);
  const [scrollProgress, setScrollProgress] = useState(0);

  // ── Read saved progress on mount ─────────────────────────────
  useEffect(() => {
    setMounted(true);
    const state = getReaderState(chapterSlug);
    if (state && state.scrollProgress > 0.05) {
      setHasSavedProgress(true);
      setScrollProgress(state.scrollProgress);
    }
  }, [chapterSlug]);

  // ── Handle resume click ──────────────────────────────────────
  const handleResume = () => {
    if (!hasSavedProgress) return;

    const state = getReaderState(chapterSlug);
    if (!state) return;

    // Calculate scroll position: progress * (total scrollable height)
    const scrollHeight = document.documentElement.scrollHeight - window.innerHeight;
    const targetScroll = state.scrollProgress * scrollHeight;

    window.scrollTo({
      top: targetScroll,
      behavior: "smooth",
    });
  };

  // ── Keyboard shortcut: Ctrl+Shift+R / Cmd+Shift+R ──────────
  useEffect(() => {
    if (!mounted) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      // Ctrl+Shift+R (Windows) or Cmd+Shift+R (Mac)
      if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key === "R") {
        e.preventDefault();
        handleResume();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [mounted, hasSavedProgress]);

  // Don't render on server or if no saved progress
  if (!mounted || !hasSavedProgress) return null;

  return (
    <button
      onClick={handleResume}
      aria-label="Resume from saved position"
      title={`Resume (Ctrl+Shift+R)`}
      style={{
        position: "fixed",
        top: "0.65rem",
        right: "3rem",
        zIndex: 48,
        width: "32px",
        height: "32px",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontFamily: '"JetBrains Mono", monospace',
        fontSize: "0.875rem",
        fontWeight: "600",
        letterSpacing: "0.05em",
        color: "rgba(201, 168, 76, 0.4)",
        backgroundColor: "rgba(13, 11, 8, 0.85)",
        border: "1px solid rgba(201, 168, 76, 0.2)",
        borderRadius: "4px",
        cursor: "pointer",
        transition: "all 0.3s ease",
        backdropFilter: "blur(10px)",
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.color = "rgba(201, 168, 76, 0.8)";
        e.currentTarget.style.borderColor = "rgba(201, 168, 76, 0.4)";
        e.currentTarget.style.transform = "scale(1.08)";
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.color = "rgba(201, 168, 76, 0.4)";
        e.currentTarget.style.borderColor = "rgba(201, 168, 76, 0.2)";
        e.currentTarget.style.transform = "scale(1)";
      }}
    >
      R
    </button>
  );
}
