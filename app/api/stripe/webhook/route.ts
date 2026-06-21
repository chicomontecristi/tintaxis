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
  createReaderWithPassword,
  upsertReader,
  recordEmailRetryQueue,
  recordFailedDigitalCopy,
} from "@/lib/db";
import { hashPassword } from "@/lib/crypto";
import { randomBytes } from "crypto";
import { deliverDigitalCopy } from "@/lib/deliver-digital-copy";
import { sendWelcomeEmail } from "@/lib/send-welcome-email";
import type { ReaderTier } from "@/lib/db-types";
import type Stripe from "stripe";

// Map Stripe price IDs → Tintaxis tier names.
// Fail fast if environment variables are missing (Issue #8).
function buildPriceMap(): Record<string, ReaderTier> {
  const codex = process.env.STRIPE_PRICE_CODEX;
  const scribe = process.env.STRIPE_PRICE_SCRIBE;
  const archive = process.env.STRIPE_PRICE_ARCHIVE;
  const chronicler = process.env.STRIPE_PRICE_CHRONICLER;

  if (!codex || !scribe || !archive || !chronicler) {
    console.error("[stripe/webhook] Missing Stripe price IDs in environment variables");
    throw new Error("STRIPE_PRICE_* environment variables not configured");
  }

  return {
    [codex]: "codex",
    [scribe]: "scribe",
    [archive]: "archive",
    [chronicler]: "chronicler",
  };
}

const PRICE_TO_TIER = buildPriceMap();
const READER_TIERS = new Set(["codex", "scribe", "archive", "chronicler"]);

