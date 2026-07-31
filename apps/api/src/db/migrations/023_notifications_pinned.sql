-- Add is_pinned column to notifications and school_notifications
ALTER TABLE notifications ADD COLUMN is_pinned INTEGER DEFAULT 0;
ALTER TABLE school_notifications ADD COLUMN is_pinned INTEGER DEFAULT 0;
