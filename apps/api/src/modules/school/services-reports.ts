import { db } from '../../db/index.js';

export async function getTeacherPerformance(schoolId: number) {
  const teachers = await db.all<{
    id: number; name: string; email: string; created_at: string; blocked_at: string | null;
  }[]>(
    `SELECT id, name, email, created_at, blocked_at FROM users WHERE school_id = ? AND role = 'teacher' ORDER BY created_at DESC`,
    schoolId,
  );

  const results = [];
  for (const teacher of teachers) {
    const classes = await db.all<{ id: string; name: string }[]>(
      `SELECT id, name FROM classes WHERE teacher_id = ?`, teacher.id,
    );

    let totalReports = 0;
    let gradedReports = 0;
    let pendingReports = 0;
    let totalStudents = 0;

    for (const cls of classes) {
      const reportStats = await db.get<{ total: number; graded: number; pending: number }>(
        `SELECT
          COUNT(*) as total,
          SUM(CASE WHEN status = 'graded' THEN 1 ELSE 0 END) as graded,
          SUM(CASE WHEN status = 'submitted' THEN 1 ELSE 0 END) as pending
         FROM experiment_reports WHERE class_id = ?`, cls.id,
      );
      totalReports += reportStats?.total || 0;
      gradedReports += reportStats?.graded || 0;
      pendingReports += reportStats?.pending || 0;

      const studentCount = await db.get<{ count: number }>(
        `SELECT COUNT(*) as count FROM class_students WHERE class_id = ?`, cls.id,
      );
      totalStudents += studentCount?.count || 0;
    }

    const lastGraded = await db.get<{ graded_at: string }>(
      `SELECT r.graded_at FROM experiment_reports r
       JOIN classes c ON r.class_id = c.id
       WHERE c.teacher_id = ? AND r.graded_at IS NOT NULL
       ORDER BY r.graded_at DESC LIMIT 1`, teacher.id,
    );

    const avgGradingTime = await db.get<{ avg_hours: number }>(
      `SELECT AVG((julianday(r.graded_at) - julianday(r.submitted_at)) * 24) as avg_hours
       FROM experiment_reports r
       JOIN classes c ON r.class_id = c.id
       WHERE c.teacher_id = ? AND r.graded_at IS NOT NULL`, teacher.id,
    );

    results.push({
      ...teacher,
      class_count: classes.length,
      total_students: totalStudents,
      total_reports: totalReports,
      graded_reports: gradedReports,
      pending_reports: pendingReports,
      grading_rate: totalReports > 0 ? Math.round((gradedReports / totalReports) * 100) : 0,
      last_graded_at: lastGraded?.graded_at || null,
      avg_grading_hours: avgGradingTime?.avg_hours ? Math.round(avgGradingTime.avg_hours) : null,
      is_blocked: !!teacher.blocked_at,
    });
  }

  return results;
}

