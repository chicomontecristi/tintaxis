"use client";

import { useState, useEffect, useRef, useMemo, FormEvent } from "react";
import { motion, AnimatePresence } from "framer-motion";
import TintaxisLogo from "@/components/ui/TintaxisLogo";
import { BOOKS, getBookChaptersOrdered } from "@/lib/content/books";
import { BOOK_SALES, getSalesSummary, getRevenueByTitle } from "@/lib/content/book-sales";
import { useI18n } from "@/lib/i18n";

// ─── TYPES ─────────────────────────────────────────────────────────────────────
interface SignalQuestion {
  id: string;
  readerEmail: string;
  chapterSlug: string;
  chapterTitle: string;
  anchorText: string;
  question: string;
  askedAt: string;
  answered: boolean;
  reply?: string;
}

interface WhisperEntry {
  id: string;
  chapterSlug: string;
  chapterTitle: string;
  anchorText: string;
  whisper: string;
  createdAt: string;
}

interface ChapterStat {
  slug: string;
  number: number;
  title: string;
  isLocked: boolean;
  wordCount: number;
  reads: number;
  avgDepth: number; // 0–100
  signals: number;
}

// ─── MOCK DATA ─────────────────────────────────────────────────────────────────
// Phase 2: replace with live Supabase queries
const MOCK_SIGNALS: SignalQuestion[] = [
  {
    id: "s1",
    readerEmail: "m.larios@icloud.com",
    chapterSlug: "one",
    chapterTitle: "What Robbin Told Alma",
    anchorText: "her blood had dripped for hours by the time Bryant made it to the room",
    question: "Did you write this scene last? It reads like the whole chapter was building toward it.",
    askedAt: "2026-03-18T14:22:00Z",
    answered: false,
  },
  {
    id: "s2",
    readerEmail: "teodora.v@gmail.com",
    chapterSlug: "one",
    chapterTitle: "What Robbin Told Alma",
    anchorText: "Robbin was a fat slob, a careless waste",
    question: "This self-description inside Robbin's narration — is she aware she's describing herself?",
    askedAt: "2026-03-17T09:11:00Z",
    answered: true,
    reply: "Yes — deliberately. Robbin narrates herself the way the town would, because she's internalized it. She's both the gossip and the subject of it.",
  },
  {
    id: "s3",
    readerEmail: "k.santos@proton.me",
    chapterSlug: "one",
    chapterTitle: "What Robbin Told Alma",
    anchorText: "her hands, face and dress were stained with blood",
    question: "At this point I assumed Michelle did it. Was that intentional misdirection?",
    askedAt: "2026-03-16T20:47:00Z",
    answered: false,
  },
];

// (Mock data removed — Studio uses live data from API + BOOKS registry)

// ─── HELPERS ───────────────────────────────────────────────────────────────────
function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function DepthBar({ value }: { value: number }) {
  return (
    <div
      style={{
        height: "3px",
        background: "rgba(201,168,76,0.1)",
        borderRadius: "2px",
        overflow: "hidden",
        width: "80px",
        display: "inline-block",
        verticalAlign: "middle",
      }}
    >
      <motion.div
        initial={{ width: 0 }}
        animate={{ width: `${value}%` }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        style={{
          height: "100%",
          background: `rgba(201,168,76,${0.3 + (value / 100) * 0.6})`,
          borderRadius: "2px",
        }}
      />
    </div>
  );
}

function BrassRule({ opacity = 0.15 }: { opacity?: number }) {
  return (
    <div
      style={{
        height: "1px",
        background: `linear-gradient(90deg, transparent, rgba(201,168,76,${opacity}), transparent)`,
        margin: "1.5rem 0",
      }}
    />
  );
}

function SectionHeader({ label }: { label: string }) {
  return (
    <p
      style={{
        fontFamily: '"JetBrains Mono", monospace',
        fontSize: "0.48rem",
        letterSpacing: "0.35em",
        color: "rgba(201,168,76,0.4)",
        textTransform: "uppercase",
        marginBottom: "1.25rem",
      }}
    >
      {label}
    </p>
  );
}

// ─── SIGNAL QUESTION CARD ──────────────────────────────────────────────────────
function SignalCard({ signal, onReply }: { signal: SignalQuestion; onReply: (id: string, reply: string) => void }) {
  const { t } = useI18n();
  const [composing, setComposing] = useState(false);
  const [replyText, setReplyText] = useState(signal.reply ?? "");

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!replyText.trim()) return;
    onReply(signal.id, replyText.trim());
    setComposing(false);
  };

  return (
    <motion.div
      layout
      style={{
        border: `1px solid ${signal.answered ? "rgba(201,168,76,0.1)" : "rgba(201,168,76,0.22)"}`,
        padding: "1.5rem",
        position: "relative",
        marginBottom: "1rem",
        background: signal.answered ? "transparent" : "rgba(201,168,76,0.015)",
      }}
    >
      {/* Header row */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "0.75rem" }}>
        <div>
          <span
            style={{
              fontFamily: '"JetBrains Mono", monospace',
              fontSize: "0.48rem",
              letterSpacing: "0.15em",
              color: signal.answered ? "rgba(201,168,76,0.25)" : "rgba(201,168,76,0.6)",
              textTransform: "uppercase",
              marginRight: "0.75rem",
            }}
          >
            Ch. {signal.chapterTitle}
          </span>
          <span
            style={{
              fontFamily: '"JetBrains Mono", monospace',
              fontSize: "0.44rem",
              letterSpacing: "0.1em",
              color: "rgba(245,230,200,0.2)",
            }}
          >
            {signal.readerEmail} · {formatDate(signal.askedAt)}
          </span>
        </div>
        <span
          style={{
            fontFamily: '"JetBrains Mono", monospace',
            fontSize: "0.44rem",
            letterSpacing: "0.15em",
            color: signal.answered ? "rgba(201,168,76,0.3)" : "rgba(201,168,76,0.7)",
            textTransform: "uppercase",
          }}
        >
          {signal.answered ? t("studio.signals.status.replied") : t("studio.signals.status.open")}
        </span>
      </div>

      {/* Anchor text */}
      <p
        style={{
          fontFamily: '"EB Garamond", Garamond, Georgia, serif',
          fontSize: "0.85rem",
          fontStyle: "italic",
          color: "rgba(245,230,200,0.35)",
          marginBottom: "0.6rem",
          borderLeft: "2px solid rgba(201,168,76,0.2)",
          paddingLeft: "0.75rem",
        }}
      >
        "…{signal.anchorText}…"
      </p>

      {/* Question */}
      <p
        style={{
          fontFamily: '"EB Garamond", Garamond, Georgia, serif',
          fontSize: "1rem",
          lineHeight: 1.65,
          color: "rgba(245,230,200,0.75)",
          marginBottom: signal.answered || composing ? "1rem" : "0",
        }}
      >
        {signal.question}
      </p>

      {/* Existing reply */}
      {signal.answered && signal.reply && (
        <div
          style={{
            borderLeft: "2px solid rgba(201,168,76,0.25)",
            paddingLeft: "0.75rem",
            marginBottom: composing ? "1rem" : "0",
          }}
        >
          <p
            style={{
              fontFamily: '"JetBrains Mono", monospace',
              fontSize: "0.44rem",
              letterSpacing: "0.15em",
              color: "rgba(201,168,76,0.35)",
              textTransform: "uppercase",
              marginBottom: "0.35rem",
            }}
          >
            {t("studio.signals.yourReply")}
          </p>
          <p
            style={{
              fontFamily: '"EB Garamond", Garamond, Georgia, serif',
              fontSize: "0.9rem",
              lineHeight: 1.65,
              color: "rgba(245,230,200,0.5)",
              fontStyle: "italic",
            }}
          >
            {signal.reply}
          </p>
        </div>
      )}

      {/* Compose / reply UI */}
      <AnimatePresence>
        {composing && (
          <motion.form
            key="compose"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            onSubmit={handleSubmit}
            style={{ overflow: "hidden" }}
          >
            <textarea
              value={replyText}
              onChange={(e) => setReplyText(e.target.value)}
              autoFocus
              rows={3}
              placeholder={t("studio.signals.writeReply")}
              style={{
                width: "100%",
                background: "rgba(255,255,255,0.03)",
                border: "1px solid rgba(201,168,76,0.2)",
                padding: "0.65rem 0.75rem",
                color: "#F5E6C8",
                fontFamily: '"EB Garamond", Garamond, Georgia, serif',
                fontSize: "0.95rem",
                lineHeight: 1.65,
                outline: "none",
                resize: "vertical",
                boxSizing: "border-box",
                marginBottom: "0.75rem",
              }}
            />
            <div style={{ display: "flex", gap: "0.75rem" }}>
              <motion.button
                type="submit"
                whileHover={{ borderColor: "rgba(201,168,76,0.6)" }}
                style={{
                  fontFamily: '"JetBrains Mono", monospace',
                  fontSize: "0.5rem",
                  letterSpacing: "0.2em",
                  textTransform: "uppercase",
                  color: "#C9A84C",
                  background: "transparent",
                  border: "1px solid rgba(201,168,76,0.3)",
                  padding: "0.5rem 1.25rem",
                  cursor: "pointer",
                }}
              >
                {t("studio.signals.send")}
              </motion.button>
              <button
                type="button"
                onClick={() => setComposing(false)}
                style={{
                  fontFamily: '"JetBrains Mono", monospace',
                  fontSize: "0.5rem",
                  letterSpacing: "0.2em",
                  textTransform: "uppercase",
                  color: "rgba(245,230,200,0.25)",
                  background: "transparent",
                  border: "none",
                  cursor: "pointer",
                  padding: "0.5rem",
                }}
              >
                {t("studio.signals.cancel")}
              </button>
            </div>
          </motion.form>
        )}
      </AnimatePresence>

      {/* Reply button */}
      {!composing && (
        <div style={{ marginTop: "0.75rem" }}>
          <button
            onClick={() => setComposing(true)}
            style={{
              fontFamily: '"JetBrains Mono", monospace',
              fontSize: "0.46rem",
              letterSpacing: "0.2em",
              textTransform: "uppercase",
              color: signal.answered ? "rgba(201,168,76,0.25)" : "rgba(201,168,76,0.55)",
              background: "transparent",
              border: "none",
              cursor: "pointer",
              padding: 0,
            }}
          >
            {signal.answered ? t("studio.signals.edit") : t("studio.signals.reply")}
          </button>
        </div>
      )}
    </motion.div>
  );
}

