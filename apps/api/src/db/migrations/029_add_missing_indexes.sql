-- Add missing indexes on frequently queried columns

CREATE INDEX IF NOT EXISTS idx_reports_experiment_name ON experiment_reports(experiment_name);
CREATE INDEX IF NOT EXISTS idx_class_messages_user_id ON class_messages(user_id);
CREATE INDEX IF NOT EXISTS idx_feedback_school_id ON feedback(school_id);
CREATE INDEX IF NOT EXISTS idx_warnings_school_admin ON warnings(admin_id, user_id);
