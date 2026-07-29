import { runAutoEscalation } from '../modules/approvals/services.js';
import { db } from '../db/index.js';
import { createNotification } from '../modules/notifications/services.js';

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

    // Find students in the class who haven't submitted this experiment
    const students = await db.all<{ student_id: number; student_name: string }[]>(
      `SELECT cs.student_id, u.name as student_name
       FROM class_students cs
       JOIN users u ON cs.student_id = u.id
       WHERE cs.class_id = ? AND u.blocked_at IS NULL`,
      deadline.class_id,
    );

    for (const student of students) {
      const submitted = await db.get(
        `SELECT 1 FROM experiment_reports WHERE student_id = ? AND class_id = ? AND experiment_name = ? AND status IN ('submitted','graded','resubmitted') LIMIT 1`,
        student.student_id, deadline.class_id, deadline.experiment_name,
      );
      if (submitted) continue;

      // Check if we already sent a reminder for this deadline+student
      const existingReminder = await db.get(
        `SELECT 1 FROM notifications WHERE user_id = ? AND type = 'deadline_reminder' AND class_id = ? AND message LIKE ? AND created_at > datetime('now', '-1 day')`,
        student.student_id, deadline.class_id, `%${deadline.experiment_name}%`,
      );
      if (existingReminder) continue;

      // Send reminders at 24h before, 1h before, and after deadline
      if (diffHours <= 24 && diffHours > 0) {
        await createNotification({
          user_id: student.student_id,
          type: 'deadline_reminder',
          title: '⏰ تذكير: موعد تسليم قريب',
          message: `موعد تسليم تجربة "${deadline.experiment_name}" خلال أقل من 24 ساعة`,
          class_id: deadline.class_id,
        });
      } else if (diffHours <= 1 && diffHours > 0) {
        await createNotification({
          user_id: student.student_id,
          type: 'deadline_reminder',
          title: '⚠️ آخر ساعة للتسليم',
          message: `موعد تسليم تجربة "${deadline.experiment_name}" خلال أقل من ساعة!`,
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
}

export function startWorker(): void {
  if (intervalId) return;
  // Run immediately on start
  runWorkerTasks();
  intervalId = setInterval(runWorkerTasks, CHECK_INTERVAL_MS);
  console.log('[worker] Background worker started (escalation + reminders + alerts)');
}

export function stopWorker(): void {
  if (intervalId) {
    clearInterval(intervalId);
    intervalId = null;
  }
}
