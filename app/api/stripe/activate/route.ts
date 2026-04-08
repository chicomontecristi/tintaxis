// ─── STRIPE ACTIVATE ─────────────────────────────────────────────────────────
// Called by Stripe's success_url redirect after a successful Checkout.
// Verifies the Stripe session, writes reader to Supabase, issues a
// Tintaxis session cookie, and redirects the user back to the right page.

import { NextRequest, NextResponse } from "next/server";
import { stripe, type PlanId } from "@/lib/stripe";
import { createSessionCookie } from "@/lib/auth";
import { upsertReader, recordPurchase, upsertReaderSubscription } from "@/lib/db";
import { deliverDigitalCopy } from "@/lib/deliver-digital-copy";
import type { ReaderTier, AuthorPlan } from "@/lib/auth";

// One-time purchase plans (not subscriptions)
const ONE_TIME_PLANS = new Set(["read", "keep", "digital_copy"]);

export async function GET(req: NextRequest) {
  const { searchParams } = req.nextUrl;
  const sessionId = searchParams.get("session_id");

  if (!sessionId) {
    return NextResponse.redirect(new URL("/?error=missing_session", req.url));
  }

  try {
    // Retrieve the completed Checkout session from Stripe
    const checkoutSession = await stripe.checkout.sessions.retrieve(sessionId, {
      expand: ["subscription", "customer"],
    });

    if (checkoutSession.payment_status !== "paid" && checkoutSession.status !== "complete") {
      return NextResponse.redirect(new URL("/?error=payment_incomplete", req.url));
    }

    const plan        = (checkoutSession.metadata?.plan ?? "") as PlanId;
    const returnUrl   = checkoutSession.metadata?.returnUrl ?? "/";
    const role        = checkoutSession.metadata?.role as "author" | "reader";
    const writerSlug  = checkoutSession.metadata?.writerSlug  ?? null;
    const chapterSlug = checkoutSession.metadata?.chapterSlug ?? null;
    const bookSlug    = checkoutSession.metadata?.bookSlug    ?? null;
    const email       = checkoutSession.customer_details?.email ?? checkoutSession.metadata?.sub ?? "";
    const name        = checkoutSession.customer_details?.name  ?? "";

    const customerId = typeof checkoutSession.customer === "string"
      ? checkoutSession.customer
      : checkoutSession.customer?.id ?? "";

    const subscriptionId = typeof checkoutSession.subscription === "string"
      ? checkoutSession.subscription
      : checkoutSession.subscription?.id ?? "";

    // ── Write reader to Supabase ─────────────────────────────────────────────
    if (email) {
      const isOneTime = ONE_TIME_PLANS.has(plan);

      const reader = await upsertReader({
        email,
        name:                 name || undefined,
        stripeCustomerId:     customerId    || undefined,
        stripeSubscriptionId: isOneTime ? undefined : (subscriptionId || undefined),
        tier:  (!isOneTime && role === "reader") ? (plan as ReaderTier) : null,
        plan:  (!isOneTime && role === "author") ? (plan as AuthorPlan) : null,
        role,
        active: true,
      });

      // For one-time purchases, record the purchase
      const purchaseSlug = chapterSlug ?? (plan === "digital_copy" ? bookSlug : null);
      if (isOneTime && reader && purchaseSlug) {
        await recordPurchase({
          readerId:        reader.id,
          chapterSlug:     purchaseSlug,
          plan,
          stripeSessionId: sessionId,
          amount:          checkoutSession.amount_total,
          writerSlug,
        });
      }

      // For digital copy purchases, email the full book to the buyer
      if (plan === "digital_copy" && bookSlug && email) {
        // Fire and forget — don't block the redirect if email is slow
        deliverDigitalCopy(bookSlug, email, name || undefined).then((r) => {
          if (r.success) console.log(`[activate] Digital copy delivered: "${bookSlug}" → ${email}`);
          else console.error(`[activate] Digital copy delivery failed: ${r.error}`);
        });
      }

      // For per-writer subscriptions, create the reader_subscriptions row
      if (!isOneTime && role === "reader" && reader && writerSlug) {
        await upsertReaderSubscription({
          readerId:              reader.id,
          writerSlug,
          tier:                  plan as ReaderTier,
          stripeSubscriptionId:  subscriptionId || null,
          active:                true,
        });
      }
    }

    // ── Issue session cookie ─────────────────────────────────────────────────
    const cookieStr = createSessionCookie({
      sub:  email,
      role,
      name: name || (role === "author" ? "Author" : "Reader"),
      ...(role === "reader"
        ? { tier: plan as ReaderTier }
        : { plan: plan as AuthorPlan }),
      stripeCustomerId:     customerId,
      stripeSubscriptionId: subscriptionId,
    });

    // Redirect to the right place
    const destination = role === "author" ? "/author" : returnUrl;
    const res = NextResponse.redirect(new URL(destination, req.url));
    res.headers.set("Set-Cookie", cookieStr);
    return res;

  } catch (err) {
    console.error("[stripe/activate]", err);
    return NextResponse.redirect(new URL("/?error=activation_failed", req.url));
  }
}
