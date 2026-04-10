"use client";

import { usePathname, useRouter } from "next/navigation";
import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { AnimatePresence, motion } from "framer-motion";
import ThemeToggle from "./ThemeToggle";
import { useI18n, LOCALE_LABELS, LOCALE_FLAGS, type Locale } from "@/lib/i18n";

// ─── SITE NAV ───────────────────────────────────────────────────────────────
// Hamburger-first navigation. Bar shows logo + compact utilities.
// All page links live inside the fullscreen overlay.

const MONO = '"JetBrains Mono", monospace';

function ShareOnX() {
  const handleShare = () => {
    const url = typeof window !== "undefined" ? window.location.href : "https://tintaxis.com";
    const text = encodeURIComponent(`@tintaxis `);
    window.open(
      `https://twitter.com/intent/tweet?text=${text}&url=${encodeURIComponent(url)}`,
      "_blank",
      "width=550,height=420"
    );
  };
  return (
    <button
      onClick={handleShare}
      aria-label="Share on X"
      title="Share on X"
      style={{
        fontFamily: MONO,
        fontSize: "0.8rem",
        letterSpacing: "0.15em",
        color: "rgba(201,168,76,0.35)",
        background: "none",
        border: "1px solid rgba(201,168,76,0.12)",
        borderRadius: "2px",
        cursor: "pointer",
        padding: "3px 8px",
        transition: "all 0.2s ease",
        display: "inline-flex",
        alignItems: "center",
        gap: "4px",
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.color = "rgba(201,168,76,0.8)";
        e.currentTarget.style.borderColor = "rgba(201,168,76,0.35)";
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.color = "rgba(201,168,76,0.35)";
        e.currentTarget.style.borderColor = "rgba(201,168,76,0.12)";
      }}
    >
      <span style={{ fontSize: "0.75rem", lineHeight: 1 }}>𝕏</span>
    </button>
  );
}

