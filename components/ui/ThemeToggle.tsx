"use client";

// ─── THEME TOGGLE ─────────────────────────────────────────────────────────────
// Three reading modes, cycled on click:
//   Night  = dark vault  (#0D0B08) — default
//   OLED   = true black  (#000000) — saves battery on AMOLED
//   Day    = sepia paper  (Kindle Paperwhite daytime)
//
// Sets `data-theme` on <html>. CSS custom properties handle the rest.

import { useState, useEffect } from "react";

type Theme = "night" | "oled" | "day";

const CYCLE: Theme[] = ["night", "oled", "day"];

function applyTheme(theme: Theme) {
  if (theme === "night") {
    document.documentElement.removeAttribute("data-theme");
  } else {
    document.documentElement.setAttribute("data-theme", theme);
  }
}

export default function ThemeToggle() {
  const [theme, setTheme] = useState<Theme>("night");
  const [mounted, setMounted] = useState(false);

  // Read stored preference on mount
  useEffect(() => {
    setMounted(true);
    const stored = localStorage.getItem("tintaxis-theme") as Theme | null;
    if (stored && CYCLE.includes(stored)) {
      setTheme(stored);
      applyTheme(stored);
    }
  }, []);

  function toggle() {
    const idx = CYCLE.indexOf(theme);
    const next = CYCLE[(idx + 1) % CYCLE.length];
    setTheme(next);
    localStorage.setItem("tintaxis-theme", next);
    applyTheme(next);
  }

  // Don't render on server to avoid hydration mismatch
  if (!mounted) return null;

  const labels: Record<Theme, string> = {
    night: "OLED Black",
    oled: "Day mode",
    day: "Night mode",
  };

  return (
    <button
      onClick={toggle}
      aria-label={`Switch to ${labels[theme]}`}
      title={labels[theme]}
      style={{
        background: "none",
        border: "none",
        cursor: "pointer",
        padding: "0.35rem",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        transition: "transform 0.3s ease, opacity 0.3s ease",
        opacity: 0.5,
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.opacity = "0.85";
        e.currentTarget.style.transform = "scale(1.1)";
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.opacity = "0.5";
        e.currentTarget.style.transform = "scale(1)";
      }}
    >
      {theme === "night" && (
        // Sun icon — next is OLED
        <svg
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          stroke="var(--brass-primary)"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <circle cx="12" cy="12" r="5" />
          <line x1="12" y1="1" x2="12" y2="3" />
          <line x1="12" y1="21" x2="12" y2="23" />
          <line x1="4.22" y1="4.22" x2="5.64" y2="5.64" />
          <line x1="18.36" y1="18.36" x2="19.78" y2="19.78" />
          <line x1="1" y1="12" x2="3" y2="12" />
          <line x1="21" y1="12" x2="23" y2="12" />
          <line x1="4.22" y1="19.78" x2="5.64" y2="18.36" />
          <line x1="18.36" y1="5.64" x2="19.78" y2="4.22" />
        </svg>
      )}
      {theme === "oled" && (
        // Filled circle — OLED active, next is Day
        <svg
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="var(--brass-primary)"
          stroke="var(--brass-primary)"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <circle cx="12" cy="12" r="5" />
          <line x1="12" y1="1" x2="12" y2="3" />
          <line x1="12" y1="21" x2="12" y2="23" />
          <line x1="4.22" y1="4.22" x2="5.64" y2="5.64" />
          <line x1="18.36" y1="18.36" x2="19.78" y2="19.78" />
          <line x1="1" y1="12" x2="3" y2="12" />
          <line x1="21" y1="12" x2="23" y2="12" />
          <line x1="4.22" y1="19.78" x2="5.64" y2="18.36" />
          <line x1="18.36" y1="5.64" x2="19.78" y2="4.22" />
        </svg>
      )}
      {theme === "day" && (
        // Moon icon — next is Night
        <svg
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          stroke="var(--brass-primary)"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
        </svg>
      )}
    </button>
  );
}
