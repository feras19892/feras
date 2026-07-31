import { Hono } from 'hono';
import { zValidator } from '@hono/zod-validator';
import { z } from 'zod';
import { db } from '../../db/index.js';
import { schoolRegisterSchema, schoolLoginSchema } from '../auth/schemas.js';
import {
  registerSchool, loginSchool, getSchoolById, getSchoolStats,
  getSchoolUsers, getSchoolClasses, removeSchoolUser, getSchoolReports,
  updateSchoolName, changeSchoolPassword, blockSchoolUser, unblockSchoolUser,
  getAllSchools, toggleSchoolActive, updateSchool, deleteSchool,
  adminGetSchoolUsers, adminGetSchoolClasses, adminGetSchoolReports,
  adminRemoveSchoolUser, adminBlockSchoolUser,
  createEmailChangeRequest, getEmailChangeRequests, reviewEmailChangeRequest,
  getSchoolUserDetail, getSchoolClassDetail, createSchoolWarning,
  getSchoolWarnings, reportToAdmin, getSchoolSessionLog, getSchoolActivityLog,
  getTeacherPerformance, createCapacityRequest, getCapacityRequests,
  reviewCapacityRequest, freezeClass, unfreezeClass,
  getSchoolDetailedReports, getOutstandingStudents, getStrugglingStudents, getTeacherEvaluation,
} from './services.js';
import { setRefreshCookie, setAccessCookie, clearRefreshCookie, clearAccessCookie } from '../auth/cookies.js';
import * as feedbackSvc from '../admin/feedback-service.js';
import { verifyAccessToken } from '../auth/jwt.js';
import { getCookie } from 'hono/cookie';
import { streamSSE } from 'hono/streaming';
import { addSchoolSSEClient } from '../notifications/sse.js';
import * as notifSvc from '../notifications/services.js';
import type { School } from '@my-modern-app/shared-types';
import type { User } from '@my-modern-app/shared-types';

type Vars = { school: School; user: User };
const schoolRoutes = new Hono<{ Variables: Vars }>();

// ─── Middleware ───
const schoolAuth = async (c: any, next: any) => {
  const token = getCookie(c, 'access_token');
  if (!token) return c.json({ success: false, message: 'Unauthorized' }, 401);
  try {
    const payload = await verifyAccessToken(token);
    if (payload.role !== 'school') return c.json({ success: false, message: 'School access required' }, 403);
    const school = await getSchoolById(Number(payload.sub));
    if (!school) return c.json({ success: false, message: 'School not found' }, 401);
    c.set('school', school);
    await next();
  } catch {
    return c.json({ success: false, message: 'Invalid or expired token' }, 401);
  }
};

const adminAuth = async (c: any, next: any) => {
  const token = getCookie(c, 'access_token');
  if (!token) return c.json({ success: false, message: 'Unauthorized' }, 401);
  try {
    const payload = await verifyAccessToken(token);
    if (payload.role !== 'admin') return c.json({ success: false, message: 'Admin access required' }, 403);
    await next();
  } catch {
    return c.json({ success: false, message: 'Invalid or expired token' }, 401);
  }
};

// ─── Schemas ───
const updateNameSchema = z.object({ name: z.string().min(2).max(200) });
const changePasswordSchema = z.object({
  current_password: z.string().min(1),
  new_password: z.string().min(8).max(128),
});
const emailChangeSchema = z.object({ requested_email: z.string().email() });
const reviewRequestSchema = z.object({ status: z.enum(['approved', 'rejected']) });

// ─── Auth ───
schoolRoutes.post('/register', zValidator('json', schoolRegisterSchema), async (c) => {
  const regRow = await db.get(`SELECT value FROM system_settings WHERE key = 'stop_registration'`);
  if (regRow?.value === 'true') {
    return c.json({ success: false, message: 'تم إيقاف التسجيل مؤقتاً بواسطة الإدارة. يرجى المحاولة لاحقاً.' }, 403);
  }
  const body = c.req.valid('json');
  const result = await registerSchool(body.name, body.email, body.password, body.max_students, body.max_teachers);
  if (!result.success) return c.json({ success: false, message: result.message }, 409);
  return c.json({ success: true, school: result.school, code: result.code }, 201);
});

