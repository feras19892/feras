<script setup lang="ts">
import { useI18n } from '@/composables/useI18n';
import BiologyHelpModal from '../../../components/experiment/biology/BiologyHelpModal.vue';
const { t } = useI18n();
import { computed, ref, watch } from 'vue';
import { useFullscreen } from '../../../composables/shared/useFullscreen';
import { useRouter } from 'vue-router';
import * as THREE from 'three';

import { usePhotosynthesis3D } from '../../../composables/biology/usePhotosynthesis3D';
import { useBiologyTracking } from '../../../composables/biology/useBiologyTracking';
import { photosynthesisExperiment, photosynthesisStages } from '../../../services/photosynthesis-data';
import type { HotspotState } from '../../../types/biology.types';
import InfoPanel from './InfoPanel.vue';
import StageStepper from './StageStepper.vue';
import { useRoute } from 'vue-router';
import BiologyReportButton from './BiologyReportButton.vue';
import BiologyGoals from './BiologyGoals.vue';
import { resolveExperimentId } from '../../../composables/useExperimentId';

const router = useRouter();

const route = useRoute();
const experimentId = computed(() => resolveExperimentId('biology', route.path.split('/').filter(Boolean).pop() ?? ''));
const containerRef = ref<HTMLDivElement | null>(null);
const { currentStageIndex, setStage, error, isLoading, autoRotate, toggleAutoRotate, resetCamera, resetAll, screenshot } = usePhotosynthesis3D(containerRef);

// تتبّع المراحل التي وصل إليها الطالب لتغذية التقرير الحقيقي
const tracking = useBiologyTracking();
watch(currentStageIndex, (idx) => {
  const s = photosynthesisStages[idx];
  if (!s) return;
  tracking.trackStage(s.id);
  tracking.trackPart(s.id, t(s.titleKey));
}, { immediate: true });

const stage = computed(() => photosynthesisStages[currentStageIndex.value]);

const hotspot = computed<HotspotState>(() => ({
  partId: stage.value.id,
  label: t(stage.value.titleKey),
  description: t(stage.value.descriptionKey),
  longDescription: t(stage.value.longDescriptionKey),
  facts: stage.value.factsKeys.map((key) => t(key)),
  position: new THREE.Vector3(0, 0, 0),
}));

const stageItems = computed(() =>
  photosynthesisStages.map((s) => ({
    id: s.id,
    label: t(s.titleKey),
    description: t(s.descriptionKey),
  }))
);

const visitedStageIds = computed(() => new Set(tracking.stagesVisited.value));
const goals = computed(() => [
  {
    id: 'visitAllStages',
    label: t('biology.goalVisitAllStages'),
    completed: visitedStageIds.value.size >= photosynthesisStages.length,
  },
]);

const nextStage = (): void => {
  setStage(currentStageIndex.value + 1);
};

const previousStage = (): void => {
  setStage(currentStageIndex.value - 1);
};

const isFirstStage = computed(() => currentStageIndex.value === 0);
const isLastStage = computed(() => currentStageIndex.value === photosynthesisStages.length - 1);


const downloadScreenshot = (): void => {
  const data = screenshot();
  if (!data) return;
  const link = document.createElement('a');
  link.href = data;
  link.download = `${experimentId.value ?? 'biology'}-screenshot.png`;
  document.body.appendChild(link);
  link.click();
  link.remove();
};

const goBack = (): void => {
  router.push('/biology/plant');
};

const { isFullscreen, toggleFullscreen } = useFullscreen();
const helpOpen = ref(false);
</script>

