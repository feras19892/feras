import { createApp } from 'vue';
import { createPinia } from 'pinia';
import router from './router';
import App from './App.vue';
import './assets/styles/admin-shell.css';
import './assets/styles/light-theme.css';
import { useAuthStore } from './modules/auth/stores/auth';
import { useI18nStore } from './stores/i18n.store';
import { usePreferencesStore } from './stores/preferences.store';
import { getApiBaseUrl } from './services/http';

const app = createApp(App);

/* ── Ngrok free tunnel bypass ── */
const originalFetch = window.fetch;
window.fetch = (input: RequestInfo | URL, init?: RequestInit): Promise<Response> => {
  const url = typeof input === 'string' ? input : input instanceof Request ? input.url : input.href;
  const apiBase = getApiBaseUrl();
  if (apiBase && url.startsWith(apiBase)) {
    const headers = new Headers(init?.headers ?? {});
    if (!headers.has('ngrok-skip-browser-warning')) {
      headers.set('ngrok-skip-browser-warning', 'true');
    }
    init = init ? { ...init, headers } : { headers };
  }
  return originalFetch(input, init);
};

/* ── Sentry error tracking + session replay (optional) ── */
const sentryDsn = import.meta.env.VITE_SENTRY_DSN;
if (sentryDsn) {
  try {
    // Variable path prevents Vite from static-analysis at build/dev time
    const sentryModule = '@sentry/vue';
    const Sentry = await import(/* @vite-ignore */ sentryModule);
    Sentry.init({
      app,
      dsn: sentryDsn,
      environment: import.meta.env.MODE || 'development',
      integrations: [
        Sentry.browserTracingIntegration({ router }),
        Sentry.replayIntegration({ maskAllText: false, maskAllInputs: false }),
      ],
      tracesSampleRate: 1.0,
      replaysSessionSampleRate: 0.1,
      replaysOnErrorSampleRate: 1.0,
    });
  } catch {
    if (import.meta.env.DEV) console.warn('[Sentry] @sentry/vue not installed; error tracking disabled');
  }
}

app.use(createPinia());
app.use(router);

const auth = useAuthStore();
const i18n = useI18nStore();
const preferences = usePreferencesStore();
document.documentElement.setAttribute('data-theme', preferences.prefs.theme);

(async () => {
  app.mount('#app');

  try {
    await i18n.bootstrap();
  } catch (e) {
    if (import.meta.env.DEV) console.error('[main] i18n.bootstrap failed:', e);
  }
  try {
    await auth.init();
  } catch (e) {
    if (import.meta.env.DEV) console.error('[main] auth.init failed:', e);
  }

  if (import.meta.env.DEV) {
    console.log(
      '%c[DevTools] Vite Inspect: http://localhost:5173/__inspect\n' +
      '%c[DevTools] Vue DevTools: floating panel (vite-plugin-vue-devtools)',
      'color: #646cff; font-weight: bold;',
      'color: #42b883; font-weight: bold;'
    );
  }

  if (import.meta.env.PROD && 'serviceWorker' in navigator) {
    navigator.serviceWorker.register('/sw.js').catch((e) => {
      if (import.meta.env.DEV) console.warn('[SW] registration failed:', e);
    });
  }
})();
