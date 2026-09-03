import { Hono } from 'hono';
import { zValidator } from '@hono/zod-validator';
import { z } from 'zod';
import { authMiddleware, adminAuthMiddleware } from '../auth/middleware.js';
import type { User } from '@my-modern-app/shared-types';
import * as svc from './services.js';

type Variables = { user: User };
const app = new Hono<{ Variables: Variables }>();
app.use(authMiddleware);

const createTicketSchema = z.object({
  category: z.enum(['technical', 'billing', 'feature', 'bug', 'other']),
  priority: z.enum(['low', 'medium', 'high', 'urgent']),
  subject: z.string().min(1).max(200),
  description: z.string().min(1).max(5000),
});

// Create support ticket
app.post('/', zValidator('json', createTicketSchema), async (c) => {
  const user = c.get('user');
  const body = c.req.valid('json');

  try {
    const result = await svc.createTicket({
      user_id: user.id,
      school_id: user.school_id || undefined,
      ...body,
    });
    return c.json({ success: true, id: result.id }, 201);
  } catch (err) {
    if (process.env.NODE_ENV !== 'production') console.error('createTicket error:', err);
    return c.json({ success: false, message: 'Failed to create ticket' }, 500);
  }
});

// Get tickets (filtered by user role)
app.get('/', async (c) => {
  const user = c.get('user');
  const status = c.req.query('status');
  const category = c.req.query('category');
  const priority = c.req.query('priority');

  let filters: any = {};

  if (user.role === 'student' || user.role === 'teacher') {
    filters.user_id = user.id;
  } else if (user.role === 'school') {
    filters.school_id = user.id;
  }

  if (status) filters.status = status;
  if (category) filters.category = category;
  if (priority) filters.priority = priority;

  try {
    const tickets = await svc.getTickets(filters);
    return c.json({ success: true, tickets });
  } catch (err) {
    if (process.env.NODE_ENV !== 'production') console.error('getTickets error:', err);
    return c.json({ success: false, message: 'Failed to load tickets' }, 500);
  }
});

// Get single ticket
app.get('/:id', async (c) => {
  const user = c.get('user');
  const id = Number(c.req.param('id'));

  try {
    const ticket = await svc.getTicketById(id);
    if (!ticket) {
      return c.json({ success: false, message: 'Ticket not found' }, 404);
    }

    if (user.role === 'student' || user.role === 'teacher') {
      if (ticket.user_id !== user.id) {
        return c.json({ success: false, message: 'غير مصرح' }, 403);
      }
    } else if (user.role === 'school') {
      if (ticket.school_id !== user.id) {
        return c.json({ success: false, message: 'غير مصرح' }, 403);
      }
    }

    const comments = await svc.getTicketComments(id, user.role === 'admin');
    const history = await svc.getTicketHistory(id);

    return c.json({ success: true, ticket, comments, history });
  } catch (err) {
    if (process.env.NODE_ENV !== 'production') console.error('getTicket error:', err);
    return c.json({ success: false, message: 'Failed to load ticket' }, 500);
  }
});

const updateTicketSchema = z.object({
  status: z.enum(['open', 'in_progress', 'resolved', 'closed']).optional(),
  assigned_to: z.number().int().positive().nullable().optional(),
  resolution: z.string().optional(),
});

// Update ticket (admin only)
app.patch('/:id', adminAuthMiddleware, zValidator('json', updateTicketSchema), async (c) => {
  const user = c.get('user');
  const id = Number(c.req.param('id'));
  const body = c.req.valid('json');

  try {
    await svc.updateTicket(id, { ...body, changed_by: user.id });
    return c.json({ success: true, message: 'Ticket updated' });
  } catch (err) {
    if (process.env.NODE_ENV !== 'production') console.error('updateTicket error:', err);
    return c.json({ success: false, message: 'Failed to update ticket' }, 500);
  }
});

const addCommentSchema = z.object({
  comment: z.string().min(1).max(5000),
  is_internal: z.boolean().optional(),
});

// Add comment to ticket
app.post('/:id/comments', zValidator('json', addCommentSchema), async (c) => {
  const user = c.get('user');
  const id = Number(c.req.param('id'));
  const body = c.req.valid('json');

  try {
    const ticket = await svc.getTicketById(id);
    if (!ticket) {
      return c.json({ success: false, message: 'Ticket not found' }, 404);
    }

    if (user.role === 'student' || user.role === 'teacher') {
      if (ticket.user_id !== user.id) {
        return c.json({ success: false, message: 'غير مصرح' }, 403);
      }
      if (body.is_internal) {
        return c.json({ success: false, message: 'Only admins can add internal comments' }, 403);
      }
    } else if (user.role === 'school') {
      if (ticket.school_id !== user.id) {
        return c.json({ success: false, message: 'غير مصرح' }, 403);
      }
    }

    const result = await svc.addTicketComment({
      ticket_id: id,
      user_id: user.id,
      comment: body.comment,
      is_internal: body.is_internal || false,
    });

    return c.json({ success: true, id: result.id }, 201);
  } catch (err) {
    if (process.env.NODE_ENV !== 'production') console.error('addTicketComment error:', err);
    return c.json({ success: false, message: 'Failed to add comment' }, 500);
  }
});

// Get ticket statistics
app.get('/stats/summary', async (c) => {
  const user = c.get('user');

  let userId: number | undefined;
  let schoolId: number | undefined;

  if (user.role === 'student' || user.role === 'teacher') {
    userId = user.id;
  } else if (user.role === 'school') {
    schoolId = user.id;
  }

  try {
    const stats = await svc.getTicketStats(userId, schoolId);
    return c.json({ success: true, stats });
  } catch (err) {
    if (process.env.NODE_ENV !== 'production') console.error('getTicketStats error:', err);
    return c.json({ success: false, message: 'Failed to load statistics' }, 500);
  }
});

export { app as supportTicketRoutes };
