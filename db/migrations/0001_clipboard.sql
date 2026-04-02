-- Tool C (Online Clipboard) cloud persistence schema
-- Apply with Wrangler D1 migrations, for example:
--   wrangler d1 migrations apply <DB_NAME>

CREATE TABLE IF NOT EXISTS clipboard_rooms (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  name TEXT NOT NULL,
  description TEXT NOT NULL DEFAULT '',
  is_e2ee INTEGER NOT NULL DEFAULT 0,
  created_at INTEGER NOT NULL,
  updated_at INTEGER NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_clipboard_rooms_user_updated
  ON clipboard_rooms (user_id, updated_at DESC);

CREATE TABLE IF NOT EXISTS clipboard_room_messages (
  room_id TEXT NOT NULL,
  user_id TEXT NOT NULL,
  payload_json TEXT NOT NULL,
  updated_at INTEGER NOT NULL,
  PRIMARY KEY (room_id, user_id)
);

CREATE INDEX IF NOT EXISTS idx_clipboard_room_messages_user_updated
  ON clipboard_room_messages (user_id, updated_at DESC);
