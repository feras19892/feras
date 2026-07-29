import { db } from '../../db/index.js';
import { createNotification } from '../notifications/services.js';
import { filterMessage } from './filter.js';

const SPAM_WINDOW_MS = 10_000; // 10 seconds
const SPAM_MAX_MESSAGES = 5; // max 5 messages per 10s
const SPAM_MUTE_DURATION_MS = 30_000; // mute for 30s

export interface ClassMessage {
  id: number;
  class_id: string;
  user_id: number;
  user_name: string;
  user_role: string;
  content: string;
  is_flagged: number;
  flagged_reason: string | null;
  created_at: string;
}

export async function getClassMessages(classId: string, limit = 100): Promise<ClassMessage[]> {
  return db.all(
    `SELECT * FROM class_messages WHERE class_id = ? ORDER BY created_at DESC LIMIT ?`,
    classId, limit
  );
}

async function checkSpamRate(userId: number, classId: string): Promise<{ muted: boolean; muteRemainingMs: number }> {
  const now = Date.now();
  const row = await db.get<{ message_count: number; last_message_at: string; muted_until: string | null }>(
    `SELECT message_count, last_message_at, muted_until FROM chat_spam_tracker WHERE user_id = ? AND class_id = ?`,
    userId, classId,
  );

  if (row?.muted_until) {
    const muteEnd = new Date(row.muted_until).getTime();
    if (now < muteEnd) {
      return { muted: true, muteRemainingMs: muteEnd - now };
    }
  }

  // Check rate within window
  if (row?.last_message_at) {
    const lastAt = new Date(row.last_message_at).getTime();
    if (now - lastAt < SPAM_WINDOW_MS && row.message_count >= SPAM_MAX_MESSAGES) {
      // Mute the user
      const mutedUntil = new Date(now + SPAM_MUTE_DURATION_MS).toISOString();
      await db.run(
        `UPDATE chat_spam_tracker SET muted_until = ? WHERE user_id = ? AND class_id = ?`,
        mutedUntil, userId, classId,
      );
      return { muted: true, muteRemainingMs: SPAM_MUTE_DURATION_MS };
    }
  }

  return { muted: false, muteRemainingMs: 0 };
}

async function updateSpamTracker(userId: number, classId: string): Promise<void> {
  const now = new Date().toISOString();
  const row = await db.get<{ message_count: number; last_message_at: string }>(
    `SELECT message_count, last_message_at FROM chat_spam_tracker WHERE user_id = ? AND class_id = ?`,
    userId, classId,
  );

  if (!row) {
    await db.run(
      `INSERT INTO chat_spam_tracker (user_id, class_id, message_count, last_message_at) VALUES (?, ?, 1, ?)`,
      userId, classId, now,
    );
  } else {
    const lastAt = new Date(row.last_message_at).getTime();
    const withinWindow = Date.now() - lastAt < SPAM_WINDOW_MS;
    await db.run(
      `UPDATE chat_spam_tracker SET message_count = ?, last_message_at = ?, muted_until = NULL WHERE user_id = ? AND class_id = ?`,
      withinWindow ? row.message_count + 1 : 1, now, userId, classId,
    );
  }
}

export async function sendMessage(
  classId: string,
  userId: number,
  userName: string,
  userRole: string,
  content: string
): Promise<{ success: boolean; message?: ClassMessage; flagged?: boolean; reason?: string; muted?: boolean }> {
  const trimmed = content.trim();
  if (!trimmed) return { success: false, reason: 'empty' };
  if (trimmed.length > 500) return { success: false, reason: 'too_long' };

  // Check spam rate limit
  const spamCheck = await checkSpamRate(userId, classId);
  if (spamCheck.muted) {
    return { success: false, reason: 'spam_muted', muted: true };
  }

  const result = filterMessage(trimmed);

  let flagged = 0;
  let flaggedReason: string | null = null;

  if (!result.clean) {
    flagged = 1;
    flaggedReason = `Blocked words [${result.language}]: ${result.flaggedWords.join(', ')}`;

    // Notify all admins
    const admins = await db.all(`SELECT id FROM users WHERE role = 'admin'`);
    for (const admin of admins) {
      await createNotification({
        user_id: admin.id,
        type: 'chat_flagged',
        title: `تنبيه: رسالة مخالفة في الدردشة`,
        message: `المستخدم "${userName}" (${userRole}) حاول إرسال كلمات غير لائقة في دردشة الفصل. الكلمات: ${result.flaggedWords.join(', ')}`,
        class_id: classId,
      });
    }
  }

  const insertResult = await db.run(
    `INSERT INTO class_messages (class_id, user_id, user_name, user_role, content, is_flagged, flagged_reason)
     VALUES (?, ?, ?, ?, ?, ?, ?)`,
    classId, userId, userName, userRole,
    flagged ? result.cleanedContent : trimmed,
    flagged, flaggedReason
  );

  // Update spam tracker for non-flagged messages
  if (!flagged) {
    await updateSpamTracker(userId, classId);
  }

  const msg = await db.get(`SELECT * FROM class_messages WHERE id = ?`, Number(insertResult.lastID));
  return { success: true, message: msg, flagged: flagged === 1, reason: flaggedReason || undefined };
}

