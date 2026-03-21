// ─── READER SESSION CHECK ─────────────────────────────────────────────────────
// Called client-side on mount to determine if the current visitor has an
// active reader (or author) session. Returns tier so the UI can unlock
// the right features without exposing the JWT to JavaScript.

import { NextRequest, NextResponse } from "next/server";
import { getSessionFromCookie } from "@/lib/auth";

export async function GET(req: NextRequest) {
  const session = getSessionFromCookie(req.headers.get("cookie"));

  if (!session) {
    return NextResponse.json({ subscribed: false });
  }

  return NextResponse.json({
    subscribed: true,
    role: session.role,
    tier: session.tier ?? null,
    plan: session.plan ?? null,
    name: session.name,
  });
}
