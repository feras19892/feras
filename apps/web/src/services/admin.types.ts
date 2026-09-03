export interface AdminUser {
  id: number;
  name: string;
  email: string;
  role: string;
  created_at?: string;
  email_verified_at?: string;
  blocked_at?: string | null;
  block_reason?: string | null;
  school_id?: number | null;
  school_name?: string | null;
}

export interface AdminClassItem {
  id: string;
  name: string;
  code: string;
  teacher_id?: number;
  teacher_name: string;
  student_count: number;
  created_at?: string;
  is_frozen?: number;
}

export interface AdminReportItem {
  id: number;
  student_id: number;
  student_name: string;
  experiment_name: string;
  class_id: string;
  class_name: string;
  teacher_id: number;
  school_id: number;
  teacher_name: string;
  status: string;
  grade?: number | null;
  submitted_at?: string;
}

export interface AdminFeedbackItem {
  id: number;
  type: string;
  user_name: string;
  experiment_name?: string;
  rating?: number | null;
  message: string;
  status: string;
  created_at?: string;
}

export interface AdminFeedbackStats {
  total: number;
  open: number;
  resolved: number;
  average: number;
}

export interface AdminStats {
  users: { total: number; byRole: { role: string; count: number }[] };
  classes: { total: number };
  reports: { total: number; graded: number; pending: number; resubmitted: number; average: number };
  activity?: { today_logins: number; active_now: number; active_users_week: number; total_sessions: number };
}

export interface AdminActivityItem {
  id: number;
  action: string;
  actor_name: string;
  actor_role: string;
  target_type?: string;
  target_id?: number;
  created_at?: string;
}

export interface AdminActivityStats {
  today: number;
  logins: number;
  signups: number;
  reports: number;
  classes: number;
  feedback: number;
  activeNow: number;
}

export interface AdminInsights {
  topUsers?: { id: number; name: string; role: string; report_count: number }[];
  recentActivity?: { actor_name: string; actor_role?: string; action: string; created_at?: string; details?: string }[];
  inactiveUsers?: { id: number; name: string; role: string }[];
  emptyClasses?: { id: number; name: string; teacher_name: string }[];
  ungradedCount?: number;
  noReportsTeachers?: { id: number; name: string }[];
  activeNow?: number;
}

export interface AdminSystemHealth {
  counts: { users: number; classes: number; reports: number; sessions: number };
  today: { logins: number; signups: number; reports: number };
  dbSize: number;
  tables: Record<string, number>;
}

export interface AdminUserWarning {
  id: number;
  title: string;
  severity: string;
  is_read: boolean;
  created_at: string;
}

export interface AdminNote {
  id: number;
  admin_name: string;
  note: string;
  created_at: string;
}

export interface AdminUserActivity {
  action: string;
  details?: string;
  created_at: string;
}

export interface AdminUserFull {
  success: boolean;
  user: AdminUser & { school?: { id: number; name: string } | null };
  classes?: AdminClassItem[];
  reports?: AdminReportItem[];
  warnings?: AdminUserWarning[];
  notes?: AdminNote[];
  activity?: AdminUserActivity[];
  sessions?: { id: number; login_at: string; ip_address?: string; user_agent?: string }[];
  lastLogin?: string | null;
  subscription?: { id: number; status: string; plan_name: string; starts_at: string; expires_at: string | null; next_billing_at: string | null; plan_id: number | null };
  notifications?: { id: number; type: string; title: string; message: string; is_read: number; created_at: string }[];
  notificationQueue?: { id: number; event: string; event_date: string; scheduled_at: string; status: string; title: string; sent_at: string | null; created_at: string }[];
}

export interface ActiveSession {
  id: number;
  user_id: number;
  name: string;
  email: string;
  role: string;
  login_at: string;
  ip?: string;
}
