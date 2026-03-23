"use client";

import { usePathname } from "next/navigation";
import Link from "next/link";

// ─── SITE NAV ───────────────────────────────────────────────────────────────
// Minimal persistent navigation. Hidden on homepage (/) to keep it clean.

const MONO = '"JetBrains Mono", monospace';

const LINKS = [
  { href: "/library", label: "Library" },
  { href: "/writers", label: "Writers" },
  { href: "/publish", label: "Publish" },
  { href: "/experience", label: "Experience" },
  { href: "/account", label: "Account" },
];

export default function SiteNav() {
  const pathname = usePathname();

  // Hide on homepage — it has its own presentation
  if (pathname === "/") return null;

  return (
    <nav
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        zIndex: 50,
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        padding: "0.65rem clamp(1rem, 4vw, 2rem)",
        borderBottom: "1px solid rgba(201,168,76,0.07)",
        background: "rgba(13,11,8,0.9)",
        backdropFilter: "blur(8px)",
      }}
    >
      <Link
        href="/"
        style={{
          fontFamily: MONO,
          fontSize: "0.7rem",
          letterSpacing: "0.25em",
          color: "rgba(201,168,76,0.6)",
          textDecoration: "none",
          textTransform: "uppercase",
        }}
      >
        Tintaxis
      </Link>

      <div style={{ display: "flex", gap: "clamp(0.75rem, 2.5vw, 1.5rem)", alignItems: "center" }}>
        {LINKS.map(({ href, label }) => (
          <Link
            key={href}
            href={href}
            style={{
              fontFamily: MONO,
              fontSize: "0.65rem",
              letterSpacing: "0.2em",
              color: pathname === href
                ? "rgba(201,168,76,0.8)"
                : "rgba(201,168,76,0.4)",
              textDecoration: "none",
              textTransform: "uppercase",
              transition: "color 0.2s ease",
            }}
          >
            {label}
          </Link>
        ))}
      </div>
    </nav>
  );
}