<template>
  <div class="experiment-page">
    <header class="experiment-header">
      <button class="back-button" @click="goBack">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M19 12H5M12 19l-7-7 7-7" />
        </svg>
        {{ t('biology.backToPlantSection') }}
      </button>
      <div class="header-content">
        <h1 class="experiment-title">{{ t(photosynthesisExperiment.titleKey) }}</h1>
        <p class="experiment-subtitle">{{ t(photosynthesisExperiment.subtitleKey) }}</p>
      </div>
      <BiologyReportButton
        :experiment-id="experimentId"
        :experiment-name="t(photosynthesisExperiment.titleKey)"
        :tracking="tracking"
        :get-screenshot="screenshot"
      />
      <button class="header-action" :title="t('biology.bioHelpTitle')" :aria-label="t('biology.bioHelpTitle')" @click="helpOpen = true">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <circle cx="12" cy="12" r="10" />
          <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3" />
          <line x1="12" y1="17" x2="12.01" y2="17" />
        </svg>
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
      <aside class="side-panel info-side">
        <div class="info-card">
          <InfoPanel :hotspot="hotspot" />
        </div>
        <BiologyGoals v-if="goals.length" :title="t('biology.goalsTitle')" :goals="goals" />
      </aside>

      <section class="canvas-section">
        <div ref="containerRef" class="cell-canvas" />

        <div v-if="isLoading" class="loading-overlay" role="status">
          <div class="spinner" />
          <span>{{ t('biology.loadingModel') }}</span>
        </div>
        <div v-if="error" class="webgl-error" role="alert">{{ error }}</div>

        <div class="floating-toolbar">
          <button
            class="tool-btn"
            :class="{ active: autoRotate }"
            :title="t('biology.autoRotate')"
            @click.stop="toggleAutoRotate"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M21 12a9 9 0 1 1-9-9c2.52 0 4.93 1 6.74 2.74L21 8" />
              <path d="M21 3v5h-5" />
            </svg>
          </button>
          <button
            class="tool-btn"
            :title="t('biology.screenshot')"
            @click.stop="downloadScreenshot"
          >
            📸
          </button>          <div class="tool-divider" />
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
          <button
            class="tool-btn danger"
            :title="t('biology.resetAllLabel')"
            @click.stop="resetAll"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M3 6h18M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
            </svg>
          </button>
        </div>
      </section>

      <aside class="side-panel parts-side">
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
            {{ t('biology.photosynthesisStageLabel') }}
          </h2>
          <StageStepper
            :model-value="currentStageIndex"
            :stages="stageItems"
            :aria-label="t('biology.photosynthesisStageLabel')"
            @update:model-value="setStage"
          />
          <div class="stage-actions">
            <button
              class="action-button"
              :disabled="isFirstStage"
              @click="previousStage"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M15 18l-6-6 6-6" />
              </svg>
              {{ t('biology.previousStage') }}
            </button>
            <button
              class="action-button primary"
              :disabled="isLastStage"
              @click="nextStage"
            >
              {{ t('biology.nextStage') }}
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M9 18l6-6-6-6" />
              </svg>
            </button>
          </div>
        </div>
      </aside>
    </main>
  <BiologyHelpModal
    :open="helpOpen"
    :context="{ topic: experimentId ?? '', titleKey: photosynthesisExperiment.titleKey, subtitleKey: photosynthesisExperiment.subtitleKey, parts: photosynthesisStages.map((s) => ({ id: s.id, nameKey: s.titleKey })) }"
    @close="helpOpen = false"
  />
  </div>
</template>

<style scoped src="./glb-experiment.css"></style>
<style scoped>
.stage-actions {
  display: flex;
  gap: 0.5rem;
  margin-top: 0.75rem;
}

.action-button {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.4rem;
  flex: 1;
  background: rgba(30, 41, 59, 0.8);
  border: 1px solid #334155;
  color: #e2e8f0;
  padding: 0.55rem 0.75rem;
  border-radius: 0.5rem;
  cursor: pointer;
  font-size: 0.82rem;
  font-weight: 500;
  transition: all 0.15s ease;
}

.action-button:hover:not(:disabled) {
  background: rgba(51, 65, 85, 0.9);
  border-color: #475569;
}

.action-button.primary {
  background: rgba(74, 222, 128, 0.12);
  border-color: rgba(74, 222, 128, 0.4);
  color: #4ade80;
}

.action-button.primary:hover:not(:disabled) {
  background: rgba(74, 222, 128, 0.2);
}

.action-button:disabled {
  opacity: 0.4;
  cursor: not-allowed;
}
</style>
