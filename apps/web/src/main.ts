import { createApp } from 'vue';
import { createPinia } from 'pinia';
import router from './router';
import App from './App.vue';
import { useAuthStore } from './modules/auth/stores/auth';
import { useI18nStore } from './stores/i18n.store';

const app = createApp(App);

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
})();
