import { NextRequest, NextResponse } from "next/server";
import { listWhispersByChapter } from "@/lib/db";

// ── GET /api/whispers?chapter=one ─────────────────────────────────────────────
// Public — no auth required. Serves whispers for a chapter to the reading surface.

export async function GET(req: NextRequest) {
  const chapterSlug = req.nextUrl.searchParams.get("chapter");

  if (!chapterSlug) {
    return NextResponse.json({ error: "chapter param required" }, { status: 400 });
  }

  const whispers = await listWhispersByChapter(chapterSlug);
  return NextResponse.json({ whispers });
}
