-- Migration 050: Add optional block_until for temporary user blocks

ALTER TABLE users ADD COLUMN block_until DATETIME;