schoolRoutes.post('/login', zValidator('json', schoolLoginSchema), async (c) => {
  const body = c.req.valid('json');
  const result = await loginSchool(body.email, body.password);
  if (!result.success) return c.json({ success: false, message: result.message }, 401);
  if (result.token) setAccessCookie(c, result.token);
  if (result.refreshToken) setRefreshCookie(c, result.refreshToken);
  return c.json({ success: true, school: result.school });
});

schoolRoutes.post('/logout', async (c) => {
  clearAccessCookie(c);
  clearRefreshCookie(c);
  return c.json({ success: true });
});

// ─── School Profile ───
schoolRoutes.get('/me', schoolAuth, async (c) => {
  return c.json({ success: true, school: c.get('school') as School });
});

schoolRoutes.patch('/me', schoolAuth, zValidator('json', updateNameSchema), async (c) => {
  const school = c.get('school') as School;
  void school;
  const { name } = c.req.valid('json');
  const result = await updateSchoolName(school.id, name);
  if (!result.success) return c.json({ success: false, message: result.message }, 400);
  const updated = await getSchoolById(school.id);
  return c.json({ success: true, school: updated });
});

schoolRoutes.post('/password', schoolAuth, zValidator('json', changePasswordSchema), async (c) => {
  const school = c.get('school') as School;
  void school;
  const { current_password, new_password } = c.req.valid('json');
  const result = await changeSchoolPassword(school.id, current_password, new_password);
  if (!result.success) return c.json({ success: false, message: result.message }, 400);
  return c.json({ success: true });
});

// ─── School Data ───
schoolRoutes.get('/stats', schoolAuth, async (c) => {
  const school = c.get('school') as School;
  void school;
  const stats = await getSchoolStats(school.id);
  return c.json({ success: true, stats, school });
});

schoolRoutes.get('/users', schoolAuth, async (c) => {
  const school = c.get('school') as School;
  void school;
  const page = Math.max(1, Number(c.req.query('page') || '1'));
  const limit = Math.min(100, Math.max(1, Number(c.req.query('limit') || '50')));
  const result = await getSchoolUsers(school.id, page, limit);
  return c.json({ success: true, ...result });
});

schoolRoutes.get('/classes', schoolAuth, async (c) => {
  const school = c.get('school') as School;
  void school;
  const classes = await getSchoolClasses(school.id);
  return c.json({ success: true, classes });
});

schoolRoutes.get('/reports', schoolAuth, async (c) => {
  const school = c.get('school') as School;
  void school;
  const page = Math.max(1, Number(c.req.query('page') || '1'));
  const limit = Math.min(100, Math.max(1, Number(c.req.query('limit') || '50')));
  const result = await getSchoolReports(school.id, page, limit);
  return c.json({ success: true, ...result });
});

// ─── School User Management ───
schoolRoutes.delete('/users/:userId', schoolAuth, async (c) => {
  const school = c.get('school') as School;
  void school;
  try {
    const result = await removeSchoolUser(school.id, Number(c.req.param('userId')));
    if (!result.success) return c.json({ success: false, message: result.message }, 400);
    return c.json({ success: true });
  } catch (err) {
    if (process.env.NODE_ENV !== 'production') console.error('removeSchoolUser error:', err);
    return c.json({ success: false, message: 'Failed to remove user' }, 500);
  }
});

schoolRoutes.patch('/users/:userId/block', schoolAuth, async (c) => {
  const school = c.get('school') as School;
  void school;
  try {
    const result = await blockSchoolUser(school.id, Number(c.req.param('userId')));
    if (!result.success) return c.json({ success: false, message: result.message }, 400);
    return c.json({ success: true });
  } catch (err) {
    if (process.env.NODE_ENV !== 'production') console.error('blockSchoolUser error:', err);
    return c.json({ success: false, message: 'Failed to block user' }, 500);
  }
});

