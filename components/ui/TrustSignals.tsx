"use client";

import { motion } from "framer-motion";

// ─── TRUST & AUTHORITY SIGNALS ───────────────────────────────────────────────
// Social proof, awards, and credibility markers.
// Drop these into the homepage, library, and book pages to build trust.

const MONO = '"JetBrains Mono", monospace';
const SERIF = '"EB Garamond", Garamond, Georgia, serif';
const BRASS = "rgba(201,168,76,";
const CREAM = "rgba(245,230,200,";

// ── Awards bar (for homepage and library) ────────────────────────────────────

const CREDENTIALS = [
  { label: "Tucson Festival of Books", detail: "Literary Award Finalist", year: "2020" },
  { label: "Arizona Commission on the Arts", detail: "Creative Youth Grant", year: "2022" },
  { label: "Published Muralist", detail: "Amphitheater School District", year: "2022" },
  { label: "4 Books", detail: "English · Spanish · Mandarin", year: "" },
];

export function AuthorCredentials() {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.8, delay: 0.3 }}
      style={{
        display: "flex",
        flexWrap: "wrap",
        justifyContent: "center",
        gap: "clamp(0.5rem, 2vw, 1rem)",
        padding: "0 1rem",
      }}
    >
      {CREDENTIALS.map((cred, i) => (
        <div
          key={i}
          style={{
            padding: "8px 14px",
            border: `1px solid ${BRASS}0.1)`,
            background: `${BRASS}0.02)`,
            textAlign: "center",
            minWidth: "140px",
            flex: "0 1 auto",
          }}
        >
          <p
            style={{
              fontFamily: MONO,
              fontSize: "0.38rem",
              letterSpacing: "0.2em",
              textTransform: "uppercase",
              color: `${BRASS}0.45)`,
              margin: "0 0 2px",
            }}
          >
            {cred.label}
          </p>
          <p
            style={{
              fontFamily: SERIF,
              fontSize: "0.75rem",
              fontStyle: "italic",
              color: `${CREAM}0.55)`,
              margin: 0,
              lineHeight: 1.3,
            }}
          >
            {cred.detail}
            {cred.year && (
              <span style={{ color: `${CREAM}0.25)`, fontSize: "0.65rem" }}>
                {" "}· {cred.year}
              </span>
            )}
          </p>
        </div>
      ))}
    </motion.div>
  );
}

// ── Compact trust line (for book pages, above "Begin Reading") ──────────────

export function TrustLine() {
  return (
    <div
      style={{
        display: "flex",
        flexWrap: "wrap",
        alignItems: "center",
        justifyContent: "center",
        gap: "clamp(0.75rem, 3vw, 1.5rem)",
        padding: "0.75rem 0",
      }}
    >
      <TrustBadge text="Literary Award Finalist" />
      <TrustDot />
      <TrustBadge text="Free to Read" />
      <TrustDot />
      <TrustBadge text="3 Languages" />
    </div>
  );
}

function TrustBadge({ text }: { text: string }) {
  return (
    <span
      style={{
        fontFamily: MONO,
        fontSize: "0.38rem",
        letterSpacing: "0.2em",
        textTransform: "uppercase",
        color: `${BRASS}0.4)`,
      }}
    >
      {text}
    </span>
  );
}

function TrustDot() {
  return (
    <span
      style={{
        width: "3px",
        height: "3px",
        borderRadius: "50%",
        background: `${BRASS}0.2)`,
        display: "inline-block",
      }}
    />
  );
}

// ── Social proof strip (for homepage, below hero) ───────────────────────────

export function SocialProofStrip() {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.6, delay: 0.5 }}
      style={{
        display: "flex",
        flexWrap: "wrap",
        justifyContent: "center",
        alignItems: "center",
        gap: "clamp(1rem, 4vw, 2.5rem)",
        padding: "1.5rem 1rem",
        borderTop: `1px solid ${BRASS}0.06)`,
        borderBottom: `1px solid ${BRASS}0.06)`,
      }}
    >
      <ProofItem number="5" label="Gallery exhibitions" />
      <ProofItem number="3" label="Languages" />
      <ProofItem number="25k+" label="Words published" />
      <ProofItem number="2020" label="Award finalist" />
    </motion.div>
  );
}

function ProofItem({ number, label }: { number: string; label: string }) {
  return (
    <div style={{ textAlign: "center", minWidth: "80px" }}>
      <p
        style={{
          fontFamily: SERIF,
          fontSize: "clamp(1.1rem, 3vw, 1.4rem)",
          fontStyle: "italic",
          color: `${CREAM}0.7)`,
          margin: "0 0 2px",
          lineHeight: 1,
        }}
      >
        {number}
      </p>
      <p
        style={{
          fontFamily: MONO,
          fontSize: "0.35rem",
          letterSpacing: "0.15em",
          textTransform: "uppercase",
          color: `${BRASS}0.35)`,
          margin: 0,
        }}
      >
        {label}
      </p>
    </div>
  );
}

// ── "As featured at" (for homepage or library) ──────────────────────────────

export function FeaturedAt() {
  const venues = [
    "Arts HQ Gallery, Surprise AZ",
    "First Studio Gallery, Phoenix",
    "Raíces Taller 222, Tucson",
    "&Gallery, Tucson",
  ];

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.6, delay: 0.6 }}
      style={{
        textAlign: "center",
        padding: "1rem 1rem 0.5rem",
      }}
    >
      <p
        style={{
          fontFamily: MONO,
          fontSize: "0.35rem",
          letterSpacing: "0.3em",
          textTransform: "uppercase",
          color: `${BRASS}0.25)`,
          margin: "0 0 0.5rem",
        }}
      >
        Exhibited at
      </p>
      <p
        style={{
          fontFamily: SERIF,
          fontSize: "0.8rem",
          fontStyle: "italic",
          color: `${CREAM}0.3)`,
          lineHeight: 1.8,
          margin: 0,
        }}
      >
        {venues.join(" · ")}
      </p>
    </motion.div>
  );
}
