"use client";

import { usePathname } from "next/navigation";
import { useState, useEffect } from "react";
import Link from "next/link";

// ─── SITE NAV ───────────────────────────────────────────────────────────────
// Minimal persistent navigation. Hidden on homepage (/) to keep it clean.
// Shows context-aware auth links based on current session.

const MONO = '"JetBrains Mono", monospace';

const PUBLIC_LINKS = [
  { href: "/library", label: "Library" },
  { href: "/writers", label: "Writers" },
  { href: "/experience", label: "Experience" },
  { href: "/publish", label: "Publish" },
];

export default function SiteNav() {
  const pathname = usePathname();
  const [session, setSession] = useState<{ role: string | null; name?: string }>({ role: null });

  useEffect(() => {
    fetch("/api/auth/me")
      .then((r) => r.json())
      .then((data) => setSession(data))
      .catch(() => {});
  }, [pathname]); // Re-check session on route change

  // Hide on homepage — it has its own presentation
  if (pathname === "/") return null;

  // Build auth links based on session state
  const authLinks: { href: string; label: string }[] = [];
  if (session.role === "author") {
    authLinks.push({ href: "/author", label: "Studio" });
  } else if (session.role === "reader") {
    authLinks.push({ href: "/reader/login", label: "Account" });
  } else {
    authLinks.push({ href: "/reader/login", label: "Sign In" });
    authLinks.push({ href: "/author/login", label: "Author Login" });
  }

  const allLinks = [...PUBLIC_LINKS, ...authLinks];

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
        {allLinks.map(({ href, label }) => {
          const isActive = pathname === href || pathname.startsWith(href + "/");
          return (
            <Link
              key={href}
              href={href}
              style={{
                fontFamily: MONO,
                fontSize: "0.65rem",
                letterSpacing: "0.2em",
                color: isActive
                  ? "rgba(201,168,76,0.8)"
                  : "rgba(201,168,76,0.4)",
                textDecoration: "none",
                textTransform: "uppercase",
                transition: "color 0.2s ease",
              }}
            >
              {label}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
