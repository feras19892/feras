import { zValidator } from '@hono/zod-validator';
import { z } from 'zod';
import type { Hono } from 'hono';
import * as svc from './services.js';
import { verifyAdminPassword } from './admin-password.js';
import { db } from '../../db/index.js';
import type { User } from '@my-modern-app/shared-types';

const createClassSchema = z.object({
  name: z.string().min(2).max(100),
  code: z.string().min(2).max(20).optional(),
  teacher_id: z.number().int().positive(),
});

// School-scoped admins may only act on classes within their own school.
// Legacy classes may have NULL school_id — fall back to the teacher's school.
async function classInAdminScope(admin: User, classId: string): Promise<boolean> {
  if (!admin.school_id) return true;
  const row = await db.get<{ school_id: number | null }>(
    `SELECT COALESCE(c.school_id, u.school_id) as school_id FROM classes c LEFT JOIN users u ON c.teacher_id = u.id WHERE c.id = ?`,
    classId,
  );
  return !!row && row.school_id === admin.school_id;
}

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
    if (!(await classInAdminScope(admin as User, id))) {
      return c.json({ success: false, message: 'غير مصرح' }, 403);
    }
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
    const admin = c.get('user') as User;
    if (!(await classInAdminScope(admin, classId))) {
      return c.json({ success: false, message: 'غير مصرح' }, 403);
    }
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
    const admin = c.get('user') as User;
    if (!(await classInAdminScope(admin, classId))) {
      return c.json({ success: false, message: 'غير مصرح' }, 403);
    }
    if (body.teacher_id !== undefined && admin.school_id) {
      const teacher = await db.get<{ school_id: number | null }>(`SELECT school_id FROM users WHERE id = ? AND role = 'teacher'`, body.teacher_id);
      if (!teacher || teacher.school_id !== admin.school_id) {
        return c.json({ success: false, message: 'غير مصرح' }, 403);
      }
    }
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
    const admin = c.get('user') as User;
    if (admin.school_id) {
      const teacher = await db.get<{ school_id: number | null }>(`SELECT school_id FROM users WHERE id = ? AND role = 'teacher'`, teacher_id);
      if (!teacher || teacher.school_id !== admin.school_id) {
        return c.json({ success: false, message: 'غير مصرح' }, 403);
      }
    }
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
    if (!(await classInAdminScope(user as User, classId))) {
      return c.json({ success: false, message: 'غير مصرح' }, 403);
    }
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
    const admin = c.get('user') as User;
    if (!(await classInAdminScope(admin, classId))) {
      return c.json({ success: false, message: 'غير مصرح' }, 403);
    }
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
