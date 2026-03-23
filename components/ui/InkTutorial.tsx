"use client";

// ─── INK TUTORIAL ─────────────────────────────────────────────────────────────
// First-visit onboarding. Fires once — stored in localStorage.
// Three steps: Select → Ink → Archive.
// Each step has a visual demo and a one-line instruction.
// Does not block reading — dismissable at any point.
//
// FIX: All step content animates as a single unit under one AnimatePresence.
// Previous version had 3 separate AnimatePresence blocks firing at different
// times, causing choppy staggered transitions.

import { useEffect, useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";

const STORAGE_KEY = "tintaxis_tutorial_v1";

// ─── INK CONFIG — defined outside component so it never recreates ─────────────
const INKS = [
  { label: "Ghost",   color: "rgba(160,168,168,0.8)" },
  { label: "Ember",   color: "rgba(214,83,60,0.8)" },
  { label: "Copper",  color: "rgba(201,140,60,0.8)" },
  { label: "Archive", color: "rgba(201,168,76,0.9)" },
  { label: "Signal",  color: "rgba(0,229,204,0.8)" },
  { label: "Memory",  color: "rgba(106,60,196,0.8)" },
];

interface StepConfig {
  id: string;
  label: string;
  headline: string;
  body: string;
  Visual: React.ComponentType;
}

const STEPS: StepConfig[] = [
  {
    id: "select",
    label: "01 — SELECT",
    headline: "Choose any passage.",
    body: "Highlight words that move you, trouble you, or demand a second look. The text is yours to mark.",
    Visual: SelectDemo,
  },
  {
    id: "ink",
    label: "02 — INK",
    headline: "Six inks. Six ways of reading.",
    body: "Each ink carries a different intention — curiosity, memory, a private thought, a question sent directly to the author.",
    Visual: InkDemo,
  },
  {
    id: "archive",
    label: "03 — ARCHIVE",
    headline: "Your marks live in the Archive.",
    body: "Every annotation is sealed into this chapter. Return to any page and your ink will be exactly where you left it.",
    Visual: ArchiveDemo,
  },
];

interface InkTutorialProps {
  enabled?: boolean;
}

export default function InkTutorial({ enabled = true }: InkTutorialProps) {
  const [visible, setVisible] = useState(false);
  const [step, setStep] = useState(0);

  useEffect(() => {
    if (!enabled) return;
    try {
      if (localStorage.getItem(STORAGE_KEY)) return;
    } catch {
      return;
    }
    const timer = setTimeout(() => setVisible(true), 2500);
    return () => clearTimeout(timer);
  }, [enabled]);

  const dismiss = useCallback(() => {
    try {
      localStorage.setItem(STORAGE_KEY, "1");
    } catch { /* ignore */ }
    setVisible(false);
  }, []);

  const next = useCallback(() => {
    if (step < STEPS.length - 1) {
      setStep((s) => s + 1);
    } else {
      dismiss();
    }
  }, [step, dismiss]);

  const prev = useCallback(() => {
    setStep((s) => Math.max(0, s - 1));
  }, []);

  return (
    <AnimatePresence>
      {visible && (
        <>
          {/* Backdrop */}
          <motion.div
            className="fixed inset-0 z-40"
            style={{ backgroundColor: "rgba(13,11,8,0.85)", backdropFilter: "blur(3px)" }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.4 }}
            onClick={dismiss}
          />

          {/* Tutorial card */}
          <motion.div
            className="fixed z-50"
            style={{
              top: "50%",
              left: "50%",
              transform: "translate(-50%, -50%)",
              width: "min(480px, calc(100vw - 2rem))",
            }}
            initial={{ opacity: 0, y: 20, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.97 }}
            transition={{ duration: 0.45, ease: [0.2, 0, 0.1, 1] }}
            onClick={(e) => e.stopPropagation()}
          >
            <div
              style={{
                border: "1px solid rgba(201,168,76,0.22)",
                background: "rgba(13,11,8,0.98)",
                padding: "clamp(1.5rem, 5vw, 2.2rem)",
                position: "relative",
              }}
            >
              {/* Corner accents */}
              {(["top-0 left-0 border-t border-l","top-0 right-0 border-t border-r","bottom-0 left-0 border-b border-l","bottom-0 right-0 border-b border-r"] as const).map((cls, i) => (
                <span key={i} className={`absolute w-3 h-3 ${cls}`} style={{ borderColor: "rgba(201,168,76,0.35)" }} />
              ))}

              {/* ── Single AnimatePresence for ALL step content ── */}
              {/* Wrapping everything in one keyed block eliminates the
                  independent stagger that caused choppiness. */}
              <AnimatePresence mode="wait" initial={false}>
                <motion.div
                  key={step}
                  initial={{ opacity: 0, x: 16 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -16 }}
                  transition={{ duration: 0.28, ease: "easeOut" }}
                >
                  {/* Step label */}
                  <p
                    style={{
                      fontFamily: '"JetBrains Mono", monospace',
                      fontSize: "0.5rem",
                      letterSpacing: "0.3em",
                      color: "rgba(201,168,76,0.5)",
                      textTransform: "uppercase",
                      marginBottom: "1.25rem",
                    }}
                  >
                    {STEPS[step].label}
                  </p>

                  {/* Visual demo */}
                  <div
                    style={{
                      marginBottom: "1.5rem",
                      minHeight: "100px",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      borderTop: "1px solid rgba(201,168,76,0.08)",
                      borderBottom: "1px solid rgba(201,168,76,0.08)",
                      padding: "1rem 0",
                    }}
                  >
                    {/* key on Visual forces full internal state reset */}
                    <StepVisual step={step} />
                  </div>

                  {/* Headline + body */}
                  <h3
                    style={{
                      fontFamily: '"EB Garamond", Garamond, Georgia, serif',
                      fontSize: "1.3rem",
                      fontWeight: 400,
                      color: "#F5E6C8",
                      lineHeight: 1.3,
                      marginBottom: "0.6rem",
                      letterSpacing: "-0.01em",
                    }}
                  >
                    {STEPS[step].headline}
                  </h3>
                  <p
                    style={{
                      fontFamily: '"EB Garamond", Garamond, Georgia, serif',
                      fontSize: "0.95rem",
                      fontStyle: "italic",
                      color: "rgba(245,230,200,0.45)",
                      lineHeight: 1.7,
                      marginBottom: "1.75rem",
                    }}
                  >
                    {STEPS[step].body}
                  </p>
                </motion.div>
              </AnimatePresence>

              {/* Progress dots — CSS transition, no layout animation */}
              <div style={{ display: "flex", justifyContent: "center", gap: "0.5rem", marginBottom: "1.5rem" }}>
                {STEPS.map((_, i) => (
                  <div
                    key={i}
                    style={{
                      height: "5px",
                      borderRadius: "3px",
                      width: i === step ? "20px" : "6px",
                      backgroundColor:
                        i === step
                          ? "rgba(201,168,76,0.8)"
                          : i < step
                          ? "rgba(201,168,76,0.35)"
                          : "rgba(201,168,76,0.12)",
                      transition: "width 0.22s ease, background-color 0.22s ease",
                    }}
                  />
                ))}
              </div>

              {/* Navigation */}
              <div style={{ display: "flex", gap: "0.75rem", alignItems: "center" }}>
                {step > 0 && (
                  <motion.button
                    onClick={prev}
                    style={{
                      fontFamily: '"JetBrains Mono", monospace',
                      fontSize: "0.55rem",
                      letterSpacing: "0.18em",
                      textTransform: "uppercase",
                      color: "rgba(245,230,200,0.3)",
                      background: "transparent",
                      border: "1px solid rgba(245,230,200,0.1)",
                      padding: "0.6rem 1rem",
                      cursor: "pointer",
                    }}
                    whileHover={{ color: "rgba(245,230,200,0.6)", borderColor: "rgba(245,230,200,0.2)" }}
                    whileTap={{ scale: 0.97 }}
                  >
                    ← Back
                  </motion.button>
                )}

                <motion.button
                  onClick={next}
                  style={{
                    flex: 1,
                    fontFamily: '"JetBrains Mono", monospace',
                    fontSize: "0.6rem",
                    letterSpacing: "0.22em",
                    textTransform: "uppercase",
                    color: "#C9A84C",
                    background: "transparent",
                    border: "1px solid rgba(201,168,76,0.4)",
                    padding: "0.7rem 1.5rem",
                    cursor: "pointer",
                    position: "relative",
                  }}
                  whileHover={{ borderColor: "rgba(201,168,76,0.8)", boxShadow: "0 0 16px rgba(201,168,76,0.12)" }}
                  whileTap={{ scale: 0.98 }}
                >
                  {(["top-0 left-0 border-t border-l","top-0 right-0 border-t border-r","bottom-0 left-0 border-b border-l","bottom-0 right-0 border-b border-r"] as const).map((cls, i) => (
                    <span key={i} className={`absolute w-1.5 h-1.5 ${cls}`} style={{ borderColor: "#C9A84C" }} />
                  ))}
                  {step < STEPS.length - 1 ? "Next →" : "Begin Reading"}
                </motion.button>

                <button
                  onClick={dismiss}
                  style={{
                    fontFamily: '"JetBrains Mono", monospace',
                    fontSize: "0.5rem",
                    letterSpacing: "0.15em",
                    textTransform: "uppercase",
                    color: "rgba(245,230,200,0.18)",
                    background: "transparent",
                    border: "none",
                    cursor: "pointer",
                    padding: "0.4rem",
                    whiteSpace: "nowrap",
                  }}
                >
                  Skip
                </button>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

// ─── STEP VISUAL SWITCHER ─────────────────────────────────────────────────────
// Renders the correct demo for the current step.
// Receiving `step` as a prop and calling the right component
// achieves the same full remount as key={step} on each individual Visual.

function StepVisual({ step }: { step: number }) {
  if (step === 0) return <SelectDemo />;
  if (step === 1) return <InkDemo />;
  return <ArchiveDemo />;
}

// ─── STEP VISUALS ─────────────────────────────────────────────────────────────

function SelectDemo() {
  const [highlighted, setHighlighted] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setHighlighted(true), 350);
    return () => clearTimeout(t);
  }, []);

  const words = ["Every", "song", "is", "a", "country.", "I", "was", "born", "stateless."];

  return (
    <div
      style={{
        fontFamily: '"EB Garamond", Garamond, Georgia, serif',
        fontSize: "1rem",
        fontStyle: "italic",
        lineHeight: 1.6,
        textAlign: "center",
        maxWidth: "32ch",
        userSelect: "none",
      }}
    >
      {words.map((word, i) => {
        const isHL = highlighted && i <= 4;
        return (
          <motion.span
            key={i}
            animate={{
              backgroundColor: isHL ? "rgba(214,83,60,0.25)" : "transparent",
              color: isHL ? "rgba(245,230,200,0.95)" : "rgba(245,230,200,0.5)",
            }}
            style={{ borderRadius: "1px", padding: "0 1px" }}
            transition={{ duration: 0.25, delay: isHL ? i * 0.05 : 0 }}
          >
            {word}{" "}
          </motion.span>
        );
      })}
    </div>
  );
}

function InkDemo() {
  const [activeIndex, setActiveIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setActiveIndex((i) => (i + 1) % INKS.length);
    }, 750);
    return () => clearInterval(interval);
  }, []); // stable — INKS is module-level constant

  return (
    <div style={{ display: "flex", gap: "0.75rem", alignItems: "center", flexWrap: "wrap", justifyContent: "center" }}>
      {INKS.map((ink, i) => (
        <motion.div
          key={ink.label}
          style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "0.3rem" }}
          animate={{
            opacity: i === activeIndex ? 1 : 0.22,
            scale: i === activeIndex ? 1.12 : 0.95,
          }}
          transition={{ duration: 0.25, ease: "easeOut" }}
        >
          <div
            style={{
              width: "10px",
              height: "10px",
              borderRadius: "50%",
              backgroundColor: ink.color,
              boxShadow: i === activeIndex ? `0 0 10px ${ink.color}` : "none",
              transition: "box-shadow 0.25s ease",
            }}
          />
          <span
            style={{
              fontFamily: '"JetBrains Mono", monospace',
              fontSize: "0.45rem",
              letterSpacing: "0.1em",
              color: ink.color,
              textTransform: "uppercase",
            }}
          >
            {ink.label}
          </span>
        </motion.div>
      ))}
    </div>
  );
}

