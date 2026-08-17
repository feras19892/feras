<script setup lang="ts">
import { onMounted, onUnmounted, defineAsyncComponent } from 'vue';
import { useRouter } from 'vue-router';
import { RouterView } from 'vue-router';
import { useI18nStore } from './stores/i18n.store';
import { runStartupDiagnostics } from './composables/experiment/useStartupDiagnostics';
import { useAuthStore } from './modules/auth/stores/auth';
import { useKeyboardShortcuts } from './composables/useKeyboardShortcuts';
import CommandPalette from './components/shared/CommandPalette.vue';
import GlobalConfirmDialog from './components/shared/GlobalConfirmDialog.vue';
import ToastContainer from './components/shared/ToastContainer.vue';

const i18n = useI18nStore();
const router = useRouter();
const auth = useAuthStore();
useKeyboardShortcuts();

const ExperimentMonitorWidget = import.meta.env.DEV
  ? defineAsyncComponent(() => import('./components/dev/ExperimentMonitorWidget.vue'))
  : null;

function onSessionExpired() {
  auth.clearSession();
  auth.clearSchoolSession();
  if (router.currentRoute.value.meta.requiresAuth) {
    router.push('/');
  }
}

onMounted(() => {
  runStartupDiagnostics();
  window.addEventListener('auth:session-expired', onSessionExpired);
});

onUnmounted(() => {
  window.removeEventListener('auth:session-expired', onSessionExpired);
});
</script>

<template>
  <div class="app" :dir="i18n.direction">
    <Suspense>
      <RouterView />
      <template #fallback>
        <div class="skeleton-loader">
          <div class="skeleton-spinner" />
          <p>جاري التحميل...</p>
        </div>
      </template>
    </Suspense>
    <component :is="ExperimentMonitorWidget" v-if="ExperimentMonitorWidget" />
    <CommandPalette />
    <GlobalConfirmDialog />
    <ToastContainer />
  </div>
</template>

<style>
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

/* Ensure all text respects the dir attribute by default */
body, .app {
  text-align: start;
}

/* Neutralize vite-plugin-vue-devtools' dev-only bug that mirrors the
   entire page via `html[dir="rtl"] { transform: scaleX(-1) }` */
html[dir='rtl'] {
  transform: none !important;
}

.app {
  min-height: 100vh;
  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
}

.skeleton-loader {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 100vh;
  gap: 1rem;
}

.skeleton-spinner {
  width: 40px;
  height: 40px;
  border: 4px solid #e5e7eb;
  border-top-color: #3b82f6;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}
</style>
