"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import { useI18n } from "@/lib/i18n";

const MONO  = '"JetBrains Mono", monospace';
const SERIF = '"EB Garamond", Garamond, Georgia, serif';

// ─── MAIN COMPONENT ──────────────────────────────────────────────────
export default function ImpactClient() {
  const { t } = useI18n();
  return (
    <div style={{ backgroundColor: "#0D0B08", color: "#F5E6C8" }}>
      {/* ══════════════════════════════════════════════════════════
          IMPACT PAGE — ENVIRONMENTAL CASE FOR DIGITAL READING
          ══════════════════════════════════════════════════════════ */}
      <section
        style={{
          minHeight: "100vh",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          padding: "4rem 2rem",
          borderBottom: "1px solid rgba(201,168,76,0.08)",
        }}
      >
        <motion.div
          style={{ maxWidth: "800px", textAlign: "center" }}
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          <p style={{
            fontFamily: MONO,
            fontSize: "0.85rem",
            letterSpacing: "0.2em",
            textTransform: "uppercase",
            color: "#C9A84C",
            marginBottom: "1rem",
          }}>
            {t("impact.envImpact")}
          </p>
          <h1 style={{
            fontFamily: SERIF,
            fontSize: "clamp(2.5rem, 6vw, 4rem)",
            fontWeight: 400,
            color: "#F5E6C8",
            lineHeight: 1.2,
            marginBottom: "1.5rem",
          }}>
            {t("impact.title")}
          </h1>
          <p style={{
            fontFamily: SERIF,
            fontSize: "clamp(1.1rem, 2vw, 1.4rem)",
            color: "rgba(245,230,200,0.65)",
            lineHeight: 1.6,
            fontStyle: "italic",
          }}>
            {t("impact.subtitle")}
          </p>
        </motion.div>
      </section>

      {/* ══════════════════════════════════════════════════════════
          THE COST OF PAPER SECTION
          ══════════════════════════════════════════════════════════ */}
      <section
        style={{
          padding: "6rem 2rem",
          borderTop: "1px solid rgba(201,168,76,0.08)",
          borderBottom: "1px solid rgba(201,168,76,0.08)",
          background: "linear-gradient(180deg, rgba(0,0,0,0) 0%, rgba(0,40,20,0.08) 50%, rgba(0,0,0,0) 100%)",
        }}
      >
        <div style={{ maxWidth: "1000px", margin: "0 auto" }}>
          <SectionHeader
            tag={t("impact.costOfPaper")}
            title={t("impact.paperDesc")}
          />

          {/* ── Key statistics row ── */}
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
              gap: "1.5rem",
              marginTop: "3.5rem",
              marginBottom: "3rem",
            }}
          >
            {[
              { value: "417M", unit: "metric tons", labelKey: "impact.stat1" },
              { value: "33%", unit: "of all trees", labelKey: "impact.stat2" },
              { value: "7.5L", unit: "of water", labelKey: "impact.stat3" },
              { value: "26M", unit: "tons of books", labelKey: "impact.stat4" },
            ].map((stat, i) => (
              <motion.div
                key={stat.labelKey}
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-40px" }}
                transition={{ duration: 0.6, delay: i * 0.1 }}
                style={{
                  textAlign: "center",
                  padding: "1.5rem 1rem",
                  border: "1px solid rgba(0,200,170,0.12)",
                  borderRadius: "4px",
                  background: "rgba(0,200,170,0.03)",
                }}
              >
                <AnimatedCounter value={stat.value} />
                <p style={{
                  fontFamily: MONO,
                  fontSize: "0.75rem",
                  letterSpacing: "0.15em",
                  textTransform: "uppercase",
                  color: "rgba(0,200,170,0.6)",
                  marginTop: "0.15rem",
                  marginBottom: "0.5rem",
                }}>
                  {stat.unit}
                </p>
                <p style={{
                  fontFamily: SERIF,
                  fontSize: "1.05rem",
                  color: "rgba(245,230,200,0.5)",
                  lineHeight: 1.5,
                }}>
                  {t(stat.labelKey)}
                </p>
              </motion.div>
            ))}
          </div>

          {/* ── The lifecycle: Print vs Digital ── */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7 }}
            style={{
              padding: "2rem",
              border: "1px solid rgba(201,168,76,0.12)",
              borderRadius: "4px",
              background: "rgba(201,168,76,0.02)",
              marginBottom: "3rem",
            }}
          >
            <p style={{
              fontFamily: MONO,
              fontSize: "0.8rem",
              letterSpacing: "0.25em",
              textTransform: "uppercase",
              color: "#C9A84C",
              marginBottom: "1.25rem",
              textAlign: "center",
            }}>
              {t("impact.lifecycle")}
            </p>

            {/* Horizontal bar comparisons */}
            {[
              { labelKey: "impact.trees", print: 100, digital: 0, printLabelKey: "impact.treesPrint", digitalLabelKey: "impact.treesDigital" },
              { labelKey: "impact.water", print: 100, digital: 3, printLabelKey: "impact.waterPrint", digitalLabelKey: "impact.waterDigital" },
              { labelKey: "impact.co2", print: 100, digital: 12, printLabelKey: "impact.co2Print", digitalLabelKey: "impact.co2Digital" },
              { labelKey: "impact.waste", print: 100, digital: 0, printLabelKey: "impact.wastePrint", digitalLabelKey: "impact.wasteDigital" },
            ].map((row, i) => (
              <div key={row.labelKey} style={{ marginBottom: i < 3 ? "1.25rem" : 0 }}>
                <p style={{
                  fontFamily: MONO,
                  fontSize: "0.75rem",
                  letterSpacing: "0.1em",
                  textTransform: "uppercase",
                  color: "rgba(245,230,200,0.55)",
                  marginBottom: "0.5rem",
                }}>
                  {t(row.labelKey)}
                </p>
                <div style={{ display: "flex", flexDirection: "column", gap: "0.35rem" }}>
                  {/* Print bar */}
                  <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
                    <span style={{ fontFamily: MONO, fontSize: "0.7rem", color: "rgba(245,230,200,0.4)", width: "55px", flexShrink: 0 }}>{t("impact.print")}</span>
                    <div style={{ flex: 1, height: "22px", background: "rgba(255,255,255,0.03)", borderRadius: "2px", overflow: "hidden", position: "relative" }}>
                      <motion.div
                        initial={{ width: 0 }}
                        whileInView={{ width: `${row.print}%` }}
                        viewport={{ once: true }}
                        transition={{ duration: 1, delay: 0.3 + i * 0.15, ease: "easeOut" }}
                        style={{
                          height: "100%",
                          background: "linear-gradient(90deg, rgba(180,80,60,0.6), rgba(180,80,60,0.35))",
                          borderRadius: "2px",
                        }}
                      />
                    </div>
                    <span style={{ fontFamily: MONO, fontSize: "0.65rem", color: "rgba(180,80,60,0.7)", minWidth: "160px", textAlign: "right" }}>{t(row.printLabelKey)}</span>
                  </div>
                  {/* Digital bar */}
                  <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
                    <span style={{ fontFamily: MONO, fontSize: "0.7rem", color: "rgba(0,200,170,0.6)", width: "55px", flexShrink: 0 }}>{t("impact.digital")}</span>
                    <div style={{ flex: 1, height: "22px", background: "rgba(255,255,255,0.03)", borderRadius: "2px", overflow: "hidden", position: "relative" }}>
                      <motion.div
                        initial={{ width: 0 }}
                        whileInView={{ width: `${Math.max(row.digital, 1)}%` }}
                        viewport={{ once: true }}
                        transition={{ duration: 1, delay: 0.4 + i * 0.15, ease: "easeOut" }}
                        style={{
                          height: "100%",
                          background: "linear-gradient(90deg, rgba(0,200,170,0.6), rgba(0,200,170,0.35))",
                          borderRadius: "2px",
                          minWidth: row.digital > 0 ? "4px" : "0px",
                        }}
                      />
                    </div>
                    <span style={{ fontFamily: MONO, fontSize: "0.65rem", color: "rgba(0,200,170,0.6)", minWidth: "160px", textAlign: "right" }}>{t(row.digitalLabelKey)}</span>
                  </div>
                </div>
              </div>
            ))}
          </motion.div>

          {/* ── The compounding advantage chart ── */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7 }}
            style={{
              padding: "2rem",
              border: "1px solid rgba(201,168,76,0.12)",
              borderRadius: "4px",
              background: "rgba(201,168,76,0.02)",
              marginBottom: "3rem",
            }}
          >
            <p style={{
              fontFamily: MONO,
              fontSize: "0.8rem",
              letterSpacing: "0.25em",
              textTransform: "uppercase",
              color: "#C9A84C",
              marginBottom: "0.5rem",
              textAlign: "center",
            }}>
              {t("impact.compounding")}
            </p>
            <p style={{
              fontFamily: SERIF,
              fontSize: "1.1rem",
              color: "rgba(245,230,200,0.45)",
              textAlign: "center",
              marginBottom: "1.5rem",
              lineHeight: 1.6,
            }}>
              {t("impact.compoundingDesc")}
            </p>

            {/* SVG chart: Print (linear) vs Digital (flat) */}
            <CostComparisonChart />
          </motion.div>

          {/* ── The recycling myth ── */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
              gap: "1.5rem",
              marginBottom: "3rem",
            }}
          >
            <div style={{
              padding: "1.5rem",
              border: "1px solid rgba(180,80,60,0.15)",
              borderRadius: "4px",
              background: "rgba(180,80,60,0.03)",
            }}>
              <p style={{
                fontFamily: MONO,
                fontSize: "0.8rem",
                letterSpacing: "0.2em",
                textTransform: "uppercase",
                color: "rgba(180,80,60,0.7)",
                marginBottom: "0.75rem",
              }}>
                {t("impact.recyclingMyth")}
              </p>
              <p style={{
                fontFamily: SERIF,
                fontSize: "1.1rem",
                color: "rgba(245,230,200,0.55)",
                lineHeight: 1.7,
              }}>
                {t("impact.recyclingMythDesc")}
              </p>
            </div>
            <div style={{
              padding: "1.5rem",
              border: "1px solid rgba(0,200,170,0.15)",
              borderRadius: "4px",
              background: "rgba(0,200,170,0.03)",
            }}>
              <p style={{
                fontFamily: MONO,
                fontSize: "0.8rem",
                letterSpacing: "0.2em",
                textTransform: "uppercase",
                color: "rgba(0,200,170,0.7)",
                marginBottom: "0.75rem",
              }}>
                {t("impact.digitalAlt")}
              </p>
              <p style={{
                fontFamily: SERIF,
                fontSize: "1.1rem",
                color: "rgba(245,230,200,0.55)",
                lineHeight: 1.7,
              }}>
                {t("impact.digitalAltDesc")}
              </p>
            </div>
          </motion.div>

          {/* ── Closing argument ── */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            style={{ textAlign: "center", maxWidth: "700px", margin: "0 auto" }}
          >
            <div style={{
              width: "60px",
              height: "1px",
              background: "rgba(201,168,76,0.3)",
              margin: "0 auto 2rem",
            }} />
            <p style={{
              fontFamily: SERIF,
              fontSize: "clamp(1.2rem, 3vw, 1.6rem)",
              fontStyle: "italic",
              color: "rgba(245,230,200,0.75)",
              lineHeight: 1.6,
              marginBottom: "1rem",
            }}>
              {t("impact.closing")}
            </p>
            <p style={{
              fontFamily: SERIF,
              fontSize: "1.05rem",
              color: "rgba(245,230,200,0.45)",
              lineHeight: 1.7,
              marginBottom: "2rem",
            }}>
              {t("impact.closingDesc")}
            </p>
            <Link href="/library" passHref>
              <motion.button
                className="relative"
                style={{
                  fontFamily: MONO,
                  fontSize: "0.8rem",
                  letterSpacing: "0.25em",
                  textTransform: "uppercase",
                  color: "rgba(0,200,170,0.85)",
                  background: "transparent",
                  border: "1px solid rgba(0,200,170,0.4)",
                  padding: "0.9rem 2.5rem",
                  cursor: "pointer",
                  transition: "all 0.3s ease",
                }}
                whileHover={{
                  borderColor: "rgba(0,200,170,0.8)",
                  boxShadow: "0 0 24px rgba(0,200,170,0.15)",
                  color: "rgba(0,230,190,1)",
                }}
                whileTap={{ scale: 0.98 }}
              >
                {t("impact.cta")}
              </motion.button>
            </Link>
            <p style={{
              fontFamily: MONO,
              fontSize: "0.6rem",
              letterSpacing: "0.15em",
              color: "rgba(201,168,76,0.25)",
              textTransform: "uppercase",
              marginTop: "1rem",
            }}>
              {t("impact.dataSources")}
            </p>
          </motion.div>
        </div>
      </section>
    </div>
  );
}

