-- Add school_id to feedback for hierarchical routing
ALTER TABLE feedback ADD COLUMN school_id INTEGER REFERENCES schools(id);
CREATE INDEX IF NOT EXISTS idx_feedback_school ON feedback(school_id);
