// ─── READER SESSION CHECK ─────────────────────────────────────────────────────
// Called client-side on mount to determine if the current visitor has an
// active reader (or author) session.
//
// Strategy:
//   1. Read the JWT cookie for fast identity (email, name).
//   2. Cross-check Supabase for live subscription state (tier, active).
//      This ensures cancellations / upgrades are reflected immediately,
//      even if the cookie hasn't expired yet.
//   3. If writerSlug is provided, check per-writer subscription first.
//   4. Fall back to cookie data if Supabase is unreachable.

import { NextRequest, NextResponse } from "next/server";
import { getSessionFromCookie } from "@/lib/auth";
import { getReaderByEmail, getReaderTierForWriter } from "@/lib/db";

export async function GET(req: NextRequest) {
  const session = getSessionFromCookie(req.headers.get("cookie"));

  if (!session) {
    return NextResponse.json({ subscribed: false });
  }

  // Optional: check per-writer subscription
  const writerSlug = req.nextUrl.searchParams.get("writerSlug");

  // Attempt to refresh state from Supabase
  try {
    const dbReader = await getReaderByEmail(session.sub);

    if (dbReader) {
      // Reader found in DB — use live state
      if (!dbReader.active) {
        // Account-level deactivation (e.g. banned)
        return NextResponse.json({ subscribed: false, reason: "inactive" });
      }

      // If a writerSlug was requested, check per-writer subscription
      let effectiveTier = dbReader.tier ?? null;
      let subscriptionType = dbReader.stripe_subscription_id ? "subscription" : "one-time";

      if (writerSlug && dbReader.id) {
        const writerTier = await getReaderTierForWriter(dbReader.id, writerSlug);
        if (writerTier) {
          effectiveTier = writerTier;
          subscriptionType = "subscription";
        } else {
          // No per-writer subscription — fall back to global tier for legacy compat
          // Once all readers are migrated, this fallback can be removed
        }
      }

      return NextResponse.json({
        subscribed: !!effectiveTier,
        role:       dbReader.role,
        tier:       effectiveTier,
        plan:       dbReader.plan ?? null,
        name:       dbReader.name ?? session.name,
        email:      session.sub,
        id:         dbReader.id,
        type:       subscriptionType,
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
    email:      session.sub,
    id:         null,
    type:       "cookie-fallback",
  });
}
