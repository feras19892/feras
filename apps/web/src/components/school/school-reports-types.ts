export interface ClassReport {
  class_id: string;
  class_name: string;
  class_code: string;
  teacher_name: string;
  is_frozen: boolean;
  is_active: boolean;
  student_count: number;
  active_today: number;
  reports_today: number;
  graded_today: number;
  pending_reports: number;
  overdue_reports: number;
  quiz_submissions_today: number;
  class_average: number;
  issues: string[];
}

export interface DailyReport {
  date: string;
  summary: {
    total_students: number;
    total_teachers: number;
    total_classes: number;
    reports_today: number;
    pending_reports: number;
    overdue_reports: number;
  };
  classes: ClassReport[];
}

export interface OutstandingStudent {
  id: number;
  name: string;
  email: string;
  report_count: number;
  avg_grade: number;
  excellent_count: number;
  graded_count: number;
  badge_count: number;
}

export interface StrugglingStudent {
  id: number;
  name: string;
  email: string;
  report_count: number;
  avg_grade: number;
  pending_count: number;
  failing_count: number;
  last_activity: string | null;
  needs_encouragement: boolean;
  days_inactive: number | null;
}

export interface TeacherEval {
  id: number;
  name: string;
  email: string;
  class_count: number;
  total_students: number;
  total_reports: number;
  graded_reports: number;
  pending_reports: number;
  grading_rate: number;
  avg_grade: number;
  quiz_count: number;
  quiz_submissions: number;
  avg_grading_hours: number | null;
  last_graded_at: string | null;
  last_report_at: string | null;
  teaching_score: number;
  is_blocked: boolean;
}
