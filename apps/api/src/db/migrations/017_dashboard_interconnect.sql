-- ─── Dashboard Interconnect System ───
-- Announcements, Deadlines, Class Freeze, Plagiarism, Auto-escalation, Capacity requests

-- ─── Announcements ───
CREATE TABLE IF NOT EXISTS announcements (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  author_type TEXT NOT NULL CHECK(author_type IN ('teacher','school','admin')),
  author_id INTEGER NOT NULL,
  author_name TEXT NOT NULL,
  scope TEXT NOT NULL CHECK(scope IN ('class','school','global')),
  class_id TEXT REFERENCES classes(id) ON DELETE CASCADE,
  school_id INTEGER REFERENCES schools(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  is_pinned INTEGER DEFAULT 0,
  expires_at DATETIME,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX IF NOT EXISTS idx_announcements_class ON announcements(class_id);
CREATE INDEX IF NOT EXISTS idx_announcements_school ON announcements(school_id);
CREATE INDEX IF NOT EXISTS idx_announcements_scope ON announcements(scope);

-- ─── Experiment Deadlines ───
CREATE TABLE IF NOT EXISTS experiment_deadlines (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  class_id TEXT NOT NULL REFERENCES classes(id) ON DELETE CASCADE,
  experiment_name TEXT NOT NULL,
  experiment_id TEXT,
  due_at DATETIME NOT NULL,
  created_by INTEGER NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(class_id, experiment_name)
);
CREATE INDEX IF NOT EXISTS idx_deadlines_class ON experiment_deadlines(class_id);
CREATE INDEX IF NOT EXISTS idx_deadlines_due ON experiment_deadlines(due_at);

-- ─── Class Freeze ───
-- Add is_frozen column to classes
ALTER TABLE classes ADD COLUMN is_frozen INTEGER DEFAULT 0;
ALTER TABLE classes ADD COLUMN frozen_reason TEXT;
ALTER TABLE classes ADD COLUMN frozen_at DATETIME;
ALTER TABLE classes ADD COLUMN frozen_by INTEGER;

-- ─── Plagiarism Records ───
CREATE TABLE IF NOT EXISTS plagiarism_flags (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  class_id TEXT NOT NULL REFERENCES classes(id) ON DELETE CASCADE,
  experiment_name TEXT NOT NULL,
  report1_id INTEGER NOT NULL REFERENCES experiment_reports(id) ON DELETE CASCADE,
  report2_id INTEGER NOT NULL REFERENCES experiment_reports(id) ON DELETE CASCADE,
  student1_name TEXT NOT NULL,
  student2_name TEXT NOT NULL,
  similarity_score INTEGER NOT NULL,
  matched_fields TEXT NOT NULL,
  detected_by INTEGER NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending' CHECK(status IN ('pending','reviewed','confirmed','dismissed')),
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX IF NOT EXISTS idx_plagiarism_class ON plagiarism_flags(class_id);
CREATE INDEX IF NOT EXISTS idx_plagiarism_status ON plagiarism_flags(status);

-- ─── Auto-escalation timers on approval_requests ───
ALTER TABLE approval_requests ADD COLUMN escalation_deadline DATETIME;
ALTER TABLE approval_requests ADD COLUMN auto_escalated_at DATETIME;

-- ─── Capacity Increase Requests ───
CREATE TABLE IF NOT EXISTS capacity_requests (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  school_id INTEGER NOT NULL REFERENCES schools(id) ON DELETE CASCADE,
  school_name TEXT NOT NULL,
  current_max_students INTEGER NOT NULL,
  current_max_teachers INTEGER NOT NULL,
  requested_max_students INTEGER,
  requested_max_teachers INTEGER,
  reason TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending' CHECK(status IN ('pending','approved','rejected')),
  reviewed_by INTEGER,
  reviewed_at DATETIME,
  admin_response TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX IF NOT EXISTS idx_capacity_school ON capacity_requests(school_id);
CREATE INDEX IF NOT EXISTS idx_capacity_status ON capacity_requests(status);

-- ─── System Alerts ───
CREATE TABLE IF NOT EXISTS system_alerts (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  type TEXT NOT NULL,
  severity TEXT NOT NULL CHECK(severity IN ('info','warning','critical')),
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  target_type TEXT NOT NULL CHECK(target_type IN ('admin','school','teacher','student','all')),
  target_id INTEGER,
  is_read INTEGER DEFAULT 0,
  is_resolved INTEGER DEFAULT 0,
  resolved_by INTEGER,
  resolved_at DATETIME,
  metadata TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX IF NOT EXISTS idx_alerts_target ON system_alerts(target_type, target_id, is_read);
CREATE INDEX IF NOT EXISTS idx_alerts_severity ON system_alerts(severity, is_resolved);

-- ─── Emergency Controls (system_settings extension) ───
-- These use the existing system_settings table with keys:
-- 'stop_registration', 'maintenance_mode', 'freeze_all_classes'
-- No new table needed — just key-value entries inserted at runtime.

-- ─── Chat spam tracking ───
CREATE TABLE IF NOT EXISTS chat_spam_tracker (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  class_id TEXT NOT NULL REFERENCES classes(id) ON DELETE CASCADE,
  message_count INTEGER DEFAULT 1,
  last_message_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  muted_until DATETIME,
  UNIQUE(user_id, class_id)
);
CREATE INDEX IF NOT EXISTS idx_spam_user_class ON chat_spam_tracker(user_id, class_id);
