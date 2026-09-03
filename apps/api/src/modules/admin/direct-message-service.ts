import { db } from '../../db/index.js';
import { createNotification } from '../notifications/services.js';
import { translateToArabic } from '../../shared/translation.js';

export async function sendDirectMessage(senderId: number, senderName: string, receiverId: number, content: string) {
  const trimmed = content.trim();
  if (!trimmed) return { success: false, message: 'Empty message' };
  if (trimmed.length > 1000) return { success: false, message: 'Message too long' };

  const translatedContent = await translateToArabic(trimmed);

  const result = await db.run(
    `INSERT INTO direct_messages (sender_id, receiver_id, content, translated_content) VALUES (?, ?, ?, ?)`,
    senderId, receiverId, trimmed, translatedContent,
  );

  const msg = await db.get(
    `SELECT dm.*, s.name as sender_name, r.name as receiver_name
     FROM direct_messages dm
     JOIN users s ON dm.sender_id = s.id
     JOIN users r ON dm.receiver_id = r.id
     WHERE dm.id = ?`,
    Number(result.lastID),
  );

  await createNotification({
    user_id: receiverId,
    type: 'direct_message',
    title: `💬 رسالة جديدة من ${senderName}`,
    message: trimmed.slice(0, 100),
  });

  return { success: true, message: msg };
}

export async function getConversation(userId1: number, userId2: number, limit = 100) {
  return db.all(
    `SELECT dm.*, s.name as sender_name, r.name as receiver_name
     FROM direct_messages dm
     JOIN users s ON dm.sender_id = s.id
     JOIN users r ON dm.receiver_id = r.id
     WHERE (dm.sender_id = ? AND dm.receiver_id = ?)
        OR (dm.sender_id = ? AND dm.receiver_id = ?)
     ORDER BY dm.created_at ASC LIMIT ?`,
    userId1, userId2, userId2, userId1, limit,
  );
}

export async function markConversationRead(receiverId: number, senderId: number) {
  await db.run(
    `UPDATE direct_messages SET is_read = 1 WHERE receiver_id = ? AND sender_id = ? AND is_read = 0`,
    receiverId, senderId,
  );
  return { success: true };
}

export async function markAllMessagesRead(receiverId: number) {
  await db.run(
    `UPDATE direct_messages SET is_read = 1 WHERE receiver_id = ? AND is_read = 0`,
    receiverId,
  );
  return { success: true };
}

export async function getUnreadMessageCount(userId: number) {
  const row = await db.get(
    `SELECT COUNT(*) as count FROM direct_messages WHERE receiver_id = ? AND is_read = 0`,
    userId,
  );
  return row?.count || 0;
}

export async function getConversationsList(userId: number) {
  return db.all(
    `SELECT
       CASE WHEN dm.sender_id = ? THEN dm.receiver_id ELSE dm.sender_id END as other_id,
       CASE WHEN dm.sender_id = ? THEN r.name ELSE s.name END as other_name,
       CASE WHEN dm.sender_id = ? THEN r.role ELSE s.role END as other_role,
       COALESCE(dm.translated_content, dm.content) as last_message,
       dm.created_at as last_at,
       (SELECT COUNT(*) FROM direct_messages dm2
        WHERE dm2.receiver_id = ? AND dm2.sender_id =
          CASE WHEN dm.sender_id = ? THEN dm.receiver_id ELSE dm.sender_id END
        AND dm2.is_read = 0) as unread_count
     FROM direct_messages dm
     JOIN users s ON dm.sender_id = s.id
     JOIN users r ON dm.receiver_id = r.id
     WHERE dm.sender_id = ? OR dm.receiver_id = ?
     GROUP BY other_id
     ORDER BY dm.created_at DESC`,
    userId, userId, userId, userId, userId, userId, userId,
  );
}
