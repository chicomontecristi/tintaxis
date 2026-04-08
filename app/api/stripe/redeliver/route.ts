// ─── MANUAL RE-DELIVERY ─────────────────────────────────────────────────────
// Sends a digital copy to a buyer who already paid but never received the email.
// Protected by a secret token — only Jose can trigger this.
//
// Usage (curl or browser):
//   POST /api/stripe/redeliver
//   { "email": "buyer@email.com", "bookSlug": "the-hunt", "secret": "<REDELIVER_SECRET>" }
//
// Or set REDELIVER_SECRET in Vercel env vars.

import { NextRequest, NextResponse } from "next/server";
import { deliverDigitalCopy } from "@/lib/deliver-digital-copy";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { email, bookSlug, name, secret } = body as {
      email: string;
      bookSlug: string;
      name?: string;
      secret?: string;
    };

    // Auth: require secret or admin key
    const expectedSecret = process.env.REDELIVER_SECRET ?? process.env.STRIPE_WEBHOOK_SECRET ?? "";
    if (!secret || secret !== expectedSecret) {
      return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
    }

    if (!email || !bookSlug) {
      return NextResponse.json({ error: "email and bookSlug are required." }, { status: 400 });
    }

    const result = await deliverDigitalCopy(bookSlug, email, name);

    if (result.success) {
      return NextResponse.json({ ok: true, message: `Delivered "${bookSlug}" to ${email}` });
    } else {
      return NextResponse.json({ error: result.error }, { status: 500 });
    }
  } catch (err) {
    console.error("[redeliver]", err);
    return NextResponse.json({ error: "Re-delivery failed." }, { status: 500 });
  }
}
