import type { MiddlewareHandler } from 'hono';

const DEFAULT_MAX = Number(process.env.MAX_BODY_SIZE) || 1024 * 1024; // 1MB

export const bodySizeLimit: MiddlewareHandler = async (c, next) => {
  const contentLength = c.req.header('content-length');
  if (contentLength) {
    const size = Number(contentLength);
    if (!isNaN(size) && size > DEFAULT_MAX) {
      return c.json(
        { success: false, message: 'Request body too large' },
        413
      );
    }
  } else if (c.req.method !== 'GET' && c.req.method !== 'HEAD') {
    // No content-length header — check stream size without consuming the original body
    const cloned = c.req.raw.clone();
    const reader = cloned.body?.getReader();
    if (reader) {
      let total = 0;
      try {
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          total += value.byteLength;
          if (total > DEFAULT_MAX) {
            await reader.cancel();
            return c.json(
              { success: false, message: 'Request body too large' },
              413
            );
          }
        }
      } catch {
        // Stream error — let downstream handle it
      } finally {
        reader.releaseLock();
      }
    }
  }
  await next();
};
