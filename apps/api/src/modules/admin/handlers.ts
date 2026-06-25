import { Hono } from 'hono';
import { zValidator } from '@hono/zod-validator';
import { z } from 'zod';
import { authMiddleware } from '../../shared/middleware/auth.js';
import { hashPassword } from '../../modules/auth/crypto.js';
import { signAccessToken } from '../../modules/auth/jwt.js';
import { setAccessCookie } from '../../modules/auth/cookies.js';
import { db } from '../../db/index.js';
import * as svc from './services.js';
import * as activitySvc from './activity-service.js';
import * as feedbackSvc from './feedback-service.js';
import * as warnSvc from './warning-service.js';
import * as detailSvc from './user-detail-service.js';
import * as sessionSvc from './session-service.js';
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
  const target = await db.get<{ id: number; email: string; name: string; role: string }>(`SELECT id, email, name, role FROM users WHERE id = ?`, targetId);
  if (!target) return c.json({ success: false, message: 'User not found' }, 404);
  const token = await signAccessToken({ sub: String(target.id), email: target.email, role: target.role as User['role'] });
  setAccessCookie(c, token);
  await activitySvc.logActivity(admin.id, admin.name, admin.role, 'impersonate', 'user', String(targetId), `Admin impersonated ${target.name} (${target.email})`);
  return c.json({ success: true, user: target });
});

// POST /users/:id/reset-password
app.post('/users/:id/reset-password', zValidator('json', adminResetPasswordSchema), async (c) => {
  const id = Number(c.req.param('id'));
  const { password } = c.req.valid('json');
  const passwordHash = await hashPassword(password);
  await db.run(`UPDATE users SET password_hash = ? WHERE id = ?`, passwordHash, id);
  return c.json({ success: true });
});

export { app as adminRoutes };
