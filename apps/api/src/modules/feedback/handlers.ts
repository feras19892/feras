import { Hono } from 'hono';
import { zValidator } from '@hono/zod-validator';
import { z } from 'zod';
import { authMiddleware } from '../auth/middleware.js';
import * as svc from '../admin/feedback-service.js';
import { db } from '../../db/index.js';
import type { User } from '@my-modern-app/shared-types';
import { sendTelegramMessage } from '../../shared/email.js';
import { createNotification } from '../notifications/services.js';

type Variables = { user: User };
const app = new Hono<{ Variables: Variables }>();

// POST /api/feedback — any authenticated user can submit
app.use(authMiddleware);

const feedbackSchema = z.object({
  type: z.enum(['complaint', 'rating', 'suggestion']),
  message: z.string().min(1).max(5000),
  category: z.string().max(100).optional(),
  experimentId: z.string().optional(),
  experimentName: z.string().max(200).optional(),
  pagePath: z.string().max(500).optional(),
  deviceInfo: z.string().max(500).optional(),
  rating: z.number().int().min(1).max(5).optional(),
});

const typeLabels: Record<string, string> = {
  complaint: 'شكوى',
  rating: 'تقييم',
  suggestion: 'اقتراح',
};

async function sendTelegram(
  type: string,
  message: string,
  userName: string,
  category?: string,
  experimentName?: string,
  pagePath?: string,
  rating?: number,
) {
  const stars = rating ? '⭐'.repeat(rating) : '';
  const typeEmoji = type === 'complaint' ? '🚨' : type === 'rating' ? '⭐' : '💡';
  const text = [
    `${typeEmoji} ${typeLabels[type] || type}${category ? ` — ${category}` : ''}`,
    experimentName ? `📚 التجربة: ${experimentName}` : '',
    pagePath ? `🔗 الصفحة: ${pagePath}` : '',
    stars ? `التقييم: ${stars} (${rating}/5)` : '',
    '',
    `👤 من: ${userName}`,
    `💬 الرسالة:`,
    message,
  ].filter(Boolean).join('\n');

  await sendTelegramMessage(text);
}

app.post('/', zValidator('json', feedbackSchema), async (c) => {
  try {
    const user = c.get('user');
    const { type, message, category, experimentId, experimentName, pagePath, deviceInfo, rating } = c.req.valid('json');

    let feedbackUserId: number | null = null;
    let feedbackSchoolId: number | null = null;

    if (user.role === 'school') {
      // School accounts are not in the users table, so store them as school_id
      feedbackSchoolId = user.id;
      feedbackUserId = null;
    } else {
      feedbackUserId = user.id;
      const userRow = await db.get<{ school_id: number | null }>(
        'SELECT school_id FROM users WHERE id = ?', user.id,
      );
      feedbackSchoolId = userRow?.school_id ?? null;
      if (feedbackSchoolId != null) {
        const school = await db.get<{ id: number }>('SELECT id FROM schools WHERE id = ?', feedbackSchoolId);
        if (!school) feedbackSchoolId = null;
      }
    }

    const result = await svc.createFeedback(
      feedbackUserId,
      user.name,
      type,
      message,
      experimentId,
      experimentName,
      rating,
      feedbackSchoolId,
      pagePath,
      category,
      deviceInfo,
    );

    // Notify Telegram and wait for it to complete
    await sendTelegram(type, message, user.name, category, experimentName, pagePath, rating);

    // Real-time in-app admin notifications
    try {
      const admins = await db.all<{ id: number }[]>(`SELECT id FROM users WHERE role = 'admin'`);
      const shortMessage = `${category ? `${category} — ` : ''}${message.slice(0, 120)}${message.length > 120 ? '...' : ''}`;
      for (const admin of admins) {
        await createNotification({
          user_id: admin.id,
          type: 'feedback',
          title: `${typeLabels[type] || type} جديد من ${user.name}`,
          message: shortMessage,
          priority: 'immediate',
        });
      }
    } catch (notifErr: any) {
      console.error('[feedback] notification error:', notifErr);
    }

    return c.json({ success: true, id: result.lastID }, 201);
  } catch (err: any) {
    console.error('[feedback] submit error:', err);
    return c.json({ success: false, message: err?.message || 'Unknown server error' }, 500);
  }
});

export { app as feedbackRoutes };
