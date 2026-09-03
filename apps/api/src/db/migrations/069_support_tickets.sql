-- Support tickets table for technical and other issues
CREATE TABLE IF NOT EXISTS support_tickets (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER NOT NULL REFERENCES users(id),
  school_id INTEGER REFERENCES schools(id),
  category TEXT NOT NULL CHECK(category IN ('technical', 'billing', 'feature', 'bug', 'other')),
  priority TEXT NOT NULL CHECK(priority IN ('low', 'medium', 'high', 'urgent')),
  subject TEXT NOT NULL,
  description TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'open' CHECK(status IN ('open', 'in_progress', 'resolved', 'closed')),
  assigned_to INTEGER REFERENCES users(id),
  resolution TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  resolved_at DATETIME
);

CREATE INDEX IF NOT EXISTS idx_support_tickets_user ON support_tickets(user_id);
CREATE INDEX IF NOT EXISTS idx_support_tickets_school ON support_tickets(school_id);
CREATE INDEX IF NOT EXISTS idx_support_tickets_status ON support_tickets(status);
CREATE INDEX IF NOT EXISTS idx_support_tickets_priority ON support_tickets(priority);
CREATE INDEX IF NOT EXISTS idx_support_tickets_category ON support_tickets(category);
CREATE INDEX IF NOT EXISTS idx_support_tickets_assigned ON support_tickets(assigned_to);

-- Support ticket comments/replies
CREATE TABLE IF NOT EXISTS support_ticket_comments (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  ticket_id INTEGER NOT NULL REFERENCES support_tickets(id) ON DELETE CASCADE,
  user_id INTEGER NOT NULL REFERENCES users(id),
  comment TEXT NOT NULL,
  is_internal INTEGER DEFAULT 0, -- 1 for internal notes (admin only), 0 for public
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_ticket_comments_ticket ON support_ticket_comments(ticket_id);
CREATE INDEX IF NOT EXISTS idx_ticket_comments_user ON support_ticket_comments(user_id);

-- Support ticket status history
CREATE TABLE IF NOT EXISTS support_ticket_history (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  ticket_id INTEGER NOT NULL REFERENCES support_tickets(id) ON DELETE CASCADE,
  old_status TEXT,
  new_status TEXT NOT NULL,
  changed_by INTEGER REFERENCES users(id),
  changed_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_ticket_history_ticket ON support_ticket_history(ticket_id);
CREATE INDEX IF NOT EXISTS idx_ticket_history_date ON support_ticket_history(changed_at);
