import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import {
  apiUrl,
  setAccessToken,
  getAccessToken,
  fetchJson,
} from './http';

describe('http service', () => {
  let fetchMock: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    setAccessToken(null);
    fetchMock = vi.fn();
    globalThis.fetch = fetchMock;
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('apiUrl', () => {
    it('normalizes relative paths', () => {
      expect(apiUrl('foo')).toBe('http://localhost:3000/foo');
      expect(apiUrl('/foo')).toBe('http://localhost:3000/foo');
    });

    it('returns absolute URLs as-is', () => {
      expect(apiUrl('https://example.com')).toBe('https://example.com');
    });
  });

  describe('token helpers', () => {
    it('sets and gets access token', () => {
      setAccessToken('abc123');
      expect(getAccessToken()).toBe('abc123');
      setAccessToken(null);
      expect(getAccessToken()).toBeNull();
    });
  });

  describe('fetchJson', () => {
    it('sends Bearer token when set', async () => {
      setAccessToken('tok');
      fetchMock.mockResolvedValueOnce(
        new Response(JSON.stringify({ ok: true }), { status: 200 })
      );

      await fetchJson('/test');

      const req = fetchMock.mock.calls[0][0] as string;
      const opts = fetchMock.mock.calls[0][1] as RequestInit;
      expect(req).toBe('http://localhost:3000/test');
      expect(opts.headers).toMatchObject({
        Accept: 'application/json',
        Authorization: 'Bearer tok',
      });
    });

    it('throws on non-ok response', async () => {
      fetchMock.mockResolvedValueOnce(
        new Response('Not Found', { status: 404, statusText: 'Not Found' })
      );

      await expect(fetchJson('/fail')).rejects.toThrow('Request failed: 404 Not Found');
    });

    it('retries after successful refresh on 401', async () => {
      setAccessToken('old');

      // First request fails with 401
      fetchMock.mockResolvedValueOnce(
        new Response('Unauthorized', { status: 401, statusText: 'Unauthorized' })
      );

      // Refresh succeeds
      fetchMock.mockResolvedValueOnce(
        new Response(JSON.stringify({ token: 'new' }), { status: 200 })
      );

      // Retry succeeds
      fetchMock.mockResolvedValueOnce(
        new Response(JSON.stringify({ data: 42 }), { status: 200 })
      );

      const result = await fetchJson<{ data: number }>('/protected');
      expect(result).toEqual({ data: 42 });
      expect(getAccessToken()).toBe('new');

      // Calls: /protected, /api/auth/refresh, /protected
      expect(fetchMock).toHaveBeenCalledTimes(3);
      const secondRetry = fetchMock.mock.calls[2][1] as RequestInit;
      expect(secondRetry.headers).toMatchObject({
        Authorization: 'Bearer new',
      });
    });

    it('throws after failed refresh on 401', async () => {
      setAccessToken('old');

      fetchMock.mockResolvedValueOnce(
        new Response('Unauthorized', { status: 401, statusText: 'Unauthorized' })
      );

      fetchMock.mockResolvedValueOnce(
        new Response('Forbidden', { status: 403 })
      );

      await expect(fetchJson('/protected')).rejects.toThrow('Request failed: 401 Unauthorized');
      expect(getAccessToken()).toBeNull();
    });

    it('returns parsed JSON on success', async () => {
      fetchMock.mockResolvedValueOnce(
        new Response(JSON.stringify({ hello: 'world' }), { status: 200 })
      );

      const data = await fetchJson<{ hello: string }>('/data');
      expect(data).toEqual({ hello: 'world' });
    });
  });
});
