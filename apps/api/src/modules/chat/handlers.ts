import { Hono } from 'hono';
import { z } from 'zod';
import { zValidator } from '@hono/zod-validator';
import { authMiddleware } from '../auth/middleware.js';
import * as svc from './services.js';
import type { User } from '@my-modern-app/shared-types';
import { db } from '../../db/index.js';
import { getSystemSettingBool } from '../../shared/system-settings.js';

type Variables = { user: User };
const app = new Hono<{ Variables: Variables }>();
app.use(authMiddleware);

async function isChatEnabled(): Promise<boolean> {
  return getSystemSettingBool('chat_enabled', true);
}

// Verify user is member of class (student) or teacher of class
async function verifyClassAccess(classId: string, userId: number, role: string): Promise<boolean> {
  if (role === 'admin') return true;
  if (role === 'teacher') {
    const cls = await db.get(`SELECT id FROM classes WHERE id = ? AND teacher_id = ?`, classId, userId);
    return !!cls;
  }
  if (role === 'school') {
    const cls = await db.get<{ school_id: number | null }>(
      `SELECT u.school_id FROM classes c JOIN users u ON c.teacher_id = u.id WHERE c.id = ?`,
      classId,
    );
    if (!cls || !cls.school_id) return false;
    return cls.school_id === userId;
  }
  // student
  const member = await db.get(`SELECT 1 FROM class_students WHERE class_id = ? AND student_id = ?`, classId, userId);
  return !!member;
}

// GET /:classId — list messages
app.get('/:classId', async (c) => {
  const user = c.get('user');
  const classId = c.req.param('classId');

  const hasAccess = await verifyClassAccess(classId, user.id, user.role);
  if (!hasAccess) return c.json({ success: false, message: 'غير مصرح' }, 403);

  const limit = Math.min(200, Math.max(1, Number(c.req.query('limit') || '100')));
  const offset = Math.max(0, Number(c.req.query('offset') || '0'));
  const messages = await svc.getClassMessages(classId, limit, offset);
  return c.json({ success: true, messages });
});

// POST /:classId — send message
const sendMessageSchema = z.object({
  content: z.string().min(1).max(500),
});

app.post('/:classId', zValidator('json', sendMessageSchema), async (c) => {
  const user = c.get('user');
  const classId = c.req.param('classId');
  const body = c.req.valid('json');

  const enabled = await isChatEnabled();
  if (!enabled) return c.json({ success: false, message: 'تم تعطيل الدردشة مؤقتاً بواسطة الإدارة' }, 403);

  const hasAccess = await verifyClassAccess(classId, user.id, user.role);
  if (!hasAccess) return c.json({ success: false, message: 'غير مصرح' }, 403);

  // Block messages if class is frozen
  const cls = await db.get<{ is_frozen: number }>('SELECT is_frozen FROM classes WHERE id = ?', classId);
  if (cls?.is_frozen) {
    return c.json({ success: false, message: 'هذا الفصل مُجمّد — لا يمكن إرسال رسائل' }, 403);
  }

  const result = await svc.sendMessage(classId, user.id, user.name, user.role, body.content);

  if (result.muted) {
    return c.json({
      success: false,
      message: 'تم كتمك مؤقتاً بسبب الإرسال السريع. انتظر 30 ثانية.',
      muted: true,
    }, 429);
  }

  if (result.flagged) {
    return c.json({
      success: true,
      message: result.message,
      flagged: true,
      warning: 'تم حظر رسالتك لاحتوائها على كلمات غير لائقة. تم إبلاغ الإدارة.',
    });
  }

  return c.json({ success: true, message: result.message });
});

// DELETE /:messageId — delete message
app.delete('/msg/:messageId', async (c) => {
  const user = c.get('user');
  const messageId = Number(c.req.param('messageId'));

  const result = await svc.deleteMessage(messageId, user.id, user.role);
  if (!result.success) return c.json({ success: false, message: 'غير مصرح' }, 403);
  return c.json({ success: true });
});

// GET /flagged/list — admin only
app.get('/flagged/list', async (c) => {
  const user = c.get('user');
  if (user.role !== 'admin') return c.json({ success: false, message: 'غير مصرح' }, 403);
  const messages = await svc.getFlaggedMessages();
  return c.json({ success: true, messages });
});

// GET /admin/all — admin only, all recent messages
app.get('/admin/all', async (c) => {
  const user = c.get('user');
  if (user.role !== 'admin') return c.json({ success: false, message: 'غير مصرح' }, 403);
  const messages = await svc.getAllChatMessagesForAdmin();
  return c.json({ success: true, messages });
});

// GET /admin/stats — admin only, chat statistics
app.get('/admin/stats', async (c) => {
  const user = c.get('user');
  if (user.role !== 'admin') return c.json({ success: false, message: 'غير مصرح' }, 403);
  const stats = await svc.getChatStatsForAdmin();
  return c.json({ success: true, stats });
});

// GET /unread-counts — unread message counts per class for current user
app.get('/unread-counts', async (c) => {
  const user = c.get('user');
  const counts = await svc.getUnreadCounts(user.id, user.role);
  return c.json({ success: true, counts });
});

// POST /:classId/read — mark chat as read for current user
app.post('/:classId/read', async (c) => {
  const user = c.get('user');
  const classId = c.req.param('classId');
  const hasAccess = await verifyClassAccess(classId, user.id, user.role);
  if (!hasAccess) return c.json({ success: false, message: 'غير مصرح' }, 403);
  await svc.markChatRead(user.id, classId);
  return c.json({ success: true });
});

export { app as chatRoutes };
