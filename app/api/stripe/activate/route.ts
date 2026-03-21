// ─── STRIPE ACTIVATE ─────────────────────────────────────────────────────────
// Called by Stripe's success_url redirect after a successful Checkout.
// Verifies the Stripe session, then issues a Tintaxis session cookie and
// redirects the user back to wherever they came from.

import { NextRequest, NextResponse } from "next/server";
import { stripe, type PlanId } from "@/lib/stripe";
import { createSessionCookie } from "@/lib/auth";
import type { ReaderTier, AuthorPlan } from "@/lib/auth";

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

    const plan      = (checkoutSession.metadata?.plan ?? "") as PlanId;
    const returnUrl = checkoutSession.metadata?.returnUrl ?? "/";
    const role      = checkoutSession.metadata?.role as "author" | "reader";
    const email     = checkoutSession.customer_details?.email ?? checkoutSession.metadata?.sub ?? "";
    const name      = checkoutSession.customer_details?.name  ?? "";

    const customerId = typeof checkoutSession.customer === "string"
      ? checkoutSession.customer
      : checkoutSession.customer?.id ?? "";

    const subscriptionId = typeof checkoutSession.subscription === "string"
      ? checkoutSession.subscription
      : checkoutSession.subscription?.id ?? "";

    // Build the session payload based on role
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
