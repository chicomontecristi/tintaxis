"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

// ─── SESSION DEPTH TRIGGERS ──────────────────────────────────────────────────
// Progressive CTAs that appear based on how deep the reader is into a session.
// Tracks page views in sessionStorage. Shows different prompts at different depths.
//
// Depth 1 (first page): Nothing — let them read undisturbed.
// Depth 2 (second page): Subtle email capture slide-in.
// Depth 3+ (exploring): "You're deep in the archive" library nudge.

const MONO = '"JetBrains Mono", monospace';
const SERIF = '"EB Garamond", Garamond, Georgia, serif';
const BRASS = "rgba(201,168,76,";
const CREAM = "rgba(245,230,200,";
const DEPTH_KEY = "tintaxis_session_depth";
const CAPTURED_KEY = "tintaxis_depth_captured";

function getDepth(): number {
  if (typeof window === "undefined") return 0;
  return parseInt(sessionStorage.getItem(DEPTH_KEY) || "0", 10);
}

function incrementDepth(): number {
  const next = getDepth() + 1;
  sessionStorage.setItem(DEPTH_KEY, next.toString());
  return next;
}

// ── Depth-aware email capture ────────────────────────────────────────────────
// Only appears on 2nd page view if reader hasn't given email yet.

export function DepthEmailCapture() {
  const [show, setShow] = useState(false);
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "sending" | "sent">("idle");

  useEffect(() => {
    const depth = incrementDepth();

    // Only trigger on 2nd page, and only if not already captured/dismissed
    if (depth !== 2) return;
    if (sessionStorage.getItem(CAPTURED_KEY)) return;
    if (localStorage.getItem("tintaxis_email_given")) return;

    const timer = setTimeout(() => setShow(true), 8000);
    return () => clearTimeout(timer);
  }, []);

  const dismiss = () => {
    setShow(false);
    sessionStorage.setItem(CAPTURED_KEY, "dismissed");
  };

  const handleSubmit = async () => {
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return;
    setStatus("sending");

    try {
      await fetch("/api/email-capture", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, source: "depth-trigger" }),
      });
      setStatus("sent");
      localStorage.setItem("tintaxis_email_given", "1");
      sessionStorage.setItem(CAPTURED_KEY, "captured");
      setTimeout(() => setShow(false), 3000);
    } catch {
      setStatus("idle");
    }
  };

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: 12 }}
          transition={{ duration: 0.4, ease: [0.2, 0, 0.1, 1] }}
          style={{
            position: "fixed",
            bottom: "clamp(70px, 10vh, 100px)",
            right: "clamp(0.75rem, 2vw, 1.5rem)",
            zIndex: 75,
            background: "#0D0B08",
            border: `1px solid ${BRASS}0.2)`,
            maxWidth: "300px",
            width: "calc(100% - 1.5rem)",
            padding: "14px 16px",
            boxShadow: `0 8px 32px rgba(0,0,0,0.6), 0 0 10px ${BRASS}0.06)`,
          }}
        >
          {status === "sent" ? (
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              style={{
                fontFamily: SERIF,
                fontSize: "0.9rem",
                fontStyle: "italic",
                color: "rgba(0,229,204,0.7)",
                margin: 0,
                textAlign: "center",
              }}
            >
              Welcome to the archive.
            </motion.p>
          ) : (
            <>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "8px" }}>
                <p
                  style={{
                    fontFamily: SERIF,
                    fontSize: "0.85rem",
                    fontStyle: "italic",
                    color: `${CREAM}0.65)`,
                    margin: 0,
                    lineHeight: 1.3,
                  }}
                >
                  New chapters are coming.
                </p>
                <button
                  onClick={dismiss}
                  style={{
                    fontFamily: MONO,
                    fontSize: "0.55rem",
                    color: `${BRASS}0.35)`,
                    background: "none",
                    border: "none",
                    cursor: "pointer",
                    padding: "0 0 0 8px",
                    flexShrink: 0,
                  }}
                >
                  ✕
                </button>
              </div>
              <div style={{ display: "flex", gap: "6px" }}>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="your@email.com"
                  onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
                  style={{
                    flex: 1,
                    fontFamily: SERIF,
                    fontSize: "0.8rem",
                    fontStyle: "italic",
                    padding: "6px 10px",
                    border: `1px solid ${BRASS}0.15)`,
                    borderRadius: "2px",
                    background: `${BRASS}0.03)`,
                    color: `${CREAM}0.7)`,
                    outline: "none",
                    minWidth: 0,
                  }}
                />
                <motion.button
                  onClick={handleSubmit}
                  disabled={status === "sending"}
                  style={{
                    fontFamily: MONO,
                    fontSize: "0.38rem",
                    letterSpacing: "0.15em",
                    textTransform: "uppercase",
                    padding: "6px 12px",
                    border: `1px solid ${BRASS}0.25)`,
                    borderRadius: "2px",
                    background: `${BRASS}0.06)`,
                    color: `${BRASS}0.55)`,
                    cursor: "pointer",
                    flexShrink: 0,
                    whiteSpace: "nowrap",
                  }}
                  whileHover={{ borderColor: `${BRASS}0.4)`, background: `${BRASS}0.1)` }}
                >
                  {status === "sending" ? "..." : "Notify Me"}
                </motion.button>
              </div>
            </>
          )}
        </motion.div>
      )}
    </AnimatePresence>
  );
}

// ── Deep reader nudge ────────────────────────────────────────────────────────
// On 3rd+ page view, subtly suggest the library.
// Only shows if they haven't visited /library yet this session.

export function DeepReaderNudge() {
  const [show, setShow] = useState(false);

  useEffect(() => {
    const depth = getDepth();
    if (depth < 3) return;
    if (sessionStorage.getItem("tintaxis_nudge_shown")) return;
    // Don't show on library page itself
    if (window.location.pathname === "/library") return;

    const timer = setTimeout(() => {
      setShow(true);
      sessionStorage.setItem("tintaxis_nudge_shown", "1");
    }, 12000);

    return () => clearTimeout(timer);
  }, []);

  if (!show) return null;

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 8 }}
          transition={{ duration: 0.4 }}
          style={{
            position: "fixed",
            bottom: "clamp(70px, 10vh, 100px)",
            left: "50%",
            transform: "translateX(-50%)",
            zIndex: 75,
            background: "#0D0B08",
            border: `1px solid ${BRASS}0.2)`,
            padding: "10px 16px",
            display: "flex",
            alignItems: "center",
            gap: "12px",
            maxWidth: "340px",
            width: "calc(100% - 2rem)",
            boxShadow: `0 6px 24px rgba(0,0,0,0.5)`,
          }}
        >
          <a
            href="/library"
            style={{
              fontFamily: SERIF,
              fontSize: "0.85rem",
              fontStyle: "italic",
              color: `${CREAM}0.65)`,
              textDecoration: "none",
              flex: 1,
              lineHeight: 1.3,
            }}
          >
            Four books in the archive.{" "}
            <span style={{ color: `${BRASS}0.55)` }}>Browse the library →</span>
          </a>
          <button
            onClick={() => setShow(false)}
            style={{
              fontFamily: MONO,
              fontSize: "0.55rem",
              color: `${BRASS}0.35)`,
              background: "none",
              border: "none",
              cursor: "pointer",
              padding: "4px",
            }}
          >
            ✕
          </button>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
