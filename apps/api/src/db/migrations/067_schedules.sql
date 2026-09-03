-- Schedules table for class timetables
CREATE TABLE IF NOT EXISTS schedules (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  class_id INTEGER NOT NULL REFERENCES classes(id) ON DELETE CASCADE,
  day_of_week INTEGER NOT NULL CHECK(day_of_week BETWEEN 0 AND 6), -- 0=Sunday, 6=Saturday
  start_time TEXT NOT NULL, -- Format: HH:MM
  end_time TEXT NOT NULL, -- Format: HH:MM
  subject TEXT,
  room TEXT,
  created_by INTEGER REFERENCES users(id),
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_schedules_class ON schedules(class_id);
CREATE INDEX IF NOT EXISTS idx_schedules_day_time ON schedules(day_of_week, start_time);
CREATE INDEX IF NOT EXISTS idx_schedules_teacher ON schedules(created_by);

-- Recurring events for deadlines and other time-based items
CREATE TABLE IF NOT EXISTS recurring_events (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  class_id INTEGER REFERENCES classes(id) ON DELETE CASCADE,
  event_type TEXT NOT NULL CHECK(event_type IN ('deadline', 'exam', 'meeting', 'other')),
  title TEXT NOT NULL,
  description TEXT,
  recurrence_type TEXT NOT NULL CHECK(recurrence_type IN ('none', 'daily', 'weekly', 'monthly')),
  recurrence_value INTEGER, -- For weekly: day of week (0-6), for monthly: day of month (1-31)
  start_date DATE NOT NULL,
  end_date DATE,
  created_by INTEGER REFERENCES users(id),
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_recurring_class ON recurring_events(class_id);
CREATE INDEX IF NOT EXISTS idx_recurring_type ON recurring_events(event_type);
CREATE INDEX IF NOT EXISTS idx_recurring_dates ON recurring_events(start_date, end_date);
