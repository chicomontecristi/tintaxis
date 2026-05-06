-- ─── EMAIL RETRY QUEUE ────────────────────────────────────────────────────────
-- Track failed welcome emails and other critical sends for manual recovery.
-- Used when sendWelcomeEmail() fails in the Stripe webhook.

CREATE TABLE IF NOT EXISTS email_retry_queue (
  id BIGSERIAL PRIMARY KEY,

  -- Email details
  recipient_email TEXT NOT NULL,
  recipient_name TEXT,
  email_type TEXT NOT NULL CHECK (email_type IN ('welcome', 'subscription', 'payment_failed', 'reset', 'other')),

  -- Context
  reader_id UUID REFERENCES readers(id) ON DELETE CASCADE,
  stripe_customer_id TEXT,
  subscription_tier TEXT,

  -- Error details
  error_message TEXT,
  error_timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

  -- Retry tracking
  retry_count INT DEFAULT 0,
  max_retries INT DEFAULT 3,
  next_retry_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() + INTERVAL '15 minutes',
  last_retry_at TIMESTAMP WITH TIME ZONE,

  -- Status
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'retry_scheduled', 'sent', 'failed_permanently', 'manual_intervention')),
  resolved_at TIMESTAMP WITH TIME ZONE,
  resolved_by TEXT, -- admin name or automation

  -- Metadata for context
  metadata JSONB DEFAULT '{}',

  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Index for efficient querying of failed emails needing retry
CREATE INDEX IF NOT EXISTS idx_email_retry_queue_pending ON email_retry_queue(status, next_retry_at)
  WHERE status IN ('pending', 'retry_scheduled');

-- Index for finding emails by recipient
CREATE INDEX IF NOT EXISTS idx_email_retry_queue_recipient ON email_retry_queue(recipient_email);

-- Index for finding emails by reader
CREATE INDEX IF NOT EXISTS idx_email_retry_queue_reader ON email_retry_queue(reader_id);

-- Trigger to auto-update updated_at
CREATE OR REPLACE FUNCTION update_email_retry_queue_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER email_retry_queue_update_timestamp
  BEFORE UPDATE ON email_retry_queue
  FOR EACH ROW
  EXECUTE FUNCTION update_email_retry_queue_timestamp();

-- ─── ROW LEVEL SECURITY ───────────────────────────────────────────────────────
-- Admin-only access: Only authenticated users with admin role can view/manage
-- (Users can't see other users' failed emails)

ALTER TABLE email_retry_queue ENABLE ROW LEVEL SECURITY;

-- Admin can view all failed emails
CREATE POLICY "Admins can view all failed emails"
  ON email_retry_queue
  FOR SELECT
  USING (
    auth.jwt() ->> 'role' = 'admin'
    OR EXISTS (
      SELECT 1 FROM readers
      WHERE readers.id = auth.uid()
      AND readers.role = 'author'
      AND readers.id = email_retry_queue.reader_id
    )
  );

-- Only admins can insert/update/delete
CREATE POLICY "Only admins can manage failed emails"
  ON email_retry_queue
  FOR INSERT
  WITH CHECK (auth.jwt() ->> 'role' = 'admin');

CREATE POLICY "Only admins can update failed emails"
  ON email_retry_queue
  FOR UPDATE
  USING (auth.jwt() ->> 'role' = 'admin')
  WITH CHECK (auth.jwt() ->> 'role' = 'admin');

CREATE POLICY "Only admins can delete failed emails"
  ON email_retry_queue
  FOR DELETE
  USING (auth.jwt() ->> 'role' = 'admin');
