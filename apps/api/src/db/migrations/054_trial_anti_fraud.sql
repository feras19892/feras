-- Migration 054: Track registration/login metadata for anti-fraud and trial enforcement

ALTER TABLE users ADD COLUMN registration_ip TEXT;
ALTER TABLE users ADD COLUMN registration_user_agent TEXT;
ALTER TABLE users ADD COLUMN registration_fingerprint TEXT;
ALTER TABLE users ADD COLUMN trial_used INTEGER DEFAULT 0;
ALTER TABLE users ADD COLUMN last_login_ip TEXT;
ALTER TABLE users ADD COLUMN last_login_fingerprint TEXT;

ALTER TABLE schools ADD COLUMN registration_ip TEXT;
ALTER TABLE schools ADD COLUMN registration_user_agent TEXT;
ALTER TABLE schools ADD COLUMN registration_fingerprint TEXT;
ALTER TABLE schools ADD COLUMN trial_used INTEGER DEFAULT 0;
ALTER TABLE schools ADD COLUMN last_login_ip TEXT;
ALTER TABLE schools ADD COLUMN last_login_fingerprint TEXT;

CREATE INDEX IF NOT EXISTS idx_users_fingerprint ON users(registration_fingerprint);
CREATE INDEX IF NOT EXISTS idx_schools_fingerprint ON schools(registration_fingerprint);