schoolRoutes.patch('/users/:userId/unblock', schoolAuth, async (c) => {
  const school = c.get('school') as School;
  void school;
  try {
    const result = await unblockSchoolUser(school.id, Number(c.req.param('userId')));
    if (!result.success) return c.json({ success: false, message: result.message }, 400);
    return c.json({ success: true });
  } catch (err) {
    if (process.env.NODE_ENV !== 'production') console.error('unblockSchoolUser error:', err);
    return c.json({ success: false, message: 'Failed to unblock user' }, 500);
  }
});

// ─── Email Change Request ───
schoolRoutes.post('/email-change-request', schoolAuth, zValidator('json', emailChangeSchema), async (c) => {
  const school = c.get('school') as School;
  void school;
  const { requested_email } = c.req.valid('json');
  const result = await createEmailChangeRequest('school', school.id, school.email, requested_email);
  if (!result.success) return c.json({ success: false, message: result.message }, 400);
  return c.json({ success: true });
});

// ─── Admin: School List ───
schoolRoutes.get('/admin/all', adminAuth, async (c) => {
  return c.json({ success: true, schools: await getAllSchools() });
});

// ─── Admin: School Detail ───
schoolRoutes.get('/admin/:id', adminAuth, async (c) => {
  const id = Number(c.req.param('id'));
  const school = await getSchoolById(id);
  if (!school) return c.json({ success: false, message: 'School not found' }, 404);
  const stats = await getSchoolStats(id);
  return c.json({ success: true, school, stats });
});

schoolRoutes.patch('/admin/:id', adminAuth, async (c) => {
  const id = Number(c.req.param('id'));
  const body = await c.req.json();
  const updates: { name?: string; email?: string; max_students?: number; max_teachers?: number } = {};
  if (typeof body.name === 'string' && body.name.trim().length > 0) updates.name = body.name.trim().slice(0, 200);
  if (typeof body.email === 'string' && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(body.email)) updates.email = body.email.trim().slice(0, 255);
  if (typeof body.max_students === 'number' && body.max_students > 0 && body.max_students <= 100000) updates.max_students = Math.floor(body.max_students);
  if (typeof body.max_teachers === 'number' && body.max_teachers > 0 && body.max_teachers <= 1000) updates.max_teachers = Math.floor(body.max_teachers);
  const result = await updateSchool(id, updates);
  if (!result.success) return c.json({ success: false, message: result.message }, 400);
  return c.json({ success: true });
});

schoolRoutes.delete('/admin/:id', adminAuth, async (c) => {
  const result = await deleteSchool(Number(c.req.param('id')));
  if (!result.success) return c.json({ success: false, message: result.message }, 404);
  return c.json({ success: true });
});

schoolRoutes.patch('/admin/:id/toggle', adminAuth, async (c) => {
  const result = await toggleSchoolActive(Number(c.req.param('id')));
  if (!result.success) return c.json({ success: false, message: result.message }, 404);
  return c.json({ success: true });
});

// ─── Admin: School Sub-resources ───
schoolRoutes.get('/admin/:id/users', adminAuth, async (c) => {
  return c.json({ success: true, users: await adminGetSchoolUsers(Number(c.req.param('id'))) });
});

schoolRoutes.get('/admin/:id/classes', adminAuth, async (c) => {
  return c.json({ success: true, classes: await adminGetSchoolClasses(Number(c.req.param('id'))) });
});

schoolRoutes.get('/admin/:id/reports', adminAuth, async (c) => {
  return c.json({ success: true, reports: await adminGetSchoolReports(Number(c.req.param('id'))) });
});

schoolRoutes.delete('/admin/:id/users/:userId', adminAuth, async (c) => {
  const result = await adminRemoveSchoolUser(Number(c.req.param('id')), Number(c.req.param('userId')));
  if (!result.success) return c.json({ success: false, message: result.message }, 400);
  return c.json({ success: true });
});

