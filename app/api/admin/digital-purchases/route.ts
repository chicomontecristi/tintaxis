// ─── ADMIN: LIST DIGITAL COPY PURCHASES ────────────────────────────────────
// GET  /api/admin/digital-purchases?secret=<ADMIN_SECRET>
// POST /api/admin/digital-purchases  { secret, action: "redeliver_all" | "redeliver", email?, bookSlug? }
//
// Lists all checkout sessions with plan=digital_copy and shows buyer email +
// book info. POST triggers redelivery for one or all buyers.

import { NextRequest, NextResponse } from "next/server";
import { stripe } from "@/lib/stripe";
import { deliverDigitalCopy } from "@/lib/deliver-digital-copy";

function getAdminSecret() {
  return process.env.REDELIVER_SECRET ?? process.env.STRIPE_WEBHOOK_SECRET ?? "";
}

function unauthorized() {
  return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
}

// ─── GET: List all digital copy purchases ───────────────────────────────────
export async function GET(req: NextRequest) {
  const secret = req.nextUrl.searchParams.get("secret") ?? "";
  const adminSecret = getAdminSecret();
  if (!adminSecret || secret !== adminSecret) return unauthorized();

  try {
    // Fetch all completed checkout sessions (Stripe returns newest first)
    const sessions: any[] = [];
    let hasMore = true;
    let startingAfter: string | undefined;

    while (hasMore) {
      const batch: any = await stripe.checkout.sessions.list({
        limit: 100,
        status: "complete",
        ...(startingAfter ? { starting_after: startingAfter } : {}),
      });
      sessions.push(...batch.data);
      hasMore = batch.has_more;
      if (batch.data.length > 0) {
        startingAfter = batch.data[batch.data.length - 1].id;
      }
    }

    // Filter to digital_copy purchases
    const digitalPurchases = sessions
      .filter((s: any) => s.metadata?.plan === "digital_copy")
      .map((s: any) => ({
        sessionId: s.id,
        paymentIntent: s.payment_intent,
        email: s.customer_details?.email ?? s.customer_email ?? "unknown",
        name: s.customer_details?.name ?? "",
        bookSlug: s.metadata?.bookSlug ?? "unknown",
        bookTitle: s.metadata?.bookTitle ?? s.metadata?.bookSlug ?? "unknown",
        amount: s.amount_total ? (s.amount_total / 100).toFixed(2) : "?",
        currency: s.currency ?? "usd",
        date: new Date(s.created * 1000).toISOString(),
      }));

    return NextResponse.json({
      total: digitalPurchases.length,
      purchases: digitalPurchases,
    });
  } catch (err: any) {
    console.error("[admin/digital-purchases] GET error:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

// ─── POST: Redeliver digital copies ─────────────────────────────────────────
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { secret, action, email, bookSlug } = body as {
      secret: string;
      action: "redeliver_all" | "redeliver";
      email?: string;
      bookSlug?: string;
    };

    const adminSecret = getAdminSecret();
  if (!adminSecret || secret !== adminSecret) return unauthorized();

    if (action === "redeliver" && email && bookSlug) {
      // Redeliver a single purchase
      const result = await deliverDigitalCopy(bookSlug, email);
      return NextResponse.json({ delivered: [{ email, bookSlug, ...result }] });
    }

    if (action === "redeliver_all") {
      // Fetch all digital_copy sessions and redeliver each one
      const sessions: any[] = [];
      let hasMore = true;
      let startingAfter: string | undefined;

      while (hasMore) {
        const batch: any = await stripe.checkout.sessions.list({
          limit: 100,
          status: "complete",
          ...(startingAfter ? { starting_after: startingAfter } : {}),
        });
        sessions.push(...batch.data);
        hasMore = batch.has_more;
        if (batch.data.length > 0) {
          startingAfter = batch.data[batch.data.length - 1].id;
        }
      }

      const digitalPurchases = sessions.filter(
        (s: any) => s.metadata?.plan === "digital_copy"
      );

      const results = [];
      for (const s of digitalPurchases) {
        const buyerEmail = s.customer_details?.email ?? s.customer_email;
        const slug = s.metadata?.bookSlug;
        const buyerName = s.customer_details?.name ?? undefined;

        if (!buyerEmail || !slug) {
          results.push({
            sessionId: s.id,
            email: buyerEmail ?? "missing",
            bookSlug: slug ?? "missing",
            success: false,
            error: "Missing email or bookSlug",
          });
          continue;
        }

        const result = await deliverDigitalCopy(slug, buyerEmail, buyerName);
        results.push({
          sessionId: s.id,
          email: buyerEmail,
          bookSlug: slug,
          ...result,
        });
      }

      return NextResponse.json({
        total: results.length,
        delivered: results,
      });
    }

    return NextResponse.json(
      { error: 'Invalid action. Use "redeliver" or "redeliver_all".' },
      { status: 400 }
    );
  } catch (err: any) {
    console.error("[admin/digital-purchases] POST error:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
