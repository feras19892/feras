<script setup lang="ts">
import { useI18n } from '@/composables/useI18n';
const { t, direction } = useI18n();
import { ref, computed } from 'vue';
import { useRouter, useRoute } from 'vue-router';

import BiologyReportButton from './BiologyReportButton.vue';
import { resolveExperimentId } from '../../../composables/useExperimentId';





const props = defineProps<{
  titleKey: string;
  subtitleKey: string;
  backRoute?: string;
  backLabelKey?: string;
}>();

const router = useRouter();
const route = useRoute();

const experimentId = computed(() => resolveExperimentId('biology', route.path.split('/').filter(Boolean).pop() ?? ''));

const goBack = (): void => {
  router.push(props.backRoute ?? '/biology');
};

const isFullscreen = ref(false);

const toggleFullscreen = (): void => {
  const el = document.querySelector('.experiment-page') as HTMLElement | null;
  if (!el) return;
  if (!document.fullscreenElement) {
    el.requestFullscreen();
    isFullscreen.value = true;
  } else {
    document.exitFullscreen();
    isFullscreen.value = false;
  }
};
</script>

<template>
  <div class="experiment-page">
    <header class="experiment-header">
      <button class="back-button" @click="goBack">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M19 12H5M12 19l-7-7 7-7" />
        </svg>
        {{ t(props.backLabelKey ?? 'biology.backToCellSection') }}
      </button>
      <div class="header-content">
        <h1 class="experiment-title">{{ t(props.titleKey) }}</h1>
        <p class="experiment-subtitle">{{ t(props.subtitleKey) }}</p>
      </div>
      <BiologyReportButton :experiment-id="experimentId" :experiment-name="t(titleKey)" />
      <button class="header-action" @click="toggleFullscreen">
        <svg v-if="!isFullscreen" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M8 3H5a2 2 0 0 0-2 2v3m18 0V5a2 2 0 0 0-2-2h-3m0 18h3a2 2 0 0 0 2-2v-3M3 16v3a2 2 0 0 0 2 2h3" />
        </svg>
        <svg v-else width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M8 3v3a2 2 0 0 1-2 2H3m18 0h-3a2 2 0 0 1-2-2V3m0 18v-3a2 2 0 0 1 2-2h3M3 16h3a2 2 0 0 1 2 2v3" />
        </svg>
      </button>
    </header>

    <main class="experiment-body">
      <section class="canvas-section">
        <slot name="canvas" />
        <div class="floating-toolbar">
          <slot name="toolbar" />
        </div>
      </section>

      <aside class="side-panel">
        <div class="info-section">
          <slot name="info" />
        </div>
        <div class="stages-section">
          <slot name="stages" />
        </div>
        <div class="action-bar">
          <slot name="actions" />
        </div>
      </aside>
    </main>
  </div>
</template>

<style scoped>
.experiment-page {
  min-height: 100vh;
  background: linear-gradient(135deg, #0a0f1c 0%, #111827 40%, #0f172a 100%);
  color: #e2e8f0;
  padding: 1.5rem;
  display: flex;
  flex-direction: column;
  gap: 1.25rem;
  font-family: 'Segoe UI', 'Helvetica Neue', Tahoma, Geneva, Verdana, sans-serif;
}

.experiment-header {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.header-content {
  flex: 1;
  text-align: center;
}

.back-button {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  background: rgba(30, 41, 59, 0.8);
  border: 1px solid #334155;
  color: #e2e8f0;
  padding: 0.55rem 1rem;
  border-radius: 0.6rem;
  cursor: pointer;
  font-size: 0.9rem;
  font-weight: 500;
  transition: all 0.2s ease;
}

.back-button:hover {
  background: rgba(51, 65, 85, 0.9);
  border-color: #475569;
}

.header-action {
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(30, 41, 59, 0.8);
  border: 1px solid #334155;
  color: #94a3b8;
  width: 40px;
  height: 40px;
  border-radius: 0.6rem;
  cursor: pointer;
  transition: all 0.2s ease;
}

.header-action:hover {
  background: rgba(51, 65, 85, 0.9);
  color: #e2e8f0;
}

.experiment-title {
  font-size: 1.75rem;
  margin: 0 0 0.2rem;
  color: #4ade80;
  font-weight: 700;
}

.experiment-subtitle {
  margin: 0;
  color: #94a3b8;
  font-size: 0.95rem;
}

.experiment-body {
  display: grid;
  grid-template-columns: 1fr 320px;
  gap: 1rem;
  flex: 1;
  min-height: 0;
}

.canvas-section {
  position: relative;
  min-height: 500px;
  border: 1px solid #1e293b;
  border-radius: 1rem;
  overflow: hidden;
  background: radial-gradient(ellipse at center, #0f172a 0%, #0a0f1c 100%);
  cursor: grab;
}

.canvas-section:active {
  cursor: grabbing;
}

.floating-toolbar {
  position: absolute;
  bottom: 1.25rem;
  left: 50%;
  transform: translateX(-50%);
  display: flex;
  align-items: center;
  gap: 0.35rem;
  background: rgba(15, 23, 42, 0.92);
  backdrop-filter: blur(12px);
  border: 1px solid #334155;
  border-radius: 0.75rem;
  padding: 0.5rem 0.6rem;
  z-index: 15;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.4);
}

.side-panel {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  background: rgba(10, 15, 28, 0.98);
  border: 1px solid #1e293b;
  border-radius: 1rem;
  padding: 1.25rem;
  overflow-y: auto;
}

.info-section {
  background: rgba(15, 23, 42, 0.8);
  border: 1px solid #334155;
  border-radius: 0.75rem;
  padding: 1.25rem;
  flex: 1 1 auto;
  min-height: 0;
  overflow-y: auto;
}

.stages-section {
  background: rgba(15, 23, 42, 0.8);
  border: 1px solid #334155;
  border-radius: 0.75rem;
  padding: 1rem;
}

.action-bar {
  display: flex;
  gap: 0.6rem;
}

@media (max-width: 900px) {
  .experiment-body {
    grid-template-columns: 1fr;
  }

  .side-panel {
    max-height: 50vh;
  }
}
</style>