function LanguageSwitcher() {
  const { locale, setLocale } = useI18n();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [open]);

  const locales: Locale[] = ["en", "es", "zh", "pt", "it"];

  return (
    <div ref={ref} style={{ position: "relative", display: "inline-flex" }}>
      <button
        onClick={() => setOpen(!open)}
        aria-label="Change language"
        title="Change language"
        style={{
          fontFamily: MONO,
          fontSize: "0.7rem",
          letterSpacing: "0.15em",
          color: "rgba(201,168,76,0.4)",
          background: "none",
          border: "1px solid rgba(201,168,76,0.12)",
          borderRadius: "2px",
          cursor: "pointer",
          padding: "3px 8px",
          transition: "all 0.2s ease",
          display: "inline-flex",
          alignItems: "center",
          gap: "4px",
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.color = "rgba(201,168,76,0.8)";
          e.currentTarget.style.borderColor = "rgba(201,168,76,0.35)";
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.color = "rgba(201,168,76,0.4)";
          e.currentTarget.style.borderColor = "rgba(201,168,76,0.12)";
        }}
      >
        <span style={{ fontSize: "0.75rem" }}>&#127760;</span>
        <span>{LOCALE_FLAGS[locale]}</span>
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            transition={{ duration: 0.15 }}
            style={{
              position: "absolute",
              top: "calc(100% + 6px)",
              right: 0,
              zIndex: 100,
              background: "#0D0B08",
              border: "1px solid rgba(201,168,76,0.2)",
              minWidth: "130px",
              boxShadow: "0 8px 24px rgba(0,0,0,0.5)",
            }}
          >
            {locales.map((l) => (
              <button
                key={l}
                onClick={() => { setLocale(l); setOpen(false); }}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "8px",
                  width: "100%",
                  padding: "8px 12px",
                  fontFamily: MONO,
                  fontSize: "0.7rem",
                  letterSpacing: "0.1em",
                  color: l === locale ? "rgba(201,168,76,0.9)" : "rgba(201,168,76,0.45)",
                  background: l === locale ? "rgba(201,168,76,0.06)" : "transparent",
                  border: "none",
                  cursor: "pointer",
                  textAlign: "left",
                  transition: "all 0.15s ease",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = "rgba(201,168,76,0.08)";
                  e.currentTarget.style.color = "rgba(201,168,76,0.8)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = l === locale ? "rgba(201,168,76,0.06)" : "transparent";
                  e.currentTarget.style.color = l === locale ? "rgba(201,168,76,0.9)" : "rgba(201,168,76,0.45)";
                }}
              >
                <span style={{ fontWeight: 600, minWidth: "20px" }}>{LOCALE_FLAGS[l]}</span>
                <span>{LOCALE_LABELS[l]}</span>
              </button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// Nav link definitions — labels are i18n keys, resolved at render time
const PUBLIC_LINK_DEFS = [
  { href: "/library", i18nKey: "nav.library" },
  { href: "/writers", i18nKey: "nav.writers" },
  { href: "/experience", i18nKey: "nav.experience" },
  { href: "/publish", i18nKey: "nav.publish" },
  { href: "/impact", i18nKey: "nav.impact" },
  { href: "/how-it-works", i18nKey: "nav.howItWorks" },
  { href: "/journal", i18nKey: "nav.journal" },
  { href: "/changelog", i18nKey: "nav.changelog" },
  { href: "https://art-opportunity-finder--montecristi.replit.app", i18nKey: "nav.artPathways", external: true },
] as const;

export default function SiteNav() {
  const pathname = usePathname();
  const router = useRouter();
  const { t } = useI18n();
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

  // Build auth links (translated)
  const authLinks: { href: string; label: string; external?: boolean }[] = [];
  if (session.role === "author") {
    authLinks.push({ href: "/author", label: t("nav.studio") });
  } else if (session.role === "reader") {
    authLinks.push({ href: "/reader/login", label: t("nav.account") });
  } else {
    authLinks.push({ href: "/reader/login", label: t("nav.signIn") });
    authLinks.push({ href: "/author/login", label: t("nav.authorLogin") });
  }

  // Resolve i18n keys for public links
  const publicLinks = PUBLIC_LINK_DEFS.map((l) => ({
    href: l.href,
    label: t(l.i18nKey),
    external: "external" in l ? l.external : false,
  }));
  const allLinks = [...publicLinks, ...authLinks];

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
          transition: "background 0.05s ease, border-color 0.05s ease",
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

        {/* ── Right side: compact utilities + hamburger ── */}
        <div style={{
          display: "flex",
          gap: "0.5rem",
          alignItems: "center",
        }}>
          <LanguageSwitcher />
          <ShareOnX />
          <ThemeToggle />

          {/* Hamburger button — always visible */}
          <button
            onClick={() => setMenuOpen(!menuOpen)}
            aria-label={menuOpen ? "Close menu" : "Open menu"}
            style={{
              background: "none",
              border: "1px solid rgba(201,168,76,0.12)",
              borderRadius: "2px",
              cursor: "pointer",
              padding: "6px 7px",
              display: "flex",
              flexDirection: "column",
              gap: "4px",
              alignItems: "center",
              justifyContent: "center",
              transition: "border-color 0.2s ease",
              marginLeft: "0.25rem",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.borderColor = "rgba(201,168,76,0.35)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.borderColor = "rgba(201,168,76,0.12)";
            }}
          >
            <span style={{
              display: "block",
              width: "18px",
              height: "1.5px",
              background: "rgba(201,168,76,0.6)",
              transition: "all 0.3s ease",
              transform: menuOpen ? "rotate(45deg) translateY(2.75px)" : "none",
            }} />
            <span style={{
              display: "block",
              width: "18px",
              height: "1.5px",
              background: "rgba(201,168,76,0.6)",
              transition: "all 0.3s ease",
              opacity: menuOpen ? 0 : 1,
            }} />
            <span style={{
              display: "block",
              width: "18px",
              height: "1.5px",
              background: "rgba(201,168,76,0.6)",
              transition: "all 0.3s ease",
              transform: menuOpen ? "rotate(-45deg) translateY(-2.75px)" : "none",
            }} />
          </button>
        </div>
      </nav>

      {/* ── Fullscreen menu overlay ── */}
      <AnimatePresence>
        {menuOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            style={{
              position: "fixed",
              inset: 0,
              zIndex: 49,
              background: "rgba(13,11,8,0.97)",
              backdropFilter: "blur(12px)",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "safe center",
              gap: "1.25rem",
              paddingTop: "4rem",
              paddingBottom: "2rem",
              overflowY: "auto",
            }}
          >
            {allLinks.map(({ href, label, external }, i) => {
              const isActive = !external && (pathname === href || pathname.startsWith(href + "/"));
              const linkStyle: React.CSSProperties = {
                fontFamily: MONO,
                fontSize: "1rem",
                letterSpacing: "0.3em",
                color: isActive ? "rgba(201,168,76,0.9)" : "rgba(201,168,76,0.5)",
                textDecoration: "none",
                textTransform: "uppercase",
                transition: "color 0.2s ease",
              };
              return (
                <motion.div
                  key={href}
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.04, duration: 0.3 }}
                >
                  {external ? (
                    <a href={href} target="_blank" rel="noopener noreferrer"
                       onClick={() => setMenuOpen(false)} style={linkStyle}>
                      {label}
                    </a>
                  ) : (
                    <Link href={href} onClick={() => setMenuOpen(false)} style={linkStyle}>
                      {label}
                    </Link>
                  )}
                </motion.div>
              );
            })}
            {session.role && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: allLinks.length * 0.04 + 0.05, duration: 0.3 }}
                style={{ marginTop: "0.5rem" }}
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
                  {t("nav.logOut")}
                </button>
              </motion.div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
