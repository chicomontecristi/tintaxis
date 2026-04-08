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

// ── Voice profile definitions ────────────────────────────
// Each voice has dramatically different characteristics so readers
// can hear a real difference, even with the Web Speech API fallback.

interface VoiceProfile {
  pitch: number;
  rate: number;
  volume: number;
  /** Keywords to match against SpeechSynthesisVoice.name for preferred system voice */
  preferFemale: boolean;
  /** Prefer a specific named voice if available (browser-dependent) */
  preferredNames: string[];
}

const VOICE_PROFILES: Record<string, VoiceProfile> = {
  warm: {
    pitch: 1.0,
    rate: 0.82,
    volume: 0.95,
    preferFemale: true,
    preferredNames: ["Samantha", "Karen", "Tessa", "Victoria", "Google US English"],
  },
  deep: {
    pitch: 0.55,
    rate: 0.75,
    volume: 1.0,
    preferFemale: false,
    preferredNames: ["Daniel", "Alex", "Thomas", "Google UK English Male", "Microsoft David"],
  },
  clear: {
    pitch: 1.2,
    rate: 0.95,
    volume: 1.0,
    preferFemale: true,
    preferredNames: ["Zira", "Google UK English Female", "Fiona", "Moira", "Microsoft Zira"],
  },
  soft: {
    pitch: 1.35,
    rate: 0.72,
    volume: 0.8,
    preferFemale: true,
    preferredNames: ["Rishi", "Veena", "Tessa", "Shelley", "Google US English"],
  },
};

// ── Find a matching system voice ─────────────────────────
// Tries preferred names first, then gender heuristic, then falls back.
function pickSystemVoice(
  profile: VoiceProfile,
  lang: string
): SpeechSynthesisVoice | null {
  const voices = window.speechSynthesis?.getVoices() ?? [];
  if (voices.length === 0) return null;

  // Filter to voices matching the target language
  const langVoices = voices.filter((v) =>
    v.lang.toLowerCase().startsWith(lang.toLowerCase().slice(0, 2))
  );
  const pool = langVoices.length > 0 ? langVoices : voices;

  // 1. Try preferred names
  for (const name of profile.preferredNames) {
    const match = pool.find((v) =>
      v.name.toLowerCase().includes(name.toLowerCase())
    );
    if (match) return match;
  }

  // 2. Gender heuristic — female voices often have names like "female", "woman",
  //    or common female names; male voices have "male", "man", "David", "Daniel", etc.
  const femaleHints = /female|woman|samantha|karen|victoria|zira|fiona|moira|tessa|veena|shelley|alice|anna/i;
  const maleHints = /male|man|daniel|david|alex|thomas|rishi|jorge|google.*male/i;

  const genderMatch = pool.find((v) => {
    if (profile.preferFemale) return femaleHints.test(v.name);
    return maleHints.test(v.name);
  });
  if (genderMatch) return genderMatch;

  // 3. If we want a different voice per profile, offset into the pool
  const profileIndex = ["warm", "deep", "clear", "soft"].indexOf(
    Object.keys(VOICE_PROFILES).find(
      (k) => VOICE_PROFILES[k] === profile
    ) ?? "warm"
  );
  const offset = Math.min(profileIndex, pool.length - 1);
  return pool[offset] ?? null;
}

// ── Split text into chunks safe for Chrome's ~15-second limit ────
// Splits at sentence boundaries, targeting chunks under ~200 chars.
function chunkText(text: string, maxLen = 180): string[] {
  if (text.length <= maxLen) return [text];

  const chunks: string[] = [];
  let remaining = text;

  while (remaining.length > 0) {
    if (remaining.length <= maxLen) {
      chunks.push(remaining);
      break;
    }

    // Find the last sentence-ending punctuation within maxLen
    let splitAt = -1;
    for (let i = Math.min(maxLen, remaining.length) - 1; i >= 40; i--) {
      if (/[.!?;:—]/.test(remaining[i])) {
        splitAt = i + 1;
        break;
      }
    }

    // Fallback: split at last space within maxLen
    if (splitAt === -1) {
      splitAt = remaining.lastIndexOf(" ", maxLen);
    }

    // Last resort: hard cut
    if (splitAt <= 0) {
      splitAt = maxLen;
    }

    chunks.push(remaining.slice(0, splitAt).trim());
    remaining = remaining.slice(splitAt).trim();
  }

  return chunks.filter((c) => c.length > 0);
}

// ── Web Speech API narrator ──────────────────────────────
// Free, built-in, zero-config. Used when OpenAI TTS is not available.
// Now picks distinct system voices and applies dramatic rate/pitch/volume
// differences so each narrator sounds genuinely different.
// Chunks long text to dodge Chrome's ~15-second speech cutoff.
export function createWebSpeechNarrator(
  voice: NarratorVoice,
  language: "en" | "es" | "zh"
) {
  const langMap: Record<string, string> = {
    en: "en-US",
    es: "es-ES",
    zh: "zh-CN",
  };

  const profile = VOICE_PROFILES[voice.id] ?? VOICE_PROFILES.warm;
  const lang = langMap[language] ?? "en-US";

  // Cache the resolved system voice so we don't re-scan every paragraph
  let resolvedVoice: SpeechSynthesisVoice | null | undefined = undefined;
  let stopped = false;

  function resolveVoice() {
    if (resolvedVoice === undefined) {
      resolvedVoice = pickSystemVoice(profile, lang);
    }
    return resolvedVoice;
  }

  function makeUtterance(text: string): SpeechSynthesisUtterance {
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = lang;
    utterance.rate = profile.rate;
    utterance.pitch = profile.pitch;
    utterance.volume = profile.volume;
    const v = resolveVoice();
    if (v) utterance.voice = v;
    return utterance;
  }

  return {
    speak(
      text: string,
      onEnd: () => void,
      onError: () => void
    ): SpeechSynthesisUtterance {
      window.speechSynthesis?.cancel();
      stopped = false;

      const chunks = chunkText(text);
      let currentChunk = 0;

      // Chrome also pauses speechSynthesis after ~15s of background.
      // This keep-alive timer nudges it every 10s.
      let keepAlive: ReturnType<typeof setInterval> | null = null;

      function clearKeepAlive() {
        if (keepAlive) {
          clearInterval(keepAlive);
          keepAlive = null;
        }
      }

      function speakChunk(idx: number): SpeechSynthesisUtterance {
        const utterance = makeUtterance(chunks[idx]);

        utterance.onend = () => {
          if (stopped) return;
          const next = idx + 1;
          if (next < chunks.length) {
            currentChunk = next;
            speakChunk(next);
          } else {
            clearKeepAlive();
            onEnd();
          }
        };

        // On error: try next chunk instead of killing everything.
        // Chrome fires onerror("interrupted") on long utterances.
        utterance.onerror = (e) => {
          if (stopped) return;
          const next = idx + 1;
          if (next < chunks.length) {
            // Recoverable — skip this chunk and try the next
            currentChunk = next;
            speakChunk(next);
          } else {
            // Last chunk errored — treat as done, not as fatal
            clearKeepAlive();
            onEnd();
          }
        };

        window.speechSynthesis?.speak(utterance);
        return utterance;
      }

      // Start keep-alive: Chrome pauses synth in background tabs
      keepAlive = setInterval(() => {
        if (window.speechSynthesis?.speaking) {
          window.speechSynthesis.pause();
          window.speechSynthesis.resume();
        }
      }, 10000);

      return speakChunk(0);
    },

    stop() {
      stopped = true;
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
