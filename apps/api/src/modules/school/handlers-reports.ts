import { Hono } from 'hono';
import { zValidator } from '@hono/zod-validator';
import { z } from 'zod';
import { db } from '../../db/index.js';
import {
  getSchoolDetailedReports, getOutstandingStudents, getStrugglingStudents, getTeacherEvaluation,
} from './services.js';
import { schoolAuthMiddleware } from '../auth/middleware.js';
import * as feedbackSvc from '../admin/feedback-service.js';
import type { School } from '@my-modern-app/shared-types';

function validId(idStr: string): number | null {
  const n = Number(idStr);
  return Number.isFinite(n) && n > 0 ? n : null;
}

type Vars = { school: School };
const reportRoutes = new Hono<{ Variables: Vars }>();
const schoolAuth = schoolAuthMiddleware;

// ─── School Detailed Reports ───
reportRoutes.get('/reports/detailed', schoolAuth, async (c) => {
  const school = c.get('school') as School;
  const date = c.req.query('date');
  const report = await getSchoolDetailedReports(school.id, date);
  return c.json({ success: true, report });
});

reportRoutes.get('/reports/outstanding-students', schoolAuth, async (c) => {
  const school = c.get('school') as School;
  const limitRaw = c.req.query('limit');
  const limit = limitRaw ? Math.min(100, Math.max(1, Number(limitRaw) || 20)) : 20;
  const students = await getOutstandingStudents(school.id, limit);
  return c.json({ success: true, students });
});

reportRoutes.get('/reports/struggling-students', schoolAuth, async (c) => {
  const school = c.get('school') as School;
  const limitRaw = c.req.query('limit');
  const limit = limitRaw ? Math.min(100, Math.max(1, Number(limitRaw) || 20)) : 20;
  const students = await getStrugglingStudents(school.id, limit);
  return c.json({ success: true, students });
});

reportRoutes.get('/reports/teacher-evaluation', schoolAuth, async (c) => {
  const school = c.get('school') as School;
  const evaluations = await getTeacherEvaluation(school.id);
  return c.json({ success: true, evaluations });
});

// ─── School Feedback Monitoring ───
reportRoutes.get('/feedback', schoolAuth, async (c) => {
  const school = c.get('school') as School;
  const feedback = await feedbackSvc.getSchoolFeedback(school.id);
  const stats = await feedbackSvc.getSchoolFeedbackStats(school.id);
  return c.json({ success: true, feedback, stats });
});

reportRoutes.patch('/feedback/:id/status', schoolAuth, zValidator('json', z.object({ status: z.enum(['open', 'resolved', 'dismissed']) })), async (c) => {
  const school = c.get('school') as School;
  const id = validId(c.req.param('id'));
  if (!id) return c.json({ success: false, message: 'Invalid ID' }, 400);
  const item = await db.get<{ school_id: number | null }>('SELECT school_id FROM feedback WHERE id = ?', id);
  if (!item) return c.json({ success: false, message: 'غير موجود' }, 404);
  if (item.school_id !== school.id) return c.json({ success: false, message: 'غير مصرح' }, 403);
  const { status } = c.req.valid('json');
  await feedbackSvc.updateFeedbackStatus(id, status);
  return c.json({ success: true });
});

export { reportRoutes as schoolReportRoutes };
