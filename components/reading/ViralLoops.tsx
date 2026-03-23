"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import type { Chapter } from "@/lib/types";
import { BOOKS } from "@/lib/content/books";

// ─── VIRAL LOOPS ─────────────────────────────────────────────────────────────
// Three distribution features wired into the reading surface:
// 1. QuoteCard — text selection → styled shareable quote
// 2. MilestoneCard — end-of-chapter progress share
// 3. SendToFriend — email a chapter link to someone

const MONO = '"JetBrains Mono", monospace';
const SERIF = '"EB Garamond", Garamond, Georgia, serif';
const BRASS = "rgba(201,168,76,";
const CREAM = "rgba(245,230,200,";
const BASE_URL = "https://tintaxis.vercel.app";

// ═══════════════════════════════════════════════════════════════════════════════
// 1. QUOTE CARD — Select text → floating "Share Quote" button → styled card
// ═══════════════════════════════════════════════════════════════════════════════

export function QuoteSelector({ chapter }: { chapter: Chapter }) {
  const [selectedText, setSelectedText] = useState("");
  const [showButton, setShowButton] = useState(false);
  const [buttonPos, setButtonPos] = useState({ x: 0, y: 0 });
  const [showCard, setShowCard] = useState(false);
  const [copied, setCopied] = useState(false);
  const pathname = usePathname();
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  const fullUrl = typeof window !== "undefined"
    ? `${window.location.origin}${pathname}`
    : `${BASE_URL}${pathname}`;

  const book = chapter.bookSlug ? BOOKS[chapter.bookSlug] : null;
  const accent = book?.accentColor ?? "#C9A84C";

  const handleSelectionChange = useCallback(() => {
    const sel = window.getSelection();
    const text = sel?.toString().trim() ?? "";

    if (text.length >= 15 && text.length <= 280) {
      const range = sel?.getRangeAt(0);
      if (range) {
        const rect = range.getBoundingClientRect();
        setSelectedText(text);
        setButtonPos({
          x: rect.left + rect.width / 2,
          y: rect.top + window.scrollY - 10,
        });
        setShowButton(true);
      }
    } else {
      // Small delay so user can click the button before it disappears
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
      timeoutRef.current = setTimeout(() => {
        setShowButton(false);
      }, 200);
    }
  }, []);

  useEffect(() => {
    document.addEventListener("selectionchange", handleSelectionChange);
    return () => {
      document.removeEventListener("selectionchange", handleSelectionChange);
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, [handleSelectionChange]);

  const openCard = () => {
    setShowCard(true);
    setShowButton(false);
    window.getSelection()?.removeAllRanges();
  };

  const shareOnTwitter = () => {
    const text = encodeURIComponent(
      `"${selectedText}"\n\n— ${chapter.title}, Tintaxis\n`
    );
    window.open(
      `https://twitter.com/intent/tweet?text=${text}&url=${encodeURIComponent(fullUrl)}`,
      "_blank"
    );
  };

  const copyQuote = () => {
    const quoteText = `"${selectedText}"\n— ${chapter.title}, Tintaxis\n${fullUrl}`;
    navigator.clipboard.writeText(quoteText).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2200);
    });
  };

  return (
    <>
      {/* Floating "Share Quote" button */}
      <AnimatePresence>
        {showButton && (
          <motion.button
            initial={{ opacity: 0, y: 6, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 4, scale: 0.95 }}
            transition={{ duration: 0.15 }}
            onClick={openCard}
            style={{
              position: "absolute",
              left: `${buttonPos.x}px`,
              top: `${buttonPos.y}px`,
              transform: "translate(-50%, -100%)",
              zIndex: 60,
              fontFamily: MONO,
              fontSize: "0.42rem",
              letterSpacing: "0.2em",
              textTransform: "uppercase",
              padding: "5px 12px",
              border: `1px solid ${accent}55`,
              borderRadius: "2px",
              background: "#0D0B08",
              color: accent,
              cursor: "pointer",
              whiteSpace: "nowrap",
              boxShadow: `0 4px 20px rgba(0,0,0,0.5), 0 0 8px ${accent}15`,
            }}
          >
            ✦ Share Quote
          </motion.button>
        )}
      </AnimatePresence>

      {/* Quote Card Modal */}
      <AnimatePresence>
        {showCard && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            style={{
              position: "fixed",
              inset: 0,
              zIndex: 200,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              background: "rgba(0,0,0,0.7)",
              backdropFilter: "blur(4px)",
              padding: "1.5rem",
            }}
            onClick={(e) => {
              if (e.target === e.currentTarget) setShowCard(false);
            }}
          >
            <motion.div
              initial={{ scale: 0.92, y: 16 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.95, y: 8 }}
              transition={{ duration: 0.25, ease: [0.2, 0, 0.1, 1] }}
              style={{
                background: "#0D0B08",
                border: `1px solid ${accent}40`,
                maxWidth: "480px",
                width: "100%",
                padding: "2rem 2rem 1.5rem",
                position: "relative",
              }}
            >
              {/* Top accent line */}
              <div
                style={{
                  position: "absolute",
                  top: 0,
                  left: "2rem",
                  right: "2rem",
                  height: "1px",
                  background: `linear-gradient(90deg, transparent, ${accent}60 50%, transparent)`,
                }}
              />

              {/* Quote */}
              <p
                style={{
                  fontFamily: SERIF,
                  fontSize: "clamp(1rem, 3vw, 1.2rem)",
                  fontStyle: "italic",
                  color: `${CREAM}0.85)`,
                  lineHeight: 1.75,
                  margin: "0 0 1.25rem",
                }}
              >
                &ldquo;{selectedText}&rdquo;
              </p>

              {/* Attribution */}
              <p
                style={{
                  fontFamily: MONO,
                  fontSize: "0.42rem",
                  letterSpacing: "0.2em",
                  textTransform: "uppercase",
                  color: `${accent}`,
                  margin: "0 0 1.5rem",
                }}
              >
                — {chapter.title} · Tintaxis
              </p>

              {/* Brass rule */}
              <div
                style={{
                  height: "1px",
                  background: `${BRASS}0.12)`,
                  marginBottom: "1rem",
                }}
              />

              {/* Actions */}
              <div
                style={{
                  display: "flex",
                  gap: "0.5rem",
                  flexWrap: "wrap",
                }}
              >
                <QuoteButton onClick={copyQuote} accent={accent}>
                  {copied ? "✓ Copied" : "⎘ Copy"}
                </QuoteButton>
                <QuoteButton onClick={shareOnTwitter} accent={accent}>
                  𝕏 Post
                </QuoteButton>
                <QuoteButton
                  onClick={() => setShowCard(false)}
                  accent={accent}
                  ghost
                >
                  Close
                </QuoteButton>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

function QuoteButton({
  children,
  onClick,
  accent,
  ghost,
}: {
  children: React.ReactNode;
  onClick: () => void;
  accent: string;
  ghost?: boolean;
}) {
  return (
    <motion.button
      onClick={onClick}
      style={{
        fontFamily: MONO,
        fontSize: "0.42rem",
        letterSpacing: "0.18em",
        textTransform: "uppercase",
        padding: "6px 14px",
        border: ghost
          ? `1px solid ${BRASS}0.1)`
          : `1px solid ${accent}30`,
        borderRadius: "2px",
        background: ghost ? "transparent" : `${accent}08`,
        color: ghost ? `${CREAM}0.3)` : `${accent}`,
        cursor: "pointer",
        transition: "all 0.18s ease",
      }}
      whileHover={{
        borderColor: ghost ? `${BRASS}0.25)` : `${accent}50`,
        background: ghost ? `${BRASS}0.03)` : `${accent}12`,
      }}
    >
      {children}
    </motion.button>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// 2. MILESTONE CARD — "I just finished Chapter One of The Hunt"
// ═══════════════════════════════════════════════════════════════════════════════

export function MilestoneCard({ chapter }: { chapter: Chapter }) {
  const [showCard, setShowCard] = useState(false);
  const [copied, setCopied] = useState(false);
  const pathname = usePathname();

  const fullUrl = typeof window !== "undefined"
    ? `${window.location.origin}${pathname}`
    : `${BASE_URL}${pathname}`;

  const book = chapter.bookSlug ? BOOKS[chapter.bookSlug] : null;
  const accent = book?.accentColor ?? "#C9A84C";
  const totalChapters = book?.totalChapters ?? 7;
  const progressPct = Math.round((chapter.number / totalChapters) * 100);

  const milestoneText =
    chapter.number === totalChapters
      ? `I just finished ${book?.title ?? "a book"} on Tintaxis.`
      : `I just read ${chapter.title} of ${book?.title ?? "a book"} on Tintaxis — ${progressPct}% through.`;

  const shareOnTwitter = () => {
    const text = encodeURIComponent(`${milestoneText}\n\n`);
    window.open(
      `https://twitter.com/intent/tweet?text=${text}&url=${encodeURIComponent(fullUrl)}`,
      "_blank"
    );
  };

  const copyMilestone = () => {
    navigator.clipboard
      .writeText(`${milestoneText}\n${fullUrl}`)
      .then(() => {
        setCopied(true);
        setTimeout(() => setCopied(false), 2200);
      });
  };

  return (
    <>
      {/* Trigger button — subtle, after share bar */}
      <motion.div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: "0.5rem",
          marginTop: "1rem",
        }}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5, delay: 0.8 }}
      >
        <motion.button
          onClick={() => setShowCard(true)}
          style={{
            fontFamily: MONO,
            fontSize: "0.42rem",
            letterSpacing: "0.18em",
            textTransform: "uppercase",
            padding: "8px 18px",
            border: `1px solid ${accent}20`,
            borderRadius: "2px",
            background: `${accent}06`,
            color: `${accent}`,
            cursor: "pointer",
            transition: "all 0.2s ease",
          }}
          whileHover={{
            borderColor: `${accent}45`,
            background: `${accent}10`,
          }}
        >
          {chapter.number === totalChapters
            ? "✦ Share Completion"
            : `✦ Share Progress · ${progressPct}%`}
        </motion.button>
      </motion.div>

      {/* Milestone Card Modal */}
      <AnimatePresence>
        {showCard && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            style={{
              position: "fixed",
              inset: 0,
              zIndex: 200,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              background: "rgba(0,0,0,0.7)",
              backdropFilter: "blur(4px)",
              padding: "1.5rem",
            }}
            onClick={(e) => {
              if (e.target === e.currentTarget) setShowCard(false);
            }}
          >
            <motion.div
              initial={{ scale: 0.92, y: 16 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.95, y: 8 }}
              transition={{ duration: 0.25, ease: [0.2, 0, 0.1, 1] }}
              style={{
                background: "#0D0B08",
                border: `1px solid ${accent}40`,
                maxWidth: "420px",
                width: "100%",
                padding: "2rem",
                position: "relative",
                textAlign: "center",
              }}
            >
              {/* Progress bar */}
              <div
                style={{
                  width: "100%",
                  height: "2px",
                  background: `${BRASS}0.1)`,
                  marginBottom: "1.5rem",
                  borderRadius: "1px",
                  overflow: "hidden",
                }}
              >
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${progressPct}%` }}
                  transition={{ duration: 1, delay: 0.3, ease: "easeOut" }}
                  style={{
                    height: "100%",
                    background: accent,
                    borderRadius: "1px",
                  }}
                />
              </div>

              {/* Label */}
              <p
                style={{
                  fontFamily: MONO,
                  fontSize: "0.42rem",
                  letterSpacing: "0.3em",
                  textTransform: "uppercase",
                  color: `${accent}`,
                  margin: "0 0 0.75rem",
                }}
              >
                {chapter.number === totalChapters
                  ? "Book Complete"
                  : `${chapter.number} of ${totalChapters} chapters`}
              </p>

              {/* Title */}
              <p
                style={{
                  fontFamily: SERIF,
                  fontSize: "1.4rem",
                  fontStyle: "italic",
                  color: `${CREAM}0.85)`,
                  lineHeight: 1.3,
                  margin: "0 0 0.35rem",
                }}
              >
                {book?.title ?? chapter.title}
              </p>

              {/* Subtitle */}
              <p
                style={{
                  fontFamily: SERIF,
                  fontSize: "0.9rem",
                  fontStyle: "italic",
                  color: `${CREAM}0.35)`,
                  margin: "0 0 1.5rem",
                }}
              >
                by Chico Montecristi · tintaxis.vercel.app
              </p>

              {/* Brass rule */}
              <div
                style={{
                  height: "1px",
                  background: `${BRASS}0.12)`,
                  marginBottom: "1rem",
                }}
              />

              {/* Actions */}
              <div
                style={{
                  display: "flex",
                  gap: "0.5rem",
                  justifyContent: "center",
                  flexWrap: "wrap",
                }}
              >
                <QuoteButton onClick={copyMilestone} accent={accent}>
                  {copied ? "✓ Copied" : "⎘ Copy"}
                </QuoteButton>
                <QuoteButton onClick={shareOnTwitter} accent={accent}>
                  𝕏 Post
                </QuoteButton>
                <QuoteButton
                  onClick={() => setShowCard(false)}
                  accent={accent}
                  ghost
                >
                  Close
                </QuoteButton>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// 3. SEND TO A FRIEND — Email a chapter link to someone
// ═══════════════════════════════════════════════════════════════════════════════

export function SendToFriend({ chapter }: { chapter: Chapter }) {
  const [isOpen, setIsOpen] = useState(false);
  const [friendEmail, setFriendEmail] = useState("");
  const [senderName, setSenderName] = useState("");
  const [status, setStatus] = useState<"idle" | "sending" | "sent" | "error">("idle");
  const pathname = usePathname();

  const fullUrl = typeof window !== "undefined"
    ? `${window.location.origin}${pathname}`
    : `${BASE_URL}${pathname}`;

  const book = chapter.bookSlug ? BOOKS[chapter.bookSlug] : null;
  const accent = book?.accentColor ?? "#C9A84C";

  const handleSend = async () => {
    if (!friendEmail || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(friendEmail)) return;

    setStatus("sending");
    try {
      const res = await fetch("/api/send-to-friend", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          friendEmail,
          senderName: senderName.trim() || "A reader",
          chapterTitle: chapter.title,
          bookTitle: book?.title ?? "a book",
          chapterUrl: fullUrl,
          accent: book?.accentColor ?? "#C9A84C",
        }),
      });
      if (res.ok) {
        setStatus("sent");
        setTimeout(() => {
          setIsOpen(false);
          setStatus("idle");
          setFriendEmail("");
          setSenderName("");
        }, 3000);
      } else {
        setStatus("error");
      }
    } catch {
      setStatus("error");
    }
  };

  return (
    <>
      {/* Trigger */}
      <motion.div
        style={{
          display: "flex",
          justifyContent: "center",
          marginTop: "0.75rem",
        }}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5, delay: 1 }}
      >
        <motion.button
          onClick={() => setIsOpen(true)}
          style={{
            fontFamily: MONO,
            fontSize: "0.42rem",
            letterSpacing: "0.18em",
            textTransform: "uppercase",
            padding: "8px 18px",
            border: `1px solid ${BRASS}0.15)`,
            borderRadius: "2px",
            background: `${BRASS}0.03)`,
            color: `${BRASS}0.45)`,
            cursor: "pointer",
            transition: "all 0.2s ease",
          }}
          whileHover={{
            borderColor: `${BRASS}0.35)`,
            background: `${BRASS}0.06)`,
          }}
        >
          ✉ Send to a Friend
        </motion.button>
      </motion.div>

      {/* Modal */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            style={{
              position: "fixed",
              inset: 0,
              zIndex: 200,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              background: "rgba(0,0,0,0.7)",
              backdropFilter: "blur(4px)",
              padding: "1.5rem",
            }}
            onClick={(e) => {
              if (e.target === e.currentTarget) setIsOpen(false);
            }}
          >
            <motion.div
              initial={{ scale: 0.92, y: 16 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.95, y: 8 }}
              transition={{ duration: 0.25, ease: [0.2, 0, 0.1, 1] }}
              style={{
                background: "#0D0B08",
                border: `1px solid ${BRASS}0.2)`,
                maxWidth: "400px",
                width: "100%",
                padding: "2rem",
                position: "relative",
              }}
            >
              {/* Header */}
              <p
                style={{
                  fontFamily: MONO,
                  fontSize: "0.45rem",
                  letterSpacing: "0.3em",
                  textTransform: "uppercase",
                  color: `${BRASS}0.4)`,
                  margin: "0 0 0.35rem",
                }}
              >
                Send this chapter
              </p>
              <p
                style={{
                  fontFamily: SERIF,
                  fontSize: "1.15rem",
                  fontStyle: "italic",
                  color: `${CREAM}0.75)`,
                  margin: "0 0 1.5rem",
                  lineHeight: 1.3,
                }}
              >
                {chapter.title}
                <span
                  style={{
                    color: `${CREAM}0.3)`,
                    fontSize: "0.9rem",
                  }}
                >
                  {" "}
                  — {book?.title}
                </span>
              </p>

              {status === "sent" ? (
                <motion.div
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  style={{ textAlign: "center", padding: "1rem 0" }}
                >
                  <p
                    style={{
                      fontFamily: SERIF,
                      fontSize: "1.1rem",
                      fontStyle: "italic",
                      color: "rgba(0,229,204,0.8)",
                      margin: "0 0 0.5rem",
                    }}
                  >
                    Sent.
                  </p>
                  <p
                    style={{
                      fontFamily: MONO,
                      fontSize: "0.4rem",
                      letterSpacing: "0.15em",
                      color: `${CREAM}0.3)`,
                      textTransform: "uppercase",
                    }}
                  >
                    Your friend will receive a personal invite
                  </p>
                </motion.div>
              ) : (
                <>
                  {/* Your name (optional) */}
                  <div style={{ marginBottom: "0.75rem" }}>
                    <label
                      style={{
                        fontFamily: MONO,
                        fontSize: "0.4rem",
                        letterSpacing: "0.2em",
                        textTransform: "uppercase",
                        color: `${BRASS}0.3)`,
                        display: "block",
                        marginBottom: "0.35rem",
                      }}
                    >
                      Your name (optional)
                    </label>
                    <input
                      type="text"
                      value={senderName}
                      onChange={(e) => setSenderName(e.target.value)}
                      placeholder="A reader"
                      style={{
                        width: "100%",
                        fontFamily: SERIF,
                        fontSize: "0.95rem",
                        fontStyle: "italic",
                        padding: "8px 12px",
                        border: `1px solid ${BRASS}0.15)`,
                        borderRadius: "2px",
                        background: `${BRASS}0.03)`,
                        color: `${CREAM}0.75)`,
                        outline: "none",
                        boxSizing: "border-box",
                      }}
                    />
                  </div>

                  {/* Friend's email */}
                  <div style={{ marginBottom: "1.25rem" }}>
                    <label
                      style={{
                        fontFamily: MONO,
                        fontSize: "0.4rem",
                        letterSpacing: "0.2em",
                        textTransform: "uppercase",
                        color: `${BRASS}0.3)`,
                        display: "block",
                        marginBottom: "0.35rem",
                      }}
                    >
                      Their email
                    </label>
                    <input
                      type="email"
                      value={friendEmail}
                      onChange={(e) => setFriendEmail(e.target.value)}
                      placeholder="friend@email.com"
                      required
                      style={{
                        width: "100%",
                        fontFamily: SERIF,
                        fontSize: "0.95rem",
                        fontStyle: "italic",
                        padding: "8px 12px",
                        border: `1px solid ${BRASS}0.15)`,
                        borderRadius: "2px",
                        background: `${BRASS}0.03)`,
                        color: `${CREAM}0.75)`,
                        outline: "none",
                        boxSizing: "border-box",
                      }}
                    />
                  </div>

                  {status === "error" && (
                    <p
                      style={{
                        fontFamily: MONO,
                        fontSize: "0.4rem",
                        color: "rgba(192,57,43,0.7)",
                        marginBottom: "0.75rem",
                      }}
                    >
                      Something went wrong. Try again.
                    </p>
                  )}

                  {/* Buttons */}
                  <div
                    style={{
                      display: "flex",
                      gap: "0.5rem",
                    }}
                  >
                    <motion.button
                      onClick={handleSend}
                      disabled={status === "sending" || !friendEmail}
                      style={{
                        fontFamily: MONO,
                        fontSize: "0.45rem",
                        letterSpacing: "0.2em",
                        textTransform: "uppercase",
                        padding: "8px 20px",
                        border: "none",
                        borderRadius: "2px",
                        background: accent,
                        color: "#0D0B08",
                        cursor:
                          status === "sending" || !friendEmail
                            ? "not-allowed"
                            : "pointer",
                        opacity:
                          status === "sending" || !friendEmail ? 0.5 : 1,
                        transition: "all 0.2s ease",
                      }}
                      whileHover={
                        status !== "sending" && friendEmail
                          ? { opacity: 0.85 }
                          : {}
                      }
                      whileTap={
                        status !== "sending" && friendEmail
                          ? { scale: 0.98 }
                          : {}
                      }
                    >
                      {status === "sending" ? "Sending..." : "Send ✉"}
                    </motion.button>
                    <QuoteButton
                      onClick={() => setIsOpen(false)}
                      accent={accent}
                      ghost
                    >
                      Cancel
                    </QuoteButton>
                  </div>
                </>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