function ArchiveDemo() {
  const [phase, setPhase] = useState(0);

  useEffect(() => {
    const t1 = setTimeout(() => setPhase(1), 280);
    const t2 = setTimeout(() => setPhase(2), 820);
    return () => { clearTimeout(t1); clearTimeout(t2); };
  }, []);

  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-start", gap: "0.5rem", width: "100%", maxWidth: "280px" }}>
      <motion.div
        style={{
          display: "flex",
          alignItems: "flex-start",
          gap: "0.5rem",
          borderLeft: "2px solid rgba(214,83,60,0.5)",
          paddingLeft: "0.6rem",
        }}
        animate={{ opacity: phase >= 1 ? 1 : 0, x: phase >= 1 ? 0 : 10 }}
        transition={{ duration: 0.35, ease: "easeOut" }}
      >
        <div>
          <p style={{ fontFamily: '"JetBrains Mono", monospace', fontSize: "0.45rem", letterSpacing: "0.15em", color: "rgba(214,83,60,0.6)", textTransform: "uppercase", marginBottom: "0.15rem" }}>
            Ember Ink
          </p>
          <p style={{ fontFamily: '"EB Garamond", Garamond, Georgia, serif', fontSize: "0.85rem", fontStyle: "italic", color: "rgba(245,230,200,0.55)" }}>
            &ldquo;born stateless&rdquo;
          </p>
        </div>
      </motion.div>

      <motion.div
        style={{ display: "flex", alignItems: "center", gap: "0.4rem" }}
        animate={{ opacity: phase >= 2 ? 1 : 0 }}
        transition={{ duration: 0.35, ease: "easeOut" }}
      >
        <div style={{ width: "6px", height: "6px", borderRadius: "50%", backgroundColor: "rgba(201,168,76,0.5)", flexShrink: 0 }} />
        <span style={{ fontFamily: '"JetBrains Mono", monospace', fontSize: "0.45rem", letterSpacing: "0.12em", color: "rgba(201,168,76,0.45)" }}>
          SEALED TO ARCHIVE · PERSISTS ACROSS VISITS
        </span>
      </motion.div>
    </div>
  );
}
