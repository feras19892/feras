-- Add note column to plagiarism_flags for reviewer notes
ALTER TABLE plagiarism_flags ADD COLUMN note TEXT;
