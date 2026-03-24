// ─── TINTAXIS — DATABASE HELPERS ─────────────────────────────────────────────
// All Supabase operations go through here. Server-side only.

import { supabase } from "./supabase";
import type { ReaderRow, ReaderTier, AuthorPlan, SignalRow, WhisperRow, AnnotationRow, ReaderSubscriptionRow } from "./db-types";

// ── Readers ───────────────────────────────────────────────────────────────────

/**
 * Upsert a reader after a successful checkout.
 * Creates a new row if the email doesn't exist; updates if it does.
 */
export async function upsertReader(params: {
  email:                  string;
  name?:                  string;
  stripeCustomerId?:      string;
  stripeSubscriptionId?:  string;
  tier?:                  ReaderTier | null;
  plan?:                  AuthorPlan | null;
  role?:                  "reader" | "author";
  active?:                boolean;
}): Promise<ReaderRow | null> {
  const { data, error } = await supabase
    .from("readers")
    .upsert(
      {
        email:                   params.email.toLowerCase().trim(),
        name:                    params.name             ?? null,
        stripe_customer_id:      params.stripeCustomerId ?? null,
        stripe_subscription_id:  params.stripeSubscriptionId ?? null,
        tier:                    params.tier ?? null,
        plan:                    params.plan ?? null,
        role:                    params.role ?? "reader",
        active:                  params.active ?? true,
        updated_at:              new Date().toISOString(),
      },
      { onConflict: "email", ignoreDuplicates: false }
    )
    .select()
    .single();

  if (error) {
    console.error("[db] upsertReader error:", error.message);
    return null;
  }
  return data;
}

/**
 * Look up a reader by their Stripe customer ID.
 * Used in webhook handlers.
 */
export async function getReaderByCustomerId(customerId: string): Promise<ReaderRow | null> {
  const { data, error } = await supabase
    .from("readers")
    .select("*")
    .eq("stripe_customer_id", customerId)
    .single();

  if (error) {
    if (error.code !== "PGRST116") { // not-found is expected
      console.error("[db] getReaderByCustomerId error:", error.message);
    }
    return null;
  }
  return data;
}

/**
 * Look up a reader by their Stripe subscription ID.
 */
export async function getReaderBySubscriptionId(subscriptionId: string): Promise<ReaderRow | null> {
  const { data, error } = await supabase
    .from("readers")
    .select("*")
    .eq("stripe_subscription_id", subscriptionId)
    .single();

  if (error) {
    if (error.code !== "PGRST116") {
      console.error("[db] getReaderBySubscriptionId error:", error.message);
    }
    return null;
  }
  return data;
}

/**
 * Look up a reader by email.
 * Used in session refresh.
 */
export async function getReaderByEmail(email: string): Promise<ReaderRow | null> {
  const { data, error } = await supabase
    .from("readers")
    .select("*")
    .eq("email", email.toLowerCase().trim())
    .single();

  if (error) {
    if (error.code !== "PGRST116") {
      console.error("[db] getReaderByEmail error:", error.message);
    }
    return null;
  }
  return data;
}

/**
 * Update subscription state (tier, active, subscriptionId) by customer ID.
 * Called from webhook on subscription.updated / subscription.deleted.
 */
export async function updateReaderSubscription(
  customerId: string,
  params: {
    stripeSubscriptionId?: string | null;
    tier?:                 ReaderTier | null;
    active?:               boolean;
  }
): Promise<void> {
  const { error } = await supabase
    .from("readers")
    .update({
      ...(params.stripeSubscriptionId !== undefined
        ? { stripe_subscription_id: params.stripeSubscriptionId }
        : {}),
      ...(params.tier !== undefined ? { tier: params.tier }     : {}),
      ...(params.active !== undefined ? { active: params.active } : {}),
      updated_at: new Date().toISOString(),
    })
    .eq("stripe_customer_id", customerId);

  if (error) {
    console.error("[db] updateReaderSubscription error:", error.message);
  }
}

