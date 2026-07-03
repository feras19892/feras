import { createApp } from 'vue';
import { createPinia } from 'pinia';
import router from './router';
import App from './App.vue';
import { useAuthStore } from './modules/auth/stores/auth';
import { useI18nStore } from './stores/i18n.store';

const app = createApp(App);

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
    console.warn('[Sentry] @sentry/vue not installed; error tracking disabled');
  }
}

app.use(createPinia());
app.use(router);

const auth = useAuthStore();
const i18n = useI18nStore();

(async () => {
  try {
    await i18n.bootstrap();
  } catch (e) {
    console.error('[main] i18n.bootstrap failed:', e);
  }
  try {
    await auth.init();
  } catch (e) {
    console.error('[main] auth.init failed:', e);
  }
  app.mount('#app');

  if (import.meta.env.DEV) {
    console.log(
      '%c[DevTools] Vite Inspect: http://localhost:5173/__inspect\n' +
      '%c[DevTools] Vue DevTools: floating panel (vite-plugin-vue-devtools)',
      'color: #646cff; font-weight: bold;',
      'color: #42b883; font-weight: bold;'
    );
  }
})();
