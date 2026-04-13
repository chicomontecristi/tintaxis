// ─── AUTHOR WHISPERS — SINGLE ITEM ───────────────────────────────────────────
// PATCH  — Edit a whisper's anchor text and/or body.
// DELETE — Remove a whisper by ID.
// Protected: author session required.

import { NextRequest, NextResponse } from "next/server";
import { getSessionFromCookie } from "@/lib/auth";
import { deleteWhisper, updateWhisper } from "@/lib/db";

export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = getSessionFromCookie(req.headers.get("cookie"));
  if (!session || session.role !== "author") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json().catch(() => ({} as any));
  const anchorText: string | undefined =
    typeof body?.anchorText === "string" ? body.anchorText.trim() : undefined;
  const content: string | undefined =
    typeof body?.content === "string" ? body.content.trim() : undefined;

  if (anchorText === undefined && content === undefined) {
    return NextResponse.json(
      { error: "Provide anchorText and/or content." },
      { status: 400 }
    );
  }
  if (anchorText !== undefined && !anchorText) {
    return NextResponse.json({ error: "Anchor text cannot be empty." }, { status: 400 });
  }
  if (content !== undefined && !content) {
    return NextResponse.json({ error: "Whisper body cannot be empty." }, { status: 400 });
  }

  const whisper = await updateWhisper(params.id, { anchorText, content });
  if (!whisper) {
    return NextResponse.json({ error: "Update failed." }, { status: 500 });
  }
  return NextResponse.json({ whisper });
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = getSessionFromCookie(req.headers.get("cookie"));
  if (!session || session.role !== "author") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const ok = await deleteWhisper(params.id);
  return NextResponse.json({ success: ok });
}
