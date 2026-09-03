-- Migration 043: Remove CHECK constraint on penalties.type to allow new types
CREATE TABLE IF NOT EXISTS penalties_new (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  student_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  teacher_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  class_id TEXT REFERENCES classes(id) ON DELETE SET NULL,
  type TEXT NOT NULL,
  reason TEXT NOT NULL,
  points INTEGER NOT NULL DEFAULT 0,
  status TEXT NOT NULL DEFAULT('active') CHECK(status IN ('active','dismissed')),
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

INSERT INTO penalties_new (id, student_id, teacher_id, class_id, type, reason, points, status, created_at)
SELECT id, student_id, teacher_id, class_id, type, reason, points, status, created_at FROM penalties;

DROP TABLE penalties;
ALTER TABLE penalties_new RENAME TO penalties;
