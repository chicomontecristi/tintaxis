// ─── NARRATION ENGINE ────────────────────────────────────────────────────────
// Manages AI narrator playback across chapter paragraphs.
// Supports OpenAI TTS (via /api/narrate) with Web Speech API fallback.
//
// The narrator reads one paragraph at a time, synced to the reader's scroll.
// When a paragraph finishes, it auto-advances to the next and scrolls it
// into view with a gentle highlight.

import type { NarratorVoice, ChapterParagraph } from "./types";

export interface NarrationController {
  play: () => void;
  pause: () => void;
  stop: () => void;
  skipTo: (paragraphIndex: number) => void;
  isPlaying: boolean;
  currentParagraph: number;
}

// ── Determine page-1 boundary ────────────────────────────
// "Page 1" = everything before the first section break, or the first 8 paragraphs.
export function getPageOneEnd(paragraphs: ChapterParagraph[], override?: number): number {
  if (override !== undefined) return override;

  for (let i = 0; i < paragraphs.length; i++) {
    if (paragraphs[i].isSectionBreak) return i;
  }

  return Math.min(8, paragraphs.length);
}

// ── Web Speech API narrator ──────────────────────────────
// Free, built-in, zero-config. Used when OpenAI TTS is not available.
export function createWebSpeechNarrator(
  voice: NarratorVoice,
  language: "en" | "es" | "zh" | "es-zh"
) {
  const langMap: Record<string, string> = {
    en: "en-US",
    es: "es-ES",
    zh: "zh-CN",
    "es-zh": "es-ES",
  };

  const pitchMap: Record<string, number> = {
    warm: 1.0,
    deep: 0.8,
    clear: 1.05,
    soft: 1.1,
  };

  return {
    speak(
      text: string,
      onEnd: () => void,
      onError: () => void
    ): SpeechSynthesisUtterance {
      window.speechSynthesis?.cancel();

      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = langMap[language] ?? "en-US";
      utterance.rate = 0.85;
      utterance.pitch = pitchMap[voice.id] ?? 1.0;
      utterance.onend = onEnd;
      utterance.onerror = onError;

      window.speechSynthesis?.speak(utterance);
      return utterance;
    },

    stop() {
      window.speechSynthesis?.cancel();
    },
  };
}

// ── OpenAI TTS narrator ──────────────────────────────────
// Server-side audio generation, streamed back as MP3.
export async function fetchTTSAudio(
  text: string,
  voice: string,
  language: string
): Promise<{ audioUrl: string; fallback: boolean }> {
  try {
    const res = await fetch("/api/narrate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ text, voice, language }),
    });

    if (res.status === 501) {
      // Server says use client-side fallback
      return { audioUrl: "", fallback: true };
    }

    if (!res.ok) {
      return { audioUrl: "", fallback: true };
    }

    const blob = await res.blob();
    const url = URL.createObjectURL(blob);
    return { audioUrl: url, fallback: false };
  } catch {
    return { audioUrl: "", fallback: true };
  }
}

// ── Scroll paragraph into view ───────────────────────────
export function scrollParagraphIntoView(paragraphIndex: number) {
  const el = document.querySelector(`[data-paragraph="${paragraphIndex}"]`);
  if (!el) return;

  el.scrollIntoView({ behavior: "smooth", block: "center" });

  // Add a brief glow highlight
  el.classList.add("narrator-highlight");
  setTimeout(() => el.classList.remove("narrator-highlight"), 2000);
}
