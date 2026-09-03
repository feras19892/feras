-- Invoices table for admin billing history
CREATE TABLE IF NOT EXISTS invoices (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  subscription_id INTEGER REFERENCES subscriptions(id) ON DELETE SET NULL,
  owner_id INTEGER NOT NULL,
  owner_type TEXT NOT NULL CHECK(owner_type IN ('user','school')),
  amount_cents INTEGER NOT NULL,
  currency TEXT NOT NULL DEFAULT 'EUR',
  status TEXT NOT NULL DEFAULT 'unpaid' CHECK(status IN ('unpaid','paid','cancelled')),
  payment_provider TEXT,
  payment_reference TEXT,
  paid_at DATETIME,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_invoices_owner ON invoices(owner_id, owner_type);
CREATE INDEX IF NOT EXISTS idx_invoices_subscription ON invoices(subscription_id);
CREATE INDEX IF NOT EXISTS idx_invoices_status ON invoices(status);
CREATE INDEX IF NOT EXISTS idx_invoices_created ON invoices(created_at);
