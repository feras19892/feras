import { db } from '../../db/index.js';

// ─── Admin Detailed Reports ───

export async function getDetailedSystemStats(period: 'today' | 'week' | 'month' | 'year' | 'all' = 'today') {
  let dateFilter: string | null = '';
  let dateParam: string | null = null;
  switch (period) {
    case 'today': dateFilter = "date('now')"; dateParam = new Date().toISOString().slice(0, 10); break;
    case 'week': dateFilter = "datetime('now', '-7 days')"; dateParam = new Date(Date.now() - 7 * 86400000).toISOString(); break;
    case 'month': dateFilter = "datetime('now', '-30 days')"; dateParam = new Date(Date.now() - 30 * 86400000).toISOString(); break;
    case 'year': dateFilter = "datetime('now', '-365 days')"; dateParam = new Date(Date.now() - 365 * 86400000).toISOString(); break;
    case 'all': dateFilter = null; break;
  }

  const where = dateFilter ? `WHERE created_at >= ?` : '';
  const whereReports = dateFilter ? `WHERE submitted_at >= ?` : '';
  const whereSessions = dateFilter ? `WHERE login_at >= ?` : '';
  const dp = dateParam ?? '';

  const totalUsers = dateFilter ? await db.get<{ count: number }>(`SELECT COUNT(DISTINCT user_id) as count FROM session_log ${whereSessions}`, dp) : await db.get<{ count: number }>(`SELECT COUNT(*) as count FROM users`);
  const totalStudents = dateFilter ? await db.get<{ count: number }>(`SELECT COUNT(DISTINCT s.user_id) as count FROM session_log s JOIN users u ON s.user_id = u.id WHERE u.role = 'student' AND s.login_at >= ?`, dp) : await db.get<{ count: number }>(`SELECT COUNT(*) as count FROM users WHERE role = 'student'`);
  const totalTeachers = dateFilter ? await db.get<{ count: number }>(`SELECT COUNT(DISTINCT s.user_id) as count FROM session_log s JOIN users u ON s.user_id = u.id WHERE u.role = 'teacher' AND s.login_at >= ?`, dp) : await db.get<{ count: number }>(`SELECT COUNT(*) as count FROM users WHERE role = 'teacher'`);
  const totalSchools = dateFilter ? await db.get<{ count: number }>(`SELECT COUNT(*) as count FROM schools WHERE created_at >= ?`, dp) : await db.get<{ count: number }>(`SELECT COUNT(*) as count FROM schools`);
  const totalClasses = dateFilter ? await db.get<{ count: number }>(`SELECT COUNT(*) as count FROM classes ${where}`, dp) : await db.get<{ count: number }>(`SELECT COUNT(*) as count FROM classes`);
  const totalReports = dateFilter ? await db.get<{ count: number }>(`SELECT COUNT(*) as count FROM experiment_reports ${whereReports}`, dp) : await db.get<{ count: number }>(`SELECT COUNT(*) as count FROM experiment_reports`);
  const totalGraded = dateFilter ? await db.get<{ count: number }>(`SELECT COUNT(*) as count FROM experiment_reports WHERE status = 'graded' AND graded_at >= ?`, dp) : await db.get<{ count: number }>(`SELECT COUNT(*) as count FROM experiment_reports WHERE status = 'graded'`);
  const totalPending = dateFilter
    ? await db.get<{ count: number }>(`SELECT COUNT(*) as count FROM experiment_reports WHERE status = 'submitted' AND submitted_at >= ?`, dp)
    : await db.get<{ count: number }>(`SELECT COUNT(*) as count FROM experiment_reports WHERE status = 'submitted'`);
  const totalOverdue = dateFilter
    ? await db.get<{ count: number }>(`SELECT COUNT(*) as count FROM experiment_reports WHERE status = 'submitted' AND submitted_at < datetime('now', '-3 days') AND submitted_at >= ?`, dp)
    : await db.get<{ count: number }>(`SELECT COUNT(*) as count FROM experiment_reports WHERE status = 'submitted' AND submitted_at < datetime('now', '-3 days')`);
  const totalSessions = dateFilter ? await db.get<{ count: number }>(`SELECT COUNT(*) as count FROM session_log ${whereSessions}`, dp) : await db.get<{ count: number }>(`SELECT COUNT(*) as count FROM session_log`);
  const activeNow = await db.get<{ count: number }>(`SELECT COUNT(*) as count FROM session_log WHERE logout_at IS NULL AND login_at > datetime('now', '-30 minutes')`);
  const activeUsers = dateFilter
    ? await db.get<{ count: number }>(`SELECT COUNT(DISTINCT user_id) as count FROM session_log WHERE login_at >= ?`, dp)
    : await db.get<{ count: number }>(`SELECT COUNT(DISTINCT user_id) as count FROM session_log`);
  const todayLogins = await db.get<{ count: number }>(`SELECT COUNT(*) as count FROM session_log WHERE date(login_at) = date('now')`);
  const avgGrade = dateFilter ? await db.get<{ avg: number }>(`SELECT AVG(grade) as avg FROM experiment_reports WHERE grade IS NOT NULL AND graded_at >= ?`, dp) : await db.get<{ avg: number }>(`SELECT AVG(grade) as avg FROM experiment_reports WHERE grade IS NOT NULL`);

  // Hourly activity today (combine activity_log + session_log for complete picture)
  const hourlyActivity = await db.all(
    `SELECT hour, SUM(count) as count FROM (
      SELECT strftime('%H', created_at) as hour, COUNT(*) as count FROM activity_log WHERE date(created_at) = date('now') GROUP BY hour
      UNION ALL
      SELECT strftime('%H', login_at) as hour, COUNT(*) as count FROM session_log WHERE date(login_at) = date('now') GROUP BY hour
    ) combined GROUP BY hour ORDER BY hour`,
  );

  // Daily activity for the period (combine both sources)
  const dailyActivity = await db.all(
    `SELECT date, SUM(count) as count FROM (
      SELECT date(created_at) as date, COUNT(*) as count FROM activity_log ${dateFilter ? `WHERE created_at >= ?` : ''} GROUP BY date
      UNION ALL
      SELECT date(login_at) as date, COUNT(*) as count FROM session_log ${dateFilter ? `WHERE login_at >= ?` : ''} GROUP BY date
    ) combined GROUP BY date ORDER BY date DESC LIMIT 30`,
    ...(dateFilter ? [dp, dp] : []),
  );

  // Reports by status (respect period filter)
  const reportsByStatus = dateFilter
    ? await db.all(`SELECT status, COUNT(*) as count FROM experiment_reports WHERE submitted_at >= ? GROUP BY status`, dp)
    : await db.all(`SELECT status, COUNT(*) as count FROM experiment_reports GROUP BY status`);

  // Users by role
  const usersByRole = await db.all(
    `SELECT role, COUNT(*) as count FROM users GROUP BY role`,
  );

  // Top schools by real activity (reports + classes + active sessions)
  const topSchools = await db.all(
    `SELECT * FROM (
       SELECT s.id, s.name,
       (SELECT COUNT(*) FROM users u WHERE u.school_id = s.id) as user_count,
       (SELECT COUNT(*) FROM classes c JOIN users u ON c.teacher_id = u.id WHERE u.school_id = s.id) as class_count,
       (SELECT COUNT(*) FROM experiment_reports r JOIN users u ON r.student_id = u.id WHERE u.school_id = s.id) as report_count,
       (SELECT COUNT(*) FROM session_log sl JOIN users u ON sl.user_id = u.id WHERE u.school_id = s.id) as session_count
       FROM schools s
     ) sub
     WHERE (report_count + class_count + session_count) > 0
     ORDER BY (report_count * 3 + class_count * 2 + session_count) DESC LIMIT 10`,
  );

  // Top classes by reports (only classes with actual reports)
  const topClasses = await db.all(
    `SELECT c.id, c.name, u.name as teacher_name,
     (SELECT COUNT(*) FROM experiment_reports r WHERE r.class_id = c.id) as report_count,
     (SELECT COUNT(*) FROM class_students cs WHERE cs.class_id = c.id) as student_count
     FROM classes c JOIN users u ON c.teacher_id = u.id
     WHERE (SELECT COUNT(*) FROM experiment_reports r WHERE r.class_id = c.id) > 0
     ORDER BY report_count DESC LIMIT 10`,
  );

  return {
    period,
    totals: {
      users: totalUsers?.count || 0,
      students: totalStudents?.count || 0,
      teachers: totalTeachers?.count || 0,
      schools: totalSchools?.count || 0,
      classes: totalClasses?.count || 0,
      reports: totalReports?.count || 0,
      graded: totalGraded?.count || 0,
      pending: totalPending?.count || 0,
      overdue: totalOverdue?.count || 0,
      sessions: totalSessions?.count || 0,
      active_now: activeNow?.count || 0,
      active_users: activeUsers?.count || 0,
      today_logins: todayLogins?.count || 0,
      avg_grade: avgGrade?.avg ? Math.round(avgGrade.avg) : 0,
    },
    hourly_activity: hourlyActivity,
    daily_activity: dailyActivity,
    reports_by_status: reportsByStatus,
    users_by_role: usersByRole,
    top_schools: topSchools,
    top_classes: topClasses,
  };
}

