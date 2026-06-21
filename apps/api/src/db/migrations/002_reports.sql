-- Add is_active to classes
ALTER TABLE classes ADD COLUMN is_active INTEGER NOT NULL DEFAULT 1;

-- Experiment reports submitted by students
CREATE TABLE IF NOT EXISTS experiment_reports (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  student_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  class_id TEXT NOT NULL REFERENCES classes(id) ON DELETE CASCADE,
  experiment_type TEXT NOT NULL,
  experiment_name TEXT NOT NULL,
  readings TEXT NOT NULL, -- JSON array
  params TEXT, -- JSON object
  chart_snapshot_path TEXT,
  canvas_snapshot_path TEXT,
  status TEXT NOT NULL DEFAULT 'draft' CHECK(status IN ('draft','submitted','graded')),
  grade INTEGER CHECK(grade >= 0 AND grade <= 100),
  feedback TEXT,
  submitted_at DATETIME,
  graded_at DATETIME,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_reports_class ON experiment_reports(class_id);
CREATE INDEX IF NOT EXISTS idx_reports_student ON experiment_reports(student_id);
CREATE INDEX IF NOT EXISTS idx_reports_status ON experiment_reports(status);
