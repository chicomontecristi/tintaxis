"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

// ─── RETURN CAPTURE ──────────────────────────────────────────────────────────
// Tracks reading sessions in localStorage. On return visits, shows a
// "Welcome back — continue reading" toast that deeplinks to their last chapter.
// On first deep reads (>60% scroll), shows a bookmark/save prompt.

const MONO = '"JetBrains Mono", monospace';
const SERIF = '"EB Garamond", Garamond, Georgia, serif';
const BRASS = "rgba(201,168,76,";
const CREAM = "rgba(245,230,200,";
const STORAGE_KEY = "tintaxis_reading_history";

interface ReadingRecord {
  bookSlug: string;
  bookTitle: string;
  chapterSlug: string;
  chapterTitle: string;
  chapterNumber: number;
  totalChapters: number;
  timestamp: number;
  url: string;
}

// ── Helpers ──────────────────────────────────────────────────────────────────

function getHistory(): ReadingRecord[] {
  if (typeof window === "undefined") return [];
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]");
  } catch {
    return [];
  }
}

function saveToHistory(record: ReadingRecord) {
  const history = getHistory().filter(
    (r) => !(r.bookSlug === record.bookSlug && r.chapterSlug === record.chapterSlug)
  );
  history.unshift(record);
  // Keep last 20 entries
  localStorage.setItem(STORAGE_KEY, JSON.stringify(history.slice(0, 20)));
}

export function getLastRead(): ReadingRecord | null {
  const history = getHistory();
  return history.length > 0 ? history[0] : null;
}

// ── Track current chapter (call from ReadingSurface) ─────────────────────────

export function useTrackReading(opts: {
  bookSlug: string;
  bookTitle: string;
  chapterSlug: string;
  chapterTitle: string;
  chapterNumber: number;
  totalChapters: number;
  url: string;
}) {
  useEffect(() => {
    // Save after 5 seconds of reading (not just passing through)
    const timer = setTimeout(() => {
      saveToHistory({
        ...opts,
        timestamp: Date.now(),
      });
    }, 5000);
    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [opts.chapterSlug]);
}

// ── Bookmark Prompt (shown after deep scroll on first visit) ────────────────

export function BookmarkPrompt() {
  const [show, setShow] = useState(false);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    // Don't show if already dismissed this session
    if (sessionStorage.getItem("tintaxis_bookmark_dismissed")) return;

    // Don't show to return visitors (they already know the site)
    const history = getHistory();
    if (history.length > 2) return;

    const handleScroll = () => {
      const scrollPct =
        window.scrollY / (document.documentElement.scrollHeight - window.innerHeight);
      if (scrollPct > 0.55 && !dismissed) {
        setShow(true);
        window.removeEventListener("scroll", handleScroll);
      }
    };

    // Delay listener so it doesn't fire immediately
    const timer = setTimeout(() => {
      window.addEventListener("scroll", handleScroll, { passive: true });
    }, 10000);

    return () => {
      clearTimeout(timer);
      window.removeEventListener("scroll", handleScroll);
    };
  }, [dismissed]);

  const dismiss = () => {
    setDismissed(true);
    setShow(false);
    sessionStorage.setItem("tintaxis_bookmark_dismissed", "1");
  };

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 12 }}
          transition={{ duration: 0.4, ease: [0.2, 0, 0.1, 1] }}
          style={{
            position: "fixed",
            bottom: "clamp(70px, 10vh, 100px)",
            left: "50%",
            transform: "translateX(-50%)",
            zIndex: 40,
            background: "#0D0B08",
            border: `1px solid ${BRASS}0.25)`,
            padding: "12px 20px",
            display: "flex",
            alignItems: "center",
            gap: "12px",
            maxWidth: "360px",
            width: "calc(100% - 2rem)",
            boxShadow: `0 8px 32px rgba(0,0,0,0.6), 0 0 12px ${BRASS}0.08)`,
          }}
        >
          <div style={{ flex: 1 }}>
            <p
              style={{
                fontFamily: SERIF,
                fontSize: "0.85rem",
                fontStyle: "italic",
                color: `${CREAM}0.7)`,
                margin: "0 0 2px",
                lineHeight: 1.3,
              }}
            >
              Bookmark this page
            </p>
            <p
              style={{
                fontFamily: MONO,
                fontSize: "0.35rem",
                letterSpacing: "0.15em",
                color: `${BRASS}0.35)`,
                textTransform: "uppercase",
                margin: 0,
              }}
            >
              Press {typeof navigator !== "undefined" && /Mac/.test(navigator.userAgent) ? "⌘+D" : "Ctrl+D"} to save your place
            </p>
          </div>
          <button
            onClick={dismiss}
            style={{
              fontFamily: MONO,
              fontSize: "0.6rem",
              color: `${BRASS}0.4)`,
              background: "none",
              border: "none",
              cursor: "pointer",
              padding: "4px",
              flexShrink: 0,
            }}
          >
            ✕
          </button>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

