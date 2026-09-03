-- Migration 042: Add updated_at to classes table
ALTER TABLE classes ADD COLUMN updated_at DATETIME;
