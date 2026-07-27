import { Hono } from 'hono';
import { zValidator } from '@hono/zod-validator';
import { z } from 'zod';
import { authMiddleware } from '../auth/middleware.js';
import { hashPassword } from '../../modules/auth/crypto.js';
import { setAccessCookie } from '../../modules/auth/cookies.js';
import { impersonateUser, updatePassword } from '../../modules/auth/services.js';
import * as svc from './services.js';
import * as activitySvc from '../activity/service.js';
import * as feedbackSvc from './feedback-service.js';
import * as warnSvc from './warning-service.js';
import * as detailSvc from './user-detail-service.js';
import * as sessionSvc from '../sessions/service.js';
import * as healthSvc from './system-health-service.js';
import * as exportSvc from './export-service.js';
import * as auditSvc from './audit-service.js';
import type { User } from '@my-modern-app/shared-types';

const updateRoleSchema = z.object({
  role: z.enum(['student', 'teacher', 'admin']),
});

const createUserSchema = z.object({
  name: z.string().min(2).max(100),
  email: z.string().email(),
  password: z.string().min(8).max(128),
  role: z.enum(['student', 'teacher', 'admin']),
});

const adminResetPasswordSchema = z.object({
  password: z.string().min(8).max(128),
});

const updateUserSchema = z.object({
  name: z.string().min(2).max(100).optional(),
  email: z.string().email().optional(),
});

const createClassSchema = z.object({
  name: z.string().min(2).max(100),
  code: z.string().min(2).max(20).optional(),
  teacher_id: z.number().int().positive(),
});

type Variables = { user: User };

const app = new Hono<{ Variables: Variables }>();

// Admin-only middleware
app.use(authMiddleware);
app.use(async (c, next) => {
  const user = c.get('user');
  if (user.role !== 'admin') {
    return c.json({ success: false, message: 'غير مصرح — يقتصر على الأدمن' }, 403);
  }
  await next();
});

// GET /users
app.get('/users', async (c) => {
  const list = await svc.getAllUsers();
  return c.json({ success: true, users: list });
});

// GET /stats
app.get('/stats', async (c) => {
  const stats = await svc.getSystemStats();
  return c.json({ success: true, stats });
});

// GET /classes
app.get('/classes', async (c) => {
  const list = await svc.getAllClassesWithTeachers();
  return c.json({ success: true, classes: list });
});

// GET /reports
app.get('/reports', async (c) => {
  const list = await svc.getAllReportsWithDetails();
  return c.json({ success: true, reports: list });
});

// DELETE /users/:id
app.delete('/users/:id', async (c) => {
  const id = Number(c.req.param('id'));
  const result = await svc.deleteUser(id);
  return c.json(result);
});

// PATCH /users/:id/role
app.patch('/users/:id/role', zValidator('json', updateRoleSchema), async (c) => {
  const id = Number(c.req.param('id'));
  const { role } = c.req.valid('json');
  const result = await svc.updateUserRole(id, role);
  return c.json(result);
});

// POST /users
app.post('/users', zValidator('json', createUserSchema), async (c) => {
  const { name, email, password, role } = c.req.valid('json');
  const passwordHash = await hashPassword(password);
  const result = await svc.createUser(name, email, passwordHash, role);
  return c.json(result, 201);
});

// DELETE /classes/:id
app.delete('/classes/:id', async (c) => {
  const id = c.req.param('id');
  const result = await svc.deleteClass(id);
  return c.json(result);
});

// GET /activity
app.get('/activity', async (c) => {
  const list = await activitySvc.getRecentActivity();
  return c.json({ success: true, activities: list });
});

// GET /activity/stats
app.get('/activity/stats', async (c) => {
  const stats = await activitySvc.getActivityStats();
  return c.json({ success: true, stats });
});

// GET /insights
app.get('/insights', async (c) => {
  const insights = await activitySvc.getSmartInsights();
  return c.json({ success: true, insights });
});

// GET /feedback
app.get('/feedback', async (c) => {
  const list = await feedbackSvc.getAllFeedback();
  const stats = await feedbackSvc.getFeedbackStats();
  return c.json({ success: true, feedback: list, stats });
});

// PATCH /feedback/:id/status
app.patch('/feedback/:id/status', async (c) => {
  const id = Number(c.req.param('id'));
  const { status } = await c.req.json();
  const result = await feedbackSvc.updateFeedbackStatus(id, status);
  return c.json(result);
});

// GET /users/:id/full
app.get('/users/:id/full', async (c) => {
  const id = Number(c.req.param('id'));
  const profile = await detailSvc.getUserFullProfile(id);
  if (!profile) return c.json({ success: false, message: 'User not found' }, 404);
  return c.json({ success: true, ...profile });
});

// POST /users/:id/ban
app.post('/users/:id/ban', async (c) => {
  const id = Number(c.req.param('id'));
  const { reason } = await c.req.json();
  const result = await detailSvc.banUser(id, reason);
  return c.json(result);
});

// POST /users/:id/unban
app.post('/users/:id/unban', async (c) => {
  const id = Number(c.req.param('id'));
  const result = await detailSvc.unbanUser(id);
  return c.json(result);
});

// POST /warnings
app.post('/warnings', async (c) => {
  const admin = c.get('user');
  const { userId, title, message, severity } = await c.req.json();
  const result = await warnSvc.createWarning(admin.id, userId, title, message, severity);
  return c.json(result, 201);
});

// GET /warnings
app.get('/warnings', async (c) => {
  const list = await warnSvc.getAllWarnings();
  return c.json({ success: true, warnings: list });
});

