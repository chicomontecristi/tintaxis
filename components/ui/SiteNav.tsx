"use client";

import { usePathname, useRouter } from "next/navigation";
import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { AnimatePresence, motion } from "framer-motion";
import ThemeToggle from "./ThemeToggle";

// ─── SITE NAV ───────────────────────────────────────────────────────────────
// Minimal persistent navigation. Hidden on homepage (/) to keep it clean.
// Collapses to hamburger menu on mobile (<768px).

const MONO = '"JetBrains Mono", monospace';

const PUBLIC_LINKS = [
  { href: "/library", label: "Library" },
  { href: "/writers", label: "Writers" },
  { href: "/experience", label: "Experience" },
  { href: "/publish", label: "Publish" },
  { href: "/impact", label: "Impact" },
  { href: "/how-it-works", label: "How It Works" },
];

export default function SiteNav() {
  const pathname = usePathname();
  const router = useRouter();
  const [session, setSession] = useState<{ role: string | null; name?: string }>({ role: null });
  const [menuOpen, setMenuOpen] = useState(false);

  const handleLogout = async () => {
    await fetch("/api/auth/logout", { method: "POST" });
    setSession({ role: null });
    setMenuOpen(false);
    router.push("/");
    router.refresh();
  };

  useEffect(() => {
    fetch("/api/auth/me")
      .then((r) => r.json())
      .then((data) => setSession(data))
      .catch(() => {});
  }, [pathname]);

  // Close menu on route change
  useEffect(() => {
    setMenuOpen(false);
  }, [pathname]);

  // Close menu on escape
  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === "Escape") setMenuOpen(false);
    };
    window.addEventListener("keydown", handleEsc);
    return () => window.removeEventListener("keydown", handleEsc);
  }, []);

  // Lock body scroll when menu open
  useEffect(() => {
    if (menuOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => { document.body.style.overflow = ""; };
  }, [menuOpen]);

  // Hide on homepage
  if (pathname === "/") return null;

  // Build auth links
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
    <>
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
          borderBottom: "1px solid var(--border-subtle)",
          background: "var(--nav-bg)",
          backdropFilter: "blur(8px)",
          transition: "background 0.4s ease, border-color 0.4s ease",
        }}
      >
        {/* Logo */}
        <Link
          href="/"
          style={{
            fontFamily: MONO,
            fontSize: "0.85rem",
            letterSpacing: "0.25em",
            color: "var(--brass-dim)",
            textDecoration: "none",
            textTransform: "uppercase",
          }}
        >
          Tintaxis
        </Link>

        {/* ── Desktop links (hidden on mobile) ── */}
        <div className="nav-desktop-links" style={{
          display: "flex",
          gap: "clamp(0.75rem, 2.5vw, 1.5rem)",
          alignItems: "center",
        }}>
          {allLinks.map(({ href, label }) => {
            const isActive = pathname === href || pathname.startsWith(href + "/");
            return (
              <Link
                key={href}
                href={href}
                style={{
                  fontFamily: MONO,
                  fontSize: "0.8rem",
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
          <ThemeToggle />
          {session.role && (
            <button
              onClick={handleLogout}
              style={{
                fontFamily: MONO,
                fontSize: "0.8rem",
                letterSpacing: "0.2em",
                color: "rgba(192,57,43,0.45)",
                background: "none",
                border: "none",
                cursor: "pointer",
                textTransform: "uppercase",
                padding: 0,
                transition: "color 0.2s ease",
              }}
              onMouseEnter={(e) => (e.currentTarget.style.color = "rgba(192,57,43,0.8)")}
              onMouseLeave={(e) => (e.currentTarget.style.color = "rgba(192,57,43,0.45)")}
            >
              Log Out
            </button>
          )}
        </div>

        {/* ── Hamburger button (mobile only) ── */}
        <button
          className="nav-hamburger"
          onClick={() => setMenuOpen(!menuOpen)}
          aria-label={menuOpen ? "Close menu" : "Open menu"}
          style={{
            display: "none", // shown via CSS media query
            background: "none",
            border: "none",
            cursor: "pointer",
            padding: "6px",
            flexDirection: "column",
            gap: "5px",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <span style={{
            display: "block",
            width: "22px",
            height: "1.5px",
            background: "rgba(201,168,76,0.6)",
            transition: "all 0.3s ease",
            transform: menuOpen ? "rotate(45deg) translateY(3.25px)" : "none",
          }} />
          <span style={{
            display: "block",
            width: "22px",
            height: "1.5px",
            background: "rgba(201,168,76,0.6)",
            transition: "all 0.3s ease",
            opacity: menuOpen ? 0 : 1,
          }} />
          <span style={{
            display: "block",
            width: "22px",
            height: "1.5px",
            background: "rgba(201,168,76,0.6)",
            transition: "all 0.3s ease",
            transform: menuOpen ? "rotate(-45deg) translateY(-3.25px)" : "none",
          }} />
        </button>
      </nav>

      {/* ── Mobile menu overlay ── */}
      <AnimatePresence>
        {menuOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="nav-mobile-overlay"
            style={{
              position: "fixed",
              inset: 0,
              zIndex: 49,
              background: "rgba(13,11,8,0.97)",
              backdropFilter: "blur(12px)",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              gap: "1.5rem",
              paddingBottom: "4rem",
            }}
          >
            {allLinks.map(({ href, label }, i) => {
              const isActive = pathname === href || pathname.startsWith(href + "/");
              return (
                <motion.div
                  key={href}
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.05, duration: 0.3 }}
                >
                  <Link
                    href={href}
                    onClick={() => setMenuOpen(false)}
                    style={{
                      fontFamily: MONO,
                      fontSize: "1rem",
                      letterSpacing: "0.3em",
                      color: isActive
                        ? "rgba(201,168,76,0.9)"
                        : "rgba(201,168,76,0.5)",
                      textDecoration: "none",
                      textTransform: "uppercase",
                      transition: "color 0.2s ease",
                    }}
                  >
                    {label}
                  </Link>
                </motion.div>
              );
            })}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: allLinks.length * 0.05, duration: 0.3 }}
              style={{ marginTop: "1rem" }}
            >
              <ThemeToggle />
            </motion.div>
            {session.role && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: (allLinks.length + 1) * 0.05, duration: 0.3 }}
              >
                <button
                  onClick={handleLogout}
                  style={{
                    fontFamily: MONO,
                    fontSize: "1rem",
                    letterSpacing: "0.3em",
                    color: "rgba(192,57,43,0.5)",
                    background: "none",
                    border: "none",
                    cursor: "pointer",
                    textTransform: "uppercase",
                    padding: 0,
                  }}
                >
                  Log Out
                </button>
              </motion.div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
