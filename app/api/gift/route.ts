// ─── GIFT A MONTH — STRIPE CHECKOUT ──────────────────────────────────────────
// Creates a one-time Stripe Checkout Session for gifting a month of a writer's
// work to a friend. The recipient gets an email with a redemption link.

import { NextRequest, NextResponse } from "next/server";
import { stripe } from "@/lib/stripe";
import { getWriterBySlug } from "@/lib/featured-writers";

const TIER_PRICES: Record<string, { label: string; amount: number }> = {
  codex:      { label: "Codex",      amount: 199 },
  scribe:     { label: "Scribe",     amount: 399 },
  archive:    { label: "Archive",    amount: 799 },
  chronicler: { label: "Chronicler", amount: 999 },
};

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { writerSlug, tier, recipientEmail, recipientName, senderName, message } = body as {
      writerSlug: string;
      tier: string;
      recipientEmail: string;
      recipientName?: string;
      senderName?: string;
      message?: string;
    };

    if (!writerSlug || !tier || !recipientEmail) {
      return NextResponse.json({ error: "Writer, tier, and recipient email are required." }, { status: 400 });
    }

    const writer = getWriterBySlug(writerSlug);
    if (!writer) {
      return NextResponse.json({ error: "Writer not found." }, { status: 400 });
    }

    const tierInfo = TIER_PRICES[tier];
    if (!tierInfo) {
      return NextResponse.json({ error: "Invalid tier." }, { status: 400 });
    }

    const displayName = writer.artistName ?? writer.name;
    const origin = req.headers.get("origin") ?? process.env.NEXT_PUBLIC_URL ?? "https://tintaxis.com";

    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      line_items: [
        {
          price_data: {
            currency: "usd",
            product_data: {
              name: `Gift: 1 Month ${tierInfo.label} — ${displayName}`,
              description: `One month of ${tierInfo.label} tier access to ${displayName}'s work on Tintaxis.${senderName ? ` From ${senderName}.` : ""}`,
            },
            unit_amount: tierInfo.amount,
          },
          quantity: 1,
        },
      ],
      metadata: {
        type: "gift_subscription",
        writerSlug,
        tier,
        recipientEmail,
        recipientName: recipientName ?? "",
        senderName: senderName ?? "",
        message: (message ?? "").slice(0, 490),
      },
      success_url: `${origin}/gift/${writerSlug}?status=success&to=${encodeURIComponent(recipientEmail)}`,
      cancel_url: `${origin}/gift/${writerSlug}?status=cancelled`,
    });

    return NextResponse.json({ url: session.url });
  } catch (err) {
    console.error("[gift/checkout]", err);
    return NextResponse.json({ error: "Failed to create gift checkout." }, { status: 500 });
  }
}
