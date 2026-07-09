-- Migration 006: Unified Experiment Schema
-- Creates the experiments catalog table and links it to reports

-- ─── 1. Experiments catalog ───
CREATE TABLE IF NOT EXISTS experiments (
  id TEXT PRIMARY KEY,
  category TEXT NOT NULL CHECK(category IN ('physics','chemistry')),
  subject TEXT NOT NULL,
  title_ar TEXT NOT NULL,
  title_en TEXT NOT NULL,
  description_ar TEXT,
  description_en TEXT,
  config_json TEXT,           -- JSON object for experiment-specific parameters
  max_duration_seconds INTEGER,
  is_active INTEGER NOT NULL DEFAULT 1,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_experiments_category ON experiments(category);
CREATE INDEX IF NOT EXISTS idx_experiments_subject ON experiments(subject);
CREATE INDEX IF NOT EXISTS idx_experiments_active ON experiments(is_active);

-- Seed with common physics experiments
INSERT OR IGNORE INTO experiments (id, category, subject, title_ar, title_en, max_duration_seconds) VALUES
('physics-pendulum', 'physics', 'mechanics', 'تجربة البندول', 'Pendulum Experiment', 1800),
('physics-spring', 'physics', 'mechanics', 'تجربة النابض', 'Spring Experiment', 1800),
('physics-freefall', 'physics', 'mechanics', 'سقوط حر', 'Free Fall Experiment', 1200),
('physics-inclined', 'physics', 'mechanics', 'المنحدر المائل', 'Inclined Plane Experiment', 1800),
('physics-projectile', 'physics', 'mechanics', 'القذيفة', 'Projectile Motion Experiment', 1500),
('physics-collision', 'physics', 'mechanics', 'التصادم', 'Collision Experiment', 1500),
('physics-lightray', 'physics', 'optics', 'انكسار الضوء', 'Light Refraction Experiment', 1200),
('physics-mirror', 'physics', 'optics', 'المرايا', 'Mirror Experiment', 1200),
('physics-prism', 'physics', 'optics', 'الموشور', 'Prism Experiment', 1200),
('physics-thinlens', 'physics', 'optics', 'العدسة الرقيقة', 'Thin Lens Experiment', 1200),
('physics-interference', 'physics', 'waves', 'التداخل', 'Interference Experiment', 1500),
('physics-diffraction', 'physics', 'waves', 'الحيود', 'Diffraction Experiment', 1500),
('physics-polarization', 'physics', 'waves', 'الاستقطاب', 'Polarization Experiment', 1200),
('physics-resonance', 'physics', 'waves', 'الرنان', 'Resonance Experiment', 1500),
('physics-boyles-law', 'physics', 'thermodynamics', 'قانون بويل', 'Boyle''s Law Experiment', 1500),
('physics-ideal-gas', 'physics', 'thermodynamics', 'الغاز المثالي', 'Ideal Gas Experiment', 1800),
('physics-calorimetry', 'physics', 'thermodynamics', 'الكالوريميتري', 'Calorimetry Experiment', 1800),
('physics-specific-heat', 'physics', 'thermodynamics', 'الحرارة النوائية', 'Specific Heat Experiment', 1800),
('physics-latent-heat', 'physics', 'thermodynamics', 'الحرارة الكامنة', 'Latent Heat Experiment', 1800),
('physics-thermal-expansion', 'physics', 'thermodynamics', 'التمدد الحراري', 'Thermal Expansion Experiment', 1200),
('physics-rc-circuit', 'physics', 'electricity', 'دائرة RC', 'RC Circuit Experiment', 1500),
('physics-biot-savart', 'physics', 'magnetism', 'قانون بيو-سافار', 'Biot-Savart Experiment', 1800),
('physics-faraday', 'physics', 'magnetism', 'قانون فاراداي', 'Faraday''s Law Experiment', 1800),
('physics-speed-of-sound', 'physics', 'waves', 'سرعة الصوت', 'Speed of Sound Experiment', 1500),
('physics-wave-interference', 'physics', 'waves', 'تداخل الموجات', 'Wave Interference Experiment', 1500),
('physics-grating', 'physics', 'waves', 'حيود الحاجز', 'Diffraction Grating Experiment', 1500);

-- Seed with common chemistry experiments
INSERT OR IGNORE INTO experiments (id, category, subject, title_ar, title_en, max_duration_seconds) VALUES
('chemistry-titration', 'chemistry', 'analytical', 'التسحيح', 'Titration Experiment', 1800),
('chemistry-reaction', 'chemistry', 'organic', 'التفاعل الكيميائي', 'Chemical Reaction Experiment', 1500),
('chemistry-ph', 'chemistry', 'analytical', 'قياس pH', 'pH Measurement Experiment', 1200);

-- ─── 2. Link experiment_reports to experiments catalog ───
ALTER TABLE experiment_reports ADD COLUMN experiment_id TEXT REFERENCES experiments(id);

CREATE INDEX IF NOT EXISTS idx_reports_experiment ON experiment_reports(experiment_id);

-- Backfill: map old experiment_type to new experiment_id where possible
UPDATE experiment_reports
SET experiment_id = 'physics-' || LOWER(REPLACE(experiment_type, ' ', '-'))
WHERE experiment_type LIKE 'physics%';

UPDATE experiment_reports
SET experiment_id = 'chemistry-' || LOWER(REPLACE(experiment_type, ' ', '-'))
WHERE experiment_type LIKE 'chemistry%';