// ─── MAIN DASHBOARD ────────────────────────────────────────────────────────────
type DashTab = "signals" | "whispers" | "chapters" | "voiceover" | "analytics";

interface LiveStats {
  readers: { total: number; active: number; byTier: Record<string, number> };
  stripe: {
    balance: { available: number; pending: number; currency: string };
    recentCharges: { amount: number; description: string | null; created: number }[];
  };
}

export default function AuthorDashboard() {
  const { t } = useI18n();
  const [activeTab, setActiveTab] = useState<DashTab>("signals");
  const [selectedBookSlug, setSelectedBookSlug] = useState("the-hunt");
  const [signals, setSignals] = useState<SignalQuestion[]>([]);
  const [whispers, setWhispers] = useState<WhisperEntry[]>([]);

  // ── Derive book info + chapters from registry ──────────────────────────
  const allBooks = useMemo(() => Object.values(BOOKS), []);
  const activeBook = BOOKS[selectedBookSlug] ?? BOOKS["the-hunt"];
  const bookChapters: ChapterStat[] = useMemo(() => {
    const ordered = getBookChaptersOrdered(selectedBookSlug);
    return ordered.map((ch, i) => ({
      slug: ch.slug,
      number: ch.number,
      title: ch.title,
      isLocked: ch.isLocked ?? (i > 0),
      wordCount: ch.wordCount ?? 0,
      reads: 0,
      avgDepth: 0,
      signals: 0,
    }));
  }, [selectedBookSlug]);

  const [whisperForm, setWhisperForm] = useState({ chapterSlug: activeBook.firstChapterSlug, anchorText: "", whisper: "" });
  const [whisperStatus, setWhisperStatus] = useState<"idle" | "saving" | "saved">("idle");
  const [whisperError, setWhisperError] = useState<string | null>(null);
  const [editingWhisperId, setEditingWhisperId] = useState<string | null>(null);
  const [editWhisperDraft, setEditWhisperDraft] = useState<{ anchorText: string; whisper: string }>({ anchorText: "", whisper: "" });
  const [editWhisperSaving, setEditWhisperSaving] = useState(false);
  const [editWhisperError, setEditWhisperError] = useState<string | null>(null);

  // ── Voiceover state ──────────────────────────────────────────────────────
  const [voiceovers, setVoiceovers] = useState<Record<string, string>>({}); // chapterSlug → url
  const [uploadingChapter, setUploadingChapter] = useState<string | null>(null);
  const [recordingChapter, setRecordingChapter] = useState<string | null>(null);
  const [mediaRecorder, setMediaRecorder] = useState<MediaRecorder | null>(null);
  const [recordedChunks, setRecordedChunks] = useState<Blob[]>([]);
  const [recordingTime, setRecordingTime] = useState(0);
  const recordingTimerRef = useRef<NodeJS.Timeout | null>(null);
  const [voiceoverPreview, setVoiceoverPreview] = useState<string | null>(null); // object URL
  const [previewChapter, setPreviewChapter] = useState<string | null>(null); // which chapter the preview belongs to

  const [stats, setStats] = useState<LiveStats | null>(null);
  const [statsLoading, setStatsLoading] = useState(true);

  // ── Fetch live data on mount ───────────────────────────────────────────────
  useEffect(() => {
    // Fetch signals
    fetch("/api/author/signals")
      .then((r) => r.json())
      .then((data) => {
        if (data.signals) {
          // Map DB shape to local shape
          setSignals(
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            data.signals.map((s: any) => ({
              id:           s.id,
              readerEmail:  s.reader_email ?? "anonymous",
              chapterSlug:  s.chapter_slug,
              chapterTitle: s.chapter_title ?? s.chapter_slug,
              anchorText:   s.selected_text ?? "",
              question:     s.question,
              askedAt:      s.created_at,
              answered:     s.answered,
              reply:        s.reply ?? undefined,
            }))
          );
        } else {
          // No DB yet — fall back to mock so the UI isn't empty
          setSignals(MOCK_SIGNALS);
        }
      })
      .catch(() => setSignals(MOCK_SIGNALS));

    // Fetch reader + Stripe stats
    fetch("/api/author/stats")
      .then((r) => r.json())
      .then((data) => {
        if (!data.error) setStats(data);
      })
      .catch(() => {})
      .finally(() => setStatsLoading(false));

    // Fetch existing voiceovers
    fetch(`/api/author/audio?book=${selectedBookSlug}`)
      .then((r) => r.json())
      .then((data) => {
        if (data.voiceovers) {
          const map: Record<string, string> = {};
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          data.voiceovers.forEach((v: any) => { map[v.chapterSlug] = `${v.url}?t=${Date.now()}`; });
          setVoiceovers(map);
        }
      })
      .catch(() => {});

    // Fetch whispers
    fetch("/api/author/whispers")
      .then((r) => r.json())
      .then((data) => {
        if (data.whispers) {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          setWhispers(data.whispers.map((w: any) => ({
            id:           w.id,
            chapterSlug:  w.chapter_slug,
            chapterTitle: w.chapter_title ?? w.chapter_slug,
            anchorText:   w.anchor_text,
            whisper:      w.content,
            createdAt:    w.created_at,
          })));
        }
      })
      .catch(() => {});
  }, [selectedBookSlug]);

  const openSignals = signals.filter((s) => !s.answered);
  const answeredSignals = signals.filter((s) => s.answered);

  const handleReply = async (id: string, reply: string) => {
    // Capture the previous state so we can roll back on failure
    const previous = signals;
    // Optimistic update
    setSignals((prev) =>
      prev.map((s) => (s.id === id ? { ...s, answered: true, reply } : s))
    );
    // Persist to Supabase
    try {
      const res = await fetch(`/api/author/signals/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ reply }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({} as any));
        setSignals(previous);
        alert(`Reply not saved: ${data?.error || `Server returned ${res.status}`}. Please try again.`);
      }
    } catch (err) {
      console.error("[dashboard] reply persist failed:", err);
      setSignals(previous);
      alert("Network error — your reply was NOT saved. Please check your connection and try again.");
    }
  };

  // ── Voiceover delete handler ────────────────────────────────────────────
  const [deletingChapter, setDeletingChapter] = useState<string | null>(null);

  const handleVoiceoverDelete = async (chapterSlug: string) => {
    if (!confirm(`Delete the voiceover for this chapter?`)) return;
    setDeletingChapter(chapterSlug);
    try {
      const res = await fetch(`/api/author/audio?book=${selectedBookSlug}&chapter=${chapterSlug}`, {
        method: "DELETE",
      });
      const data = await res.json();
      if (!res.ok) {
        alert(`Delete failed: ${data.error || "Unknown error"}`);
        return;
      }
      setVoiceovers((prev) => {
        const next = { ...prev };
        delete next[chapterSlug];
        return next;
      });
    } catch {
      alert("Delete failed — check your connection.");
    } finally {
      setDeletingChapter(null);
    }
  };

  // ── Voiceover upload handler ────────────────────────────────────────────
  // Uses a presign → direct-to-Supabase flow to bypass Vercel's 4.5 MB body
  // cap. The route handler only exchanges a tiny JSON token; the actual file
  // bytes go from the browser straight to Supabase Storage.
  const MAX_UPLOAD_MB = 50;
  const MAX_UPLOAD_BYTES = MAX_UPLOAD_MB * 1024 * 1024;

  const handleVoiceoverUpload = async (chapterSlug: string, file: File): Promise<boolean> => {
    // ── Client-side size gate ──────────────────────────────────
    if (file.size > MAX_UPLOAD_BYTES) {
      const sizeMB = (file.size / (1024 * 1024)).toFixed(1);
      alert(
        `File too large (${sizeMB} MB). Maximum is ${MAX_UPLOAD_MB} MB.\n\n` +
        `.wav files are uncompressed and can be huge — convert to .mp3 first for a ~10× size reduction with no audible quality loss.`
      );
      return false;
    }

    setUploadingChapter(chapterSlug);
    try {
      // Step 1: Get a signed upload URL from the server (tiny JSON, no file bytes)
      const presignRes = await fetch("/api/author/audio/presign", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          bookSlug: selectedBookSlug,
          chapterSlug,
          contentType: file.type || "audio/mpeg",
          size: file.size,
        }),
      });
      const presignData = await presignRes.json();
      if (!presignRes.ok || !presignData.signedUrl) {
        const msg = presignData.error || "Could not prepare upload";
        alert(
          msg.includes("Invalid audio type")
            ? `${msg}\n\nAccepted formats: .mp3, .m4a, .wav, .webm`
            : msg.includes("too large") || msg.includes("Too large")
            ? `${msg}\n\nTip: Convert .wav to .mp3 for a ~10× size reduction.`
            : `Upload failed: ${msg}`
        );
        return false;
      }

      // Step 2: PUT the file directly to Supabase (bypasses Vercel body limit)
      const uploadRes = await fetch(presignData.signedUrl, {
        method: "PUT",
        headers: { "Content-Type": presignData.contentType },
        body: file,
      });
      if (!uploadRes.ok) {
        const errText = await uploadRes.text().catch(() => uploadRes.statusText);
        alert(`Upload failed: ${errText}`);
        return false;
      }

      // Step 3: Update the UI with the public URL (already includes cache-buster)
      setVoiceovers((prev) => ({ ...prev, [chapterSlug]: presignData.publicUrl }));
      return true;
    } catch (err) {
      console.error("[voiceover] upload failed:", err);
      alert("Upload failed — check your connection and try again.");
      return false;
    } finally {
      setUploadingChapter(null);
    }
  };

  // ── Browser recording handlers ────────────────────────────────────────
  const chunksRef = useRef<Blob[]>([]);

  const startRecording = async (chapterSlug: string) => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });

      // Pick a supported mimeType — Safari doesn't support webm
      const mimeType = MediaRecorder.isTypeSupported("audio/webm;codecs=opus")
        ? "audio/webm;codecs=opus"
        : MediaRecorder.isTypeSupported("audio/webm")
        ? "audio/webm"
        : MediaRecorder.isTypeSupported("audio/mp4")
        ? "audio/mp4"
        : ""; // let browser pick default

      const recorder = mimeType
        ? new MediaRecorder(stream, { mimeType })
        : new MediaRecorder(stream);

      chunksRef.current = [];

      recorder.ondataavailable = (e) => {
        if (e.data && e.data.size > 0) {
          chunksRef.current.push(e.data);
        }
      };

      recorder.onstop = () => {
        stream.getTracks().forEach((t) => t.stop());
        const finalChunks = [...chunksRef.current];
        setRecordedChunks(finalChunks);
        if (finalChunks.length > 0) {
          const blob = new Blob(finalChunks, { type: recorder.mimeType || "audio/webm" });
          setVoiceoverPreview(URL.createObjectURL(blob));
          setPreviewChapter(chapterSlug); // scope preview to this chapter
        }
        setRecordingChapter(null);
        if (recordingTimerRef.current) clearInterval(recordingTimerRef.current);
      };

      // Start with 1-second timeslice so ondataavailable fires periodically
      recorder.start(1000);
      setMediaRecorder(recorder);
      setRecordingChapter(chapterSlug);
      setRecordingTime(0);
      setRecordedChunks([]);
      setVoiceoverPreview(null);

      recordingTimerRef.current = setInterval(() => {
        setRecordingTime((t) => t + 1);
      }, 1000);
    } catch (err) {
      console.error("[voiceover] mic access denied:", err);
      alert("Microphone access denied. Check your browser permissions.");
    }
  };

  const stopRecording = () => {
    if (mediaRecorder && mediaRecorder.state !== "inactive") {
      mediaRecorder.stop();
    }
    if (recordingTimerRef.current) clearInterval(recordingTimerRef.current);
  };

  const saveRecording = async (chapterSlug: string) => {
    // Use chunksRef (always current) instead of recordedChunks state (can be stale via closure)
    const chunks = chunksRef.current;
    if (chunks.length === 0) return;
    const mimeType = chunks[0]?.type || "audio/webm";
    const ext = mimeType.includes("mp4") ? "mp4" : "webm";
    const blob = new Blob(chunks, { type: mimeType });
    const file = new File([blob], `${chapterSlug}.${ext}`, { type: mimeType });
    const ok = await handleVoiceoverUpload(chapterSlug, file);
    if (ok) {
      chunksRef.current = [];
      setRecordedChunks([]);
      if (voiceoverPreview) {
        URL.revokeObjectURL(voiceoverPreview);
        setVoiceoverPreview(null);
      }
      setPreviewChapter(null);
    }
  };

  const handleLogout = async () => {
    await fetch("/api/auth/logout", { method: "POST" });
    window.location.href = "/author/login";
  };

  const handleAddWhisper = async (e: FormEvent) => {
    e.preventDefault();
    setWhisperError(null);

    const anchor = whisperForm.anchorText.trim();
    const body   = whisperForm.whisper.trim();

    if (!anchor && !body) {
      setWhisperError("Fill in both the anchor text and the whisper body.");
      return;
    }
    if (!anchor) {
      setWhisperError("Anchor text is required — paste the sentence the whisper responds to.");
      return;
    }
    if (!body) {
      setWhisperError("Whisper body is required — write what you want to say.");
      return;
    }

    setWhisperStatus("saving");
    try {
      const res = await fetch("/api/author/whispers", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          chapterSlug: whisperForm.chapterSlug,
          anchorText:  anchor,
          content:     body,
        }),
      });
      const data = await res.json().catch(() => ({} as any));

      if (!res.ok) {
        setWhisperError(data?.error || `Server returned ${res.status}. Please try again.`);
        setWhisperStatus("idle");
        return;
      }
      if (!data.whisper) {
        setWhisperError("Server did not return the new whisper. Please refresh and try again.");
        setWhisperStatus("idle");
        return;
      }

      const w = data.whisper;
      setWhispers((prev) => [{
        id:           w.id,
        chapterSlug:  w.chapter_slug,
        chapterTitle: w.chapter_title ?? w.chapter_slug,
        anchorText:   w.anchor_text,
        whisper:      w.content,
        createdAt:    w.created_at,
      }, ...prev]);

      setWhisperForm((prev) => ({ ...prev, anchorText: "", whisper: "" }));
      setWhisperStatus("saved");
      setTimeout(() => setWhisperStatus("idle"), 2000);
    } catch (err) {
      console.error("[dashboard] whisper persist failed:", err);
      setWhisperError("Network error. Your whisper was NOT saved. Please try again.");
      setWhisperStatus("idle");
    }
  };

  const handleDeleteWhisper = async (id: string) => {
    const previous = whispers;
    // Optimistic removal
    setWhispers((prev) => prev.filter((w) => w.id !== id));
    try {
      const res = await fetch(`/api/author/whispers/${id}`, { method: "DELETE" });
      if (!res.ok) {
        const data = await res.json().catch(() => ({} as any));
        setWhispers(previous);
        alert(`Delete failed: ${data?.error || `Server returned ${res.status}`}. The whisper was restored.`);
      }
    } catch (err) {
      console.error("[dashboard] whisper delete failed:", err);
      setWhispers(previous);
      alert("Network error — the whisper could not be deleted. It has been restored.");
    }
  };

  const startEditWhisper = (w: WhisperEntry) => {
    setEditingWhisperId(w.id);
    setEditWhisperDraft({ anchorText: w.anchorText, whisper: w.whisper });
    setEditWhisperError(null);
  };

  const cancelEditWhisper = () => {
    setEditingWhisperId(null);
    setEditWhisperDraft({ anchorText: "", whisper: "" });
    setEditWhisperError(null);
    setEditWhisperSaving(false);
  };

  const saveEditWhisper = async (id: string) => {
    const anchor = editWhisperDraft.anchorText.trim();
    const body   = editWhisperDraft.whisper.trim();
    if (!anchor) { setEditWhisperError("Anchor text is required."); return; }
    if (!body)   { setEditWhisperError("Whisper body is required."); return; }

    setEditWhisperError(null);
    setEditWhisperSaving(true);
    try {
      const res = await fetch(`/api/author/whispers/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ anchorText: anchor, content: body }),
      });
      const data = await res.json().catch(() => ({} as any));
      if (!res.ok || !data?.whisper) {
        setEditWhisperError(data?.error || `Server returned ${res.status}. Please try again.`);
        setEditWhisperSaving(false);
        return;
      }
      const w = data.whisper;
      setWhispers((prev) =>
        prev.map((existing) =>
          existing.id === id
            ? {
                ...existing,
                anchorText: w.anchor_text,
                whisper:    w.content,
              }
            : existing
        )
      );
      cancelEditWhisper();
    } catch (err) {
      console.error("[dashboard] whisper edit failed:", err);
      setEditWhisperError("Network error — your changes were NOT saved. Please try again.");
      setEditWhisperSaving(false);
    }
  };

  const handleDeleteAllWhispers = async () => {
    if (whispers.length === 0) return;
    const confirmed = window.confirm(
      `Permanently delete all ${whispers.length} whispers in the database? The Experience page demo whispers are hard-coded and will NOT be affected. This cannot be undone.`
    );
    if (!confirmed) return;
    const prev = whispers;
    setWhispers([]);
    try {
      const res = await fetch("/api/author/whispers", { method: "DELETE" });
      if (!res.ok) throw new Error(`Server returned ${res.status}`);
    } catch (err) {
      console.error("[dashboard] bulk whisper delete failed:", err);
      setWhispers(prev); // roll back on failure
      alert("Could not delete whispers. Please try again.");
    }
  };

  const TABS: { id: DashTab; label: string; badge?: number }[] = [
    { id: "signals",   label: t("studio.tabs.signals"),   badge: openSignals.length || undefined },
    { id: "whispers",  label: t("studio.tabs.whispers") },
    { id: "chapters",  label: t("studio.tabs.chapters") },
    { id: "voiceover", label: t("studio.tabs.voice") },
    { id: "analytics", label: t("studio.tabs.analytics") },
  ];

  const inputStyle: React.CSSProperties = {
    width: "100%",
    background: "rgba(255,255,255,0.03)",
    border: "1px solid rgba(201,168,76,0.15)",
    padding: "0.6rem 0.8rem",
    color: "#F5E6C8",
    fontFamily: '"JetBrains Mono", monospace',
    fontSize: "0.78rem",
    outline: "none",
    borderRadius: "1px",
    boxSizing: "border-box" as const,
  };

  const labelStyle: React.CSSProperties = {
    fontFamily: '"JetBrains Mono", monospace',
    fontSize: "0.46rem",
    letterSpacing: "0.2em",
    color: "rgba(245,230,200,0.3)",
    textTransform: "uppercase",
    display: "block",
    marginBottom: "0.4rem",
  };

  return (
    <div style={{ minHeight: "100vh", backgroundColor: "#0D0B08", color: "#F5E6C8" }}>
      {/* Background glow */}
      <div
        style={{
          position: "fixed",
          inset: 0,
          pointerEvents: "none",
          background: "radial-gradient(ellipse at 60% 0%, rgba(44,26,0,0.3) 0%, transparent 55%)",
          zIndex: 0,
        }}
      />


      <div style={{ position: "relative", zIndex: 1, maxWidth: "960px", margin: "0 auto", padding: "2.5rem 2rem" }}>

        {/* ── BOOK SELECTOR ────────────────────────────────────────── */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.4 }}
          style={{
            display: "flex",
            gap: "0",
            marginBottom: "1.5rem",
            borderBottom: "1px solid rgba(201,168,76,0.1)",
            overflowX: "auto",
          }}
        >
          {allBooks.map((book) => (
            <button
              key={book.slug}
              onClick={() => {
                setSelectedBookSlug(book.slug);
                setVoiceovers({});
                setWhisperForm({ chapterSlug: book.firstChapterSlug, anchorText: "", whisper: "" });
              }}
              style={{
                fontFamily: '"EB Garamond", Garamond, Georgia, serif',
                fontSize: "0.9rem",
                color: selectedBookSlug === book.slug ? "rgba(245,230,200,0.85)" : "rgba(245,230,200,0.3)",
                background: "transparent",
                border: "none",
                borderBottom: selectedBookSlug === book.slug ? "1px solid #C9A84C" : "1px solid transparent",
                padding: "0.6rem 1.25rem",
                cursor: "pointer",
                marginBottom: "-1px",
                whiteSpace: "nowrap",
                transition: "color 0.2s",
              }}
            >
              {book.title}
              <span
                style={{
                  fontFamily: '"JetBrains Mono", monospace',
                  fontSize: "0.42rem",
                  letterSpacing: "0.1em",
                  marginLeft: "0.5rem",
                  color: selectedBookSlug === book.slug ? "rgba(201,168,76,0.5)" : "rgba(201,168,76,0.2)",
                  textTransform: "uppercase",
                }}
              >
                {book.coverLabel}
              </span>
            </button>
          ))}
        </motion.div>

        {/* Work title */}
        <motion.div
          key={selectedBookSlug}
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          style={{ marginBottom: "2rem" }}
        >
          <p
            style={{
              fontFamily: '"JetBrains Mono", monospace',
              fontSize: "0.46rem",
              letterSpacing: "0.3em",
              color: "rgba(201,168,76,0.35)",
              textTransform: "uppercase",
              marginBottom: "0.25rem",
            }}
          >
            {t("studio.activeWork")}
          </p>
          <h1
            style={{
              fontFamily: '"EB Garamond", Garamond, Georgia, serif',
              fontSize: "1.8rem",
              fontWeight: 400,
              color: "rgba(245,230,200,0.85)",
              marginBottom: "0.1rem",
            }}
          >
            {activeBook.title}
          </h1>
          <p
            style={{
              fontFamily: '"EB Garamond", Garamond, Georgia, serif',
              fontSize: "0.9rem",
              fontStyle: "italic",
              color: "rgba(245,230,200,0.3)",
            }}
          >
            {activeBook.subtitle} · {activeBook.wordCount?.toLocaleString()} words · {activeBook.totalChapters} {activeBook.chapterLabel?.toLowerCase() ?? "chapter"}s · {activeBook.language?.toUpperCase()}
          </p>
        </motion.div>

        {/* ── STAT STRIP ──────────────────────────────────────────────────── */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(4, 1fr)",
            gap: "1px",
            border: "1px solid rgba(201,168,76,0.12)",
            marginBottom: "2.5rem",
          }}
        >
          {(() => {
            const salesSummary = getSalesSummary();
            const stripeRevenueDollars = stats
              ? (stats.stripe.balance.available + stats.stripe.balance.pending) / 100
              : 0;
            // salesSummary.totalRevenueNet is post Stripe-fee for direct sales.
            // stripeRevenueDollars comes from stripe.balance which is already net.
            const totalRevenue = salesSummary.totalRevenueNet + stripeRevenueDollars;
            return [
              {
                label: t("studio.stats.booksSold"),
                value: String(salesSummary.totalCount),
              },
              {
                label: t("studio.stats.revenue"),
                value: statsLoading
                  ? "—"
                  : `$${totalRevenue.toFixed(2)}`,
              },
              { label: t("studio.stats.openSignals"), value: String(openSignals.length) },
              { label: t("studio.stats.whispers"), value: String(whispers.length) },
            ];
          })().map((stat, i) => (
            <div
              key={i}
              style={{
                padding: "1.25rem 1.5rem",
                borderRight: i < 3 ? "1px solid rgba(201,168,76,0.12)" : "none",
                textAlign: "center",
              }}
            >
              <p
                style={{
                  fontFamily: '"EB Garamond", Garamond, Georgia, serif',
                  fontSize: "2rem",
                  fontWeight: 400,
                  color: "rgba(201,168,76,0.8)",
                  lineHeight: 1,
                  marginBottom: "0.3rem",
                }}
              >
                {stat.value}
              </p>
              <p
                style={{
                  fontFamily: '"JetBrains Mono", monospace',
                  fontSize: "0.44rem",
                  letterSpacing: "0.2em",
                  color: "rgba(245,230,200,0.25)",
                  textTransform: "uppercase",
                }}
              >
                {stat.label}
              </p>
            </div>
          ))}
        </motion.div>

        {/* ── TABS ────────────────────────────────────────────────────────── */}
        <div
          style={{
            display: "flex",
            gap: "0",
            borderBottom: "1px solid rgba(201,168,76,0.12)",
            marginBottom: "2rem",
          }}
        >
          {TABS.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              style={{
                fontFamily: '"JetBrains Mono", monospace',
                fontSize: "0.48rem",
                letterSpacing: "0.25em",
                textTransform: "uppercase",
                color: activeTab === tab.id ? "#C9A84C" : "rgba(245,230,200,0.2)",
                background: "transparent",
                border: "none",
                borderBottom: activeTab === tab.id ? "1px solid #C9A84C" : "1px solid transparent",
                padding: "0.75rem 1.25rem",
                cursor: "pointer",
                marginBottom: "-1px",
                position: "relative",
                transition: "color 0.2s",
              }}
            >
              {tab.label}
              {tab.badge ? (
                <span
                  style={{
                    marginLeft: "0.5rem",
                    background: "rgba(201,168,76,0.2)",
                    color: "#C9A84C",
                    fontFamily: '"JetBrains Mono", monospace',
                    fontSize: "0.44rem",
                    padding: "0.1rem 0.4rem",
                    borderRadius: "2px",
                  }}
                >
                  {tab.badge}
                </span>
              ) : null}
            </button>
          ))}
        </div>

        {/* ── TAB CONTENT ─────────────────────────────────────────────────── */}
        <AnimatePresence mode="wait">

          {/* SIGNALS TAB */}
          {activeTab === "signals" && (
            <motion.div
              key="signals"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.25 }}
            >
              {openSignals.length > 0 && (
                <>
                  <SectionHeader label={t("studio.signals.open", { count: openSignals.length })} />
                  {openSignals.map((s) => (
                    <SignalCard key={s.id} signal={s} onReply={handleReply} />
                  ))}
                  <BrassRule />
                </>
              )}

              {answeredSignals.length > 0 && (
                <>
                  <SectionHeader label={t("studio.signals.replied", { count: answeredSignals.length })} />
                  {answeredSignals.map((s) => (
                    <SignalCard key={s.id} signal={s} onReply={handleReply} />
                  ))}
                </>
              )}

              {signals.length === 0 && (
                <p
                  style={{
                    fontFamily: '"EB Garamond", Garamond, Georgia, serif',
                    fontSize: "1rem",
                    fontStyle: "italic",
                    color: "rgba(245,230,200,0.25)",
                    textAlign: "center",
                    paddingTop: "3rem",
                  }}
                >
                  {t("studio.signals.empty")}
                </p>
              )}
            </motion.div>
          )}

          {/* WHISPERS TAB */}
          {activeTab === "whispers" && (
            <motion.div
              key="whispers"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.25 }}
            >
              {/* Compose form */}
              <div
                style={{
                  border: "1px solid rgba(201,168,76,0.18)",
                  padding: "1.75rem",
                  marginBottom: "2rem",
                  position: "relative",
                }}
              >
                <SectionHeader label={t("studio.whispers.new")} />
                <form onSubmit={handleAddWhisper}>
                  <div style={{ marginBottom: "1rem" }}>
                    <label style={labelStyle}>{t("studio.whispers.chapter")}</label>
                    <select
                      value={whisperForm.chapterSlug}
                      onChange={(e) => setWhisperForm((p) => ({ ...p, chapterSlug: e.target.value }))}
                      style={{ ...inputStyle, appearance: "none" }}
                    >
                      {bookChapters.map((ch) => (
                        <option key={ch.slug} value={ch.slug}>
                          {ch.number}. {ch.title}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div style={{ marginBottom: "1rem" }}>
                    <label style={labelStyle}>{t("studio.whispers.anchor")}</label>
                    <input
                      type="text"
                      value={whisperForm.anchorText}
                      onChange={(e) => setWhisperForm((p) => ({ ...p, anchorText: e.target.value }))}
                      placeholder={t("studio.whispers.anchorPlaceholder")}
                      style={inputStyle}
                      onFocus={(e) => (e.target.style.borderColor = "rgba(201,168,76,0.4)")}
                      onBlur={(e) => (e.target.style.borderColor = "rgba(201,168,76,0.15)")}
                    />
                  </div>
                  <div style={{ marginBottom: "1.25rem" }}>
                    <label style={labelStyle}>{t("studio.whispers.label")}</label>
                    <textarea
                      value={whisperForm.whisper}
                      onChange={(e) => setWhisperForm((p) => ({ ...p, whisper: e.target.value }))}
                      rows={3}
                      placeholder={t("studio.whispers.placeholder")}
                      style={{ ...inputStyle, resize: "vertical", lineHeight: 1.65,
                        fontFamily: '"EB Garamond", Garamond, Georgia, serif', fontSize: "0.95rem" }}
                      onFocus={(e) => (e.target.style.borderColor = "rgba(201,168,76,0.4)")}
                      onBlur={(e) => (e.target.style.borderColor = "rgba(201,168,76,0.15)")}
                    />
                  </div>
                  <motion.button
                    type="submit"
                    disabled={whisperStatus === "saving"}
                    whileHover={whisperStatus === "saving" ? {} : { borderColor: "rgba(201,168,76,0.6)" }}
                    whileTap={whisperStatus === "saving" ? {} : { scale: 0.98 }}
                    style={{
                      fontFamily: '"JetBrains Mono", monospace',
                      fontSize: "0.52rem",
                      letterSpacing: "0.22em",
                      textTransform: "uppercase",
                      color:
                        whisperStatus === "saved"
                          ? "rgba(201,168,76,0.4)"
                          : whisperStatus === "saving"
                          ? "rgba(201,168,76,0.6)"
                          : "#C9A84C",
                      background: "transparent",
                      border: "1px solid rgba(201,168,76,0.3)",
                      padding: "0.65rem 1.5rem",
                      cursor: whisperStatus === "saving" ? "wait" : "pointer",
                      opacity: whisperStatus === "saving" ? 0.7 : 1,
                    }}
                  >
                    {whisperStatus === "saved"
                      ? t("studio.whispers.saved")
                      : whisperStatus === "saving"
                      ? "Saving…"
                      : t("studio.whispers.add")}
                  </motion.button>
                  {whisperError && (
                    <p
                      style={{
                        marginTop: "0.85rem",
                        fontFamily: '"JetBrains Mono", monospace',
                        fontSize: "0.72rem",
                        letterSpacing: "0.05em",
                        color: "rgba(255,120,120,0.85)",
                        lineHeight: 1.5,
                      }}
                    >
                      {whisperError}
                    </p>
                  )}
                </form>
              </div>

              {/* Existing whispers */}
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <SectionHeader label={t("studio.whispers.placed", { count: whispers.length })} />
                {whispers.length > 0 && (
                  <button
                    onClick={handleDeleteAllWhispers}
                    style={{
                      fontFamily: '"JetBrains Mono", monospace',
                      fontSize: "0.55rem",
                      letterSpacing: "0.15em",
                      textTransform: "uppercase",
                      color: "rgba(255,120,120,0.6)",
                      background: "transparent",
                      border: "1px solid rgba(255,120,120,0.25)",
                      padding: "0.45rem 0.85rem",
                      cursor: "pointer",
                    }}
                    title="Remove every whisper from the database. Experience page demo whispers are not affected."
                  >
                    Delete All
                  </button>
                )}
              </div>
              {whispers.length === 0 && (
                <p
                  style={{
                    fontFamily: '"EB Garamond", Garamond, Georgia, serif',
                    fontSize: "1rem",
                    fontStyle: "italic",
                    color: "rgba(245,230,200,0.25)",
                    textAlign: "center",
                    paddingTop: "2rem",
                  }}
                >
                  {t("studio.whispers.empty")}
                </p>
              )}
              {whispers.map((w) => {
                const isEditing = editingWhisperId === w.id;
                return (
                <motion.div
                  key={w.id}
                  layout
                  style={{
                    border: isEditing
                      ? "1px solid rgba(201,168,76,0.35)"
                      : "1px solid rgba(201,168,76,0.1)",
                    padding: "1.25rem 1.5rem",
                    marginBottom: "0.75rem",
                  }}
                >
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "0.5rem" }}>
                    <span
                      style={{
                        fontFamily: '"JetBrains Mono", monospace',
                        fontSize: "0.44rem",
                        letterSpacing: "0.15em",
                        color: "rgba(201,168,76,0.35)",
                        textTransform: "uppercase",
                      }}
                    >
                      {w.chapterTitle}
                    </span>
                    <div style={{ display: "flex", alignItems: "center", gap: "0.85rem" }}>
                      <span
                        style={{
                          fontFamily: '"JetBrains Mono", monospace',
                          fontSize: "0.44rem",
                          color: "rgba(245,230,200,0.2)",
                        }}
                      >
                        {formatDate(w.createdAt)}
                      </span>
                      {!isEditing && (
                        <>
                          <button
                            onClick={() => startEditWhisper(w)}
                            style={{
                              fontFamily: '"JetBrains Mono", monospace',
                              fontSize: "0.52rem",
                              letterSpacing: "0.15em",
                              textTransform: "uppercase",
                              color: "rgba(201,168,76,0.7)",
                              background: "transparent",
                              border: "1px solid rgba(201,168,76,0.25)",
                              cursor: "pointer",
                              padding: "0.2rem 0.55rem",
                              lineHeight: 1,
                            }}
                            title="Edit whisper"
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => handleDeleteWhisper(w.id)}
                            style={{
                              fontFamily: '"JetBrains Mono", monospace',
                              fontSize: "0.44rem",
                              letterSpacing: "0.1em",
                              color: "rgba(245,230,200,0.2)",
                              background: "transparent",
                              border: "none",
                              cursor: "pointer",
                              padding: "0 0.2rem",
                              lineHeight: 1,
                            }}
                            title="Remove whisper"
                          >
                            ×
                          </button>
                        </>
                      )}
                    </div>
                  </div>

                  {isEditing ? (
                    <div style={{ marginTop: "0.4rem" }}>
                      <label style={labelStyle}>{t("studio.whispers.anchor")}</label>
                      <input
                        type="text"
                        value={editWhisperDraft.anchorText}
                        onChange={(e) => setEditWhisperDraft((p) => ({ ...p, anchorText: e.target.value }))}
                        style={inputStyle}
                      />
                      <div style={{ height: "0.65rem" }} />
                      <label style={labelStyle}>{t("studio.whispers.label")}</label>
                      <textarea
                        value={editWhisperDraft.whisper}
                        onChange={(e) => setEditWhisperDraft((p) => ({ ...p, whisper: e.target.value }))}
                        rows={3}
                        style={{ ...inputStyle, resize: "vertical", lineHeight: 1.65,
                          fontFamily: '"EB Garamond", Garamond, Georgia, serif', fontSize: "0.95rem" }}
                      />
                      <div style={{ display: "flex", gap: "0.6rem", marginTop: "0.9rem" }}>
                        <button
                          onClick={() => saveEditWhisper(w.id)}
                          disabled={editWhisperSaving}
                          style={{
                            fontFamily: '"JetBrains Mono", monospace',
                            fontSize: "0.52rem",
                            letterSpacing: "0.22em",
                            textTransform: "uppercase",
                            color: editWhisperSaving ? "rgba(201,168,76,0.5)" : "#C9A84C",
                            background: "transparent",
                            border: "1px solid rgba(201,168,76,0.3)",
                            padding: "0.55rem 1.25rem",
                            cursor: editWhisperSaving ? "wait" : "pointer",
                            opacity: editWhisperSaving ? 0.7 : 1,
                          }}
                        >
                          {editWhisperSaving ? "Saving…" : "Save"}
                        </button>
                        <button
                          onClick={cancelEditWhisper}
                          disabled={editWhisperSaving}
                          style={{
                            fontFamily: '"JetBrains Mono", monospace',
                            fontSize: "0.52rem",
                            letterSpacing: "0.22em",
                            textTransform: "uppercase",
                            color: "rgba(245,230,200,0.4)",
                            background: "transparent",
                            border: "1px solid rgba(245,230,200,0.15)",
                            padding: "0.55rem 1.25rem",
                            cursor: editWhisperSaving ? "wait" : "pointer",
                          }}
                        >
                          Cancel
                        </button>
                      </div>
                      {editWhisperError && (
                        <p
                          style={{
                            marginTop: "0.75rem",
                            fontFamily: '"JetBrains Mono", monospace',
                            fontSize: "0.7rem",
                            letterSpacing: "0.05em",
                            color: "rgba(255,120,120,0.85)",
                            lineHeight: 1.5,
                          }}
                        >
                          {editWhisperError}
                        </p>
                      )}
                    </div>
                  ) : (
                    <>
                      <p
                        style={{
                          fontFamily: '"EB Garamond", Garamond, Georgia, serif',
                          fontSize: "0.85rem",
                          fontStyle: "italic",
                          color: "rgba(245,230,200,0.3)",
                          marginBottom: "0.5rem",
                          borderLeft: "2px solid rgba(201,168,76,0.15)",
                          paddingLeft: "0.65rem",
                        }}
                      >
                        "…{w.anchorText}…"
                      </p>
                      <p
                        style={{
                          fontFamily: '"EB Garamond", Garamond, Georgia, serif',
                          fontSize: "0.95rem",
                          lineHeight: 1.65,
                          color: "rgba(245,230,200,0.6)",
                        }}
                      >
                        {w.whisper}
                      </p>
                    </>
                  )}
                </motion.div>
                );
              })}
            </motion.div>
          )}

          {/* CHAPTERS TAB */}
          {activeTab === "chapters" && (
            <motion.div
              key="chapters"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.25 }}
            >
              <SectionHeader label={t("studio.chapters.index")} />
              <div
                style={{
                  border: "1px solid rgba(201,168,76,0.1)",
                  overflow: "hidden",
                }}
              >
                {bookChapters.map((ch, i) => (
                  <div
                    key={ch.slug}
                    style={{
                      display: "grid",
                      gridTemplateColumns: "1.5rem 1fr auto",
                      alignItems: "center",
                      gap: "1.5rem",
                      padding: "1rem 1.5rem",
                      borderBottom: i < bookChapters.length - 1 ? "1px solid rgba(201,168,76,0.08)" : "none",
                      background: ch.isLocked ? "transparent" : "rgba(201,168,76,0.02)",
                    }}
                  >
                    <span
                      style={{
                        fontFamily: '"JetBrains Mono", monospace',
                        fontSize: "0.5rem",
                        color: "rgba(201,168,76,0.3)",
                        textAlign: "center",
                      }}
                    >
                      {ch.number}
                    </span>
                    <div>
                      <p
                        style={{
                          fontFamily: '"EB Garamond", Garamond, Georgia, serif',
                          fontSize: "1rem",
                          color: ch.isLocked ? "rgba(245,230,200,0.35)" : "rgba(245,230,200,0.8)",
                          marginBottom: "0.1rem",
                        }}
                      >
                        {ch.title}
                      </p>
                      <p
                        style={{
                          fontFamily: '"JetBrains Mono", monospace',
                          fontSize: "0.43rem",
                          color: "rgba(245,230,200,0.2)",
                          letterSpacing: "0.1em",
                        }}
                      >
                        {ch.wordCount.toLocaleString()} {t("studio.chapters.words")}
                      </p>
                    </div>
                    <span
                      style={{
                        fontFamily: '"JetBrains Mono", monospace',
                        fontSize: "0.43rem",
                        letterSpacing: "0.15em",
                        color: ch.isLocked ? "rgba(245,230,200,0.15)" : "rgba(201,168,76,0.4)",
                        textTransform: "uppercase",
                        whiteSpace: "nowrap",
                      }}
                    >
                      {ch.isLocked ? t("studio.chapters.locked") : t("studio.chapters.live")}
                    </span>
                    <span
                      style={{
                        fontFamily: '"JetBrains Mono", monospace',
                        fontSize: "0.43rem",
                        color: "rgba(245,230,200,0.2)",
                        whiteSpace: "nowrap",
                      }}
                    >
                      {ch.reads > 0 ? t("studio.chapters.reads", { count: ch.reads }) : "—"}
                    </span>
                    <span style={{ display: "flex", alignItems: "center", gap: "0.5rem", whiteSpace: "nowrap" }}>
                      {ch.avgDepth > 0 && <DepthBar value={ch.avgDepth} />}
                      <span
                        style={{
                          fontFamily: '"JetBrains Mono", monospace',
                          fontSize: "0.43rem",
                          color: "rgba(245,230,200,0.2)",
                        }}
                      >
                        {ch.avgDepth > 0 ? `${ch.avgDepth}%` : "—"}
                      </span>
                    </span>
                  </div>
                ))}
              </div>
              <p
                style={{
                  fontFamily: '"JetBrains Mono", monospace',
                  fontSize: "0.44rem",
                  letterSpacing: "0.15em",
                  color: "rgba(245,230,200,0.15)",
                  textTransform: "uppercase",
                  textAlign: "center",
                  marginTop: "1rem",
                }}
              >
                {t("studio.chapters.unlockInfo")}
              </p>
            </motion.div>
          )}

          {/* VOICEOVER TAB */}
          {activeTab === "voiceover" && (
            <motion.div
              key="voiceover"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.25 }}
            >
              <SectionHeader label={t("studio.voiceovers.heading")} />

              <p
                style={{
                  fontFamily: '"EB Garamond", Garamond, Georgia, serif',
                  fontSize: "0.95rem",
                  fontStyle: "italic",
                  color: "rgba(245,230,200,0.4)",
                  lineHeight: 1.7,
                  marginBottom: "1.5rem",
                  maxWidth: "56ch",
                }}
              >
                {t("studio.voiceovers.description")}
              </p>

              <div style={{ display: "flex", flexDirection: "column", gap: "1px" }}>
                {bookChapters.map((ch) => {
                  const hasAudio = !!voiceovers[ch.slug];
                  const isUploading = uploadingChapter === ch.slug;
                  const isRecording = recordingChapter === ch.slug;

                  return (
                    <div
                      key={ch.slug}
                      style={{
                        border: `1px solid ${hasAudio ? "rgba(201,168,76,0.18)" : "rgba(201,168,76,0.08)"}`,
                        padding: "1.25rem 1.5rem",
                        background: hasAudio ? "rgba(201,168,76,0.02)" : "transparent",
                        marginBottom: "0.5rem",
                      }}
                    >
                      {/* Chapter header row */}
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.75rem" }}>
                        <div>
                          <span
                            style={{
                              fontFamily: '"JetBrains Mono", monospace',
                              fontSize: "0.48rem",
                              letterSpacing: "0.15em",
                              color: "rgba(201,168,76,0.4)",
                              marginRight: "0.5rem",
                            }}
                          >
                            CH. {ch.number}
                          </span>
                          <span
                            style={{
                              fontFamily: '"EB Garamond", Garamond, Georgia, serif',
                              fontSize: "1rem",
                              color: "rgba(245,230,200,0.7)",
                            }}
                          >
                            {ch.title}
                          </span>
                        </div>
                        <span
                          style={{
                            fontFamily: '"JetBrains Mono", monospace',
                            fontSize: "0.44rem",
                            letterSpacing: "0.15em",
                            color: hasAudio ? "rgba(201,168,76,0.5)" : "rgba(245,230,200,0.15)",
                            textTransform: "uppercase",
                          }}
                        >
                          {hasAudio ? t("studio.voiceovers.uploaded") : t("studio.voiceovers.noAudio")}
                        </span>
                      </div>

                      {/* Existing audio playback */}
                      {hasAudio && (
                        <div style={{ marginBottom: "0.75rem" }}>
                          <audio
                            src={voiceovers[ch.slug]}
                            controls
                            style={{
                              width: "100%",
                              height: "32px",
                              opacity: 0.7,
                              filter: "sepia(0.3) brightness(0.9)",
                              marginBottom: "0.4rem",
                            }}
                          />
                          <button
                            onClick={() => handleVoiceoverDelete(ch.slug)}
                            disabled={deletingChapter === ch.slug}
                            style={{
                              fontFamily: '"JetBrains Mono", monospace',
                              fontSize: "0.42rem",
                              letterSpacing: "0.15em",
                              textTransform: "uppercase",
                              color: "rgba(192,57,43,0.5)",
                              background: "transparent",
                              border: "none",
                              cursor: deletingChapter === ch.slug ? "wait" : "pointer",
                              padding: "0.2rem 0",
                            }}
                          >
                            {deletingChapter === ch.slug ? t("studio.voiceovers.deleting") : t("studio.voiceovers.delete")}
                          </button>
                        </div>
                      )}

                      {/* Recording preview */}
                      {voiceoverPreview && !isRecording && recordedChunks.length > 0 && previewChapter === ch.slug && (
                        <div style={{ marginBottom: "0.75rem" }}>
                          <p
                            style={{
                              fontFamily: '"JetBrains Mono", monospace',
                              fontSize: "0.44rem",
                              letterSpacing: "0.15em",
                              color: "rgba(201,168,76,0.4)",
                              textTransform: "uppercase",
                              marginBottom: "0.4rem",
                            }}
                          >
                            {t("studio.voiceovers.preview")}
                          </p>
                          <audio
                            src={voiceoverPreview}
                            controls
                            style={{
                              width: "100%",
                              height: "32px",
                              opacity: 0.7,
                              filter: "sepia(0.3) brightness(0.9)",
                              marginBottom: "0.5rem",
                            }}
                          />
                          <div style={{ display: "flex", gap: "0.5rem" }}>
                            <button
                              onClick={() => saveRecording(ch.slug)}
                              disabled={isUploading}
                              style={{
                                fontFamily: '"JetBrains Mono", monospace',
                                fontSize: "0.48rem",
                                letterSpacing: "0.15em",
                                textTransform: "uppercase",
                                color: "#C9A84C",
                                background: "transparent",
                                border: "1px solid rgba(201,168,76,0.3)",
                                padding: "0.4rem 1rem",
                                cursor: isUploading ? "wait" : "pointer",
                              }}
                            >
                              {isUploading ? t("studio.voiceovers.saving") : t("studio.voiceovers.saveUpload")}
                            </button>
                            <button
                              onClick={() => {
                                setRecordedChunks([]);
                                if (voiceoverPreview) URL.revokeObjectURL(voiceoverPreview);
                                setVoiceoverPreview(null);
                                setPreviewChapter(null);
                              }}
                              style={{
                                fontFamily: '"JetBrains Mono", monospace',
                                fontSize: "0.48rem",
                                letterSpacing: "0.15em",
                                textTransform: "uppercase",
                                color: "rgba(245,230,200,0.25)",
                                background: "transparent",
                                border: "none",
                                cursor: "pointer",
                                padding: "0.4rem 0.5rem",
                              }}
                            >
                              {t("studio.voiceovers.discard")}
                            </button>
                          </div>
                        </div>
                      )}

                      {/* Action buttons */}
                      <div style={{ display: "flex", gap: "0.75rem", alignItems: "center" }}>
                        {/* Record button */}
                        {isRecording ? (
                          <button
                            onClick={stopRecording}
                            style={{
                              fontFamily: '"JetBrains Mono", monospace',
                              fontSize: "0.48rem",
                              letterSpacing: "0.15em",
                              textTransform: "uppercase",
                              color: "#C0392B",
                              background: "transparent",
                              border: "1px solid rgba(192,57,43,0.4)",
                              padding: "0.4rem 1rem",
                              cursor: "pointer",
                              display: "flex",
                              alignItems: "center",
                              gap: "0.4rem",
                            }}
                          >
                            <span style={{
                              width: "6px",
                              height: "6px",
                              borderRadius: "50%",
                              backgroundColor: "#C0392B",
                              display: "inline-block",
                              animation: "narrator-pulse 1s ease-in-out infinite",
                            }} />
                            Stop · {Math.floor(recordingTime / 60)}:{(recordingTime % 60).toString().padStart(2, "0")}
                          </button>
                        ) : (
                          <button
                            onClick={() => startRecording(ch.slug)}
                            disabled={!!recordingChapter}
                            style={{
                              fontFamily: '"JetBrains Mono", monospace',
                              fontSize: "0.48rem",
                              letterSpacing: "0.15em",
                              textTransform: "uppercase",
                              color: "rgba(201,168,76,0.5)",
                              background: "transparent",
                              border: "1px solid rgba(201,168,76,0.15)",
                              padding: "0.4rem 1rem",
                              cursor: recordingChapter ? "not-allowed" : "pointer",
                              opacity: recordingChapter && !isRecording ? 0.3 : 1,
                            }}
                          >
                            ● {t("studio.voiceovers.record")}
                          </button>
                        )}

                        {/* Upload button */}
                        <label
                          style={{
                            fontFamily: '"JetBrains Mono", monospace',
                            fontSize: "0.48rem",
                            letterSpacing: "0.15em",
                            textTransform: "uppercase",
                            color: "rgba(201,168,76,0.5)",
                            background: "transparent",
                            border: "1px solid rgba(201,168,76,0.15)",
                            padding: "0.4rem 1rem",
                            cursor: isUploading ? "wait" : "pointer",
                            display: "inline-block",
                            opacity: isUploading ? 0.5 : 1,
                          }}
                        >
                          {isUploading ? t("studio.voiceovers.uploading") : t("studio.voiceovers.uploadFile")}
                          <input
                            type="file"
                            accept="audio/mpeg,audio/mp3,audio/mp4,audio/m4a,audio/wav,audio/webm,.mp3,.m4a,.wav,.webm"
                            style={{ display: "none" }}
                            onChange={(e) => {
                              const file = e.target.files?.[0];
                              if (file) handleVoiceoverUpload(ch.slug, file);
                              e.target.value = "";
                            }}
                          />
                        </label>

                        {/* File limit hint */}
                        <span
                          style={{
                            fontFamily: '"JetBrains Mono", monospace',
                            fontSize: "0.65rem",
                            color: "rgba(245,230,200,0.25)",
                            letterSpacing: "0.1em",
                          }}
                        >
                          {hasAudio
                            ? t("studio.voiceovers.replaceHint")
                            : t("studio.voiceovers.formatHint")}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>

              <BrassRule />

              <p
                style={{
                  fontFamily: '"EB Garamond", Garamond, Georgia, serif',
                  fontSize: "0.85rem",
                  fontStyle: "italic",
                  color: "rgba(245,230,200,0.25)",
                  lineHeight: 1.7,
                  maxWidth: "52ch",
                }}
              >
                {t("studio.voiceovers.tip")}
              </p>
            </motion.div>
          )}

          {/* ANALYTICS TAB */}
          {activeTab === "analytics" && (
            <motion.div
              key="analytics"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.25 }}
            >
              <SectionHeader label={t("studio.analytics.heading")} />

              {/* ── SALES LEDGER ─────────────────────────────────────────── */}
              {(() => {
                const salesSummary = getSalesSummary();
                const stripeRevenueDollars = stats
                  ? (stats.stripe.balance.available + stats.stripe.balance.pending) / 100
                  : 0;
                const revenueByTitle = getRevenueByTitle(
                  stripeRevenueDollars,
                  "chico-montecristi",
                );
                const grandTotal = revenueByTitle.reduce((s, r) => s + r.totalRevenue, 0);
                return (
                  <div
                    style={{
                      border: "1px solid rgba(201,168,76,0.12)",
                      padding: "2rem",
                      marginBottom: "1.5rem",
                    }}
                  >
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "baseline",
                        marginBottom: "1.5rem",
                      }}
                    >
                      <p
                        style={{
                          fontFamily: '"JetBrains Mono", monospace',
                          fontSize: "0.46rem",
                          letterSpacing: "0.2em",
                          color: "rgba(201,168,76,0.4)",
                          textTransform: "uppercase",
                        }}
                      >
                        {t("studio.sales.heading")}
                      </p>
                      <p
                        style={{
                          fontFamily: '"JetBrains Mono", monospace',
                          fontSize: "0.4rem",
                          letterSpacing: "0.15em",
                          color: "rgba(245,230,200,0.2)",
                          textTransform: "uppercase",
                        }}
                      >
                        {salesSummary.totalCount}{" "}
                        {t("studio.sales.copiesSoldSuffix")} · ${grandTotal.toFixed(2)}
                      </p>
                    </div>

                    {/* Per-title revenue table (direct + subscription attribution) */}
                    <div
                      style={{
                        display: "grid",
                        gridTemplateColumns: "1fr 70px 90px 90px 90px",
                        gap: "0.75rem",
                        padding: "0.5rem 0",
                        borderBottom: "1px solid rgba(201,168,76,0.18)",
                        marginBottom: "0.5rem",
                      }}
                    >
                      {[
                        t("studio.sales.col.title"),
                        t("studio.sales.col.copies"),
                        t("studio.sales.col.direct"),
                        t("studio.sales.col.subs"),
                        t("studio.sales.col.total"),
                      ].map((label, i) => (
                        <span
                          key={i}
                          style={{
                            fontFamily: '"JetBrains Mono", monospace',
                            fontSize: "0.42rem",
                            letterSpacing: "0.15em",
                            color: "rgba(245,230,200,0.25)",
                            textTransform: "uppercase",
                            textAlign: i === 0 ? "left" : "right",
                          }}
                        >
                          {label}
                        </span>
                      ))}
                    </div>
                    {revenueByTitle.map((row) => (
                      <div
                        key={row.slug}
                        style={{
                          display: "grid",
                          gridTemplateColumns: "1fr 70px 90px 90px 90px",
                          gap: "0.75rem",
                          padding: "0.7rem 0",
                          alignItems: "baseline",
                          borderBottom: "1px solid rgba(201,168,76,0.06)",
                        }}
                      >
                        <span
                          style={{
                            fontFamily: '"EB Garamond", Garamond, Georgia, serif',
                            fontSize: "1rem",
                            color: "rgba(245,230,200,0.75)",
                          }}
                        >
                          {row.title}
                        </span>
                        <span
                          style={{
                            fontFamily: '"JetBrains Mono", monospace',
                            fontSize: "0.6rem",
                            color: "rgba(245,230,200,0.55)",
                            textAlign: "right",
                          }}
                        >
                          {row.salesCount}
                        </span>
                        <span
                          style={{
                            fontFamily: '"JetBrains Mono", monospace',
                            fontSize: "0.6rem",
                            color: "rgba(201,168,76,0.55)",
                            textAlign: "right",
                          }}
                        >
                          ${row.directRevenueNet.toFixed(2)}
                        </span>
                        <span
                          style={{
                            fontFamily: '"JetBrains Mono", monospace',
                            fontSize: "0.6rem",
                            color: "rgba(0,229,204,0.5)",
                            textAlign: "right",
                          }}
                        >
                          ${row.subscriptionRevenue.toFixed(2)}
                        </span>
                        <span
                          style={{
                            fontFamily: '"JetBrains Mono", monospace',
                            fontSize: "0.65rem",
                            color: "rgba(201,168,76,0.85)",
                            textAlign: "right",
                          }}
                        >
                          ${row.totalRevenue.toFixed(2)}
                        </span>
                      </div>
                    ))}

                    {/* Recent sales */}
                    <p
                      style={{
                        fontFamily: '"JetBrains Mono", monospace',
                        fontSize: "0.42rem",
                        letterSpacing: "0.18em",
                        color: "rgba(245,230,200,0.2)",
                        textTransform: "uppercase",
                        marginTop: "1.75rem",
                        marginBottom: "0.75rem",
                      }}
                    >
                      {t("studio.sales.recent")}
                    </p>
                    {salesSummary.recent.length === 0 ? (
                      <p
                        style={{
                          fontFamily: '"EB Garamond", Garamond, Georgia, serif',
                          fontSize: "0.9rem",
                          fontStyle: "italic",
                          color: "rgba(245,230,200,0.3)",
                        }}
                      >
                        {t("studio.sales.empty")}
                      </p>
                    ) : (
                      <div>
                        {salesSummary.recent.map((sale) => {
                          const book = BOOKS[sale.bookSlug];
                          const amt = (sale.amount && sale.amount !== 0)
                            ? sale.amount
                            : (book?.salePrice ?? 0);
                          return (
                            <div
                              key={sale.id}
                              style={{
                                display: "grid",
                                gridTemplateColumns: "80px 1fr auto auto",
                                gap: "1rem",
                                padding: "0.5rem 0",
                                alignItems: "baseline",
                              }}
                            >
                              <span
                                style={{
                                  fontFamily: '"JetBrains Mono", monospace',
                                  fontSize: "0.5rem",
                                  color: "rgba(245,230,200,0.25)",
                                }}
                              >
                                {sale.date}
                              </span>
                              <span
                                style={{
                                  fontFamily: '"EB Garamond", Garamond, Georgia, serif',
                                  fontSize: "0.9rem",
                                  color: "rgba(245,230,200,0.55)",
                                }}
                              >
                                {book?.title ?? sale.bookSlug}
                              </span>
                              <span
                                style={{
                                  fontFamily: '"JetBrains Mono", monospace',
                                  fontSize: "0.45rem",
                                  letterSpacing: "0.12em",
                                  color: "rgba(201,168,76,0.35)",
                                  textTransform: "uppercase",
                                }}
                              >
                                {sale.channel}
                              </span>
                              <span
                                style={{
                                  fontFamily: '"JetBrains Mono", monospace',
                                  fontSize: "0.55rem",
                                  color: "rgba(201,168,76,0.55)",
                                }}
                              >
                                ${amt.toFixed(2)}
                              </span>
                            </div>
                          );
                        })}
                      </div>
                    )}

                    <p
                      style={{
                        fontFamily: '"EB Garamond", Garamond, Georgia, serif',
                        fontSize: "0.75rem",
                        fontStyle: "italic",
                        color: "rgba(245,230,200,0.25)",
                        marginTop: "1rem",
                      }}
                    >
                      {t("studio.sales.footer")}
                    </p>
                  </div>
                );
              })()}

              {/* Depth visualization */}
              <div
                style={{
                  border: "1px solid rgba(201,168,76,0.12)",
                  padding: "2rem",
                  marginBottom: "1.5rem",
                }}
              >
                <p
                  style={{
                    fontFamily: '"JetBrains Mono", monospace',
                    fontSize: "0.46rem",
                    letterSpacing: "0.2em",
                    color: "rgba(201,168,76,0.4)",
                    textTransform: "uppercase",
                    marginBottom: "1.5rem",
                  }}
                >
                  {t("studio.analytics.depthMap")}
                </p>

                {/* Simulated depth bars for Ch. 1 */}
                <div style={{ display: "flex", alignItems: "flex-end", gap: "3px", height: "80px", marginBottom: "0.75rem" }}>
                  {[100,100,98,97,95,96,94,92,93,90,91,92,88,90,87,86,89,85,84,82,80,83,78,76,75,77,73,70,68,65,62,58,55,52,50,48,45,42,38,35,32,28,25,22,18,15,12,10,8,6].map((v, i) => (
                    <motion.div
                      key={i}
                      initial={{ height: 0 }}
                      animate={{ height: `${v}%` }}
                      transition={{ duration: 0.4, delay: i * 0.012 }}
                      style={{
                        flex: 1,
                        background: `rgba(201,168,76,${0.15 + (v / 100) * 0.6})`,
                        borderRadius: "1px 1px 0 0",
                        minWidth: "2px",
                      }}
                    />
                  ))}
                </div>

                <div style={{ display: "flex", justifyContent: "space-between" }}>
                  <span
                    style={{
                      fontFamily: '"JetBrains Mono", monospace',
                      fontSize: "0.42rem",
                      color: "rgba(245,230,200,0.2)",
                    }}
                  >
                    {t("studio.analytics.paragraph1")}
                  </span>
                  <span
                    style={{
                      fontFamily: '"JetBrains Mono", monospace',
                      fontSize: "0.42rem",
                      color: "rgba(245,230,200,0.2)",
                    }}
                  >
                    {t("studio.analytics.paragraph50")}
                  </span>
                </div>

                <p
                  style={{
                    fontFamily: '"EB Garamond", Garamond, Georgia, serif',
                    fontSize: "0.85rem",
                    fontStyle: "italic",
                    color: "rgba(245,230,200,0.3)",
                    marginTop: "1rem",
                  }}
                >
                  {t("studio.analytics.attrition")}
                </p>
              </div>

              {/* Summary stats */}
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))",
                  gap: "1px",
                  border: "1px solid rgba(201,168,76,0.1)",
                }}
              >
                {[
                  { label: t("studio.analytics.avgReadTime"), value: "14 min", sub: t("studio.analytics.chapterOne") },
                  { label: t("studio.analytics.completionRate"), value: "61%", sub: t("studio.analytics.reachFinal") },
                  { label: t("studio.analytics.returnRate"), value: "38%", sub: t("studio.analytics.openedMoreThanOnce") },
                ].map((s, i) => (
                  <div
                    key={i}
                    style={{
                      padding: "1.5rem",
                      borderRight: i < 2 ? "1px solid rgba(201,168,76,0.1)" : "none",
                      textAlign: "center",
                    }}
                  >
                    <p
                      style={{
                        fontFamily: '"EB Garamond", Garamond, Georgia, serif',
                        fontSize: "1.75rem",
                        color: "rgba(201,168,76,0.7)",
                        lineHeight: 1,
                        marginBottom: "0.35rem",
                      }}
                    >
                      {s.value}
                    </p>
                    <p
                      style={{
                        fontFamily: '"JetBrains Mono", monospace',
                        fontSize: "0.44rem",
                        letterSpacing: "0.15em",
                        color: "rgba(245,230,200,0.2)",
                        textTransform: "uppercase",
                        marginBottom: "0.2rem",
                      }}
                    >
                      {s.label}
                    </p>
                    <p
                      style={{
                        fontFamily: '"EB Garamond", Garamond, Georgia, serif',
                        fontSize: "0.75rem",
                        fontStyle: "italic",
                        color: "rgba(245,230,200,0.15)",
                      }}
                    >
                      {s.sub}
                    </p>
                  </div>
                ))}
              </div>

              {/* ── Reader Tier Breakdown (live) ──────────────────────── */}
              <div
                style={{
                  border: "1px solid rgba(201,168,76,0.12)",
                  marginTop: "1.5rem",
                }}
              >
                <div
                  style={{
                    padding: "1.25rem 2rem 1rem",
                    borderBottom: "1px solid rgba(201,168,76,0.08)",
                  }}
                >
                  <p
                    style={{
                      fontFamily: '"JetBrains Mono", monospace',
                      fontSize: "0.46rem",
                      letterSpacing: "0.2em",
                      color: "rgba(201,168,76,0.4)",
                      textTransform: "uppercase",
                    }}
                  >
                    {t("studio.analytics.readersByTier")}
                  </p>
                </div>

                {(["codex", "scribe", "archive", "chronicler"] as const).map((tier, i, arr) => {
                  const count = stats?.readers.byTier[tier] ?? 0;
                  const total = stats?.readers.active ?? 0;
                  const pct   = total > 0 ? Math.round((count / total) * 100) : 0;
                  const tierLabels: Record<string, string> = {
                    codex:       t("studio.analytics.tier.codex"),
                    scribe:      t("studio.analytics.tier.scribe"),
                    archive:     t("studio.analytics.tier.archive"),
                    chronicler:  t("studio.analytics.tier.chronicler"),
                  };
                  return (
                    <div
                      key={tier}
                      style={{
                        display: "grid",
                        gridTemplateColumns: "90px 1fr 48px 48px",
                        alignItems: "center",
                        gap: "1rem",
                        padding: "1rem 2rem",
                        borderBottom: i < arr.length - 1 ? "1px solid rgba(201,168,76,0.06)" : "none",
                      }}
                    >
                      <p
                        style={{
                          fontFamily: '"JetBrains Mono", monospace',
                          fontSize: "0.46rem",
                          letterSpacing: "0.15em",
                          color: "rgba(245,230,200,0.35)",
                          textTransform: "uppercase",
                        }}
                      >
                        {tierLabels[tier]}
                      </p>

                      {/* Fill bar */}
                      <div
                        style={{
                          height: "2px",
                          background: "rgba(201,168,76,0.08)",
                          borderRadius: "1px",
                          overflow: "hidden",
                        }}
                      >
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: `${pct}%` }}
                          transition={{ duration: 0.8, ease: "easeOut", delay: i * 0.08 }}
                          style={{
                            height: "100%",
                            background: statsLoading
                              ? "rgba(201,168,76,0.15)"
                              : `rgba(201,168,76,${0.25 + (pct / 100) * 0.55})`,
                            borderRadius: "1px",
                          }}
                        />
                      </div>

                      <p
                        style={{
                          fontFamily: '"EB Garamond", Garamond, Georgia, serif',
                          fontSize: "1.1rem",
                          color: "rgba(201,168,76,0.65)",
                          textAlign: "right",
                          lineHeight: 1,
                        }}
                      >
                        {statsLoading ? "—" : count}
                      </p>

                      <p
                        style={{
                          fontFamily: '"JetBrains Mono", monospace',
                          fontSize: "0.42rem",
                          color: "rgba(245,230,200,0.18)",
                          textAlign: "right",
                        }}
                      >
                        {statsLoading ? "" : `${pct}%`}
                      </p>
                    </div>
                  );
                })}

                <div
                  style={{
                    padding: "0.75rem 2rem",
                    borderTop: "1px solid rgba(201,168,76,0.08)",
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                  }}
                >
                  <p
                    style={{
                      fontFamily: '"JetBrains Mono", monospace',
                      fontSize: "0.43rem",
                      letterSpacing: "0.12em",
                      color: "rgba(245,230,200,0.15)",
                      textTransform: "uppercase",
                    }}
                  >
                    {t("studio.analytics.totalActive")}
                  </p>
                  <p
                    style={{
                      fontFamily: '"EB Garamond", Garamond, Georgia, serif',
                      fontSize: "1rem",
                      color: "rgba(201,168,76,0.4)",
                    }}
                  >
                    {statsLoading ? "—" : (stats?.readers.active ?? 0)}
                  </p>
                </div>
              </div>

              <p
                style={{
                  fontFamily: '"JetBrains Mono", monospace',
                  fontSize: "0.43rem",
                  letterSpacing: "0.15em",
                  color: "rgba(245,230,200,0.12)",
                  textTransform: "uppercase",
                  textAlign: "center",
                  marginTop: "1rem",
                }}
              >
                {t("studio.analytics.footer")}
              </p>
            </motion.div>
          )}

        </AnimatePresence>
      </div>
    </div>
  );
}
