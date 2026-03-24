"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { usePathname } from "next/navigation";
import { playArchiveMode } from "@/lib/sound";
import { motion, AnimatePresence } from "framer-motion";
import type { Annotation, InkType, MarginLayer, Chapter, NarratorVoice, NarratorState } from "@/lib/types";
import type { WhisperData } from "./AuthorWhisper";
import {
  getAnnotations,
  getReaderState,
  initReaderState,
  setActiveInkType,
  updateScrollProgress,
  markChapterComplete,
  hasAskedQuestion,
} from "@/lib/ink";
import { getPageOneEnd, createWebSpeechNarrator, fetchTTSAudio, scrollParagraphIntoView } from "@/lib/narration";
import AnnotatableText from "./AnnotatableText";
import AuthorVoiceover from "./AuthorVoiceover";
import NarratorSelector, { NarratorControlBar } from "./NarratorSelector";
import InkToolbar from "./InkToolbar";
import MarginWorld from "./MarginWorld";
import SignalInkModal from "./SignalInkModal";
import ProgressIndicator from "./ProgressIndicator";
import ChapterNav from "@/components/ui/ChapterNav";
import SubscriptionModal from "@/components/ui/SubscriptionModal";
import type { SubscriptionTierName } from "@/components/ui/SubscriptionModal";
import ContinueReadingToast from "@/components/ui/ContinueReadingToast";
import InkTutorial from "@/components/ui/InkTutorial";
import Link from "next/link";
import ChapterRain from "./ChapterRain";
import { QuoteSelector, MilestoneCard, SendToFriend } from "./ViralLoops";
import { useTrackReading, BookmarkPrompt } from "@/components/ui/ReturnCapture";
import { DepthEmailCapture } from "@/components/ui/SessionDepth";
import { BOOKS } from "@/lib/content/books";

// Tier access order — must match SubscriptionModal's TIER_ORDER
const TIER_ORDER: SubscriptionTierName[] = ["codex", "scribe", "archive", "chronicler"];

// ─── READING SURFACE ─────────────────────────────────────────────────────────
// The complete reading environment. This is the heart of Tintaxis.
// All subsystems are orchestrated here.

interface ReadingSurfaceProps {
  chapter: Chapter;
  nextChapter?: Chapter | null;
  prevChapter?: Chapter | null;
}