schoolRoutes.patch('/admin/:id/users/:userId/block', adminAuth, async (c) => {
  const result = await adminBlockSchoolUser(Number(c.req.param('id')), Number(c.req.param('userId')), true);
  if (!result.success) return c.json({ success: false, message: result.message }, 400);
  return c.json({ success: true });
});

schoolRoutes.patch('/admin/:id/users/:userId/unblock', adminAuth, async (c) => {
  const result = await adminBlockSchoolUser(Number(c.req.param('id')), Number(c.req.param('userId')), false);
  if (!result.success) return c.json({ success: false, message: result.message }, 400);
  return c.json({ success: true });
});

// ─── Admin: Email Change Requests ───
schoolRoutes.get('/admin/email-requests', adminAuth, async (c) => {
  const requests = await getEmailChangeRequests();
  return c.json({ success: true, requests });
});

schoolRoutes.patch('/admin/email-requests/:id', adminAuth, zValidator('json', reviewRequestSchema), async (c) => {
  const id = Number(c.req.param('id'));
  const { status } = c.req.valid('json');
  const admin = c.get('user') as User;
  const result = await reviewEmailChangeRequest(id, status, admin?.id);
  if (!result.success) return c.json({ success: false, message: result.message }, 400);
  return c.json({ success: true });
});

// ─── School Oversight: User Detail ───
schoolRoutes.get('/users/:userId/detail', schoolAuth, async (c) => {
  const school = c.get('school') as School;
  const userId = Number(c.req.param('userId'));
  const detail = await getSchoolUserDetail(school.id, userId);
  if (!detail) return c.json({ success: false, message: 'User not found in this school' }, 404);
  return c.json({ success: true, ...detail });
});

// ─── School Oversight: Class Detail ───
schoolRoutes.get('/classes/:classId/detail', schoolAuth, async (c) => {
  const school = c.get('school') as School;
  const classId = c.req.param('classId');
  const detail = await getSchoolClassDetail(school.id, classId);
  if (!detail) return c.json({ success: false, message: 'Class not found in this school' }, 404);
  return c.json({ success: true, ...detail });
});

// ─── School Oversight: Warnings ───
const warningSchema = z.object({
  userId: z.number().int(),
  title: z.string().min(1).max(200),
  message: z.string().min(1).max(1000),
  severity: z.enum(['low', 'normal', 'high', 'critical']).default('normal'),
});

schoolRoutes.post('/warnings', schoolAuth, zValidator('json', warningSchema), async (c) => {
  const school = c.get('school') as School;
  const { userId, title, message, severity } = c.req.valid('json');
  const result = await createSchoolWarning(school.id, userId, title, message, severity);
  if (!result.success) return c.json({ success: false, message: result.message }, 400);
  return c.json({ success: true });
});

schoolRoutes.get('/warnings', schoolAuth, async (c) => {
  const school = c.get('school') as School;
  const warnings = await getSchoolWarnings(school.id);
  return c.json({ success: true, warnings });
});

// ─── School Oversight: Report to Admin ───
const reportSchema = z.object({
  userId: z.number().int(),
  reason: z.string().min(1).max(200),
  details: z.string().min(1).max(2000),
});

schoolRoutes.post('/report-to-admin', schoolAuth, zValidator('json', reportSchema), async (c) => {
  const school = c.get('school') as School;
  const { userId, reason, details } = c.req.valid('json');
  const result = await reportToAdmin(school.id, userId, reason, details);
  if (!result.success) return c.json({ success: false, message: result.message }, 400);
  return c.json({ success: true });
});

// ─── School Oversight: Session Log ───
schoolRoutes.get('/sessions', schoolAuth, async (c) => {
  const school = c.get('school') as School;
  const sessions = await getSchoolSessionLog(school.id);
  return c.json({ success: true, sessions });
});

// ─── School Oversight: Activity Log ───
schoolRoutes.get('/activity', schoolAuth, async (c) => {
  const school = c.get('school') as School;
  const activity = await getSchoolActivityLog(school.id);
  return c.json({ success: true, activity });
});

