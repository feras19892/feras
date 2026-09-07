-- Migration 071: Seed the new biotechnology and evolution experiments
-- so teachers can attach question templates to them.
-- Pattern follows migrations 066/067/070 (INSERT OR IGNORE — safe to re-run).

INSERT OR IGNORE INTO experiments (id, category, subject, title_ar, title_en, max_duration_seconds) VALUES
('biology-pcr', 'biology', 'biotechnology', 'تفاعل البوليميراز المتسلسل', 'PCR Experiment', 1800),
('biology-crispr', 'biology', 'biotechnology', 'CRISPR-Cas9', 'CRISPR-Cas9 Experiment', 1800),
('biology-gel-electrophoresis', 'biology', 'biotechnology', 'الرحلان الكهربائي للجل', 'Gel Electrophoresis Experiment', 1800),
('biology-natural-selection', 'biology', 'evolution', 'الانتخاب الطبيعي', 'Natural Selection Experiment', 1800),
('biology-phylogenetic-tree', 'biology', 'evolution', 'الشجرة التطورية', 'Phylogenetic Tree Experiment', 1800);
