import { Hono } from 'hono';
import { zValidator } from '@hono/zod-validator';
import { z } from 'zod';
import { authMiddleware, teacherAuthMiddleware } from '../auth/middleware.js';
import type { User } from '@my-modern-app/shared-types';
import * as svc from './services.js';
import { db } from '../../db/index.js';

type Variables = { user: User };
const app = new Hono<{ Variables: Variables }>();
app.use(authMiddleware);

const createScheduleSchema = z.object({
  class_id: z.number().int().positive(),
  day_of_week: z.number().int().min(0).max(6),
  start_time: z.string().regex(/^\d{2}:\d{2}$/),
  end_time: z.string().regex(/^\d{2}:\d{2}$/),
  subject: z.string().optional(),
  room: z.string().optional(),
});

// Create schedule (teacher only)
app.post('/schedule', zValidator('json', createScheduleSchema), async (c) => {
  const user = c.get('user');
  if (user.role !== 'teacher' && user.role !== 'admin') {
    return c.json({ success: false, message: 'غير مصرح' }, 403);
  }

  const body = c.req.valid('json');
  
  if (user.role === 'teacher') {
    const classRow = await db.get<{ teacher_id: number }>(
      'SELECT teacher_id FROM classes WHERE id = ?',
      body.class_id,
    );
    if (!classRow || classRow.teacher_id !== user.id) {
      return c.json({ success: false, message: 'غير مصرح — لا يمكنك إنشاء جدول لفصل لا تملكه' }, 403);
    }
  }

  try {
    const result = await svc.createSchedule({
      ...body,
      created_by: user.id,
    });
    return c.json({ success: true, id: result.id }, 201);
  } catch (err) {
    if (process.env.NODE_ENV !== 'production') console.error('createSchedule error:', err);
    return c.json({ success: false, message: 'Failed to create schedule' }, 500);
  }
});

// Get schedules for a class
app.get('/schedule/class/:classId', async (c) => {
  const user = c.get('user');
  const classId = Number(c.req.param('classId'));

  if (user.role === 'teacher') {
    const classRow = await db.get<{ teacher_id: number }>(
      'SELECT teacher_id FROM classes WHERE id = ?',
      classId,
    );
    if (!classRow || classRow.teacher_id !== user.id) {
      return c.json({ success: false, message: 'غير مصرح' }, 403);
    }
  } else if (user.role === 'student') {
    const member = await db.get(
      'SELECT 1 FROM class_students WHERE class_id = ? AND student_id = ?',
      classId, user.id,
    );
    if (!member) return c.json({ success: false, message: 'غير مصرح' }, 403);
  }

  try {
    const schedules = await svc.getSchedulesByClass(classId);
    return c.json({ success: true, schedules });
  } catch (err) {
    if (process.env.NODE_ENV !== 'production') console.error('getSchedulesByClass error:', err);
    return c.json({ success: false, message: 'Failed to load schedules' }, 500);
  }
});

// Get schedules for current teacher
app.get('/schedule/teacher', async (c) => {
  const user = c.get('user');
  if (user.role !== 'teacher' && user.role !== 'admin') {
    return c.json({ success: false, message: 'غير مصرح' }, 403);
  }

  try {
    const schedules = await svc.getSchedulesByTeacher(user.id);
    return c.json({ success: true, schedules });
  } catch (err) {
    if (process.env.NODE_ENV !== 'production') console.error('getSchedulesByTeacher error:', err);
    return c.json({ success: false, message: 'Failed to load schedules' }, 500);
  }
});

