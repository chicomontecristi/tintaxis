"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { useI18n } from "@/lib/i18n";

// ─── CHANGELOG — TINTAXIS ──────────────────────────────────────────────────
// Every update, feature, and tool built for the platform.

const MONO   = '"JetBrains Mono", monospace';
const SERIF  = '"EB Garamond", Garamond, Georgia, serif';
const BRASS  = "rgba(201,168,76,";
const CREAM  = "rgba(245,230,200,";

type EntryTag = "feature" | "tool" | "fix" | "content" | "infra" | "design" | "launch";

interface ChangelogEntry {
  date: string;
  tag: EntryTag;
  titleKey: string;
  descKey: string;
}

const TAG_COLORS: Record<EntryTag, string> = {
  feature: "rgba(0,229,204,0.7)",
  tool:    "rgba(201,168,76,0.8)",
  fix:     "rgba(192,57,43,0.7)",
  content: "rgba(147,112,219,0.7)",
  infra:   "rgba(100,149,237,0.7)",
  design:  "rgba(245,166,35,0.7)",
  launch:  "rgba(46,204,113,0.8)",
};

// ── Entries (newest first) ────────────────────────────────────────────────

const ENTRIES: ChangelogEntry[] = [
  // ── April 2026 ──
  { date: "2026-04-14", tag: "infra",    titleKey: "cl.seoRedirect.title",     descKey: "cl.seoRedirect.desc" },
  { date: "2026-04-14", tag: "feature",  titleKey: "cl.ghostPersist.title",    descKey: "cl.ghostPersist.desc" },
  { date: "2026-04-14", tag: "design",   titleKey: "cl.bookCovers.title",      descKey: "cl.bookCovers.desc" },
  { date: "2026-04-13", tag: "fix",      titleKey: "cl.audioUploadLimit.title", descKey: "cl.audioUploadLimit.desc" },
  { date: "2026-04-10", tag: "feature",  titleKey: "cl.netRevenue.title",      descKey: "cl.netRevenue.desc" },
  { date: "2026-04-10", tag: "feature",  titleKey: "cl.perTitleRevenue.title", descKey: "cl.perTitleRevenue.desc" },
  { date: "2026-04-10", tag: "feature",  titleKey: "cl.salesLedger.title",     descKey: "cl.salesLedger.desc" },
  { date: "2026-04-10", tag: "design",   titleKey: "cl.heroCTAs.title",        descKey: "cl.heroCTAs.desc" },
  { date: "2026-04-10", tag: "feature",  titleKey: "cl.heroAudio.title",       descKey: "cl.heroAudio.desc" },
  { date: "2026-04-10", tag: "content",  titleKey: "cl.journalLaunch.title",   descKey: "cl.journalLaunch.desc" },
  { date: "2026-04-10", tag: "feature",  titleKey: "cl.followProject.title",   descKey: "cl.followProject.desc" },
  { date: "2026-04-10", tag: "content",  titleKey: "cl.chroniclerArtifacts.title", descKey: "cl.chroniclerArtifacts.desc" },
  { date: "2026-04-09", tag: "feature",  titleKey: "cl.i18nFull.title",        descKey: "cl.i18nFull.desc" },
  { date: "2026-04-09", tag: "feature",  titleKey: "cl.changelog.title",       descKey: "cl.changelog.desc" },
  { date: "2026-04-08", tag: "fix",      titleKey: "cl.cdnCache.title",        descKey: "cl.cdnCache.desc" },
  { date: "2026-04-08", tag: "feature",  titleKey: "cl.bookReader.title",      descKey: "cl.bookReader.desc" },
  { date: "2026-04-07", tag: "feature",  titleKey: "cl.studioMultiBook.title", descKey: "cl.studioMultiBook.desc" },
  { date: "2026-04-06", tag: "feature",  titleKey: "cl.i18nLaunch.title",      descKey: "cl.i18nLaunch.desc" },
  { date: "2026-04-06", tag: "feature",  titleKey: "cl.darkLightMode.title",   descKey: "cl.darkLightMode.desc" },
  { date: "2026-04-06", tag: "tool",     titleKey: "cl.artPathways.title",     descKey: "cl.artPathways.desc" },

  // ── March 2026 ──
  { date: "2026-03-23", tag: "feature",  titleKey: "cl.passwordReset.title",   descKey: "cl.passwordReset.desc" },
  { date: "2026-03-23", tag: "feature",  titleKey: "cl.voiceoverSystem.title", descKey: "cl.voiceoverSystem.desc" },
  { date: "2026-03-23", tag: "feature",  titleKey: "cl.aiNarrators.title",     descKey: "cl.aiNarrators.desc" },
  { date: "2026-03-22", tag: "design",   titleKey: "cl.experiencePage.title",  descKey: "cl.experiencePage.desc" },
  { date: "2026-03-22", tag: "design",   titleKey: "cl.libraryPage.title",     descKey: "cl.libraryPage.desc" },
  { date: "2026-03-22", tag: "content",  titleKey: "cl.fourBooks.title",       descKey: "cl.fourBooks.desc" },
  { date: "2026-03-22", tag: "feature",  titleKey: "cl.authorWhispers.title",  descKey: "cl.authorWhispers.desc" },
  { date: "2026-03-22", tag: "feature",  titleKey: "cl.signalQuestions.title",  descKey: "cl.signalQuestions.desc" },
  { date: "2026-03-22", tag: "feature",  titleKey: "cl.sixInks.title",         descKey: "cl.sixInks.desc" },
  { date: "2026-03-22", tag: "feature",  titleKey: "cl.analyticsTab.title",    descKey: "cl.analyticsTab.desc" },
  { date: "2026-03-22", tag: "feature",  titleKey: "cl.readerAuth.title",      descKey: "cl.readerAuth.desc" },
  { date: "2026-03-22", tag: "infra",    titleKey: "cl.pwa.title",             descKey: "cl.pwa.desc" },
  { date: "2026-03-21", tag: "feature",  titleKey: "cl.stripeIntegration.title", descKey: "cl.stripeIntegration.desc" },
  { date: "2026-03-21", tag: "feature",  titleKey: "cl.subscriptionTiers.title", descKey: "cl.subscriptionTiers.desc" },
  { date: "2026-03-21", tag: "design",   titleKey: "cl.writerProfiles.title",  descKey: "cl.writerProfiles.desc" },
  { date: "2026-03-21", tag: "infra",    titleKey: "cl.supabase.title",        descKey: "cl.supabase.desc" },
  { date: "2026-03-20", tag: "feature",  titleKey: "cl.chapterRain.title",     descKey: "cl.chapterRain.desc" },
  { date: "2026-03-20", tag: "feature",  titleKey: "cl.authorStudio.title",    descKey: "cl.authorStudio.desc" },
  { date: "2026-03-20", tag: "design",   titleKey: "cl.publishPage.title",     descKey: "cl.publishPage.desc" },
  { date: "2026-03-17", tag: "design",   titleKey: "cl.designSystem.title",    descKey: "cl.designSystem.desc" },
  { date: "2026-03-17", tag: "design",   titleKey: "cl.howItWorks.title",      descKey: "cl.howItWorks.desc" },
  { date: "2026-03-17", tag: "design",   titleKey: "cl.impactPage.title",      descKey: "cl.impactPage.desc" },
  { date: "2026-03-17", tag: "infra",    titleKey: "cl.vercelDeploy.title",    descKey: "cl.vercelDeploy.desc" },
  { date: "2026-03-17", tag: "launch",   titleKey: "cl.genesis.title",         descKey: "cl.genesis.desc" },
];

