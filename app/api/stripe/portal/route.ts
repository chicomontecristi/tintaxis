// ─── STRIPE BILLING PORTAL ────────────────────────────────────────────────────
// Generates a Stripe Customer Portal session and redirects the reader there.
// The portal lets readers cancel, upgrade, downgrade, and update payment info
// without ever touching our code.
//
// Flow: /account → GET /api/stripe/portal → Stripe portal → back to /account

import { NextRequest, NextResponse } from "next/server";
import { stripe } from "@/lib/stripe";
import { getSessionFromCookie } from "@/lib/auth";
import { getReaderByEmail } from "@/lib/db";

export async function GET(req: NextRequest) {
  const session = getSessionFromCookie(req.headers.get("cookie"));

  if (!session) {
    // Not logged in — send to home
    return NextResponse.redirect(new URL("/", req.url));
  }

  const origin =
    req.headers.get("x-forwarded-host")
      ? `https://${req.headers.get("x-forwarded-host")}`
      : req.headers.get("origin") ??
        process.env.NEXT_PUBLIC_URL ??
        "https://tintaxis.vercel.app";

  try {
    // Look up the reader's Stripe customer ID from Supabase
    const reader = await getReaderByEmail(session.sub);

    if (!reader?.stripe_customer_id) {
      // Reader exists in cookie but has no Stripe record (e.g. one-time purchase
      // pre-Phase 3, or cookie fallback). Send them to account page with a note.
      return NextResponse.redirect(
        new URL("/account?error=no-billing", req.url)
      );
    }

    const portalSession = await stripe.billingPortal.sessions.create({
      customer: reader.stripe_customer_id,
      return_url: `${origin}/account`,
    });

    return NextResponse.redirect(portalSession.url);
  } catch (err) {
    console.error("[stripe/portal]", err);
    return NextResponse.redirect(
      new URL("/account?error=portal", req.url)
    );
  }
}
