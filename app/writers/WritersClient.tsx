"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import Image from "next/image";
import { FEATURED_WRITERS, type FeaturedWriter } from "@/lib/featured-writers";
import TintaxisLogo from "@/components/ui/TintaxisLogo";

// ─── FEATURED ARTISTS PAGE ───────────────────────────────────────────────────
// Writers published directly by Tintaxis — curated, no application required.

export default function WritersClient() {
  return (
    <div className="min-h-screen" style={{ backgroundColor: "#0D0B08" }}>

      {/* ── Top Nav ─────────────────────────────────────────────── */}
      <nav
        style={{
          position: "fixed",
          top: 0, left: 0, right: 0,
          zIndex: 50,
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          padding: "0.85rem clamp(1rem, 4vw, 2rem)",
          borderBottom: "1px solid rgba(201,168,76,0.07)",
          background: "rgba(13,11,8,0.9)",
          backdropFilter: "blur(8px)",
        }}
      >
        <Link href="/" style={{ textDecoration: "none", display: "flex", alignItems: "center", gap: "0.5rem" }}>
          <TintaxisLogo size={20} />
          <span style={{
            fontFamily: '"JetBrains Mono", monospace',
            fontSize: "0.5rem",
            letterSpacing: "0.25em",
            color: "rgba(201,168,76,0.55)",
            textTransform: "uppercase",
          }}>
            Tintaxis
          </span>
        </Link>
        <div style={{ display: "flex", gap: "1.75rem", alignItems: "center" }}>
          <Link href="/publish" style={{
            fontFamily: '"JetBrains Mono", monospace',
            fontSize: "0.5rem",
            letterSpacing: "0.25em",
            color: "rgba(201,168,76,0.45)",
            textDecoration: "none",
            textTransform: "uppercase",
          }}>
            Publish on Tintaxis
          </Link>
          <span style={{
            fontFamily: '"JetBrains Mono", monospace',
            fontSize: "0.5rem",
            letterSpacing: "0.25em",
            color: "#C9A84C",
            textTransform: "uppercase",
          }}>
            Featured Artists
          </span>
          <Link href="/author/login" style={{
            fontFamily: '"JetBrains Mono", monospace',
            fontSize: "0.5rem",
            letterSpacing: "0.25em",
            color: "rgba(245,230,200,0.2)",
            textDecoration: "none",
            textTransform: "uppercase",
          }}>
            Author Login →
          </Link>
        </div>
      </nav>

      {/* ── Page content ────────────────────────────────────────── */}
      <div style={{
        maxWidth: "960px",
        margin: "0 auto",
        padding: "clamp(6rem, 12vw, 8rem) clamp(1rem, 4vw, 2rem) 6rem",
      }}>

        {/* ── Header ─────────────────────────────────────────── */}
        <motion.div
          style={{ textAlign: "center", marginBottom: "4rem" }}
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: [0.2, 0, 0.1, 1] }}
        >
          <p style={{
            fontFamily: '"JetBrains Mono", monospace',
            fontSize: "0.55rem",
            letterSpacing: "0.35em",
            color: "rgba(201,168,76,0.4)",
            textTransform: "uppercase",
            marginBottom: "1rem",
          }}>
            Tintaxis · Featured Artists
          </p>
          <h1 style={{
            fontFamily: '"EB Garamond", Garamond, Georgia, serif',
            fontSize: "clamp(1.75rem, 5vw, 3rem)",
            fontWeight: 400,
            color: "#F5E6C8",
            letterSpacing: "-0.01em",
            lineHeight: 1.15,
            marginBottom: "1.25rem",
          }}>
            The Writers of This Archive
          </h1>
          <p style={{
            fontFamily: '"EB Garamond", Garamond, Georgia, serif',
            fontSize: "1rem",
            fontStyle: "italic",
            color: "rgba(245,230,200,0.45)",
            lineHeight: 1.7,
            maxWidth: "52ch",
            margin: "0 auto 2rem",
          }}>
            These writers were invited directly. No application. No committee.
            Their work is published here because it deserves to be read.
          </p>
          <div className="brass-line" style={{ maxWidth: "320px", margin: "0 auto" }} />
        </motion.div>

        {/* ── Writer Grid ─────────────────────────────────────── */}
        <div style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))",
          gap: "1.5rem",
        }}>
          {FEATURED_WRITERS.map((writer, i) => (
            <WriterCard key={writer.slug} writer={writer} index={i} />
          ))}
        </div>

        {/* ── Bottom note ─────────────────────────────────────── */}
        <motion.div
          style={{ textAlign: "center", marginTop: "5rem" }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8, duration: 0.6 }}
        >
          <div className="brass-line" style={{ maxWidth: "200px", margin: "0 auto 1.5rem" }} />
          <p style={{
            fontFamily: '"JetBrains Mono", monospace',
            fontSize: "0.5rem",
            letterSpacing: "0.2em",
            color: "rgba(201,168,76,0.25)",
            textTransform: "uppercase",
          }}>
            New writers added by invitation
          </p>
        </motion.div>
      </div>
    </div>
  );
}