// ── Helpers ────────────────────────────────────────────────────────────────

function groupByMonth(entries: ChangelogEntry[]) {
  const groups: { monthKey: string; entries: ChangelogEntry[] }[] = [];
  let current: { monthKey: string; entries: ChangelogEntry[] } | null = null;

  for (const entry of entries) {
    const [y, m] = entry.date.split("-");
    const monthKey = `${y}-${m}`;
    if (!current || current.monthKey !== monthKey) {
      current = { monthKey, entries: [] };
      groups.push(current);
    }
    current.entries.push(entry);
  }
  return groups;
}

function formatMonth(monthKey: string, t: (k: string) => string) {
  const [y, m] = monthKey.split("-");
  const months: Record<string, string> = {
    "01": t("cl.month.jan"), "02": t("cl.month.feb"), "03": t("cl.month.mar"),
    "04": t("cl.month.apr"), "05": t("cl.month.may"), "06": t("cl.month.jun"),
    "07": t("cl.month.jul"), "08": t("cl.month.aug"), "09": t("cl.month.sep"),
    "10": t("cl.month.oct"), "11": t("cl.month.nov"), "12": t("cl.month.dec"),
  };
  return `${months[m] || m} ${y}`;
}

function formatDay(dateStr: string) {
  return dateStr.split("-")[2].replace(/^0/, "");
}

