"use client";

import { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import { useI18n } from "@/lib/i18n";
import TintaxisLogo from "@/components/ui/TintaxisLogo";
import { WelcomeBackToast, getLastRead } from "@/components/ui/ReturnCapture";
import { getChapterProgress } from "@/lib/ink";
import { BOOKS } from "@/lib/content/books";

// ─── HOMEPAGE ─────────────────────────────────────────────────────────────────
// Conversion-focused: hero → writer pitch (85%) → features → catalog → footer.
// Every section gives visitors a reason to stay or click.

const MONO  = '"JetBrains Mono", monospace';
const SERIF = '"EB Garamond", Garamond, Georgia, serif';

// ─── FEATURE DATA ──────────────────────────────────────────────────
const FEATURES = [
  {
    icon: "🎙",
    titleKey: "home.feat.voiceovers",
    descKey: "home.feat.voiceoversDesc",
  },
  {
    icon: "🤖",
    titleKey: "home.feat.narrators",
    descKey: "home.feat.narratorsDesc",
  },
  {
    icon: "🖋",
    titleKey: "home.feat.annotations",
    descKey: "home.feat.annotationsDesc",
  },
  {
    icon: "💬",
    titleKey: "home.feat.whispers",
    descKey: "home.feat.whispersDesc",
  },
  {
    icon: "🌗",
    titleKey: "home.feat.dayNight",
    descKey: "home.feat.dayNightDesc",
  },
  {
    icon: "🌍",
    titleKey: "home.feat.multilingual",
    descKey: "home.feat.multilingualDesc",
  },
];

// ─── MAIN COMPONENT ──────────────────────────────────────────────────
function useIsMobile(breakpoint = 768) {
  const [mobile, setMobile] = useState(false);
  useEffect(() => {
    const check = () => setMobile(window.innerWidth < breakpoint);
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, [breakpoint]);
  return mobile;
}

export default function HomeClient() {
  const { t } = useI18n();
  const isMobile = useIsMobile();
  const allBooks = Object.values(BOOKS);

  // ── Continue Reading state ──────────────────────────────────
  const [lastRead, setLastRead] = useState<{
    bookSlug: string;
    bookTitle: string;
    chapterSlug: string;
    chapterTitle: string;
    chapterNumber: number;
    totalChapters: number;
    url: string;
    progressPct: number;
  } | null>(null);

  useEffect(() => {
    const record = getLastRead();
    if (!record) return;
    const chProgress = getChapterProgress(record.chapterSlug);
    const scrollPct = chProgress ? Math.round(chProgress.scrollProgress * 100) : 0;
    setLastRead({
      ...record,
      progressPct: scrollPct,
    });
  }, []);

  return (
    <div style={{ backgroundColor: "#0D0B08", color: "#F5E6C8" }}>

      {/* ══════════════════════════════════════════════════════════
          SECTION 1 — HERO (kept, refined)
          ══════════════════════════════════════════════════════════ */}
      <section
        className="relative min-h-screen flex flex-col items-center justify-center overflow-x-hidden"
        style={{ backgroundColor: "#0D0B08" }}
      >
        {/* Background glow */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background:
              "radial-gradient(ellipse at 50% 40%, rgba(44,26,0,0.55) 0%, transparent 65%)",
          }}
        />

        {/* Corner ornaments */}
        <CornerOrnament position="top-left" />
        <CornerOrnament position="top-right" />
        <CornerOrnament position="bottom-left" />
        <CornerOrnament position="bottom-right" />

        {/* Brass rules */}
        <div
          className="absolute top-16 left-16 right-16 h-px"
          style={{
            background:
              "linear-gradient(90deg, transparent, rgba(201,168,76,0.4) 20%, rgba(201,168,76,0.6) 50%, rgba(201,168,76,0.4) 80%, transparent)",
          }}
        />
        <div
          className="absolute bottom-16 left-16 right-16 h-px"
          style={{
            background:
              "linear-gradient(90deg, transparent, rgba(201,168,76,0.4) 20%, rgba(201,168,76,0.6) 50%, rgba(201,168,76,0.4) 80%, transparent)",
          }}
        />

        {/* Main hero content */}
        <div className="relative z-10 flex flex-col items-center text-center px-8 max-w-3xl w-full">

          <motion.p
            className="mb-6"
            style={{
              color: "rgba(201,168,76,0.5)",
              fontSize: "0.75rem",
              letterSpacing: "0.3em",
              fontFamily: MONO,
              textTransform: "uppercase",
            }}
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: "easeOut" }}
          >
            {t("home.tagline")}
          </motion.p>

          <motion.div
            className="relative mb-4 select-none flex flex-col items-center"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: [0.2, 0, 0.1, 1] }}
          >
            <motion.div
              className="mb-4"
              animate={{
                filter: [
                  "drop-shadow(0 0 8px rgba(201,168,76,0.3))",
                  "drop-shadow(0 0 20px rgba(201,168,76,0.55))",
                  "drop-shadow(0 0 8px rgba(201,168,76,0.3))",
                ],
              }}
              transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
            >
              <TintaxisLogo size={64} />
            </motion.div>

            <h1
              style={{
                fontFamily: SERIF,
                fontSize: "clamp(2.5rem, 8vw, 5.5rem)",
                fontWeight: 400,
                letterSpacing: "0.12em",
                lineHeight: 1,
                color: "#F5E6C8",
                textShadow:
                  "0 0 60px rgba(201,168,76,0.2), 0 2px 4px rgba(0,0,0,0.8)",
              }}
            >
              TINTAXIS
            </h1>
          </motion.div>

          <motion.div
            className="mb-6"
            style={{ width: "100%", maxWidth: "420px" }}
            initial={{ scaleX: 0, opacity: 0 }}
            animate={{ scaleX: 1, opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.2, ease: "easeOut" }}
          >
            <div className="brass-line" />
          </motion.div>

          <motion.p
            className="mb-3"
            style={{
              fontFamily: SERIF,
              fontSize: "clamp(1.1rem, 2.5vw, 1.4rem)",
              color: "rgba(245,230,200,0.85)",
              lineHeight: 1.6,
              maxWidth: "520px",
            }}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.15 }}
          >
            {t("home.heroLine1")}
            <br />
            {t("home.heroLine2")}
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.35 }}
            style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "1rem" }}
          >
            <Link href="/writers" passHref>
              <motion.button
                className="relative"
                style={{
                  fontFamily: MONO,
                  fontSize: "0.85rem",
                  letterSpacing: "0.3em",
                  textTransform: "uppercase",
                  color: "#C9A84C",
                  background: "transparent",
                  border: "1px solid rgba(201,168,76,0.5)",
                  padding: "1rem 3rem",
                  cursor: "pointer",
                  transition: "all 0.3s ease",
                }}
                whileHover={{
                  borderColor: "rgba(201,168,76,0.9)",
                  boxShadow: "0 0 24px rgba(201,168,76,0.2)",
                  color: "#E8C97A",
                }}
                whileTap={{ scale: 0.98 }}
              >
                <span className="absolute top-0 left-0 w-2 h-2 border-t border-l" style={{ borderColor: "#C9A84C" }} />
                <span className="absolute top-0 right-0 w-2 h-2 border-t border-r" style={{ borderColor: "#C9A84C" }} />
                <span className="absolute bottom-0 left-0 w-2 h-2 border-b border-l" style={{ borderColor: "#C9A84C" }} />
                <span className="absolute bottom-0 right-0 w-2 h-2 border-b border-r" style={{ borderColor: "#C9A84C" }} />
                {t("home.startReading")}
              </motion.button>
            </Link>

            <Link href="/publish" passHref>
              <motion.span
                style={{
                  fontFamily: MONO,
                  fontSize: "0.6rem",
                  letterSpacing: "0.2em",
                  color: "rgba(201,168,76,0.35)",
                  textTransform: "uppercase",
                  cursor: "pointer",
                }}
                whileHover={{ color: "rgba(201,168,76,0.7)" }}
              >
                {t("home.imAWriter")}
              </motion.span>
            </Link>
          </motion.div>

          {/* ── HERO SAMPLE PLAYER ───────────────────────────────────── */}
          <HeroSamplePlayer />


        </div>
      </section>

      {/* ══════════════════════════════════════════════════════════
          SECTION 2 — FOR WRITERS (THE 85% FLIP)
          ══════════════════════════════════════════════════════════ */}
      <section
        style={{
          padding: "5rem 2rem",
          borderTop: "1px solid rgba(201,168,76,0.08)",
          borderBottom: "1px solid rgba(201,168,76,0.08)",
        }}
      >
        <div style={{ maxWidth: "900px", margin: "0 auto" }}>
          <motion.p
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            style={{
              fontFamily: MONO,
              fontSize: "0.7rem",
              letterSpacing: "0.3em",
              textTransform: "uppercase",
              color: "#C9A84C",
              marginBottom: "1.5rem",
              textAlign: "center",
            }}
          >
            {t("home.forWriters")}
          </motion.p>

          <motion.h2
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            style={{
              fontFamily: SERIF,
              fontSize: "clamp(2rem, 5vw, 3.2rem)",
              fontWeight: 400,
              color: "#F5E6C8",
              lineHeight: 1.2,
              marginBottom: "2rem",
              textAlign: "center",
            }}
          >
            {t("home.weFlipped")}
          </motion.h2>

          {/* THE FLIP: Visual comparison */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1, duration: 0.6 }}
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              gap: "2rem",
              marginBottom: "3rem",
              maxWidth: "700px",
              margin: "0 auto 3rem",
            }}
          >
            {/* Traditional Publishing */}
            <div
              style={{
                padding: "1.5rem",
                border: "1px solid rgba(180,80,60,0.3)",
                borderRadius: "4px",
                background: "rgba(180,80,60,0.04)",
                textAlign: "center",
              }}
            >
              <p
                style={{
                  fontFamily: MONO,
                  fontSize: "0.65rem",
                  letterSpacing: "0.2em",
                  textTransform: "uppercase",
                  color: "rgba(180,80,60,0.8)",
                  marginBottom: "1rem",
                  fontWeight: 600,
                }}
              >
                {t("home.tradPublishing")}
              </p>
              <div
                style={{
                  fontFamily: SERIF,
                  fontSize: "1.3rem",
                  lineHeight: 1.8,
                  color: "#F5E6C8",
                }}
              >
                <div style={{ marginBottom: "0.5rem" }}>
                  <span style={{ color: "rgba(180,80,60,0.85)", fontWeight: 600 }}>75–90%</span>
                  <span style={{ color: "rgba(245,230,200,0.4)" }}> {t("home.publisher")}</span>
                </div>
                <div>
                  <span style={{ color: "rgba(245,230,200,0.3)", fontWeight: 600 }}>10–25%</span>
                  <span style={{ color: "rgba(245,230,200,0.4)" }}> {t("home.author")}</span>
                </div>
              </div>
            </div>

            {/* Tintaxis */}
            <div
              style={{
                padding: "1.5rem",
                border: "1px solid rgba(0,200,170,0.3)",
                borderRadius: "4px",
                background: "rgba(0,200,170,0.04)",
                textAlign: "center",
              }}
            >
              <p
                style={{
                  fontFamily: MONO,
                  fontSize: "0.65rem",
                  letterSpacing: "0.2em",
                  textTransform: "uppercase",
                  color: "rgba(0,200,170,0.85)",
                  marginBottom: "1rem",
                  fontWeight: 600,
                }}
              >
                TINTAXIS
              </p>
              <div
                style={{
                  fontFamily: SERIF,
                  fontSize: "1.3rem",
                  lineHeight: 1.8,
                  color: "#F5E6C8",
                }}
              >
                <div style={{ marginBottom: "0.5rem" }}>
                  <span style={{ color: "rgba(0,200,170,0.85)", fontWeight: 600 }}>85%</span>
                  <span style={{ color: "rgba(245,230,200,0.4)" }}> {t("home.author")}</span>
                </div>
                <div>
                  <span style={{ color: "rgba(245,230,200,0.3)", fontWeight: 600 }}>15%</span>
                  <span style={{ color: "rgba(245,230,200,0.4)" }}> {t("home.platform")}</span>
                </div>
              </div>
            </div>
          </motion.div>

          {/* ── STRIPE TRUST BADGE ── */}
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2, duration: 0.6 }}
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: "0.75rem",
              marginBottom: "3rem",
              padding: "2rem 1.5rem",
              border: "1px solid rgba(201,168,76,0.1)",
              borderRadius: "4px",
              background: "rgba(201,168,76,0.02)",
              maxWidth: "500px",
              margin: "0 auto 3rem",
            }}
          >
            <p
              style={{
                fontFamily: MONO,
                fontSize: "0.6rem",
                letterSpacing: "0.3em",
                textTransform: "uppercase",
                color: "rgba(201,168,76,0.35)",
              }}
            >
              {t("sub.secured")}
            </p>
            {/* Official Stripe wordmark — inline SVG for crisp rendering */}
            <svg
              viewBox="0 0 468 222.5"
              xmlns="http://www.w3.org/2000/svg"
              style={{ width: "160px", height: "auto", opacity: 0.85 }}
              aria-label="Stripe"
            >
              <path
                d="M414 113.4c0-25.6-12.4-45.8-36.1-45.8-23.8 0-38.2 20.2-38.2 45.6 0 30.1 17 45.3 41.4 45.3 11.9 0 20.9-2.7 27.7-6.5v-20c-6.8 3.4-14.6 5.5-24.5 5.5-9.7 0-18.3-3.4-19.4-15.2h48.9c0-1.3.2-6.5.2-8.9zm-49.4-9.5c0-11.3 6.9-16 13.2-16 6.1 0 12.6 4.7 12.6 16h-25.8zM301.1 67.6c-9.8 0-16.1 4.6-19.6 7.8l-1.3-6.2h-22v116.6l25-5.3.1-28.3c3.6 2.6 8.9 6.3 17.7 6.3 17.9 0 34.2-14.4 34.2-46.1-.1-29-16.6-44.8-34.1-44.8zm-6 68.9c-5.9 0-9.4-2.1-11.8-4.7l-.1-37.1c2.6-2.9 6.2-4.9 11.9-4.9 9.1 0 15.4 10.2 15.4 23.3 0 13.4-6.2 23.4-15.4 23.4zM223.8 61.7l25.1-5.4V36l-25.1 5.3zM223.8 69.3h25.1v87.5h-25.1zM196.9 76.7l-1.6-7.4h-21.6v87.5h25V97.5c5.9-7.7 15.9-6.3 19-5.2v-23c-3.2-1.2-14.9-3.4-20.8 7.4zM146.9 47.6l-24.4 5.2-.1 80.1c0 14.8 11.1 25.7 25.9 25.7 8.2 0 14.2-1.5 17.5-3.3V135c-3.2 1.3-19 5.9-19-8.9V90.6h19V69.3h-19l.1-21.7zM79.3 94.7c0-3.9 3.2-5.4 8.5-5.4 7.6 0 17.2 2.3 24.8 6.4V72.2c-8.3-3.3-16.5-4.6-24.8-4.6C67.5 67.6 52 78.8 52 97.4c0 28.9 39.8 24.3 39.8 36.7 0 4.6-4 6.1-9.6 6.1-8.3 0-18.9-3.4-27.3-8v23.8c9.3 4 18.7 5.7 27.3 5.7 20.8 0 35.1-10.3 35.1-29.4-.1-31.2-40-25.7-40-37.6z"
                fill="#C9A84C"
              />
            </svg>
            <p
              style={{
                fontFamily: SERIF,
                fontSize: "0.9rem",
                fontStyle: "italic",
                color: "rgba(245,230,200,0.4)",
                textAlign: "center",
                lineHeight: 1.6,
                maxWidth: "380px",
              }}
            >
              {t("sub.trustCopy")}
            </p>
          </motion.div>

          {/* The catch + reframing */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.15, duration: 0.6 }}
            style={{
              maxWidth: "650px",
              margin: "0 auto 2rem",
              textAlign: "center",
            }}
          >
            <p
              style={{
                fontFamily: SERIF,
                fontSize: "1.1rem",
                color: "rgba(245,230,200,0.65)",
                lineHeight: 1.8,
                marginBottom: "1.25rem",
              }}
            >
              {t("home.genesis")}
            </p>
            <p
              style={{
                fontFamily: SERIF,
                fontSize: "1rem",
                color: "rgba(245,230,200,0.55)",
                lineHeight: 1.8,
                fontStyle: "italic",
              }}
            >
              {t("home.earn15")}
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.25, duration: 0.5 }}
            style={{ textAlign: "center" }}
          >
            <Link href="/publish" passHref>
              <motion.button
                className="relative"
                style={{
                  fontFamily: MONO,
                  fontSize: "0.8rem",
                  letterSpacing: "0.25em",
                  textTransform: "uppercase",
                  color: "#C9A84C",
                  background: "transparent",
                  border: "1px solid rgba(201,168,76,0.5)",
                  padding: "0.9rem 2.5rem",
                  cursor: "pointer",
                  transition: "all 0.3s ease",
                }}
                whileHover={{
                  borderColor: "rgba(201,168,76,0.9)",
                  boxShadow: "0 0 24px rgba(201,168,76,0.2)",
                  color: "#E8C97A",
                }}
                whileTap={{ scale: 0.98 }}
              >
                SUBMIT YOUR WORK
              </motion.button>
            </Link>
          </motion.div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════════
          SECTION 3 — WHY TINTAXIS OVER SOCIAL MEDIA?
          ══════════════════════════════════════════════════════════ */}
      <section style={{ padding: "4rem 2rem", maxWidth: "900px", margin: "0 auto", textAlign: "center" }}>
        <motion.p
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          style={{
            fontFamily: SERIF,
            fontSize: "1.15rem",
            color: "rgba(245,230,200,0.65)",
            lineHeight: 1.8,
            marginBottom: "1.5rem",
          }}
        >
          {t("home.socialMediaPitch")}
        </motion.p>
        <motion.p
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.1 }}
          style={{
            fontFamily: SERIF,
            fontSize: "1.15rem",
            color: "rgba(0,200,170,0.85)",
            lineHeight: 1.8,
            fontWeight: 600,
          }}
        >
          {t("home.publishingHouse")}
        </motion.p>
      </section>

      {/* ══════════════════════════════════════════════════════════
          SECTION 3.5 — FEATURES (simplified single line)
          ══════════════════════════════════════════════════════════ */}
      <section style={{ padding: "2rem 2rem 4rem", maxWidth: "900px", margin: "0 auto", textAlign: "center" }}>
        <motion.p
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          style={{
            fontFamily: MONO,
            fontSize: "0.75rem",
            letterSpacing: "0.2em",
            textTransform: "uppercase",
            color: "rgba(201,168,76,0.4)",
            marginBottom: "1rem",
          }}
        >
          {t("home.toolsBuilt")}
        </motion.p>
        <motion.p
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.1 }}
          style={{
            fontFamily: SERIF,
            fontSize: "1.1rem",
            color: "rgba(245,230,200,0.55)",
            lineHeight: 1.7,
          }}
        >
          {t("home.toolsDesc")}
        </motion.p>
      </section>

      {/* ══════════════════════════════════════════════════════════
          COMMUNITY IMAGE — humor break
          ══════════════════════════════════════════════════════════ */}
      <section style={{ padding: "3rem 2rem 1rem", maxWidth: "800px", margin: "0 auto", textAlign: "center" }}>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7 }}
        >
          <img
            src="/community-penguins.png"
            alt="Shakespeare surrounded by penguins reading books — Codex and Scribe subscribers in the Tintaxis library"
            style={{
              width: "100%",
              maxWidth: "700px",
              borderRadius: "6px",
              border: "1px solid rgba(201,168,76,0.12)",
              marginBottom: "1.25rem",
            }}
          />
          <p
            style={{
              fontFamily: SERIF,
              fontSize: "1.1rem",
              fontStyle: "italic",
              color: "rgba(245,230,200,0.5)",
              lineHeight: 1.6,
            }}
          >
            {t("home.readersWaiting")}
          </p>
          <p
            style={{
              fontFamily: MONO,
              fontSize: "0.45rem",
              letterSpacing: "0.15em",
              color: "rgba(201,168,76,0.2)",
              textTransform: "uppercase",
              marginTop: "0.75rem",
            }}
          >
            {t("home.imageCredit")}
          </p>
        </motion.div>
      </section>

      {/* ══════════════════════════════════════════════════════════
          SECTION 3.5 — CONTINUE READING (personalized)
          ══════════════════════════════════════════════════════════ */}
      {lastRead && lastRead.progressPct > 0 && lastRead.progressPct < 95 && (
        <section style={{ padding: "2rem 2rem 0", maxWidth: "1100px", margin: "0 auto" }}>
          <Link href={`${lastRead.url}?resume=1`} style={{ textDecoration: "none" }}>
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
              style={{
                border: "1px solid rgba(201,168,76,0.2)",
                background: "rgba(201,168,76,0.03)",
                padding: "1.25rem 1.5rem",
                cursor: "pointer",
                transition: "all 0.3s ease",
                position: "relative",
                overflow: "hidden",
              }}
              whileHover={{ borderColor: "rgba(201,168,76,0.4)", background: "rgba(201,168,76,0.06)" }}
            >
              {/* Progress bar at top */}
              <div style={{
                position: "absolute",
                top: 0,
                left: 0,
                width: "100%",
                height: "2px",
                background: "rgba(201,168,76,0.08)",
              }}>
                <motion.div
                  initial={{ width: 0 }}
                  whileInView={{ width: `${lastRead.progressPct}%` }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.8, delay: 0.3, ease: "easeOut" }}
                  style={{
                    height: "100%",
                    background: "rgba(201,168,76,0.5)",
                  }}
                />
              </div>

              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: "1rem", flexWrap: "wrap", overflow: "hidden" }}>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <p style={{
                    fontFamily: MONO,
                    fontSize: "0.5rem",
                    letterSpacing: "0.25em",
                    color: "rgba(201,168,76,0.4)",
                    textTransform: "uppercase",
                    marginBottom: "0.35rem",
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    whiteSpace: "nowrap",
                  }}>
                    {t("home.continueReading")} · {lastRead.progressPct}% · Ch. {lastRead.chapterNumber}/{lastRead.totalChapters}
                  </p>
                  <p style={{
                    fontFamily: SERIF,
                    fontSize: "1.1rem",
                    fontStyle: "italic",
                    color: "rgba(245,230,200,0.8)",
                    lineHeight: 1.3,
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    whiteSpace: "nowrap",
                  }}>
                    {lastRead.chapterTitle}
                    <span style={{ color: "rgba(245,230,200,0.35)", fontSize: "0.95rem" }}>
                      {" "}— {lastRead.bookTitle}
                    </span>
                  </p>
                </div>
                <span style={{
                  fontFamily: MONO,
                  fontSize: "0.55rem",
                  letterSpacing: "0.2em",
                  color: "#C9A84C",
                  textTransform: "uppercase",
                  opacity: 0.7,
                  flexShrink: 0,
                }}>
                  {t("home.resume")}
                </span>
              </div>
            </motion.div>
          </Link>
        </section>
      )}

      {/* ══════════════════════════════════════════════════════════
          SECTION 4 — NOW READING (Book catalog)
          ══════════════════════════════════════════════════════════ */}
      <section style={{ padding: "4rem 2rem 5rem", maxWidth: "1100px", margin: "0 auto" }}>
        <SectionHeader
          tag={t("home.nowOnTintaxis")}
          title={t("home.nowOnTintaxisDesc")}
        />

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(min(260px, 100%), 1fr))",
            gap: "1.25rem",
            marginTop: "3rem",
          }}
        >
          {allBooks.map((book, i) => (
            <motion.div
              key={book.slug}
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-40px" }}
              transition={{ duration: 0.5, delay: i * 0.06 }}
            >
              <Link href={`/book/${book.slug}`} style={{ textDecoration: "none" }}>
                <div
                  style={{
                    padding: "1.25rem",
                    border: `1px solid ${book.accentColor}20`,
                    borderRadius: "4px",
                    background: `${book.accentColor}06`,
                    cursor: "pointer",
                    transition: "all 0.3s ease",
                    minHeight: "180px",
                    display: "flex",
                    flexDirection: "column",
                    justifyContent: "space-between",
                  }}
                  className="book-card-hover"
                >
                  {/* Language badge */}
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                    <span
                      style={{
                        fontFamily: MONO,
                        fontSize: "0.55rem",
                        letterSpacing: "0.2em",
                        color: book.accentColor,
                        textTransform: "uppercase",
                        opacity: 0.7,
                      }}
                    >
                      {book.coverLabel}
                    </span>
                    <span
                      style={{
                        fontFamily: MONO,
                        fontSize: "0.5rem",
                        color: "rgba(245,230,200,0.3)",
                      }}
                    >
                      {book.totalChapters} {book.chapterLabel?.toLowerCase()}s
                    </span>
                  </div>

                  {/* Title + author */}
                  <div style={{ marginTop: "0.75rem" }}>
                    <h3
                      style={{
                        fontFamily: SERIF,
                        fontSize: "1.2rem",
                        fontStyle: "italic",
                        color: "#F5E6C8",
                        marginBottom: "0.25rem",
                        lineHeight: 1.3,
                      }}
                    >
                      {book.title}
                    </h3>
                    <p
                      style={{
                        fontFamily: MONO,
                        fontSize: "0.55rem",
                        letterSpacing: "0.1em",
                        color: "rgba(245,230,200,0.35)",
                        textTransform: "uppercase",
                      }}
                    >
                      {book.author}
                    </p>
                  </div>

                  {/* Tagline */}
                  <p
                    style={{
                      fontFamily: SERIF,
                      fontSize: "0.9rem",
                      fontStyle: "italic",
                      color: "rgba(245,230,200,0.4)",
                      lineHeight: 1.5,
                      marginTop: "0.75rem",
                    }}
                  >
                    &ldquo;{book.tagline}&rdquo;
                  </p>

                  {/* Read button */}
                  <div
                    style={{
                      marginTop: "1rem",
                      fontFamily: MONO,
                      fontSize: "0.55rem",
                      letterSpacing: "0.2em",
                      textTransform: "uppercase",
                      color: book.accentColor,
                      opacity: 0.6,
                    }}
                  >
                    {t("home.readNow")}
                  </div>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════════
          SECTION 5 — FOOTER
          ══════════════════════════════════════════════════════════ */}
      <footer style={{ padding: "3rem 2rem", textAlign: "center" }}>
        {/* ── FOLLOW THE PROJECT NEWSLETTER ───────────────────────── */}
        <FollowProjectForm />

        <div
          style={{
            maxWidth: "600px",
            margin: "0 auto",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            gap: "2rem",
          }}
        >
          <Link
            href="/library"
            style={{
              fontFamily: MONO,
              fontSize: "0.55rem",
              letterSpacing: "0.15em",
              textTransform: "uppercase",
              color: "rgba(245,230,200,0.3)",
              textDecoration: "none",
            }}
          >
            {t("nav.library")}
          </Link>
          <Link
            href="/writers"
            style={{
              fontFamily: MONO,
              fontSize: "0.55rem",
              letterSpacing: "0.15em",
              textTransform: "uppercase",
              color: "rgba(245,230,200,0.3)",
              textDecoration: "none",
            }}
          >
            {t("nav.writers")}
          </Link>
          <Link
            href="/journal"
            style={{
              fontFamily: MONO,
              fontSize: "0.55rem",
              letterSpacing: "0.15em",
              textTransform: "uppercase",
              color: "rgba(245,230,200,0.3)",
              textDecoration: "none",
            }}
          >
            {t("nav.journal")}
          </Link>
          <Link
            href="/publish"
            style={{
              fontFamily: MONO,
              fontSize: "0.55rem",
              letterSpacing: "0.15em",
              textTransform: "uppercase",
              color: "rgba(245,230,200,0.3)",
              textDecoration: "none",
            }}
          >
            {t("nav.publish")}
          </Link>
        </div>
        <p
          style={{
            fontFamily: MONO,
            fontSize: "0.5rem",
            letterSpacing: "0.2em",
            color: "rgba(201,168,76,0.2)",
            textTransform: "uppercase",
            marginTop: "1.5rem",
          }}
        >
          {t("home.footerBrand")}
        </p>
      </footer>

      {!isMobile && <WelcomeBackToast />}
    </div>
  );
}

