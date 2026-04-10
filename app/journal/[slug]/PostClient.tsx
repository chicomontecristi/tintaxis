"use client";

// ─── JOURNAL POST CLIENT ─────────────────────────────────────────────────────
// Renders a single published journal entry.
// Body is author-written and rendered verbatim, paragraph by paragraph.

import { motion } from "framer-motion";
import Link from "next/link";
import { useI18n } from "@/lib/i18n";
import type { JournalPost } from "@/lib/content/journal-posts";

const MONO  = '"JetBrains Mono", monospace';
const SERIF = '"EB Garamond", Garamond, Georgia, serif';

function formatDate(iso: string): string {
  try {
    const d = new Date(iso);
    return d.toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  } catch {
    return iso;
  }
}

export default function PostClient({ post }: { post: JournalPost }) {
  const { t } = useI18n();

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "#0D0B08",
        color: "#F5E6C8",
        paddingTop: "6rem",
        paddingBottom: "6rem",
      }}
    >
      <article
        style={{
          maxWidth: "680px",
          margin: "0 auto",
          padding: "0 1.5rem",
        }}
      >
        {/* ── Meta header ───────────────────────────────────────────── */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          style={{ marginBottom: "2.5rem" }}
        >
          <Link
            href="/journal"
            style={{
              fontFamily: MONO,
              fontSize: "0.6rem",
              letterSpacing: "0.25em",
              textTransform: "uppercase",
              color: "rgba(201,168,76,0.6)",
              textDecoration: "none",
              display: "inline-block",
              marginBottom: "1.5rem",
            }}
          >
            ← {t("journal.label")}
          </Link>

          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "0.75rem",
              marginBottom: "1rem",
              flexWrap: "wrap",
            }}
          >
            <span
              style={{
                fontFamily: MONO,
                fontSize: "0.55rem",
                letterSpacing: "0.25em",
                textTransform: "uppercase",
                color: "#C9A84C",
                border: "1px solid rgba(201,168,76,0.4)",
                padding: "0.3rem 0.65rem",
              }}
            >
              {t(`journal.topic.${post.topic}`)}
            </span>
            <span
              style={{
                fontFamily: MONO,
                fontSize: "0.55rem",
                letterSpacing: "0.15em",
                textTransform: "uppercase",
                color: "rgba(245,230,200,0.4)",
              }}
            >
              {formatDate(post.publishedAt)}
            </span>
          </div>

          <h1
            style={{
              fontFamily: SERIF,
              fontSize: "clamp(2rem, 5vw, 2.8rem)",
              fontStyle: "italic",
              fontWeight: 400,
              color: "#F5E6C8",
              margin: 0,
              lineHeight: 1.25,
            }}
          >
            {t(post.titleKey)}
          </h1>

          <p
            style={{
              fontFamily: MONO,
              fontSize: "0.65rem",
              letterSpacing: "0.2em",
              textTransform: "uppercase",
              color: "rgba(201,168,76,0.5)",
              marginTop: "1.25rem",
              marginBottom: 0,
            }}
          >
            — {post.author}
          </p>

          <div
            style={{
              width: "200px",
              height: "1px",
              marginTop: "2rem",
              background:
                "linear-gradient(90deg, rgba(201,168,76,0.6), transparent)",
            }}
          />
        </motion.div>

        {/* ── Body ──────────────────────────────────────────────────── */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.7, delay: 0.15 }}
        >
          {post.body.map((paragraph, idx) => (
            <p
              key={idx}
              style={{
                fontFamily: SERIF,
                fontSize: "1.1rem",
                lineHeight: 1.85,
                color: "rgba(245,230,200,0.82)",
                margin: "0 0 1.5rem",
              }}
            >
              {paragraph}
            </p>
          ))}
        </motion.div>

        {/* ── Footer ───────────────────────────────────────────────── */}
        <div
          style={{
            marginTop: "4rem",
            paddingTop: "2rem",
            borderTop: "1px solid rgba(201,168,76,0.15)",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            flexWrap: "wrap",
            gap: "1rem",
          }}
        >
          <Link
            href="/journal"
            style={{
              fontFamily: MONO,
              fontSize: "0.6rem",
              letterSpacing: "0.25em",
              textTransform: "uppercase",
              color: "rgba(201,168,76,0.55)",
              textDecoration: "none",
              borderBottom: "1px solid rgba(201,168,76,0.25)",
              paddingBottom: "0.25rem",
            }}
          >
            ← {t("journal.backToList")}
          </Link>
          <Link
            href="/"
            style={{
              fontFamily: MONO,
              fontSize: "0.6rem",
              letterSpacing: "0.25em",
              textTransform: "uppercase",
              color: "rgba(201,168,76,0.55)",
              textDecoration: "none",
              borderBottom: "1px solid rgba(201,168,76,0.25)",
              paddingBottom: "0.25rem",
            }}
          >
            {t("journal.backHome")} →
          </Link>
        </div>
      </article>
    </div>
  );
}