export async function getFlaggedMessages(limit = 50): Promise<ClassMessage[]> {
  return db.all(
    `SELECT * FROM class_messages WHERE is_flagged = 1 ORDER BY created_at DESC LIMIT ?`,
    limit
  );
}

export async function getAllChatMessagesForAdmin(limit = 200) {
  return db.all(
    `SELECT m.*, c.name as class_name FROM class_messages m
     LEFT JOIN classes c ON m.class_id = c.id
     ORDER BY m.created_at DESC LIMIT ?`,
    limit
  );
}

export async function getChatStatsForAdmin() {
  const total = await db.get(`SELECT COUNT(*) as count FROM class_messages`);
  const flagged = await db.get(`SELECT COUNT(*) as count FROM class_messages WHERE is_flagged = 1`);
  const byClass = await db.all(
    `SELECT c.id, c.name, COUNT(m.id) as msg_count, SUM(m.is_flagged) as flagged_count
     FROM classes c
     LEFT JOIN class_messages m ON c.id = m.class_id
     GROUP BY c.id
     ORDER BY msg_count DESC
     LIMIT 20`
  );
  return {
    total: total?.count || 0,
    flagged: flagged?.count || 0,
    byClass: byClass.map((r: Record<string, unknown>) => ({
      id: r.id,
      name: r.name,
      msg_count: r.msg_count || 0,
      flagged_count: r.flagged_count || 0,
    })),
  };
}

export async function deleteMessage(messageId: number, userId: number, userRole: string): Promise<{ success: boolean }> {
  const msg = await db.get(`SELECT * FROM class_messages WHERE id = ?`, messageId);
  if (!msg) return { success: false };

  // Only the sender or teacher/admin can delete
  if (msg.user_id !== userId && userRole !== 'teacher' && userRole !== 'admin') {
    return { success: false };
  }

  await db.run(`DELETE FROM class_messages WHERE id = ?`, messageId);
  return { success: true };
}

export async function getUnreadCounts(userId: number, role: string): Promise<Record<string, number>> {
  let classIds: string[] = [];
  if (role === 'teacher') {
    const rows = await db.all(`SELECT id FROM classes WHERE teacher_id = ?`, userId);
    classIds = rows.map((r: any) => r.id);
  } else if (role === 'student') {
    const rows = await db.all(`SELECT class_id FROM class_students WHERE student_id = ?`, userId);
    classIds = rows.map((r: any) => r.class_id);
  } else if (role === 'admin') {
    const rows = await db.all(`SELECT id FROM classes`);
    classIds = rows.map((r: any) => r.id);
  }

  const result: Record<string, number> = {};
  for (const classId of classIds) {
    const readRow = await db.get(`SELECT last_read_at FROM class_chat_reads WHERE user_id = ? AND class_id = ?`, userId, classId);
    const readAt = readRow?.last_read_at || '1970-01-01 00:00:00';
    const countRow = await db.get(
      `SELECT COUNT(*) as count FROM class_messages WHERE class_id = ? AND created_at > ? AND user_id != ?`,
      classId, readAt, userId
    );
    result[classId] = countRow?.count || 0;
  }
  return result;
}

export async function markChatRead(userId: number, classId: string): Promise<void> {
  await db.run(
    `INSERT INTO class_chat_reads (user_id, class_id, last_read_at) VALUES (?, ?, CURRENT_TIMESTAMP)
     ON CONFLICT(user_id, class_id) DO UPDATE SET last_read_at = CURRENT_TIMESTAMP`,
    userId, classId
  );
}