// ─── COMPONENT ──────────────────────────────────────────────────────────────

export default function ChangelogClient() {
  const { t } = useI18n();
  const [filter, setFilter] = useState<EntryTag | "all">("all");

  const filtered = filter === "all"
    ? ENTRIES
    : ENTRIES.filter((e) => e.tag === filter);

  const groups = groupByMonth(filtered);
  const tags: EntryTag[] = ["feature", "tool", "fix", "content", "infra", "design", "launch"];

  return (
    <div style={{
      minHeight: "100vh",
      backgroundColor: "#0D0B08",
      paddingTop: "5rem",
      paddingBottom: "6rem",
    }}>
      <div style={{
        maxWidth: "720px",
        margin: "0 auto",
        padding: "0 clamp(1rem, 4vw, 2rem)",
      }}>

        {/* ── Header ── */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <p style={{
            fontFamily: MONO,
            fontSize: "0.5rem",
            letterSpacing: "0.35em",
            color: `${BRASS}0.4)`,
            textTransform: "uppercase",
            marginBottom: "0.5rem",
          }}>
            {t("cl.label")}
          </p>
          <h1 style={{
            fontFamily: SERIF,
            fontSize: "clamp(1.8rem, 5vw, 2.6rem)",
            fontWeight: 400,
            color: "#F5E6C8",
            lineHeight: 1.15,
            marginBottom: "0.5rem",
          }}>
            {t("cl.title")}
          </h1>
          <p style={{
            fontFamily: SERIF,
            fontSize: "1rem",
            fontStyle: "italic",
            color: `${CREAM}0.35)`,
            lineHeight: 1.6,
            marginBottom: "2rem",
          }}>
            {t("cl.subtitle")}
          </p>
        </motion.div>

        {/* ── Filter pills ── */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.15, duration: 0.5 }}
          style={{
            display: "flex",
            flexWrap: "wrap",
            gap: "0.4rem",
            marginBottom: "2.5rem",
          }}
        >
          <FilterPill
            label={t("cl.filter.all")}
            active={filter === "all"}
            color={`${BRASS}0.6)`}
            onClick={() => setFilter("all")}
          />
          {tags.map((tag) => (
            <FilterPill
              key={tag}
              label={t(`cl.filter.${tag}`)}
              active={filter === tag}
              color={TAG_COLORS[tag]}
              onClick={() => setFilter(tag)}
            />
          ))}
        </motion.div>

        <div style={{
          height: "1px",
          background: `linear-gradient(90deg, transparent, ${BRASS}0.2), transparent)`,
          marginBottom: "2.5rem",
        }} />

        {/* ── Timeline ── */}
        <AnimatePresence mode="wait">
          <motion.div
            key={filter}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
          >
            {groups.length === 0 && (
              <p style={{
                fontFamily: SERIF,
                fontSize: "1rem",
                fontStyle: "italic",
                color: `${CREAM}0.3)`,
                textAlign: "center",
                padding: "3rem 0",
              }}>
                {t("cl.noEntries")}
              </p>
            )}

            {groups.map((group, gi) => (
              <div key={group.monthKey} style={{ marginBottom: "2.5rem" }}>
                {/* Month header */}
                <motion.h2
                  initial={{ opacity: 0, x: -8 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: gi * 0.05, duration: 0.4 }}
                  style={{
                    fontFamily: MONO,
                    fontSize: "0.55rem",
                    letterSpacing: "0.3em",
                    color: `${BRASS}0.5)`,
                    textTransform: "uppercase",
                    marginBottom: "1.25rem",
                    paddingBottom: "0.5rem",
                    borderBottom: `1px solid ${BRASS}0.08)`,
                  }}
                >
                  {formatMonth(group.monthKey, t)}
                </motion.h2>

                {/* Entries */}
                {group.entries.map((entry, ei) => (
                  <motion.div
                    key={`${entry.date}-${entry.titleKey}`}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: gi * 0.05 + ei * 0.03, duration: 0.35 }}
                    style={{
                      display: "flex",
                      gap: "1rem",
                      marginBottom: "1.25rem",
                      alignItems: "flex-start",
                    }}
                  >
                    {/* Date column */}
                    <div style={{
                      fontFamily: MONO,
                      fontSize: "0.7rem",
                      color: `${CREAM}0.2)`,
                      minWidth: "28px",
                      textAlign: "right",
                      paddingTop: "2px",
                      flexShrink: 0,
                    }}>
                      {formatDay(entry.date)}
                    </div>

                    {/* Dot */}
                    <div style={{
                      width: "7px",
                      height: "7px",
                      borderRadius: "50%",
                      background: TAG_COLORS[entry.tag],
                      marginTop: "6px",
                      flexShrink: 0,
                      boxShadow: `0 0 6px ${TAG_COLORS[entry.tag]}`,
                    }} />

                    {/* Content */}
                    <div style={{ flex: 1 }}>
                      <div style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "0.5rem",
                        marginBottom: "0.25rem",
                        flexWrap: "wrap",
                      }}>
                        <span style={{
                          fontFamily: MONO,
                          fontSize: "0.4rem",
                          letterSpacing: "0.15em",
                          color: TAG_COLORS[entry.tag],
                          textTransform: "uppercase",
                          border: `1px solid ${TAG_COLORS[entry.tag]}33`,
                          padding: "1px 6px",
                          borderRadius: "2px",
                        }}>
                          {t(`cl.filter.${entry.tag}`)}
                        </span>
                        <h3 style={{
                          fontFamily: SERIF,
                          fontSize: "1.05rem",
                          fontWeight: 400,
                          color: "#F5E6C8",
                          lineHeight: 1.3,
                          margin: 0,
                        }}>
                          {t(entry.titleKey)}
                        </h3>
                      </div>
                      <p style={{
                        fontFamily: SERIF,
                        fontSize: "0.88rem",
                        color: `${CREAM}0.35)`,
                        lineHeight: 1.55,
                        margin: 0,
                      }}>
                        {t(entry.descKey)}
                      </p>
                    </div>
                  </motion.div>
                ))}
              </div>
            ))}
          </motion.div>
        </AnimatePresence>

        {/* ── Footer ── */}
        <div style={{
          height: "1px",
          background: `linear-gradient(90deg, transparent, ${BRASS}0.12), transparent)`,
          margin: "2rem 0 1.5rem",
        }} />

        <p style={{
          fontFamily: SERIF,
          fontSize: "0.9rem",
          fontStyle: "italic",
          color: `${CREAM}0.25)`,
          textAlign: "center",
          lineHeight: 1.6,
        }}>
          {t("cl.footer")}
        </p>

        <p style={{
          fontFamily: MONO,
          fontSize: "0.45rem",
          letterSpacing: "0.15em",
          color: `${BRASS}0.25)`,
          textAlign: "center",
          textTransform: "uppercase",
          marginTop: "1rem",
        }}>
          <Link href="/" style={{ color: `${BRASS}0.35)`, textDecoration: "none" }}>
            {t("cl.backToArchive")}
          </Link>
        </p>
      </div>
    </div>
  );
}

// ─── FILTER PILL ────────────────────────────────────────────────────────────

function FilterPill({ label, active, color, onClick }: {
  label: string;
  active: boolean;
  color: string;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      style={{
        fontFamily: MONO,
        fontSize: "0.45rem",
        letterSpacing: "0.15em",
        textTransform: "uppercase",
        color: active ? "#0D0B08" : color,
        background: active ? color : "transparent",
        border: `1px solid ${active ? color : `${color}33`}`,
        padding: "3px 10px",
        cursor: "pointer",
        borderRadius: "2px",
        transition: "all 0.2s ease",
      }}
    >
      {label}
    </button>
  );
}
