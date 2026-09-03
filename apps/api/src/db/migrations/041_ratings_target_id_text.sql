-- Migration 041: Allow class (TEXT) ids in ratings target_id
-- Classes use TEXT ids, so the ratings target_id column must be TEXT to support class ratings.

CREATE TABLE IF NOT EXISTS ratings_new (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  target_id TEXT NOT NULL,
  target_type TEXT NOT NULL CHECK(target_type IN ('teacher','school','student','class')),
  rater_id INTEGER NOT NULL,
  rater_type TEXT NOT NULL CHECK(rater_type IN ('student','teacher','admin','school')),
  rating INTEGER NOT NULL CHECK(rating >= 1 AND rating <= 5),
  comment TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(target_id, target_type, rater_id, rater_type)
);

INSERT INTO ratings_new (id, target_id, target_type, rater_id, rater_type, rating, comment, created_at)
SELECT id, CAST(target_id AS TEXT), target_type, rater_id, rater_type, rating, comment, created_at
FROM ratings;

DROP TABLE ratings;

ALTER TABLE ratings_new RENAME TO ratings;

CREATE INDEX IF NOT EXISTS idx_ratings_target ON ratings(target_id, target_type);
CREATE INDEX IF NOT EXISTS idx_ratings_rater ON ratings(rater_id, rater_type);
