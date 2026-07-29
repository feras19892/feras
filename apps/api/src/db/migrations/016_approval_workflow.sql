-- ─── Approval Workflow System ───
-- Multi-role approval chain: Admin > School > Teacher > Student
-- Prevents fraud by requiring approval from the appropriate party before actions take effect

CREATE TABLE IF NOT EXISTS approval_requests (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  type TEXT NOT NULL CHECK(type IN ('penalty','grade_change','student_removal','grade_appeal')),

  -- Who initiated the request
  requester_type TEXT NOT NULL CHECK(requester_type IN ('student','teacher','school','admin')),
  requester_id INTEGER NOT NULL,
  requester_name TEXT NOT NULL,

  -- Who needs to approve (the current approver)
  approver_type TEXT NOT NULL CHECK(approver_type IN ('teacher','school','admin')),
  approver_id INTEGER,

  -- Target user (the student/teacher the request is about)
  target_user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  target_user_name TEXT NOT NULL,

  -- Context
  class_id TEXT REFERENCES classes(id) ON DELETE CASCADE,
  report_id INTEGER REFERENCES experiment_reports(id) ON DELETE CASCADE,
  school_id INTEGER REFERENCES schools(id) ON DELETE CASCADE,

  -- Request details
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  proposed_grade INTEGER,
  severity TEXT,

  -- Status tracking
  status TEXT NOT NULL DEFAULT 'pending' CHECK(status IN ('pending','approved','rejected','escalated','auto_escalated')),

  -- Approver response
  approver_response TEXT,
  approver_responded_at DATETIME,
  approver_name TEXT,

  -- Escalation chain
  escalated_to TEXT,
  escalated_at DATETIME,
  escalation_reason TEXT,

  -- Timestamps
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_approval_status ON approval_requests(status);
CREATE INDEX IF NOT EXISTS idx_approval_approver ON approval_requests(approver_type, approver_id);
CREATE INDEX IF NOT EXISTS idx_approval_requester ON approval_requests(requester_type, requester_id);
CREATE INDEX IF NOT EXISTS idx_approval_target ON approval_requests(target_user_id);
CREATE INDEX IF NOT EXISTS idx_approval_school ON approval_requests(school_id);
CREATE INDEX IF NOT EXISTS idx_approval_type ON approval_requests(type);

-- Add new notification types
-- The notification type column will accept any string (we drop the check via a new table)
-- foreign_keys are disabled during migrations in index.ts
CREATE TABLE IF NOT EXISTS notifications_new (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  type TEXT NOT NULL,
  title TEXT NOT NULL,
  message TEXT,
  report_id INTEGER,
  class_id TEXT,
  is_read INTEGER DEFAULT 0,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
INSERT INTO notifications_new SELECT * FROM notifications;
DROP TABLE notifications;
ALTER TABLE notifications_new RENAME TO notifications;
CREATE INDEX IF NOT EXISTS idx_notifications_user ON notifications(user_id, is_read);
