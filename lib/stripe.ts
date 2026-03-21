// ─── STRIPE CLIENT ────────────────────────────────────────────────────────────
// Single Stripe instance shared across all server-side API routes.
// Never import this on the client — it exposes the secret key.

import Stripe from "stripe";

if (!process.env.STRIPE_SECRET_KEY) {
  throw new Error("Missing STRIPE_SECRET_KEY environment variable.");
}

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: "2024-06-20",
  typescript: true,
});

// ─── PLAN → PRICE MAP ────────────────────────────────────────────────────────
// Each plan maps to a recurring Stripe Price ID you create in the dashboard.
// Set these as environment variables in Vercel:
//   STRIPE_PRICE_MANUSCRIPT, STRIPE_PRICE_PRESS,
//   STRIPE_PRICE_CODEX, STRIPE_PRICE_SCRIBE,
//   STRIPE_PRICE_ARCHIVE, STRIPE_PRICE_CHRONICLER

export type PlanId =
  | "manuscript"
  | "press"
  | "codex"
  | "scribe"
  | "archive"
  | "chronicler";

export const PLAN_PRICE_IDS: Record<PlanId, string> = {
  manuscript:  process.env.STRIPE_PRICE_MANUSCRIPT  ?? "",
  press:       process.env.STRIPE_PRICE_PRESS       ?? "",
  codex:       process.env.STRIPE_PRICE_CODEX       ?? "",
  scribe:      process.env.STRIPE_PRICE_SCRIBE      ?? "",
  archive:     process.env.STRIPE_PRICE_ARCHIVE     ?? "",
  chronicler:  process.env.STRIPE_PRICE_CHRONICLER  ?? "",
};

// Role inferred from plan
export function roleForPlan(plan: PlanId): "author" | "reader" {
  return plan === "manuscript" || plan === "press" ? "author" : "reader";
}
