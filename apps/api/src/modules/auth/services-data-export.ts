import { dbGet, dbAll } from '../../db/index.js';

export async function exportUserData(userId: number): Promise<Record<string, unknown>> {
  const user = await dbGet<Record<string, unknown>>(
    `SELECT id, email, name, role, school_id, age, avatar_url, email_verified_at,
            created_at, updated_at, registration_fingerprint, trial_used
     FROM users WHERE id = ?`,
    userId,
  );

  const generic = async (table: string, idColumn: string, ...extra: (string | number)[]) => {
    const where = `${idColumn} = ?` + (extra.length ? ` AND ${extra[0]}` : '');
    const params = [userId, ...(extra.length ? extra.slice(1) : [])];
    return dbAll<Record<string, unknown>>(`SELECT * FROM ${table} WHERE ${where}`, ...params);
  };

  const [
    consent_records,
    experiment_reports,
    report_comments,
    class_students,
    quiz_submissions,
    name_change_requests,
    notifications,
    feedback,
    activity_log,
    session_log,
    subscription_notification_queue,
    tenant_memberships,
  ] = await Promise.all([
    generic('consent_records', 'user_id'),
    generic('experiment_reports', 'student_id'),
    generic('report_comments', 'author_id'),
    generic('class_students', 'student_id'),
    generic('quiz_submissions', 'student_id'),
    generic('name_change_requests', 'user_id'),
    generic('notifications', 'user_id'),
    generic('feedback', 'user_id'),
    generic('activity_log', 'actor_id'),
    generic('session_log', 'user_id'),
    generic('subscription_notification_queue', 'user_id'),
    generic('tenant_memberships', 'member_id'),
  ]);

  const classesTaught = await dbAll<Record<string, unknown>>(
    'SELECT * FROM classes WHERE teacher_id = ?',
    userId,
  );

  const direct_messages = await dbAll<Record<string, unknown>>(
    'SELECT * FROM direct_messages WHERE sender_id = ? OR receiver_id = ?',
    userId,
    userId,
  );

  const subscriptions = await dbAll<Record<string, unknown>>(
    'SELECT * FROM subscriptions WHERE owner_id = ? AND owner_type = ?',
    userId,
    'user',
  );

  const invoices = await dbAll<Record<string, unknown>>(
    'SELECT * FROM invoices WHERE owner_id = ? AND owner_type = ?',
    userId,
    'user',
  );

  const email_change_requests = await dbAll<Record<string, unknown>>(
    'SELECT * FROM email_change_requests WHERE requester_id = ? AND requester_type = ?',
    userId,
    'user',
  );

  return {
    exported_at: new Date().toISOString(),
    user,
    consent_records,
    experiment_reports,
    report_comments,
    classes_taught: classesTaught,
    class_students,
    quiz_submissions,
    name_change_requests,
    email_change_requests,
    notifications,
    feedback,
    activity_log,
    session_log,
    subscription_notification_queue,
    tenant_memberships,
    direct_messages,
    subscriptions,
    invoices,
  };
}
