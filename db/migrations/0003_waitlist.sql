-- Pro waitlist leads segmented by target plan
-- Apply with Wrangler D1 migrations:
--   wrangler d1 migrations apply <DB_NAME>

CREATE TABLE IF NOT EXISTS pro_waitlist_leads (
  id TEXT PRIMARY KEY,
  email TEXT NOT NULL,
  plan TEXT NOT NULL, -- monthly | yearly | lifetime
  locale TEXT NOT NULL DEFAULT 'en',
  source TEXT NOT NULL DEFAULT 'pro-waitlist',
  created_at INTEGER NOT NULL,
  updated_at INTEGER NOT NULL,
  UNIQUE(email, plan)
);

CREATE INDEX IF NOT EXISTS idx_pro_waitlist_plan_created
  ON pro_waitlist_leads (plan, created_at DESC);