// ── Welcome Back Toast (shown to returning visitors on any page) ─────────────

export function WelcomeBackToast() {
  const [record, setRecord] = useState<ReadingRecord | null>(null);
  const [show, setShow] = useState(false);

  useEffect(() => {
    // Only show once per session
    if (sessionStorage.getItem("tintaxis_welcomed_back")) return;

    const last = getLastRead();
    if (!last) return;

    // Only show if last visit was >1 hour ago
    const hourAgo = Date.now() - 60 * 60 * 1000;
    if (last.timestamp > hourAgo) return;

    setRecord(last);
    // Small delay so page loads first
    const timer = setTimeout(() => setShow(true), 1500);
    sessionStorage.setItem("tintaxis_welcomed_back", "1");

    return () => clearTimeout(timer);
  }, []);

  if (!record) return null;

  const progressPct = Math.round((record.chapterNumber / record.totalChapters) * 100);

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 12 }}
          transition={{ duration: 0.45, ease: [0.2, 0, 0.1, 1] }}
          style={{
            position: "fixed",
            bottom: "clamp(70px, 10vh, 100px)",
            left: "50%",
            transform: "translateX(-50%)",
            zIndex: 40,
            background: "#0D0B08",
            border: `1px solid ${BRASS}0.25)`,
            maxWidth: "380px",
            width: "calc(100% - 2rem)",
            overflow: "hidden",
            boxShadow: `0 8px 32px rgba(0,0,0,0.6), 0 0 12px ${BRASS}0.08)`,
          }}
        >
          {/* Progress bar */}
          <div style={{ width: "100%", height: "2px", background: `${BRASS}0.08)` }}>
            <div
              style={{
                width: `${progressPct}%`,
                height: "100%",
                background: `${BRASS}0.5)`,
              }}
            />
          </div>

          <div style={{ padding: "12px 16px", display: "flex", alignItems: "center", gap: "12px", overflow: "hidden" }}>
            <div style={{ flex: 1, minWidth: 0 }}>
              <p
                style={{
                  fontFamily: MONO,
                  fontSize: "0.35rem",
                  letterSpacing: "0.2em",
                  textTransform: "uppercase",
                  color: `${BRASS}0.4)`,
                  margin: "0 0 3px",
                }}
              >
                Welcome back · {progressPct}% through
              </p>
              <a
                href={`${record.url}?resume=1`}
                style={{
                  fontFamily: SERIF,
                  fontSize: "0.9rem",
                  fontStyle: "italic",
                  color: `${CREAM}0.75)`,
                  textDecoration: "none",
                  lineHeight: 1.2,
                  display: "block",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  whiteSpace: "nowrap",
                }}
              >
                Continue: {record.chapterTitle}
                <span
                  style={{
                    color: `${CREAM}0.35)`,
                    fontSize: "0.8rem",
                  }}
                >
                  {" "}
                  — {record.bookTitle}
                </span>
              </a>
            </div>
            <button
              onClick={() => setShow(false)}
              style={{
                fontFamily: MONO,
                fontSize: "0.6rem",
                color: `${BRASS}0.4)`,
                background: "none",
                border: "none",
                cursor: "pointer",
                padding: "4px",
                flexShrink: 0,
              }}
            >
              ✕
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
