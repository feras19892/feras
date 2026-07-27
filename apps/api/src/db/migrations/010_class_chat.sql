-- Class chat messages table
CREATE TABLE IF NOT EXISTS class_messages (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  class_id TEXT NOT NULL REFERENCES classes(id) ON DELETE CASCADE,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  user_name TEXT NOT NULL,
  user_role TEXT NOT NULL,
  content TEXT NOT NULL,
  is_flagged INTEGER DEFAULT 0,
  flagged_reason TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_class_messages_class_id ON class_messages(class_id);
CREATE INDEX IF NOT EXISTS idx_class_messages_created_at ON class_messages(created_at);
