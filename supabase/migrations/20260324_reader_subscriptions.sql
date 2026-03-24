-- ─── PER-WRITER READER SUBSCRIPTIONS ─────────────────────────────────────────
-- Readers subscribe to individual writers, not the whole platform.
-- One reader can subscribe to multiple writers at different tiers.
--
-- Run this in the Supabase SQL Editor (Dashboard → SQL Editor → New Query).

-- 1. Create the reader_subscriptions table
CREATE TABLE IF NOT EXISTS reader_subscriptions (
  id                      UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  reader_id               UUID NOT NULL REFERENCES readers(id) ON DELETE CASCADE,
  writer_slug             TEXT NOT NULL,
  tier                    TEXT NOT NULL CHECK (tier IN ('codex', 'scribe', 'archive', 'chronicler')),
  stripe_subscription_id  TEXT,
  active                  BOOLEAN NOT NULL DEFAULT true,
  created_at              TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at              TIMESTAMPTZ NOT NULL DEFAULT now(),

  -- One subscription per reader per writer
  UNIQUE (reader_id, writer_slug)
);

-- 2. Index for fast lookups
CREATE INDEX IF NOT EXISTS idx_reader_subs_reader ON reader_subscriptions(reader_id);
CREATE INDEX IF NOT EXISTS idx_reader_subs_writer ON reader_subscriptions(writer_slug);
CREATE INDEX IF NOT EXISTS idx_reader_subs_stripe ON reader_subscriptions(stripe_subscription_id);

-- 3. Auto-update updated_at
CREATE OR REPLACE FUNCTION update_reader_subscriptions_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_reader_subscriptions_updated_at
  BEFORE UPDATE ON reader_subscriptions
  FOR EACH ROW
  EXECUTE FUNCTION update_reader_subscriptions_updated_at();

-- 4. Enable RLS (service role key bypasses this)
ALTER TABLE reader_subscriptions ENABLE ROW LEVEL SECURITY;

-- 5. Migrate existing subscriptions (readers who already have a tier)
-- Maps their current global tier to chico-montecristi since all current books are his.
INSERT INTO reader_subscriptions (reader_id, writer_slug, tier, stripe_subscription_id, active)
SELECT
  id,
  'chico-montecristi',
  tier,
  stripe_subscription_id,
  active
FROM readers
WHERE tier IS NOT NULL
ON CONFLICT (reader_id, writer_slug) DO NOTHING;
