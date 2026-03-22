// ─── ALL ANNOTATIONS FOR READER ──────────────────────────────────────────────
// Returns every annotation the authenticated reader has made, across all
// chapters. Used by the account/vault page to render reading history.

import { NextRequest, NextResponse } from "next/server";
import { getSessionFromCookie } from "@/lib/auth";
import { getReaderByEmail, listAllAnnotationsByReader } from "@/lib/db";
import type { AnnotationRow } from "@/lib/db-types";

export async function GET(req: NextRequest) {
  const session = getSessionFromCookie(req.headers.get("cookie"));
  if (!session) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const dbReader = await getReaderByEmail(session.sub);
  if (!dbReader) {
    return NextResponse.json({ error: "reader not found" }, { status: 404 });
  }

  const rows: AnnotationRow[] = await listAllAnnotationsByReader(dbReader.id);

  // Group by chapter slug for easier rendering
  const byChapter: Record<string, { chapterSlug: string; count: number; latest: string; inks: string[] }> = {};

  for (const row of rows) {
    if (!byChapter[row.chapter_slug]) {
      byChapter[row.chapter_slug] = {
        chapterSlug: row.chapter_slug,
        count:       0,
        latest:      row.created_at,
        inks:        [],
      };
    }
    byChapter[row.chapter_slug].count++;
    if (!byChapter[row.chapter_slug].inks.includes(row.ink_type)) {
      byChapter[row.chapter_slug].inks.push(row.ink_type);
    }
  }

  return NextResponse.json({
    total:      rows.length,
    byChapter:  Object.values(byChapter),
    // Recent 5 for the preview strip
    recent:     rows.slice(0, 5).map((r) => ({
      id:            r.id,
      inkType:       r.ink_type,
      selectedText:  r.selected_text,
      note:          r.note,
      chapterSlug:   r.chapter_slug,
      createdAt:     r.created_at,
    })),
  });
}
