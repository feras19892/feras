CREATE INDEX IF NOT EXISTS idx_login_attempts_email_success_created
  ON login_attempts(email, success, created_at);