// ─── SECTION HEADER COMPONENT ──────────────────────────────────────
function SectionHeader({ tag, title }: { tag: string; title: string }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.6 }}
      style={{ textAlign: "center" }}
    >
      <p style={{
        fontFamily: MONO,
        fontSize: "0.8rem",
        letterSpacing: "0.2em",
        textTransform: "uppercase",
        color: "#C9A84C",
        marginBottom: "0.75rem",
      }}>
        {tag}
      </p>
      <h2 style={{
        fontFamily: SERIF,
        fontSize: "clamp(1.8rem, 4vw, 2.6rem)",
        fontWeight: 400,
        color: "#F5E6C8",
        lineHeight: 1.3,
      }}>
        {title}
      </h2>
    </motion.div>
  );
}

// ─── ANIMATED COUNTER COMPONENT ────────────────────────────────────
function AnimatedCounter({ value }: { value: string }) {
  const [displayed, setDisplayed] = useState(value);
  const [hasAnimated, setHasAnimated] = useState(false);

  // Extract numeric part and suffix (e.g., "417M" → 417, "M")
  const numMatch = value.match(/^([\d.]+)(.*)$/);
  const targetNum = numMatch ? parseFloat(numMatch[1]) : 0;
  const suffix = numMatch ? numMatch[2] : value;

  useEffect(() => {
    if (hasAnimated) return;
    // Will be triggered by intersection observer below
  }, [hasAnimated]);

  return (
    <motion.p
      style={{
        fontFamily: MONO,
        fontSize: "clamp(1.8rem, 4vw, 2.4rem)",
        fontWeight: 700,
        color: "rgba(0,200,170,0.9)",
        lineHeight: 1,
      }}
      initial={{ opacity: 0, scale: 0.8 }}
      whileInView={{ opacity: 1, scale: 1 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5, ease: "easeOut" }}
      onViewportEnter={() => {
        if (hasAnimated) return;
        setHasAnimated(true);
        const duration = 1200;
        const startTime = Date.now();
        const tick = () => {
          const elapsed = Date.now() - startTime;
          const progress = Math.min(elapsed / duration, 1);
          const eased = 1 - Math.pow(1 - progress, 3); // ease-out cubic
          const current = targetNum * eased;
          if (targetNum >= 100) {
            setDisplayed(Math.round(current) + suffix);
          } else if (targetNum >= 10) {
            setDisplayed(current.toFixed(1) + suffix);
          } else {
            setDisplayed(current.toFixed(1) + suffix);
          }
          if (progress < 1) requestAnimationFrame(tick);
          else setDisplayed(value);
        };
        requestAnimationFrame(tick);
      }}
    >
      {displayed}
    </motion.p>
  );
}

