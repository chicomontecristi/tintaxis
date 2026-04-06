// ─── SECURE CHAPTER CONTENT API ──────────────────────────────────────────────
// Server-side content gating. Chapter paragraphs are ONLY served through this
// endpoint, which verifies the reader's subscription tier before returning text.
//
// Access rules:
//   Chapter 1:  Free — no session required
//   Chapter 2:  Free with email — requires email session (cookie)
//   Chapter 3+: Paid — requires "codex" tier or above
//
// The page component strips paragraphs from chapters 3+ before sending to the
// client. The client then fetches content here IF the reader has access.

import { NextRequest, NextResponse } from "next/server";
import { getSessionFromCookie } from "@/lib/auth";
import { getReaderByEmail, getReaderTierForWriter } from "@/lib/db";
import { getBookChapter, getBook } from "@/lib/content/books";

const TIER_ORDER = ["free", "digital_copy", "codex", "scribe", "archive", "chronicler"];

function hasTierAccess(readerTier: string | null, requiredTier: string): boolean {
  if (!readerTier) return false;
  return TIER_ORDER.indexOf(readerTier) >= TIER_ORDER.indexOf(requiredTier);
}

export async function GET(
  req: NextRequest,
  { params }: { params: { bookSlug: string; chapterSlug: string } }
) {
  const { bookSlug, chapterSlug } = params;

  // Validate chapter exists
  const chapter = getBookChapter(bookSlug, chapterSlug);
  const book = getBook(bookSlug);
  if (!chapter || !book) {
    return NextResponse.json({ error: "Chapter not found" }, { status: 404 });
  }

  // Chapter 1: always free
  if (chapter.number === 1) {
    return NextResponse.json({ paragraphs: chapter.paragraphs });
  }

  // All other chapters require at least a session
  const session = getSessionFromCookie(req.headers.get("cookie"));

  // Chapter 2: requires email session (free tier is fine)
  if (chapter.number === 2) {
    if (!session) {
      return NextResponse.json(
        { error: "Email required", gate: "email" },
        { status: 401 }
      );
    }
    return NextResponse.json({ paragraphs: chapter.paragraphs });
  }

  // Chapters 3+: requires codex tier or above
  if (!session) {
    return NextResponse.json(
      { error: "Subscription required", gate: "subscription", requiredTier: "codex" },
      { status: 401 }
    );
  }

  // Check tier from database first, fall back to cookie
  let effectiveTier: string | null = session.tier ?? null;

  try {
    const dbReader = await getReaderByEmail(session.sub);
    if (dbReader) {
      if (!dbReader.active) {
        return NextResponse.json(
          { error: "Account inactive", gate: "subscription" },
          { status: 403 }
        );
      }

      effectiveTier = dbReader.tier ?? null;

      // Check per-writer subscription if applicable
      if (book.writerSlug && dbReader.id) {
        const writerTier = await getReaderTierForWriter(dbReader.id, book.writerSlug);
        if (writerTier) effectiveTier = writerTier;
      }
    }
  } catch {
    // DB unreachable — fall through to cookie tier
    console.warn("[chapter API] DB lookup failed, using cookie tier");
  }

  if (!hasTierAccess(effectiveTier, "codex")) {
    return NextResponse.json(
      { error: "Subscription required", gate: "subscription", requiredTier: "codex", currentTier: effectiveTier },
      { status: 403 }
    );
  }

  // Authorized — serve full content
  return NextResponse.json({ paragraphs: chapter.paragraphs });
}
