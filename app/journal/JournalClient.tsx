"use client";

// ─── JOURNAL / BEHIND THE INK ────────────────────────────────────────────────
// Client component for the Journal landing page.
// Topic stubs marked "Coming Soon" — post bodies to be authored by José.
// Pattern is identical to ChangelogClient: filterable stubs, i18n-driven copy.

import { motion } from "framer-motion";
import Link from "next/link";
import { useI18n } from "@/lib/i18n";
import { JOURNAL_POSTS } from "@/lib/content/journal-posts";

const MONO  = '"JetBrains Mono", monospace';
const SERIF = '"EB Garamond", Garamond, Georgia, serif';

type PostStatus = "coming-soon" | "published";

interface JournalStub {
  slug: string;
  status: PostStatus;
  titleKey: string;
  descKey: string;
  topicKey: string;
}

// Topic stubs. No body content — José will author each.
// These seed the SEO surface area for the target keywords.
const POSTS: JournalStub[] = [
  {
    slug: "future-of-digital-publishing",
    status: "coming-soon",
    titleKey: "journal.posts.future.title",
    descKey: "journal.posts.future.desc",
    topicKey: "journal.topic.publishing",
  },
  {
    slug: "interactive-storytelling",
    status: "coming-soon",
    titleKey: "journal.posts.interactive.title",
    descKey: "journal.posts.interactive.desc",
    topicKey: "journal.topic.craft",
  },
  {
    slug: "the-85-percent-economy",
    status: "coming-soon",
    titleKey: "journal.posts.economy.title",
    descKey: "journal.posts.economy.desc",
    topicKey: "journal.topic.economy",
  },
  {
    slug: "what-is-a-living-book",
    status: "coming-soon",
    titleKey: "journal.posts.livingBook.title",
    descKey: "journal.posts.livingBook.desc",
    topicKey: "journal.topic.craft",
  },
  {
    slug: "margin-whispers",
    status: "coming-soon",
    titleKey: "journal.posts.whispers.title",
    descKey: "journal.posts.whispers.desc",
    topicKey: "journal.topic.craft",
  },
  {
    slug: "why-85-to-writers",
    status: "coming-soon",
    titleKey: "journal.posts.why85.title",
    descKey: "journal.posts.why85.desc",
    topicKey: "journal.topic.economy",
  },
  {
    slug: "digital-artifacts",
    status: "coming-soon",
    titleKey: "journal.posts.artifacts.title",
    descKey: "journal.posts.artifacts.desc",
    topicKey: "journal.topic.craft",
  },
  {
    slug: "author-voiceovers",
    status: "coming-soon",
    titleKey: "journal.posts.voiceovers.title",
    descKey: "journal.posts.voiceovers.desc",
    topicKey: "journal.topic.craft",
  },
];

