"use client";

import { useState, FormEvent, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useI18n } from "@/lib/i18n";

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
    headlineKey: "pub.feat.sixInks.title",
    bodyKey: "pub.feat.sixInks.desc",
  },
  {
    id: "signal",
    glyph: "◈",
    headlineKey: "pub.feat.signal.title",
    bodyKey: "pub.feat.signal.desc",
  },
  {
    id: "rain",
    glyph: "▓",
    headlineKey: "pub.feat.rain.title",
    bodyKey: "pub.feat.rain.desc",
  },
  {
    id: "whisper",
    glyph: "◇",
    headlineKey: "pub.feat.whisper.title",
    bodyKey: "pub.feat.whisper.desc",
  },
  {
    id: "archive",
    glyph: "⊞",
    headlineKey: "pub.feat.archive.title",
    bodyKey: "pub.feat.archive.desc",
  },
  {
    id: "readers",
    glyph: "◉",
    headlineKey: "pub.feat.readers.title",
    bodyKey: "pub.feat.readers.desc",
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
  const { t } = useI18n();
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
        {t(feature.headlineKey)}
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
        {t(feature.bodyKey)}
      </p>
    </motion.div>
  );
}

// ─── WRITER EARNINGS — NO FEES, PURE SPLIT ──────────────────────────────────
function WriterEarningsBreakdown() {
  const { t } = useI18n();
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
        HOW IT WORKS
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
        {t("pub.subtitle")}
      </motion.h2>
      <motion.p
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        transition={{ delay: 0.15 }}
        style={{
          fontFamily: '"EB Garamond", Garamond, Georgia, serif',
          fontSize: "1.1rem",
          fontStyle: "italic",
          color: "rgba(245,230,200,0.45)",
          textAlign: "center",
          maxWidth: "540px",
          margin: "0 auto 3rem",
          lineHeight: 1.7,
        }}
      >
        {t("pub.model")}
      </motion.p>

      {/* Visual split */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6 }}
        style={{
          border: "1px solid rgba(201,168,76,0.15)",
          padding: "2rem",
          position: "relative",
          background: "rgba(255,255,255,0.01)",
          marginBottom: "2rem",
        }}
      >
        <CornerAccents />

        {/* Revenue split bar — writer / platform / stripe */}
        <p style={{
          fontFamily: '"JetBrains Mono", monospace',
          fontSize: "0.6rem",
          letterSpacing: "0.15em",
          color: "rgba(245,230,200,0.25)",
          textAlign: "right",
          marginBottom: "0.35rem",
          textTransform: "uppercase",
        }}>
          {t("pub.afterStripe")}
        </p>
        <div style={{
          position: "relative",
          height: "36px",
          background: "rgba(201,168,76,0.06)",
          border: "1px solid rgba(201,168,76,0.08)",
          marginBottom: "1.5rem",
          overflow: "hidden",
          display: "flex",
        }}>
          <div style={{
            width: "70%",
            background: "linear-gradient(90deg, rgba(0,229,204,0.15), rgba(0,229,204,0.25))",
            borderRight: "1px solid rgba(0,229,204,0.4)",
            display: "flex",
            alignItems: "center",
            paddingLeft: "1rem",
          }}>
            <span style={{
              fontFamily: '"JetBrains Mono", monospace',
              fontSize: "0.8rem",
              letterSpacing: "0.1em",
              color: "rgba(0,229,204,0.9)",
            }}>
              {t("pub.youGet")}
            </span>
          </div>
          <div style={{
            width: "12%",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}>
            <span style={{
              fontFamily: '"JetBrains Mono", monospace',
              fontSize: "0.7rem",
              letterSpacing: "0.05em",
              color: "rgba(245,230,200,0.3)",
            }}>
              15%
            </span>
          </div>
          <div style={{
            width: "18%",
            background: "rgba(255,255,255,0.03)",
            borderLeft: "1px solid rgba(245,230,200,0.06)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}>
            <span style={{
              fontFamily: '"JetBrains Mono", monospace',
              fontSize: "0.6rem",
              color: "rgba(245,230,200,0.15)",
            }}>
              Stripe
            </span>
          </div>
        </div>

        {/* Three-column explanation */}
        <div style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
          gap: "1.5rem",
        }}>
          {[
            {
              labelKey: "pub.noFees",
              descKey: "pub.noFeesDesc",
              accent: "rgba(0,229,204,0.6)",
            },
            {
              labelKey: "pub.readerFunded",
              descKey: "pub.readerFundedDesc",
              accent: "rgba(201,168,76,0.6)",
            },
            {
              labelKey: "pub.directPayouts",
              descKey: "pub.directPayoutsDesc",
              accent: "rgba(245,230,200,0.5)",
            },
          ].map((col) => (
            <div key={col.labelKey} style={{ textAlign: "center" }}>
              <p style={{
                fontFamily: '"JetBrains Mono", monospace',
                fontSize: "0.65rem",
                letterSpacing: "0.2em",
                textTransform: "uppercase",
                color: col.accent,
                marginBottom: "0.5rem",
              }}>
                {t(col.labelKey)}
              </p>
              <p style={{
                fontFamily: '"EB Garamond", Garamond, Georgia, serif',
                fontSize: "1rem",
                fontStyle: "italic",
                color: "rgba(245,230,200,0.4)",
                lineHeight: 1.6,
              }}>
                {t(col.descKey)}
              </p>
            </div>
          ))}
        </div>
      </motion.div>
    </>
  );
}

