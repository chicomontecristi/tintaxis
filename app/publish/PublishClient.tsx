"use client";

import { useState, FormEvent, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useSearchParams } from "next/navigation";
import TintaxisLogo from "@/components/ui/TintaxisLogo";

// ─── TYPES ────────────────────────────────────────────────────────────────────
interface FormState {
  name: string;
  email: string;
  bookTitle: string;
  genre: string;
  wordCount: string;
  synopsis: string;
  whyTintaxis: string;
  chapterFile: File | null;
}

// ─── DATA ─────────────────────────────────────────────────────────────────────
const FEATURES = [
  {
    id: "ink",
    glyph: "⬡",
    headline: "Six Inks. One Voice.",
    body: "Choose the emotional register of your chapters — Melancholic, Urgent, Tender, Suspenseful, Reflective, or Defiant. The ink shapes how your prose is rendered for readers.",
  },
  {
    id: "signal",
    glyph: "◈",
    headline: "Signal Questions.",
    body: "Readers leave questions embedded in the text. You respond privately or publicly. A new kind of literary dialogue — intimate, asynchronous, permanent.",
  },
  {
    id: "rain",
    glyph: "▓",
    headline: "Chapter Rain.",
    body: "At the end of every chapter, your prose dissolves into a Matrix-style cascade built from your own vocabulary — a unique visual signature for every work.",
  },
  {
    id: "whisper",
    glyph: "◇",
    headline: "Author Whispers.",
    body: "Leave annotations visible only to verified readers. Context, regret, the sentence you almost cut. The margin notes authors never publish — until now.",
  },
  {
    id: "archive",
    glyph: "⊞",
    headline: "The Archive.",
    body: "Every work on Tintaxis lives in a unified archive. Readers discover your work alongside others. Your book earns shelf space through engagement, not algorithm.",
  },
  {
    id: "readers",
    glyph: "◉",
    headline: "Real Readers.",
    body: "No follower counts. No likes. Tintaxis tracks reading depth — how far readers go, which chapters hold them, where they leave. Data that means something.",
  },
];

const PLANS = [
  {
    id: "manuscript",
    label: "MANUSCRIPT",
    price: "$7",
    period: "/month",
    tagline: "One work. Full engagement.",
    items: [
      "1 published work",
      "Unlimited chapters",
      "Signal question queue",
      "Author Whispers",
      "Chapter Rain",
      "Reading depth analytics",
    ],
    cta: "Apply for Manuscript",
    accent: "rgba(201,168,76,0.6)",
  },
  {
    id: "press",
    label: "PRESS",
    price: "$15",
    period: "/month",
    tagline: "Your complete catalog.",
    items: [
      "Up to 5 published works",
      "Priority application review",
      "All Manuscript features",
      "Multi-work analytics dashboard",
      "Early access to new features",
      "Dedicated author page",
    ],
    cta: "Apply for Press",
    accent: "rgba(201,168,76,1)",
    featured: true,
  },
];

// ─── SUBCOMPONENTS ─────────────────────────────────────────────────────────────
function CornerAccents({ color = "rgba(201,168,76,0.25)" }: { color?: string }) {
  const positions = [
    "top-0 left-0 border-t border-l",
    "top-0 right-0 border-t border-r",
    "bottom-0 left-0 border-b border-l",
    "bottom-0 right-0 border-b border-r",
  ];
  return (
    <>
      {positions.map((cls, i) => (
        <span
          key={i}
          className={`absolute w-3 h-3 ${cls}`}
          style={{ borderColor: color }}
        />
      ))}
    </>
  );
}

function BrassRule({ opacity = 0.2 }: { opacity?: number }) {
  return (
    <div
      style={{
        height: "1px",
        background: `linear-gradient(90deg, transparent, rgba(201,168,76,${opacity}), transparent)`,
        margin: "2rem 0",
      }}
    />
  );
}

function FeatureCard({ feature, index }: { feature: typeof FEATURES[0]; index: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5, delay: index * 0.08 }}
      style={{
        border: "1px solid rgba(201,168,76,0.12)",
        padding: "1.75rem",
        position: "relative",
        background: "rgba(255,255,255,0.01)",
      }}
    >
      <CornerAccents />
      <div
        style={{
          fontFamily: '"JetBrains Mono", monospace',
          fontSize: "1.4rem",
          color: "rgba(201,168,76,0.5)",
          marginBottom: "1rem",
        }}
      >
        {feature.glyph}
      </div>
      <p
        style={{
          fontFamily: '"JetBrains Mono", monospace',
          fontSize: "0.9rem",
          letterSpacing: "0.25em",
          color: "rgba(201,168,76,0.7)",
          textTransform: "uppercase",
          marginBottom: "0.75rem",
        }}
      >
        {feature.headline}
      </p>
      <p
        style={{
          fontFamily: '"EB Garamond", Garamond, Georgia, serif',
          fontSize: "1.05rem",
          lineHeight: 1.7,
          color: "rgba(245,230,200,0.55)",
          fontStyle: "italic",
        }}
      >
        {feature.body}
      </p>
    </motion.div>
  );
}

