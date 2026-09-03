-- Rich queue for subscription-related notifications
CREATE TABLE IF NOT EXISTS subscription_notification_queue (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
  school_id INTEGER REFERENCES schools(id) ON DELETE CASCADE,
  owner_id INTEGER,
  owner_type TEXT,
  template_key TEXT,
  event TEXT NOT NULL,
  event_date TEXT NOT NULL,
  scheduled_at DATETIME NOT NULL,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  lang TEXT NOT NULL DEFAULT 'ar',
  channel TEXT NOT NULL DEFAULT 'in_app',
  status TEXT NOT NULL DEFAULT 'pending' CHECK(status IN ('pending','sent','failed','cancelled')),
  attempts INTEGER NOT NULL DEFAULT 0,
  sent_at DATETIME,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_queue_user ON subscription_notification_queue(user_id, status);
CREATE INDEX IF NOT EXISTS idx_queue_scheduled ON subscription_notification_queue(status, scheduled_at);
CREATE INDEX IF NOT EXISTS idx_queue_event ON subscription_notification_queue(event, status);
