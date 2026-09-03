export class ApiError extends Error {
  constructor(
    public type: 'network' | 'auth' | 'server' | 'not-found' | 'unknown',
    message: string,
    public status?: number,
  ) {
    super(message)
    this.name = 'ApiError'
  }
}

export async function tryFetch<T>(
  fn: () => Promise<T>,
  retries = 2,
): Promise<T> {
  let lastError: Error | null = null
  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      return await fn()
    } catch (err: any) {
      lastError = err
      const status = err?.status ?? err?.statusCode
      if (status === 401 || status === 403) {
        throw new ApiError('auth', err.message || 'غير مصرح', status)
      }
      if (status === 404) {
        throw new ApiError('not-found', err.message || 'غير موجود', status)
      }
      if (status && status >= 500) {
        if (attempt < retries) {
          await new Promise(r => setTimeout(r, 1000 * (attempt + 1)))
          continue
        }
        throw new ApiError('server', err.message || 'خطأ في الخادم', status)
      }
      if (err?.message?.includes('Failed to fetch') || err?.message?.includes('NetworkError')) {
        if (attempt < retries) {
          await new Promise(r => setTimeout(r, 1000 * (attempt + 1)))
          continue
        }
        throw new ApiError('network', 'تعذر الاتصال بالخادم')
      }
      throw new ApiError('unknown', err?.message || 'خطأ غير معروف', status)
    }
  }
  throw lastError || new ApiError('unknown', 'خطأ غير معروف')
}

export function getErrorType(err: unknown): 'network' | 'auth' | 'server' | 'not-found' | 'unknown' {
  if (err instanceof ApiError) return err.type
  return 'unknown'
}

export function getErrorMessage(err: unknown): string {
  if (err instanceof ApiError) return err.message
  if (err instanceof Error) return err.message
  return 'خطأ غير معروف'
}