// GET /warnings/:userId
app.get('/warnings/:userId', async (c) => {
  const userId = Number(c.req.param('userId'));
  const list = await warnSvc.getWarningsForUser(userId);
  return c.json({ success: true, warnings: list });
});

// POST /notes
app.post('/notes', async (c) => {
  const admin = c.get('user');
  const { userId, note } = await c.req.json();
  const result = await detailSvc.addNote(admin.id, userId, note);
  return c.json(result, 201);
});

// GET /notes/:userId
app.get('/notes/:userId', async (c) => {
  const userId = Number(c.req.param('userId'));
  const list = await detailSvc.getUserFullProfile(userId);
  return c.json({ success: true, notes: list?.notes || [] });
});

// GET /sessions
app.get('/sessions', async (c) => {
  const list = await sessionSvc.getActiveSessions();
  return c.json({ success: true, sessions: list });
});

// GET /health
app.get('/health', async (c) => {
  const health = await healthSvc.getSystemHealth();
  return c.json({ success: true, health });
});

// GET /audit
app.get('/audit', async (c) => {
  const list = await auditSvc.getAuditLog();
  return c.json({ success: true, audit: list });
});

// GET /export/:type
app.get('/export/:type', async (c) => {
  const type = c.req.param('type');
  let csv = '';
  let filename = 'export.csv';
  switch (type) {
    case 'users': csv = await exportSvc.exportUsers(); filename = 'users.csv'; break;
    case 'reports': csv = await exportSvc.exportReports(); filename = 'reports.csv'; break;
    case 'classes': csv = await exportSvc.exportClasses(); filename = 'classes.csv'; break;
    case 'feedback': csv = await exportSvc.exportFeedback(); filename = 'feedback.csv'; break;
    case 'activity': csv = await exportSvc.exportActivity(); filename = 'activity.csv'; break;
    default: return c.json({ success: false, message: 'Invalid export type' }, 400);
  }
  c.header('Content-Type', 'text/csv; charset=utf-8');
  c.header('Content-Disposition', `attachment; filename="${filename}"`);
  return c.body(csv);
});

// POST /impersonate/:id
app.post('/impersonate/:id', async (c) => {
  const admin = c.get('user');
  const targetId = Number(c.req.param('id'));
  const result = await impersonateUser(targetId);
  if (!result) return c.json({ success: false, message: 'User not found' }, 404);
  setAccessCookie(c, result.token);
  await activitySvc.logActivity(admin.id, admin.name, admin.role, 'impersonate', 'user', String(targetId), `Admin impersonated ${result.user.name} (${result.user.email})`);
  return c.json({ success: true, user: result.user });
});

// POST /users/:id/reset-password
app.post('/users/:id/reset-password', zValidator('json', adminResetPasswordSchema), async (c) => {
  const id = Number(c.req.param('id'));
  const { password } = c.req.valid('json');
  const ok = await updatePassword(id, password);
  if (!ok) return c.json({ success: false, message: 'Update failed' }, 500);
  return c.json({ success: true });
});

// GET /classes/:id/students — get students of a class
app.get('/classes/:id/students', async (c) => {
  const classId = c.req.param('id');
  const students = await svc.getClassStudentsForAdmin(classId);
  return c.json({ success: true, students });
});

// PATCH /classes/:id — update class (rename, transfer teacher)
app.patch('/classes/:id', async (c) => {
  const classId = c.req.param('id');
  const body = await c.req.json();
  const result = await svc.updateClassForAdmin(classId, body);
  if (!result.success) return c.json(result, 400);
  return c.json(result);
});

// PATCH /reports/:id/grade — update report grade
app.patch('/reports/:id/grade', async (c) => {
  const reportId = Number(c.req.param('id'));
  const { grade, feedback } = await c.req.json();
  const result = await svc.updateReportGradeForAdmin(reportId, grade, feedback);
  if (!result.success) return c.json(result, 400);
  return c.json(result);
});

// PATCH /users/:id — update user name/email
app.patch('/users/:id', zValidator('json', updateUserSchema), async (c) => {
  const id = Number(c.req.param('id'));
  const { name, email } = c.req.valid('json');
  const result = await svc.updateUserForAdmin(id, { name, email });
  if (!result.success) return c.json(result, 400);
  return c.json(result);
});

// POST /classes — create a new class
app.post('/classes', zValidator('json', createClassSchema), async (c) => {
  const { name, code, teacher_id } = c.req.valid('json');
  const result = await svc.createClassForAdmin(name, code, teacher_id);
  if (!result.success) return c.json(result, 400);
  return c.json(result, 201);
});

// DELETE /reports/:id — delete a report
app.delete('/reports/:id', async (c) => {
  const id = Number(c.req.param('id'));
  const result = await svc.deleteReportForAdmin(id);
  return c.json(result);
});

// GET /teachers — list all teachers (for class transfer dropdown)
app.get('/teachers', async (c) => {
  const list = await svc.getAllTeachers();
  return c.json({ success: true, teachers: list });
});

// GET /settings — get all system settings
app.get('/settings', async (c) => {
  const settings = await svc.getSystemSettings();
  return c.json({ success: true, settings });
});

// PATCH /settings — update a system setting
app.patch('/settings', async (c) => {
  const user = c.get('user') as User;
  const { key, value } = await c.req.json();
  const result = await svc.updateSystemSetting(key, value, user.id);
  return c.json(result);
});

export { app as adminRoutes };
