import { db } from '../../db/index.js';

export async function getSystemHealth() {
  const users = await db.get(`SELECT COUNT(*) as count FROM users`);
  const classes = await db.get(`SELECT COUNT(*) as count FROM classes`);
  const reports = await db.get(`SELECT COUNT(*) as count FROM experiment_reports`);
  const feedback = await db.get(`SELECT COUNT(*) as count FROM feedback`);
  const activity = await db.get(`SELECT COUNT(*) as count FROM activity_log`);
  const sessions = await db.get(`SELECT COUNT(*) as count FROM session_log WHERE logout_at IS NULL`);

  const dbSize = await db.get(`SELECT page_count * page_size as size FROM pragma_page_count(), pragma_page_size()`);

  const todayLogins = await db.get(`SELECT COUNT(*) as count FROM activity_log WHERE action = 'login' AND date(created_at) = date('now')`);
  const todayReports = await db.get(`SELECT COUNT(*) as count FROM experiment_reports WHERE date(submitted_at) = date('now')`);
  const todaySignups = await db.get(`SELECT COUNT(*) as count FROM users WHERE date(created_at) = date('now')`);

  const tableStats = await db.all(`SELECT name FROM sqlite_master WHERE type='table'`);
  const tableCounts: Record<string, number> = {};
  for (const t of tableStats) {
    const c = await db.get(`SELECT COUNT(*) as count FROM "${t.name}"`);
    tableCounts[t.name] = c?.count || 0;
  }

  return {
    counts: { users: users?.count, classes: classes?.count, reports: reports?.count, feedback: feedback?.count, activity: activity?.count, sessions: sessions?.count },
    dbSize: dbSize?.size || 0,
    today: { logins: todayLogins?.count, reports: todayReports?.count, signups: todaySignups?.count },
    tables: tableCounts,
  };
}
