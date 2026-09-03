-- Migration 065: Experiment question templates and student answers
-- Links teacher-built question templates to experiments and reports

-- ─── 1. Recreate experiments table to allow biology category ───
CREATE TABLE IF NOT EXISTS experiments_new (
  id TEXT PRIMARY KEY,
  category TEXT NOT NULL CHECK(category IN ('physics','chemistry','biology')),
  subject TEXT NOT NULL,
  title_ar TEXT NOT NULL,
  title_en TEXT NOT NULL,
  description_ar TEXT,
  description_en TEXT,
  config_json TEXT,
  max_duration_seconds INTEGER,
  is_active INTEGER NOT NULL DEFAULT 1,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

INSERT INTO experiments_new SELECT * FROM experiments;

DROP TABLE experiments;

ALTER TABLE experiments_new RENAME TO experiments;

CREATE INDEX IF NOT EXISTS idx_experiments_category ON experiments(category);
CREATE INDEX IF NOT EXISTS idx_experiments_subject ON experiments(subject);
CREATE INDEX IF NOT EXISTS idx_experiments_active ON experiments(is_active);

-- ─── 2. Seed biology experiments ───
INSERT OR IGNORE INTO experiments (id, category, subject, title_ar, title_en, max_duration_seconds) VALUES
('biology-heart', 'biology', 'anatomy', 'تجربة القلب', 'Heart Experiment', 1800),
('biology-eye', 'biology', 'anatomy', 'تجربة العين', 'Eye Experiment', 1800),
('biology-kidney', 'biology', 'anatomy', 'تجربة الكلى', 'Kidney Experiment', 1800),
('biology-lungs', 'biology', 'anatomy', 'تجربة الرئتين', 'Lungs Experiment', 1800),
('biology-skeleton', 'biology', 'anatomy', 'تجربة الهيكل العظمي', 'Skeleton Experiment', 1800),
('biology-digestive', 'biology', 'anatomy', 'تجربة الجهاز الهضمي', 'Digestive System Experiment', 1800),
('biology-plant-cell', 'biology', 'cell', 'الخلية النباتية', 'Plant Cell Experiment', 1800),
('biology-dna-structure', 'biology', 'genetics', 'تركيب DNA', 'DNA Structure Experiment', 1800),
('biology-protein-synthesis', 'biology', 'genetics', 'تخليق البروتين', 'Protein Synthesis Experiment', 1800);

-- ─── 3. Teacher question templates per experiment ───
CREATE TABLE IF NOT EXISTS experiment_question_templates (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  experiment_id TEXT NOT NULL REFERENCES experiments(id) ON DELETE CASCADE,
  teacher_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'draft' CHECK(status IN ('draft','published','archived')),
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_expq_templates_experiment ON experiment_question_templates(experiment_id, status);
CREATE INDEX IF NOT EXISTS idx_expq_templates_teacher ON experiment_question_templates(teacher_id, status);

-- ─── 4. Questions inside a template ───
CREATE TABLE IF NOT EXISTS experiment_template_questions (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  template_id INTEGER NOT NULL REFERENCES experiment_question_templates(id) ON DELETE CASCADE,
  order_index INTEGER NOT NULL DEFAULT 0,
  question_type TEXT NOT NULL CHECK(question_type IN ('multiple_choice','true_false','short_answer','fill_blank','ordering')),
  question_text TEXT NOT NULL,
  options TEXT, -- JSON array for multiple_choice / ordering
  correct_answer TEXT, -- correct value or JSON for ordering
  points INTEGER NOT NULL DEFAULT 1,
  is_required INTEGER NOT NULL DEFAULT 1,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_expq_questions_template ON experiment_template_questions(template_id, order_index);

-- ─── 5. Class assignment: which template is active for which class + experiment ───
CREATE TABLE IF NOT EXISTS class_experiment_assignments (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  class_id TEXT NOT NULL REFERENCES classes(id) ON DELETE CASCADE,
  experiment_id TEXT NOT NULL REFERENCES experiments(id) ON DELETE CASCADE,
  template_id INTEGER NOT NULL REFERENCES experiment_question_templates(id) ON DELETE CASCADE,
  assigned_by INTEGER NOT NULL REFERENCES users(id),
  assigned_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  due_at DATETIME,
  UNIQUE(class_id, experiment_id)
);

CREATE INDEX IF NOT EXISTS idx_class_exp_assignments_class ON class_experiment_assignments(class_id, experiment_id);
CREATE INDEX IF NOT EXISTS idx_class_exp_assignments_template ON class_experiment_assignments(template_id);

-- ─── 6. Student answers attached to a report ───
CREATE TABLE IF NOT EXISTS experiment_report_answers (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  report_id INTEGER NOT NULL REFERENCES experiment_reports(id) ON DELETE CASCADE,
  question_id INTEGER NOT NULL REFERENCES experiment_template_questions(id) ON DELETE CASCADE,
  template_id INTEGER NOT NULL REFERENCES experiment_question_templates(id),
  answer_text TEXT,
  is_correct INTEGER,
  score INTEGER,
  teacher_score INTEGER,
  feedback TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(report_id, question_id)
);

CREATE INDEX IF NOT EXISTS idx_report_answers_report ON experiment_report_answers(report_id);
CREATE INDEX IF NOT EXISTS idx_report_answers_question ON experiment_report_answers(question_id);

-- ─── 7. Report columns for question integration ───
ALTER TABLE experiment_reports ADD COLUMN question_template_id INTEGER REFERENCES experiment_question_templates(id);
ALTER TABLE experiment_reports ADD COLUMN question_score INTEGER;
ALTER TABLE experiment_reports ADD COLUMN question_max_score INTEGER;

CREATE INDEX IF NOT EXISTS idx_reports_template ON experiment_reports(question_template_id);
