-- Migration 070: Seed the new animal-cell experiment so teachers can attach question templates to it.
-- Pattern follows migrations 066/067 (INSERT OR IGNORE — safe to re-run).

INSERT OR IGNORE INTO experiments (id, category, subject, title_ar, title_en, max_duration_seconds) VALUES
('biology-animal-cell', 'biology', 'cell', 'الخلية الحيوانية', 'Animal Cell Experiment', 1800);