/**
 * Deactivate a reader when their subscription is cancelled.
 */
export async function deactivateReader(customerId: string): Promise<void> {
  await updateReaderSubscription(customerId, {
    active: false,
    tier:   null,
    stripeSubscriptionId: null,
  });
}

// ── Per-Writer Reader Subscriptions ──────────────────────────────────────────

/**
 * Get a reader's active subscription tier for a specific writer.
 * Returns null if no active subscription exists.
 */
export async function getReaderTierForWriter(
  readerId:   string,
  writerSlug: string
): Promise<ReaderTier | null> {
  const { data, error } = await supabase
    .from("reader_subscriptions")
    .select("tier")
    .eq("reader_id", readerId)
    .eq("writer_slug", writerSlug)
    .eq("active", true)
    .single();

  if (error) {
    if (error.code !== "PGRST116") {
      console.error("[db] getReaderTierForWriter error:", error.message);
    }
    return null;
  }
  return data?.tier ?? null;
}

/**
 * Get all active subscriptions for a reader (across all writers).
 */
export async function getReaderSubscriptions(
  readerId: string
): Promise<ReaderSubscriptionRow[]> {
  const { data, error } = await supabase
    .from("reader_subscriptions")
    .select("*")
    .eq("reader_id", readerId)
    .eq("active", true)
    .order("created_at", { ascending: false });

  if (error) {
    console.error("[db] getReaderSubscriptions error:", error.message);
    return [];
  }
  return data ?? [];
}

/**
 * Upsert a reader's subscription for a specific writer.
 * Creates or updates (one subscription per reader per writer).
 */
export async function upsertReaderSubscription(params: {
  readerId:              string;
  writerSlug:            string;
  tier:                  ReaderTier;
  stripeSubscriptionId?: string | null;
  active?:               boolean;
}): Promise<ReaderSubscriptionRow | null> {
  const { data, error } = await supabase
    .from("reader_subscriptions")
    .upsert(
      {
        reader_id:              params.readerId,
        writer_slug:            params.writerSlug,
        tier:                   params.tier,
        stripe_subscription_id: params.stripeSubscriptionId ?? null,
        active:                 params.active ?? true,
        updated_at:             new Date().toISOString(),
      },
      { onConflict: "reader_id,writer_slug", ignoreDuplicates: false }
    )
    .select()
    .single();

  if (error) {
    console.error("[db] upsertReaderSubscription error:", error.message);
    return null;
  }
  return data;
}

/**
 * Deactivate a per-writer subscription by its Stripe subscription ID.
 * Called from webhook on subscription.deleted.
 */
export async function deactivateReaderSubscription(
  stripeSubscriptionId: string
): Promise<void> {
  const { error } = await supabase
    .from("reader_subscriptions")
    .update({ active: false, updated_at: new Date().toISOString() })
    .eq("stripe_subscription_id", stripeSubscriptionId);

  if (error) {
    console.error("[db] deactivateReaderSubscription error:", error.message);
  }
}

/**
 * Update a per-writer subscription's tier or active state by Stripe subscription ID.
 * Called from webhook on subscription.updated.
 */
export async function updateReaderSubscriptionByStripe(
  stripeSubscriptionId: string,
  params: {
    tier?:   ReaderTier;
    active?: boolean;
  }
): Promise<void> {
  const { error } = await supabase
    .from("reader_subscriptions")
    .update({
      ...(params.tier !== undefined ? { tier: params.tier } : {}),
      ...(params.active !== undefined ? { active: params.active } : {}),
      updated_at: new Date().toISOString(),
    })
    .eq("stripe_subscription_id", stripeSubscriptionId);

  if (error) {
    console.error("[db] updateReaderSubscriptionByStripe error:", error.message);
  }
}

/**
 * Get subscription stats for a specific writer (author dashboard).
 */
