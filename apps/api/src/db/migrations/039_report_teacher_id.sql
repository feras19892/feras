-- Add teacher_id to experiment_reports for report reassignment
ALTER TABLE experiment_reports ADD COLUMN teacher_id INTEGER REFERENCES users(id) ON DELETE SET NULL;

-- Backfill: set teacher_id from the class's teacher
UPDATE experiment_reports
SET teacher_id = (SELECT teacher_id FROM classes WHERE classes.id = experiment_reports.class_id)
WHERE teacher_id IS NULL;

CREATE INDEX IF NOT EXISTS idx_reports_teacher_id ON experiment_reports(teacher_id);
