// Standalone worker entry point — ALTERNATIVE deployment option.
// Runs background tasks independently from the API process.
// Connects to the same SQLite database via DB_PATH env variable.
// NOTE: The API also has an embedded worker (apps/api/src/worker/index.ts).
// Only ONE of these should be active in any deployment.
// Logic here must stay in sync with the embedded worker.

import { open } from 'sqlite';
import sqlite3 from 'sqlite3';
import { readFileSync, readdirSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));

async function main() {
  const db = await open({
    filename: process.env.DB_PATH || './data/app.db',
    driver: sqlite3.Database,
  });

  await db.run('PRAGMA journal_mode = WAL');
  await db.run('PRAGMA foreign_keys = ON');
  await db.run('PRAGMA busy_timeout = 5000');

  // Run migrations (same logic as API)
  await db.exec(`
    CREATE TABLE IF NOT EXISTS __migrations (
      name TEXT PRIMARY KEY,
      run_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);
  const migrationsDir = join(__dirname, '../../api/src/db/migrations');
  const files = readdirSync(migrationsDir).filter((f) => f.endsWith('.sql')).sort();
  await db.run('PRAGMA foreign_keys = OFF');
  for (const file of files) {
    const exists = await db.get('SELECT 1 FROM __migrations WHERE name = ?', file);
    if (!exists) {
      const sql = readFileSync(join(migrationsDir, file), 'utf-8');
      await db.exec(sql);
      await db.run('INSERT INTO __migrations (name) VALUES (?)', file);
      console.log(`[standalone-worker] Migration applied: ${file}`);
    }
  }
  await db.run('PRAGMA foreign_keys = ON');

  const CHECK_INTERVAL_MS = 5 * 60 * 1000;

  async function runAutoReminders(): Promise<void> {
    const now = new Date();
    const deadlines = await db.all(
      `SELECT * FROM experiment_deadlines WHERE due_at > datetime('now', '-7 days')`
    );

    for (const deadline of deadlines) {
      const dueDate = new Date(deadline.due_at);
      const diffHours = (dueDate.getTime() - now.getTime()) / (1000 * 60 * 60);
      if (diffHours > 24 || diffHours <= -24) continue;

      const students = await db.all(
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
        let title = '';
        let message = '';
        if (diffHours <= 1 && diffHours > 0) {
          title = '⚠️ آخر ساعة للتسليم';
          message = `موعد تسليم تجربة "${deadline.experiment_name}" خلال أقل من ساعة!`;
        } else if (diffHours <= 24 && diffHours > 1) {
          title = '⏰ تذكير: موعد تسليم قريب';
          message = `موعد تسليم تجربة "${deadline.experiment_name}" خلال أقل من 24 ساعة`;
        } else if (diffHours <= 0 && diffHours > -24) {
          title = '⏰ انتهى موعد التسليم';
          message = `انتهى موعد تسليم تجربة "${deadline.experiment_name}". يرجى التسليم في أقرب وقت.`;
        } else {
          continue;
        }
        await db.run(
          `INSERT INTO notifications (user_id, type, title, message, class_id) VALUES (?, ?, ?, ?, ?)`,
          student.student_id, 'deadline_reminder', title, message, deadline.class_id,
        );
      }
    }
  }

  async function runSystemAlerts(): Promise<void> {
    const schools = await db.all(
      `SELECT id, name, max_students, max_teachers FROM schools WHERE is_active = 1`
    );

    for (const school of schools) {
      const studentCount = await db.get(
        `SELECT COUNT(*) as count FROM users WHERE school_id = ? AND role = 'student' AND blocked_at IS NULL`,
        school.id,
      );
      const teacherCount = await db.get(
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
  }

  async function runCleanup() {
    const now = new Date().toISOString();

    const r1 = await db.run(`DELETE FROM refresh_tokens WHERE expires_at < ?`, now);
    const r2 = await db.run(`DELETE FROM school_refresh_tokens WHERE expires_at < ?`, now);
    const r3 = await db.run(`DELETE FROM email_verification_codes WHERE expires_at < ?`, now);
    const r4 = await db.run(`DELETE FROM password_reset_codes WHERE expires_at < ?`, now);
    const r5 = await db.run(`DELETE FROM chat_spam_tracker WHERE last_message_at < datetime('now', '-30 days')`);

    const total = (r1.changes || 0) + (r2.changes || 0) + (r3.changes || 0) + (r4.changes || 0) + (r5.changes || 0);
    if (total > 0) {
      console.log(`[standalone-worker] Cleaned up ${total} expired entries`);
    }

    // Auto-escalate overdue approvals (matches embedded worker logic)
    const escalationMap: Record<string, string | null> = {
      teacher: 'school',
      school: 'admin',
      admin: null,
    };
    const escalationHours: Record<string, number> = { teacher: 48, school: 72, admin: 0 };

    const overdue = await db.all(
      `SELECT * FROM approval_requests WHERE status = 'pending' AND escalation_deadline IS NOT NULL AND escalation_deadline < ?`,
      now,
    );
    for (const req of overdue) {
      const nextApprover = escalationMap[req.approver_type as string];
      if (!nextApprover) continue;

      const hours = escalationHours[nextApprover as string];
      const newDeadline = hours > 0
        ? new Date(Date.now() + hours * 60 * 60 * 1000).toISOString()
        : null;

      await db.run(
        `UPDATE approval_requests
         SET status = 'pending', escalated_to = ?, escalated_at = datetime('now'),
             escalation_reason = ?, approver_type = ?, escalation_deadline = ?,
             auto_escalated_at = datetime('now'), updated_at = datetime('now')
         WHERE id = ?`,
        nextApprover,
        'تصعيد تلقائي — انتهاء مهلة الرد',
        nextApprover,
        newDeadline,
        req.id,
      );

      // Notify requester about auto-escalation
      await db.run(
        `INSERT INTO notifications (user_id, type, title, message) VALUES (?, ?, ?, ?)`,
        req.requester_id,
        'approval_auto_escalated',
        `تصعيد تلقائي: ${req.title}`,
        `تم تصعيد طلبك تلقائياً لعدم رد ${req.approver_type === 'teacher' ? 'المدرس' : 'المدرسة'} خلال المهلة المحددة`,
      );

      // Notify admins if escalated to admin
      if (nextApprover === 'admin') {
        const admins = await db.all(`SELECT id FROM users WHERE role = 'admin'`);
        for (const admin of admins) {
          await db.run(
            `INSERT INTO notifications (user_id, type, title, message) VALUES (?, ?, ?, ?)`,
            admin.id,
            'approval_escalation',
            `طلب تصعيد تلقائي: ${req.title}`,
            `تم تصعيد طلب من ${req.requester_name} إليك تلقائياً.`,
          );
        }
      }

      console.log(`[standalone-worker] Auto-escalated approval #${req.id} to ${nextApprover}`);
    }
  }

  async function runWorkerTasks(): Promise<void> {
    try { await runCleanup(); } catch (err) { console.error('[standalone-worker] cleanup failed:', err); }
    try { await runAutoReminders(); } catch (err) { console.error('[standalone-worker] auto-reminders failed:', err); }
    try { await runSystemAlerts(); } catch (err) { console.error('[standalone-worker] system-alerts failed:', err); }
  }

  // Run immediately, then on interval
  await runWorkerTasks();
  setInterval(runWorkerTasks, CHECK_INTERVAL_MS);
  console.log('[standalone-worker] Running (cleanup + escalation + reminders + alerts every 5 min)');
}

main().catch((err) => {
  console.error('[standalone-worker] Fatal error:', err);
  process.exit(1);
});
