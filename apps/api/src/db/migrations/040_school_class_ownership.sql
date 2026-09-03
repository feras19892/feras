-- Migration 040: Tie classes to schools and make teacher_id nullable
-- This allows schools to create classes before assigning a teacher.

CREATE TABLE IF NOT EXISTS classes_new (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  code TEXT UNIQUE NOT NULL,
  teacher_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
  school_id INTEGER REFERENCES schools(id) ON DELETE CASCADE,
  is_active INTEGER NOT NULL DEFAULT 1,
  is_frozen INTEGER DEFAULT 0,
  frozen_reason TEXT,
  frozen_at DATETIME,
  frozen_by INTEGER,
  description TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

INSERT INTO classes_new (id, name, code, teacher_id, school_id, is_active, is_frozen, frozen_reason, frozen_at, frozen_by, description, created_at)
SELECT c.id, c.name, c.code, c.teacher_id, u.school_id, c.is_active, c.is_frozen, c.frozen_reason, c.frozen_at, c.frozen_by, NULL, c.created_at
FROM classes c
LEFT JOIN users u ON c.teacher_id = u.id;

DROP TABLE classes;

ALTER TABLE classes_new RENAME TO classes;

CREATE INDEX IF NOT EXISTS idx_classes_school ON classes(school_id);
CREATE INDEX IF NOT EXISTS idx_classes_teacher ON classes(teacher_id);
CREATE INDEX IF NOT EXISTS idx_classes_active ON classes(is_active);
