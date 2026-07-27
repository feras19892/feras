-- Name change requests table
-- Students request name changes, teachers approve/reject
CREATE TABLE IF NOT EXISTS name_change_requests (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  requested_name TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending' CHECK(status IN ('pending','approved','rejected')),
  teacher_id INTEGER REFERENCES users(id),
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  resolved_at DATETIME
);

CREATE INDEX IF NOT EXISTS idx_name_change_user ON name_change_requests(user_id);
CREATE INDEX IF NOT EXISTS idx_name_change_status ON name_change_requests(status);
