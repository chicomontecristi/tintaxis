"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense } from "react";
import TintaxisLogo from "@/components/ui/TintaxisLogo";

// ─── READER SIGN IN ───────────────────────────────────────────────────────────

export default function ReaderLoginPage() {
  return (
    <Suspense fallback={<div style={{ minHeight: "100vh", backgroundColor: "#0D0B08" }} />}>
      <ReaderLoginInner />
    </Suspense>
  );
}

function ReaderLoginInner() {
  const router      = useRouter();
  const searchParams = useSearchParams();
  const returnTo    = searchParams.get("from") ?? "/";

  const [email,    setEmail]    = useState("");
  const [password, setPassword] = useState("");
  const [error,    setError]    = useState<string | null>(null);
  const [loading,  setLoading]  = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const res = await fetch("/api/reader/login", {
      method:  "POST",
      headers: { "Content-Type": "application/json" },
      body:    JSON.stringify({ email, password }),
    });

    const data = await res.json();
    setLoading(false);

    if (!res.ok) {
      setError(data.error ?? "Login failed");
      return;
    }

    router.push(returnTo);
  }

  return (
    <div
      style={{
        minHeight:       "100vh",
        backgroundColor: "#0D0B08",
        display:         "flex",
        flexDirection:   "column",
        alignItems:      "center",
        justifyContent:  "center",
        padding:         "2rem",
      }}
    >
      {/* ── Top logo ── */}
      <motion.div
        initial={{ opacity: 0, y: -12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7 }}
        style={{ marginBottom: "2.5rem", textAlign: "center" }}
      >
        <Link href="/" style={{ textDecoration: "none", display: "inline-flex", alignItems: "center", gap: "0.6rem" }}>
          <TintaxisLogo size={22} />
          <span style={{
            fontFamily:    '"JetBrains Mono", monospace',
            fontSize:      "0.55rem",
            letterSpacing: "0.3em",
            color:         "rgba(201,168,76,0.5)",
            textTransform: "uppercase",
          }}>
            Tintaxis
          </span>
        </Link>
      </motion.div>

      {/* ── Card ── */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7, delay: 0.1 }}
        style={{
          width:      "100%",
          maxWidth:   "420px",
          border:     "1px solid rgba(201,168,76,0.15)",
          background: "rgba(201,168,76,0.02)",
          padding:    "2.5rem",
        }}
      >
        {/* Header */}
        <p style={{
          fontFamily:    '"JetBrains Mono", monospace',
          fontSize:      "0.5rem",
          letterSpacing: "0.3em",
          color:         "rgba(201,168,76,0.4)",
          textTransform: "uppercase",
          marginBottom:  "0.75rem",
        }}>
          Archive Entry
        </p>
        <h1 style={{
          fontFamily:   '"EB Garamond", Garamond, Georgia, serif',
          fontSize:     "1.9rem",
          fontWeight:   400,
          color:        "#F5E6C8",
          lineHeight:   1.15,
          marginBottom: "0.5rem",
        }}>
          Enter the Archive
        </h1>
        <p style={{
          fontFamily:   '"EB Garamond", Garamond, Georgia, serif',
          fontSize:     "0.9rem",
          fontStyle:    "italic",
          color:        "rgba(245,230,200,0.35)",
          marginBottom: "2rem",
          lineHeight:   1.6,
        }}>
          Your annotations are waiting.
        </p>

        <div style={{ height: "1px", background: "rgba(201,168,76,0.1)", marginBottom: "2rem" }} />

        {/* Form */}
        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: "1.25rem" }}>
            <label style={labelStyle}>Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              autoComplete="email"
              style={inputStyle}
            />
          </div>

          <div style={{ marginBottom: "1.75rem" }}>
            <label style={labelStyle}>Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              autoComplete="current-password"
              style={inputStyle}
            />
          </div>

          {error && (
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              style={{
                fontFamily:    '"JetBrains Mono", monospace',
                fontSize:      "0.5rem",
                letterSpacing: "0.1em",
                color:         "#8B1A1A",
                marginBottom:  "1.25rem",
                textTransform: "uppercase",
              }}
            >
              ✕ {error}
            </motion.p>
          )}

          <motion.button
            type="submit"
            disabled={loading}
            style={{
              width:         "100%",
              fontFamily:    '"JetBrains Mono", monospace',
              fontSize:      "0.6rem",
              letterSpacing: "0.2em",
              textTransform: "uppercase",
              color:         loading ? "rgba(13,11,8,0.6)" : "#0D0B08",
              background:    loading ? "rgba(201,168,76,0.5)" : "#C9A84C",
              border:        "none",
              padding:       "0.85rem 2rem",
              cursor:        loading ? "not-allowed" : "pointer",
            }}
            whileHover={loading ? {} : { background: "#E8C97A" }}
            whileTap={loading ? {} : { scale: 0.98 }}
            transition={{ duration: 0.15 }}
          >
            {loading ? "Verifying..." : "Open the Archive →"}
          </motion.button>
        </form>

        <div style={{ height: "1px", background: "rgba(201,168,76,0.08)", margin: "2rem 0 1.5rem" }} />

        <p style={{
          fontFamily:    '"JetBrains Mono", monospace',
          fontSize:      "0.45rem",
          letterSpacing: "0.1em",
          color:         "rgba(201,168,76,0.3)",
          textAlign:     "center",
          textTransform: "uppercase",
        }}>
          No account?{" "}
          <Link
            href={`/reader/signup${returnTo !== "/" ? `?from=${encodeURIComponent(returnTo)}` : ""}`}
            style={{ color: "rgba(201,168,76,0.6)", textDecoration: "none" }}
          >
            Request access →
          </Link>
        </p>
      </motion.div>
    </div>
  );
}

// ─── SHARED STYLES ────────────────────────────────────────────────────────────

const labelStyle: React.CSSProperties = {
  display:       "block",
  fontFamily:    '"JetBrains Mono", monospace',
  fontSize:      "0.45rem",
  letterSpacing: "0.2em",
  color:         "rgba(201,168,76,0.4)",
  textTransform: "uppercase",
  marginBottom:  "0.5rem",
};

const inputStyle: React.CSSProperties = {
  width:           "100%",
  fontFamily:      '"EB Garamond", Garamond, Georgia, serif',
  fontSize:        "1rem",
  color:           "#F5E6C8",
  background:      "rgba(201,168,76,0.04)",
  border:          "1px solid rgba(201,168,76,0.15)",
  padding:         "0.65rem 0.85rem",
  outline:         "none",
  boxSizing:       "border-box",
};
