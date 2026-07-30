-- Profile pictures for users and schools
ALTER TABLE users ADD COLUMN avatar_url TEXT;
ALTER TABLE schools ADD COLUMN avatar_url TEXT;

-- Quizzes (automated exams by teachers)
CREATE TABLE IF NOT EXISTS quizzes (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  teacher_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  class_id TEXT REFERENCES classes(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  time_limit_minutes INTEGER NOT NULL DEFAULT 30,
  status TEXT NOT NULL DEFAULT('draft') CHECK(status IN ('draft','published','active','closed')),
  max_score INTEGER NOT NULL DEFAULT 100,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS quiz_questions (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  quiz_id INTEGER NOT NULL REFERENCES quizzes(id) ON DELETE CASCADE,
  question_text TEXT NOT NULL,
  option_a TEXT NOT NULL,
  option_b TEXT NOT NULL,
  option_c TEXT,
  option_d TEXT,
  correct_answer TEXT NOT NULL CHECK(correct_answer IN ('a','b','c','d')),
  points INTEGER NOT NULL DEFAULT 10,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS quiz_submissions (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  quiz_id INTEGER NOT NULL REFERENCES quizzes(id) ON DELETE CASCADE,
  student_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  answers TEXT NOT NULL DEFAULT '{}',
  score INTEGER NOT NULL DEFAULT 0,
  started_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  submitted_at DATETIME,
  UNIQUE(quiz_id, student_id)
);

-- Badges & Achievements
CREATE TABLE IF NOT EXISTS badges (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  description TEXT,
  icon TEXT NOT NULL DEFAULT '🏆',
  type TEXT NOT NULL DEFAULT('manual') CHECK(type IN ('manual','auto')),
  criteria TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS student_badges (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  student_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  badge_id INTEGER NOT NULL REFERENCES badges(id) ON DELETE CASCADE,
  awarded_by INTEGER REFERENCES users(id) ON DELETE SET NULL,
  awarded_by_type TEXT DEFAULT('teacher') CHECK(awarded_by_type IN ('teacher','admin','school')),
  note TEXT,
  awarded_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(student_id, badge_id)
);

-- Penalties & Rewards
CREATE TABLE IF NOT EXISTS penalties (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  student_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  teacher_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  class_id TEXT REFERENCES classes(id) ON DELETE SET NULL,
  type TEXT NOT NULL CHECK(type IN ('penalty','reward')),
  reason TEXT NOT NULL,
  points INTEGER NOT NULL DEFAULT 0,
  status TEXT NOT NULL DEFAULT('active') CHECK(status IN ('active','dismissed')),
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Ratings (school rates teachers, students rate experiments, etc.)
CREATE TABLE IF NOT EXISTS ratings (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  target_id INTEGER NOT NULL,
  target_type TEXT NOT NULL CHECK(target_type IN ('teacher','school','student','class')),
  rater_id INTEGER NOT NULL,
  rater_type TEXT NOT NULL CHECK(rater_type IN ('student','teacher','admin','school')),
  rating INTEGER NOT NULL CHECK(rating >= 1 AND rating <= 5),
  comment TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(target_id, target_type, rater_id, rater_type)
);

-- Leaderboard cache (computed periodically)
CREATE TABLE IF NOT EXISTS leaderboard_cache (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  class_id TEXT REFERENCES classes(id) ON DELETE CASCADE,
  student_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  rank INTEGER NOT NULL,
  avg_grade REAL NOT NULL DEFAULT 0,
  report_count INTEGER NOT NULL DEFAULT 0,
  quiz_scores INTEGER NOT NULL DEFAULT 0,
  total_points INTEGER NOT NULL DEFAULT 0,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(class_id, student_id)
);

-- Insert default badges
INSERT OR IGNORE INTO badges (name, description, icon, type, criteria) VALUES
('أفضل طالب', 'أعلى متوسط درجات في الفصل', '🥇', 'auto', 'top_grade'),
('سرعة الإنجاز', 'إنجاز جميع التقارير في الوقت المحدد', '⚡', 'auto', 'fast_completion'),
('المثابرة', 'أكبر عدد تقارير مكتملة', '💪', 'auto', 'most_reports'),
('الامتحان المثالي', 'درجة كاملة في امتحان', '🎯', 'auto', 'perfect_quiz'),
('التميز العلمي', 'أعلى درجة في تجربة علمية', '🔬', 'auto', 'top_experiment'),
('طالب متميز', 'تمييز من المدرس', '⭐', 'manual', NULL),
('المتعاون', 'مساعدة الزملاء', '🤝', 'manual', NULL),
('المبدع', 'حلول إبداعية في التقارير', '💡', 'manual', NULL);
