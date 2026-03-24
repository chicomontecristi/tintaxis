"use client";

import { useState, FormEvent, Suspense } from "react";
import { motion } from "framer-motion";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import TintaxisLogo from "@/components/ui/TintaxisLogo";

// ─── RESET PASSWORD PAGE ────────────────────────────────────────────────────
// Reached via the email link: /reset-password?token=...
// Reader or author enters their new password.

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={<div style={{ minHeight: "100vh", backgroundColor: "#0D0B08" }} />}>
      <ResetPasswordInner />
    </Suspense>
  );
}

function ResetPasswordInner() {
  const searchParams = useSearchParams();
  const token = searchParams.get("token") ?? "";

  const [password, setPassword]       = useState("");
  const [confirm, setConfirm]         = useState("");
  const [status, setStatus]           = useState<"idle" | "loading" | "success" | "error">("idle");
  const [errorMsg, setErrorMsg]       = useState("");
  const [isAuthor, setIsAuthor]       = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setErrorMsg("");

    if (password.length < 8) {
      setErrorMsg("Password must be at least 8 characters.");
      return;
    }

    if (password !== confirm) {
      setErrorMsg("Passwords don't match.");
      return;
    }

    setStatus("loading");

    try {
      const res = await fetch("/api/auth/reset-confirm", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        setErrorMsg(data.error ?? "Reset failed.");
        setStatus("error");
        return;
      }

      if (data.isAuthor) setIsAuthor(true);
      setStatus("success");
    } catch {
      setErrorMsg("Connection failed. Try again.");
      setStatus("error");
    }
  };

  if (!token) {
    return (
      <div style={{
        minHeight: "100vh",
        backgroundColor: "#0D0B08",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "2rem",
      }}>
        <div style={{ textAlign: "center" }}>
          <p style={{
            fontFamily: '"EB Garamond", Garamond, Georgia, serif',
            fontSize: "1.1rem",
            color: "rgba(245,230,200,0.5)",
            marginBottom: "1.5rem",
          }}>
            Invalid reset link. Request a new one from the login page.
          </p>
          <Link href="/reader/login" style={{
            fontFamily: '"JetBrains Mono", monospace',
            fontSize: "0.5rem",
            letterSpacing: "0.2em",
            color: "rgba(201,168,76,0.5)",
            textDecoration: "none",
            textTransform: "uppercase",
          }}>
            Go to Login →
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div style={{
      minHeight: "100vh",
      backgroundColor: "#0D0B08",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      padding: "2rem",
    }}>
      {/* Background glow */}
      <div style={{
        position: "fixed", inset: 0, pointerEvents: "none",
        background: "radial-gradient(ellipse at 50% 40%, rgba(44,26,0,0.3) 0%, transparent 60%)",
      }} />

      <motion.div
        style={{ width: "100%", maxWidth: "400px", position: "relative" }}
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <div style={{
          border: "1px solid rgba(201,168,76,0.18)",
          background: "rgba(13,11,8,0.98)",
          padding: "2.5rem",
        }}>
          {/* Header */}
          <div style={{ textAlign: "center", marginBottom: "2rem" }}>
            <div style={{ display: "flex", justifyContent: "center", marginBottom: "1rem" }}>
              <TintaxisLogo size={28} />
            </div>
            <p style={{
              fontFamily: '"JetBrains Mono", monospace',
              fontSize: "0.48rem",
              letterSpacing: "0.3em",
              color: "rgba(201,168,76,0.45)",
              textTransform: "uppercase",
              marginBottom: "0.5rem",
            }}>
              Password Reset
            </p>
            <div style={{
              height: "1px",
              background: "linear-gradient(90deg, transparent, rgba(201,168,76,0.25), transparent)",
            }} />
          </div>

          {/* Success state */}
          {status === "success" && (
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              style={{ textAlign: "center" }}
            >
              <p style={{
                fontFamily: '"EB Garamond", Garamond, Georgia, serif',
                fontSize: "1.1rem",
                color: "rgba(0,229,204,0.7)",
                marginBottom: "1rem",
              }}>
                Password updated.
              </p>

              {isAuthor && (
                <p style={{
                  fontFamily: '"JetBrains Mono", monospace',
                  fontSize: "0.5rem",
                  color: "rgba(245,230,200,0.35)",
                  lineHeight: 1.7,
                  marginBottom: "1.5rem",
                  letterSpacing: "0.05em",
                }}>
                  For your author account, also update AUTHOR_PASSWORD in your Vercel environment variables.
                </p>
              )}

              <Link
                href={isAuthor ? "/author/login" : "/reader/login"}
                style={{
                  fontFamily: '"JetBrains Mono", monospace',
                  fontSize: "0.55rem",
                  letterSpacing: "0.2em",
                  color: "#C9A84C",
                  textDecoration: "none",
                  textTransform: "uppercase",
                  border: "1px solid rgba(201,168,76,0.3)",
                  padding: "0.65rem 1.5rem",
                  display: "inline-block",
                }}
              >
                Sign In →
              </Link>
            </motion.div>
          )}

          {/* Form state */}
          {status !== "success" && (
            <form onSubmit={handleSubmit}>
              <div style={{ marginBottom: "1.25rem" }}>
                <label style={{
                  fontFamily: '"JetBrains Mono", monospace',
                  fontSize: "0.45rem",
                  letterSpacing: "0.2em",
                  color: "rgba(201,168,76,0.4)",
                  textTransform: "uppercase",
                  display: "block",
                  marginBottom: "0.4rem",
                }}>
                  New Password
                </label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  minLength={8}
                  autoFocus
                  placeholder="At least 8 characters"
                  style={{
                    width: "100%",
                    background: "rgba(255,255,255,0.03)",
                    border: "1px solid rgba(201,168,76,0.15)",
                    padding: "0.65rem 0.8rem",
                    color: "#F5E6C8",
                    fontFamily: '"JetBrains Mono", monospace',
                    fontSize: "0.8rem",
                    outline: "none",
                    boxSizing: "border-box",
                  }}
                />
              </div>

              <div style={{ marginBottom: "1.75rem" }}>
                <label style={{
                  fontFamily: '"JetBrains Mono", monospace',
                  fontSize: "0.45rem",
                  letterSpacing: "0.2em",
                  color: "rgba(201,168,76,0.4)",
                  textTransform: "uppercase",
                  display: "block",
                  marginBottom: "0.4rem",
                }}>
                  Confirm Password
                </label>
                <input
                  type="password"
                  value={confirm}
                  onChange={(e) => setConfirm(e.target.value)}
                  required
                  minLength={8}
                  style={{
                    width: "100%",
                    background: "rgba(255,255,255,0.03)",
                    border: "1px solid rgba(201,168,76,0.15)",
                    padding: "0.65rem 0.8rem",
                    color: "#F5E6C8",
                    fontFamily: '"JetBrains Mono", monospace',
                    fontSize: "0.8rem",
                    outline: "none",
                    boxSizing: "border-box",
                  }}
                />
              </div>

              {/* Error */}
              {(status === "error" || errorMsg) && (
                <motion.p
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  style={{
                    fontFamily: '"JetBrains Mono", monospace',
                    fontSize: "0.5rem",
                    letterSpacing: "0.1em",
                    color: "rgba(192,57,43,0.8)",
                    marginBottom: "1rem",
                    textAlign: "center",
                  }}
                >
                  {errorMsg}
                </motion.p>
              )}

              <motion.button
                type="submit"
                disabled={status === "loading"}
                style={{
                  width: "100%",
                  fontFamily: '"JetBrains Mono", monospace',
                  fontSize: "0.55rem",
                  letterSpacing: "0.2em",
                  textTransform: "uppercase",
                  color: status === "loading" ? "rgba(201,168,76,0.4)" : "#C9A84C",
                  background: "transparent",
                  border: "1px solid rgba(201,168,76,0.3)",
                  padding: "0.75rem",
                  cursor: status === "loading" ? "not-allowed" : "pointer",
                }}
                whileHover={status !== "loading" ? {
                  borderColor: "rgba(201,168,76,0.6)",
                  boxShadow: "0 0 12px rgba(201,168,76,0.08)",
                } : {}}
              >
                {status === "loading" ? "Updating…" : "Set New Password"}
              </motion.button>
            </form>
          )}
        </div>

        {/* Back link */}
        <p style={{ textAlign: "center", marginTop: "1.25rem" }}>
          <Link href="/reader/login" style={{
            fontFamily: '"JetBrains Mono", monospace',
            fontSize: "0.45rem",
            letterSpacing: "0.12em",
            color: "rgba(201,168,76,0.2)",
            textDecoration: "none",
            textTransform: "uppercase",
          }}>
            ← Back to Login
          </Link>
        </p>
      </motion.div>
    </div>
  );
}
