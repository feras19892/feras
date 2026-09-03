// Embedded worker — runs inside the API process.
// A standalone alternative exists at apps/worker/src/index.ts.
// Only ONE should be active in any deployment.

import { runAutoEscalation } from '../modules/approvals/services.js';
import { db } from '../db/index.js';
import { createNotification } from '../modules/notifications/services.js';
import { autoExpireSubscriptions } from '../modules/subscriptions/services.js';

const CHECK_INTERVAL_MS = 5 * 60 * 1000; // 5 minutes
let intervalId: ReturnType<typeof setInterval> | null = null;

async function runAutoReminders(): Promise<void> {
  // Find deadlines that are approaching or passed without submission
  const now = new Date();
  const deadlines = await db.all<{
    id: number;
    class_id: string;
    experiment_name: string;
    due_at: string;
  }[]>(`SELECT * FROM experiment_deadlines WHERE due_at > datetime('now', '-7 days')`);

  for (const deadline of deadlines) {
    const dueDate = new Date(deadline.due_at);
    const diffHours = (dueDate.getTime() - now.getTime()) / (1000 * 60 * 60);

    // Skip if not in reminder window
    if (diffHours > 24 || diffHours <= -24) continue;

    // Find students who haven't submitted AND haven't been reminded recently — single query
    const students = await db.all<{ student_id: number; student_name: string }[]>(
      `SELECT cs.student_id, u.name as student_name
       FROM class_students cs
       JOIN users u ON cs.student_id = u.id
       WHERE cs.class_id = ? AND u.blocked_at IS NULL
         AND NOT EXISTS (
           SELECT 1 FROM experiment_reports r
           WHERE r.student_id = cs.student_id AND r.class_id = ? AND r.experiment_name = ?
             AND r.status IN ('submitted','graded','resubmitted')
         )
         AND NOT EXISTS (
           SELECT 1 FROM notifications n
           WHERE n.user_id = cs.student_id AND n.type = 'deadline_reminder'
             AND n.class_id = ? AND n.message LIKE ?
             AND n.created_at > datetime('now', '-1 day')
         )`,
      deadline.class_id, deadline.class_id, deadline.experiment_name,
      deadline.class_id, `%${deadline.experiment_name}%`,
    );

    for (const student of students) {
      if (diffHours <= 1 && diffHours > 0) {
        await createNotification({
          user_id: student.student_id,
          type: 'deadline_reminder',
          title: '⚠️ آخر ساعة للتسليم',
          message: `موعد تسليم تجربة "${deadline.experiment_name}" خلال أقل من ساعة!`,
          class_id: deadline.class_id,
        });
      } else if (diffHours <= 24 && diffHours > 1) {
        await createNotification({
          user_id: student.student_id,
          type: 'deadline_reminder',
          title: '⏰ تذكير: موعد تسليم قريب',
          message: `موعد تسليم تجربة "${deadline.experiment_name}" خلال أقل من 24 ساعة`,
          class_id: deadline.class_id,
        });
      } else if (diffHours <= 0 && diffHours > -24) {
        await createNotification({
          user_id: student.student_id,
          type: 'deadline_reminder',
          title: '⏰ انتهى موعد التسليم',
          message: `انتهى موعد تسليم تجربة "${deadline.experiment_name}". يرجى التسليم في أقرب وقت.`,
          class_id: deadline.class_id,
        });
      }
    }
  }
}

