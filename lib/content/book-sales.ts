// ─── TINTAXIS — BOOK SALES LEDGER ────────────────────────────────────────────
// Manual sales registry for off-platform / direct sales (cash, in-person,
// gifted copies sold by the author, physical artifact sales, etc.).
//
// Sales made through Stripe on the platform are tracked separately via the
// Stripe API and surfaced in the author stats endpoint. This file is for
// everything that doesn't pass through Stripe.
//
// To log a new sale, add an entry to the SALES array below. Each entry is
// immutable once committed — to correct a sale, add a new entry with a
// negative amount and a note, rather than editing past records.
//
// Format date as YYYY-MM-DD. Amounts are in USD (dollars, not cents).
// If `amount` is omitted (or 0), the book's default `salePrice` from
// lib/content/books.ts is used.

import { BOOKS } from "./books";

export type SaleChannel =
  | "direct"      // cash / hand-to-hand / personal network
  | "event"       // reading, book fair, exhibition
  | "gift-sale"   // artifact/gift bundle sold with painting, mural, etc.
  | "other";

/** How the payment was processed. Affects whether Stripe fees apply. */
export type ProcessedVia =
  | "stripe"      // Stripe payment link, terminal, invoice, checkout (fees apply)
  | "cash"        // physical cash, no fees
  | "venmo"       // peer-to-peer, no fees on personal accounts
  | "zelle"       // bank transfer, no fees
  | "other";

export interface BookSale {
  id:           string;        // stable unique id, e.g. "sale-2026-04-10-recoleta"
  bookSlug:     string;        // must match a key in BOOKS
  date:         string;        // YYYY-MM-DD
  amount?:      number;        // USD, dollars. Falls back to BOOKS[bookSlug].salePrice if 0/undefined.
  channel:      SaleChannel;
  processedVia?: ProcessedVia; // default: "stripe" — Stripe fees deducted from displayed revenue
  buyer?:       string;        // optional, first-name or initials only
  location?:    string;        // optional, city / venue
  note?:        string;        // optional, short context
}

// ─── STRIPE FEES ─────────────────────────────────────────────────────────────
// US standard pricing: 2.9% + $0.30 per successful card charge.
// International cards, currency conversion, and Stripe Tax can add more —
// adjust here if Jose's account is on a different fee schedule.

export const STRIPE_FEE_PERCENT = 0.029;
export const STRIPE_FEE_FIXED   = 0.30;

/** Returns the Stripe processing fee in USD for a given gross charge. */
export function stripeFee(grossUSD: number): number {
  if (grossUSD <= 0) return 0;
  return grossUSD * STRIPE_FEE_PERCENT + STRIPE_FEE_FIXED;
}

/** Returns the NET amount after Stripe fees, only when processedVia === "stripe". */
export function netAmountForSale(sale: BookSale): number {
  const gross = effectiveAmount(sale);
  const via = sale.processedVia ?? "stripe";
  if (via !== "stripe") return gross;
  return Math.max(0, gross - stripeFee(gross));
}

// ─── LEDGER ──────────────────────────────────────────────────────────────────
// Newest first.

export const BOOK_SALES: BookSale[] = [
  {
    id:       "sale-2026-04-10-mi-pajaro-del-rio",
    bookSlug: "mi-pajaro-del-rio",
    date:     "2026-04-10",
    channel:  "direct",
    note:     "Initial ledger entry — confirmed sold copy.",
  },
  {
    id:       "sale-2026-04-10-noches-de-maya",
    bookSlug: "noches-de-maya",
    date:     "2026-04-10",
    channel:  "direct",
    note:     "Initial ledger entry — confirmed sold copy.",
  },
  {
    id:       "sale-2026-04-10-recoleta",
    bookSlug: "recoleta",
    date:     "2026-04-10",
    channel:  "direct",
    note:     "Initial ledger entry — confirmed sold copy.",
  },
];

// ─── PRICING ─────────────────────────────────────────────────────────────────

/** Gross USD amount for a sale: explicit amount, else book salePrice, else 0. */
export function effectiveAmount(sale: BookSale): number {
  if (sale.amount && sale.amount !== 0) return sale.amount;
  const book = BOOKS[sale.bookSlug];
  return book?.salePrice ?? 0;
}

// ─── SUMMARY HELPERS ─────────────────────────────────────────────────────────

export interface BookRevenue {
  slug:                string;
  title:               string;
  salesCount:          number;
  directRevenueGross:  number;   // pre-fee
  directRevenueNet:    number;   // post Stripe fee
  subscriptionRevenue: number;   // attributed share of NET subscription revenue
  totalRevenue:        number;   // directRevenueNet + subscriptionRevenue
}

