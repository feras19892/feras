-- Add indexes on approval_requests for auto-escalation and pending queries

CREATE INDEX IF NOT EXISTS idx_approval_requests_status ON approval_requests(status);
CREATE INDEX IF NOT EXISTS idx_approval_requests_escalation ON approval_requests(status, escalation_deadline);
CREATE INDEX IF NOT EXISTS idx_approval_requests_approver ON approval_requests(approver_type, status);
