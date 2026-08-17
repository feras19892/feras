import { Hono } from 'hono';
import * as dmSvc from './direct-message-service.js';
import type { User } from '@my-modern-app/shared-types';

type Variables = { user: User };
const msgRoutes = new Hono<{ Variables: Variables }>();

msgRoutes.get('/messages/:userId', async (c) => {
  const admin = c.get('user') as User;
  const otherId = Number(c.req.param('userId'));
  try {
    const messages = await dmSvc.getConversation(admin.id, otherId);
    await dmSvc.markConversationRead(admin.id, otherId);
    return c.json({ success: true, messages });
  } catch (err) {
    if (process.env.NODE_ENV !== 'production') console.error('admin getMessages error:', err);
    return c.json({ success: false, message: 'Failed to load messages' }, 500);
  }
});

msgRoutes.get('/messages', async (c) => {
  const admin = c.get('user') as User;
  try {
    const list = await dmSvc.getConversationsList(admin.id);
    return c.json({ success: true, conversations: list });
  } catch (err) {
    if (process.env.NODE_ENV !== 'production') console.error('admin getConversations error:', err);
    return c.json({ success: false, message: 'Failed to load conversations' }, 500);
  }
});

msgRoutes.get('/messages/unread/count', async (c) => {
  const admin = c.get('user') as User;
  try {
    const count = await dmSvc.getUnreadMessageCount(admin.id);
    return c.json({ success: true, count });
  } catch (err) {
    if (process.env.NODE_ENV !== 'production') console.error('admin getUnreadCount error:', err);
    return c.json({ success: false, message: 'Failed to load unread count' }, 500);
  }
});

msgRoutes.patch('/messages/read-all', async (c) => {
  const admin = c.get('user') as User;
  try {
    await dmSvc.markAllMessagesRead(admin.id);
    return c.json({ success: true });
  } catch (err) {
    if (process.env.NODE_ENV !== 'production') console.error('admin markAllRead error:', err);
    return c.json({ success: false, message: 'Failed to mark all read' }, 500);
  }
});

export { msgRoutes as adminMessageRoutes };