export default function ReadingSurface({ chapter, nextChapter, prevChapter }: ReadingSurfaceProps) {
  const pathname = usePathname();
  const [annotations, setAnnotations] = useState<Annotation[]>([]);
  const [activeInkType, setActiveInkTypeState] = useState<InkType>("ghost");
  const [marginLayer, setMarginLayer] = useState<MarginLayer>("mine");
  const [signalModalOpen, setSignalModalOpen] = useState(false);
  const [signalSelectedText, setSignalSelectedText] = useState("");
  const [questionAsked, setQuestionAsked] = useState(false);
  const [isComplete, setIsComplete] = useState(false);
  const [showCompletionEvent, setShowCompletionEvent] = useState(false);
  const [subscriptionModalOpen, setSubscriptionModalOpen] = useState(false);
  const [gateTier, setGateTier] = useState<SubscriptionTierName | undefined>(undefined);
  const [gateFeatureName, setGateFeatureName] = useState<string | undefined>(undefined);
  const contentRef = useRef<HTMLDivElement>(null);

  // ── Narrator state ─────────────────────────────────────────────────
  const [narratorState, setNarratorState] = useState<NarratorState>("idle");
  const [selectedNarrator, setSelectedNarrator] = useState<NarratorVoice | null>(null);
  const [narratorParagraph, setNarratorParagraph] = useState(0);
  const narratorAudioRef = useRef<HTMLAudioElement | null>(null);
  const webSpeechRef = useRef<ReturnType<typeof createWebSpeechNarrator> | null>(null);

  // ── Book ref (needed by narrator + reading tracker) ─────────────────
  const book = chapter.bookSlug ? BOOKS[chapter.bookSlug] : null;

  const pageOneEnd = getPageOneEnd(chapter.paragraphs, chapter.pageOneEnd);
  const hasAuthorAudio = !!chapter.authorAudioUrl;

  // ── Narrator: read a paragraph ─────────────────────────────────────
  const narrateParagraph = useCallback(async (paraIndex: number, voice: NarratorVoice) => {
    const para = chapter.paragraphs[paraIndex];
    if (!para || para.isSectionBreak) {
      // Skip section breaks, advance to next
      if (paraIndex < chapter.paragraphs.length - 1) {
        setNarratorParagraph(paraIndex + 1);
        narrateParagraph(paraIndex + 1, voice);
      } else {
        setNarratorState("idle");
      }
      return;
    }

    scrollParagraphIntoView(para.index);

    const bookLang = book?.language ?? "en";

    // Try server TTS first
    const { audioUrl, fallback } = await fetchTTSAudio(para.text, voice.ttsVoice, bookLang);

    if (!fallback && audioUrl) {
      // Play server-generated audio
      const audio = new Audio(audioUrl);
      narratorAudioRef.current = audio;
      audio.onended = () => {
        URL.revokeObjectURL(audioUrl);
        const nextIdx = paraIndex + 1;
        if (nextIdx < chapter.paragraphs.length) {
          setNarratorParagraph(nextIdx);
          narrateParagraph(nextIdx, voice);
        } else {
          setNarratorState("idle");
        }
      };
      audio.play();
    } else {
      // Web Speech API fallback
      if (!webSpeechRef.current) {
        webSpeechRef.current = createWebSpeechNarrator(voice, bookLang as "en" | "es" | "zh" | "es-zh");
      }
      webSpeechRef.current.speak(
        para.text,
        () => {
          const nextIdx = paraIndex + 1;
          if (nextIdx < chapter.paragraphs.length) {
            setNarratorParagraph(nextIdx);
            narrateParagraph(nextIdx, voice);
          } else {
            setNarratorState("idle");
          }
        },
        () => {
          setNarratorState("idle");
        }
      );
    }
  }, [chapter.paragraphs, book?.language]);

  // ── Narrator: handle voice selection ───────────────────────────────
  const handleNarratorSelect = useCallback((voice: NarratorVoice) => {
    setSelectedNarrator(voice);
    setNarratorState("narrating");
    const startPara = pageOneEnd;
    setNarratorParagraph(startPara);
    narrateParagraph(startPara, voice);
  }, [pageOneEnd, narrateParagraph]);

  // ── Narrator: toggle play/pause ────────────────────────────────────
  const handleNarratorToggle = useCallback(() => {
    if (narratorState === "narrating") {
      narratorAudioRef.current?.pause();
      webSpeechRef.current?.stop();
      setNarratorState("paused");
    } else if (narratorState === "paused" && selectedNarrator) {
      setNarratorState("narrating");
      narrateParagraph(narratorParagraph, selectedNarrator);
    }
  }, [narratorState, selectedNarrator, narratorParagraph, narrateParagraph]);

  // ── Narrator: stop completely ──────────────────────────────────────
  const handleNarratorStop = useCallback(() => {
    narratorAudioRef.current?.pause();
    webSpeechRef.current?.stop();
    setNarratorState("idle");
    setSelectedNarrator(null);
  }, []);

  // ── Cleanup narrator on unmount ────────────────────────────────────
  useEffect(() => {
    return () => {
      narratorAudioRef.current?.pause();
      webSpeechRef.current?.stop();
    };
  }, []);

  // ── Reader session — determines which ink features are unlocked ────
  const [readerTier,  setReaderTier]  = useState<SubscriptionTierName | null>(null);
  const [readerId,    setReaderId]    = useState<string | null>(null);
  const [readerEmail, setReaderEmail] = useState<string | null>(null);

  // ── Track reading for return path captures ──────────────────────────────
  useTrackReading({
    bookSlug: chapter.bookSlug ?? "",
    bookTitle: book?.title ?? "",
    chapterSlug: chapter.slug,
    chapterTitle: chapter.title,
    chapterNumber: chapter.number,
    totalChapters: book?.totalChapters ?? 7,
    url: typeof window !== "undefined" ? window.location.pathname : "",
  });

  // ── Live whispers — fetched on mount, used for inline paragraph markers ──
  const [whispers, setWhispers] = useState<WhisperData[]>([]);

  useEffect(() => {
    fetch(`/api/whispers?chapter=${chapter.slug}`)
      .then((r) => r.json())
      .then((data) => {
        if (data.whispers && data.whispers.length > 0) {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          setWhispers(data.whispers.map((w: any) => ({
            id:           w.id,
            paragraphIndex: -1,
            anchoredText: w.anchor_text,
            content:      w.content,
            authorName:   w.author_name,
            timestamp:    new Date(w.created_at).getFullYear().toString(),
            type:         w.whisper_type as "whisper" | "anchor",
          })));
        }
      })
      .catch(() => {});
  }, [chapter.slug]);

  useEffect(() => {
    // Pass writerSlug to check per-writer subscription tier
    const writerSlug = book?.writerSlug ?? "";
    const url = writerSlug
      ? `/api/reader/session?writerSlug=${encodeURIComponent(writerSlug)}`
      : "/api/reader/session";
    fetch(url)
      .then((r) => r.json())
      .then((data) => {
        if (data.subscribed && data.tier) {
          setReaderTier(data.tier as SubscriptionTierName);
        }
        if (data.id)    setReaderId(data.id);
        if (data.email) setReaderEmail(data.email);
      })
      .catch(() => {/* session check fails silently — treat as unsubscribed */});
  }, [book?.writerSlug]);

  // Returns true if the reader's tier meets or exceeds the required tier
  const hasAccess = useCallback((required: SubscriptionTierName): boolean => {
    if (!readerTier) return false;
    return TIER_ORDER.indexOf(readerTier) >= TIER_ORDER.indexOf(required);
  }, [readerTier]);

  // ── Initialize reader state ────────────────────────────────
  useEffect(() => {
    let state = getReaderState(chapter.slug);
    if (!state) {
      state = initReaderState(chapter.slug);
    }
    setActiveInkTypeState(state.activeInkType);
    setQuestionAsked(hasAskedQuestion(chapter.slug));
    setIsComplete(state.hasCompletedFirstRead);

    // Load annotations: Supabase when authenticated, localStorage otherwise
    fetch(`/api/reader/annotations?chapter=${chapter.slug}`)
      .then((r) => {
        if (!r.ok) throw new Error("not authed");
        return r.json();
      })
      .then((data) => {
        if (data.annotations && data.annotations.length > 0) {
          setAnnotations(data.annotations);
        } else {
          // Authenticated but no cloud annotations — seed from localStorage
          const local = getAnnotations(chapter.slug);
          setAnnotations(local);
        }
      })
      .catch(() => {
        // Not authenticated — use localStorage
        const local = getAnnotations(chapter.slug);
        setAnnotations(local);
      });
  }, [chapter.slug]);

  // ── Track scroll progress ──────────────────────────────────
  useEffect(() => {
    const handleScroll = () => {
      if (!contentRef.current) return;
      const { scrollTop, scrollHeight, clientHeight } = document.documentElement;
      const progress = scrollTop / (scrollHeight - clientHeight);
      updateScrollProgress(chapter.slug, progress);

      // Trigger completion when reader reaches end
      if (progress > 0.92 && !isComplete) {
        markChapterComplete(chapter.slug);
        setIsComplete(true);
        setTimeout(() => {
          playArchiveMode();
          setShowCompletionEvent(true);
        }, 800);
      }
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, [chapter.slug, isComplete]);

  // ── Handle ink type change ─────────────────────────────────
  const handleInkChange = useCallback(
    (ink: InkType) => {
      // Signal ink requires Scribe tier
      if (ink === "signal") {
        if (!hasAccess("scribe")) {
          handleGateTriggered("scribe", "Signal Ink");
          return;
        }
        setActiveInkTypeState(ink);
        setActiveInkType(chapter.slug, ink);
        const selection = window.getSelection();
        const text = selection?.toString().trim() || "";
        setSignalSelectedText(text);
        setSignalModalOpen(true);
        return;
      }

      // All other inks require Codex tier
      if (!hasAccess("codex")) {
        handleGateTriggered("codex", "Ink Annotation");
        return;
      }

      setActiveInkTypeState(ink);
      setActiveInkType(chapter.slug, ink);
    },
    [chapter.slug, hasAccess]
  );

  // ── Handle annotation created ─────────────────────────────
  const handleAnnotationCreated = useCallback((annotation: Annotation) => {
    setAnnotations((prev) => [...prev, annotation]);

    // Persist to Supabase when reader is authenticated
    if (readerId) {
      fetch("/api/reader/annotations", {
        method:  "POST",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify({
          inkType:     annotation.inkType,
          note:        annotation.note,
          chapterSlug: annotation.chapterSlug,
          isPublic:    annotation.isPublic ?? false,
          selection:   annotation.selection,
        }),
      }).catch(() => {/* persist fails silently — annotation is in local state */});
    }
  }, [readerId]);

  // ── Handle annotation updated ─────────────────────────────
  const handleAnnotationUpdated = useCallback((updated: Annotation) => {
    setAnnotations((prev) =>
      prev.map((a) => (a.id === updated.id ? updated : a))
    );

    // Sync note update to Supabase when reader is authenticated
    if (readerId) {
      fetch(`/api/reader/annotations/${updated.id}`, {
        method:  "PATCH",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify({ note: updated.note }),
      }).catch(() => {/* update fails silently */});
    }
  }, [readerId]);

  // ── Handle annotation deleted ─────────────────────────────
  const handleAnnotationDeleted = useCallback((id: string) => {
    setAnnotations((prev) => prev.filter((a) => a.id !== id));

    // Remove from Supabase when reader is authenticated
    if (readerId) {
      fetch(`/api/reader/annotations/${id}`, {
        method: "DELETE",
      }).catch(() => {/* delete fails silently — removed from local state */});
    }
  }, [readerId]);

  // ── Handle subscription gate trigger ──────────────────────
  const handleGateTriggered = useCallback((tier: SubscriptionTierName, featureName: string) => {
    setGateTier(tier);
    setGateFeatureName(featureName);
    setSubscriptionModalOpen(true);
  }, []);

  return (
    <div
      className="min-h-screen"
      style={{ backgroundColor: "var(--bg-page)", transition: "background-color 0.4s ease" }}
    >
      {/* ── Chapter navigation — top bar ────────────────────── */}
      <ChapterNav chapter={chapter} />

      {/* ── Reading progress — right rail ────────────────────── */}
      <ProgressIndicator />

      {/* ── Ink Toolbar — left rail ──────────────────────────── */}
      <InkToolbar
        activeInkType={activeInkType}
        onInkChange={handleInkChange}
        isPhase1={false}
      />

      {/* ── Reading layout ──────────────────────────────────── */}
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          // On mobile: no left padding (toolbar collapses to bottom)
          // On desktop: offset for left toolbar
          paddingLeft: "var(--toolbar-offset, 52px)",
        }}
      >
        {/* ── Reading column ──────────────────────────────── */}
        <div
          ref={contentRef}
          className="parchment-surface"
          style={{
            flex: "0 0 auto",
            width: "100%",
            maxWidth: "72ch",
            minHeight: "100vh",
            // Mobile: tighter padding; desktop: generous
            padding: "clamp(5rem, 10vw, 8rem) clamp(1.25rem, 5vw, 3rem) 12rem",
            borderLeft: "1px solid var(--border-subtle)",
            borderRight: "1px solid var(--border-subtle)",
            boxShadow: "0 0 60px rgba(44,26,0,0.4)",
            position: "relative",
          }}
        >
          {/* ── Viral: Quote selector (floating on text selection) ── */}
          <QuoteSelector chapter={chapter} />
          {/* ── Chapter header ──────────────────────────────── */}
          <ChapterHeader chapter={chapter} />

          {/* ── Brass rule ────────────────────────────────── */}
          <div className="brass-line" style={{ marginBottom: "3rem" }} />

          {/* ── Epigraph ──────────────────────────────────── */}
          {chapter.epigraph && (
            <div
              style={{
                textAlign: "center",
                maxWidth: "46ch",
                margin: "0 auto 3rem",
                padding: "0 1.5rem",
              }}
            >
              <AnnotatableText
                text={chapter.epigraph.text}
                paragraphIndex={-1}
                chapterSlug={chapter.slug}
                activeInkType={activeInkType}
                annotations={annotations}
                onAnnotationCreated={handleAnnotationCreated}
                canAnnotate={hasAccess("codex")}
                onGateTriggered={handleGateTriggered}
                isEpigraph
              />
              <p
                className="epigraph-attribution"
                style={{
                  fontFamily: '"JetBrains Mono", monospace',
                  fontSize: "0.85rem",
                  letterSpacing: "0.18em",
                  color: "var(--brass-dim)",
                  textTransform: "uppercase",
                  marginTop: "-0.5rem",
                }}
              >
                — {chapter.epigraph.attribution}
              </p>
            </div>
          )}

          {/* ── Author Voiceover — page 1 audio ─────────────── */}
          {hasAuthorAudio && narratorState === "idle" && (
            <AuthorVoiceover
              audioUrl={chapter.authorAudioUrl!}
              authorName={book?.author ?? "The Author"}
              chapterTitle={chapter.title}
              accentColor={book?.accentColor}
              onComplete={() => setNarratorState("selecting")}
              onSkip={() => setNarratorState("selecting")}
            />
          )}

          {/* ── Narrator selector — after voiceover ends ───── */}
          <AnimatePresence>
            {narratorState === "selecting" && (
              <NarratorSelector
                authorName={book?.author ?? "The Author"}
                bookLanguage={book?.language ?? "en"}
                accentColor={book?.accentColor}
                onSelect={handleNarratorSelect}
                onDismiss={() => setNarratorState("idle")}
              />
            )}
          </AnimatePresence>

          {/* ── Paragraphs ──────────────────────────────────── */}
          {chapter.paragraphs.map((para, i) => {
            if (para.isSectionBreak) {
              return (
                <SectionBreak key={`break-${i}`} />
              );
            }

            // Check if any whisper anchor text appears in this paragraph
            const paraHasWhisper = whispers.some((w) =>
              w.anchoredText && para.text.includes(w.anchoredText)
            );

            const isNarrating = narratorState === "narrating" && narratorParagraph === para.index;

            return (
              <div key={`para-${para.index}`} data-paragraph={para.index}>
                <AnnotatableText
                  text={para.text}
                  paragraphIndex={para.index}
                  chapterSlug={chapter.slug}
                  activeInkType={activeInkType}
                  annotations={annotations.filter(
                    (a) => a.selection.paragraphIndex === para.index
                  )}
                  onAnnotationCreated={handleAnnotationCreated}
                  canAnnotate={hasAccess("codex")}
                  onGateTriggered={handleGateTriggered}
                  isFirstParagraph={i === 0 || (i > 0 && chapter.paragraphs[i - 1]?.isSectionBreak)}
                  hasWhisperAnchor={paraHasWhisper}
                />
              </div>
            );
          })}

          {/* ── Chapter rain — generated from chapter vocabulary ─── */}
          <ChapterRain chapterSlug={chapter.slug} height={320} />

          {/* ── Share bar ─────────────────────────────────── */}
          <ShareBar chapter={chapter} />

          {/* ── Viral loops: milestone + send to friend ───────── */}
          <MilestoneCard chapter={chapter} />
          <SendToFriend chapter={chapter} />

          {/* ── Chapter navigation ───────────────────────────── */}
          <ChapterEndNav
            prevChapter={prevChapter}
            nextChapter={nextChapter}
            onGateTriggered={handleGateTriggered}
          />
        </div>

        {/* ── Margin World — hidden on mobile, right rail on desktop ── */}
        <div className="margin-world-rail">
          <MarginWorld
            annotations={annotations}
            chapterSlug={chapter.slug}
            activeLayer={marginLayer}
            onLayerChange={setMarginLayer}
            onAnnotationUpdated={handleAnnotationUpdated}
            onAnnotationDeleted={handleAnnotationDeleted}
            onGateTriggered={handleGateTriggered}
            liveWhispers={whispers}
          />
        </div>
      </div>

      {/* ── Signal Ink Modal ────────────────────────────────── */}
      <SignalInkModal
        isOpen={signalModalOpen}
        selectedText={signalSelectedText}
        chapterSlug={chapter.slug}
        hasAlreadyAsked={questionAsked}
        readerEmail={readerEmail}
        onClose={() => {
          setSignalModalOpen(false);
          // Return to ghost ink after using signal
          setActiveInkTypeState("ghost");
          setActiveInkType(chapter.slug, "ghost");
        }}
        onQuestionSent={() => {
          setQuestionAsked(true);
        }}
      />

      {/* ── Completion Event ────────────────────────────────── */}
      <AnimatePresence>
        {showCompletionEvent && (
          <CompletionEvent
            chapter={chapter}
            onDismiss={() => setShowCompletionEvent(false)}
          />
        )}
      </AnimatePresence>

      {/* ── Subscription Gate Modal ──────────────────────────── */}
      <SubscriptionModal
        isOpen={subscriptionModalOpen}
        triggeredBy={gateTier}
        featureName={gateFeatureName}
        onClose={() => setSubscriptionModalOpen(false)}
        returnUrl={pathname ?? "/"}
        writerSlug={book?.writerSlug ?? "chico-montecristi"}
        writerName={book?.author}
      />

      {/* ── Continue Reading toast ───────────────────────────── */}
      <ContinueReadingToast
        chapterSlug={chapter.slug}
        chapterRomanNumeral={chapter.romanNumeral}
      />

      {/* ── First-visit ink tutorial ─────────────────────────── */}
      <InkTutorial />

      {/* ── Return path: bookmark prompt (first-time deep readers) ── */}
      <BookmarkPrompt />

      {/* ── Session depth: email capture on 2nd page view ────────── */}
      <DepthEmailCapture />

      {/* ── Narrator control bar — floating bottom bar when AI narrator is active ── */}
      <AnimatePresence>
        {(narratorState === "narrating" || narratorState === "paused") && selectedNarrator && (
          <NarratorControlBar
            voice={selectedNarrator}
            isPlaying={narratorState === "narrating"}
            currentParagraph={narratorParagraph + 1}
            totalParagraphs={chapter.paragraphs.filter(p => !p.isSectionBreak).length}
            onTogglePlay={handleNarratorToggle}
            onStop={handleNarratorStop}
          />
        )}
      </AnimatePresence>
    </div>
  );
}

