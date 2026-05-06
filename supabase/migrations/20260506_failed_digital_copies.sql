-- ─── FAILED DIGITAL COPIES ────────────────────────────────────────────────────
-- Track digital copy delivery failures for admin intervention.
-- When a Stripe checkout includes a digital_copy plan but delivery fails,
-- record it here so admins can investigate and manually resend.

CREATE TABLE IF NOT EXISTS failed_digital_copies (
  id BIGSERIAL PRIMARY KEY,

  -- Order/Session details
  stripe_session_id TEXT NOT NULL UNIQUE,
  stripe_customer_id TEXT,

  -- What was supposed to be delivered
  book_slug TEXT NOT NULL,
  buyer_email TEXT NOT NULL,
  buyer_name TEXT,

  -- Why it failed
  error_type TEXT CHECK (error_type IN ('missing_data', 'delivery_failed', 'email_rejected', 'unknown')),
  error_message TEXT,

  -- Attempted delivery
  delivery_attempted_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  delivery_method TEXT DEFAULT 'resend_api',

  -- Retry tracking
  retry_count INT DEFAULT 0,
  max_retries INT DEFAULT 3,
  last_retry_at TIMESTAMP WITH TIME ZONE,
  next_retry_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() + INTERVAL '1 hour',

  -- Status
  status TEXT NOT NULL DEFAULT 'failed' CHECK (status IN ('failed', 'retry_scheduled', 'resolved_manually', 'resent_successfully')),
  resolved_at TIMESTAMP WITH TIME ZONE,
  resolved_by TEXT, -- admin name or automation

  -- Admin notes
  admin_notes TEXT,

  -- Metadata
  metadata JSONB DEFAULT '{}',

  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Index for finding unresolved failures
CREATE INDEX IF NOT EXISTS idx_failed_digital_copies_pending ON failed_digital_copies(status)
  WHERE status IN ('failed', 'retry_scheduled');

-- Index for finding failures by book
CREATE INDEX IF NOT EXISTS idx_failed_digital_copies_book ON failed_digital_copies(book_slug);

-- Index for finding failures by customer
CREATE INDEX IF NOT EXISTS idx_failed_digital_copies_customer ON failed_digital_copies(stripe_customer_id);

-- Index for finding failures by email
CREATE INDEX IF NOT EXISTS idx_failed_digital_copies_email ON failed_digital_copies(buyer_email);

-- Trigger to auto-update updated_at
CREATE OR REPLACE FUNCTION update_failed_digital_copies_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER failed_digital_copies_update_timestamp
  BEFORE UPDATE ON failed_digital_copies
  FOR EACH ROW
  EXECUTE FUNCTION update_failed_digital_copies_timestamp();