export async function getAcademicTracking() {
  // Overall academic status across all classes
  const classes = await db.all(
    `SELECT c.id, c.name, c.code, c.is_frozen, c.is_active,
     u.name as teacher_name, u.email as teacher_email,
     s.name as school_name,
     (SELECT COUNT(*) FROM class_students cs WHERE cs.class_id = c.id) as student_count,
     (SELECT COUNT(*) FROM experiment_reports r WHERE r.class_id = c.id) as report_count,
     (SELECT COUNT(*) FROM experiment_reports r WHERE r.class_id = c.id AND r.status = 'submitted') as pending_count,
     (SELECT COUNT(*) FROM experiment_reports r WHERE r.class_id = c.id AND r.status = 'graded') as graded_count,
     (SELECT AVG(r.grade) FROM experiment_reports r WHERE r.class_id = c.id AND r.grade IS NOT NULL) as avg_grade,
     (SELECT COUNT(*) FROM quizzes q WHERE q.class_id = c.id) as quiz_count,
     (SELECT COUNT(*) FROM experiment_reports r WHERE r.class_id = c.id AND r.status = 'submitted' AND r.submitted_at < datetime('now', '-3 days')) as overdue_count
     FROM classes c
     LEFT JOIN users u ON c.teacher_id = u.id
     LEFT JOIN schools s ON u.school_id = s.id
     ORDER BY c.created_at DESC`,
  );

  // Global stats
  const totalStudents = await db.get<{ count: number }>(`SELECT COUNT(*) as count FROM users WHERE role = 'student'`);
  const totalTeachers = await db.get<{ count: number }>(`SELECT COUNT(*) as count FROM users WHERE role = 'teacher'`);
  const totalClasses = await db.get<{ count: number }>(`SELECT COUNT(*) as count FROM classes`);
  const totalReports = await db.get<{ count: number }>(`SELECT COUNT(*) as count FROM experiment_reports`);
  const totalGraded = await db.get<{ count: number }>(`SELECT COUNT(*) as count FROM experiment_reports WHERE status = 'graded'`);
  const totalPending = await db.get<{ count: number }>(`SELECT COUNT(*) as count FROM experiment_reports WHERE status = 'submitted'`);
  const totalOverdue = await db.get<{ count: number }>(`SELECT COUNT(*) as count FROM experiment_reports WHERE status = 'submitted' AND submitted_at < datetime('now', '-3 days')`);
  const globalAvg = await db.get<{ avg: number }>(`SELECT AVG(grade) as avg FROM experiment_reports WHERE grade IS NOT NULL`);

  // Class health categories (mutually exclusive — priority: critical > warning > inactive > healthy)
  const healthyClasses = classes.filter((c: any) => c.overdue_count === 0 && c.pending_count <= 5 && c.is_active && !c.is_frozen && c.student_count > 0 && c.report_count > 0);
  const warningClasses = classes.filter((c: any) => !healthyClasses.includes(c) && ((c.overdue_count > 0 && c.overdue_count <= 3) || (c.pending_count > 5 && c.pending_count <= 10)));
  const criticalClasses = classes.filter((c: any) => !healthyClasses.includes(c) && !warningClasses.includes(c) && (c.overdue_count > 3 || c.pending_count > 10 || c.is_frozen || !c.is_active));
  const inactiveClasses = classes.filter((c: any) => !healthyClasses.includes(c) && !warningClasses.includes(c) && !criticalClasses.includes(c) && (c.student_count === 0 || c.report_count === 0));

  return {
    global: {
      total_students: totalStudents?.count || 0,
      total_teachers: totalTeachers?.count || 0,
      total_classes: totalClasses?.count || 0,
      total_reports: totalReports?.count || 0,
      total_graded: totalGraded?.count || 0,
      total_pending: totalPending?.count || 0,
      total_overdue: totalOverdue?.count || 0,
      global_avg: globalAvg?.avg ? Math.round(globalAvg.avg) : 0,
    },
    class_health: {
      healthy: healthyClasses.length,
      warning: warningClasses.length,
      critical: criticalClasses.length,
      inactive: inactiveClasses.length,
    },
    classes: classes.map((c: any) => ({
      ...c,
      avg_grade: c.avg_grade ? Math.round(c.avg_grade) : 0,
      health_status: c.is_frozen || !c.is_active ? 'critical' :
        c.overdue_count > 3 || c.pending_count > 10 ? 'critical' :
        c.overdue_count > 0 || c.pending_count > 5 ? 'warning' :
        c.student_count === 0 || c.report_count === 0 ? 'inactive' : 'healthy',
    })),
  };
}