export async function getWriterSubscriptionStats(writerSlug: string): Promise<{
  total: number;
  active: number;
  byTier: Record<string, number>;
}> {
  const { data, error } = await supabase
    .from("reader_subscriptions")
    .select("tier, active")
    .eq("writer_slug", writerSlug);

  if (error) {
    console.error("[db] getWriterSubscriptionStats error:", error.message);
    return { total: 0, active: 0, byTier: {} };
  }

  const rows = data ?? [];
  const active = rows.filter((r) => r.active).length;
  const byTier: Record<string, number> = {};

  for (const row of rows) {
    if (row.active && row.tier) {
      byTier[row.tier] = (byTier[row.tier] ?? 0) + 1;
    }
  }

  return { total: rows.length, active, byTier };
}

// ── Purchases (one-time) ─────────────────────────────────────────────────────

/**
 * Record a one-time chapter purchase.
 */
export async function recordPurchase(params: {
  readerId:         string;
  chapterSlug:      string;
  plan:             string;
  stripeSessionId:  string;
  amount:           number | null;
  writerSlug?:      string | null;
}): Promise<void> {
  const { error } = await supabase
    .from("purchases")
    .insert({
      reader_id:         params.readerId,
      chapter_slug:      params.chapterSlug,
      plan:              params.plan,
      stripe_session_id: params.stripeSessionId,
      amount:            params.amount,
      writer_slug:       params.writerSlug ?? null,
    });

  if (error) {
    console.error("[db] recordPurchase error:", error.message);
  }
}

/**
 * Check if a reader has purchased (and kept) a chapter.
 */
export async function hasPurchasedChapter(
  readerId:    string,
  chapterSlug: string
): Promise<boolean> {
  const { count, error } = await supabase
    .from("purchases")
    .select("id", { count: "exact", head: true })
    .eq("reader_id", readerId)
    .eq("chapter_slug", chapterSlug)
    .eq("plan", "keep");

  if (error) {
    console.error("[db] hasPurchasedChapter error:", error.message);
    return false;
  }
  return (count ?? 0) > 0;
}

// ── Signals ───────────────────────────────────────────────────────────────────

/**
 * Persist a reader's Signal Ink question to the database.
 */
export async function insertSignal(params: {
  chapterSlug:   string;
  chapterTitle?: string | null;
  selectedText?: string | null;
  question:      string;
  readerEmail?:  string | null;
}): Promise<SignalRow | null> {
  const { data, error } = await supabase
    .from("signals")
    .insert({
      chapter_slug:  params.chapterSlug,
      chapter_title: params.chapterTitle ?? null,
      selected_text: params.selectedText ?? null,
      question:      params.question,
      reader_email:  params.readerEmail ?? null,
      answered:      false,
    })
    .select()
    .single();

  if (error) {
    console.error("[db] insertSignal error:", error.message);
    return null;
  }
  return data;
}

/**
 * Fetch all signals, newest first.
 */
export async function listSignals(): Promise<SignalRow[]> {
  const { data, error } = await supabase
    .from("signals")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) {
    console.error("[db] listSignals error:", error.message);
    return [];
  }
  return data ?? [];
}

/**
 * Record the author's reply to a signal.
 */
export async function replyToSignal(
  id:    string,
  reply: string
): Promise<boolean> {
  const { error } = await supabase
    .from("signals")
    .update({ answered: true, reply, updated_at: new Date().toISOString() })
    .eq("id", id);

  if (error) {
    console.error("[db] replyToSignal error:", error.message);
    return false;
  }
  return true;
}

// ── Author stats ──────────────────────────────────────────────────────────────

/**
 * Returns reader counts broken down by tier and active state.
 */
export async function getReaderStats(): Promise<{
  total: number;
  active: number;
  byTier: Record<string, number>;
}> {
  const { data, error } = await supabase
    .from("readers")
    .select("tier, active");

  if (error) {
    console.error("[db] getReaderStats error:", error.message);
    return { total: 0, active: 0, byTier: {} };
  }

  const rows = data ?? [];
  const active = rows.filter((r) => r.active).length;
  const byTier: Record<string, number> = {};

  for (const row of rows) {
    if (row.active && row.tier) {
      byTier[row.tier] = (byTier[row.tier] ?? 0) + 1;
    }
  }

  return { total: rows.length, active, byTier };
}

