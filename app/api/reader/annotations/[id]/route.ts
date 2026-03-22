import { NextRequest, NextResponse } from "next/server";
import { getSessionFromCookie } from "@/lib/auth";
import { getReaderByEmail, deleteAnnotation, updateAnnotationNote } from "@/lib/db";

// ─── /api/reader/annotations/[id] ────────────────────────────────────────────
// PATCH { note } — update annotation note
// DELETE         — delete annotation (reader-scoped)

export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = getSessionFromCookie(req.headers.get("cookie"));
  if (!session) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  const reader = await getReaderByEmail(session.sub);
  if (!reader) return NextResponse.json({ error: "reader not found" }, { status: 404 });

  const { note } = await req.json().catch(() => ({}));
  if (typeof note !== "string") {
    return NextResponse.json({ error: "note required" }, { status: 400 });
  }

  const ok = await updateAnnotationNote(params.id, reader.id, note);
  if (!ok) return NextResponse.json({ error: "update failed" }, { status: 500 });

  return NextResponse.json({ success: true });
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = getSessionFromCookie(req.headers.get("cookie"));
  if (!session) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  const reader = await getReaderByEmail(session.sub);
  if (!reader) return NextResponse.json({ error: "reader not found" }, { status: 404 });

  const ok = await deleteAnnotation(params.id, reader.id);
  if (!ok) return NextResponse.json({ error: "delete failed" }, { status: 500 });

  return NextResponse.json({ success: true });
}
