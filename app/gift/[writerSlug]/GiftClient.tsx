"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import type { FeaturedWriter } from "@/lib/featured-writers";

const MONO = '"JetBrains Mono", monospace';
const SERIF = '"EB Garamond", Garamond, Georgia, serif';

const TIERS = [
  { id: "codex", name: "Codex", price: "$1.99", desc: "Full chapter access & personal annotations" },
  { id: "scribe", name: "Scribe", price: "$3.99", desc: "Signal Ink, Author Whispers & early access" },
  { id: "archive", name: "Archive", price: "$7.99", desc: "Community margins & permanent public marks" },
  { id: "chronicler", name: "Chronicler", price: "$9.99", desc: "Signed edition, dedication & private session" },
];

export default function GiftClient({ writer }: { writer: FeaturedWriter }) {
  const displayName = writer.artistName ?? writer.name;
  const searchParams = useSearchParams();
  const status = searchParams.get("status");
  const giftedTo = searchParams.get("to");

  const [selectedTier, setSelectedTier] = useState("scribe");
  const [recipientEmail, setRecipientEmail] = useState("");
  const [recipientName, setRecipientName] = useState("");
  const [senderName, setSenderName] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleGift = async () => {
    if (!recipientEmail) {
      setError("Recipient email is required.");
      return;
    }
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/gift", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          writerSlug: writer.slug,
          tier: selectedTier,
          recipientEmail,
          recipientName,
          senderName,
          message,
        }),
      });
      const data = await res.json();
      if (res.ok && data.url) {
        window.location.href = data.url;
      } else {
        setError(data.error ?? "Something went wrong.");
        setLoading(false);
      }
    } catch {
      setError("Connection failed. Try again.");
      setLoading(false);
    }
  };

  const inputStyle: React.CSSProperties = {
    width: "100%",
    background: "rgba(255,255,255,0.03)",
    border: "1px solid rgba(201,168,76,0.15)",
    padding: "0.65rem 0.85rem",
    color: "#F5E6C8",
    fontFamily: MONO,
    fontSize: "0.9rem",
    outline: "none",
    borderRadius: "1px",
    boxSizing: "border-box",
  };

  const labelStyle: React.CSSProperties = {
    fontFamily: MONO,
    fontSize: "0.75rem",
    letterSpacing: "0.2em",
    color: "rgba(245,230,200,0.35)",
    textTransform: "uppercase",
    display: "block",
    marginBottom: "0.4rem",
  };

  // ── Success state ─────────────────────────────────────
  if (status === "success") {
    return (
      <div style={{ minHeight: "100vh", backgroundColor: "#0D0B08", display: "flex", alignItems: "center", justifyContent: "center", padding: "2rem" }}>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          style={{ maxWidth: "480px", textAlign: "center" }}
        >
          <p style={{ fontFamily: MONO, fontSize: "0.75rem", letterSpacing: "0.3em", color: "rgba(0,229,204,0.6)", textTransform: "uppercase", marginBottom: "1.5rem" }}>
            GIFT SENT
          </p>
          <h1 style={{ fontFamily: SERIF, fontSize: "clamp(1.5rem, 4vw, 2rem)", fontWeight: 400, color: "#F5E6C8", marginBottom: "1rem" }}>
            A month of {displayName}&apos;s work — gifted.
          </h1>
          <p style={{ fontFamily: SERIF, fontSize: "1rem", fontStyle: "italic", color: "rgba(245,230,200,0.45)", marginBottom: "2rem", lineHeight: 1.6 }}>
            {giftedTo ? `We'll send a redemption link to ${decodeURIComponent(giftedTo)}.` : "The recipient will receive a redemption link."} They get one full month to read, annotate, and experience every chapter.
          </p>
          <Link href={`/writers/${writer.slug}`} style={{ fontFamily: MONO, fontSize: "0.8rem", letterSpacing: "0.2em", color: "#C9A84C", textDecoration: "none", textTransform: "uppercase" }}>
            Back to {displayName}
          </Link>
        </motion.div>
      </div>
    );
  }

  // ── Gift form ─────────────────────────────────────────
  return (
    <div style={{ minHeight: "100vh", backgroundColor: "#0D0B08", color: "#F5E6C8" }}>
      <div style={{ position: "fixed", inset: 0, pointerEvents: "none", background: "radial-gradient(ellipse at 50% 0%, rgba(44,26,0,0.25) 0%, transparent 60%)", zIndex: 0 }} />

      <div style={{ position: "relative", zIndex: 1, maxWidth: "560px", margin: "0 auto", padding: "6rem 2rem 4rem" }}>
        {/* Back link */}
        <Link
          href={`/writers/${writer.slug}`}
          style={{ fontFamily: MONO, fontSize: "0.7rem", letterSpacing: "0.2em", color: "rgba(201,168,76,0.35)", textDecoration: "none", textTransform: "uppercase", display: "inline-block", marginBottom: "2rem" }}
        >
          ← {displayName}
        </Link>

        {/* Header */}
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
          <p style={{ fontFamily: MONO, fontSize: "0.75rem", letterSpacing: "0.35em", color: "rgba(201,168,76,0.4)", textTransform: "uppercase", marginBottom: "0.75rem" }}>
            GIFT A MONTH
          </p>
          <h1 style={{ fontFamily: SERIF, fontSize: "clamp(1.5rem, 4vw, 2rem)", fontWeight: 400, color: "#F5E6C8", lineHeight: 1.2, marginBottom: "0.5rem" }}>
            Give someone {displayName}&apos;s words.
          </h1>
          <p style={{ fontFamily: SERIF, fontSize: "1rem", fontStyle: "italic", color: "rgba(245,230,200,0.4)", marginBottom: "2.5rem", lineHeight: 1.6 }}>
            One month of reading, annotating, and hearing the author whisper back.
          </p>
        </motion.div>

        {/* Tier selection */}
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.15, duration: 0.5 }}>
          <label style={labelStyle}>Choose a tier</label>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.75rem", marginBottom: "2rem" }}>
            {TIERS.map((t) => (
              <button
                key={t.id}
                onClick={() => setSelectedTier(t.id)}
                style={{
                  background: selectedTier === t.id ? "rgba(201,168,76,0.08)" : "rgba(255,255,255,0.02)",
                  border: selectedTier === t.id ? "1px solid rgba(201,168,76,0.4)" : "1px solid rgba(201,168,76,0.1)",
                  padding: "1rem",
                  cursor: "pointer",
                  textAlign: "left",
                  transition: "all 0.2s ease",
                }}
              >
                <p style={{ fontFamily: MONO, fontSize: "0.7rem", letterSpacing: "0.2em", color: selectedTier === t.id ? "#C9A84C" : "rgba(201,168,76,0.4)", textTransform: "uppercase", marginBottom: "0.3rem" }}>
                  {t.name}
                </p>
                <p style={{ fontFamily: SERIF, fontSize: "1.25rem", color: "#F5E6C8", marginBottom: "0.25rem" }}>
                  {t.price}
                </p>
                <p style={{ fontFamily: SERIF, fontSize: "0.8rem", fontStyle: "italic", color: "rgba(245,230,200,0.3)", lineHeight: 1.4 }}>
                  {t.desc}
                </p>
              </button>
            ))}
          </div>
        </motion.div>

        {/* Recipient info */}
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.25, duration: 0.5 }} style={{ display: "flex", flexDirection: "column", gap: "1.25rem", marginBottom: "2rem" }}>
          <div>
            <label style={labelStyle}>Recipient&apos;s email *</label>
            <input
              type="email"
              value={recipientEmail}
              onChange={(e) => setRecipientEmail(e.target.value)}
              placeholder="friend@email.com"
              style={inputStyle}
              required
            />
          </div>
          <div>
            <label style={labelStyle}>Recipient&apos;s name</label>
            <input
              type="text"
              value={recipientName}
              onChange={(e) => setRecipientName(e.target.value)}
              placeholder="Their name (optional)"
              style={inputStyle}
            />
          </div>
          <div>
            <label style={labelStyle}>Your name</label>
            <input
              type="text"
              value={senderName}
              onChange={(e) => setSenderName(e.target.value)}
              placeholder="Your name (shown in the gift)"
              style={inputStyle}
            />
          </div>
          <div>
            <label style={labelStyle}>Personal message</label>
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="A short note to the reader... (optional)"
              rows={3}
              style={{ ...inputStyle, resize: "vertical" }}
            />
          </div>
        </motion.div>

        {/* Error */}
        {error && (
          <p style={{ fontFamily: MONO, fontSize: "0.8rem", color: "rgba(214,83,60,0.8)", textAlign: "center", marginBottom: "1rem" }}>
            {error}
          </p>
        )}

        {/* Gift button */}
        <motion.button
          onClick={handleGift}
          disabled={loading}
          whileHover={!loading ? { borderColor: "rgba(0,229,204,0.6)", boxShadow: "0 0 20px rgba(0,229,204,0.08)" } : {}}
          whileTap={!loading ? { scale: 0.98 } : {}}
          style={{
            width: "100%",
            fontFamily: MONO,
            fontSize: "0.85rem",
            letterSpacing: "0.2em",
            textTransform: "uppercase",
            color: loading ? "rgba(0,229,204,0.4)" : "rgba(0,229,204,0.85)",
            background: "transparent",
            border: "1px solid rgba(0,229,204,0.3)",
            padding: "0.85rem",
            cursor: loading ? "not-allowed" : "pointer",
            marginBottom: "0.75rem",
          }}
        >
          {loading ? "REDIRECTING TO PAYMENT..." : `GIFT A MONTH · ${TIERS.find((t) => t.id === selectedTier)?.price}`}
        </motion.button>

        <p style={{ fontFamily: SERIF, fontSize: "0.85rem", fontStyle: "italic", color: "rgba(245,230,200,0.25)", textAlign: "center", lineHeight: 1.5 }}>
          One-time payment. No recurring charge. Secured by Stripe.
        </p>

        {/* Stripe badge */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "0.5rem", marginTop: "1rem" }}>
          <img src="/stripe-badge.png" alt="Stripe" width={16} height={16} style={{ borderRadius: "3px" }} />
          <span style={{ fontFamily: MONO, fontSize: "0.6rem", letterSpacing: "0.15em", color: "rgba(201,168,76,0.3)", textTransform: "uppercase" }}>
            Powered by <span style={{ color: "rgba(201,168,76,0.5)", fontWeight: 600 }}>Stripe</span>
          </span>
        </div>
      </div>
    </div>
  );
}
