<script setup lang="ts">
import { computed, ref } from 'vue';
import * as THREE from 'three';
import { useI18n } from '../../../composables/useI18n';
import { mitosisExperiment, mitosisStages } from '../../../services/mitosis-data';
import type { HotspotState } from '../../../types/biology.types';
import InfoPanel from './InfoPanel.vue';
import StageStepper from './StageStepper.vue';

const SKETCHFAB_MODELS: Record<string, string> = {
  prophase: 'ba5a94e0d7d74eabafb77ba60efe9356',
  metaphase: 'e4fe45684fe748498e63abe8c4ba7d0b',
  anaphase: 'bcb96f0d7f0c4946958659887c3103c5',
  telophase: '7779640c559e40abb4dcd3ccb36da554',
};

const { t } = useI18n();
const currentStageIndex = ref(0);
const isLoading = ref(true);

const stage = computed(() => mitosisStages[currentStageIndex.value]);

const sketchfabUid = computed(() => SKETCHFAB_MODELS[stage.value.id] ?? '');

const sketchfabEmbedUrl = computed(() => {
  const uid = sketchfabUid.value;
  if (!uid) return '';
  return `https://sketchfab.com/models/${uid}/embed?autostart=1&internal=1&tracking=0&ui_ar=0&ui_infos=0&ui_snapshots=1&ui_stop=0&ui_theatre=1&ui_watermark=0&ui_help=0&ui_settings=0&ui_annotations=0&ui_hint=0&ui_inspector=0`;
});

const hotspot = computed<HotspotState>(() => ({
  partId: stage.value.id,
  label: t(stage.value.titleKey),
  description: t(stage.value.descriptionKey),
  longDescription: t(stage.value.longDescriptionKey),
  facts: stage.value.factsKeys.map((key) => t(key)),
  position: new THREE.Vector3(0, 0, 0),
}));

const stageItems = computed(() =>
  mitosisStages.map((s) => ({
    id: s.id,
    label: t(s.titleKey),
    description: t(s.descriptionKey),
  }))
);

const setStage = (index: number): void => {
  currentStageIndex.value = Math.max(0, Math.min(mitosisStages.length - 1, index));
  isLoading.value = true;
};

const nextStage = (): void => {
  setStage(currentStageIndex.value + 1);
};

const previousStage = (): void => {
  setStage(currentStageIndex.value - 1);
};

const isFirstStage = computed(() => currentStageIndex.value === 0);
const isLastStage = computed(() => currentStageIndex.value === mitosisStages.length - 1);

const onIframeLoad = (): void => {
  isLoading.value = false;
};

const goBack = (): void => {
  window.history.back();
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
        {{ t('biology.backToCellSection') }}
      </button>
      <div class="header-content">
        <h1 class="experiment-title">{{ t(mitosisExperiment.titleKey) }}</h1>
        <p class="experiment-subtitle">{{ t(mitosisExperiment.subtitleKey) }}</p>
      </div>
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
      </aside>

      <section class="canvas-section">
        <div v-if="isLoading" class="loading-overlay" role="status">
          <div class="spinner" />
          <span>{{ t('biology.loadingModel') }}</span>
        </div>

        <iframe
          v-if="sketchfabEmbedUrl"
          :key="sketchfabUid"
          :src="sketchfabEmbedUrl"
          class="sketchfab-embed"
          allow="autoplay; fullscreen; xr-spatial-tracking"
          allowfullscreen
          loading="eager"
          @load="onIframeLoad"
        />

        <div class="model-attribution">
          <span>3D Model by Júlio Panzera on Sketchfab</span>
        </div>
      </section>

      <aside class="side-panel stage-side">
        <div class="stage-section">
          <h3 class="stage-title">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <line x1="8" y1="6" x2="21" y2="6" />
              <line x1="8" y1="12" x2="21" y2="12" />
              <line x1="8" y1="18" x2="21" y2="18" />
              <line x1="3" y1="6" x2="3.01" y2="6" />
              <line x1="3" y1="12" x2="3.01" y2="12" />
              <line x1="3" y1="18" x2="3.01" y2="18" />
            </svg>
            {{ t('biology.mitosisStageLabel') }}
          </h3>
          <StageStepper
            :model-value="currentStageIndex"
            :stages="stageItems"
            :aria-label="t('biology.mitosisStageLabel')"
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
  grid-template-columns: 280px 1fr 280px;
  gap: 1rem;
  flex: 1;
  min-height: 0;
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

.info-side .info-card {
  flex: 1;
}

.stage-side .stage-section {
  flex-shrink: 0;
}

.info-card {
  background: rgba(15, 23, 42, 0.8);
  border: 1px solid #334155;
  border-radius: 0.75rem;
  padding: 1.25rem;
}

.empty-card {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.75rem;
  padding: 2rem 1rem;
  color: #64748b;
  text-align: center;
  background: rgba(15, 23, 42, 0.8);
  border: 1px solid #334155;
  border-radius: 0.75rem;
}

.empty-icon {
  color: #475569;
}

.stage-section {
  background: rgba(15, 23, 42, 0.8);
  border: 1px solid #334155;
  border-radius: 0.75rem;
  padding: 1rem;
  flex-shrink: 0;
}

.stage-title {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin: 0 0 0.75rem;
  color: #e2e8f0;
  font-size: 1rem;
  font-weight: 600;
}

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

.canvas-section {
  position: relative;
  min-height: 500px;
  border: 1px solid #1e293b;
  border-radius: 1rem;
  overflow: hidden;
  background: radial-gradient(ellipse at center, #0f172a 0%, #0a0f1c 100%);
}

.sketchfab-embed {
  width: 100%;
  height: 100%;
  min-height: 500px;
  border: none;
  display: block;
}

.model-attribution {
  position: absolute;
  bottom: 0.5rem;
  right: 0.75rem;
  font-size: 0.7rem;
  color: #475569;
  background: rgba(10, 15, 28, 0.7);
  padding: 0.2rem 0.5rem;
  border-radius: 0.3rem;
  pointer-events: none;
}

.loading-overlay {
  position: absolute;
  inset: 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 1rem;
  background: rgba(10, 15, 28, 0.9);
  z-index: 10;
}

.spinner {
  width: 40px;
  height: 40px;
  border: 3px solid rgba(74, 222, 128, 0.2);
  border-top-color: #4ade80;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

.webgl-error {
  position: absolute;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 1.5rem;
  background: rgba(10, 15, 28, 0.95);
  color: #ef4444;
  font-weight: 600;
  z-index: 20;
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
