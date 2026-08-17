-- Multi-dimensional grading: accuracy, presentation, conclusion, innovation
ALTER TABLE experiment_reports ADD COLUMN grade_accuracy INTEGER DEFAULT NULL;
ALTER TABLE experiment_reports ADD COLUMN grade_presentation INTEGER DEFAULT NULL;
ALTER TABLE experiment_reports ADD COLUMN grade_conclusion INTEGER DEFAULT NULL;
ALTER TABLE experiment_reports ADD COLUMN grade_innovation INTEGER DEFAULT NULL;