// ─── COST COMPARISON CHART (SVG: linear print vs flat digital) ────────────
function CostComparisonChart() {
  const { t } = useI18n();
  const W = 600;
  const H = 260;
  const PAD = { top: 20, right: 20, bottom: 40, left: 50 };
  const chartW = W - PAD.left - PAD.right;
  const chartH = H - PAD.top - PAD.bottom;

  // Data: books read (x) → environmental cost index (y)
  // Print: linear growth. Digital: flat after initial device cost.
  const points = [0, 5, 10, 20, 30, 50, 75, 100];
  const printCost = points.map((x) => x * 7.5); // 7.5 kg CO₂ per book
  const digitalCost = points.map((x) => 30 + x * 0.1); // device amortized + marginal
  const maxY = 750;

  const toX = (val: number) => PAD.left + (val / 100) * chartW;
  const toY = (val: number) => PAD.top + chartH - (val / maxY) * chartH;

  const printPath = points.map((x, i) => `${i === 0 ? "M" : "L"}${toX(x)},${toY(printCost[i])}`).join(" ");
  const digitalPath = points.map((x, i) => `${i === 0 ? "M" : "L"}${toX(x)},${toY(digitalCost[i])}`).join(" ");

  const booksReadLabel = t("impact.chartBooks");
  const co2CostLabel = t("impact.chartCost");

  return (
    <div style={{ width: "100%", maxWidth: `${W}px`, margin: "0 auto" }}>
      <svg
        viewBox={`0 0 ${W} ${H}`}
        style={{ width: "100%", height: "auto" }}
        preserveAspectRatio="xMidYMid meet"
      >
        {/* Grid lines */}
        {[0, 150, 300, 450, 600, 750].map((y) => (
          <line
            key={y}
            x1={PAD.left}
            y1={toY(y)}
            x2={W - PAD.right}
            y2={toY(y)}
            stroke="rgba(245,230,200,0.06)"
            strokeWidth="1"
          />
        ))}

        {/* Y-axis labels */}
        {[0, 150, 300, 450, 600, 750].map((y) => (
          <text
            key={`label-${y}`}
            x={PAD.left - 8}
            y={toY(y) + 3}
            textAnchor="end"
            style={{ fontFamily: MONO, fontSize: "10px", fill: "rgba(245,230,200,0.3)" }}
          >
            {y}
          </text>
        ))}

        {/* X-axis labels */}
        {[0, 25, 50, 75, 100].map((x) => (
          <text
            key={`x-${x}`}
            x={toX(x)}
            y={H - PAD.bottom + 18}
            textAnchor="middle"
            style={{ fontFamily: MONO, fontSize: "10px", fill: "rgba(245,230,200,0.3)" }}
          >
            {x}
          </text>
        ))}

        {/* Axis labels */}
        <text
          x={W / 2}
          y={H - 4}
          textAnchor="middle"
          style={{ fontFamily: MONO, fontSize: "9px", fill: "rgba(245,230,200,0.3)", letterSpacing: "0.1em" }}
        >
          {booksReadLabel}
        </text>
        <text
          x={12}
          y={PAD.top + chartH / 2}
          textAnchor="middle"
          transform={`rotate(-90, 12, ${PAD.top + chartH / 2})`}
          style={{ fontFamily: MONO, fontSize: "9px", fill: "rgba(245,230,200,0.3)", letterSpacing: "0.1em" }}
        >
          {co2CostLabel}
        </text>

        {/* Print line (red/warm) */}
        <motion.path
          d={printPath}
          fill="none"
          stroke="rgba(180,80,60,0.7)"
          strokeWidth="2"
          strokeLinecap="round"
          initial={{ pathLength: 0 }}
          whileInView={{ pathLength: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 1.5, delay: 0.3, ease: "easeOut" }}
        />

        {/* Digital line (green/teal) */}
        <motion.path
          d={digitalPath}
          fill="none"
          stroke="rgba(0,200,170,0.7)"
          strokeWidth="2"
          strokeLinecap="round"
          initial={{ pathLength: 0 }}
          whileInView={{ pathLength: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 1.5, delay: 0.5, ease: "easeOut" }}
        />

        {/* Legend */}
        <rect x={PAD.left + 10} y={PAD.top + 8} width="12" height="2" rx="1" fill="rgba(180,80,60,0.7)" />
        <text x={PAD.left + 28} y={PAD.top + 12} style={{ fontFamily: MONO, fontSize: "9px", fill: "rgba(180,80,60,0.7)" }}>
          Print (linear)
        </text>
        <rect x={PAD.left + 10} y={PAD.top + 22} width="12" height="2" rx="1" fill="rgba(0,200,170,0.7)" />
        <text x={PAD.left + 28} y={PAD.top + 26} style={{ fontFamily: MONO, fontSize: "9px", fill: "rgba(0,200,170,0.7)" }}>
          Digital (flat)
        </text>
      </svg>
    </div>
  );
}