// ─── School: Teacher Performance ───
schoolRoutes.get('/teachers/performance', schoolAuth, async (c) => {
  const school = c.get('school') as School;
  const performance = await getTeacherPerformance(school.id);
  return c.json({ success: true, performance });
});

// ─── School: Capacity Requests ───
const capacitySchema = z.object({
  requested_max_students: z.number().int().positive().optional(),
  requested_max_teachers: z.number().int().positive().optional(),
  reason: z.string().min(1).max(500),
});

schoolRoutes.post('/capacity-request', schoolAuth, zValidator('json', capacitySchema), async (c) => {
  const school = c.get('school') as School;
  const body = c.req.valid('json');
  const result = await createCapacityRequest({
    school_id: school.id,
    school_name: school.name,
    current_max_students: school.max_students,
    current_max_teachers: school.max_teachers,
    requested_max_students: body.requested_max_students,
    requested_max_teachers: body.requested_max_teachers,
    reason: body.reason,
  });
  return c.json(result, 201);
});

schoolRoutes.get('/capacity-requests', schoolAuth, async (c) => {
  const school = c.get('school') as School;
  const status = c.req.query('status');
  const requests = await getCapacityRequests(school.id, status);
  return c.json({ success: true, requests });
});

// ─── Admin: Review Capacity Requests ───
schoolRoutes.get('/admin/capacity-requests', adminAuth, async (c) => {
  const status = c.req.query('status');
  const requests = await getCapacityRequests(undefined, status);
  return c.json({ success: true, requests });
});

schoolRoutes.patch('/admin/capacity-requests/:id', adminAuth, zValidator('json', z.object({
  status: z.enum(['approved', 'rejected']),
  response: z.string().optional(),
})), async (c) => {
  const id = Number(c.req.param('id'));
  const body = c.req.valid('json');
  const admin = c.get('user') as User;
  const result = await reviewCapacityRequest(id, body.status, admin?.id || 0, body.response);
  if (!result.success) return c.json({ success: false, message: result.message }, 400);
  return c.json({ success: true });
});

// ─── School: Class Freeze ───
const freezeSchema = z.object({
  class_id: z.string().min(1),
  reason: z.string().min(1).max(500),
});

schoolRoutes.post('/freeze-class', schoolAuth, zValidator('json', freezeSchema), async (c) => {
  const school = c.get('school') as School;
  const { class_id, reason } = c.req.valid('json');
  try {
    const result = await freezeClass(school.id, class_id, reason, school.id);
    if (!result.success) return c.json({ success: false, message: result.message }, 400);
    return c.json({ success: true });
  } catch (err) {
    if (process.env.NODE_ENV !== 'production') console.error('freeze-class error:', err);
    return c.json({ success: false, message: 'Failed to freeze class' }, 500);
  }
});

schoolRoutes.post('/unfreeze-class', schoolAuth, zValidator('json', z.object({ class_id: z.string().min(1) })), async (c) => {
  const school = c.get('school') as School;
  const { class_id } = c.req.valid('json');
  try {
    const result = await unfreezeClass(school.id, class_id);
    if (!result.success) return c.json({ success: false, message: result.message }, 400);
    return c.json({ success: true });
  } catch (err) {
    if (process.env.NODE_ENV !== 'production') console.error('unfreeze-class error:', err);
    return c.json({ success: false, message: 'Failed to unfreeze class' }, 500);
  }
});

// ─── School Notifications ───
schoolRoutes.get('/notifications/stream', schoolAuth, (c) => {
  const school = c.get('school') as School;
  return streamSSE(c, async (stream) => {
    let aborted = false;
    const cleanup = addSchoolSSEClient(school.id, stream.aborted as unknown as ReadableStreamDefaultController);

    await stream.writeSSE({ event: 'connected', data: JSON.stringify({ schoolId: school.id }) });

    const heartbeat = setInterval(async () => {
      if (aborted) return;
      try { await stream.writeSSE({ event: 'ping', data: String(Date.now()) }); }
      catch { aborted = true; }
    }, 30000);

    await new Promise<void>((resolve) => {
      stream.onAbort(() => {
        aborted = true;
        cleanup();
        clearInterval(heartbeat);
        resolve();
      });
    });
  });
});

