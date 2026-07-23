import { db } from '../../db/index.js';
export async function logActivity(actorId, actorName, actorRole, action, targetType, targetId, details) {
    return db.run(`INSERT INTO activity_log (actor_id, actor_name, actor_role, action, target_type, target_id, details)
     VALUES (?, ?, ?, ?, ?, ?, ?)`, actorId, actorName, actorRole, action, targetType || null, targetId || null, details || null);
}
export async function getRecentActivity(limit = 200) {
    return db.all(`SELECT * FROM activity_log ORDER BY created_at DESC LIMIT ?`, limit);
}
export async function getActivityStats() {
    const todayUsers = await db.get(`SELECT COUNT(*) as count FROM users WHERE date(created_at) = date('now')`);
    const todayReports = await db.get(`SELECT COUNT(*) as count FROM experiment_reports WHERE date(submitted_at) = date('now')`);
    const todayClasses = await db.get(`SELECT COUNT(*) as count FROM classes WHERE date(created_at) = date('now')`);
    const todayFeedback = await db.get(`SELECT COUNT(*) as count FROM feedback WHERE date(created_at) = date('now')`);
    const totalLogins = await db.get(`SELECT COUNT(*) as count FROM session_log`);
    const activeNow = await db.get(`SELECT COUNT(*) as count FROM session_log WHERE logout_at IS NULL`);
    return {
        today: todayUsers?.count + todayReports?.count + todayClasses?.count + todayFeedback?.count || 0,
        signups: todayUsers?.count || 0,
        reports: todayReports?.count || 0,
        classes: todayClasses?.count || 0,
        feedback: todayFeedback?.count || 0,
        logins: totalLogins?.count || 0,
        activeNow: activeNow?.count || 0,
    };
}
export async function getSmartInsights() {
    const inactiveUsers = await db.all(`SELECT id, name, email, role, created_at FROM users
     WHERE id NOT IN (SELECT DISTINCT user_id FROM session_log WHERE login_at > datetime('now', '-7 days'))
     AND id NOT IN (SELECT DISTINCT student_id FROM experiment_reports WHERE submitted_at > datetime('now', '-7 days'))
     AND id NOT IN (SELECT DISTINCT teacher_id FROM classes WHERE created_at > datetime('now', '-7 days'))
     ORDER BY created_at DESC LIMIT 20`);
    const emptyClasses = await db.all(`SELECT c.id, c.name, c.code, u.name as teacher_name
     FROM classes c JOIN users u ON c.teacher_id = u.id
     WHERE c.id NOT IN (SELECT DISTINCT class_id FROM class_students)
     ORDER BY c.created_at DESC LIMIT 20`);
    const ungradedReports = await db.get(`SELECT COUNT(*) as count FROM experiment_reports WHERE status = 'submitted' AND submitted_at < datetime('now', '-3 days')`);
    const noReportsTeachers = await db.all(`SELECT u.id, u.name, u.email FROM users u
     WHERE u.role = 'teacher'
     AND u.id NOT IN (
       SELECT DISTINCT c.teacher_id FROM classes c
       JOIN experiment_reports r ON c.id = r.class_id
     )
     LIMIT 20`);
    const topUsers = await db.all(`SELECT u.id, u.name, u.role, COUNT(r.id) as report_count
     FROM users u LEFT JOIN experiment_reports r ON u.id = r.student_id
     GROUP BY u.id ORDER BY report_count DESC LIMIT 10`);
    const recentActivity = await db.all(`SELECT 'login' as action, u.name as actor_name, s.login_at as created_at, NULL as details
     FROM session_log s JOIN users u ON s.user_id = u.id
     ORDER BY s.login_at DESC LIMIT 5`);
    return { inactiveUsers, emptyClasses, ungradedCount: ungradedReports?.count || 0, noReportsTeachers, topUsers, recentActivity };
}
