<script setup lang="ts">
import { onMounted, defineAsyncComponent } from 'vue';
import { RouterView } from 'vue-router';
import { useI18nStore } from './stores/i18n.store';
import { runStartupDiagnostics } from './composables/experiment/useStartupDiagnostics';

const i18n = useI18nStore();

const ExperimentMonitorWidget = import.meta.env.DEV
  ? defineAsyncComponent(() => import('./components/dev/ExperimentMonitorWidget.vue'))
  : null;

onMounted(() => {
  runStartupDiagnostics();
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
