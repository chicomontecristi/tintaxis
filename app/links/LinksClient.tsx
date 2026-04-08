"use client";

import Link from "next/link";
import { useState } from "react";

// ─── LINK IN BIO (CLIENT) ───────────────────────────────────────────────────
// Handles hover interactivity — server wrapper exports metadata.

interface LinkItem {
  label: string;
  sublabel: string;
  href: string;
  accent: string;
  external?: boolean;
}

const LINKS: LinkItem[] = [
  {
    label: "The Hunt",
    sublabel: "Read the opening chapter — free",
    href: "/book/the-hunt/excerpt",
    accent: "192, 57, 43",
  },
  {
    label: "Recoleta",
    sublabel: "Léelo en español — Capítulo Uno",
    href: "/book/recoleta/excerpt",
    accent: "184, 115, 51",
  },
  {
    label: "Noches de maya",
    sublabel: "Cuentos del Caribe y el desierto",
    href: "/book/noches-de-maya/excerpt",
    accent: "107, 63, 160",
  },
  {
    label: "我河口的鸟",
    sublabel: "书信集 · 中文",
    href: "/book/mi-pajaro-del-rio/excerpt",
    accent: "0, 229, 204",
  },
  {
    label: "The Full Library",
    sublabel: "All books on Tintaxis",
    href: "/library",
    accent: "201, 168, 76",
  },
  {
    label: "chicomontecristi.com",
    sublabel: "Art portfolio & paintings",
    href: "https://chicomontecristi.com",
    accent: "201, 168, 76",
    external: true,
  },
  {
    label: "@chicomontecristi",
    sublabel: "Instagram",
    href: "https://www.instagram.com/chicomontecristi",
    accent: "201, 168, 76",
    external: true,
  },
];

function LinkCard({ link }: { link: LinkItem }) {
  const [hovered, setHovered] = useState(false);
  const Tag = link.external ? "a" : Link;
  const extraProps = link.external
    ? { target: "_blank" as const, rel: "noopener noreferrer" }
    : {};

  return (
    <Tag
      href={link.href}
      {...(extraProps as Record<string, string>)}
      style={{
        display: "block",
        padding: "14px 18px",
        border: `1px solid rgba(${link.accent}, ${hovered ? 0.45 : 0.2})`,
        borderRadius: "3px",
        background: `rgba(${link.accent}, ${hovered ? 0.08 : 0.04})`,
        textDecoration: "none",
        transition: "border-color 0.18s ease, background 0.18s ease",
      }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <p
        style={{
          fontFamily: '"EB Garamond", Garamond, Georgia, serif',
          fontSize: "1.05rem",
          fontStyle: "italic",
          color: "rgba(245,230,200,0.82)",
          margin: "0 0 2px",
          lineHeight: 1.2,
        }}
      >
        {link.label}
      </p>
      <p
        style={{
          fontFamily: '"JetBrains Mono", monospace',
          fontSize: "0.4rem",
          letterSpacing: "0.15em",
          color: `rgba(${link.accent}, 0.5)`,
          textTransform: "uppercase",
          margin: 0,
        }}
      >
        {link.sublabel}
        {link.external && " ↗"}
      </p>
    </Tag>
  );
}

export default function LinksClient() {
  return (
    <div
      style={{
        minHeight: "100vh",
        backgroundColor: "#0D0B08",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        padding: "3rem 1.5rem 4rem",
      }}
    >
      {/* ── Author identity ──────────────────────────── */}
      <div style={{ textAlign: "center", marginBottom: "2.5rem" }}>
        <p
          style={{
            fontFamily: '"JetBrains Mono", monospace',
            fontSize: "0.45rem",
            letterSpacing: "0.35em",
            color: "rgba(201,168,76,0.4)",
            textTransform: "uppercase",
            marginBottom: "0.75rem",
          }}
        >
          Writer · Painter · Tintaxis
        </p>
        <h1
          style={{
            fontFamily: '"EB Garamond", Garamond, Georgia, serif',
            fontSize: "1.8rem",
            fontStyle: "italic",
            color: "rgba(245,230,200,0.85)",
            margin: "0 0 0.4rem",
            lineHeight: 1.15,
          }}
        >
          Chico Montecristi
        </h1>
        <p
          style={{
            fontFamily: '"EB Garamond", Garamond, Georgia, serif',
            fontSize: "0.9rem",
            fontStyle: "italic",
            color: "rgba(245,230,200,0.35)",
            margin: 0,
          }}
        >
          Four books. Three languages. First chapter free.
        </p>
      </div>

      {/* ── Links ────────────────────────────────────── */}
      <div
        style={{
          width: "100%",
          maxWidth: "400px",
          display: "flex",
          flexDirection: "column",
          gap: "0.6rem",
        }}
      >
        {LINKS.map((link) => (
          <LinkCard key={link.href} link={link} />
        ))}
      </div>

      {/* ── Footer ───────────────────────────────────── */}
      <p
        style={{
          fontFamily: '"JetBrains Mono", monospace',
          fontSize: "0.35rem",
          letterSpacing: "0.3em",
          color: "rgba(245,230,200,0.08)",
          textTransform: "uppercase",
          marginTop: "3rem",
        }}
      >
        tintaxis.vercel.app
      </p>
    </div>
  );
}
