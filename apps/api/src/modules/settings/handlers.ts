import { Hono } from 'hono';
import { authMiddleware } from '../auth/middleware.js';
import { db } from '../../db/index.js';
import type { User } from '@my-modern-app/shared-types';

const settingsRoutes = new Hono<{ Variables: { user: User } }>();

settingsRoutes.use(authMiddleware);

settingsRoutes.get('/', async (c) => {
  const user = c.get('user');
  if (user.role !== 'admin') {
    return c.json({ success: false, message: 'Admin only' }, 403);
  }
  const rows = await db.all<{ key: string; value: string }[]>(
    'SELECT key, value FROM system_settings WHERE key NOT IN (?)',
    'emergency_password',
  );
  const data: Record<string, string | boolean | number> = {};
  for (const row of rows) {
    if (row.value === 'true') data[row.key] = true;
    else if (row.value === 'false') data[row.key] = false;
    else if (/^\d+$/.test(row.value)) data[row.key] = Number(row.value);
    else data[row.key] = row.value;
  }
  return c.json({ success: true, data });
});

export { settingsRoutes };
