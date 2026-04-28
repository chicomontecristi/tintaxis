// ─── STRIPE DIGITAL COPY (ONE-TIME PURCHASE) ──────────────────────────────────
// Creates a one-time Stripe Checkout Session for a PDF download ($1.50).
// Uses payment mode (not subscription) — charge once, deliver PDF.

import { NextRequest, NextResponse } from "next/server";
import { stripe, PLAN_PRICE_IDS } from "@/lib/stripe";
import { getBook } from "@/lib/content/books";

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

    // Look up book title for clear Stripe dashboard labeling
    const book = getBook(bookSlug);
    const bookTitle = book?.title ?? bookSlug;

    const session = await stripe.checkout.sessions.create({
      mode: "payment", // One-time payment, not recurring subscription
      line_items: [{ price: priceId, quantity: 1 }],

      // Metadata: bookSlug for delivery, returnUrl for post-purchase redirect
      metadata: {
        plan: "digital_copy",
        bookSlug,
        bookTitle,
        returnUrl: safeReturn,
        role: "reader",
      },

      // ──── APPLICATION FEE (15% platform cut, 85% to writer) ────
    // For digital copy (one-time purchase): deduct 15% fee at payment time
    // Writer gets 85%, Tintaxis keeps 15% platform fee
    const writerSlug = book?.writerSlug;
    const writerConnectId = writerSlug
      ? process.env[`STRIPE_CONNECT_${writerSlug.toUpperCase().replace(/-/g, "_")}`]
      : undefined;

    // Put the book title on the payment itself so it shows in Stripe dashboard
      payment_intent_data: {
        description: `Digital Copy — ${bookTitle}`,
        metadata: {
          plan: "digital_copy",
          bookSlug,
          bookTitle,
          ...(writerSlug ? { writerSlug } : {}),
        },
        // Application fee: 15% of $1.50 = $0.225 (22.5 cents)
        // Writer gets: $1.275 (85% of net after Stripe fees)
        application_fee_amount: writerConnectId ? Math.round(150 * 0.15) : undefined,
        transfer_data: writerConnectId
          ? {
              destination: writerConnectId,
            }
          : undefined,
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
