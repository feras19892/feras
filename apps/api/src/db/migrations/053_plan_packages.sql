-- Migration 053: Plan packages for teacher and school pricing combos

CREATE TABLE IF NOT EXISTS plan_packages (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  plan_id INTEGER NOT NULL REFERENCES plans(id),
  teacher_count INTEGER NOT NULL DEFAULT 0,
  student_count INTEGER NOT NULL DEFAULT 0,
  billing_interval TEXT NOT NULL CHECK(billing_interval IN ('month','year')),
  price_cents INTEGER NOT NULL,
  currency TEXT NOT NULL DEFAULT 'EUR',
  is_active INTEGER DEFAULT 1,
  archived_at DATETIME,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_plan_packages_plan
  ON plan_packages(plan_id, is_active, archived_at);

-- Track the last time a plan was changed when packages change (optional trigger replacement logic handled by API)
