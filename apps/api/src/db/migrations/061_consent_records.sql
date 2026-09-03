CREATE TABLE IF NOT EXISTS consent_records (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  type TEXT NOT NULL,
  version TEXT NOT NULL,
  ip TEXT,
  user_agent TEXT,
  given_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_consent_records_user_id ON consent_records(user_id);
