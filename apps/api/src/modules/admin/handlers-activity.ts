import { zValidator } from '@hono/zod-validator';
import { z } from 'zod';
import type { Hono } from 'hono';
import * as activitySvc from '../activity/service.js';
import * as feedbackSvc from './feedback-service.js';
import * as warnSvc from './warning-service.js';
import * as detailSvc from './user-detail-service.js';
import { createNotification } from '../notifications/services.js';
import type { User } from '@my-modern-app/shared-types';

export function registerActivityRoutes(app: Hono<{ Variables: { user: User } }>): void {
  app.get('/activity', async (c) => {
    try {
      const list = await activitySvc.getRecentActivity();
      return c.json({ success: true, activities: list });
    } catch (err) {
      if (process.env.NODE_ENV !== 'production') console.error('admin getActivity error:', err);
      return c.json({ success: false, message: 'Failed to load activity' }, 500);
    }
  });

  app.get('/activity/stats', async (c) => {
    try {
      const stats = await activitySvc.getActivityStats();
      return c.json({ success: true, stats });
    } catch (err) {
      if (process.env.NODE_ENV !== 'production') console.error('admin activityStats error:', err);
      return c.json({ success: false, message: 'Failed to load stats' }, 500);
    }
  });

  app.get('/insights', async (c) => {
    try {
      const insights = await activitySvc.getSmartInsights();
      return c.json({ success: true, insights });
    } catch (err) {
      if (process.env.NODE_ENV !== 'production') console.error('admin insights error:', err);
      return c.json({ success: false, message: 'Failed to load insights' }, 500);
    }
  });

  app.get('/feedback', async (c) => {
    try {
      const list = await feedbackSvc.getAllFeedback();
      const stats = await feedbackSvc.getFeedbackStats();
      return c.json({ success: true, feedback: list, stats });
    } catch (err) {
      if (process.env.NODE_ENV !== 'production') console.error('admin getFeedback error:', err);
      return c.json({ success: false, message: 'Failed to load feedback' }, 500);
    }
  });

  app.patch('/feedback/:id/status', zValidator('json', z.object({ status: z.enum(['open', 'resolved', 'dismissed']) })), async (c) => {
    const id = Number(c.req.param('id'));
    const { status } = c.req.valid('json');
    try {
      const result = await feedbackSvc.updateFeedbackStatus(id, status);
      return c.json(result);
    } catch (err) {
      if (process.env.NODE_ENV !== 'production') console.error('admin updateFeedbackStatus error:', err);
      return c.json({ success: false, message: 'Failed to update feedback status' }, 500);
    }
  });

  app.post('/warnings', zValidator('json', z.object({
    userId: z.number().int().positive(),
    title: z.string().min(1).max(200),
    message: z.string().min(1).max(2000),
    severity: z.enum(['low', 'normal', 'high', 'critical']).optional().default('normal'),
  })), async (c) => {
    const admin = c.get('user') as User;
    const { userId, title, message, severity } = c.req.valid('json');
    const result = await warnSvc.createWarning(admin.id, userId, title, message, severity);
    if (result.success) {
      const sevEmoji = severity === 'critical' ? '🚨' : severity === 'high' ? '⚠️' : severity === 'normal' ? '🔔' : '📝';
      await createNotification({
        user_id: userId,
        type: 'warning',
        title: `${sevEmoji} تنبيه من الإدارة: ${title}`,
        message: message.slice(0, 150),
      });
    }
    return c.json(result, 201);
  });

  app.get('/warnings', async (c) => {
    try {
      const list = await warnSvc.getAllWarnings();
      return c.json({ success: true, warnings: list });
    } catch (err) {
      if (process.env.NODE_ENV !== 'production') console.error('admin getWarnings error:', err);
      return c.json({ success: false, message: 'Failed to load warnings' }, 500);
    }
  });

  app.get('/warnings/:userId', async (c) => {
    const userId = Number(c.req.param('userId'));
    try {
      const list = await warnSvc.getWarningsForUser(userId);
      return c.json({ success: true, warnings: list });
    } catch (err) {
      if (process.env.NODE_ENV !== 'production') console.error('admin getWarningsForUser error:', err);
      return c.json({ success: false, message: 'Failed to load warnings' }, 500);
    }
  });

  app.post('/notes', zValidator('json', z.object({
    userId: z.number().int().positive(),
    note: z.string().min(1).max(2000),
  })), async (c) => {
    const admin = c.get('user');
    const { userId, note } = c.req.valid('json');
    const result = await detailSvc.addNote(admin.id, userId, note);
    return c.json(result, 201);
  });

  app.get('/notes/:userId', async (c) => {
    const userId = Number(c.req.param('userId'));
    const list = await detailSvc.getUserFullProfile(userId);
    return c.json({ success: true, notes: list?.notes || [] });
  });
}