// ─── CHAPTER HEADER ──────────────────────────────────────────────────────────

function ChapterHeader({ chapter }: { chapter: Chapter }) {
  return (
    <motion.header
      style={{ textAlign: "center", marginBottom: "3rem" }}
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8, ease: [0.2, 0, 0.1, 1] }}
    >
      <p
        className="chapter-header-label"
        style={{
          fontFamily: '"JetBrains Mono", monospace',
          fontSize: "0.85rem",
          letterSpacing: "0.3em",
          color: "var(--brass-dim)",
          textTransform: "uppercase",
          marginBottom: "1.25rem",
        }}
      >
        CHAPTER {chapter.romanNumeral}
      </p>

      <h1
        style={{
          fontFamily: '"EB Garamond", Garamond, Georgia, serif',
          fontSize: "clamp(2rem, 4vw, 2.5rem)",
          fontWeight: 400,
          color: "var(--text-primary)",
          lineHeight: 1.2,
          letterSpacing: "-0.01em",
          marginBottom: chapter.subtitle ? "0.75rem" : "0",
        }}
      >
        {chapter.title}
      </h1>

      {chapter.subtitle && (
        <p
          style={{
            fontFamily: '"EB Garamond", Garamond, Georgia, serif',
            fontSize: "1.05rem",
            fontStyle: "italic",
            color: "rgba(var(--text-primary-rgb),0.45)",
            lineHeight: 1.5,
          }}
        >
          {chapter.subtitle}
        </p>
      )}
    </motion.header>
  );
}

