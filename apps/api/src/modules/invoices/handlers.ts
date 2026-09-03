import { Hono } from 'hono';
import { zValidator } from '@hono/zod-validator';
import { z } from 'zod';
import { adminAuthMiddleware } from '../auth/middleware.js';
import type { User } from '@my-modern-app/shared-types';
import * as svc from './services.js';

const app = new Hono<{ Variables: { user: User } }>();
app.use(adminAuthMiddleware);

const listSchema = z.object({
  status: z.enum(['unpaid', 'paid', 'cancelled']).optional(),
  owner_type: z.enum(['user', 'school']).optional(),
  search: z.string().optional(),
  sort: z.enum(['created_at', 'amount_cents', 'paid_at']).optional().default('created_at'),
  order: z.enum(['asc', 'desc']).optional().default('desc'),
  page: z.coerce.number().int().min(1).optional().default(1),
  limit: z.coerce.number().int().min(1).max(200).optional().default(20),
});

const updateSchema = z.object({
  status: z.enum(['unpaid', 'paid', 'cancelled']),
});

app.get('/', zValidator('query', listSchema), async (c) => {
  const q = c.req.valid('query');
  const result = await svc.getAdminInvoices({
    status: q.status,
    ownerType: q.owner_type,
    search: q.search,
    sort: q.sort,
    order: q.order,
    page: q.page,
    limit: q.limit,
  });
  return c.json({ success: true, ...result });
});

app.patch('/:id', zValidator('json', updateSchema), async (c) => {
  const id = Number(c.req.param('id'));
  const body = c.req.valid('json');
  const invoice = await svc.updateInvoiceStatus(id, body.status);
  if (!invoice) return c.json({ success: false, message: 'الفاتورة غير موجودة' }, 404);
  return c.json({ success: true, invoice });
});

export { app as invoiceRoutes };
