-- Quiz enhancements: type, scheduled publish, weight
ALTER TABLE quizzes ADD COLUMN quiz_type TEXT NOT NULL DEFAULT('quiz') CHECK(quiz_type IN ('quiz','midterm','final'));
ALTER TABLE quizzes ADD COLUMN scheduled_at DATETIME;
ALTER TABLE quizzes ADD COLUMN weight INTEGER NOT NULL DEFAULT(10);

-- Index for scheduled quizzes lookup
CREATE INDEX IF NOT EXISTS idx_quizzes_scheduled ON quizzes(scheduled_at) WHERE scheduled_at IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_quizzes_class_status ON quizzes(class_id, status);
