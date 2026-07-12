-- Math Lab schema
CREATE TABLE IF NOT EXISTS math_branches (
  id TEXT PRIMARY KEY,
  slug TEXT UNIQUE NOT NULL,
  name_ar TEXT NOT NULL,
  name_en TEXT NOT NULL,
  description TEXT,
  icon TEXT,
  color TEXT,
  sort_order INTEGER DEFAULT 0,
  created_at INTEGER DEFAULT (unixepoch())
);

CREATE TABLE IF NOT EXISTS math_equations (
  id TEXT PRIMARY KEY,
  branch_id TEXT NOT NULL,
  slug TEXT NOT NULL,
  title_ar TEXT NOT NULL,
  title_en TEXT NOT NULL,
  latex TEXT NOT NULL,
  explanation TEXT,
  difficulty TEXT DEFAULT 'easy',
  sort_order INTEGER DEFAULT 0,
  created_at INTEGER DEFAULT (unixepoch()),
  FOREIGN KEY (branch_id) REFERENCES math_branches(id)
);

CREATE TABLE IF NOT EXISTS math_practice_problems (
  id TEXT PRIMARY KEY,
  equation_id TEXT NOT NULL,
  problem_text TEXT NOT NULL,
  answer TEXT NOT NULL,
  hint TEXT,
  difficulty TEXT DEFAULT 'medium',
  FOREIGN KEY (equation_id) REFERENCES math_equations(id)
);

CREATE TABLE IF NOT EXISTS math_progress (
  user_id INTEGER NOT NULL,
  equation_id TEXT NOT NULL,
  completed INTEGER DEFAULT 0,
  score REAL,
  last_attempt INTEGER DEFAULT (unixepoch()),
  PRIMARY KEY (user_id, equation_id)
);
