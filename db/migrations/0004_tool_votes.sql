-- Tool request votes and suggestions
-- Apply with Wrangler D1 migrations:
--   wrangler d1 migrations apply <DB_NAME>

CREATE TABLE IF NOT EXISTS tool_votes (
  id TEXT PRIMARY KEY,
  ip_hash TEXT NOT NULL,
  votes TEXT NOT NULL DEFAULT '[]', -- JSON array of voted tool keys
  tool_name TEXT NOT NULL DEFAULT '',
  detail TEXT NOT NULL DEFAULT '',
  email TEXT NOT NULL DEFAULT '',
  locale TEXT NOT NULL DEFAULT 'en',
  created_at INTEGER NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_tool_votes_created
  ON tool_votes (created_at DESC);

-- Contact form submissions
CREATE TABLE IF NOT EXISTS contact_submissions (
  id TEXT PRIMARY KEY,
  email TEXT NOT NULL,
  name TEXT NOT NULL DEFAULT '',
  message TEXT NOT NULL,
  created_at INTEGER NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_contact_submissions_created
  ON contact_submissions (created_at DESC);