// ─── SECTION HEADER (reused) ───────────────────────────────────────────────
function SectionHeader({ tag, title }: { tag: string; title: string }) {
  return (
    <div style={{ textAlign: "center" }}>
      <motion.p
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        style={{
          fontFamily: MONO,
          fontSize: "0.7rem",
          letterSpacing: "0.3em",
          textTransform: "uppercase",
          color: "#C9A84C",
          marginBottom: "1rem",
        }}
      >
        {tag}
      </motion.p>
      <motion.h2
        initial={{ opacity: 0, y: 12 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6 }}
        style={{
          fontFamily: SERIF,
          fontSize: "clamp(1.5rem, 4vw, 2.2rem)",
          fontWeight: 400,
          fontStyle: "italic",
          color: "rgba(245,230,200,0.7)",
          lineHeight: 1.4,
          maxWidth: "600px",
          margin: "0 auto",
        }}
      >
        {title}
      </motion.h2>
    </div>
  );
}

// ─── CORNER ORNAMENT ─────────────────────────────────────────────────────────
function CornerOrnament({
  position,
}: {
  position: "top-left" | "top-right" | "bottom-left" | "bottom-right";
}) {
  const styles: Record<string, string> = {
    "top-left":     "top-8 left-8",
    "top-right":    "top-8 right-8",
    "bottom-left":  "bottom-8 left-8",
    "bottom-right": "bottom-8 right-8",
  };

  const rotate: Record<string, string> = {
    "top-left":     "rotate-0",
    "top-right":    "rotate-90",
    "bottom-left":  "-rotate-90",
    "bottom-right": "rotate-180",
  };

  return (
    <svg
      className={`absolute ${styles[position]} ${rotate[position]} opacity-40`}
      width="32"
      height="32"
      viewBox="0 0 32 32"
      fill="none"
    >
      <path
        d="M2 30 L2 2 L30 2"
        stroke="#C9A84C"
        strokeWidth="1"
        fill="none"
      />
      <path d="M2 10 L8 10" stroke="#C9A84C" strokeWidth="0.5" />
      <path d="M10 2 L10 8" stroke="#C9A84C" strokeWidth="0.5" />
      <circle cx="2" cy="2" r="1.5" fill="#C9A84C" />
    </svg>
  );
}