// ─── MAIN PAGE ─────────────────────────────────────────────────────────────────
export default function PublishClient() {
  const { t } = useI18n();
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
              TINTAXIS · BY SELECTION ONLY
            </p>

            <h1
              style={{
                fontFamily: '"EB Garamond", Garamond, Georgia, serif',
                fontSize: "clamp(2.4rem, 6vw, 4.5rem)",
                fontWeight: 400,
                lineHeight: 1.15,
                letterSpacing: "-0.01em",
                color: "#F5E6C8",
                marginBottom: "1.5rem",
              }}
            >
              {t("pub.hero")}
              <br />
              <em style={{ color: "rgba(201,168,76,0.85)" }}>{t("pub.heroEmphasis")}</em>
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
              {t("pub.heroDesc")}
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
                Submit Your Work
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

        {/* ── THE MODEL ───────────────────────────────────────────────────── */}
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
              THE MODEL
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
              A publishing house.
              <br />
              <em style={{ color: "rgba(201,168,76,0.7)" }}>Not a marketplace.</em>
            </h2>
            <p
              style={{
                fontFamily: '"EB Garamond", Garamond, Georgia, serif',
                fontSize: "1.15rem",
                lineHeight: 1.85,
                color: "rgba(245,230,200,0.5)",
                fontStyle: "italic",
                marginBottom: "1.5rem",
              }}
            >
              Tintaxis is not a self-publishing tool. There are no tiers, no monthly fees, and no pay-to-exist model. This is a publishing house, not a marketplace. We read your work. We decide. Writers apply. We read. If the work belongs here, we open the door.
              That&apos;s it.
            </p>
            <p
              style={{
                fontFamily: '"EB Garamond", Garamond, Georgia, serif',
                fontSize: "1.15rem",
                lineHeight: 1.85,
                color: "rgba(245,230,200,0.5)",
                fontStyle: "italic",
              }}
            >
              Readers fund the platform by subscribing to writers they want to support.
              After Stripe processing, you keep 85% of net revenue. We keep the lights on with 15%.
              No ads. No data harvesting. No algorithm deciding who gets seen.
              Your reach determines your revenue. Tintaxis promotes your work through social media and digital reading channels — but the real engine is you. Your readers, your marketing, your network. The more you push, the more you earn.
            </p>
          </motion.div>
        </section>

        <BrassRule opacity={0.12} />

        {/* ── HOW SELECTION WORKS ─────────────────────────────────────────── */}
        <section style={{ maxWidth: "800px", margin: "0 auto", padding: "4rem 2rem" }}>
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
              marginBottom: "2.5rem",
            }}
          >
            {t("pub.theProcess")}
          </motion.p>

          <div style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
            gap: "1.5rem",
          }}>
            {[
              {
                step: "01",
                titleKey: "pub.step1",
                bodyKey: "pub.step1Desc",
              },
              {
                step: "02",
                titleKey: "pub.step2",
                bodyKey: "pub.step2Desc",
              },
              {
                step: "03",
                titleKey: "pub.step3",
                bodyKey: "pub.step3Desc",
              },
            ].map((s, i) => (
              <motion.div
                key={s.step}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: i * 0.12 }}
                style={{
                  border: "1px solid rgba(201,168,76,0.12)",
                  padding: "1.75rem",
                  position: "relative",
                  background: "rgba(255,255,255,0.01)",
                  textAlign: "center",
                }}
              >
                <CornerAccents />
                <p style={{
                  fontFamily: '"JetBrains Mono", monospace',
                  fontSize: "2rem",
                  color: "rgba(201,168,76,0.2)",
                  marginBottom: "1rem",
                  lineHeight: 1,
                }}>
                  {s.step}
                </p>
                <p style={{
                  fontFamily: '"JetBrains Mono", monospace',
                  fontSize: "0.8rem",
                  letterSpacing: "0.2em",
                  color: "rgba(201,168,76,0.7)",
                  textTransform: "uppercase",
                  marginBottom: "0.75rem",
                }}>
                  {t(s.titleKey)}
                </p>
                <p style={{
                  fontFamily: '"EB Garamond", Garamond, Georgia, serif',
                  fontSize: "1.05rem",
                  fontStyle: "italic",
                  color: "rgba(245,230,200,0.45)",
                  lineHeight: 1.7,
                }}>
                  {t(s.bodyKey)}
                </p>
              </motion.div>
            ))}
          </div>
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
            {t("pub.features")}
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
                &ldquo;Dark psychological thriller. Southern Gothic noir. A girl who killed her mother,
                a father who covered for her, and a small town that never knew.&rdquo;
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
                fontSize: "1.05rem",
                fontStyle: "italic",
                color: "rgba(245,230,200,0.35)",
                textAlign: "center",
                marginBottom: "2.5rem",
              }}
            >
              Every application is read personally. We respond within 5 business days.
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
                      {t("pub.submitted")}
                    </p>
                    <p
                      style={{
                        fontFamily: '"EB Garamond", Garamond, Georgia, serif',
                        fontSize: "1.05rem",
                        fontStyle: "italic",
                        color: "rgba(245,230,200,0.4)",
                      }}
                    >
                      {t("pub.submittedDesc")}
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
                        <label style={labelStyle}>{t("pub.name")}</label>
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
                        <label style={labelStyle}>{t("pub.email")}</label>
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
                      <label style={labelStyle}>{t("pub.bookTitle")}</label>
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
                        <label style={labelStyle}>{t("pub.genre")}</label>
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
                        <label style={labelStyle}>{t("pub.wordCount")}</label>
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
                      <label style={labelStyle}>{t("pub.synopsis")}</label>
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
                      <label style={labelStyle}>{t("pub.whyTintaxis")}</label>
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
                      <label style={labelStyle}>{t("pub.firstChapter")}</label>
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
                      {submitStatus === "loading" ? t("pub.submitting") : t("pub.submit")}
                    </motion.button>
                    <p style={{
                      fontFamily: '"EB Garamond", Garamond, Georgia, serif',
                      fontSize: "0.95rem",
                      fontStyle: "italic",
                      color: "rgba(245,230,200,0.25)",
                      textAlign: "center",
                      lineHeight: 1.5,
                      marginTop: "0.75rem",
                    }}>
                      No fees. No payment. Just your work.
                    </p>
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
            TINTAXIS · CURATED LITERARY PLATFORM · tintaxis.com
          </p>
        </footer>
      </div>
    </div>
  );
}