function PricingCard({ plan, onSelect }: { plan: typeof PLANS[0]; onSelect: () => void }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5 }}
      style={{
        border: plan.featured
          ? "1px solid rgba(201,168,76,0.4)"
          : "1px solid rgba(201,168,76,0.15)",
        padding: "2rem",
        position: "relative",
        background: plan.featured ? "rgba(201,168,76,0.03)" : "transparent",
        flex: 1,
        minWidth: 0,
      }}
    >
      <CornerAccents color={plan.featured ? "rgba(201,168,76,0.5)" : "rgba(201,168,76,0.2)"} />

      {plan.featured && (
        <div
          style={{
            position: "absolute",
            top: "-1px",
            left: "50%",
            transform: "translateX(-50%)",
            background: "#0D0B08",
            padding: "0 0.75rem",
            fontFamily: '"JetBrains Mono", monospace',
            fontSize: "0.75rem",
            letterSpacing: "0.3em",
            color: "rgba(201,168,76,0.8)",
            textTransform: "uppercase",
          }}
        >
          RECOMMENDED
        </div>
      )}

      <p
        style={{
          fontFamily: '"JetBrains Mono", monospace',
          fontSize: "0.75rem",
          letterSpacing: "0.3em",
          color: plan.accent,
          textTransform: "uppercase",
          marginBottom: "1.25rem",
        }}
      >
        {plan.label}
      </p>

      <div style={{ display: "flex", alignItems: "baseline", gap: "0.25rem", marginBottom: "0.5rem" }}>
        <span
          style={{
            fontFamily: '"EB Garamond", Garamond, Georgia, serif',
            fontSize: "2.5rem",
            color: "#F5E6C8",
          }}
        >
          {plan.price}
        </span>
        <span
          style={{
            fontFamily: '"JetBrains Mono", monospace',
            fontSize: "0.9rem",
            color: "rgba(245,230,200,0.35)",
            letterSpacing: "0.1em",
          }}
        >
          {plan.period}
        </span>
      </div>

      <p
        style={{
          fontFamily: '"EB Garamond", Garamond, Georgia, serif',
          fontSize: "0.9rem",
          fontStyle: "italic",
          color: "rgba(245,230,200,0.4)",
          marginBottom: "1.5rem",
        }}
      >
        {plan.tagline}
      </p>

      <div style={{ marginBottom: "2rem" }}>
        {plan.items.map((item, i) => (
          <div
            key={i}
            style={{
              display: "flex",
              alignItems: "center",
              gap: "0.6rem",
              marginBottom: "0.6rem",
            }}
          >
            <span style={{ color: "rgba(201,168,76,0.5)", fontSize: "0.9rem" }}>◆</span>
            <span
              style={{
                fontFamily: '"JetBrains Mono", monospace',
                fontSize: "0.9rem",
                letterSpacing: "0.05em",
                color: "rgba(245,230,200,0.5)",
              }}
            >
              {item}
            </span>
          </div>
        ))}
      </div>

      <motion.button
        onClick={onSelect}
        whileHover={{ borderColor: "rgba(201,168,76,0.8)", boxShadow: "0 0 20px rgba(201,168,76,0.1)" }}
        whileTap={{ scale: 0.98 }}
        style={{
          width: "100%",
          fontFamily: '"JetBrains Mono", monospace',
          fontSize: "0.9rem",
          letterSpacing: "0.25em",
          textTransform: "uppercase",
          color: "#C9A84C",
          background: "transparent",
          border: `1px solid ${plan.featured ? "rgba(201,168,76,0.5)" : "rgba(201,168,76,0.25)"}`,
          padding: "0.85rem",
          cursor: "pointer",
        }}
      >
        {plan.cta}
      </motion.button>
    </motion.div>
  );
}

// ─── WRITER EARNINGS BREAKDOWN ─────────────────────────────────────────────────
// Per-tier scenarios so writers see exactly what they earn.

const EARNINGS_TIERS = [
  {
    tier: "Codex",
    price: 1.99,
    accent: "rgba(201,168,76,0.6)",
    description: "Your reader gets full chapter access, personal annotations, and four ink types.",
  },
  {
    tier: "Scribe",
    price: 3.99,
    accent: "rgba(0,229,204,0.6)",
    description: "Your reader can ask you questions directly through Signal Ink and see your Author Whispers.",
  },
  {
    tier: "Archive",
    price: 7.99,
    accent: "rgba(201,168,76,0.9)",
    description: "Your reader joins the community margin — seeing how every other reader annotated your work.",
  },
  {
    tier: "Chronicler",
    price: 9.99,
    accent: "rgba(245,230,200,0.75)",
    description: "Your most dedicated reader. They get a signed copy, their name in the dedication, and a private session with you.",
  },
];

