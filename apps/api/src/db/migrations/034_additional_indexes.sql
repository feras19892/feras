-- Additional performance indexes for school oversight and report queries

-- Users table: school_id filter (very common in school oversight queries)
CREATE INDEX IF NOT EXISTS idx_users_school_id ON users(school_id);

-- Reports: student_id for JOIN lookups
CREATE INDEX IF NOT EXISTS idx_reports_student_id ON experiment_reports(student_id);

-- Reports: submitted_at for date-based filtering (today, overdue, etc.)
CREATE INDEX IF NOT EXISTS idx_reports_submitted_at ON experiment_reports(submitted_at);

-- Reports: graded_at for grading date queries
CREATE INDEX IF NOT EXISTS idx_reports_graded_at ON experiment_reports(graded_at);

-- Reports: composite class_id + submitted_at (common pattern: class reports by date)
CREATE INDEX IF NOT EXISTS idx_reports_class_submitted ON experiment_reports(class_id, submitted_at);

-- Quiz submissions: quiz_id for JOIN with quizzes
CREATE INDEX IF NOT EXISTS idx_quiz_submissions_quiz_id ON quiz_submissions(quiz_id);

-- Session log: user_id for user session lookups
CREATE INDEX IF NOT EXISTS idx_session_log_user_id ON session_log(user_id);

-- Warnings: user_id for user warning lookups
CREATE INDEX IF NOT EXISTS idx_warnings_user_id ON warnings(user_id);

-- Student badges: student_id for badge count lookups
CREATE INDEX IF NOT EXISTS idx_student_badges_student_id ON student_badges(student_id);