// ── Whispers ───────────────────────────────────────────────────────────────────

/**
 * Insert an author whisper anchored to a chapter passage.
 */
export async function insertWhisper(params: {
  chapterSlug:  string;
  chapterTitle: string | null;
  anchorText:   string;
  content:      string;
  authorName?:  string;
  whisperType?: "whisper" | "anchor";
}): Promise<WhisperRow | null> {
  const { data, error } = await supabase
    .from("whispers")
    .insert({
      chapter_slug:  params.chapterSlug,
      chapter_title: params.chapterTitle,
      anchor_text:   params.anchorText,
      content:       params.content,
      author_name:   params.authorName ?? "Chico Montecristi",
      whisper_type:  params.whisperType ?? "whisper",
    })
    .select()
    .single();

  if (error) {
    console.error("[db] insertWhisper error:", error.message);
    return null;
  }
  return data as WhisperRow;
}

/**
 * List whispers for a specific chapter, ordered by creation date.
 */
export async function listWhispersByChapter(chapterSlug: string): Promise<WhisperRow[]> {
  const { data, error } = await supabase
    .from("whispers")
    .select("*")
    .eq("chapter_slug", chapterSlug)
    .order("created_at", { ascending: true });

  if (error) {
    console.error("[db] listWhispersByChapter error:", error.message);
    return [];
  }
  return (data ?? []) as WhisperRow[];
}

/**
 * List all whispers across all chapters (author dashboard view).
 */
export async function listAllWhispers(): Promise<WhisperRow[]> {
  const { data, error } = await supabase
    .from("whispers")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) {
    console.error("[db] listAllWhispers error:", error.message);
    return [];
  }
  return (data ?? []) as WhisperRow[];
}

// ── Signal reply — reader-facing ──────────────────────────────────────────────

/**
 * Get the author's answered reply to a specific reader's signal question.
 * Returns null if no answered reply exists.
 */
export async function getSignalReply(
  chapterSlug: string,
  readerEmail: string
): Promise<{ reply: string; question: string; selectedText: string | null } | null> {
  const { data, error } = await supabase
    .from("signals")
    .select("reply, question, selected_text")
    .eq("chapter_slug", chapterSlug)
    .eq("reader_email", readerEmail)
    .eq("answered", true)
    .order("created_at", { ascending: false })
    .limit(1)
    .single();

  if (error || !data || !data.reply) return null;

  return {
    reply:        data.reply,
    question:     data.question,
    selectedText: data.selected_text ?? null,
  };
}

/**
 * Delete a whisper by ID.
 */
export async function deleteWhisper(id: string): Promise<boolean> {
  const { error } = await supabase
    .from("whispers")
    .delete()
    .eq("id", id);

  if (error) {
    console.error("[db] deleteWhisper error:", error.message);
    return false;
  }
  return true;
}

// ─── PHASE 7 — READER NATIVE AUTH ────────────────────────────────────────────

/**
 * Create a new reader account with a hashed password.
 * Returns null if the email is already registered.
 */
export async function createReaderWithPassword(params: {
  email:        string;
  passwordHash: string;
  name?:        string;
  readingName?: string;
}): Promise<ReaderRow | null> {
  const { data, error } = await supabase
    .from("readers")
    .insert({
      email:         params.email.toLowerCase().trim(),
      password_hash: params.passwordHash,
      name:          params.name        ?? null,
      reading_name:  params.readingName ?? null,
      role:          "reader",
      active:        false, // becomes true when they subscribe
      updated_at:    new Date().toISOString(),
    })
    .select()
    .single();

  if (error) {
    console.error("[db] createReaderWithPassword error:", error.message);
    return null;
  }
  return data;
}

/**
 * Fetch the stored password hash for a reader.
 * Returns null if reader not found or has no password (Stripe-only reader).
 */
