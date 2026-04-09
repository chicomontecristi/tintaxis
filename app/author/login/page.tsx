"use client";

import { useState, FormEvent } from "react";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import TintaxisLogo from "@/components/ui/TintaxisLogo";
import { useI18n } from "@/lib/i18n";

export default function AuthorLogin() {
  const { t } = useI18n();
  const router = useRouter();
  const [email, setEmail]       = useState("");
  const [password, setPassword] = useState("");
  const [status, setStatus]     = useState<"idle" | "loading" | "error">("idle");
  const [errorMsg, setErrorMsg] = useState("");
  const [resetMode, setResetMode]   = useState(false);
  const [resetStatus, setResetStatus] = useState<"idle" | "sending" | "sent">("idle");

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setStatus("loading");
    setErrorMsg("");

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      if (res.ok) {
        router.push("/author");
        router.refresh();
      } else {
        const data = await res.json();
        setErrorMsg(data.error ?? "Invalid credentials.");
        setStatus("error");
      }
    } catch {
      setErrorMsg("Connection failed. Try again.");
      setStatus("error");
    }
  };

  const handleResetRequest = async (e: FormEvent) => {
    e.preventDefault();
    if (!email.trim()) { setErrorMsg("Enter your email first."); setStatus("error"); return; }
    setResetStatus("sending");
    try {
      await fetch("/api/auth/reset-request", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      setResetStatus("sent");
    } catch {
      setErrorMsg("Failed to send reset email.");
      setStatus("error");
      setResetStatus("idle");
    }
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        backgroundColor: "#0D0B08",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "2rem",
      }}
    >
      {/* Background glow */}
      <div style={{
        position: "fixed", inset: 0, pointerEvents: "none",
        background: "radial-gradient(ellipse at 50% 40%, rgba(44,26,0,0.4) 0%, transparent 65%)",
      }} />

      <motion.div
        style={{ width: "100%", maxWidth: "380px", position: "relative" }}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: [0.2, 0, 0.1, 1] }}
      >
        {/* Card */}
        <div style={{
          border: "1px solid rgba(201,168,76,0.2)",
          background: "rgba(13,11,8,0.98)",
          padding: "2.5rem",
          position: "relative",
        }}>
          {/* Corner accents */}
          {["top-0 left-0 border-t border-l","top-0 right-0 border-t border-r",
            "bottom-0 left-0 border-b border-l","bottom-0 right-0 border-b border-r"]
            .map((cls, i) => (
              <span key={i} className={`absolute w-3 h-3 ${cls}`}
                style={{ borderColor: "rgba(201,168,76,0.3)" }} />
            ))}

          {/* Logo + header */}
          <div style={{ textAlign: "center", marginBottom: "2rem" }}>
            <div style={{ display: "flex", justifyContent: "center", marginBottom: "1rem" }}>
              <TintaxisLogo size={32} />
            </div>
            <p style={{
              fontFamily: '"JetBrains Mono", monospace',
              fontSize: "0.5rem",
              letterSpacing: "0.35em",
              color: "rgba(201,168,76,0.5)",
              textTransform: "uppercase",
              marginBottom: "0.25rem",
            }}>
              TINTAXIS
            </p>
            <p style={{
              fontFamily: '"EB Garamond", Garamond, Georgia, serif',
              fontSize: "1.1rem",
              fontStyle: "italic",
              color: "rgba(245,230,200,0.6)",
            }}>
              {t("aLogin.title")}
            </p>
          </div>

          {/* Brass rule */}
          <div style={{
            height: "1px",
            background: "linear-gradient(90deg, transparent, rgba(201,168,76,0.3), transparent)",
            marginBottom: "2rem",
          }} />

          {/* Form */}
          <form onSubmit={handleSubmit}>
            <div style={{ marginBottom: "1rem" }}>
              <label style={{
                fontFamily: '"JetBrains Mono", monospace',
                fontSize: "0.5rem",
                letterSpacing: "0.2em",
                color: "rgba(245,230,200,0.35)",
                textTransform: "uppercase",
                display: "block",
                marginBottom: "0.4rem",
              }}>
                {t("aLogin.email")}
              </label>
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                required
                autoFocus
                style={{
                  width: "100%",
                  background: "rgba(255,255,255,0.03)",
                  border: "1px solid rgba(201,168,76,0.15)",
                  padding: "0.6rem 0.75rem",
                  color: "#F5E6C8",
                  fontFamily: '"JetBrains Mono", monospace',
                  fontSize: "0.8rem",
                  outline: "none",
                  borderRadius: "1px",
                  boxSizing: "border-box",
                }}
                onFocus={e => e.target.style.borderColor = "rgba(201,168,76,0.4)"}
                onBlur={e  => e.target.style.borderColor = "rgba(201,168,76,0.15)"}
              />
            </div>

            <div style={{ marginBottom: "1.75rem" }}>
              <label style={{
                fontFamily: '"JetBrains Mono", monospace',
                fontSize: "0.5rem",
                letterSpacing: "0.2em",
                color: "rgba(245,230,200,0.35)",
                textTransform: "uppercase",
                display: "block",
                marginBottom: "0.4rem",
              }}>
                {t("aLogin.password")}
              </label>
              <input
                type="password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                required
                style={{
                  width: "100%",
                  background: "rgba(255,255,255,0.03)",
                  border: "1px solid rgba(201,168,76,0.15)",
                  padding: "0.6rem 0.75rem",
                  color: "#F5E6C8",
                  fontFamily: '"JetBrains Mono", monospace',
                  fontSize: "0.8rem",
                  outline: "none",
                  borderRadius: "1px",
                  boxSizing: "border-box",
                }}
                onFocus={e => e.target.style.borderColor = "rgba(201,168,76,0.4)"}
                onBlur={e  => e.target.style.borderColor = "rgba(201,168,76,0.15)"}
              />
            </div>

            {/* Error */}
            {status === "error" && (
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                style={{
                  fontFamily: '"JetBrains Mono", monospace',
                  fontSize: "0.55rem",
                  letterSpacing: "0.1em",
                  color: "rgba(192,57,43,0.8)",
                  marginBottom: "1rem",
                  textAlign: "center",
                }}
              >
                {errorMsg}
              </motion.p>
            )}

            {/* Submit */}
            <motion.button
              type="submit"
              disabled={status === "loading"}
              style={{
                width: "100%",
                fontFamily: '"JetBrains Mono", monospace',
                fontSize: "0.6rem",
                letterSpacing: "0.25em",
                textTransform: "uppercase",
                color: status === "loading" ? "rgba(201,168,76,0.4)" : "#C9A84C",
                background: "transparent",
                border: "1px solid rgba(201,168,76,0.35)",
                padding: "0.8rem",
                cursor: status === "loading" ? "not-allowed" : "pointer",
                position: "relative",
              }}
              whileHover={status !== "loading" ? {
                borderColor: "rgba(201,168,76,0.7)",
                boxShadow: "0 0 16px rgba(201,168,76,0.1)",
              } : {}}
              whileTap={status !== "loading" ? { scale: 0.98 } : {}}
            >
              {status === "loading" ? t("aLogin.entering") : t("aLogin.enter")}
            </motion.button>

            {/* Forgot password */}
            {!resetMode && (
              <p style={{ textAlign: "center", marginTop: "1rem" }}>
                <button
                  type="button"
                  onClick={() => { setResetMode(true); setStatus("idle"); setErrorMsg(""); }}
                  style={{
                    fontFamily: '"JetBrains Mono", monospace',
                    fontSize: "0.45rem",
                    letterSpacing: "0.15em",
                    color: "rgba(245,230,200,0.25)",
                    background: "none",
                    border: "none",
                    cursor: "pointer",
                    textTransform: "uppercase",
                  }}
                >
                  {t("aLogin.forgot")}
                </button>
              </p>
            )}

            {/* Reset mode */}
            {resetMode && resetStatus !== "sent" && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                style={{ marginTop: "1rem", textAlign: "center", overflow: "hidden" }}
              >
                <p style={{
                  fontFamily: '"EB Garamond", Garamond, Georgia, serif',
                  fontSize: "0.85rem",
                  fontStyle: "italic",
                  color: "rgba(245,230,200,0.4)",
                  marginBottom: "0.75rem",
                }}>
                  {t("aLogin.enterEmail")}
                </p>
                <motion.button
                  type="button"
                  onClick={handleResetRequest}
                  disabled={resetStatus === "sending"}
                  style={{
                    fontFamily: '"JetBrains Mono", monospace',
                    fontSize: "0.5rem",
                    letterSpacing: "0.2em",
                    textTransform: "uppercase",
                    color: "rgba(201,168,76,0.6)",
                    background: "transparent",
                    border: "1px solid rgba(201,168,76,0.2)",
                    padding: "0.5rem 1.25rem",
                    cursor: resetStatus === "sending" ? "wait" : "pointer",
                  }}
                  whileHover={{ borderColor: "rgba(201,168,76,0.5)" }}
                >
                  {resetStatus === "sending" ? t("aLogin.sending") : t("aLogin.sendReset")}
                </motion.button>
                <p style={{ marginTop: "0.5rem" }}>
                  <button
                    type="button"
                    onClick={() => { setResetMode(false); setResetStatus("idle"); }}
                    style={{
                      fontFamily: '"JetBrains Mono", monospace',
                      fontSize: "0.4rem",
                      color: "rgba(245,230,200,0.2)",
                      background: "none",
                      border: "none",
                      cursor: "pointer",
                    }}
                  >
                    {t("aLogin.backToLogin")}
                  </button>
                </p>
              </motion.div>
            )}

            {/* Reset email sent */}
            {resetStatus === "sent" && (
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                style={{
                  fontFamily: '"EB Garamond", Garamond, Georgia, serif',
                  fontSize: "0.9rem",
                  fontStyle: "italic",
                  color: "rgba(0,229,204,0.6)",
                  textAlign: "center",
                  marginTop: "1rem",
                }}
              >
                {t("aLogin.resetSent")}
              </motion.p>
            )}
          </form>
        </div>

        {/* Back link */}
        <p style={{ textAlign: "center", marginTop: "1.5rem" }}>
          <a href="/" style={{
            fontFamily: '"JetBrains Mono", monospace',
            fontSize: "0.5rem",
            letterSpacing: "0.15em",
            color: "rgba(201,168,76,0.25)",
            textDecoration: "none",
            textTransform: "uppercase",
          }}>
            {t("aLogin.returnToArchive")}
          </a>
        </p>
      </motion.div>
    </div>
  );
}
