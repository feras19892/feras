<script setup lang="ts">
import { computed, ref } from 'vue';
import * as THREE from 'three';
import { useI18n } from '../../../composables/useI18n';
import { useProteinSynthesis3D } from '../../../composables/biology/useProteinSynthesis3D';
import { proteinSynthesisExperiment, proteinSynthesisStages } from '../../../services/protein-synthesis-data';
import type { HotspotState } from '../../../types/biology.types';
import InfoPanel from './InfoPanel.vue';
import StageExperimentLayout from './StageExperimentLayout.vue';
import StageStepper from './StageStepper.vue';

const { t } = useI18n();
const containerRef = ref<HTMLDivElement | null>(null);
const { currentStageIndex, setStage, error, autoRotate, toggleAutoRotate, resetCamera } = useProteinSynthesis3D(containerRef);

const stage = computed(() => proteinSynthesisStages[currentStageIndex.value]);

const stageHotspot = computed<HotspotState>(() => ({
  partId: stage.value.id,
  label: t(stage.value.titleKey),
  description: t(stage.value.descriptionKey),
  longDescription: t(stage.value.longDescriptionKey),
  facts: stage.value.factsKeys.map((key) => t(key)),
  position: new THREE.Vector3(0, 0, 0),
}));

const stageItems = computed(() =>
  proteinSynthesisStages.map((s) => ({
    id: s.id,
    label: t(s.titleKey),
    description: t(s.descriptionKey),
  }))
);

const nextStage = (): void => {
  setStage(currentStageIndex.value + 1);
};

const previousStage = (): void => {
  setStage(currentStageIndex.value - 1);
};

const isFirstStage = computed(() => currentStageIndex.value === 0);
const isLastStage = computed(() => currentStageIndex.value === proteinSynthesisStages.length - 1);
</script>

<template>
  <StageExperimentLayout
    :title-key="proteinSynthesisExperiment.titleKey"
    :subtitle-key="proteinSynthesisExperiment.subtitleKey"
    back-route="/biology/cell"
  >
    <template #canvas>
      <div ref="containerRef" class="protein-canvas" />
      <div v-if="error" class="webgl-error" role="alert">
        {{ error }}
      </div>
    </template>

    <template #toolbar>
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
        :title="t('biology.resetCameraLabel')"
        @click.stop="resetCamera"
      >
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M23 4v6h-6M1 20v-6h6" />
          <path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15" />
        </svg>
      </button>
    </template>

    <template #info>
      <InfoPanel :hotspot="stageHotspot">
        <template #empty>
          <p>{{ t('biology.selectPartHint') }}</p>
        </template>
      </InfoPanel>
    </template>

    <template #stages>
      <div class="stage-panel">
        <h3 class="stage-title">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <line x1="8" y1="6" x2="21" y2="6" />
            <line x1="8" y1="12" x2="21" y2="12" />
            <line x1="8" y1="18" x2="21" y2="18" />
            <line x1="3" y1="6" x2="3.01" y2="6" />
            <line x1="3" y1="12" x2="3.01" y2="12" />
            <line x1="3" y1="18" x2="3.01" y2="18" />
          </svg>
          {{ t('biology.proteinSynthesisStageLabel') }}
        </h3>
        <StageStepper
          :model-value="currentStageIndex"
          :stages="stageItems"
          :aria-label="t('biology.proteinSynthesisStageLabel')"
          @update:model-value="setStage"
        />
      </div>
    </template>

    <template #actions>
      <button
        class="action-button"
        :disabled="isFirstStage"
        @click="previousStage"
      >
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
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
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M9 18l6-6-6-6" />
        </svg>
      </button>
    </template>
  </StageExperimentLayout>
</template>

<style scoped>
.protein-canvas {
  width: 100%;
  height: 100%;
  min-height: 500px;
  cursor: grab;
}

.protein-canvas:active {
  cursor: grabbing;
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

.tool-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 38px;
  height: 38px;
  border: none;
  border-radius: 0.5rem;
  background: transparent;
  color: #94a3b8;
  cursor: pointer;
  transition: all 0.15s ease;
}

.tool-btn:hover {
  background: rgba(51, 65, 85, 0.8);
  color: #e2e8f0;
}

.tool-btn.active {
  background: rgba(74, 222, 128, 0.15);
  color: #4ade80;
}

.stage-panel {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.stage-title {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin: 0 0 0.5rem;
  color: #e2e8f0;
  font-size: 1rem;
  font-weight: 600;
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
  padding: 0.65rem 1rem;
  border-radius: 0.5rem;
  cursor: pointer;
  font-size: 0.88rem;
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
