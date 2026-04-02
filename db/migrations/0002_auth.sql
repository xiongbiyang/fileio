-- Basic auth users table (email + password hash)
-- Apply with Wrangler D1 migrations, for example:
--   wrangler d1 migrations apply <DB_NAME>

CREATE TABLE IF NOT EXISTS auth_users (
  id TEXT PRIMARY KEY,
  email TEXT NOT NULL UNIQUE,
  password_hash TEXT NOT NULL,
  created_at INTEGER NOT NULL,
  updated_at INTEGER NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_auth_users_email
  ON auth_users (email);
