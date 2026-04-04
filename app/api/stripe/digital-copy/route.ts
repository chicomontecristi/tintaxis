// ─── STRIPE DIGITAL COPY (ONE-TIME PURCHASE) ──────────────────────────────────
// Creates a one-time Stripe Checkout Session for a PDF download ($1.50).
// Uses payment mode (not subscription) — charge once, deliver PDF.

import { NextRequest, NextResponse } from "next/server";
import { stripe, PLAN_PRICE_IDS } from "@/lib/stripe";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { bookSlug, returnUrl, email } = body as {
      bookSlug: string;
      returnUrl?: string;
      email?: string;
    };

    if (!bookSlug) {
      return NextResponse.json({ error: "bookSlug is required." }, { status: 400 });
    }

    const priceId = PLAN_PRICE_IDS["digital_copy"];
    if (!priceId) {
      return NextResponse.json(
        { error: "Price not configured for digital_copy. Set STRIPE_PRICE_DIGITAL_COPY in Vercel env vars." },
        { status: 500 }
      );
    }

    const origin = req.headers.get("origin") ?? process.env.NEXT_PUBLIC_URL ?? "https://tintaxis.vercel.app";
    const safeReturn = returnUrl ?? `/book/${bookSlug}`;

    const session = await stripe.checkout.sessions.create({
      mode: "payment", // One-time payment, not recurring subscription
      line_items: [{ price: priceId, quantity: 1 }],

      // Metadata: bookSlug for delivery, returnUrl for post-purchase redirect
      metadata: {
        plan: "digital_copy",
        bookSlug,
        returnUrl: safeReturn,
        role: "reader",
      },

      // Pre-fill email if provided
      ...(email ? { customer_email: email } : {}),

      // After successful payment, activate the purchase and redirect
      success_url: `${origin}/api/stripe/activate?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${origin}${safeReturn}`,
    });

    return NextResponse.json({ url: session.url });
  } catch (err) {
    console.error("[stripe/digital-copy]", err);
    return NextResponse.json({ error: "Failed to create digital copy checkout session." }, { status: 500 });
  }
}
