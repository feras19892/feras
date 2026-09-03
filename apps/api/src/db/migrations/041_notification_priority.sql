-- Add priority column to notifications for smart routing (immediate/cumulative/periodic)
ALTER TABLE notifications ADD COLUMN priority TEXT DEFAULT 'immediate';
ALTER TABLE school_notifications ADD COLUMN priority TEXT DEFAULT 'immediate';