// ─── SECTION BREAK ──────────────────────────────────────────────────────────

function SectionBreak() {
  return (
    <div
      style={{
        textAlign: "center",
        margin: "2.5rem 0",
        display: "flex",
        alignItems: "center",
        gap: "1rem",
      }}
    >
      <div className="brass-line" style={{ flex: 1 }} />
      <span
        className="section-break-ornament"
        style={{
          color: "var(--brass-dim)",
          fontSize: "1rem",
          letterSpacing: "0.3em",
        }}
      >
        ✦
      </span>
      <div className="brass-line" style={{ flex: 1 }} />
    </div>
  );
}

// ─── COMPLETION EVENT ────────────────────────────────────────────────────────

function CompletionEvent({
  chapter,
  onDismiss,
}: {
  chapter: Chapter;
  onDismiss: () => void;
}) {
  const [phase, setPhase] = useState<"seal" | "reveal">("seal");

  useEffect(() => {
    const t = setTimeout(() => setPhase("reveal"), 1200);
    return () => clearTimeout(t);
  }, []);

  return (
    <motion.div
      className="fixed inset-0 z-50 flex items-center justify-center completion-overlay"
      style={{ backgroundColor: "rgba(13,11,8,0.97)" }}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0, transition: { duration: 0.6 } }}
      transition={{ duration: 0.4 }}
    >
      {/* ── Expanding brass ring ────────────────────────── */}
      <motion.div
        className="absolute"
        style={{
          width: "300px",
          height: "300px",
          borderRadius: "50%",
          border: "1px solid rgba(201,168,76,0.2)",
        }}
        initial={{ scale: 0, opacity: 0.8 }}
        animate={{ scale: 3.5, opacity: 0 }}
        transition={{ duration: 2.5, ease: "easeOut" }}
      />
      <motion.div
        className="absolute"
        style={{
          width: "300px",
          height: "300px",
          borderRadius: "50%",
          border: "1px solid rgba(201,168,76,0.15)",
        }}
        initial={{ scale: 0, opacity: 0.6 }}
        animate={{ scale: 2.5, opacity: 0 }}
        transition={{ duration: 2, delay: 0.3, ease: "easeOut" }}
      />

      {/* ── Main panel ──────────────────────────────────── */}
      <motion.div
        style={{
          maxWidth: "480px",
          width: "100%",
          margin: "0 1.5rem",
          textAlign: "center",
          position: "relative",
          zIndex: 2,
        }}
        initial={{ opacity: 0, y: 32 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, delay: 0.3, ease: [0.2, 0, 0.1, 1] }}
      >
        {/* Label */}
        <motion.p
          style={{
            fontFamily: '"JetBrains Mono", monospace',
            fontSize: "0.75rem",
            letterSpacing: "0.35em",
            color: "rgba(201,168,76,0.4)",
            textTransform: "uppercase",
            marginBottom: "2rem",
          }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
        >
          First Read · Sealed
        </motion.p>

        {/* Brass ornament */}
        <motion.div
          style={{ marginBottom: "1.5rem" }}
          initial={{ scaleX: 0, opacity: 0 }}
          animate={{ scaleX: 1, opacity: 1 }}
          transition={{ delay: 0.7, duration: 0.8 }}
        >
          <div className="brass-line" />
        </motion.div>

        {/* Chapter identity */}
        <AnimatePresence>
          {phase === "reveal" && (
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, ease: "easeOut" }}
            >
              <p
                style={{
                  fontFamily: '"JetBrains Mono", monospace',
                  fontSize: "0.75rem",
                  letterSpacing: "0.25em",
                  color: "rgba(201,168,76,0.5)",
                  textTransform: "uppercase",
                  marginBottom: "0.75rem",
                }}
              >
                Chapter {chapter.romanNumeral}
              </p>
              <p
                style={{
                  fontFamily: '"EB Garamond", Garamond, Georgia, serif',
                  fontSize: "clamp(1.4rem, 4vw, 1.75rem)",
                  fontStyle: "italic",
                  color: "rgba(var(--text-primary-rgb),0.85)",
                  lineHeight: 1.4,
                  marginBottom: "0.5rem",
                  letterSpacing: "-0.01em",
                }}
              >
                {chapter.title}
              </p>
              <p
                style={{
                  fontFamily: '"EB Garamond", Garamond, Georgia, serif',
                  fontSize: "1.05rem",
                  fontStyle: "italic",
                  color: "rgba(var(--text-primary-rgb),0.3)",
                  lineHeight: 1.6,
                  marginBottom: "2.5rem",
                }}
              >
                Your marks are in the Archive.
                <br />
                They will be here when you return.
              </p>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Bottom rule */}
        <motion.div
          style={{ marginBottom: "2rem" }}
          initial={{ scaleX: 0, opacity: 0 }}
          animate={{ scaleX: 1, opacity: 1 }}
          transition={{ delay: 1.4, duration: 0.8 }}
        >
          <div className="brass-line" />
        </motion.div>

        {/* Acknowledge */}
        <motion.button
          onClick={onDismiss}
          style={{
            fontFamily: '"JetBrains Mono", monospace',
            fontSize: "0.85rem",
            letterSpacing: "0.25em",
            color: "#C9A84C",
            background: "transparent",
            border: "1px solid rgba(201,168,76,0.35)",
            padding: "0.75rem 2rem",
            cursor: "pointer",
            borderRadius: "1px",
            textTransform: "uppercase",
            position: "relative",
          }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.8 }}
          whileHover={{
            borderColor: "rgba(201,168,76,0.8)",
            boxShadow: "0 0 20px rgba(201,168,76,0.15)",
          }}
          whileTap={{ scale: 0.98 }}
        >
          {/* Corner accents */}
          {["top-0 left-0 border-t border-l","top-0 right-0 border-t border-r","bottom-0 left-0 border-b border-l","bottom-0 right-0 border-b border-r"].map((cls, i) => (
            <span key={i} className={`absolute w-2 h-2 ${cls}`} style={{ borderColor: "#C9A84C" }} />
          ))}
          I have read this chapter
        </motion.button>
      </motion.div>
    </motion.div>
  );
}


