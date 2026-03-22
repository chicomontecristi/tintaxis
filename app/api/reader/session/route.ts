// ─── READER SESSION CHECK ─────────────────────────────────────────────────────
// Called client-side on mount to determine if the current visitor has an
// active reader (or author) session.
//
// Strategy:
//   1. Read the JWT cookie for fast identity (email, name).
//   2. Cross-check Supabase for live subscription state (tier, active).
//      This ensures cancellations / upgrades are reflected immediately,
//      even if the cookie hasn't expired yet.
//   3. Fall back to cookie data if Supabase is unreachable.

import { NextRequest, NextResponse } from "next/server";
import { getSessionFromCookie } from "@/lib/auth";
import { getReaderByEmail } from "@/lib/db";

export async function GET(req: NextRequest) {
  const session = getSessionFromCookie(req.headers.get("cookie"));

  if (!session) {
    return NextResponse.json({ subscribed: false });
  }

  // Attempt to refresh state from Supabase
  try {
    const dbReader = await getReaderByEmail(session.sub);

    if (dbReader) {
      // Reader found in DB — use live state
      if (!dbReader.active) {
        // Subscription cancelled or payment failed
        return NextResponse.json({ subscribed: false, reason: "inactive" });
      }

      return NextResponse.json({
        subscribed: true,
        role:       dbReader.role,
        tier:       dbReader.tier ?? null,
        plan:       dbReader.plan ?? null,
        name:       dbReader.name ?? session.name,
        // Convenience: tell client if this is a subscriber vs one-time purchaser
        type:       dbReader.stripe_subscription_id ? "subscription" : "one-time",
      });
    }
  } catch (err) {
    // Supabase unreachable — fall through to cookie data
    console.warn("[reader/session] Supabase lookup failed, using cookie:", err);
  }

  // Fallback: cookie is valid but no DB record (e.g. DB not yet set up)
  return NextResponse.json({
    subscribed: true,
    role:       session.role,
    tier:       session.tier ?? null,
    plan:       session.plan ?? null,
    name:       session.name,
    type:       "cookie-fallback",
  });
}
