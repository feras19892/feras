-- Allow warnings to be issued by schools (not just admin users)
ALTER TABLE warnings ADD COLUMN school_id INTEGER;
CREATE INDEX IF NOT EXISTS idx_warnings_school ON warnings(school_id);
