import { Hono } from 'hono';
import { zValidator } from '@hono/zod-validator';
import { z } from 'zod';
import { getCookie } from 'hono/cookie';
import { verifyAccessToken } from '../auth/jwt.js';
import { db } from '../../db/index.js';
import { createApprovalRequest } from './services.js';

const schoolCreateRoutes = new Hono<{ Variables: { schoolId: number } }>();

const schoolAuth = async (c: any, next: any) => {
  const token = getCookie(c, 'access_token');
  if (!token) return c.json({ success: false, message: 'غير مصرح' }, 401);
  try {
    const payload = await verifyAccessToken(token);
    if (payload.role !== 'school') return c.json({ success: false, message: 'غير مصرح' }, 403);
    c.set('schoolId', Number(payload.sub));
    await next();
  } catch {
    return c.json({ success: false, message: 'غير مصرح' }, 401);
  }
};

const schoolCreateSchema = z.object({
  type: z.enum(['class_creation', 'class_deletion', 'class_edit', 'user_creation', 'user_edit', 'report_deletion']),
  target_user_id: z.number().int(),
  target_user_name: z.string().min(1),
  class_id: z.string().optional(),
  report_id: z.number().int().optional(),
  title: z.string().min(1).max(200),
  description: z.string().min(1).max(2000),
  metadata: z.string().optional(),
});

schoolCreateRoutes.post('/school/create', schoolAuth, zValidator('json', schoolCreateSchema), async (c) => {
  const schoolId = c.get('schoolId');
  const body = c.req.valid('json');

  const school = await db.get<{ id: number; name: string; email: string }>('SELECT id, name, email FROM schools WHERE id = ?', schoolId);
  if (!school) return c.json({ success: false, message: 'School not found' }, 404);

  const result = await createApprovalRequest({
    type: body.type as any,
    requester_type: 'school',
    requester_id: school.id,
    requester_name: school.name,
    approver_type: 'admin',
    target_user_id: body.target_user_id || school.id,
    target_user_name: body.target_user_name,
    class_id: body.class_id,
    report_id: body.report_id,
    school_id: school.id,
    title: body.title,
    description: body.description,
    metadata: body.metadata,
  });

  return c.json({ success: true, id: result.id });
});

export { schoolCreateRoutes };