// Update schedule
app.patch('/schedule/:id', zValidator('json', createScheduleSchema.partial()), async (c) => {
  const user = c.get('user');
  if (user.role !== 'teacher' && user.role !== 'admin') {
    return c.json({ success: false, message: 'غير مصرح' }, 403);
  }

  const id = Number(c.req.param('id'));
  const body = c.req.valid('json');

  if (user.role === 'teacher') {
    const schedule = await db.get<{ class_id: number }>(
      'SELECT class_id FROM schedules WHERE id = ?',
      id,
    );
    if (!schedule) return c.json({ success: false, message: 'Schedule not found' }, 404);
    
    const classRow = await db.get<{ teacher_id: number }>(
      'SELECT teacher_id FROM classes WHERE id = ?',
      schedule.class_id,
    );
    if (!classRow || classRow.teacher_id !== user.id) {
      return c.json({ success: false, message: 'غير مصرح' }, 403);
    }
  }

  try {
    await svc.updateSchedule(id, body);
    return c.json({ success: true });
  } catch (err) {
    if (process.env.NODE_ENV !== 'production') console.error('updateSchedule error:', err);
    return c.json({ success: false, message: 'Failed to update schedule' }, 500);
  }
});

// Delete schedule
app.delete('/schedule/:id', async (c) => {
  const user = c.get('user');
  if (user.role !== 'teacher' && user.role !== 'admin') {
    return c.json({ success: false, message: 'غير مصرح' }, 403);
  }

  const id = Number(c.req.param('id'));

  if (user.role === 'teacher') {
    const schedule = await db.get<{ class_id: number }>(
      'SELECT class_id FROM schedules WHERE id = ?',
      id,
    );
    if (!schedule) return c.json({ success: false, message: 'Schedule not found' }, 404);
    
    const classRow = await db.get<{ teacher_id: number }>(
      'SELECT teacher_id FROM classes WHERE id = ?',
      schedule.class_id,
    );
    if (!classRow || classRow.teacher_id !== user.id) {
      return c.json({ success: false, message: 'غير مصرح' }, 403);
    }
  }

  try {
    await svc.deleteSchedule(id);
    return c.json({ success: true });
  } catch (err) {
    if (process.env.NODE_ENV !== 'production') console.error('deleteSchedule error:', err);
    return c.json({ success: false, message: 'Failed to delete schedule' }, 500);
  }
});

const createEventSchema = z.object({
  class_id: z.number().int().positive().optional(),
  event_type: z.enum(['deadline', 'exam', 'meeting', 'other']),
  title: z.string().min(1).max(200),
  description: z.string().optional(),
  recurrence_type: z.enum(['none', 'daily', 'weekly', 'monthly']),
  recurrence_value: z.number().int().optional(),
  start_date: z.string(),
  end_date: z.string().optional(),
});

// Create recurring event
app.post('/event', zValidator('json', createEventSchema), async (c) => {
  const user = c.get('user');
  if (user.role !== 'teacher' && user.role !== 'admin') {
    return c.json({ success: false, message: 'غير مصرح' }, 403);
  }

  const body = c.req.valid('json');

  if (body.class_id && user.role === 'teacher') {
    const classRow = await db.get<{ teacher_id: number }>(
      'SELECT teacher_id FROM classes WHERE id = ?',
      body.class_id,
    );
    if (!classRow || classRow.teacher_id !== user.id) {
      return c.json({ success: false, message: 'غير مصرح' }, 403);
    }
  }

  try {
    const result = await svc.createRecurringEvent({
      ...body,
      created_by: user.id,
    });
    return c.json({ success: true, id: result.id }, 201);
  } catch (err) {
    if (process.env.NODE_ENV !== 'production') console.error('createRecurringEvent error:', err);
    return c.json({ success: false, message: 'Failed to create event' }, 500);
  }
});

