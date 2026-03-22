// ─── AUTHOR WHISPERS API ──────────────────────────────────────────────────────
// GET  — List all whispers (author dashboard).
// POST — Create a new whisper.
// Protected: author session required.

import { NextRequest, NextResponse } from "next/server";
import { getSessionFromCookie } from "@/lib/auth";
import { listAllWhispers, insertWhisper } from "@/lib/db";
import { CHAPTERS } from "@/lib/content/chapters";

export async function GET(req: NextRequest) {
  const session = getSessionFromCookie(req.headers.get("cookie"));
  if (!session || session.role !== "author") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const whispers = await listAllWhispers();
  return NextResponse.json({ whispers });
}

export async function POST(req: NextRequest) {
  const session = getSessionFromCookie(req.headers.get("cookie"));
  if (!session || session.role !== "author") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { chapterSlug, anchorText, content, whisperType } = await req.json();

  if (!chapterSlug || !anchorText?.trim() || !content?.trim()) {
    return NextResponse.json({ error: "chapterSlug, anchorText, and content are required" }, { status: 400 });
  }

  const chapterTitle = CHAPTERS[chapterSlug]?.title ?? null;

  const whisper = await insertWhisper({
    chapterSlug,
    chapterTitle,
    anchorText: anchorText.trim(),
    content: content.trim(),
    whisperType: whisperType === "anchor" ? "anchor" : "whisper",
  });

  if (!whisper) {
    return NextResponse.json({ error: "Insert failed" }, { status: 500 });
  }

  return NextResponse.json({ whisper });
}