function WriterEarningsBreakdown() {
  const platformFee = 7; // Manuscript plan

  return (
    <>
      <motion.p
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        style={{
          fontFamily: '"JetBrains Mono", monospace',
          fontSize: "0.75rem",
          letterSpacing: "0.35em",
          color: "rgba(201,168,76,0.4)",
          textTransform: "uppercase",
          textAlign: "center",
          marginBottom: "0.75rem",
        }}
      >
        YOUR EARNINGS
      </motion.p>
      <motion.h2
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        transition={{ delay: 0.1 }}
        style={{
          fontFamily: '"EB Garamond", Garamond, Georgia, serif',
          fontSize: "clamp(1.6rem, 3.5vw, 2.4rem)",
          fontWeight: 400,
          textAlign: "center",
          color: "#F5E6C8",
          marginBottom: "0.75rem",
        }}
      >
        You keep 85%. We keep the lights on.
      </motion.h2>
      <motion.p
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        transition={{ delay: 0.15 }}
        style={{
          fontFamily: '"EB Garamond", Garamond, Georgia, serif',
          fontSize: "1rem",
          fontStyle: "italic",
          color: "rgba(245,230,200,0.35)",
          textAlign: "center",
          maxWidth: "480px",
          margin: "0 auto 3rem",
        }}
      >
        Every reader subscribes to you — not the platform. Tintaxis takes a flat 15% and a $7/month platform fee. No hidden cuts. Here is exactly what 10 readers at each tier puts in your pocket.
      </motion.p>

      {/* Per-tier cards */}
      <div style={{ display: "flex", flexDirection: "column", gap: "1rem", marginBottom: "2rem" }}>
        {EARNINGS_TIERS.map((t, i) => {
          const readers = 10;
          const totalRevenue = +(t.price * readers).toFixed(2);
          const tintaxisCut = +(totalRevenue * 0.15).toFixed(2);
          const writerEarns = +(totalRevenue * 0.85).toFixed(2);
          const barWidth = Math.round((writerEarns / (9.99 * 10 * 0.85)) * 100);

          return (
            <motion.div
              key={t.tier}
              initial={{ opacity: 0, x: -16 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: i * 0.08 }}
              style={{
                border: "1px solid rgba(201,168,76,0.12)",
                padding: "1.5rem 1.75rem",
                position: "relative",
                background: "rgba(255,255,255,0.01)",
              }}
            >
              <CornerAccents />

              {/* Tier header row */}
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "0.6rem", flexWrap: "wrap", gap: "0.5rem" }}>
                <div>
                  <p style={{
                    fontFamily: '"JetBrains Mono", monospace',
                    fontSize: "0.75rem",
                    letterSpacing: "0.25em",
                    color: t.accent,
                    textTransform: "uppercase",
                    marginBottom: "0.2rem",
                  }}>
                    {readers} Readers · {t.tier} Tier
                  </p>
                  <p style={{
                    fontFamily: '"EB Garamond", Garamond, Georgia, serif',
                    fontSize: "1.05rem",
                    fontStyle: "italic",
                    color: "rgba(245,230,200,0.35)",
                    maxWidth: "320px",
                  }}>
                    {t.description}
                  </p>
                </div>
                <div style={{ textAlign: "right" }}>
                  <p style={{
                    fontFamily: '"JetBrains Mono", monospace',
                    fontSize: "0.75rem",
                    letterSpacing: "0.15em",
                    color: "rgba(245,230,200,0.3)",
                    textTransform: "uppercase",
                    marginBottom: "0.15rem",
                  }}>
                    ${t.price.toFixed(2)}/mo × {readers}
                  </p>
                  <p style={{
                    fontFamily: '"EB Garamond", Garamond, Georgia, serif',
                    fontSize: "1.1rem",
                    color: "rgba(245,230,200,0.55)",
                  }}>
                    ${totalRevenue.toFixed(2)}/mo total
                  </p>
                </div>
              </div>

              {/* Visual earnings bar */}
              <div style={{
                position: "relative",
                height: "28px",
                background: "rgba(201,168,76,0.06)",
                border: "1px solid rgba(201,168,76,0.08)",
                marginBottom: "0.75rem",
                overflow: "hidden",
              }}>
                {/* Writer share (85%) */}
                <div style={{
                  position: "absolute",
                  left: 0,
                  top: 0,
                  bottom: 0,
                  width: "85%",
                  background: `linear-gradient(90deg, rgba(0,229,204,0.15), rgba(0,229,204,0.25))`,
                  borderRight: "1px solid rgba(0,229,204,0.4)",
                  display: "flex",
                  alignItems: "center",
                  paddingLeft: "0.6rem",
                }}>
                  <span style={{
                    fontFamily: '"JetBrains Mono", monospace',
                    fontSize: "0.75rem",
                    letterSpacing: "0.1em",
                    color: "rgba(0,229,204,0.9)",
                  }}>
                    YOU: ${writerEarns.toFixed(2)}
                  </span>
                </div>
                {/* Tintaxis share (15%) */}
                <div style={{
                  position: "absolute",
                  right: 0,
                  top: 0,
                  bottom: 0,
                  width: "15%",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}>
                  <span style={{
                    fontFamily: '"JetBrains Mono", monospace',
                    fontSize: "0.75rem",
                    letterSpacing: "0.05em",
                    color: "rgba(245,230,200,0.25)",
                  }}>
                    ${tintaxisCut.toFixed(2)}
                  </span>
                </div>
              </div>

              {/* Bottom summary */}
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
                <p style={{
                  fontFamily: '"JetBrains Mono", monospace',
                  fontSize: "0.75rem",
                  color: "rgba(245,230,200,0.25)",
                  letterSpacing: "0.1em",
                }}>
                  TINTAXIS KEEPS ${tintaxisCut.toFixed(2)} (15%)
                </p>
                <p style={{
                  fontFamily: '"EB Garamond", Garamond, Georgia, serif',
                  fontSize: "1.3rem",
                  color: "rgba(0,229,204,0.85)",
                }}>
                  You earn <strong>${writerEarns.toFixed(2)}</strong>/mo
                </p>
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Combined scenario */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.5, delay: 0.3 }}
        style={{
          border: "1px solid rgba(0,229,204,0.25)",
          padding: "1.75rem",
          position: "relative",
          background: "rgba(0,229,204,0.02)",
          marginBottom: "1.5rem",
        }}
      >
        <CornerAccents color="rgba(0,229,204,0.3)" />
        <p style={{
          fontFamily: '"JetBrains Mono", monospace',
          fontSize: "0.75rem",
          letterSpacing: "0.25em",
          color: "rgba(0,229,204,0.6)",
          textTransform: "uppercase",
          marginBottom: "0.75rem",
          textAlign: "center",
        }}>
          ALL TIERS COMBINED · 40 READERS TOTAL
        </p>
        <p style={{
          fontFamily: '"EB Garamond", Garamond, Georgia, serif',
          fontSize: "0.9rem",
          color: "rgba(245,230,200,0.4)",
          textAlign: "center",
          marginBottom: "1rem",
          fontStyle: "italic",
        }}>
          10 Codex + 10 Scribe + 10 Archive + 10 Chronicler readers, on a Manuscript plan ($7/mo):
        </p>
        <div style={{ display: "flex", justifyContent: "center", alignItems: "baseline", gap: "1.5rem", flexWrap: "wrap" }}>
          <div style={{ textAlign: "center" }}>
            <p style={{ fontFamily: '"JetBrains Mono", monospace', fontSize: "0.75rem", color: "rgba(245,230,200,0.3)", textTransform: "uppercase", letterSpacing: "0.15em", marginBottom: "0.2rem" }}>
              Reader revenue
            </p>
            <p style={{ fontFamily: '"EB Garamond", Garamond, Georgia, serif', fontSize: "1.1rem", color: "rgba(245,230,200,0.55)" }}>$239.60</p>
          </div>
          <div style={{ textAlign: "center" }}>
            <p style={{ fontFamily: '"JetBrains Mono", monospace', fontSize: "0.75rem", color: "rgba(245,230,200,0.3)", textTransform: "uppercase", letterSpacing: "0.15em", marginBottom: "0.2rem" }}>
              Tintaxis cut + fee
            </p>
            <p style={{ fontFamily: '"EB Garamond", Garamond, Georgia, serif', fontSize: "1.1rem", color: "rgba(214,83,60,0.6)" }}>−$42.94</p>
          </div>
          <div style={{ textAlign: "center" }}>
            <p style={{ fontFamily: '"JetBrains Mono", monospace', fontSize: "0.75rem", color: "rgba(0,229,204,0.6)", textTransform: "uppercase", letterSpacing: "0.15em", marginBottom: "0.2rem" }}>
              YOU TAKE HOME
            </p>
            <p style={{ fontFamily: '"EB Garamond", Garamond, Georgia, serif', fontSize: "2rem", fontWeight: 400, color: "rgba(0,229,204,0.9)" }}>$196.66</p>
          </div>
        </div>
      </motion.div>

      <motion.p
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        transition={{ delay: 0.4 }}
        style={{
          fontFamily: '"EB Garamond", Garamond, Georgia, serif',
          fontSize: "1.05rem",
          fontStyle: "italic",
          color: "rgba(245,230,200,0.3)",
          textAlign: "center",
        }}
      >
        Your readers pay you directly. No middlemen. No algorithms. Build your audience and your income grows with it.
      </motion.p>
    </>
  );
}

// ─── MAIN PAGE ─────────────────────────────────────────────────────────────────
export default function PublishClient() {
  const formRef = useRef<HTMLDivElement>(null);
  const [form, setForm] = useState<FormState>({
    name: "",
    email: "",
    bookTitle: "",
    genre: "",
    wordCount: "",
    synopsis: "",
    whyTintaxis: "",
    chapterFile: null,
  });
  const [submitStatus, setSubmitStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [errorMsg, setErrorMsg] = useState("");
  const [expeditedLoading, setExpeditedLoading] = useState(false);
  const searchParams = useSearchParams();
  const expeditedStatus = searchParams.get("expedited"); // "success" | "cancelled"

  const scrollToForm = () => {
    formRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  const set = (field: keyof FormState) => (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => setForm((prev) => ({ ...prev, [field]: e.target.value }));

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setSubmitStatus("loading");
    setErrorMsg("");
    try {
      const fd = new FormData();
      fd.append("name", form.name);
      fd.append("email", form.email);
      fd.append("bookTitle", form.bookTitle);
      fd.append("genre", form.genre);
      if (form.wordCount) fd.append("wordCount", form.wordCount);
      fd.append("synopsis", form.synopsis);
      fd.append("whyTintaxis", form.whyTintaxis);
      if (form.chapterFile) fd.append("chapterFile", form.chapterFile);

      const res = await fetch("/api/apply", {
        method: "POST",
        body: fd,
      });
      if (res.ok) {
        setSubmitStatus("success");
        setForm({ name: "", email: "", bookTitle: "", genre: "", wordCount: "", synopsis: "", whyTintaxis: "", chapterFile: null });
      } else {
        const data = await res.json();
        setErrorMsg(data.error ?? "Submission failed. Try again.");
        setSubmitStatus("error");
      }
    } catch {
      setErrorMsg("Connection failed. Try again.");
      setSubmitStatus("error");
    }
  };

  const handleExpedited = async () => {
    if (!form.name || !form.email || !form.bookTitle || !form.chapterFile) {
      setErrorMsg("Name, email, book title, and chapter file are required.");
      setSubmitStatus("error");
      return;
    }
    setExpeditedLoading(true);
    setErrorMsg("");
    try {
      const fd = new FormData();
      fd.append("name", form.name);
      fd.append("email", form.email);
      fd.append("bookTitle", form.bookTitle);
      fd.append("genre", form.genre);
      if (form.wordCount) fd.append("wordCount", form.wordCount);
      fd.append("synopsis", form.synopsis);
      fd.append("whyTintaxis", form.whyTintaxis);
      if (form.chapterFile) fd.append("chapterFile", form.chapterFile);

      const res = await fetch("/api/apply/expedited", {
        method: "POST",
        body: fd,
      });
      const data = await res.json();
      if (res.ok && data.url) {
        // Also send the standard application email so you have the chapter on file
        const stdFd = new FormData();
        stdFd.append("name", form.name);
        stdFd.append("email", form.email);
        stdFd.append("bookTitle", form.bookTitle);
        stdFd.append("genre", form.genre);
        if (form.wordCount) stdFd.append("wordCount", form.wordCount);
        stdFd.append("synopsis", form.synopsis);
        stdFd.append("whyTintaxis", form.whyTintaxis);
        if (form.chapterFile) stdFd.append("chapterFile", form.chapterFile);
        stdFd.append("expedited", "true");
        await fetch("/api/apply", { method: "POST", body: stdFd });

        // Redirect to Stripe
        window.location.href = data.url;
      } else {
        setErrorMsg(data.error ?? "Failed to start expedited checkout.");
        setExpeditedLoading(false);
      }
    } catch {
      setErrorMsg("Connection failed. Try again.");
      setExpeditedLoading(false);
    }
  };

  const inputStyle: React.CSSProperties = {
    width: "100%",
    background: "rgba(255,255,255,0.03)",
    border: "1px solid rgba(201,168,76,0.15)",
    padding: "0.65rem 0.85rem",
    color: "#F5E6C8",
    fontFamily: '"JetBrains Mono", monospace',
    fontSize: "0.9rem",
    outline: "none",
    borderRadius: "1px",
    boxSizing: "border-box" as const,
  };

  const labelStyle: React.CSSProperties = {
    fontFamily: '"JetBrains Mono", monospace',
    fontSize: "0.75rem",
    letterSpacing: "0.2em",
    color: "rgba(245,230,200,0.35)",
    textTransform: "uppercase",
    display: "block",
    marginBottom: "0.4rem",
  };

  return (
    <div style={{ minHeight: "100vh", backgroundColor: "#0D0B08", color: "#F5E6C8" }}>
      {/* Expedited payment banner */}
      {expeditedStatus === "success" && (
        <div style={{
          position: "fixed", top: 0, left: 0, right: 0, zIndex: 100,
          background: "rgba(0,180,100,0.9)",
          padding: "0.75rem 1.5rem",
          textAlign: "center",
          backdropFilter: "blur(4px)",
        }}>
          <p style={{
            fontFamily: '"JetBrains Mono", monospace',
            fontSize: "0.8rem",
            letterSpacing: "0.15em",
            color: "white",
            textTransform: "uppercase",
          }}>
            Payment received. Your application has been expedited.
          </p>
        </div>
      )}
      {expeditedStatus === "cancelled" && (
        <div style={{
          position: "fixed", top: 0, left: 0, right: 0, zIndex: 100,
          background: "rgba(200,80,40,0.85)",
          padding: "0.75rem 1.5rem",
          textAlign: "center",
          backdropFilter: "blur(4px)",
        }}>
          <p style={{
            fontFamily: '"JetBrains Mono", monospace',
            fontSize: "0.8rem",
            letterSpacing: "0.15em",
            color: "white",
            textTransform: "uppercase",
          }}>
            Payment cancelled. Your standard application was still submitted.
          </p>
        </div>
      )}
      {/* Background glow */}
      <div
        style={{
          position: "fixed",
          inset: 0,
          pointerEvents: "none",
          background:
            "radial-gradient(ellipse at 50% 0%, rgba(44,26,0,0.35) 0%, transparent 60%)",
          zIndex: 0,
        }}
      />

      <div style={{ position: "relative", zIndex: 1 }}>
        {/* ── HERO ──────────────────────────────────────────────────────────── */}
        <section
          style={{
            minHeight: "100vh",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            textAlign: "center",
            padding: "8rem 2rem 4rem",
          }}
        >
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.9, ease: [0.2, 0, 0.1, 1] }}
            style={{ maxWidth: "720px" }}
          >
            <p
              style={{
                fontFamily: '"JetBrains Mono", monospace',
                fontSize: "0.75rem",
                letterSpacing: "0.4em",
                color: "rgba(201,168,76,0.4)",
                textTransform: "uppercase",
                marginBottom: "2rem",
              }}
            >
              TINTAXIS · AUTHOR PLATFORM
            </p>

            <h1
              style={{
                fontFamily: '"EB Garamond", Garamond, Georgia, serif',
                fontSize: "clamp(2.8rem, 7vw, 5.5rem)",
                fontWeight: 400,
                lineHeight: 1.1,
                letterSpacing: "-0.01em",
                color: "#F5E6C8",
                marginBottom: "1rem",
              }}
            >
              Your book.
              <br />
              <em style={{ color: "rgba(201,168,76,0.85)" }}>Alive.</em>
            </h1>

            <p
              style={{
                fontFamily: '"EB Garamond", Garamond, Georgia, serif',
                fontSize: "1.25rem",
                lineHeight: 1.8,
                color: "rgba(245,230,200,0.5)",
                fontStyle: "italic",
                maxWidth: "520px",
                margin: "0 auto 3rem",
              }}
            >
              Tintaxis is where authors publish prose that breathes — annotated, questioned,
              visualized, and read the way it was meant to be read.
            </p>

            <div style={{ display: "flex", gap: "1rem", justifyContent: "center", flexWrap: "wrap" }}>
              <motion.button
                onClick={scrollToForm}
                whileHover={{ borderColor: "rgba(201,168,76,0.8)", boxShadow: "0 0 24px rgba(201,168,76,0.12)" }}
                whileTap={{ scale: 0.98 }}
                style={{
                  fontFamily: '"JetBrains Mono", monospace',
                  fontSize: "0.9rem",
                  letterSpacing: "0.25em",
                  textTransform: "uppercase",
                  color: "#C9A84C",
                  background: "transparent",
                  border: "1px solid rgba(201,168,76,0.4)",
                  padding: "0.9rem 2rem",
                  cursor: "pointer",
                }}
              >
                Apply as Author
              </motion.button>
              <a href="/" style={{ textDecoration: "none" }}>
                <motion.button
                  whileHover={{ borderColor: "rgba(201,168,76,0.3)" }}
                  style={{
                    fontFamily: '"JetBrains Mono", monospace',
                    fontSize: "0.9rem",
                    letterSpacing: "0.25em",
                    textTransform: "uppercase",
                    color: "rgba(245,230,200,0.3)",
                    background: "transparent",
                    border: "1px solid rgba(201,168,76,0.1)",
                    padding: "0.9rem 2rem",
                    cursor: "pointer",
                  }}
                >
                  Read the Archive
                </motion.button>
              </a>
            </div>
          </motion.div>

          {/* Scroll indicator */}
          <motion.div
            animate={{ y: [0, 6, 0] }}
            transition={{ repeat: Infinity, duration: 2.5, ease: "easeInOut" }}
            style={{
              position: "absolute",
              bottom: "2.5rem",
              fontFamily: '"JetBrains Mono", monospace',
              fontSize: "0.75rem",
              letterSpacing: "0.3em",
              color: "rgba(201,168,76,0.2)",
              textTransform: "uppercase",
            }}
          >
            ↓ CONTINUE
          </motion.div>
        </section>

        <BrassRule opacity={0.15} />

        {/* ── WHAT IS TINTAXIS ─────────────────────────────────────────────── */}
        <section style={{ maxWidth: "800px", margin: "0 auto", padding: "4rem 2rem" }}>
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7 }}
            style={{ textAlign: "center" }}
          >
            <p
              style={{
                fontFamily: '"JetBrains Mono", monospace',
                fontSize: "0.75rem",
                letterSpacing: "0.35em",
                color: "rgba(201,168,76,0.4)",
                textTransform: "uppercase",
                marginBottom: "1.5rem",
              }}
            >
              THE PLATFORM
            </p>
            <h2
              style={{
                fontFamily: '"EB Garamond", Garamond, Georgia, serif',
                fontSize: "clamp(1.8rem, 4vw, 2.8rem)",
                fontWeight: 400,
                color: "rgba(245,230,200,0.85)",
                marginBottom: "2rem",
                lineHeight: 1.3,
              }}
            >
              Literature has never been interactive.
              <br />
              <em style={{ color: "rgba(201,168,76,0.7)" }}>Until now.</em>
            </h2>
            <p
              style={{
                fontFamily: '"EB Garamond", Garamond, Georgia, serif',
                fontSize: "1.1rem",
                lineHeight: 1.85,
                color: "rgba(245,230,200,0.5)",
                fontStyle: "italic",
                marginBottom: "1.5rem",
              }}
            >
              Tintaxis is not a blog platform. It is not a self-publishing tool. It is a reading
              environment — built for prose that deserves more than a scroll. Your chapters live
              here in a typographically precise, atmospherically scored reading surface, with
              tools that let readers go deeper and authors respond in kind.
            </p>
            <p
              style={{
                fontFamily: '"EB Garamond", Garamond, Georgia, serif',
                fontSize: "1.1rem",
                lineHeight: 1.85,
                color: "rgba(245,230,200,0.5)",
                fontStyle: "italic",
              }}
            >
              We accept fiction, creative nonfiction, and hybrid works by application only.
              Every accepted author joins a curated archive — not a feed.
            </p>
          </motion.div>
        </section>

        <BrassRule opacity={0.12} />

        {/* ── FEATURES ─────────────────────────────────────────────────────── */}
        <section style={{ maxWidth: "1100px", margin: "0 auto", padding: "4rem 2rem" }}>
          <motion.p
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            style={{
              fontFamily: '"JetBrains Mono", monospace',
              fontSize: "0.75rem",
              letterSpacing: "0.35em",
              color: "rgba(201,168,76,0.4)",
              textTransform: "uppercase",
              textAlign: "center",
              marginBottom: "3rem",
            }}
          >
            THE SIX INSTRUMENTS
          </motion.p>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
              gap: "1.25rem",
            }}
          >
            {FEATURES.map((f, i) => (
              <FeatureCard key={f.id} feature={f} index={i} />
            ))}
          </div>
        </section>

        <BrassRule opacity={0.12} />

        {/* ── PROOF OF CONCEPT ─────────────────────────────────────────────── */}
        <section style={{ maxWidth: "800px", margin: "0 auto", padding: "4rem 2rem", textAlign: "center" }}>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <p
              style={{
                fontFamily: '"JetBrains Mono", monospace',
                fontSize: "0.75rem",
                letterSpacing: "0.35em",
                color: "rgba(201,168,76,0.4)",
                textTransform: "uppercase",
                marginBottom: "1.5rem",
              }}
            >
              LIVE ON TINTAXIS
            </p>
            <div
              style={{
                border: "1px solid rgba(201,168,76,0.2)",
                padding: "2.5rem",
                position: "relative",
                marginBottom: "2rem",
              }}
            >
              <CornerAccents />
              <p
                style={{
                  fontFamily: '"JetBrains Mono", monospace',
                  fontSize: "0.75rem",
                  letterSpacing: "0.2em",
                  color: "rgba(201,168,76,0.4)",
                  textTransform: "uppercase",
                  marginBottom: "1rem",
                }}
              >
                INAUGURAL WORK
              </p>
              <h3
                style={{
                  fontFamily: '"EB Garamond", Garamond, Georgia, serif',
                  fontSize: "1.8rem",
                  fontWeight: 400,
                  color: "#F5E6C8",
                  marginBottom: "0.5rem",
                }}
              >
                The Hunt
              </h3>
              <p
                style={{
                  fontFamily: '"EB Garamond", Garamond, Georgia, serif',
                  fontSize: "1.05rem",
                  fontStyle: "italic",
                  color: "rgba(245,230,200,0.4)",
                  marginBottom: "1.25rem",
                }}
              >
                A novella by Chico Montecristi
              </p>
              <p
                style={{
                  fontFamily: '"EB Garamond", Garamond, Georgia, serif',
                  fontSize: "1rem",
                  lineHeight: 1.75,
                  color: "rgba(245,230,200,0.5)",
                  fontStyle: "italic",
                  maxWidth: "480px",
                  margin: "0 auto 1.75rem",
                }}
              >
                "Dark psychological thriller. Southern Gothic noir. A girl who killed her mother,
                a father who covered for her, and a small town that never knew."
              </p>
              <a href="/" style={{ textDecoration: "none" }}>
                <motion.span
                  whileHover={{ color: "rgba(201,168,76,0.9)" }}
                  style={{
                    fontFamily: '"JetBrains Mono", monospace',
                    fontSize: "0.75rem",
                    letterSpacing: "0.25em",
                    color: "rgba(201,168,76,0.5)",
                    textTransform: "uppercase",
                    cursor: "pointer",
                  }}
                >
                  Read Chapter One →
                </motion.span>
              </a>
            </div>
          </motion.div>
        </section>

        <BrassRule opacity={0.12} />

        {/* ── PRICING ──────────────────────────────────────────────────────── */}
        <section style={{ maxWidth: "900px", margin: "0 auto", padding: "4rem 2rem" }}>
          <motion.p
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            style={{
              fontFamily: '"JetBrains Mono", monospace',
              fontSize: "0.75rem",
              letterSpacing: "0.35em",
              color: "rgba(201,168,76,0.4)",
              textTransform: "uppercase",
              textAlign: "center",
              marginBottom: "0.75rem",
            }}
          >
            AUTHOR PLANS
          </motion.p>
          <motion.p
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            style={{
              fontFamily: '"EB Garamond", Garamond, Georgia, serif',
              fontSize: "1rem",
              fontStyle: "italic",
              color: "rgba(245,230,200,0.35)",
              textAlign: "center",
              marginBottom: "3rem",
            }}
          >
            All plans are billed monthly. Cancel anytime. Acceptance required.
          </motion.p>
          <div className="pricing-plans-row" style={{ display: "flex", gap: "1.25rem", flexWrap: "wrap", justifyContent: "center", alignItems: "flex-start" }}>
            {PLANS.map((plan) => (
              <PricingCard key={plan.id} plan={plan} onSelect={scrollToForm} />
            ))}
          </div>
        </section>

        <BrassRule opacity={0.12} />

        {/* ── YOUR EARNINGS — WRITER TRANSPARENCY ─────────────────────────── */}
        <section style={{ maxWidth: "900px", margin: "0 auto", padding: "4rem 2rem 2rem" }}>
          <WriterEarningsBreakdown />
        </section>

        <BrassRule opacity={0.12} />

        {/* ── APPLICATION FORM ─────────────────────────────────────────────── */}
        <section
          ref={formRef}
          style={{ maxWidth: "660px", margin: "0 auto", padding: "4rem 2rem 8rem" }}
        >
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <p
              style={{
                fontFamily: '"JetBrains Mono", monospace',
                fontSize: "0.75rem",
                letterSpacing: "0.35em",
                color: "rgba(201,168,76,0.4)",
                textTransform: "uppercase",
                textAlign: "center",
                marginBottom: "0.75rem",
              }}
            >
              AUTHOR APPLICATION
            </p>
            <p
              style={{
                fontFamily: '"EB Garamond", Garamond, Georgia, serif',
                fontSize: "1rem",
                fontStyle: "italic",
                color: "rgba(245,230,200,0.35)",
                textAlign: "center",
                marginBottom: "2.5rem",
              }}
            >
              Applications are reviewed personally. We respond within 5 business days.
            </p>

            <div
              style={{
                border: "1px solid rgba(201,168,76,0.18)",
                padding: "2.5rem",
                position: "relative",
              }}
            >
              <CornerAccents />

              <AnimatePresence mode="wait">
                {submitStatus === "success" ? (
                  <motion.div
                    key="success"
                    initial={{ opacity: 0, scale: 0.97 }}
                    animate={{ opacity: 1, scale: 1 }}
                    style={{ textAlign: "center", padding: "2rem 0" }}
                  >
                    <div
                      style={{
                        fontFamily: '"JetBrains Mono", monospace',
                        fontSize: "1.5rem",
                        color: "rgba(201,168,76,0.6)",
                        marginBottom: "1rem",
                      }}
                    >
                      ◆
                    </div>
                    <p
                      style={{
                        fontFamily: '"EB Garamond", Garamond, Georgia, serif',
                        fontSize: "1.3rem",
                        color: "rgba(245,230,200,0.8)",
                        marginBottom: "0.75rem",
                      }}
                    >
                      Application received.
                    </p>
                    <p
                      style={{
                        fontFamily: '"EB Garamond", Garamond, Georgia, serif',
                        fontSize: "1.05rem",
                        fontStyle: "italic",
                        color: "rgba(245,230,200,0.4)",
                      }}
                    >
                      We'll be in touch within 5 business days. Thank you for writing.
                    </p>
                  </motion.div>
                ) : (
                  <motion.form key="form" onSubmit={handleSubmit}>
                    {/* Row: Name + Email */}
                    <div
                      style={{
                        display: "grid",
                        gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
                        gap: "1rem",
                        marginBottom: "1rem",
                      }}
                    >
                      <div>
                        <label style={labelStyle}>Name</label>
                        <input
                          type="text"
                          value={form.name}
                          onChange={set("name")}
                          required
                          style={inputStyle}
                          onFocus={(e) => (e.target.style.borderColor = "rgba(201,168,76,0.4)")}
                          onBlur={(e) => (e.target.style.borderColor = "rgba(201,168,76,0.15)")}
                        />
                      </div>
                      <div>
                        <label style={labelStyle}>Email</label>
                        <input
                          type="email"
                          value={form.email}
                          onChange={set("email")}
                          required
                          style={inputStyle}
                          onFocus={(e) => (e.target.style.borderColor = "rgba(201,168,76,0.4)")}
                          onBlur={(e) => (e.target.style.borderColor = "rgba(201,168,76,0.15)")}
                        />
                      </div>
                    </div>

                    {/* Book Title */}
                    <div style={{ marginBottom: "1rem" }}>
                      <label style={labelStyle}>Book Title</label>
                      <input
                        type="text"
                        value={form.bookTitle}
                        onChange={set("bookTitle")}
                        required
                        style={inputStyle}
                        onFocus={(e) => (e.target.style.borderColor = "rgba(201,168,76,0.4)")}
                        onBlur={(e) => (e.target.style.borderColor = "rgba(201,168,76,0.15)")}
                      />
                    </div>

                    {/* Row: Genre + Word Count */}
                    <div
                      style={{
                        display: "grid",
                        gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
                        gap: "1rem",
                        marginBottom: "1rem",
                      }}
                    >
                      <div>
                        <label style={labelStyle}>Genre</label>
                        <select
                          value={form.genre}
                          onChange={set("genre")}
                          style={{
                            ...inputStyle,
                            appearance: "none" as const,
                          }}
                          onFocus={(e) => (e.target.style.borderColor = "rgba(201,168,76,0.4)")}
                          onBlur={(e) => (e.target.style.borderColor = "rgba(201,168,76,0.15)")}
                        >
                          <option value="">Select…</option>
                          <option>Literary Fiction</option>
                          <option>Thriller / Noir</option>
                          <option>Creative Nonfiction</option>
                          <option>Memoir</option>
                          <option>Novella</option>
                          <option>Short Story Collection</option>
                          <option>Poetry</option>
                          <option>Hybrid / Experimental</option>
                          <option>Other</option>
                        </select>
                      </div>
                      <div>
                        <label style={labelStyle}>Word Count</label>
                        <input
                          type="number"
                          value={form.wordCount}
                          onChange={set("wordCount")}
                          placeholder="e.g. 25000"
                          style={inputStyle}
                          onFocus={(e) => (e.target.style.borderColor = "rgba(201,168,76,0.4)")}
                          onBlur={(e) => (e.target.style.borderColor = "rgba(201,168,76,0.15)")}
                        />
                      </div>
                    </div>

                    {/* Synopsis */}
                    <div style={{ marginBottom: "1rem" }}>
                      <label style={labelStyle}>Synopsis</label>
                      <textarea
                        value={form.synopsis}
                        onChange={set("synopsis")}
                        rows={4}
                        placeholder="What is your book about? (100–300 words)"
                        style={{
                          ...inputStyle,
                          resize: "vertical" as const,
                          lineHeight: 1.6,
                        }}
                        onFocus={(e) => (e.target.style.borderColor = "rgba(201,168,76,0.4)")}
                        onBlur={(e) => (e.target.style.borderColor = "rgba(201,168,76,0.15)")}
                      />
                    </div>

                    {/* Why Tintaxis */}
                    <div style={{ marginBottom: "2rem" }}>
                      <label style={labelStyle}>Why Tintaxis?</label>
                      <textarea
                        value={form.whyTintaxis}
                        onChange={set("whyTintaxis")}
                        rows={3}
                        placeholder="Why does your work belong here?"
                        style={{
                          ...inputStyle,
                          resize: "vertical" as const,
                          lineHeight: 1.6,
                        }}
                        onFocus={(e) => (e.target.style.borderColor = "rgba(201,168,76,0.4)")}
                        onBlur={(e) => (e.target.style.borderColor = "rgba(201,168,76,0.15)")}
                      />
                    </div>

                    {/* Chapter Upload */}
                    <div style={{ marginBottom: "2rem" }}>
                      <label style={labelStyle}>First Chapter (Required)</label>
                      <p
                        style={{
                          fontFamily: '"EB Garamond", Garamond, Georgia, serif',
                          fontSize: "1.05rem",
                          fontStyle: "italic",
                          color: "rgba(245,230,200,0.3)",
                          marginBottom: "0.75rem",
                          lineHeight: 1.6,
                        }}
                      >
                        Upload the first chapter of your work. This is how we evaluate your prose.
                      </p>
                      <label
                        style={{
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          gap: "0.75rem",
                          width: "100%",
                          padding: "1.25rem",
                          border: form.chapterFile
                            ? "1px solid rgba(201,168,76,0.4)"
                            : "1px dashed rgba(201,168,76,0.2)",
                          background: form.chapterFile
                            ? "rgba(201,168,76,0.04)"
                            : "rgba(255,255,255,0.02)",
                          cursor: "pointer",
                          transition: "border-color 0.2s, background 0.2s",
                        }}
                        onMouseEnter={(e) => {
                          if (!form.chapterFile) {
                            e.currentTarget.style.borderColor = "rgba(201,168,76,0.35)";
                          }
                        }}
                        onMouseLeave={(e) => {
                          if (!form.chapterFile) {
                            e.currentTarget.style.borderColor = "rgba(201,168,76,0.2)";
                          }
                        }}
                      >
                        <span
                          style={{
                            fontFamily: '"JetBrains Mono", monospace',
                            fontSize: "1.2rem",
                            color: form.chapterFile
                              ? "rgba(201,168,76,0.7)"
                              : "rgba(201,168,76,0.3)",
                          }}
                        >
                          {form.chapterFile ? "◆" : "◇"}
                        </span>
                        <span
                          style={{
                            fontFamily: '"JetBrains Mono", monospace',
                            fontSize: "1.05rem",
                            letterSpacing: "0.1em",
                            color: form.chapterFile
                              ? "rgba(245,230,200,0.7)"
                              : "rgba(245,230,200,0.35)",
                          }}
                        >
                          {form.chapterFile
                            ? form.chapterFile.name
                            : "Click to upload — .docx, .pdf, or .txt (max 4 MB)"}
                        </span>
                        <input
                          type="file"
                          accept=".docx,.pdf,.txt,.md,.rtf"
                          style={{ display: "none" }}
                          onChange={(e) => {
                            const file = e.target.files?.[0] ?? null;
                            if (file && file.size > 4 * 1024 * 1024) {
                              setErrorMsg("File must be under 4 MB.");
                              setSubmitStatus("error");
                              return;
                            }
                            setForm((prev) => ({ ...prev, chapterFile: file }));
                          }}
                        />
                      </label>
                    </div>

                    {/* Error */}
                    {submitStatus === "error" && (
                      <motion.p
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        style={{
                          fontFamily: '"JetBrains Mono", monospace',
                          fontSize: "0.9rem",
                          letterSpacing: "0.1em",
                          color: "rgba(192,57,43,0.8)",
                          marginBottom: "1rem",
                          textAlign: "center",
                        }}
                      >
                        {errorMsg}
                      </motion.p>
                    )}

                    {/* Submit */}
                    <motion.button
                      type="submit"
                      disabled={submitStatus === "loading"}
                      whileHover={
                        submitStatus !== "loading"
                          ? { borderColor: "rgba(201,168,76,0.7)", boxShadow: "0 0 20px rgba(201,168,76,0.1)" }
                          : {}
                      }
                      whileTap={submitStatus !== "loading" ? { scale: 0.98 } : {}}
                      style={{
                        width: "100%",
                        fontFamily: '"JetBrains Mono", monospace',
                        fontSize: "0.9rem",
                        letterSpacing: "0.25em",
                        textTransform: "uppercase",
                        color: submitStatus === "loading" ? "rgba(201,168,76,0.4)" : "#C9A84C",
                        background: "transparent",
                        border: "1px solid rgba(201,168,76,0.35)",
                        padding: "0.85rem",
                        cursor: submitStatus === "loading" ? "not-allowed" : "pointer",
                      }}
                    >
                      {submitStatus === "loading" ? "TRANSMITTING..." : "SUBMIT APPLICATION"}
                    </motion.button>
                    <p style={{
                      fontFamily: '"EB Garamond", Garamond, Georgia, serif',
                      fontSize: "0.85rem",
                      fontStyle: "italic",
                      color: "rgba(245,230,200,0.25)",
                      textAlign: "center",
                      lineHeight: 1.5,
                      marginTop: "0.4rem",
                    }}>
                      Standard review — 2–3 weeks
                    </p>

                    {/* Divider */}
                    <div style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "1rem",
                      margin: "1.25rem 0",
                    }}>
                      <div style={{ flex: 1, height: "1px", background: "rgba(201,168,76,0.12)" }} />
                      <span style={{
                        fontFamily: '"JetBrains Mono", monospace',
                        fontSize: "0.7rem",
                        letterSpacing: "0.2em",
                        color: "rgba(201,168,76,0.3)",
                        textTransform: "uppercase",
                      }}>
                        OR
                      </span>
                      <div style={{ flex: 1, height: "1px", background: "rgba(201,168,76,0.12)" }} />
                    </div>

                    {/* Expedited */}
                    <motion.button
                      type="button"
                      onClick={handleExpedited}
                      disabled={expeditedLoading || submitStatus === "loading"}
                      whileHover={
                        !expeditedLoading
                          ? { borderColor: "rgba(0,229,204,0.6)", boxShadow: "0 0 20px rgba(0,229,204,0.08)" }
                          : {}
                      }
                      whileTap={!expeditedLoading ? { scale: 0.98 } : {}}
                      style={{
                        width: "100%",
                        fontFamily: '"JetBrains Mono", monospace',
                        fontSize: "0.85rem",
                        letterSpacing: "0.2em",
                        textTransform: "uppercase",
                        color: expeditedLoading ? "rgba(0,229,204,0.4)" : "rgba(0,229,204,0.85)",
                        background: "transparent",
                        border: "1px solid rgba(0,229,204,0.25)",
                        padding: "0.85rem",
                        cursor: expeditedLoading ? "not-allowed" : "pointer",
                        marginBottom: "0.5rem",
                      }}
                    >
                      {expeditedLoading ? "REDIRECTING TO PAYMENT..." : "EXPEDITED REVIEW · $0.25"}
                    </motion.button>
                    <p style={{
                      fontFamily: '"EB Garamond", Garamond, Georgia, serif',
                      fontSize: "0.85rem",
                      fontStyle: "italic",
                      color: "rgba(245,230,200,0.3)",
                      textAlign: "center",
                      lineHeight: 1.5,
                    }}>
                      Skip the queue. Response within 48–72 hours.
                    </p>

                    {/* Stripe trust badge */}
                    <div style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      gap: "0.5rem",
                      marginTop: "1.5rem",
                      paddingTop: "1rem",
                      borderTop: "1px solid rgba(201,168,76,0.08)",
                    }}>
                      <svg width="28" height="12" viewBox="0 0 60 25" fill="none" xmlns="http://www.w3.org/2000/svg" aria-label="Stripe">
                        <path d="M60 12.5C60 5.596 54.404 0 47.5 0h-35C5.596 0 0 5.596 0 12.5S5.596 25 12.5 25h35C54.404 25 60 19.404 60 12.5z" fill="rgba(201,168,76,0.15)"/>
                        <path d="M26.1 10.3c0-.9.7-1.3 1.9-1.3 1.7 0 3.8.5 5.5 1.4V5.7c-1.8-.7-3.7-1-5.5-1-4.5 0-7.5 2.3-7.5 6.2 0 6.1 8.4 5.1 8.4 7.7 0 1.1-.9 1.4-2.2 1.4-1.9 0-4.3-.8-6.2-1.8v4.8c2.1.9 4.2 1.3 6.2 1.3 4.6 0 7.7-2.3 7.7-6.2-.1-6.5-8.3-5.4-8.3-7.8zM13.3 2.5l-5.5 1.2V8H5.5v4h2.3v6.7c0 4.5 2.3 6 5.7 6 1.7 0 3-.3 3-.3v-4s-.7.1-1.4.1c-2 0-2.8-.8-2.8-2.7V12h2.8V8h-2.8V2.5h1zM44.2 4.7c-1.9 0-3.1.9-3.8 1.5l-.3-1.2h-4.8V24.3l5.5-1.2v-4.7c.7.5 1.7 1.2 3.3 1.2 3.4 0 6.5-2.7 6.5-8.7.1-5.5-3.1-8.5-6.4-6.2zm-1.1 13.1c-1.1 0-1.8-.4-2.2-.9v-7.2c.5-.5 1.2-1 2.3-1 1.7 0 2.9 1.9 2.9 4.5-.1 2.8-1.2 4.6-3 4.6z" fill="rgba(201,168,76,0.5)"/>
                      </svg>
                      <span style={{
                        fontFamily: '"JetBrains Mono", monospace',
                        fontSize: "0.6rem",
                        letterSpacing: "0.15em",
                        color: "rgba(201,168,76,0.3)",
                        textTransform: "uppercase",
                      }}>
                        Secure checkout · Powered by Stripe
                      </span>
                    </div>
                  </motion.form>
                )}
              </AnimatePresence>
            </div>
          </motion.div>
        </section>

        {/* ── FOOTER ───────────────────────────────────────────────────────── */}
        <footer
          style={{
            borderTop: "1px solid rgba(201,168,76,0.08)",
            padding: "2rem",
            textAlign: "center",
          }}
        >
          <p
            style={{
              fontFamily: '"JetBrains Mono", monospace',
              fontSize: "0.75rem",
              letterSpacing: "0.2em",
              color: "rgba(201,168,76,0.2)",
              textTransform: "uppercase",
            }}
          >
            TINTAXIS · CURATED LITERARY PLATFORM · tintaxis.vercel.app
          </p>
        </footer>
      </div>
    </div>
  );
}
