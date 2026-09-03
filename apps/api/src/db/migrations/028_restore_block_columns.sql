-- Migration 028: Restore blocked_at and block_reason columns lost during migration 027
-- These columns are already added by migration 005 in fresh databases.
-- Keep this file as a no-op to preserve migration numbering.

-- ALTER TABLE users ADD COLUMN blocked_at DATETIME;
-- ALTER TABLE users ADD COLUMN block_reason TEXT;
SELECT 1;
