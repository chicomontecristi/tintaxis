"use client";

// ─── EMAIL GATE MODAL ────────────────────────────────────────────────────────
// Shown when an unauthenticated reader tries to access chapter 2+.
// Asks for just an email — no password, no friction.
// On submit, calls /api/reader/free-signup → sets JWT cookie → reloads.

import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect, useRef } from "react";
import { useI18n } from "@/lib/i18n";

interface EmailGateModalProps {
  isOpen: boolean;
  chapterTitle?: string;
  onClose: () => void;
  onSuccess?: () => void;  // called after successful signup (triggers reload)
}

export default function EmailGateModal({
  isOpen,
  chapterTitle,
  onClose,
  onSuccess,
}: EmailGateModalProps) {
  const { t } = useI18n();
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  // Focus input on open
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 300);
    }
  }, [isOpen]);

  // Escape to close
  useEffect(() => {
    if (!isOpen) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [isOpen, onClose]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;

    setLoading(true);
    setError(null);

    try {
      const res = await fetch("/api/reader/free-signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim() }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error ?? "Something went wrong. Try again.");
        setLoading(false);
        return;
      }

      // Success — show confirmation then reload
      setSuccess(true);
      setTimeout(() => {
        if (onSuccess) {
          onSuccess();
        } else {
          window.location.reload();
        }
      }, 1200);
    } catch {
      setError("Connection error. Please try again.");
      setLoading(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="fixed inset-0 z-50 flex items-center justify-center"
          style={{ padding: "1rem" }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0, transition: { duration: 0.3 } }}
          transition={{ duration: 0.25 }}
          onClick={onClose}
        >
          {/* Backdrop */}
          <div
            className="absolute inset-0"
            style={{ backgroundColor: "rgba(13,11,8,0.94)", backdropFilter: "blur(6px)" }}
          />

          {/* Modal panel */}
          <motion.div
            onClick={(e) => e.stopPropagation()}
            style={{
              position: "relative",
              zIndex: 1,
              width: "100%",
              maxWidth: "440px",
              border: "1px solid rgba(201,168,76,0.2)",
              background: "rgba(13,11,8,0.98)",
              padding: "clamp(1.5rem, 4vw, 2.5rem)",
            }}
            initial={{ opacity: 0, y: 24, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 12, scale: 0.98 }}
            transition={{ duration: 0.4, ease: [0.2, 0, 0.1, 1] }}
          >
            {/* Close button */}
            <button
              onClick={onClose}
              style={{
                position: "absolute",
                top: "1rem",
                right: "1rem",
                background: "transparent",
                border: "none",
                cursor: "pointer",
                color: "rgba(201,168,76,0.4)",
                fontFamily: '"JetBrains Mono", monospace',
                fontSize: "0.85rem",
                letterSpacing: "0.1em",
                padding: "0.25rem 0.5rem",
              }}
            >
              ✕
            </button>

            {success ? (
              /* ── Success state ─────────────────────────────────────── */
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                style={{ textAlign: "center", padding: "1rem 0" }}
              >
                <p
                  style={{
                    fontFamily: '"EB Garamond", Garamond, Georgia, serif',
                    fontSize: "1.5rem",
                    color: "rgba(0,229,204,0.9)",
                    marginBottom: "0.5rem",
                  }}
                >
                  {t("email.youreIn")}
                </p>
                <p
                  style={{
                    fontFamily: '"EB Garamond", Garamond, Georgia, serif',
                    fontSize: "0.95rem",
                    fontStyle: "italic",
                    color: "rgba(245,230,200,0.4)",
                  }}
                >
                  {t("email.loadingChapter")}
                </p>
              </motion.div>
            ) : (
              /* ── Form state ────────────────────────────────────────── */
              <>
                {/* Icon / decorative element */}
                <div style={{ textAlign: "center", marginBottom: "1.5rem" }}>
                  <div
                    style={{
                      display: "inline-block",
                      width: "40px",
                      height: "1px",
                      background: "linear-gradient(90deg, transparent, rgba(201,168,76,0.5), transparent)",
                      marginBottom: "1.5rem",
                    }}
                  />
                  <h2
                    style={{
                      fontFamily: '"EB Garamond", Garamond, Georgia, serif',
                      fontSize: "clamp(1.3rem, 3vw, 1.7rem)",
                      fontWeight: 400,
                      color: "#F5E6C8",
                      letterSpacing: "0.05em",
                      marginBottom: "0.5rem",
                    }}
                  >
                    {t("email.readNext")}
                  </h2>
                  {chapterTitle && (
                    <p
                      style={{
                        fontFamily: '"EB Garamond", Garamond, Georgia, serif',
                        fontSize: "0.9rem",
                        fontStyle: "italic",
                        color: "rgba(245,230,200,0.3)",
                        marginBottom: "0.3rem",
                      }}
                    >
                      {chapterTitle}
                    </p>
                  )}
                  <p
                    style={{
                      fontFamily: '"EB Garamond", Garamond, Georgia, serif',
                      fontSize: "0.95rem",
                      color: "rgba(245,230,200,0.5)",
                      lineHeight: 1.6,
                    }}
                  >
                    {t("email.enterEmail")}
                  </p>
                </div>

                {/* Brass rule */}
                <div
                  style={{
                    height: "1px",
                    background: "linear-gradient(90deg, transparent, rgba(201,168,76,0.3) 30%, rgba(201,168,76,0.5) 50%, rgba(201,168,76,0.3) 70%, transparent)",
                    marginBottom: "1.5rem",
                  }}
                />

                <form onSubmit={handleSubmit}>
                  <input
                    ref={inputRef}
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder={t("email.placeholder")}
                    autoComplete="email"
                    required
                    style={{
                      width: "100%",
                      fontFamily: '"JetBrains Mono", monospace',
                      fontSize: "0.9rem",
                      letterSpacing: "0.05em",
                      color: "#F5E6C8",
                      background: "rgba(245,230,200,0.04)",
                      border: "1px solid rgba(201,168,76,0.2)",
                      padding: "0.75rem 1rem",
                      marginBottom: "0.75rem",
                      outline: "none",
                      boxSizing: "border-box",
                      transition: "border-color 0.2s ease",
                    }}
                    onFocus={(e) => (e.target.style.borderColor = "rgba(201,168,76,0.5)")}
                    onBlur={(e) => (e.target.style.borderColor = "rgba(201,168,76,0.2)")}
                  />

                  {error && (
                    <p
                      style={{
                        fontFamily: '"JetBrains Mono", monospace',
                        fontSize: "0.75rem",
                        color: "rgba(214,83,60,0.8)",
                        marginBottom: "0.75rem",
                      }}
                    >
                      {error}
                    </p>
                  )}

                  <motion.button
                    type="submit"
                    disabled={loading || !email.trim()}
                    style={{
                      width: "100%",
                      fontFamily: '"JetBrains Mono", monospace',
                      fontSize: "0.8rem",
                      letterSpacing: "0.2em",
                      textTransform: "uppercase",
                      color: loading ? "rgba(201,168,76,0.3)" : "#0D0B08",
                      background: loading
                        ? "rgba(201,168,76,0.2)"
                        : "rgba(201,168,76,0.85)",
                      border: "1px solid rgba(201,168,76,0.6)",
                      padding: "0.7rem 1rem",
                      cursor: loading ? "not-allowed" : "pointer",
                      transition: "all 0.2s ease",
                    }}
                    whileHover={!loading ? {
                      boxShadow: "0 0 16px rgba(201,168,76,0.3)",
                    } : {}}
                    whileTap={!loading ? { scale: 0.97 } : {}}
                  >
                    {loading ? t("email.unlockLoading") : t("email.unlock")}
                  </motion.button>
                </form>

                {/* Fine print */}
                <p
                  style={{
                    fontFamily: '"JetBrains Mono", monospace',
                    fontSize: "0.65rem",
                    letterSpacing: "0.1em",
                    color: "rgba(201,168,76,0.2)",
                    textAlign: "center",
                    marginTop: "1rem",
                    textTransform: "uppercase",
                  }}
                >
                  {t("email.noSpam")}
                </p>
              </>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
