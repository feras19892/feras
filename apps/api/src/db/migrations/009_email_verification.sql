CREATE TABLE IF NOT EXISTS email_verification_codes (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  code_hash TEXT NOT NULL,
  attempts INTEGER DEFAULT 0,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  expires_at DATETIME NOT NULL,
  used_at DATETIME
);

CREATE INDEX IF NOT EXISTS idx_email_verif_user ON email_verification_codes(user_id);
CREATE INDEX IF NOT EXISTS idx_email_verif_expires ON email_verification_codes(expires_at);
