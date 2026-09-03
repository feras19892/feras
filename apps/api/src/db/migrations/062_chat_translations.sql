-- Add Arabic translation column for admin chat views
ALTER TABLE class_messages ADD COLUMN translated_content TEXT;
ALTER TABLE direct_messages ADD COLUMN translated_content TEXT;
