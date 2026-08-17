import { Hono } from 'hono';
import { authMiddleware } from '../auth/middleware.js';
import { registerUserRoutes } from './handlers-users.js';
import { registerClassRoutes } from './handlers-classes.js';
import { registerActivityRoutes } from './handlers-activity.js';
import { registerSystemRoutes } from './handlers-system.js';
import type { User } from '@my-modern-app/shared-types';

type Variables = { user: User };

const app = new Hono<{ Variables: Variables }>();

app.use(authMiddleware);
app.use(async (c, next) => {
  const user = c.get('user');
  if (user.role !== 'admin') {
    return c.json({ success: false, message: 'غير مصرح — يقتصر على الأدمن' }, 403);
  }
  await next();
});

registerUserRoutes(app);
registerClassRoutes(app);
registerActivityRoutes(app);
registerSystemRoutes(app);

export { app as adminCoreRoutes };