// ─── HERO SAMPLE PLAYER ─────────────────────────────────────────────────────
// Author voice sample played on demand. Audio lives at /audio/tintaxis-welcome.mp3
// preload="none" so the file only fetches when the user clicks play.
function HeroSamplePlayer() {
  const { t } = useI18n();
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0); // 0..1
  const [duration, setDuration] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const onTime = () => {
      setCurrentTime(audio.currentTime);
      setProgress(audio.duration ? audio.currentTime / audio.duration : 0);
    };
    const onMeta = () => setDuration(audio.duration || 0);
    const onEnd = () => {
      setIsPlaying(false);
      setProgress(0);
      setCurrentTime(0);
    };
    const onPause = () => setIsPlaying(false);
    const onPlay = () => setIsPlaying(true);

    audio.addEventListener("timeupdate", onTime);
    audio.addEventListener("loadedmetadata", onMeta);
    audio.addEventListener("ended", onEnd);
    audio.addEventListener("pause", onPause);
    audio.addEventListener("play", onPlay);
    return () => {
      audio.removeEventListener("timeupdate", onTime);
      audio.removeEventListener("loadedmetadata", onMeta);
      audio.removeEventListener("ended", onEnd);
      audio.removeEventListener("pause", onPause);
      audio.removeEventListener("play", onPlay);
    };
  }, []);

  function toggle() {
    const audio = audioRef.current;
    if (!audio) return;
    if (audio.paused) {
      audio.play().catch(() => {
        /* autoplay/permission guard */
      });
    } else {
      audio.pause();
    }
  }

  function formatTime(sec: number): string {
    if (!Number.isFinite(sec)) return "0:00";
    const m = Math.floor(sec / 60);
    const s = Math.floor(sec % 60);
    return `${m}:${s.toString().padStart(2, "0")}`;
  }

  // 30-bar waveform; bars light up as progress advances.
  const barHeights = [5, 9, 14, 6, 11, 16, 8, 13, 10, 17, 7, 12, 15, 9, 11, 6, 14, 10, 8, 13, 11, 7, 15, 9, 12, 6, 14, 10, 8, 11];

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8, delay: 0.6 }}
      style={{
        marginTop: "3rem",
        maxWidth: "480px",
        width: "100%",
        padding: "1.25rem 1.5rem",
        border: "1px solid rgba(201,168,76,0.28)",
        background: "rgba(13,11,8,0.4)",
        backdropFilter: "blur(4px)",
      }}
    >
      <audio
        ref={audioRef}
        src="/audio/tintaxis-welcome.mp3"
        preload="none"
      />

      <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
        {/* Play / Pause button */}
        <button
          onClick={toggle}
          aria-label={isPlaying ? "Pause sample" : "Play sample"}
          style={{
            width: "44px",
            height: "44px",
            borderRadius: "50%",
            border: "1px solid rgba(201,168,76,0.6)",
            background: "rgba(201,168,76,0.08)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            flexShrink: 0,
            cursor: "pointer",
            transition: "all 0.2s",
            padding: 0,
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.borderColor = "rgba(201,168,76,0.9)";
            e.currentTarget.style.background = "rgba(201,168,76,0.15)";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.borderColor = "rgba(201,168,76,0.6)";
            e.currentTarget.style.background = "rgba(201,168,76,0.08)";
          }}
        >
          {isPlaying ? (
            <svg width="12" height="14" viewBox="0 0 12 14" fill="none" xmlns="http://www.w3.org/2000/svg">
              <rect x="1" y="1" width="3" height="12" fill="#C9A84C" />
              <rect x="8" y="1" width="3" height="12" fill="#C9A84C" />
            </svg>
          ) : (
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M3 2L12 7L3 12V2Z" fill="#C9A84C" />
            </svg>
          )}
        </button>

        <div style={{ flex: 1, textAlign: "left", minWidth: 0 }}>
          <p
            style={{
              fontFamily: MONO,
              fontSize: "0.6rem",
              letterSpacing: "0.25em",
              color: "rgba(201,168,76,0.65)",
              textTransform: "uppercase",
              margin: 0,
              marginBottom: "0.35rem",
            }}
          >
            {t("home.sample.label")}
          </p>
          <p
            style={{
              fontFamily: SERIF,
              fontSize: "0.95rem",
              fontStyle: "italic",
              color: "rgba(245,230,200,0.85)",
              margin: 0,
              lineHeight: 1.35,
            }}
          >
            {t("home.sample.title")}
          </p>
        </div>

        <span
          style={{
            fontFamily: MONO,
            fontSize: "0.6rem",
            letterSpacing: "0.1em",
            color: "rgba(201,168,76,0.7)",
            flexShrink: 0,
            minWidth: "68px",
            textAlign: "right",
          }}
        >
          {formatTime(currentTime)} / {duration ? formatTime(duration) : "1:43"}
        </span>
      </div>

      {/* Waveform with playback progress */}
      <div
        style={{
          marginTop: "0.9rem",
          display: "flex",
          alignItems: "center",
          gap: "3px",
          height: "18px",
        }}
        aria-hidden="true"
      >
        {barHeights.map((h, i) => {
          const barProgress = (i + 1) / barHeights.length;
          const active = progress >= barProgress - 0.5 / barHeights.length;
          return (
            <span
              key={i}
              style={{
                display: "block",
                width: "2px",
                height: `${h}px`,
                background: active ? "#C9A84C" : "rgba(201,168,76,0.25)",
                transition: "background 0.15s",
              }}
            />
          );
        })}
      </div>

      <p
        style={{
          fontFamily: MONO,
          fontSize: "0.55rem",
          letterSpacing: "0.08em",
          color: "rgba(245,230,200,0.45)",
          margin: "0.8rem 0 0",
          textAlign: "left",
          lineHeight: 1.5,
        }}
      >
        {t("home.sample.desc")}
      </p>
    </motion.div>
  );
}

