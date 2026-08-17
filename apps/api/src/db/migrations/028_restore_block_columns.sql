-- Migration 028: Restore blocked_at and block_reason columns lost during migration 027
-- Migration 027 recreated the users table but omitted blocked_at and block_reason

ALTER TABLE users ADD COLUMN blocked_at DATETIME;
ALTER TABLE users ADD COLUMN block_reason TEXT;
