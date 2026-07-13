<script setup lang="ts">
import { computed, ref } from 'vue';
import { useRouter } from 'vue-router';
import * as THREE from 'three';
import { useI18n } from '../../../composables/useI18n';
import { useMitosis3D } from '../../../composables/biology/useMitosis3D';
import { mitosisExperiment, mitosisStages } from '../../../services/mitosis-data';
import type { HotspotState } from '../../../types/biology.types';
import InfoPanel from './InfoPanel.vue';

const router = useRouter();
const { t } = useI18n();
const containerRef = ref<HTMLDivElement | null>(null);
const { currentStageIndex, setStage } = useMitosis3D(containerRef);

const goBack = (): void => {
  router.push('/biology/cell');
};

const stage = computed(() => mitosisStages[currentStageIndex.value]);

const stageHotspot = computed<HotspotState>(() => ({
  organelleId: stage.value.id,
  label: t(stage.value.titleKey),
  description: t(stage.value.descriptionKey),
  longDescription: t(stage.value.longDescriptionKey),
  facts: stage.value.factsKeys.map((key) => t(key)),
  position: new THREE.Vector3(0, 0, 0),
}));

const stageLabels = computed(() =>
  mitosisStages.map((s, index) => ({
    id: s.id,
    label: t(s.titleKey),
    index,
  }))
);

const goToStage = (index: number): void => {
  setStage(index);
};

const nextStage = (): void => {
  setStage(currentStageIndex.value + 1);
};

const previousStage = (): void => {
  setStage(currentStageIndex.value - 1);
};
</script>

<template>
  <div class="experiment-page">
    <header class="experiment-header">
      <button class="back-button" @click="goBack">
        {{ t('biology.backToCellSection') }}
      </button>
      <h1 class="experiment-title">{{ t(mitosisExperiment.titleKey) }}</h1>
      <p class="experiment-subtitle">{{ t(mitosisExperiment.subtitleKey) }}</p>
    </header>

    <main class="experiment-body">
      <section class="canvas-section">
        <div ref="containerRef" class="mitosis-canvas" />
      </section>

      <section class="controls-section">
        <InfoPanel :hotspot="stageHotspot">
          <template #empty>
            <p>{{ t('biology.selectOrganelleHint') }}</p>
          </template>
        </InfoPanel>

        <div class="stage-panel">
          <h3 class="stage-title">{{ t('biology.mitosisStageLabel') }}</h3>
          <div class="stage-list">
            <button
              v-for="item in stageLabels"
              :key="item.id"
              class="stage-item"
              :class="{ active: item.index === currentStageIndex }"
              @click="goToStage(item.index)"
            >
              {{ item.label }}
            </button>
          </div>
        </div>

        <div class="action-bar">
          <button
            class="action-button secondary"
            :disabled="currentStageIndex === 0"
            @click="previousStage"
          >
            {{ t('biology.previousStage') }}
          </button>
          <button
            class="action-button secondary"
            :disabled="currentStageIndex === mitosisStages.length - 1"
            @click="nextStage"
          >
            {{ t('biology.nextStage') }}
          </button>
        </div>
      </section>
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
  gap: 1.5rem;
  font-family: 'Segoe UI', 'Helvetica Neue', Tahoma, Geneva, Verdana, sans-serif;
}

button {
  font-family: inherit;
}

.experiment-header {
  position: relative;
  text-align: center;
}

.back-button {
  position: absolute;
  top: 0;
  inset-inline-start: 0;
  background: transparent;
  border: 1px solid #475569;
  color: #e2e8f0;
  padding: 0.5rem 1rem;
  border-radius: 0.5rem;
  cursor: pointer;
  font-size: 0.95rem;
}

.back-button:hover {
  background: #1e293b;
}

.experiment-title {
  font-size: 2rem;
  margin: 0 0 0.25rem;
  color: #4ade80;
}

.experiment-subtitle {
  margin: 0;
  color: #94a3b8;
  font-size: 1rem;
}

.experiment-body {
  display: grid;
  grid-template-columns: 1fr 320px;
  gap: 1.5rem;
  flex: 1;
  min-height: 0;
}

.canvas-section {
  min-height: 480px;
  border: 1px solid #334155;
  border-radius: 1rem;
  overflow: hidden;
  background: rgba(15, 23, 42, 0.5);
}

.mitosis-canvas {
  width: 100%;
  height: 100%;
  min-height: 480px;
  cursor: grab;
}

.mitosis-canvas:active {
  cursor: grabbing;
}

.controls-section {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.stage-panel {
  background: rgba(15, 23, 42, 0.8);
  border: 1px solid #334155;
  border-radius: 1rem;
  padding: 1rem;
}

.stage-title {
  margin: 0 0 0.75rem;
  color: #4ade80;
  font-size: 1.1rem;
}

.stage-list {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.stage-item {
  background: transparent;
  border: 1px solid #475569;
  color: #e2e8f0;
  padding: 0.6rem 0.9rem;
  border-radius: 0.5rem;
  cursor: pointer;
  text-align: start;
  transition: background 0.15s ease, border-color 0.15s ease;
}

.stage-item:hover {
  background: #1e293b;
}

.stage-item.active {
  background: rgba(74, 222, 128, 0.15);
  border-color: #4ade80;
  color: #4ade80;
}

.action-bar {
  display: flex;
  gap: 0.75rem;
}

.action-button {
  flex: 1;
  background: #22c55e;
  color: #0f172a;
  border: none;
  padding: 0.75rem 1rem;
  border-radius: 0.5rem;
  font-weight: 600;
  cursor: pointer;
  font-size: 0.95rem;
}

.action-button.secondary {
  background: transparent;
  color: #e2e8f0;
  border: 1px solid #475569;
}

.action-button:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.action-button:hover:not(:disabled) {
  filter: brightness(1.1);
}

@media (max-width: 900px) {
  .experiment-body {
    grid-template-columns: 1fr;
  }

  .controls-section {
    flex-direction: column-reverse;
  }
}
</style>