export async function getReaderPasswordHash(
  email: string
): Promise<{ id: string; passwordHash: string } | null> {
  const { data, error } = await supabase
    .from("readers")
    .select("id, password_hash")
    .eq("email", email.toLowerCase().trim())
    .single();

  if (error || !data || !data.password_hash) return null;
  return { id: data.id, passwordHash: data.password_hash };
}

// ─── PHASE 7 — ANNOTATIONS ───────────────────────────────────────────────────

/**
 * Persist an annotation to Supabase.
 */
export async function insertAnnotation(params: {
  readerId:       string;
  chapterSlug:    string;
  paragraphIndex: number;
  startOffset:    number;
  endOffset:      number;
  selectedText:   string;
  note?:          string;
  inkType:        string;
  isPublic:       boolean;
}): Promise<AnnotationRow | null> {
  const { data, error } = await supabase
    .from("annotations")
    .insert({
      reader_id:       params.readerId,
      chapter_slug:    params.chapterSlug,
      paragraph_index: params.paragraphIndex,
      start_offset:    params.startOffset,
      end_offset:      params.endOffset,
      selected_text:   params.selectedText,
      note:            params.note ?? null,
      ink_type:        params.inkType,
      is_public:       params.isPublic,
      updated_at:      new Date().toISOString(),
    })
    .select()
    .single();

  if (error) {
    console.error("[db] insertAnnotation error:", error.message);
    return null;
  }
  return data;
}

/**
 * List all annotations by a reader for a given chapter.
 */
export async function listAnnotationsByReader(
  readerId:    string,
  chapterSlug: string
): Promise<AnnotationRow[]> {
  const { data, error } = await supabase
    .from("annotations")
    .select("*")
    .eq("reader_id", readerId)
    .eq("chapter_slug", chapterSlug)
    .order("created_at", { ascending: true });

  if (error) {
    console.error("[db] listAnnotationsByReader error:", error.message);
    return [];
  }
  return data ?? [];
}

/**
 * Update the note on an annotation.
 * Scoped to readerId so a reader can only update their own.
 */
export async function updateAnnotationNote(
  id:       string,
  readerId: string,
  note:     string
): Promise<boolean> {
  const { error } = await supabase
    .from("annotations")
    .update({ note, updated_at: new Date().toISOString() })
    .eq("id", id)
    .eq("reader_id", readerId);

  if (error) {
    console.error("[db] updateAnnotationNote error:", error.message);
    return false;
  }
  return true;
}

/**
 * Delete an annotation.
 * Scoped to readerId so a reader can only delete their own.
 */
export async function deleteAnnotation(
  id:       string,
  readerId: string
): Promise<boolean> {
  const { error } = await supabase
    .from("annotations")
    .delete()
    .eq("id", id)
    .eq("reader_id", readerId);

  if (error) {
    console.error("[db] deleteAnnotation error:", error.message);
    return false;
  }
  return true;
}

/**
 * Fetch ALL annotations for a reader across all chapters.
 * Used on the account/vault page to show reading history.
 */
export async function listAllAnnotationsByReader(
  readerId: string
): Promise<AnnotationRow[]> {
  const { data, error } = await supabase
    .from("annotations")
    .select("*")
    .eq("reader_id", readerId)
    .order("created_at", { ascending: false });

  if (error) {
    console.error("[db] listAllAnnotationsByReader error:", error.message);
    return [];
  }
  return data ?? [];
}

/**
 * Update a reader's password hash by email.
 * Used by the password reset flow.
 */
export async function updateReaderPassword(
  email: string,
  newPasswordHash: string
): Promise<boolean> {
  const { error } = await supabase
    .from("readers")
    .update({ password_hash: newPasswordHash, updated_at: new Date().toISOString() })
    .eq("email", email.toLowerCase().trim());

  if (error) {
    console.error("[db] updateReaderPassword error:", error.message);
    return false;
  }
  return true;
}