export async function getSchoolDetailedReports(schoolId: number, date?: string) {
  const targetDate = date || new Date().toISOString().slice(0, 10);

  const classes = await db.all(
    `SELECT c.id, c.name, c.code, c.teacher_id, u.name as teacher_name, c.is_frozen, c.is_active
     FROM classes c JOIN users u ON c.teacher_id = u.id
     WHERE u.school_id = ? ORDER BY c.name`,
    schoolId,
  );

  const report = [];
  for (const cls of classes) {
    const todayReports = await db.get<{ count: number }>(
      `SELECT COUNT(*) as count FROM experiment_reports WHERE class_id = ? AND date(submitted_at) = ?`,
      cls.id, targetDate,
    );
    const gradedToday = await db.get<{ count: number }>(
      `SELECT COUNT(*) as count FROM experiment_reports WHERE class_id = ? AND date(graded_at) = ?`,
      cls.id, targetDate,
    );
    const pendingReports = await db.get<{ count: number }>(
      `SELECT COUNT(*) as count FROM experiment_reports WHERE class_id = ? AND status = 'submitted'`,
      cls.id,
    );
    const overdueReports = await db.get<{ count: number }>(
      `SELECT COUNT(*) as count FROM experiment_reports WHERE class_id = ? AND status = 'submitted' AND submitted_at < datetime('now', '-3 days')`,
      cls.id,
    );
    const studentCount = await db.get<{ count: number }>(
      `SELECT COUNT(*) as count FROM class_students WHERE class_id = ?`, cls.id,
    );
    const activeToday = await db.get<{ count: number }>(
      `SELECT COUNT(DISTINCT student_id) as count FROM experiment_reports WHERE class_id = ? AND date(submitted_at) = ?`,
      cls.id, targetDate,
    );
    const quizSubmissionsToday = await db.get<{ count: number }>(
      `SELECT COUNT(*) as count FROM quiz_submissions qs JOIN quizzes q ON qs.quiz_id = q.id WHERE q.class_id = ? AND date(qs.submitted_at) = ?`,
      cls.id, targetDate,
    );
    const avgResult = await db.get<{ avg: number }>(
      `SELECT AVG(grade) as avg FROM experiment_reports WHERE class_id = ? AND grade IS NOT NULL`,
      cls.id,
    );

    const issues: string[] = [];
    if (cls.is_frozen) issues.push('الفصل مجمد');
    if (!cls.is_active) issues.push('الفصل غير نشط');
    if (overdueReports && overdueReports.count > 0) issues.push(`${overdueReports.count} تقرير متأخر (>3 أيام)`);
    if (pendingReports && pendingReports.count > 5) issues.push(`${pendingReports.count} تقرير معلق`);
    if (studentCount && studentCount.count === 0) issues.push('لا يوجد طلاب');
    if (todayReports && todayReports.count === 0 && studentCount && studentCount.count > 0) issues.push('لا يوجد نشاط اليوم');

    report.push({
      class_id: cls.id,
      class_name: cls.name,
      class_code: cls.code,
      teacher_name: cls.teacher_name,
      is_frozen: !!cls.is_frozen,
      is_active: !!cls.is_active,
      student_count: studentCount?.count || 0,
      active_today: activeToday?.count || 0,
      reports_today: todayReports?.count || 0,
      graded_today: gradedToday?.count || 0,
      pending_reports: pendingReports?.count || 0,
      overdue_reports: overdueReports?.count || 0,
      quiz_submissions_today: quizSubmissionsToday?.count || 0,
      class_average: avgResult?.avg ? Math.round(avgResult.avg) : 0,
      issues,
    });
  }

  const totalStudents = await db.get<{ count: number }>(
    `SELECT COUNT(*) as count FROM users WHERE school_id = ? AND role = 'student'`, schoolId,
  );
  const totalTeachers = await db.get<{ count: number }>(
    `SELECT COUNT(*) as count FROM users WHERE school_id = ? AND role = 'teacher'`, schoolId,
  );
  const totalReportsToday = await db.get<{ count: number }>(
    `SELECT COUNT(*) as count FROM experiment_reports r JOIN users u ON r.student_id = u.id WHERE u.school_id = ? AND date(r.submitted_at) = ?`,
    schoolId, targetDate,
  );
  const totalPending = await db.get<{ count: number }>(
    `SELECT COUNT(*) as count FROM experiment_reports r JOIN users u ON r.student_id = u.id WHERE u.school_id = ? AND r.status = 'submitted'`,
    schoolId,
  );
  const totalOverdue = await db.get<{ count: number }>(
    `SELECT COUNT(*) as count FROM experiment_reports r JOIN users u ON r.student_id = u.id WHERE u.school_id = ? AND r.status = 'submitted' AND r.submitted_at < datetime('now', '-3 days')`,
    schoolId,
  );

  return {
    date: targetDate,
    summary: {
      total_students: totalStudents?.count || 0,
      total_teachers: totalTeachers?.count || 0,
      total_classes: classes.length,
      reports_today: totalReportsToday?.count || 0,
      pending_reports: totalPending?.count || 0,
      overdue_reports: totalOverdue?.count || 0,
    },
    classes: report,
  };
}

export async function getOutstandingStudents(schoolId: number, limit = 20) {
  const students = await db.all(
    `SELECT u.id, u.name, u.email,
     COUNT(r.id) as report_count,
     AVG(r.grade) as avg_grade,
     SUM(CASE WHEN r.grade >= 90 THEN 1 ELSE 0 END) as excellent_count,
     SUM(CASE WHEN r.status = 'graded' THEN 1 ELSE 0 END) as graded_count,
     (SELECT COUNT(*) FROM student_badges sb WHERE sb.student_id = u.id) as badge_count
     FROM users u
     LEFT JOIN experiment_reports r ON u.id = r.student_id
     WHERE u.school_id = ? AND u.role = 'student'
     GROUP BY u.id
     HAVING report_count > 0
     ORDER BY avg_grade DESC, excellent_count DESC
     LIMIT ?`,
    schoolId, limit,
  );

  for (const s of students) {
    s.badge_count = s.badge_count || 0;
    s.avg_grade = s.avg_grade ? Math.round(s.avg_grade) : 0;
  }

  return students;
}

export async function getStrugglingStudents(schoolId: number, limit = 20) {
  const students = await db.all(
    `SELECT u.id, u.name, u.email,
     COUNT(r.id) as report_count,
     AVG(r.grade) as avg_grade,
     SUM(CASE WHEN r.status = 'submitted' THEN 1 ELSE 0 END) as pending_count,
     SUM(CASE WHEN r.grade < 50 THEN 1 ELSE 0 END) as failing_count,
     MAX(r.submitted_at) as last_activity
     FROM users u
     LEFT JOIN experiment_reports r ON u.id = r.student_id
     WHERE u.school_id = ? AND u.role = 'student'
     GROUP BY u.id
     HAVING report_count > 0
     ORDER BY avg_grade ASC, pending_count DESC
     LIMIT ?`,
    schoolId, limit,
  );

  for (const s of students) {
    s.avg_grade = s.avg_grade ? Math.round(s.avg_grade) : 0;
    s.needs_encouragement = s.avg_grade < 50 || s.pending_count > 3 || !s.last_activity;
    if (s.last_activity) {
      const daysSince = Math.floor((Date.now() - new Date(s.last_activity).getTime()) / (1000 * 60 * 60 * 24));
      s.days_inactive = daysSince;
    } else {
      s.days_inactive = null;
    }
  }

  return students;
}

export { getTeacherEvaluation } from './services-evaluation.js';
