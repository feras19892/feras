<script setup lang="ts">
import { useI18n } from '@/composables/useI18n';
const { t } = useI18n();
import { computed, ref, watch } from 'vue';
import { useRouter } from 'vue-router';

import { useBiologyHotspots } from '../../../composables/biology/useBiologyHotspots';
import { useBiologyExplode } from '../../../composables/biology/useBiologyExplode';
import type { BiologyExperiment as BiologyExperimentModel } from '../../../types/biology.types';
import Biology3DCanvas from './Biology3DCanvas.vue';
import InfoPanel from './InfoPanel.vue';
import SubmitReportModal from '@/components/experiment/SubmitReportModal.vue';





const props = withDefaults(
  defineProps<{
    experiment: BiologyExperimentModel;
    backRoute?: string;
    backLabelKey?: string;
  }>(),
  {
    backRoute: '/biology',
    backLabelKey: 'biology.backToExperiments',
  }
);

const router = useRouter();

const { hotspots, selectedHotspot, selectedId, select } = useBiologyHotspots(
  props.experiment.organelles
);
const { progress, isExploded, toggle, reset } = useBiologyExplode();
const canvasRef = ref<InstanceType<typeof Biology3DCanvas> | null>(null);

const markerLabels = computed(() =>
  Object.fromEntries(hotspots.value.map((h) => [h.partId, h.label]))
);

const goBack = (): void => {
  router.push(props.backRoute ?? '/biology');
};

const selectOrganelle = (id: string | null): void => {
  select(id);
};

const resetCamera = (): void => {
  canvasRef.value?.resetCamera();
};

watch(selectedId, (id) => {
  if (!id) {
    canvasRef.value?.resetCamera();
    return;
  }
  const worldPos = canvasRef.value?.getOrganelleWorldPosition(id);
  if (worldPos) {
    canvasRef.value?.focusOn(worldPos, 6);
  }
});

const isFullscreen = ref(false);
const reportOpen = ref(false);

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
        {{ t(props.backLabelKey) }}
      </button>
      <div class="header-content">
        <h1 class="experiment-title">{{ t(experiment.titleKey) }}</h1>
        <p class="experiment-subtitle">{{ t(experiment.subtitleKey) }}</p>
      </div>
      <button class="header-action" @click="reportOpen = true" title="إرسال التقرير">
        📋 إرسال التقرير
      </button>
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
      <aside class="left-panel">
        <div v-if="selectedHotspot" class="info-card">
          <InfoPanel :hotspot="selectedHotspot" />
        </div>
        <div v-else class="empty-card">
          <div class="empty-icon">
            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
              <circle cx="12" cy="12" r="10" />
              <path d="M12 8v4M12 16h.01" />
            </svg>
          </div>
          <p>{{ t('biology.selectPartHint') }}</p>
        </div>
      </aside>

      <section class="canvas-section">
        <Biology3DCanvas
          ref="canvasRef"
          :organelles="experiment.organelles"
          :marker-labels="markerLabels"
          :explode-progress="progress"
          :selected-part-id="selectedId"
          @select="selectOrganelle"
        />

        <div class="floating-toolbar">
          <button
            class="tool-btn"
            :class="{ active: isExploded }"
            :title="isExploded ? t('biology.collapseLabel') : t('biology.explodeLabel')"
            @click.stop="toggle"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" />
              <polyline points="3.27 6.96 12 12.01 20.73 6.96" />
              <line x1="12" y1="22.08" x2="12" y2="12" />
            </svg>
          </button>
          <button
            class="tool-btn"
            :title="t('biology.resetCameraLabel')"
            @click.stop="resetCamera"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M23 4v6h-6M1 20v-6h6" />
              <path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15" />
            </svg>
          </button>
          <div class="tool-divider" />
          <button
            class="tool-btn danger"
            :title="t('biology.resetLabel')"
            @click.stop="reset"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M3 6h18M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
            </svg>
          </button>
        </div>
      </section>

      <aside class="right-panel">
        <div class="parts-card">
          <h2 class="panel-title">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <line x1="8" y1="6" x2="21" y2="6" />
              <line x1="8" y1="12" x2="21" y2="12" />
              <line x1="8" y1="18" x2="21" y2="18" />
              <line x1="3" y1="6" x2="3.01" y2="6" />
              <line x1="3" y1="12" x2="3.01" y2="12" />
              <line x1="3" y1="18" x2="3.01" y2="18" />
            </svg>
            {{ t('biology.organelleListTitle') }}
          </h2>
          <ul class="parts-list">
            <li
              v-for="organelle in hotspots"
              :key="organelle.partId"
              class="part-item"
              :class="{ active: organelle.partId === selectedId }"
              @click.stop="selectOrganelle(organelle.partId)"
            >
              <span class="part-dot" />
              {{ markerLabels[organelle.partId] }}
            </li>
          </ul>
        </div>
      </aside>
    </main>

  <SubmitReportModal
    v-model:show="reportOpen"
    experiment-type="biology"
    :experiment-id="experiment.id"
    :experiment-name="t(experiment.titleKey)"
    readings="[]"
    params="{}"
  />
</div>
</template>

<style scoped>
@import './experiment-styles.css';
</style>
