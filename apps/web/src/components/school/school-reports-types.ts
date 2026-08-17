export type { OutstandingStudent, StrugglingStudent } from '../../services/school.service';
export type { TeacherEvaluation as TeacherEval } from '../../services/school.service';

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