// Get events for a class
app.get('/event/class/:classId', async (c) => {
  const user = c.get('user');
  const classId = Number(c.req.param('classId'));

  if (user.role === 'teacher') {
    const classRow = await db.get<{ teacher_id: number }>(
      'SELECT teacher_id FROM classes WHERE id = ?',
      classId,
    );
    if (!classRow || classRow.teacher_id !== user.id) {
      return c.json({ success: false, message: 'غير مصرح' }, 403);
    }
  } else if (user.role === 'student') {
    const member = await db.get(
      'SELECT 1 FROM class_students WHERE class_id = ? AND student_id = ?',
      classId, user.id,
    );
    if (!member) return c.json({ success: false, message: 'غير مصرح' }, 403);
  }

  try {
    const events = await svc.getRecurringEventsByClass(classId);
    return c.json({ success: true, events });
  } catch (err) {
    if (process.env.NODE_ENV !== 'production') console.error('getRecurringEventsByClass error:', err);
    return c.json({ success: false, message: 'Failed to load events' }, 500);
  }
});

// Get events for current teacher
app.get('/event/teacher', async (c) => {
  const user = c.get('user');
  if (user.role !== 'teacher' && user.role !== 'admin') {
    return c.json({ success: false, message: 'غير مصرح' }, 403);
  }

  try {
    const events = await svc.getRecurringEventsByTeacher(user.id);
    return c.json({ success: true, events });
  } catch (err) {
    if (process.env.NODE_ENV !== 'production') console.error('getRecurringEventsByTeacher error:', err);
    return c.json({ success: false, message: 'Failed to load events' }, 500);
  }
});

// Update event
app.patch('/event/:id', zValidator('json', createEventSchema.partial()), async (c) => {
  const user = c.get('user');
  if (user.role !== 'teacher' && user.role !== 'admin') {
    return c.json({ success: false, message: 'غير مصرح' }, 403);
  }

  const id = Number(c.req.param('id'));
  const body = c.req.valid('json');

  if (user.role === 'teacher') {
    const event = await db.get<{ class_id: number | null; created_by: number | null }>(
      'SELECT class_id, created_by FROM recurring_events WHERE id = ?',
      id,
    );
    if (!event) return c.json({ success: false, message: 'Event not found' }, 404);
    
    if (event.class_id) {
      const classRow = await db.get<{ teacher_id: number }>(
        'SELECT teacher_id FROM classes WHERE id = ?',
        event.class_id,
      );
      if (!classRow || classRow.teacher_id !== user.id) {
        return c.json({ success: false, message: 'غير مصرح' }, 403);
      }
    } else if (event.created_by !== user.id) {
      return c.json({ success: false, message: 'غير مصرح' }, 403);
    }
  }

  try {
    await svc.updateRecurringEvent(id, body);
    return c.json({ success: true });
  } catch (err) {
    if (process.env.NODE_ENV !== 'production') console.error('updateRecurringEvent error:', err);
    return c.json({ success: false, message: 'Failed to update event' }, 500);
  }
});

// Delete event
app.delete('/event/:id', async (c) => {
  const user = c.get('user');
  if (user.role !== 'teacher' && user.role !== 'admin') {
    return c.json({ success: false, message: 'غير مصرح' }, 403);
  }

  const id = Number(c.req.param('id'));

  if (user.role === 'teacher') {
    const event = await db.get<{ class_id: number | null; created_by: number | null }>(
      'SELECT class_id, created_by FROM recurring_events WHERE id = ?',
      id,
    );
    if (!event) return c.json({ success: false, message: 'Event not found' }, 404);
    
    if (event.class_id) {
      const classRow = await db.get<{ teacher_id: number }>(
        'SELECT teacher_id FROM classes WHERE id = ?',
        event.class_id,
      );
      if (!classRow || classRow.teacher_id !== user.id) {
        return c.json({ success: false, message: 'غير مصرح' }, 403);
      }
    } else if (event.created_by !== user.id) {
      return c.json({ success: false, message: 'غير مصرح' }, 403);
    }
  }

  try {
    await svc.deleteRecurringEvent(id);
    return c.json({ success: true });
  } catch (err) {
    if (process.env.NODE_ENV !== 'production') console.error('deleteRecurringEvent error:', err);
    return c.json({ success: false, message: 'Failed to delete event' }, 500);
  }
});

export { app as scheduleRoutes };
