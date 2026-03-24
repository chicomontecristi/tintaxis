// ─── STRIPE WEBHOOK ───────────────────────────────────────────────────────────
// Handles subscription lifecycle events from Stripe.
// Writes all subscription state changes to Supabase.
//
// Register this URL in your Stripe dashboard:
//   https://tintaxis.vercel.app/api/stripe/webhook
// Events to enable:
//   checkout.session.completed
//   customer.subscription.deleted
//   customer.subscription.updated
//   invoice.payment_failed
//   invoice.paid

import { NextRequest, NextResponse } from "next/server";
import { stripe } from "@/lib/stripe";
import { getWriterConnectId, WRITER_SHARE } from "@/lib/featured-writers";
import {
  deactivateReader,
  updateReaderSubscription,
  upsertReaderSubscription,
  deactivateReaderSubscription,
  updateReaderSubscriptionByStripe,
  getReaderByCustomerId,
} from "@/lib/db";
import type { ReaderTier } from "@/lib/db-types";
import type Stripe from "stripe";

// Map Stripe price IDs → Tintaxis tier names.
// Update this if you add new plans to lib/stripe.ts.
const PRICE_TO_TIER: Record<string, ReaderTier> = {
  [process.env.STRIPE_PRICE_CODEX       ?? ""]: "codex",
  [process.env.STRIPE_PRICE_SCRIBE      ?? ""]: "scribe",
  [process.env.STRIPE_PRICE_ARCHIVE     ?? ""]: "archive",
  [process.env.STRIPE_PRICE_CHRONICLER  ?? ""]: "chronicler",
};

const READER_TIERS = new Set(["codex", "scribe", "archive", "chronicler"]);

