-- School refresh tokens (separate from users refresh tokens)
CREATE TABLE IF NOT EXISTS school_refresh_tokens (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  token_hash TEXT UNIQUE NOT NULL,
  school_id INTEGER NOT NULL REFERENCES schools(id) ON DELETE CASCADE,
  expires_at DATETIME NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX IF NOT EXISTS idx_school_refresh_school ON school_refresh_tokens(school_id);

-- Email change requests (for users and schools)
CREATE TABLE IF NOT EXISTS email_change_requests (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  requester_type TEXT NOT NULL CHECK(requester_type IN ('user', 'school')),
  requester_id INTEGER NOT NULL,
  current_email TEXT NOT NULL,
  requested_email TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending' CHECK(status IN ('pending', 'approved', 'rejected')),
  reviewed_by INTEGER REFERENCES users(id),
  reviewed_at DATETIME,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX IF NOT EXISTS idx_email_change_status ON email_change_requests(status);
CREATE INDEX IF NOT EXISTS idx_email_change_requester ON email_change_requests(requester_type, requester_id);
