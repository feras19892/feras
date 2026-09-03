-- Migration 054: Normalize plan_packages and add updated_at to plans

DROP TABLE IF EXISTS plan_packages;

CREATE TABLE plan_packages (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  plan_id INTEGER NOT NULL REFERENCES plans(id),
  teacher_count INTEGER NOT NULL DEFAULT 0,
  student_count INTEGER NOT NULL DEFAULT 0,
  price_cents_monthly INTEGER NOT NULL,
  price_cents_yearly INTEGER NOT NULL,
  currency TEXT NOT NULL DEFAULT 'EUR',
  stripe_product_id TEXT,
  stripe_price_id_monthly TEXT,
  stripe_price_id_yearly TEXT,
  is_active INTEGER DEFAULT 1,
  archived_at DATETIME,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_plan_packages_plan
  ON plan_packages(plan_id, is_active, archived_at);
