-- Migration 051: Add target role to invite codes to distinguish teacher vs student codes

ALTER TABLE invite_codes ADD COLUMN role TEXT NOT NULL DEFAULT 'student' CHECK(role IN ('student','teacher'));
