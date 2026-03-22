// ─── SIGNAL REPLY — reader-facing ────────────────────────────────────────────
// GET /api/signal/reply?chapter=one&email=reader@example.com
// Returns the author's reply to a reader's signal for a specific chapter.
// Only returns the reply if answered=true.

import { NextRequest, NextResponse } from "next/server";
import { getSignalReply } from "@/lib/db";

export async function GET(req: NextRequest) {
  const chapterSlug = req.nextUrl.searchParams.get("chapter");
  const email       = req.nextUrl.searchParams.get("email");

  if (!chapterSlug || !email) {
    return NextResponse.json({ reply: null });
  }

  const result = await getSignalReply(chapterSlug, email);
  return NextResponse.json(result ?? { reply: null });
}