export default function JournalClient() {
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
      <div style={{ maxWidth: "780px", margin: "0 auto", padding: "0 1.5rem" }}>

        {/* ── HEADER ─────────────────────────────────────────────── */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          style={{ textAlign: "center", marginBottom: "3.5rem" }}
        >
          <p
            style={{
              fontFamily: MONO,
              fontSize: "0.65rem",
              letterSpacing: "0.35em",
              textTransform: "uppercase",
              color: "#C9A84C",
              marginBottom: "1rem",
            }}
          >
            {t("journal.label")}
          </p>
          <h1
            style={{
              fontFamily: SERIF,
              fontSize: "clamp(2rem, 5vw, 3rem)",
              fontStyle: "italic",
              fontWeight: 400,
              color: "#F5E6C8",
              margin: 0,
              lineHeight: 1.2,
            }}
          >
            {t("journal.title")}
          </h1>
          <div
            style={{
              width: "220px",
              height: "1px",
              margin: "1.5rem auto",
              background:
                "linear-gradient(90deg, transparent, rgba(201,168,76,0.6) 50%, transparent)",
            }}
          />
          <p
            style={{
              fontFamily: SERIF,
              fontSize: "1rem",
              color: "rgba(245,230,200,0.6)",
              lineHeight: 1.7,
              maxWidth: "560px",
              margin: "0 auto",
            }}
          >
            {t("journal.subtitle")}
          </p>
        </motion.div>

        {/* ── PUBLISHED POSTS ──────────────────────────────────────── */}
        <div style={{ display: "flex", flexDirection: "column", gap: "1.25rem", marginBottom: "1.25rem" }}>
          {JOURNAL_POSTS.map((post, idx) => (
            <motion.article
              key={post.slug}
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-50px" }}
              transition={{ duration: 0.5, delay: idx * 0.04 }}
            >
              <Link
                href={`/journal/${post.slug}`}
                style={{
                  display: "block",
                  padding: "1.75rem 1.5rem",
                  border: "1px solid rgba(201,168,76,0.28)",
                  background: "rgba(201,168,76,0.05)",
                  textDecoration: "none",
                  transition: "all 0.25s",
                }}
              >
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "0.75rem",
                    marginBottom: "0.75rem",
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
                      padding: "0.25rem 0.55rem",
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
                    {new Date(post.publishedAt).toLocaleDateString("en-US", {
                      year: "numeric",
                      month: "short",
                      day: "numeric",
                    })}
                  </span>
                </div>

                <h2
                  style={{
                    fontFamily: SERIF,
                    fontSize: "1.5rem",
                    fontStyle: "italic",
                    fontWeight: 400,
                    color: "#F5E6C8",
                    margin: "0 0 0.65rem",
                    lineHeight: 1.3,
                  }}
                >
                  {t(post.titleKey)}
                </h2>

                <p
                  style={{
                    fontFamily: SERIF,
                    fontSize: "1rem",
                    color: "rgba(245,230,200,0.65)",
                    lineHeight: 1.65,
                    margin: 0,
                  }}
                >
                  {t(post.descKey)}
                </p>

                <p
                  style={{
                    fontFamily: MONO,
                    fontSize: "0.55rem",
                    letterSpacing: "0.25em",
                    textTransform: "uppercase",
                    color: "rgba(201,168,76,0.7)",
                    margin: "1rem 0 0",
                  }}
                >
                  {t("journal.readMore")} →
                </p>
              </Link>
            </motion.article>
          ))}
        </div>

        {/* ── COMING SOON STUBS ───────────────────────────────────── */}
        <p
          style={{
            fontFamily: MONO,
            fontSize: "0.6rem",
            letterSpacing: "0.3em",
            textTransform: "uppercase",
            color: "rgba(201,168,76,0.4)",
            textAlign: "center",
            margin: "2rem 0 1.25rem",
          }}
        >
          {t("journal.upcoming")}
        </p>

        <div style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>
          {POSTS.map((post, idx) => (
            <motion.article
              key={post.slug}
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-50px" }}
              transition={{ duration: 0.5, delay: idx * 0.04 }}
              style={{
                padding: "1.5rem 1.5rem",
                border: "1px solid rgba(201,168,76,0.12)",
                background: "rgba(201,168,76,0.02)",
                transition: "all 0.25s",
              }}
            >
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "0.75rem",
                  marginBottom: "0.75rem",
                  flexWrap: "wrap",
                }}
              >
                <span
                  style={{
                    fontFamily: MONO,
                    fontSize: "0.55rem",
                    letterSpacing: "0.2em",
                    textTransform: "uppercase",
                    color: "rgba(201,168,76,0.55)",
                    border: "1px solid rgba(201,168,76,0.25)",
                    padding: "0.25rem 0.55rem",
                  }}
                >
                  {t(post.topicKey)}
                </span>
                <span
                  style={{
                    fontFamily: MONO,
                    fontSize: "0.55rem",
                    letterSpacing: "0.2em",
                    textTransform: "uppercase",
                    color: "rgba(245,230,200,0.35)",
                  }}
                >
                  {t("journal.status.comingSoon")}
                </span>
              </div>

              <h2
                style={{
                  fontFamily: SERIF,
                  fontSize: "1.35rem",
                  fontStyle: "italic",
                  fontWeight: 400,
                  color: "rgba(245,230,200,0.85)",
                  margin: "0 0 0.5rem",
                  lineHeight: 1.3,
                }}
              >
                {t(post.titleKey)}
              </h2>

              <p
                style={{
                  fontFamily: SERIF,
                  fontSize: "0.95rem",
                  color: "rgba(245,230,200,0.5)",
                  lineHeight: 1.65,
                  margin: 0,
                }}
              >
                {t(post.descKey)}
              </p>
            </motion.article>
          ))}
        </div>

        {/* ── BACK LINK ──────────────────────────────────────────── */}
        <div style={{ textAlign: "center", marginTop: "4rem" }}>
          <Link
            href="/"
            style={{
              fontFamily: MONO,
              fontSize: "0.65rem",
              letterSpacing: "0.25em",
              textTransform: "uppercase",
              color: "rgba(201,168,76,0.55)",
              textDecoration: "none",
              borderBottom: "1px solid rgba(201,168,76,0.3)",
              paddingBottom: "0.25rem",
            }}
          >
            ← {t("journal.backHome")}
          </Link>
        </div>
      </div>
    </div>
  );
}