// ─── CHAPTER END NAV ─────────────────────────────────────────────────────────
// Navigation strip at the bottom of the reading column.
// Shows prev chapter (if any) and next chapter (open or sealed).

// ─── SHARE BAR ───────────────────────────────────────────────────────────────
// Appears between chapter rain and chapter navigation.
// Copy link + share on X/Twitter.

function ShareBar({ chapter }: { chapter: Chapter }) {
  const [copied, setCopied] = useState(false);
  const pathname = usePathname();

  const fullUrl = typeof window !== "undefined"
    ? `${window.location.origin}${pathname}`
    : `https://tintaxis.vercel.app${pathname}`;

  const twitterText = encodeURIComponent(
    `I just read "${chapter.title}" on Tintaxis — a living reading platform by Chico Montecristi.\n\n`
  );
  const twitterUrl = `https://twitter.com/intent/tweet?text=${twitterText}&url=${encodeURIComponent(fullUrl)}`;

  const handleCopy = () => {
    navigator.clipboard.writeText(fullUrl).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2200);
    });
  };

  return (
    <motion.div
      className="share-bar-section"
      style={{
        marginTop: "2rem",
        paddingTop: "1.5rem",
        paddingBottom: "0.5rem",
        borderTop: "1px solid var(--border-subtle)",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: "0.75rem",
      }}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5, delay: 0.5 }}
    >
      <p
        style={{
          fontFamily: '"JetBrains Mono", monospace',
          fontSize: "0.75rem",
          letterSpacing: "0.3em",
          color: "var(--brass-dim)",
          textTransform: "uppercase",
          margin: 0,
        }}
      >
        Share this chapter
      </p>

      <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
        {/* Copy link */}
        <motion.button
          onClick={handleCopy}
          style={{
            fontFamily: '"JetBrains Mono", monospace',
            fontSize: "0.75rem",
            letterSpacing: "0.18em",
            textTransform: "uppercase",
            padding: "6px 14px",
            border: copied
              ? "1px solid rgba(0,229,204,0.35)"
              : `1px solid var(--border-subtle)`,
            borderRadius: "2px",
            background: copied
              ? "rgba(0,229,204,0.06)"
              : "transparent",
            color: copied
              ? "rgba(0,229,204,0.7)"
              : "var(--brass-dim)",
            cursor: "pointer",
            transition: "all 0.2s ease",
            display: "flex",
            alignItems: "center",
            gap: "6px",
          }}
          whileHover={{
            borderColor: "rgba(201,168,76,0.35)",
            background: "rgba(201,168,76,0.06)",
          }}
        >
          {copied ? "✓ Copied" : "⎘ Copy Link"}
        </motion.button>

        {/* Twitter/X share */}
        <motion.a
          href={twitterUrl}
          target="_blank"
          rel="noopener noreferrer"
          style={{
            fontFamily: '"JetBrains Mono", monospace',
            fontSize: "0.75rem",
            letterSpacing: "0.18em",
            textTransform: "uppercase",
            padding: "6px 14px",
            border: `1px solid var(--border-subtle)`,
            borderRadius: "2px",
            background: "transparent",
            color: "var(--brass-dim)",
            cursor: "pointer",
            textDecoration: "none",
            display: "flex",
            alignItems: "center",
            gap: "6px",
            transition: "all 0.2s ease",
          }}
          whileHover={{
            borderColor: "rgba(201,168,76,0.35)",
            background: "rgba(201,168,76,0.06)",
          }}
        >
          𝕏 Share
        </motion.a>
      </div>
    </motion.div>
  );
}

