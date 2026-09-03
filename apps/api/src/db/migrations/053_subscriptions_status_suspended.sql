-- Migration 053: Add SUSPENDED to subscriptions status enum
CREATE TABLE subscriptions_new (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  owner_id INTEGER NOT NULL,
  owner_type TEXT NOT NULL CHECK(owner_type IN ('user','school')),
  plan_id INTEGER REFERENCES plans(id),
  status TEXT NOT NULL CHECK(status IN ('ACTIVE','TRIAL','EXPIRED','CANCELLED','PENDING','SUSPENDED')),
  starts_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  expires_at DATETIME,
  last_payment_at DATETIME,
  next_billing_at DATETIME,
  cancelled_at DATETIME,
  payment_provider TEXT,
  payment_reference TEXT,
  max_students INTEGER,
  max_teachers INTEGER,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

INSERT INTO subscriptions_new (
  id, owner_id, owner_type, plan_id, status, starts_at, expires_at, last_payment_at,
  next_billing_at, cancelled_at, payment_provider, payment_reference, max_students,
  max_teachers, created_at, updated_at
)
SELECT
  id, owner_id, owner_type, plan_id, status, starts_at, expires_at, last_payment_at,
  next_billing_at, cancelled_at, payment_provider, payment_reference, max_students,
  max_teachers, created_at, updated_at
FROM subscriptions;

DROP TABLE subscriptions;

ALTER TABLE subscriptions_new RENAME TO subscriptions;

CREATE INDEX idx_subscriptions_owner ON subscriptions(owner_id, owner_type, status);
CREATE INDEX idx_subscriptions_status ON subscriptions(status);
