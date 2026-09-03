export interface DetailedStats {
  period: string;
  totals: {
    users: number; students: number; teachers: number; schools: number;
    classes: number; reports: number; graded: number; pending: number;
    overdue: number; sessions: number; active_now: number; active_users: number;
    today_logins: number; avg_grade: number;
  };
  hourly_activity: { hour: string; count: number }[];
  daily_activity: { date: string; count: number }[];
  reports_by_status: { status: string; count: number }[];
  users_by_role: { role: string; count: number }[];
  top_schools: { id: number; name: string; user_count: number; class_count: number; report_count: number }[];
  top_classes: { id: string; name: string; teacher_name: string; report_count: number; student_count: number }[];
}

export interface AcademicClass {
  id: string; name: string; is_frozen: number; is_active: number;
  student_count: number; report_count: number; avg_grade: number;
  teacher_name: string; school_name: string; pending_count: number;
  graded_count: number; overdue_count: number; quiz_count: number;
  health_status: string; code: string;
}

export interface AcademicTracking {
  global: {
    total_students: number; total_teachers: number; total_classes: number;
    total_reports: number; total_graded: number; total_pending: number;
    total_overdue: number; global_avg: number;
  };
  class_health: { healthy: number; warning: number; critical: number; inactive: number };
  classes: AcademicClass[];
}

export interface SystemHealth {
  counts: { users: number; classes: number; reports: number; sessions: number; feedback: number; activity: number };
  today: { logins: number; signups: number; reports: number };
  dbSize: number;
  tables: Record<string, number>;
}

export interface Insights {
  inactiveUsers?: { id: number; name: string; role: string }[];
  emptyClasses?: { id: number; name: string; teacher_name: string }[];
  ungradedCount?: number;
  noReportsTeachers?: { id: number; name: string }[];
  topUsers?: { id: number; name: string; role: string; report_count: number }[];
  recentActivity?: { actor_name: string; actor_role?: string; action: string; created_at?: string; details?: string }[];
}

export type TabKey = 'overview' | 'performance' | 'alerts' | 'analytics' | 'academic';
export type TimePeriod = 'today' | 'week' | 'month' | 'all';
