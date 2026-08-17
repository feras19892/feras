import { db } from '../../db/index.js';

export async function logActivity(
  actorId: number | null,
  actorName: string,
  actorRole: string,
  action: string,
  targetType?: string,
  targetId?: string,
  details?: string
) {
  return db.run(
    `INSERT INTO activity_log (actor_id, actor_name, actor_role, action, target_type, target_id, details)
     VALUES (?, ?, ?, ?, ?, ?, ?)`,
    actorId, actorName, actorRole, action, targetType || null, targetId || null, details || null
  );
}

export async function getRecentActivity(limit = 200) {
  return db.all(
    `SELECT * FROM activity_log ORDER BY created_at DESC LIMIT ?`,
    limit
  );
}

export async function getActivityStats() {
  const todayUsers = await db.get(
    `SELECT COUNT(*) as count FROM users WHERE date(created_at) = date('now')`
  );
  const todayReports = await db.get(
    `SELECT COUNT(*) as count FROM experiment_reports WHERE date(submitted_at) = date('now')`
  );
  const todayClasses = await db.get(
    `SELECT COUNT(*) as count FROM classes WHERE date(created_at) = date('now')`
  );
  const todayFeedback = await db.get(
    `SELECT COUNT(*) as count FROM feedback WHERE date(created_at) = date('now')`
  );
  const todayLogins = await db.get(`SELECT COUNT(*) as count FROM session_log WHERE date(login_at) = date('now')`);
  const activeNow = await db.get(`SELECT COUNT(*) as count FROM session_log WHERE logout_at IS NULL`);

  return {
    today: (todayLogins?.count || 0) + (todayReports?.count || 0) + (todayClasses?.count || 0) + (todayFeedback?.count || 0),
    signups: todayUsers?.count || 0,
    reports: todayReports?.count || 0,
    classes: todayClasses?.count || 0,
    feedback: todayFeedback?.count || 0,
    logins: todayLogins?.count || 0,
    activeNow: activeNow?.count || 0,
  };
}

export async function getSmartInsights() {
  const inactiveUsers = await db.all(
    `SELECT id, name, email, role, created_at FROM users
     WHERE role != 'admin'
     AND id NOT IN (SELECT DISTINCT user_id FROM session_log WHERE login_at > datetime('now', '-7 days'))
     AND id NOT IN (SELECT DISTINCT student_id FROM experiment_reports WHERE submitted_at > datetime('now', '-7 days'))
     AND id NOT IN (SELECT DISTINCT teacher_id FROM classes c
                    JOIN experiment_reports r ON c.id = r.class_id
                    WHERE r.submitted_at > datetime('now', '-7 days'))
     ORDER BY created_at DESC LIMIT 20`
  );

  const emptyClasses = await db.all(
    `SELECT c.id, c.name, c.code, u.name as teacher_name
     FROM classes c JOIN users u ON c.teacher_id = u.id
     WHERE c.id NOT IN (SELECT DISTINCT class_id FROM class_students)
     ORDER BY c.created_at DESC LIMIT 20`
  );

  const ungradedReports = await db.get(
    `SELECT COUNT(*) as count FROM experiment_reports WHERE status = 'submitted' AND submitted_at < datetime('now', '-3 days')`
  );

  const noReportsTeachers = await db.all(
    `SELECT u.id, u.name, u.email FROM users u
     WHERE u.role = 'teacher'
     AND u.id NOT IN (
       SELECT DISTINCT c.teacher_id FROM classes c
       JOIN experiment_reports r ON c.id = r.class_id
     )
     LIMIT 20`
  );

  const topUsers = await db.all(
    `SELECT u.id, u.name, u.role, COUNT(r.id) as report_count
     FROM users u LEFT JOIN experiment_reports r ON u.id = r.student_id
     WHERE r.submitted_at > datetime('now', '-30 days') OR r.id IS NULL
     GROUP BY u.id HAVING COUNT(r.id) > 0
     ORDER BY report_count DESC LIMIT 10`
  );

  const recentActivity = await db.all(
    `SELECT a.action, a.actor_name, a.actor_role, a.created_at, a.details
     FROM activity_log a
     WHERE a.action IN ('login', 'logout', 'create_report', 'create_class', 'join_class', 'grade_report', 'signup', 'impersonate')
     ORDER BY a.created_at DESC LIMIT 10`
  );

  const activeNow = await db.get(`SELECT COUNT(*) as count FROM session_log WHERE logout_at IS NULL`);

  return { inactiveUsers, emptyClasses, ungradedCount: ungradedReports?.count || 0, noReportsTeachers, topUsers, recentActivity, activeNow: activeNow?.count || 0 };
}