export async function getAdminDetailedReports(date?: string) {
  const targetDate = date || new Date().toISOString().slice(0, 10);

  // Single query with aggregated stats per class
  const classStats = await db.all(
    `SELECT c.id, c.name, c.code, u.name as teacher_name, s.name as school_name,
     c.is_frozen, c.is_active,
     (SELECT COUNT(*) FROM class_students cs WHERE cs.class_id = c.id) as student_count,
     (SELECT COUNT(*) FROM experiment_reports r WHERE r.class_id = c.id AND date(r.submitted_at) = ?) as reports_today,
     (SELECT COUNT(*) FROM experiment_reports r WHERE r.class_id = c.id AND date(r.graded_at) = ?) as graded_today,
     (SELECT COUNT(*) FROM experiment_reports r WHERE r.class_id = c.id AND r.status = 'submitted') as pending_reports,
     (SELECT COUNT(*) FROM experiment_reports r WHERE r.class_id = c.id AND r.status = 'submitted' AND r.submitted_at < datetime('now', '-3 days')) as overdue_reports,
     (SELECT COUNT(DISTINCT r.student_id) FROM experiment_reports r WHERE r.class_id = c.id AND date(r.submitted_at) = ?) as active_today,
     (SELECT COUNT(*) FROM quiz_submissions qs JOIN quizzes q ON qs.quiz_id = q.id WHERE q.class_id = c.id AND date(qs.submitted_at) = ?) as quiz_submissions_today
     FROM classes c
     LEFT JOIN users u ON c.teacher_id = u.id
     LEFT JOIN schools s ON u.school_id = s.id
     ORDER BY c.name`,
    targetDate, targetDate, targetDate, targetDate,
  );

  const report = classStats.map((cls: any) => {
    const issues: string[] = [];
    if (cls.is_frozen) issues.push('الفصل مجمد');
    if (!cls.is_active) issues.push('الفصل غير نشط');
    if (cls.overdue_reports > 0) issues.push(`${cls.overdue_reports} تقرير متأخر`);
    if (cls.pending_reports > 5) issues.push(`${cls.pending_reports} تقرير معلق`);
    if (cls.student_count === 0) issues.push('لا يوجد طلاب');
    if (cls.reports_today === 0 && cls.student_count > 0) issues.push('لا يوجد نشاط اليوم');

    return {
      class_id: cls.id,
      class_name: cls.name,
      class_code: cls.code,
      teacher_name: cls.teacher_name,
      school_name: cls.school_name,
      is_frozen: !!cls.is_frozen,
      is_active: !!cls.is_active,
      student_count: cls.student_count || 0,
      active_today: cls.active_today || 0,
      reports_today: cls.reports_today || 0,
      graded_today: cls.graded_today || 0,
      pending_reports: cls.pending_reports || 0,
      overdue_reports: cls.overdue_reports || 0,
      quiz_submissions_today: cls.quiz_submissions_today || 0,
      issues,
    };
  });

  // Global summary
  const totalReportsToday = await db.get<{ count: number }>(
    `SELECT COUNT(*) as count FROM experiment_reports WHERE date(submitted_at) = ?`, targetDate,
  );
  const totalGradedToday = await db.get<{ count: number }>(
    `SELECT COUNT(*) as count FROM experiment_reports WHERE date(graded_at) = ?`, targetDate,
  );
  const totalPending = await db.get<{ count: number }>(
    `SELECT COUNT(*) as count FROM experiment_reports WHERE status = 'submitted'`,
  );
  const totalOverdue = await db.get<{ count: number }>(
    `SELECT COUNT(*) as count FROM experiment_reports WHERE status = 'submitted' AND submitted_at < datetime('now', '-3 days')`,
  );

  return {
    date: targetDate,
    summary: {
      total_classes: classStats.length,
      reports_today: totalReportsToday?.count || 0,
      graded_today: totalGradedToday?.count || 0,
      pending_reports: totalPending?.count || 0,
      overdue_reports: totalOverdue?.count || 0,
    },
    classes: report,
  };
}
