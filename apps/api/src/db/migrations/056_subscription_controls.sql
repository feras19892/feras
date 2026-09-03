CREATE TABLE IF NOT EXISTS subscription_controls (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  type TEXT NOT NULL,
  target_role TEXT NOT NULL,
  scope TEXT NOT NULL,
  duration_days INTEGER NOT NULL DEFAULT 0,
  start_date DATE,
  end_date DATE,
  message TEXT,
  is_active INTEGER NOT NULL DEFAULT 1,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_subscription_controls_type ON subscription_controls(type);
CREATE INDEX IF NOT EXISTS idx_subscription_controls_role ON subscription_controls(target_role);
CREATE INDEX IF NOT EXISTS idx_subscription_controls_active ON subscription_controls(is_active);
