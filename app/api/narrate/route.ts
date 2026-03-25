import { NextRequest, NextResponse } from "next/server";

// ─── TTS NARRATION API ──────────────────────────────────────────────────────
// POST /api/narrate
// Accepts paragraph text + voice preference, returns audio stream.
//
// Strategy:
// 1. If OPENAI_API_KEY is set → use OpenAI TTS (high quality)
// 2. Otherwise → return 501 and let client fall back to Web Speech API
//
// Body: { text: string, voice: string, language: "en" | "es" | "zh" }

const OPENAI_VOICES = ["alloy", "echo", "fable", "onyx", "nova", "shimmer"] as const;

export async function POST(req: NextRequest) {
  try {
    const { text, voice, language } = await req.json();

    if (!text || typeof text !== "string") {
      return NextResponse.json(
        { error: "Missing text parameter" },
        { status: 400 }
      );
    }

    // Limit text length to prevent abuse (roughly one paragraph)
    if (text.length > 5000) {
      return NextResponse.json(
        { error: "Text too long. Maximum 5000 characters per request." },
        { status: 400 }
      );
    }

    const apiKey = process.env.OPENAI_API_KEY;

    if (!apiKey) {
      // No API key → signal client to use Web Speech API fallback
      return NextResponse.json(
        { fallback: true, message: "No TTS provider configured. Use client-side speech synthesis." },
        { status: 501 }
      );
    }

    // ── OpenAI TTS ───────────────────────────────────────────
    const selectedVoice = OPENAI_VOICES.includes(voice as typeof OPENAI_VOICES[number])
      ? voice
      : "alloy";

    // Per-voice speed profiles — makes each narrator sound distinct
    const voiceSpeedMap: Record<string, number> = {
      alloy: 0.92,    // Warm: slightly under natural
      onyx: 0.82,     // Deep: slow, deliberate, fireside pace
      nova: 1.0,      // Clear: natural, crisp
      shimmer: 0.78,  // Soft: very unhurried, whispery
      echo: 0.88,     // (reserved for future)
      fable: 0.95,    // (reserved for future)
    };
    const baseSpeed = voiceSpeedMap[selectedVoice] ?? 0.9;
    const speed = language === "zh" ? baseSpeed * 0.94 : baseSpeed;

    const ttsResponse = await fetch("https://api.openai.com/v1/audio/speech", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "tts-1-hd",
        input: text,
        voice: selectedVoice,
        response_format: "mp3",
        speed,
      }),
    });

    if (!ttsResponse.ok) {
      const errorBody = await ttsResponse.text().catch(() => "Unknown TTS error");
      console.error("[narrate] OpenAI TTS error:", ttsResponse.status, errorBody);
      return NextResponse.json(
        { fallback: true, message: "TTS provider error. Use client-side fallback." },
        { status: 502 }
      );
    }

    // Stream the audio back
    const audioBuffer = await ttsResponse.arrayBuffer();

    return new NextResponse(audioBuffer, {
      status: 200,
      headers: {
        "Content-Type": "audio/mpeg",
        "Cache-Control": "public, max-age=86400", // Cache narration for 24h
      },
    });
  } catch (err) {
    console.error("[narrate] Error:", err);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