// ─── WRITER CARD ─────────────────────────────────────────────────────────────

function WriterCard({ writer, index }: { writer: FeaturedWriter; index: number }) {
  const displayName = writer.artistName ?? writer.name;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay: 0.1 + index * 0.12, ease: [0.2, 0, 0.1, 1] }}
    >
      <Link href={`/writers/${writer.slug}`} style={{ textDecoration: "none" }}>
        <motion.div
          style={{
            border: "1px solid rgba(201,168,76,0.15)",
            background: "rgba(13,11,8,0.6)",
            padding: "1.75rem",
            cursor: "pointer",
            position: "relative",
            overflow: "hidden",
          }}
          whileHover={{
            borderColor: "rgba(201,168,76,0.35)",
            background: "rgba(201,168,76,0.03)",
          }}
          transition={{ duration: 0.2 }}
        >
          {/* Corner accent */}
          <div style={{
            position: "absolute", top: 0, right: 0,
            width: "40px", height: "40px",
            borderLeft: "1px solid rgba(201,168,76,0.12)",
            borderBottom: "1px solid rgba(201,168,76,0.12)",
          }} />

          {/* Photo */}
          <div style={{
            width: "72px", height: "72px",
            borderRadius: "50%",
            border: "1px solid rgba(201,168,76,0.2)",
            overflow: "hidden",
            marginBottom: "1rem",
            background: "rgba(201,168,76,0.06)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            flexShrink: 0,
          }}>
            {writer.photo ? (
              <Image
                src={writer.photo}
                alt={displayName}
                width={72}
                height={72}
                style={{ objectFit: "cover", width: "100%", height: "100%" }}
              />
            ) : (
              <span style={{
                fontFamily: '"EB Garamond", Garamond, Georgia, serif',
                fontSize: "1.5rem",
                color: "rgba(201,168,76,0.4)",
                fontStyle: "italic",
              }}>
                {displayName[0]}
              </span>
            )}
          </div>

          {/* Genre tag */}
          <p style={{
            fontFamily: '"JetBrains Mono", monospace',
            fontSize: "0.45rem",
            letterSpacing: "0.2em",
            color: "rgba(201,168,76,0.45)",
            textTransform: "uppercase",
            marginBottom: "0.5rem",
          }}>
            {writer.genre}
          </p>

          {/* Name */}
          <p style={{
            fontFamily: '"EB Garamond", Garamond, Georgia, serif',
            fontSize: "1.25rem",
            fontStyle: "italic",
            color: "#F5E6C8",
            lineHeight: 1.2,
            marginBottom: "0.25rem",
          }}>
            {displayName}
          </p>

          {/* Origin */}
          <p style={{
            fontFamily: '"JetBrains Mono", monospace',
            fontSize: "0.45rem",
            letterSpacing: "0.1em",
            color: "rgba(201,168,76,0.3)",
            textTransform: "uppercase",
            marginBottom: "1rem",
          }}>
            {writer.origin}
          </p>

          {/* Brass rule */}
          <div style={{ height: "1px", background: "rgba(201,168,76,0.1)", marginBottom: "1rem" }} />

          {/* Short bio */}
          <p style={{
            fontFamily: '"EB Garamond", Garamond, Georgia, serif',
            fontSize: "0.9rem",
            fontStyle: "italic",
            color: "rgba(245,230,200,0.5)",
            lineHeight: 1.65,
            marginBottom: "1.25rem",
          }}>
            {writer.shortBio}
          </p>

          {/* Works count */}
          <p style={{
            fontFamily: '"JetBrains Mono", monospace',
            fontSize: "0.45rem",
            letterSpacing: "0.15em",
            color: "rgba(201,168,76,0.35)",
            textTransform: "uppercase",
          }}>
            {writer.works.length} work{writer.works.length !== 1 ? "s" : ""} · View profile →
          </p>
        </motion.div>
      </Link>
    </motion.div>
  );
}
