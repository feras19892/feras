import { createApp } from 'vue';
import { createPinia } from 'pinia';
import router from './router';
import App from './App.vue';
import { useAuthStore } from './modules/auth/stores/auth';

const app = createApp(App);

app.use(createPinia());
app.use(router);

const auth = useAuthStore();
(async () => {
  try {
    await auth.init();
  } catch (e) {
    console.error('[main] auth.init failed:', e);
  }
  app.mount('#app');
})();