schoolRoutes.get('/notifications', schoolAuth, async (c) => {
  const school = c.get('school') as School;
  const list = await notifSvc.getSchoolNotifications(school.id);
  return c.json({ success: true, notifications: list });
});

schoolRoutes.get('/notifications/unread-count', schoolAuth, async (c) => {
  const school = c.get('school') as School;
  const count = await notifSvc.getSchoolUnreadCount(school.id);
  return c.json({ success: true, count });
});

schoolRoutes.patch('/notifications/:id/read', schoolAuth, async (c) => {
  const school = c.get('school') as School;
  const id = Number(c.req.param('id'));
  await notifSvc.markSchoolNotificationAsRead(id, school.id);
  return c.json({ success: true });
});

schoolRoutes.patch('/notifications/read-all', schoolAuth, async (c) => {
  const school = c.get('school') as School;
  await notifSvc.markAllSchoolNotificationsAsRead(school.id);
  return c.json({ success: true });
});

schoolRoutes.delete('/notifications/:id', schoolAuth, async (c) => {
  const school = c.get('school') as School;
  const id = Number(c.req.param('id'));
  await notifSvc.deleteSchoolNotification(id, school.id);
  return c.json({ success: true });
});

schoolRoutes.patch('/notifications/:id/pin', schoolAuth, async (c) => {
  const school = c.get('school') as School;
  const id = Number(c.req.param('id'));
  const result = await notifSvc.togglePinSchoolNotification(id, school.id);
  return c.json(result);
});

// ─── School Detailed Reports ───
schoolRoutes.get('/reports/detailed', schoolAuth, async (c) => {
  const school = c.get('school') as School;
  const date = c.req.query('date');
  const report = await getSchoolDetailedReports(school.id, date);
  return c.json({ success: true, report });
});

schoolRoutes.get('/reports/outstanding-students', schoolAuth, async (c) => {
  const school = c.get('school') as School;
  const limit = c.req.query('limit') ? Number(c.req.query('limit')) : 20;
  const students = await getOutstandingStudents(school.id, limit);
  return c.json({ success: true, students });
});

schoolRoutes.get('/reports/struggling-students', schoolAuth, async (c) => {
  const school = c.get('school') as School;
  const limit = c.req.query('limit') ? Number(c.req.query('limit')) : 20;
  const students = await getStrugglingStudents(school.id, limit);
  return c.json({ success: true, students });
});

schoolRoutes.get('/reports/teacher-evaluation', schoolAuth, async (c) => {
  const school = c.get('school') as School;
  const evaluations = await getTeacherEvaluation(school.id);
  return c.json({ success: true, evaluations });
});

// ─── School Feedback Monitoring ───
schoolRoutes.get('/feedback', schoolAuth, async (c) => {
  const school = c.get('school') as School;
  void school;
  const feedback = await feedbackSvc.getSchoolFeedback(school.id);
  const stats = await feedbackSvc.getSchoolFeedbackStats(school.id);
  return c.json({ success: true, feedback, stats });
});

schoolRoutes.patch('/feedback/:id/status', schoolAuth, zValidator('json', z.object({ status: z.enum(['open', 'resolved', 'dismissed']) })), async (c) => {
  const school = c.get('school') as School;
  const id = Number(c.req.param('id'));
  // Verify the feedback belongs to this school
  const item = await db.get<{ school_id: number | null }>('SELECT school_id FROM feedback WHERE id = ?', id);
  if (!item) return c.json({ success: false, message: 'غير موجود' }, 404);
  if (item.school_id !== school.id) return c.json({ success: false, message: 'غير مصرح' }, 403);
  const { status } = c.req.valid('json');
  await feedbackSvc.updateFeedbackStatus(id, status);
  return c.json({ success: true });
});

export { schoolRoutes };
