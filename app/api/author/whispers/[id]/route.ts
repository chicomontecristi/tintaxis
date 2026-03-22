// ─── AUTHOR WHISPERS — SINGLE ITEM ───────────────────────────────────────────
// DELETE — Remove a whisper by ID.
// Protected: author session required.

import { NextRequest, NextResponse } from "next/server";
import { getSessionFromCookie } from "@/lib/auth";
import { deleteWhisper } from "@/lib/db";

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
