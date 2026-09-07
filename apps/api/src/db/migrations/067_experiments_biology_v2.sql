-- Migration 067: Seed the new biology experiments (plant, microbiology, genetics)
-- so teachers can attach question templates to them.
-- Pattern follows migration 066 (INSERT OR IGNORE — safe to re-run).

INSERT OR IGNORE INTO experiments (id, category, subject, title_ar, title_en, max_duration_seconds) VALUES
('biology-photosynthesis', 'biology', 'plant', 'البناء الضوئي', 'Photosynthesis Experiment', 1800),
('biology-plant-structure', 'biology', 'plant', 'تراكيب النبات', 'Plant Structures Experiment', 1800),
('biology-transpiration', 'biology', 'plant', 'النتح', 'Transpiration Experiment', 1500),
('biology-flower-reproduction', 'biology', 'plant', 'تكاثر النبات', 'Flower Reproduction Experiment', 1800),
('biology-bacteria', 'biology', 'microbiology', 'تركيب البكتيريا', 'Bacteria Structure Experiment', 1800),
('biology-virus', 'biology', 'microbiology', 'تركيب الفيروس', 'Virus Structure Experiment', 1800),
('biology-fungi', 'biology', 'microbiology', 'تركيب الفطر', 'Fungus Structure Experiment', 1800),
('biology-blood-cells', 'biology', 'microbiology', 'خلايا الدم', 'Blood Cells Experiment', 1800),
('biology-punnett-square', 'biology', 'genetics', 'مربع التفتح', 'Punnett Square Experiment', 1800),
('biology-mitosis', 'biology', 'genetics', 'الانقسام المتساوي', 'Mitosis Experiment', 1800),
('biology-meiosis', 'biology', 'genetics', 'الانقسام المنصف', 'Meiosis Experiment', 1800),
('biology-dna-replication', 'biology', 'genetics', 'تضاعف DNA', 'DNA Replication Experiment', 1800);
