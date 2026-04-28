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
    const writerSlug = book?.writerSlug;
    const writerConnectId = writerSlug
      ? process.env[`STRIPE_CONNECT_${writerSlug.toUpperCase().replace(/-/g, "_")}`]
      : undefined;

    // ──── APPLICATION FEE (15% platform cut, 85% to writer) ────
    // For digital copy (one-time purchase at fixed $1.50):
    // Calculate exact fee: $1.50 - Stripe fee = net, then 15% of net = platform fee
    const digitalCopyAmountCents = 150; // $1.50
    const stripeFeePercent = 0.029;
    const stripeFeeFixed = 30; // $0.30 in cents
    const stripeFee = Math.round(digitalCopyAmountCents * stripeFeePercent + stripeFeeFixed);
    const netAmountCents = digitalCopyAmountCents - stripeFee;
    const platformFeeCents = Math.round(netAmountCents * 0.15); // 15% of net

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

      // Put the book title on the payment itself so it shows in Stripe dashboard
      payment_intent_data: {
        description: `Digital Copy — ${bookTitle}`,
        metadata: {
          plan: "digital_copy",
          bookSlug,
          bookTitle,
          ...(writerSlug ? { writerSlug } : {}),
        },
        // Deduct 15% of net ($1.16) = $0.174 platform fee
        // Writer receives remaining 85% = $0.986
        application_fee_amount: writerConnectId ? platformFeeCents : undefined,
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