export interface SalesSummary {
  totalCount:           number;
  totalRevenueGross:    number;                                              // pre-fee total
  totalRevenueNet:      number;                                              // post-fee total
  totalStripeFees:      number;                                              // sum of fees deducted
  byBook:               Record<string, { count: number; revenueGross: number; revenueNet: number; title: string }>;
  byChannel:            Record<SaleChannel, { count: number; revenueGross: number; revenueNet: number }>;
  recent:               BookSale[];                                          // last 10
}

export function getSalesSummary(): SalesSummary {
  const byBook: Record<string, { count: number; revenueGross: number; revenueNet: number; title: string }> = {};
  const byChannel: Record<SaleChannel, { count: number; revenueGross: number; revenueNet: number }> = {
    "direct":    { count: 0, revenueGross: 0, revenueNet: 0 },
    "event":     { count: 0, revenueGross: 0, revenueNet: 0 },
    "gift-sale": { count: 0, revenueGross: 0, revenueNet: 0 },
    "other":     { count: 0, revenueGross: 0, revenueNet: 0 },
  };

  let totalCount = 0;
  let totalRevenueGross = 0;
  let totalRevenueNet = 0;
  let totalStripeFees = 0;

  for (const sale of BOOK_SALES) {
    const gross = effectiveAmount(sale);
    const net   = netAmountForSale(sale);
    const fee   = gross - net;

    totalCount += 1;
    totalRevenueGross += gross;
    totalRevenueNet   += net;
    totalStripeFees   += fee;

    const book = BOOKS[sale.bookSlug];
    const title = book?.title ?? sale.bookSlug;
    if (!byBook[sale.bookSlug]) {
      byBook[sale.bookSlug] = { count: 0, revenueGross: 0, revenueNet: 0, title };
    }
    byBook[sale.bookSlug].count        += 1;
    byBook[sale.bookSlug].revenueGross += gross;
    byBook[sale.bookSlug].revenueNet   += net;

    byChannel[sale.channel].count        += 1;
    byChannel[sale.channel].revenueGross += gross;
    byChannel[sale.channel].revenueNet   += net;
  }

  const recent = [...BOOK_SALES]
    .sort((a, b) => b.date.localeCompare(a.date))
    .slice(0, 10);

  return {
    totalCount,
    totalRevenueGross,
    totalRevenueNet,
    totalStripeFees,
    byBook,
    byChannel,
    recent,
  };
}

export function getSalesForBook(bookSlug: string): BookSale[] {
  return BOOK_SALES.filter((s) => s.bookSlug === bookSlug);
}

/**
 * Build a per-title revenue table that combines direct sales with an
 * attributed share of subscription revenue.
 *
 * Subscription attribution rule: any active subscription belonging to a
 * writer is split equally across that writer's books. For a single-writer
 * platform like Tintaxis at this stage, all books from `chico-montecristi`
 * receive an equal slice of the total subscription revenue.
 *
 * @param subscriptionRevenueUSD  Total subscription revenue in USD (dollars).
 *                                Pass the Stripe balance available + pending,
 *                                converted from cents to dollars.
 * @param writerSlug              Optional — restrict attribution to a single writer.
 *                                If omitted, splits across ALL books in the registry.
 */
export function getRevenueByTitle(
  subscriptionRevenueUSD: number = 0,
  writerSlug?: string,
): BookRevenue[] {
  const summary = getSalesSummary();

  const eligibleBookSlugs = Object.keys(BOOKS).filter((slug) => {
    if (!writerSlug) return true;
    return BOOKS[slug].writerSlug === writerSlug;
  });

  const perBookSubscription =
    eligibleBookSlugs.length > 0
      ? subscriptionRevenueUSD / eligibleBookSlugs.length
      : 0;

  return eligibleBookSlugs
    .map((slug) => {
      const book = BOOKS[slug];
      const direct =
        summary.byBook[slug] ??
        { count: 0, revenueGross: 0, revenueNet: 0, title: book.title };
      const subscriptionRevenue = perBookSubscription;
      return {
        slug,
        title:               book.title,
        salesCount:          direct.count,
        directRevenueGross:  direct.revenueGross,
        directRevenueNet:    direct.revenueNet,
        subscriptionRevenue,
        totalRevenue:        direct.revenueNet + subscriptionRevenue,
      };
    })
    .sort((a, b) => b.totalRevenue - a.totalRevenue);
}
