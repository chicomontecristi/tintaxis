import { NextRequest, NextResponse } from "next/server";
import { getSessionFromCookie } from "@/lib/auth";
import { getReaderByEmail, insertAnnotation, listAnnotationsByReader } from "@/lib/db";

// ─── /api/reader/annotations ─────────────────────────────────────────────────
// GET  ?chapter=slug  — load all annotations for the authenticated reader
// POST              — save a new annotation

// ── GET ───────────────────────────────────────────────────────────────────────
export async function GET(req: NextRequest) {
  const session = getSessionFromCookie(req.headers.get("cookie"));
  if (!session) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const chapterSlug = req.nextUrl.searchParams.get("chapter");
  if (!chapterSlug) {
    return NextResponse.json({ error: "chapter param required" }, { status: 400 });
  }

  const reader = await getReaderByEmail(session.sub);
  if (!reader) {
    return NextResponse.json({ error: "reader not found" }, { status: 404 });
  }

  const rows = await listAnnotationsByReader(reader.id, chapterSlug);

  // Map DB rows back to the client Annotation shape
  const annotations = rows.map((r) => ({
    id:          r.id,
    inkType:     r.ink_type,
    note:        r.note ?? "",
    chapterSlug: r.chapter_slug,
    createdAt:   r.created_at,
    readerId:    r.reader_id,
    isPublic:    r.is_public,
    selection: {
      text:           r.selected_text,
      startOffset:    r.start_offset,
      endOffset:      r.end_offset,
      paragraphIndex: r.paragraph_index,
    },
  }));

  return NextResponse.json({ annotations });
}

// ── POST ──────────────────────────────────────────────────────────────────────
export async function POST(req: NextRequest) {
  const session = getSessionFromCookie(req.headers.get("cookie"));
  if (!session) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const reader = await getReaderByEmail(session.sub);
  if (!reader) {
    return NextResponse.json({ error: "reader not found" }, { status: 404 });
  }

  const body = await req.json().catch(() => ({}));
  const { inkType, note, chapterSlug, isPublic, selection } = body;

  if (!inkType || !chapterSlug || !selection?.text) {
    return NextResponse.json({ error: "inkType, chapterSlug, and selection required" }, { status: 400 });
  }

  const row = await insertAnnotation({
    readerId:       reader.id,
    chapterSlug,
    paragraphIndex: selection.paragraphIndex ?? 0,
    startOffset:    selection.startOffset    ?? 0,
    endOffset:      selection.endOffset      ?? 0,
    selectedText:   selection.text,
    note:           note ?? "",
    inkType,
    isPublic:       isPublic ?? false,
  });

  if (!row) {
    return NextResponse.json({ error: "failed to save annotation" }, { status: 500 });
  }

  return NextResponse.json({
    id:          row.id,
    inkType:     row.ink_type,
    note:        row.note ?? "",
    chapterSlug: row.chapter_slug,
    createdAt:   row.created_at,
    readerId:    row.reader_id,
    isPublic:    row.is_public,
    selection: {
      text:           row.selected_text,
      startOffset:    row.start_offset,
      endOffset:      row.end_offset,
      paragraphIndex: row.paragraph_index,
    },
  }, { status: 201 });
}
