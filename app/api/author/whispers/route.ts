// ─── AUTHOR WHISPERS API ──────────────────────────────────────────────────────
// GET  — List all whispers (author dashboard).
// POST — Create a new whisper.
// Protected: author session required.

import { NextRequest, NextResponse } from "next/server";
import { getSessionFromCookie } from "@/lib/auth";
import { listAllWhispers, insertWhisper } from "@/lib/db";
import { supabase } from "@/lib/supabase";
import { getBookChapter, getAllBookSlugs } from "@/lib/content/books";

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

  // Resolve chapter title from any book in the registry
  let chapterTitle: string | null = null;
  for (const bookSlug of getAllBookSlugs()) {
    const ch = getBookChapter(bookSlug, chapterSlug);
    if (ch) { chapterTitle = ch.title; break; }
  }

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

// ─── BULK DELETE ────────────────────────────────────────────────────────────
// DELETE /api/author/whispers            — remove ALL whispers
// DELETE /api/author/whispers?author=...  — remove whispers by author_name
// DELETE /api/author/whispers?chapter=... — remove whispers on a specific chapter
//
// Intended as a one-shot cleanup for AI-seeded whispers attributed to the
// author. The Experience page demo whispers are hard-coded in the React tree
// and not stored in the DB, so this will not affect them.
export async function DELETE(req: NextRequest) {
  const session = getSessionFromCookie(req.headers.get("cookie"));
  if (!session || session.role !== "author") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const authorFilter  = req.nextUrl.searchParams.get("author");
  const chapterFilter = req.nextUrl.searchParams.get("chapter");

  let query = supabase.from("whispers").delete({ count: "exact" });

  if (authorFilter)  query = query.eq("author_name", authorFilter);
  if (chapterFilter) query = query.eq("chapter_slug", chapterFilter);
  if (!authorFilter && !chapterFilter) {
    // Delete everything — use a non-null filter so Supabase does not refuse.
    query = query.not("id", "is", null);
  }

  const { error, count } = await query;

  if (error) {
    console.error("[author/whispers] bulk delete error:", error.message);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ success: true, deleted: count ?? 0 });
}