// Next.js App Router: read raw body to verify Stripe signature
export async function POST(req: NextRequest) {
  console.log("[stripe/webhook] ✓ Handler invoked at", new Date().toISOString());
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

      // Issue #7: Explicit validation before proceeding
      if (!customerId || !subscriptionId) {
        console.warn(`[stripe/webhook] Invoice.paid missing critical data: customerId=${customerId}, subscriptionId=${subscriptionId}. Skipping activation.`);
        break;
      }

      console.log(`[stripe/webhook] Invoice paid — restoring access for customer: ${customerId}`);

      // Restore per-writer subscription and check result
      const subResult = await updateReaderSubscriptionByStripe(subscriptionId, { active: true });
      if (!subResult) {
        console.error(`[stripe/webhook] Failed to activate per-writer subscription: ${subscriptionId}`);
      }

      // Also restore legacy readers table and check result
      const legacyResult = await updateReaderSubscription(customerId, { active: true });
      if (!legacyResult) {
        console.error(`[stripe/webhook] Failed to activate legacy reader subscription: ${customerId}`);
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
      // Validate plan from metadata (Issue #3)
      if (plan && typeof plan === "string" && READER_TIERS.has(plan) && writerSlug && customerId) {
        // Look up the reader by their Stripe customer ID
        let reader = await getReaderByCustomerId(customerId);
        let temporaryPassword: string | undefined;
        const subscriberEmail = session.customer_details?.email ?? "";
        const subscriberName = session.customer_details?.name ?? undefined;

        // If reader doesn't exist, create one automatically with temporary password
        if (!reader && subscriberEmail) {
          // Generate temporary password with safe character set (Issue #6)
          const safeChars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%";
          const passBytes = randomBytes(12);
          temporaryPassword = "";
          for (let i = 0; i < 12; i++) {
            temporaryPassword += safeChars[passBytes[i] % safeChars.length];
          }

          const passwordHash = await hashPassword(temporaryPassword);
          reader = await createReaderWithPassword({
            email: subscriberEmail,
            passwordHash,
            name: subscriberName,
          });

          if (reader) {
            console.log(`[stripe/webhook] Reader account created automatically: ${subscriberEmail}`);
            // Update the reader with the Stripe customer ID (Issue #9: Check result)
            const updateResult = await upsertReader({ id: reader.id, stripeCustomerId: customerId });
            if (!updateResult) {
              console.error(`[stripe/webhook] Failed to update reader with Stripe customer ID: ${reader.id}`);
            }
          } else {
            console.error(`[stripe/webhook] Reader creation failed for email: ${subscriberEmail}`);
          }
        }

        if (reader) {
          // Create subscription and check result (Issue #1: Race condition fix)
          const subResult = await upsertReaderSubscription({
            readerId: reader.id,
            writerSlug,
            tier: plan as ReaderTier,
            stripeSubscriptionId: subscriptionId || null,
            active: true,
          });

          if (!subResult) {
            console.error(`[stripe/webhook] Subscription creation FAILED for reader: ${reader.id}. Email will NOT be sent.`);
            break; // Don't send email if subscription failed
          }

          console.log(`[stripe/webhook] Per-writer subscription created: reader=${reader.id} writer=${writerSlug} tier=${plan}`);

          // ── Send welcome email ONLY if subscription creation succeeded (Issue #1 + #4 fix) ──
          if (subscriberEmail) {
            const emailResult = await sendWelcomeEmail(subscriberEmail, subscriberName, plan as ReaderTier, temporaryPassword);
            if (emailResult.success) {
              console.log(`[stripe/webhook] Welcome email sent to ${subscriberEmail}`);
            } else {
              // Issue #4: Record failure for manual intervention
              console.error(`[stripe/webhook] Welcome email FAILED for ${subscriberEmail} (reader: ${reader.id}, tier: ${plan}): ${emailResult.error}`);
              const recorded = await recordEmailRetryQueue({
                recipientEmail: subscriberEmail,
                recipientName: subscriberName,
                emailType: "welcome",
                readerId: reader.id,
                stripeCustomerId: customerId,
                subscriptionTier: plan,
                errorMessage: emailResult.error,
                metadata: { checkoutSessionId: session.id, writerSlug },
              });
              if (recorded) {
                console.log(`[stripe/webhook] Email failure recorded in retry queue for ${subscriberEmail}`);
              }
            }
          }
        } else {
          console.warn(`[stripe/webhook] Reader not found or creation failed for customer: ${customerId} — subscription skipped.`);
        }
      } else if (plan && !READER_TIERS.has(plan)) {
        // Issue #3: Log invalid plans for debugging
        console.warn(`[stripe/webhook] Invalid plan in metadata: "${plan}" — subscription skipped.`);
      }

      // ── Digital copy: email the full book to the buyer ─────────────────────
      // Issue #5: Monitor digital copy delivery failures
      if (plan === "digital_copy") {
        const bookSlug = session.metadata?.bookSlug;
        const buyerEmail = session.customer_details?.email ?? "";
        const buyerName  = session.customer_details?.name  ?? undefined;

        // Validate required fields
        if (!bookSlug || !buyerEmail) {
          console.error(`[stripe/webhook] Digital copy INCOMPLETE: bookSlug="${bookSlug}", email="${buyerEmail}". REQUIRES MANUAL FOLLOW-UP.`);
          // Record incomplete delivery for admin intervention
          await recordFailedDigitalCopy({
            stripeSessionId: session.id,
            stripeCustomerId: customerId,
            bookSlug: bookSlug ?? "unknown",
            buyerEmail,
            buyerName,
            errorType: "missing_data",
            errorMessage: `Missing: bookSlug=${bookSlug}, email=${buyerEmail}`,
            metadata: { checkoutSessionId: session.id },
          });
          break;
        }

        const result = await deliverDigitalCopy(bookSlug, buyerEmail, buyerName);
        if (result.success) {
          console.log(`[stripe/webhook] Digital copy delivered: "${bookSlug}" → ${buyerEmail}`);
        } else {
          console.error(`[stripe/webhook] Digital copy delivery FAILED: "${bookSlug}" → ${buyerEmail}: ${result.error}. REQUIRES MANUAL FOLLOW-UP.`);
          // Record delivery failure for admin intervention
          await recordFailedDigitalCopy({
            stripeSessionId: session.id,
            stripeCustomerId: customerId,
            bookSlug,
            buyerEmail,
            buyerName,
            errorType: "delivery_failed",
            errorMessage: result.error,
            metadata: { checkoutSessionId: session.id },
          });
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
