// ─── AUTHOR SALES API ─────────────────────────────────────────────────────────
// Returns the full book sales ledger (direct, off-platform sales) for the
// author Studio. Protected: author session cookie required.

import { NextRequest, NextResponse } from "next/server";
import { getSessionFromCookie } from "@/lib/auth";
import { BOOK_SALES, getSalesSummary } from "@/lib/content/book-sales";

export async function GET(req: NextRequest) {
  const session = getSessionFromCookie(req.headers.get("cookie"));
  if (!session || session.role !== "author") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const summary = getSalesSummary();

  return NextResponse.json({
    sales:   BOOK_SALES,
    summary,
  });
}
