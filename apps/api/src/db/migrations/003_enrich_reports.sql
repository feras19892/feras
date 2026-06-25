-- Migration 003: Enrich experiment_reports + new tables

-- ─── 1. Add 12 columns to experiment_reports ───
ALTER TABLE experiment_reports ADD COLUMN student_info TEXT;
ALTER TABLE experiment_reports ADD COLUMN conclusion TEXT;
ALTER TABLE experiment_reports ADD COLUMN conclusion_errors TEXT;
ALTER TABLE experiment_reports ADD COLUMN conclusion_improvements TEXT;
ALTER TABLE experiment_reports ADD COLUMN columns TEXT;
ALTER TABLE experiment_reports ADD COLUMN equations TEXT;
ALTER TABLE experiment_reports ADD COLUMN plots TEXT;
ALTER TABLE experiment_reports ADD COLUMN chart_snapshot TEXT;
ALTER TABLE experiment_reports ADD COLUMN version INTEGER DEFAULT 1;
ALTER TABLE experiment_reports ADD COLUMN parent_id INTEGER;
ALTER TABLE experiment_reports ADD COLUMN teacher_seen INTEGER DEFAULT 0;
ALTER TABLE experiment_reports ADD COLUMN graded_by INTEGER;
ALTER TABLE experiment_reports ADD COLUMN graded_by_name TEXT;

-- ─── 2. Report comments ───
CREATE TABLE IF NOT EXISTS report_comments (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  report_id INTEGER NOT NULL REFERENCES experiment_reports(id) ON DELETE CASCADE,
  author_id INTEGER NOT NULL REFERENCES users(id),
  author_name TEXT NOT NULL,
  author_role TEXT NOT NULL CHECK(author_role IN ('student','teacher','admin')),
  content TEXT NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX IF NOT EXISTS idx_comments_report ON report_comments(report_id);

-- ─── 3. Notifications ───
CREATE TABLE IF NOT EXISTS notifications (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  type TEXT NOT NULL CHECK(type IN ('report_submitted','report_graded','report_resubmitted','comment_added','class_joined')),
  title TEXT NOT NULL,
  message TEXT,
  report_id INTEGER,
  class_id TEXT,
  is_read INTEGER DEFAULT 0,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX IF NOT EXISTS idx_notifications_user ON notifications(user_id, is_read);

-- ─── 4. Grade history ───
CREATE TABLE IF NOT EXISTS grade_history (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  report_id INTEGER NOT NULL REFERENCES experiment_reports(id) ON DELETE CASCADE,
  teacher_id INTEGER NOT NULL,
  teacher_name TEXT NOT NULL,
  old_grade INTEGER,
  new_grade INTEGER NOT NULL,
  old_feedback TEXT,
  new_feedback TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX IF NOT EXISTS idx_grade_history_report ON grade_history(report_id);

