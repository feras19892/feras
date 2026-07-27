-- Track last read timestamp per user per class chat
CREATE TABLE IF NOT EXISTS class_chat_reads (
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  class_id TEXT NOT NULL REFERENCES classes(id) ON DELETE CASCADE,
  last_read_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (user_id, class_id)
);