interface ChapterEndNavProps {
  prevChapter?: Chapter | null;
  nextChapter?: Chapter | null;
  onGateTriggered: (tier: SubscriptionTierName, featureName: string) => void;
}

function ChapterEndNav({ prevChapter, nextChapter, onGateTriggered }: ChapterEndNavProps) {
  if (!prevChapter && !nextChapter) return null;

  return (
    <motion.div
      className="chapter-end-nav"
      style={{
        marginTop: "4rem",
        paddingTop: "3rem",
        paddingBottom: "3rem",
        borderTop: "1px solid var(--border-subtle)",
        display: "flex",
        justifyContent: "space-between",
        alignItems: "stretch",
        gap: "1rem",
      }}
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay: 0.3, ease: "easeOut" }}
    >
      {/* ── Previous chapter ── */}
      <div style={{ flex: 1 }}>
        {prevChapter && (
          <Link href={prevChapter.bookSlug ? `/book/${prevChapter.bookSlug}/chapter/${prevChapter.slug}` : `/chapter/${prevChapter.slug}`} style={{ textDecoration: "none" }}>
            <motion.div
              style={{
                padding: "1rem",
                border: "1px solid var(--border-subtle)",
                background: "transparent",
                cursor: "pointer",
                display: "flex",
                flexDirection: "column",
                gap: "0.3rem",
              }}
              whileHover={{
                borderColor: "rgba(var(--text-primary-rgb),0.2)",
              }}
              transition={{ duration: 0.2 }}
            >
              <span
                style={{
                  fontFamily: '"JetBrains Mono", monospace',
                  fontSize: "0.75rem",
                  letterSpacing: "0.2em",
                  color: "var(--brass-dim)",
                  textTransform: "uppercase",
                }}
              >
                ← Previous
              </span>
              <span
                style={{
                  fontFamily: '"EB Garamond", Garamond, Georgia, serif',
                  fontSize: "0.95rem",
                  fontStyle: "italic",
                  color: "rgba(var(--text-primary-rgb),0.65)",
                  lineHeight: 1.3,
                }}
              >
                {prevChapter.title}
              </span>
              <span
                style={{
                  fontFamily: '"JetBrains Mono", monospace',
                  fontSize: "0.75rem",
                  letterSpacing: "0.1em",
                  color: "var(--text-dim)",
                  textTransform: "uppercase",
                }}
              >
                Chapter {prevChapter.romanNumeral}
              </span>
            </motion.div>
          </Link>
        )}
      </div>

      {/* ── Divider ── */}
      {prevChapter && nextChapter && (
        <div
          style={{
            width: "1px",
            background:
              "linear-gradient(180deg, transparent, var(--border-subtle) 30%, var(--border-subtle) 70%, transparent)",
            alignSelf: "stretch",
          }}
        />
      )}

      {/* ── Next chapter ── */}
      <div style={{ flex: 1, display: "flex", justifyContent: "flex-end" }}>
        {nextChapter && (
          nextChapter.isLocked ? (
            // Locked — clicking opens subscription gate
            <motion.button
              onClick={() => onGateTriggered("codex", `Chapter ${nextChapter.romanNumeral}`)}
              style={{
                width: "100%",
                padding: "1rem",
                border: "1px solid var(--border-subtle)",
                background: "transparent",
                cursor: "pointer",
                textAlign: "right",
                display: "flex",
                flexDirection: "column",
                alignItems: "flex-end",
                gap: "0.3rem",
              }}
              whileHover={{
                borderColor: "rgba(var(--text-primary-rgb),0.15)",
              }}
              transition={{ duration: 0.2 }}
            >
              <span
                style={{
                  fontFamily: '"JetBrains Mono", monospace',
                  fontSize: "0.75rem",
                  letterSpacing: "0.2em",
                  color: "var(--text-dim)",
                  textTransform: "uppercase",
                  display: "flex",
                  alignItems: "center",
                  gap: "0.3rem",
                }}
              >
                Next →
                <span style={{ fontSize: "0.85rem" }}>⚿</span>
              </span>
              <span
                style={{
                  fontFamily: '"EB Garamond", Garamond, Georgia, serif',
                  fontSize: "0.95rem",
                  fontStyle: "italic",
                  color: "rgba(var(--text-primary-rgb),0.3)",
                  lineHeight: 1.3,
                }}
              >
                {nextChapter.title}
              </span>
              <span
                style={{
                  fontFamily: '"JetBrains Mono", monospace',
                  fontSize: "0.75rem",
                  letterSpacing: "0.1em",
                  color: "var(--text-dim)",
                  textTransform: "uppercase",
                }}
              >
                Chapter {nextChapter.romanNumeral} · Sealed
              </span>
            </motion.button>
          ) : (
            // Open chapter
            <Link href={nextChapter.bookSlug ? `/book/${nextChapter.bookSlug}/chapter/${nextChapter.slug}` : `/chapter/${nextChapter.slug}`} style={{ textDecoration: "none", width: "100%" }}>
              <motion.div
                style={{
                  padding: "1rem",
                  border: "1px solid var(--border-subtle)",
                  background: "transparent",
                  cursor: "pointer",
                  textAlign: "right",
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "flex-end",
                  gap: "0.3rem",
                }}
                whileHover={{
                  borderColor: "rgba(var(--text-primary-rgb),0.25)",
                }}
                transition={{ duration: 0.2 }}
              >
                <span
                  style={{
                    fontFamily: '"JetBrains Mono", monospace',
                    fontSize: "0.75rem",
                    letterSpacing: "0.2em",
                    color: "var(--brass-dim)",
                    textTransform: "uppercase",
                  }}
                >
                  Next →
                </span>
                <span
                  style={{
                    fontFamily: '"EB Garamond", Garamond, Georgia, serif',
                    fontSize: "1.05rem",
                    fontStyle: "italic",
                    color: "rgba(var(--text-primary-rgb),0.7)",
                    lineHeight: 1.3,
                  }}
                >
                  {nextChapter.title}
                </span>
                <span
                  style={{
                    fontFamily: '"JetBrains Mono", monospace',
                    fontSize: "0.75rem",
                    letterSpacing: "0.1em",
                    color: "var(--text-dim)",
                    textTransform: "uppercase",
                  }}
                >
                  Chapter {nextChapter.romanNumeral}
                </span>
              </motion.div>
            </Link>
          )
        )}
      </div>
    </motion.div>
  );
}
