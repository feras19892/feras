-- Track whether student has seen the teacher's feedback on a graded report
ALTER TABLE experiment_reports ADD COLUMN feedback_seen INTEGER NOT NULL DEFAULT 0;
