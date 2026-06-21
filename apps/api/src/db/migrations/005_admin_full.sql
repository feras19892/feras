-- Warnings system
CREATE TABLE IF NOT EXISTS warnings (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  admin_id INTEGER REFERENCES users(id),
  user_id INTEGER NOT NULL REFERENCES users(id),
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  severity TEXT DEFAULT 'normal' CHECK(severity IN ('low','normal','high','critical')),
  is_read INTEGER DEFAULT 0,
  read_at DATETIME,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX IF NOT EXISTS idx_warnings_user ON warnings(user_id);
CREATE INDEX IF NOT EXISTS idx_warnings_admin ON warnings(admin_id);
CREATE INDEX IF NOT EXISTS idx_warnings_read ON warnings(is_read);

-- Admin notes on users
CREATE TABLE IF NOT EXISTS admin_notes (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  admin_id INTEGER REFERENCES users(id),
  user_id INTEGER NOT NULL REFERENCES users(id),
  note TEXT NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX IF NOT EXISTS idx_notes_user ON admin_notes(user_id);

-- Session tracking
CREATE TABLE IF NOT EXISTS session_log (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER REFERENCES users(id),
  ip TEXT,
  user_agent TEXT,
  login_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  logout_at DATETIME
);
CREATE INDEX IF NOT EXISTS idx_session_user ON session_log(user_id);
CREATE INDEX IF NOT EXISTS idx_session_login ON session_log(login_at);

-- Audit log for DB changes
CREATE TABLE IF NOT EXISTS audit_log (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  table_name TEXT NOT NULL,
  record_id TEXT NOT NULL,
  action TEXT NOT NULL CHECK(action IN ('INSERT','UPDATE','DELETE')),
  old_values TEXT,
  new_values TEXT,
  actor_id INTEGER REFERENCES users(id),
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX IF NOT EXISTS idx_audit_table ON audit_log(table_name);
CREATE INDEX IF NOT EXISTS idx_audit_actor ON audit_log(actor_id);
CREATE INDEX IF NOT EXISTS idx_audit_created ON audit_log(created_at);

-- Add blocked_at to users for ban system
ALTER TABLE users ADD COLUMN blocked_at DATETIME;
ALTER TABLE users ADD COLUMN block_reason TEXT;

-- Add admin_comment to experiment_reports
ALTER TABLE experiment_reports ADD COLUMN admin_comment TEXT;
ALTER TABLE experiment_reports ADD COLUMN admin_graded_at DATETIME;
ALTER TABLE experiment_reports ADD COLUMN admin_graded_by INTEGER REFERENCES users(id);
