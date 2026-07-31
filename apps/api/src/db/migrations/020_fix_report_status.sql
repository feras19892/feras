-- Migration 020: Fix experiment_reports status CHECK constraint
-- The original CHECK only allowed ('draft','submitted','graded')
-- but 'resubmitted' is used by the resubmitReport service function.
-- SQLite cannot ALTER a CHECK constraint, so we recreate the table.

DROP TABLE IF EXISTS experiment_reports_new;

CREATE TABLE experiment_reports_new (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  student_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  class_id TEXT NOT NULL REFERENCES classes(id) ON DELETE CASCADE,
  experiment_type TEXT NOT NULL,
  experiment_name TEXT NOT NULL,
  experiment_id TEXT,
  readings TEXT NOT NULL,
  params TEXT,
  chart_snapshot_path TEXT,
  canvas_snapshot_path TEXT,
  status TEXT NOT NULL DEFAULT 'draft' CHECK(status IN ('draft','submitted','graded','resubmitted')),
  grade INTEGER CHECK(grade >= 0 AND grade <= 100),
  feedback TEXT,
  submitted_at DATETIME,
  graded_at DATETIME,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  student_info TEXT,
  conclusion TEXT,
  conclusion_errors TEXT,
  conclusion_improvements TEXT,
  columns TEXT,
  equations TEXT,
  plots TEXT,
  chart_snapshot TEXT,
  version INTEGER DEFAULT 1,
  parent_id INTEGER,
  teacher_seen INTEGER DEFAULT 0,
  graded_by INTEGER,
  graded_by_name TEXT,
  admin_comment TEXT,
  admin_graded_at DATETIME,
  admin_graded_by INTEGER REFERENCES users(id)
);

INSERT INTO experiment_reports_new
SELECT * FROM experiment_reports;

DROP TABLE experiment_reports;
ALTER TABLE experiment_reports_new RENAME TO experiment_reports;

CREATE INDEX IF NOT EXISTS idx_reports_class ON experiment_reports(class_id);
CREATE INDEX IF NOT EXISTS idx_reports_student ON experiment_reports(student_id);
CREATE INDEX IF NOT EXISTS idx_reports_status ON experiment_reports(status);
CREATE INDEX IF NOT EXISTS idx_reports_experiment ON experiment_reports(experiment_id);