// ─── FOLLOW THE PROJECT FORM ────────────────────────────────────────────────
// Lightweight footer newsletter. Posts to /api/follow-project
// (separate list from chapter-unlock email capture).
function FollowProjectForm() {
  const { t } = useI18n();
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!email || status === "loading") return;
    setStatus("loading");
    try {
      const res = await fetch("/api/follow-project", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      if (!res.ok) throw new Error("request failed");
      setStatus("success");
      setEmail("");
    } catch {
      setStatus("error");
    }
  }

  return (
    <div
      style={{
        maxWidth: "480px",
        margin: "0 auto 3rem",
        padding: "1.5rem 1.25rem 1.75rem",
        borderTop: "1px solid rgba(201,168,76,0.12)",
        borderBottom: "1px solid rgba(201,168,76,0.12)",
      }}
    >
      <p
        style={{
          fontFamily: MONO,
          fontSize: "0.6rem",
          letterSpacing: "0.3em",
          textTransform: "uppercase",
          color: "#C9A84C",
          margin: "0 0 0.75rem",
        }}
      >
        {t("home.follow.label")}
      </p>
      <p
        style={{
          fontFamily: SERIF,
          fontSize: "0.85rem",
          fontStyle: "italic",
          color: "rgba(245,230,200,0.55)",
          lineHeight: 1.6,
          margin: "0 0 1.1rem",
          maxWidth: "420px",
          marginLeft: "auto",
          marginRight: "auto",
        }}
      >
        {t("home.follow.desc")}
      </p>

      {status === "success" ? (
        <p
          style={{
            fontFamily: MONO,
            fontSize: "0.65rem",
            letterSpacing: "0.15em",
            textTransform: "uppercase",
            color: "rgba(201,168,76,0.8)",
            margin: 0,
          }}
        >
          ✓ {t("home.follow.success")}
        </p>
      ) : (
        <form
          onSubmit={handleSubmit}
          style={{
            display: "flex",
            gap: "0.5rem",
            maxWidth: "400px",
            margin: "0 auto",
            flexWrap: "wrap",
            justifyContent: "center",
          }}
        >
          <input
            type="email"
            required
            value={email}
            onChange={(e) => {
              setEmail(e.target.value);
              if (status === "error") setStatus("idle");
            }}
            placeholder={t("home.follow.placeholder")}
            aria-label={t("home.follow.label")}
            style={{
              flex: "1 1 220px",
              minWidth: "200px",
              fontFamily: MONO,
              fontSize: "0.75rem",
              letterSpacing: "0.05em",
              color: "#F5E6C8",
              background: "rgba(13,11,8,0.6)",
              border: "1px solid rgba(201,168,76,0.3)",
              padding: "0.75rem 0.9rem",
              outline: "none",
            }}
          />
          <button
            type="submit"
            disabled={status === "loading"}
            style={{
              fontFamily: MONO,
              fontSize: "0.65rem",
              letterSpacing: "0.25em",
              textTransform: "uppercase",
              color: "#C9A84C",
              background: "transparent",
              border: "1px solid rgba(201,168,76,0.5)",
              padding: "0.75rem 1.25rem",
              cursor: status === "loading" ? "wait" : "pointer",
              transition: "all 0.2s",
            }}
          >
            {status === "loading" ? "..." : t("home.follow.button")}
          </button>
        </form>
      )}

      {status === "error" && (
        <p
          style={{
            fontFamily: MONO,
            fontSize: "0.6rem",
            letterSpacing: "0.1em",
            color: "rgba(192,57,43,0.7)",
            margin: "0.75rem 0 0",
          }}
        >
          {t("home.follow.error")}
        </p>
      )}
    </div>
  );
}

