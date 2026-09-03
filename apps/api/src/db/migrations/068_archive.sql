-- Archive tables for old reports and classes
CREATE TABLE IF NOT EXISTS archived_reports (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  original_report_id INTEGER NOT NULL,
  user_id INTEGER NOT NULL,
  class_id INTEGER,
  experiment_type TEXT,
  experiment_id TEXT,
  title TEXT,
  content TEXT,
  grade REAL,
  status TEXT,
  teacher_notes TEXT,
  archived_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  archived_by INTEGER REFERENCES users(id),
  reason TEXT
);

CREATE INDEX IF NOT EXISTS idx_archived_reports_user ON archived_reports(user_id);
CREATE INDEX IF NOT EXISTS idx_archived_reports_class ON archived_reports(class_id);
CREATE INDEX IF NOT EXISTS idx_archived_reports_date ON archived_reports(archived_at);

CREATE TABLE IF NOT EXISTS archived_classes (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  original_class_id INTEGER NOT NULL,
  name TEXT NOT NULL,
  code TEXT NOT NULL,
  teacher_id INTEGER NOT NULL,
  school_id INTEGER,
  student_count INTEGER DEFAULT 0,
  created_at DATETIME,
  archived_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  archived_by INTEGER REFERENCES users(id),
  reason TEXT
);

CREATE INDEX IF NOT EXISTS idx_archived_classes_teacher ON archived_classes(teacher_id);
CREATE INDEX IF NOT EXISTS idx_archived_classes_school ON archived_classes(school_id);
CREATE INDEX IF NOT EXISTS idx_archived_classes_date ON archived_classes(archived_at);

-- Archive settings
CREATE TABLE IF NOT EXISTS archive_settings (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  key TEXT UNIQUE NOT NULL,
  value TEXT NOT NULL,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Seed default archive settings
INSERT OR IGNORE INTO archive_settings (key, value) VALUES
  ('archive_reports_after_months', '12'),
  ('archive_classes_after_months', '24'),
  ('auto_archive_enabled', 'true'),
  ('last_auto_archive_at', '');
