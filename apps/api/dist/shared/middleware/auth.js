import { getCookie } from 'hono/cookie';
import { verifyAccessToken } from '../../modules/auth/jwt.js';
import { getUserById } from '../../modules/auth/services.js';
export const authMiddleware = async (c, next) => {
    const accessToken = getCookie(c, 'access_token');
    if (!accessToken) {
        return c.json({ success: false, message: 'Unauthorized' }, 401);
    }
    try {
        const payload = await verifyAccessToken(accessToken);
        const user = await getUserById(Number(payload.sub));
        if (!user) {
            return c.json({ success: false, message: 'User not found' }, 401);
        }
        c.set('user', user);
        await next();
    }
    catch {
        return c.json({ success: false, message: 'Invalid or expired token' }, 401);
    }
};
