import * as Sentry from '@sentry/node';

let initialized = false;

export function initSentry(): boolean {
  const dsn = process.env.SENTRY_DSN;
  if (!dsn) return false;

  Sentry.init({
    dsn,
    environment: process.env.NODE_ENV || 'development',
    tracesSampleRate: Number(process.env.SENTRY_TRACES_SAMPLE_RATE) || 0.2,
    profilesSampleRate: Number(process.env.SENTRY_PROFILES_SAMPLE_RATE) || 0.1,
  });

  initialized = true;
  console.log('[sentry] Backend error tracking initialized');
  return true;
}

export function captureError(err: unknown, context?: Record<string, any>): void {
  if (!initialized) return;
  if (context) {
    Sentry.captureException(err, { extra: context });
  } else {
    Sentry.captureException(err);
  }
}

export function isSentryEnabled(): boolean {
  return initialized;
}
