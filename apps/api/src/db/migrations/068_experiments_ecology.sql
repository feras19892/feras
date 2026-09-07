-- Migration 068: Seed the ecology experiments (food chain, water cycle, ecosystem balance)
-- Pattern follows migration 067 (INSERT OR IGNORE — safe to re-run).

INSERT OR IGNORE INTO experiments (id, category, subject, title_ar, title_en, max_duration_seconds) VALUES
('biology-food-chain', 'biology', 'ecology', 'السلسلة الغذائية', 'Food Chain Experiment', 1800),
('biology-water-cycle', 'biology', 'ecology', 'دورة الماء', 'Water Cycle Experiment', 1800),
('biology-ecosystem-balance', 'biology', 'ecology', 'توازن النظام البيئي', 'Ecosystem Balance Experiment', 1800);
