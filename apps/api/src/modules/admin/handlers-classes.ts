import { zValidator } from '@hono/zod-validator';
import { z } from 'zod';
import type { Hono } from 'hono';
import * as svc from './services.js';
import { verifyAdminPassword } from './admin-password.js';
import type { User } from '@my-modern-app/shared-types';

const createClassSchema = z.object({
  name: z.string().min(2).max(100),
  code: z.string().min(2).max(20).optional(),
  teacher_id: z.number().int().positive(),
});

export function registerClassRoutes(app: Hono<{ Variables: { user: User } }>): void {
  app.get('/classes', async (c) => {
    try {
      const user = c.get('user');
      const adminSchoolId = (user as User).school_id ?? undefined;
      const list = await svc.getAllClassesWithTeachers(adminSchoolId);
      return c.json({ success: true, classes: list });
    } catch (err) {
      if (process.env.NODE_ENV !== 'production') console.error('admin getClasses error:', err);
      return c.json({ success: false, message: 'Failed to load classes' }, 500);
    }
  });

  app.post('/classes/:id/delete', zValidator('json', z.object({ admin_password: z.string().min(1, 'كلمة مرور الإدمن مطلوبة') })), async (c) => {
    const id = c.req.param('id');
    const { admin_password } = c.req.valid('json');
    const admin = c.get('user');
    const pwCheck = await verifyAdminPassword(admin, admin_password);
    if (pwCheck) return c.json(pwCheck, 401);
    try {
      const result = await svc.deleteClass(id);
      return c.json(result);
    } catch (err) {
      if (process.env.NODE_ENV !== 'production') console.error('admin deleteClass error:', err);
      return c.json({ success: false, message: 'Failed to delete class' }, 500);
    }
  });

  app.get('/classes/:id/students', async (c) => {
    const classId = c.req.param('id');
    try {
      const students = await svc.getClassStudentsForAdmin(classId);
      return c.json({ success: true, students });
    } catch (err) {
      if (process.env.NODE_ENV !== 'production') console.error('admin getClassStudents error:', err);
      return c.json({ success: false, message: 'Failed to load students' }, 500);
    }
  });

  app.patch('/classes/:id', zValidator('json', z.object({
    name: z.string().min(2).max(100).optional(),
    teacher_id: z.number().int().positive().optional(),
  })), async (c) => {
    const classId = c.req.param('id');
    const body = c.req.valid('json');
    try {
      const result = await svc.updateClassForAdmin(classId, body);
      if (!result.success) return c.json(result, 400);
      return c.json(result);
    } catch (err) {
      if (process.env.NODE_ENV !== 'production') console.error('admin updateClass error:', err);
      return c.json({ success: false, message: 'Failed to update class' }, 500);
    }
  });

  app.post('/classes', zValidator('json', createClassSchema), async (c) => {
    const { name, code, teacher_id } = c.req.valid('json');
    try {
      const result = await svc.createClassForAdmin(name, code, teacher_id);
      if (!result.success) return c.json(result, 400);
      return c.json(result, 201);
    } catch (err) {
      if (process.env.NODE_ENV !== 'production') console.error('admin createClass error:', err);
      return c.json({ success: false, message: 'Failed to create class' }, 500);
    }
  });

  app.post('/classes/:id/freeze', zValidator('json', z.object({
    reason: z.string().min(1).max(500),
  })), async (c) => {
    const classId = c.req.param('id');
    const { reason } = c.req.valid('json');
    const user = c.get('user');
    try {
      const result = await svc.freezeClassForAdmin(classId, reason, user.id);
      if (!result.success) return c.json(result, 400);
      return c.json(result);
    } catch (err) {
      if (process.env.NODE_ENV !== 'production') console.error('admin freezeClass error:', err);
      return c.json({ success: false, message: 'Failed to freeze class' }, 500);
    }
  });

  app.post('/classes/:id/unfreeze', async (c) => {
    const classId = c.req.param('id');
    try {
      const result = await svc.unfreezeClassForAdmin(classId);
      if (!result.success) return c.json(result, 400);
      return c.json(result);
    } catch (err) {
      if (process.env.NODE_ENV !== 'production') console.error('admin unfreezeClass error:', err);
      return c.json({ success: false, message: 'Failed to unfreeze class' }, 500);
    }
  });
}
