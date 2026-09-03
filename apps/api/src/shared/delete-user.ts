import { db } from '../db/index.js';

export async function deleteUserCompletely(userId: number): Promise<void> {
  await db.run('BEGIN IMMEDIATE');
  try {
    await db.run('DELETE FROM refresh_tokens WHERE user_id = ?', userId);
    await db.run('DELETE FROM class_students WHERE student_id = ?', userId);
    await db.run('DELETE FROM leaderboard_cache WHERE student_id = ?', userId);
    await db.run('DELETE FROM experiment_reports WHERE student_id = ?', userId);
    await db.run('UPDATE experiment_reports SET teacher_id = NULL WHERE teacher_id = ?', userId);
    await db.run('UPDATE experiment_reports SET admin_graded_by = NULL WHERE admin_graded_by = ?', userId);
    await db.run('DELETE FROM class_messages WHERE user_id = ?', userId);
    await db.run('DELETE FROM class_chat_reads WHERE user_id = ?', userId);
    await db.run('DELETE FROM chat_spam_tracker WHERE user_id = ?', userId);
    await db.run('DELETE FROM report_comments WHERE author_id = ?', userId);
    await db.run('DELETE FROM quiz_submissions WHERE student_id = ?', userId);
    await db.run('DELETE FROM name_change_requests WHERE user_id = ?', userId);
    await db.run('DELETE FROM email_verification_codes WHERE user_id = ?', userId);
    await db.run('DELETE FROM password_reset_codes WHERE user_id = ?', userId);
    await db.run('DELETE FROM notifications WHERE user_id = ?', userId);
    await db.run('DELETE FROM scheduled_notifications WHERE user_id = ?', userId);
    await db.run('DELETE FROM warnings WHERE user_id = ?', userId);
    await db.run('DELETE FROM feedback WHERE user_id = ?', userId);
    await db.run('DELETE FROM activity_log WHERE actor_id = ?', userId);
    await db.run('DELETE FROM session_log WHERE user_id = ?', userId);
    await db.run('UPDATE complaints SET assigned_to = NULL WHERE assigned_to = ?', userId);
    await db.run('DELETE FROM direct_messages WHERE sender_id = ? OR receiver_id = ?', userId, userId);
    await db.run('DELETE FROM email_change_requests WHERE requester_type = ? AND requester_id = ?', 'user', userId);
    await db.run('DELETE FROM consent_records WHERE user_id = ?', userId);
    await db.run('DELETE FROM tenant_memberships WHERE member_id = ?', userId);
    await db.run('DELETE FROM invite_codes WHERE owner_id = ? AND owner_type = ?', userId, 'teacher');
    await db.run('DELETE FROM invoices WHERE owner_id = ? AND owner_type = ?', userId, 'user');
    await db.run('DELETE FROM subscriptions WHERE owner_id = ? AND owner_type = ?', userId, 'user');
    await db.run('DELETE FROM subscription_notification_queue WHERE user_id = ?', userId);
    await db.run('DELETE FROM penalties WHERE student_id = ? OR teacher_id = ?', userId, userId);
    await db.run('DELETE FROM student_badges WHERE student_id = ?', userId);
    await db.run('DELETE FROM experiment_questions WHERE assigned_by = ?', userId);
    await db.run('DELETE FROM users WHERE id = ?', userId);
    await db.run('COMMIT');
  } catch (err) {
    await db.run('ROLLBACK');
    throw err;
  }
}
