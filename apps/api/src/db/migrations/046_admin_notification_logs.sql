-- Admin notification logs and batch tracking
CREATE TABLE IF NOT EXISTS admin_notification_logs (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  admin_id INTEGER NOT NULL,
  target_type TEXT NOT NULL CHECK(target_type IN ('all','role','school','class','user')),
  target_value TEXT,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  priority TEXT NOT NULL DEFAULT 'normal',
  recipient_count INTEGER NOT NULL DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'sent' CHECK(status IN ('sent','scheduled','cancelled')),
  send_at TEXT,
  created_at TEXT DEFAULT (datetime('now'))
);

CREATE INDEX IF NOT EXISTS idx_admin_notification_logs_admin_id ON admin_notification_logs(admin_id);
CREATE INDEX IF NOT EXISTS idx_admin_notification_logs_created_at ON admin_notification_logs(created_at);

-- Track which user notifications came from an admin batch
ALTER TABLE notifications ADD COLUMN admin_batch_id INTEGER;
CREATE INDEX IF NOT EXISTS idx_notifications_admin_batch_id ON notifications(admin_batch_id);

-- Track admin notifications sent to schools (school_notifications)
ALTER TABLE school_notifications ADD COLUMN admin_batch_id INTEGER;
CREATE INDEX IF NOT EXISTS idx_school_notifications_admin_batch_id ON school_notifications(admin_batch_id);
