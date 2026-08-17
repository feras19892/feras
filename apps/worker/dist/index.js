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
        const escalationMap = {
            teacher: 'school',
            school: 'admin',
            admin: null,
        };
        const escalationHours = { teacher: 48, school: 72, admin: 0 };
        const overdue = await db.all(`SELECT * FROM approval_requests WHERE status = 'pending' AND escalation_deadline IS NOT NULL AND escalation_deadline < ?`, now);
        for (const req of overdue) {
            const nextApprover = escalationMap[req.approver_type];
            if (!nextApprover)
                continue;
            const hours = escalationHours[nextApprover];
            const newDeadline = hours > 0
                ? new Date(Date.now() + hours * 60 * 60 * 1000).toISOString()
                : null;
            await db.run(`UPDATE approval_requests
         SET status = 'pending', escalated_to = ?, escalated_at = datetime('now'),
             escalation_reason = ?, approver_type = ?, escalation_deadline = ?,
             auto_escalated_at = datetime('now'), updated_at = datetime('now')
         WHERE id = ?`, nextApprover, 'تصعيد تلقائي — انتهاء مهلة الرد', nextApprover, newDeadline, req.id);
            // Notify requester about auto-escalation
            await db.run(`INSERT INTO notifications (user_id, type, title, message) VALUES (?, ?, ?, ?)`, req.requester_id, 'approval_auto_escalated', `تصعيد تلقائي: ${req.title}`, `تم تصعيد طلبك تلقائياً لعدم رد ${req.approver_type === 'teacher' ? 'المدرس' : 'المدرسة'} خلال المهلة المحددة`);
            // Notify admins if escalated to admin
            if (nextApprover === 'admin') {
                const admins = await db.all(`SELECT id FROM users WHERE role = 'admin'`);
                for (const admin of admins) {
                    await db.run(`INSERT INTO notifications (user_id, type, title, message) VALUES (?, ?, ?, ?)`, admin.id, 'approval_escalation', `طلب تصعيد تلقائي: ${req.title}`, `تم تصعيد طلب من ${req.requester_name} إليك تلقائياً.`);
                }
            }
            console.log(`[standalone-worker] Auto-escalated approval #${req.id} to ${nextApprover}`);
        }
    }
    // Run immediately, then on interval
    await runCleanup();
    setInterval(runCleanup, CHECK_INTERVAL_MS);
    console.log('[standalone-worker] Running (cleanup + escalation every 5 min)');
}
main().catch((err) => {
    console.error('[standalone-worker] Fatal error:', err);
    process.exit(1);
});