// Next.js App Router: read raw body to verify Stripe signature
export async function POST(req: NextRequest) {
  const rawBody = await req.text();
  const sig     = req.headers.get("stripe-signature") ?? "";
  const secret  = process.env.STRIPE_WEBHOOK_SECRET ?? "";

  if (!secret) {
    console.error("[stripe/webhook] STRIPE_WEBHOOK_SECRET is not set.");
    return NextResponse.json({ error: "Webhook secret not configured." }, { status: 500 });
  }

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(rawBody, sig, secret);
  } catch (err) {
    console.error("[stripe/webhook] Signature verification failed:", err);
    return NextResponse.json({ error: "Invalid signature." }, { status: 400 });
  }

  // ── Handle events ────────────────────────────────────────────────────────────
  switch (event.type) {

    case "customer.subscription.deleted": {
      // Subscription cancelled — revoke access
      const sub = event.data.object as Stripe.Subscription;
      const customerId = typeof sub.customer === "string" ? sub.customer : sub.customer.id;
      const writerSlug = sub.metadata?.writerSlug;
      console.log(`[stripe/webhook] Subscription cancelled: ${sub.id} (customer: ${customerId}, writer: ${writerSlug ?? "none"})`);

      // Deactivate per-writer subscription row
      await deactivateReaderSubscription(sub.id);

      // Also update legacy readers table for backward compatibility
      await deactivateReader(customerId);
      console.log(`[stripe/webhook] Reader deactivated for customer: ${customerId}`);
      break;
    }

    case "customer.subscription.updated": {
      const sub = event.data.object as Stripe.Subscription;
      const customerId = typeof sub.customer === "string" ? sub.customer : sub.customer.id;
      const isActive = sub.status === "active" || sub.status === "trialing";

      // Determine the new tier from the price ID
      const priceId = sub.items?.data?.[0]?.price?.id ?? "";
      const newTier = PRICE_TO_TIER[priceId] ?? null;

      console.log(`[stripe/webhook] Subscription updated: ${sub.id} status=${sub.status} tier=${newTier ?? "unknown"}`);

      // Update per-writer subscription row
      await updateReaderSubscriptionByStripe(sub.id, {
        ...(newTier ? { tier: newTier } : {}),
        active: isActive,
      });

      // Also update legacy readers table
      await updateReaderSubscription(customerId, {
        stripeSubscriptionId: sub.id,
        ...(newTier ? { tier: newTier } : {}),
        active: isActive,
      });
      break;
    }

    case "invoice.payment_failed": {
      const inv = event.data.object as Stripe.Invoice;
      const customerId = typeof inv.customer === "string" ? inv.customer : (inv.customer?.id ?? "");
      const subscriptionId = typeof inv.subscription === "string" ? inv.subscription : (inv.subscription?.id ?? "");
      console.log(`[stripe/webhook] Payment failed for customer: ${customerId}`);

      // Deactivate per-writer subscription
      if (subscriptionId) {
        await updateReaderSubscriptionByStripe(subscriptionId, { active: false });
      }

      // Also update legacy readers table
      if (customerId) {
        await updateReaderSubscription(customerId, { active: false });
      }
      break;
    }

    case "invoice.paid": {
      // Payment succeeded (including retry after failure) — restore access
      const inv = event.data.object as Stripe.Invoice;
      const customerId = typeof inv.customer === "string" ? inv.customer : (inv.customer?.id ?? "");
      const subscriptionId = typeof inv.subscription === "string" ? inv.subscription : (inv.subscription?.id ?? "");

      if (customerId && subscriptionId) {
        console.log(`[stripe/webhook] Invoice paid — restoring access for customer: ${customerId}`);

        // Restore per-writer subscription
        await updateReaderSubscriptionByStripe(subscriptionId, { active: true });

        // Also restore legacy readers table
        await updateReaderSubscription(customerId, { active: true });
      }
      break;
    }

    case "checkout.session.completed": {
      // Primary activation happens via /api/stripe/activate redirect.
      // This is the fallback for tab-close cases AND the writer payout trigger.
      const session = event.data.object as Stripe.Checkout.Session;
      const { plan, writerSlug, role } = session.metadata ?? {};
      const customerId = typeof session.customer === "string"
        ? session.customer
        : ((session.customer as Stripe.Customer)?.id ?? "");
      const subscriptionId = typeof session.subscription === "string"
        ? session.subscription
        : ((session.subscription as Stripe.Subscription)?.id ?? "");

      console.log(`[stripe/webhook] Checkout complete: ${session.id} plan=${plan} writer=${writerSlug ?? "none"}`);

      // ── Create per-writer subscription record for reader plans ─────────────
      if (plan && READER_TIERS.has(plan) && writerSlug && customerId) {
        // Look up the reader by their Stripe customer ID
        const reader = await getReaderByCustomerId(customerId);
        if (reader) {
          await upsertReaderSubscription({
            readerId: reader.id,
            writerSlug,
            tier: plan as ReaderTier,
            stripeSubscriptionId: subscriptionId || null,
            active: true,
          });
          console.log(`[stripe/webhook] Per-writer subscription created: reader=${reader.id} writer=${writerSlug} tier=${plan}`);
        } else {
          console.warn(`[stripe/webhook] Reader not found for customer: ${customerId} — per-writer subscription skipped.`);
        }
      }

      // ── Writer payout: transfer 85% to their Stripe Connect account ────────
      if (writerSlug && session.amount_total && session.amount_total > 0) {
        const connectId = getWriterConnectId(writerSlug);
        if (connectId) {
          const writerAmount = Math.floor(session.amount_total * WRITER_SHARE);
          try {
            const transfer = await stripe.transfers.create({
              amount:   writerAmount,               // cents
              currency: session.currency ?? "usd",
              destination: connectId,
              transfer_group: session.id,
              description: `Tintaxis 85% share — ${writerSlug} — session ${session.id}`,
              metadata: {
                writerSlug,
                plan: plan ?? "",
                checkoutSession: session.id,
                writerAmount: String(writerAmount),
                totalAmount:  String(session.amount_total),
              },
            });
            console.log(`[stripe/webhook] Transfer created: ${transfer.id} → ${connectId} amount=${writerAmount}¢`);
          } catch (err) {
            // Log but don't fail — Tintaxis still received payment
            console.error(`[stripe/webhook] Transfer failed for ${writerSlug}:`, err);
          }
        } else {
          // Writer hasn't connected Stripe yet — log for manual reconciliation
          console.warn(`[stripe/webhook] No Connect account for writer "${writerSlug}" — payout queued for manual transfer.`);
        }
      }
      break;
    }

    default:
      // Unhandled event types — ignore
      break;
  }

  return NextResponse.json({ received: true });
}
