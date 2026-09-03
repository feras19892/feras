-- Add context fields to feedback for the floating feedback widget
ALTER TABLE feedback ADD COLUMN page_path TEXT;
ALTER TABLE feedback ADD COLUMN category TEXT;
ALTER TABLE feedback ADD COLUMN device_info TEXT;

CREATE INDEX IF NOT EXISTS idx_feedback_page_path ON feedback(page_path);
CREATE INDEX IF NOT EXISTS idx_feedback_category ON feedback(category);
