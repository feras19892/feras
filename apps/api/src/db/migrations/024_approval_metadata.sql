-- ─── Add metadata column and expand approval types ───
-- New types: class_creation, class_deletion, class_edit, user_creation, user_edit, report_deletion

ALTER TABLE approval_requests ADD COLUMN metadata TEXT;

-- SQLite doesn't support ALTER TABLE ... MODIFY CHECK, so we recreate the table
-- First, drop the old CHECK constraint by creating a new table without it
CREATE TABLE IF NOT EXISTS approval_requests_new (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  type TEXT NOT NULL,

  requester_type TEXT NOT NULL,
  requester_id INTEGER NOT NULL,
  requester_name TEXT NOT NULL,

  approver_type TEXT NOT NULL,
  approver_id INTEGER,

  target_user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  target_user_name TEXT NOT NULL,

  class_id TEXT REFERENCES classes(id) ON DELETE CASCADE,
  report_id INTEGER REFERENCES experiment_reports(id) ON DELETE CASCADE,
  school_id INTEGER REFERENCES schools(id) ON DELETE CASCADE,

  title TEXT NOT NULL,
  description TEXT NOT NULL,
  proposed_grade INTEGER,
  severity TEXT,
  metadata TEXT,

  status TEXT NOT NULL DEFAULT 'pending',

  approver_response TEXT,
  approver_responded_at DATETIME,
  approver_name TEXT,

  escalated_to TEXT,
  escalated_at DATETIME,
  escalation_reason TEXT,
  escalation_deadline DATETIME,
  auto_escalated_at DATETIME,

  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Copy existing data
INSERT INTO approval_requests_new
  (id, type, requester_type, requester_id, requester_name,
   approver_type, approver_id, target_user_id, target_user_name,
   class_id, report_id, school_id, title, description, proposed_grade, severity,
   status, approver_response, approver_responded_at, approver_name,
   escalated_to, escalated_at, escalation_reason, escalation_deadline, auto_escalated_at,
   created_at, updated_at)
SELECT
  id, type, requester_type, requester_id, requester_name,
   approver_type, approver_id, target_user_id, target_user_name,
   class_id, report_id, school_id, title, description, proposed_grade, severity,
   status, approver_response, approver_responded_at, approver_name,
   escalated_to, escalated_at, escalation_reason, escalation_deadline, auto_escalated_at,
   created_at, updated_at
FROM approval_requests;

DROP TABLE approval_requests;
ALTER TABLE approval_requests_new RENAME TO approval_requests;

CREATE INDEX IF NOT EXISTS idx_approval_status ON approval_requests(status);
CREATE INDEX IF NOT EXISTS idx_approval_approver ON approval_requests(approver_type, approver_id);
CREATE INDEX IF NOT EXISTS idx_approval_requester ON approval_requests(requester_type, requester_id);
CREATE INDEX IF NOT EXISTS idx_approval_target ON approval_requests(target_user_id);
CREATE INDEX IF NOT EXISTS idx_approval_school ON approval_requests(school_id);
CREATE INDEX IF NOT EXISTS idx_approval_type ON approval_requests(type);
