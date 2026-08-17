-- Add missing performance indexes

-- Composite index for class_students lookups (both directions)
CREATE INDEX IF NOT EXISTS idx_class_students_class_student ON class_students(class_id, student_id);
CREATE INDEX IF NOT EXISTS idx_class_students_student ON class_students(student_id);

-- Composite index for reports filtered by class + status (common query pattern)
CREATE INDEX IF NOT EXISTS idx_reports_class_status ON experiment_reports(class_id, status);

-- Index for email_verification_codes lookup by user_id
CREATE INDEX IF NOT EXISTS idx_email_verif_user ON email_verification_codes(user_id);

-- Index for refresh_tokens user_id (token_hash already has UNIQUE index)
CREATE INDEX IF NOT EXISTS idx_refresh_tokens_user ON refresh_tokens(user_id);

-- Index for activity log filtering
CREATE INDEX IF NOT EXISTS idx_activity_log_actor ON activity_log(actor_id);
CREATE INDEX IF NOT EXISTS idx_activity_log_created ON activity_log(created_at);
