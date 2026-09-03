-- Migration 052: Add max student/teacher counts to subscriptions

ALTER TABLE subscriptions ADD COLUMN max_students INTEGER;
ALTER TABLE subscriptions ADD COLUMN max_teachers INTEGER;
