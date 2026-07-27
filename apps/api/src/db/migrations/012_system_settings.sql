-- System settings table for admin-controlled configuration
CREATE TABLE IF NOT EXISTS system_settings (
  key TEXT PRIMARY KEY,
  value TEXT NOT NULL,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_by INTEGER REFERENCES users(id)
);

-- Seed default settings
INSERT OR IGNORE INTO system_settings (key, value) VALUES
  ('experiment_physics_enabled', 'true'),
  ('experiment_chemistry_enabled', 'true'),
  ('experiment_biology_enabled', 'true'),
  ('experiment_math_enabled', 'true'),
  ('chat_enabled', 'true'),
  ('registration_enabled', 'true'),
  ('max_class_size', '50');

CREATE INDEX IF NOT EXISTS idx_system_settings_key ON system_settings(key);
