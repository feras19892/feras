-- Complaints system — hierarchical routing (student→teacher→school→admin)
CREATE TABLE IF NOT EXISTS complaints (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  from_user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  from_role TEXT NOT NULL,
  from_name TEXT NOT NULL,
  target_role TEXT NOT NULL,
  target_id INTEGER,
  category TEXT NOT NULL,
  subject TEXT NOT NULL,
  body TEXT NOT NULL,
  priority TEXT DEFAULT 'normal',
  status TEXT DEFAULT 'open',
  assigned_to INTEGER REFERENCES users(id),
  school_id INTEGER,
  resolved_at DATETIME,
  resolution_note TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_complaints_target ON complaints(target_role, target_id, status);
CREATE INDEX IF NOT EXISTS idx_complaints_from ON complaints(from_user_id);
CREATE INDEX IF NOT EXISTS idx_complaints_school ON complaints(school_id);
CREATE INDEX IF NOT EXISTS idx_complaints_status ON complaints(status, priority);

CREATE TABLE IF NOT EXISTS complaint_log (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  complaint_id INTEGER NOT NULL REFERENCES complaints(id) ON DELETE CASCADE,
  action TEXT NOT NULL,
  from_status TEXT,
  to_status TEXT,
  actor_id INTEGER REFERENCES users(id),
  actor_name TEXT,
  note TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_complaint_log_cid ON complaint_log(complaint_id);
