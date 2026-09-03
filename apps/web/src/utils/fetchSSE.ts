import { getAccessToken } from '../services/http';

interface FetchSSEOptions {
  url: string;
  withCredentials?: boolean;
  headers?: Record<string, string>;
  onOpen?: () => void;
  onMessage?: (event: string, data: string) => void;
  onError?: () => void;
}

export function createFetchSSE(opts: FetchSSEOptions): { close: () => void } {
  let controller: AbortController | null = null;
  let closed = false;

  const extraHeaders: Record<string, string> = { ...opts.headers };
  const apiBase = import.meta.env.VITE_API_BASE_URL ?? '';
  if (apiBase.includes('ngrok')) {
    extraHeaders['ngrok-skip-browser-warning'] = 'true';
  }
  const accessToken = getAccessToken();
  if (accessToken) {
    extraHeaders['Authorization'] = `Bearer ${accessToken}`;
  }

  (async () => {
    while (!closed) {
      controller = new AbortController();
      try {
        const res = await fetch(opts.url, {
          method: 'GET',
          headers: {
            ...extraHeaders,
          },
          credentials: opts.withCredentials ? 'include' : 'same-origin',
          signal: controller.signal,
        });

        if (!res.ok || !res.body) {
          if (opts.onError) opts.onError();
          await new Promise((r) => setTimeout(r, 3000));
          continue;
        }

        if (opts.onOpen) opts.onOpen();

        const reader = res.body.getReader();
        const decoder = new TextDecoder();
        let buffer = '';
        let currentEvent = 'message';

        while (!closed) {
          const { done, value } = await reader.read();
          if (done) break;
          buffer += decoder.decode(value, { stream: true });

          const lines = buffer.split('\n');
          buffer = lines.pop() || '';

          for (const line of lines) {
            if (line.startsWith('event:')) {
              currentEvent = line.slice(6).trim();
            } else if (line.startsWith('data:')) {
              const data = line.slice(5).trim();
              if (opts.onMessage) opts.onMessage(currentEvent, data);
              currentEvent = 'message';
            } else if (line === '') {
              currentEvent = 'message';
            }
          }
        }

        if (!closed && opts.onError) opts.onError();
      } catch {
        if (closed) break;
        if (opts.onError) opts.onError();
        await new Promise((r) => setTimeout(r, 3000));
      }
    }
  })();

  return {
    close() {
      closed = true;
      if (controller) controller.abort();
    },
  };
}