async function runSystemAlerts(): Promise<void> {
  // Check school capacity at 90%
  const schools = await db.all<{
    id: number; name: string; max_students: number; max_teachers: number;
  }[]>(`SELECT id, name, max_students, max_teachers FROM schools WHERE is_active = 1`);

  for (const school of schools) {
    const studentCount = await db.get<{ count: number }>(
      `SELECT COUNT(*) as count FROM users WHERE school_id = ? AND role = 'student' AND blocked_at IS NULL`,
      school.id,
    );
    const teacherCount = await db.get<{ count: number }>(
      `SELECT COUNT(*) as count FROM users WHERE school_id = ? AND role = 'teacher' AND blocked_at IS NULL`,
      school.id,
    );

    const studentPct = school.max_students > 0 ? (studentCount?.count || 0) / school.max_students : 0;
    const teacherPct = school.max_teachers > 0 ? (teacherCount?.count || 0) / school.max_teachers : 0;

    if (studentPct >= 0.9) {
      const existing = await db.get(
        `SELECT 1 FROM system_alerts WHERE type = 'school_capacity' AND target_id = ? AND is_resolved = 0 AND created_at > datetime('now', '-1 day')`,
        school.id,
      );
      if (!existing) {
        await db.run(
          `INSERT INTO system_alerts (type, severity, title, message, target_type, target_id) VALUES (?, ?, ?, ?, ?, ?)`,
          'school_capacity', 'warning',
          `اقتراب امتلاء المدرسة: ${school.name}`,
          `المدرسة "${school.name}" وصلت إلى ${Math.round(studentPct * 100)}% من سعة الطلاب (${studentCount?.count || 0}/${school.max_students})`,
          'admin', school.id,
        );
      }
    }

    if (teacherPct >= 0.9) {
      const existing = await db.get(
        `SELECT 1 FROM system_alerts WHERE type = 'teacher_capacity' AND target_id = ? AND is_resolved = 0 AND created_at > datetime('now', '-1 day')`,
        school.id,
      );
      if (!existing) {
        await db.run(
          `INSERT INTO system_alerts (type, severity, title, message, target_type, target_id) VALUES (?, ?, ?, ?, ?, ?)`,
          'teacher_capacity', 'warning',
          `اقتراب امتلاء المدرسين: ${school.name}`,
          `المدرسة "${school.name}" وصلت إلى ${Math.round(teacherPct * 100)}% من سعة المدرسين (${teacherCount?.count || 0}/${school.max_teachers})`,
          'admin', school.id,
        );
      }
    }
  }

  // Check teacher inactivity (no grading in 7 days)
  const inactiveTeachers = await db.all<{
    teacher_id: number; teacher_name: string; pending_count: number;
  }[]>(
    `SELECT c.teacher_id, u.name as teacher_name, COUNT(r.id) as pending_count
     FROM classes c
     JOIN users u ON c.teacher_id = u.id
     LEFT JOIN experiment_reports r ON r.class_id = c.id AND r.status = 'submitted'
     WHERE u.blocked_at IS NULL
     GROUP BY c.teacher_id
     HAVING pending_count > 0
       AND NOT EXISTS (
         SELECT 1 FROM experiment_reports r2
         JOIN classes c2 ON r2.class_id = c2.id
         WHERE c2.teacher_id = c.teacher_id AND r2.graded_at > datetime('now', '-7 days')
       )`,
  );

  for (const teacher of inactiveTeachers) {
    const existing = await db.get(
      `SELECT 1 FROM system_alerts WHERE type = 'teacher_inactivity' AND target_id = ? AND is_resolved = 0 AND created_at > datetime('now', '-1 day')`,
      teacher.teacher_id,
    );
    if (!existing) {
      await db.run(
        `INSERT INTO system_alerts (type, severity, title, message, target_type, target_id, metadata) VALUES (?, ?, ?, ?, ?, ?, ?)`,
        'teacher_inactivity', 'warning',
        `مدرس لم يصحح منذ 7 أيام: ${teacher.teacher_name}`,
        `المدرس "${teacher.teacher_name}" لديه ${teacher.pending_count} تقرير معلق ولم يصحح أي تقرير خلال آخر 7 أيام`,
        'admin', teacher.teacher_id,
        JSON.stringify({ pending_count: teacher.pending_count }),
      );
    }
  }
}

async function runExpiredTokenCleanup(): Promise<void> {
  const now = new Date().toISOString();

  const expiredRefresh = await db.run(
    `DELETE FROM refresh_tokens WHERE expires_at < ?`,
    now,
  );
  const expiredSchoolRefresh = await db.run(
    `DELETE FROM school_refresh_tokens WHERE expires_at < ?`,
    now,
  );
  const expiredVerification = await db.run(
    `DELETE FROM email_verification_codes WHERE expires_at < ?`,
    now,
  );
  const expiredReset = await db.run(
    `DELETE FROM password_reset_codes WHERE expires_at < ?`,
    now,
  );

  const total = (expiredRefresh.changes || 0) + (expiredSchoolRefresh.changes || 0)
    + (expiredVerification.changes || 0) + (expiredReset.changes || 0);
  if (total > 0) {
    console.log(`[worker] Cleaned up ${total} expired tokens/codes`);
  }

  // Clean up old chat spam tracker entries (older than 30 days)
  const oldSpamEntries = await db.run(
    `DELETE FROM chat_spam_tracker WHERE last_message_at < datetime('now', '-30 days')`,
  );
  if ((oldSpamEntries.changes || 0) > 0) {
    console.log(`[worker] Cleaned up ${oldSpamEntries.changes} old spam tracker entries`);
  }

  // Auto-expire stale sessions (login > 30 min ago, no logout recorded)
  const staleSessions = await db.run(
    `UPDATE session_log SET logout_at = datetime('now')
     WHERE logout_at IS NULL AND login_at < datetime('now', '-30 minutes')`,
  );
  if ((staleSessions.changes || 0) > 0) {
    console.log(`[worker] Auto-expired ${staleSessions.changes} stale sessions`);
  }
}

async function runWorkerTasks(): Promise<void> {
  try {
    await runAutoEscalation();
  } catch (err) {
    console.error('[worker] auto-escalation failed:', err);
  }

  try {
    await runAutoReminders();
  } catch (err) {
    console.error('[worker] auto-reminders failed:', err);
  }

  try {
    await runSystemAlerts();
  } catch (err) {
    console.error('[worker] system-alerts failed:', err);
  }

  try {
    await runExpiredTokenCleanup();
  } catch (err) {
    console.error('[worker] token-cleanup failed:', err);
  }

  try {
    const expired = await autoExpireSubscriptions();
    if (expired > 0) console.log(`[worker] Auto-expired ${expired} subscriptions`);
  } catch (err) {
    console.error('[worker] subscription-expire failed:', err);
  }
}

export function startWorker(): void {
  if (intervalId) return;
  // Run immediately on start
  runWorkerTasks();
  intervalId = setInterval(runWorkerTasks, CHECK_INTERVAL_MS);
  console.log('[worker] Background worker started (escalation + reminders + alerts + token cleanup)');
}

export function stopWorker(): void {
  if (intervalId) {
    clearInterval(intervalId);
    intervalId = null;
  }
}
