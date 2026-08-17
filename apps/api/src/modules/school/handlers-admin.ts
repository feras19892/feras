import { Hono } from 'hono';
import { adminAuthMiddleware } from '../auth/middleware.js';
import {
  adminGetSchoolUsers, adminGetSchoolClasses, adminGetSchoolReports,
  adminRemoveSchoolUser, adminBlockSchoolUser,
} from './services.js';

const adminSubRoutes = new Hono();
const adminAuth = adminAuthMiddleware;

function validId(idStr: string): number | null {
  const n = Number(idStr);
  return Number.isFinite(n) && n > 0 ? n : null;
}

adminSubRoutes.get('/admin/:id/users', adminAuth, async (c) => {
  const id = validId(c.req.param('id'));
  if (!id) return c.json({ success: false, message: 'Invalid school ID' }, 400);
  try {
    return c.json({ success: true, users: await adminGetSchoolUsers(id) });
  } catch (err) {
    if (process.env.NODE_ENV !== 'production') console.error('admin getSchoolUsers error:', err);
    return c.json({ success: false, message: 'Failed to load users' }, 500);
  }
});

adminSubRoutes.get('/admin/:id/classes', adminAuth, async (c) => {
  const id = validId(c.req.param('id'));
  if (!id) return c.json({ success: false, message: 'Invalid school ID' }, 400);
  try {
    return c.json({ success: true, classes: await adminGetSchoolClasses(id) });
  } catch (err) {
    if (process.env.NODE_ENV !== 'production') console.error('admin getSchoolClasses error:', err);
    return c.json({ success: false, message: 'Failed to load classes' }, 500);
  }
});

adminSubRoutes.get('/admin/:id/reports', adminAuth, async (c) => {
  const id = validId(c.req.param('id'));
  if (!id) return c.json({ success: false, message: 'Invalid school ID' }, 400);
  try {
    return c.json({ success: true, reports: await adminGetSchoolReports(id) });
  } catch (err) {
    if (process.env.NODE_ENV !== 'production') console.error('admin getSchoolReports error:', err);
    return c.json({ success: false, message: 'Failed to load reports' }, 500);
  }
});

adminSubRoutes.delete('/admin/:id/users/:userId', adminAuth, async (c) => {
  const id = validId(c.req.param('id'));
  const userId = validId(c.req.param('userId'));
  if (!id || !userId) return c.json({ success: false, message: 'Invalid ID' }, 400);
  const result = await adminRemoveSchoolUser(id, userId);
  if (!result.success) return c.json({ success: false, message: result.message }, 400);
  return c.json({ success: true });
});

adminSubRoutes.patch('/admin/:id/users/:userId/block', adminAuth, async (c) => {
  const id = validId(c.req.param('id'));
  const userId = validId(c.req.param('userId'));
  if (!id || !userId) return c.json({ success: false, message: 'Invalid ID' }, 400);
  const result = await adminBlockSchoolUser(id, userId, true);
  if (!result.success) return c.json({ success: false, message: result.message }, 400);
  return c.json({ success: true });
});

adminSubRoutes.patch('/admin/:id/users/:userId/unblock', adminAuth, async (c) => {
  const id = validId(c.req.param('id'));
  const userId = validId(c.req.param('userId'));
  if (!id || !userId) return c.json({ success: false, message: 'Invalid ID' }, 400);
  const result = await adminBlockSchoolUser(id, userId, false);
  if (!result.success) return c.json({ success: false, message: result.message }, 400);
  return c.json({ success: true });
});

export { adminSubRoutes };
