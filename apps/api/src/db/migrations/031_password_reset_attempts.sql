-- Add attempts column to password_reset_codes
ALTER TABLE password_reset_codes ADD COLUMN attempts INTEGER DEFAULT 0;
