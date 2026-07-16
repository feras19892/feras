<script setup lang="ts">
import { computed, ref } from 'vue';
import * as THREE from 'three';
import { useI18n } from '../../../composables/useI18n';
import { useHeartGLB } from '../../../composables/biology/useHeartGLB';
import type { HeartPart } from '../../../composables/biology/useHeartGLB';
import type { HotspotState } from '../../../types/biology.types';
import InfoPanel from './InfoPanel.vue';

const props = defineProps<{
  parts: HeartPart[];
}>();

const { t } = useI18n();
const containerRef = ref<HTMLDivElement | null>(null);
const {
  error,
  isLoading,
  selectedPartId,
  xRayMode,
  crossSectionMode,
  crossSectionOffset,
  heartbeatEnabled,
  autoRotate,
  insideView,
  explodeFactor,
  bloodFlowEnabled,
  toggleXRay,
  toggleCrossSection,
  setCrossSectionOffset,
  resetCamera,
  toggleHeartbeat,
  toggleAutoRotate,
  toggleInsideView,
  setExplodeFactor,
  toggleBloodFlow,
  resetAll,
  selectPartById,
} = useHeartGLB(containerRef, props.parts);

const meshToPartId: Record<string, string> = {
  left_atrium: 'leftAtrium',
  right_atrium: 'rightAtrium',
  left_ventricle: 'leftVentricle',
  right_ventricle: 'rightVentricle',
  septum: 'septum',
  aortic_valve: 'aorticValve',
  mitral_valve: 'mitralValve',
  pulmonary_valve: 'pulmonaryValve',
  tricuspid_valve: 'tricuspidValve',
};

const partIdToMeshName: Record<string, string> = {
  leftAtrium: 'left_atrium',
  rightAtrium: 'right_atrium',
  leftVentricle: 'left_ventricle',
  rightVentricle: 'right_ventricle',
  septum: 'septum',
  aorticValve: 'aortic_valve',
  mitralValve: 'mitral_valve',
  pulmonaryValve: 'pulmonary_valve',
  tricuspidValve: 'tricuspid_valve',
};

const partList = computed<{ id: string; label: string }[]>(() =>
  props.parts
    .filter((p: HeartPart) => partIdToMeshName[p.id])
    .map((p: HeartPart) => ({ id: p.id, label: t(p.nameKey) }))
);

const activePart = computed<HeartPart | null>(() => {
  const id = selectedPartId.value ? meshToPartId[selectedPartId.value] : null;
  return props.parts.find((p: HeartPart) => p.id === id) ?? null;
});

const hotspot = computed<HotspotState | null>(() => {
  const part = activePart.value;
  if (!part) return null;
  return {
    organelleId: part.id,
    label: t(part.nameKey),
    description: t(part.descriptionKey),
    longDescription: part.longDescriptionKey ? t(part.longDescriptionKey) : undefined,
    facts: part.factsKeys?.map((key: string) => t(key)),
    position: new THREE.Vector3(...part.position),
  };
});

const isExploded = computed(() => explodeFactor.value > 0);

const onSliderInput = (event: Event): void => {
  const target = event.target as HTMLInputElement;
  setCrossSectionOffset(Number(target.value));
};

const onExplodeInput = (event: Event): void => {
  const target = event.target as HTMLInputElement;
  setExplodeFactor(Number(target.value));
};

const onSelectPart = (id: string): void => {
  selectPartById(id, partIdToMeshName);
};

const onResetAll = (): void => {
  resetAll();
};
</script>

<template>
  <div class="experiment-page">
    <header class="top-bar">
      <h1 class="title">{{ t('biology.heartTitle') }}</h1>
    </header>

    <main class="main-layout">
      <aside class="left-panel">
        <div class="controls-card">
          <h2 class="panel-title">{{ t('biology.controlsTitle') }}</h2>
          <div class="controls-grid">
            <button
              type="button"
              class="control-button"
              :class="{ active: xRayMode }"
              @click="toggleXRay"
            >
              {{ xRayMode ? t('biology.exitXRay') : t('biology.xRayMode') }}
            </button>
            <button
              type="button"
              class="control-button"
              :class="{ active: crossSectionMode }"
              @click="toggleCrossSection"
            >
              {{ crossSectionMode ? t('biology.exitCrossSection') : t('biology.crossSection') }}
            </button>
            <button
              type="button"
              class="control-button"
              :class="{ active: autoRotate }"
              @click="toggleAutoRotate"
            >
              {{ autoRotate ? t('biology.stopAutoRotate') : t('biology.autoRotate') }}
            </button>
            <button
              type="button"
              class="control-button"
              :class="{ active: heartbeatEnabled }"
              @click="toggleHeartbeat"
            >
              {{ heartbeatEnabled ? t('biology.disableHeartbeat') : t('biology.enableHeartbeat') }}
            </button>
            <button type="button" class="control-button" @click="resetCamera">
              {{ t('biology.resetCameraLabel') }}
            </button>
            <button
              type="button"
              class="control-button"
              :class="{ active: insideView }"
              @click="toggleInsideView"
            >
              {{ insideView ? t('biology.exitInsideView') : t('biology.insideView') }}
            </button>
            <button
              type="button"
              class="control-button"
              :class="{ active: bloodFlowEnabled, disabled: isExploded }"
              :disabled="isExploded"
              @click="toggleBloodFlow"
            >
              {{ bloodFlowEnabled ? t('biology.hideBloodFlow') : t('biology.showBloodFlow') }}
            </button>
          </div>

          <div v-if="crossSectionMode" class="slider-group">
            <label for="cross-section-slider">{{ t('biology.crossSectionOffset') }}</label>
            <input
              id="cross-section-slider"
              type="range"
              min="-3"
              max="3"
              step="0.05"
              :value="crossSectionOffset"
              @input="onSliderInput"
            />
          </div>

          <div class="slider-group">
            <label for="explode-slider">{{ t('biology.explodeLabel') }}</label>
            <input
              id="explode-slider"
              type="range"
              min="0"
              max="1.5"
              step="0.05"
              :value="explodeFactor"
              @input="onExplodeInput"
            />
          </div>

          <button type="button" class="control-button reset-all" @click="onResetAll">
            {{ t('biology.resetAllLabel') }}
          </button>
        </div>

        <div v-if="hotspot" class="info-card">
          <InfoPanel :hotspot="hotspot" />
        </div>

        <div v-else-if="!isLoading" class="empty-card">
          {{ t('biology.selectOrganelleHint') }}
        </div>
      </aside>

      <section class="canvas-section">
        <div ref="containerRef" class="heart-canvas" />
        <div v-if="isLoading" class="loading-overlay" role="status">{{ t('biology.loadingModel') }}</div>
        <div v-if="error" class="webgl-error" role="alert">{{ error }}</div>
        <div v-if="!hotspot && !isLoading" class="hint">
          {{ t('biology.selectOrganelleHint') }}
        </div>
      </section>

      <aside class="right-panel">
        <div v-if="partList.length" class="parts-card">
          <h2 class="panel-title">{{ t('biology.partsListTitle') }}</h2>
          <ul class="parts-list">
            <li
              v-for="part in partList"
              :key="part.id"
              class="part-item"
              :class="{ active: activePart?.id === part.id }"
              @click="onSelectPart(part.id)"
            >
              {{ part.label }}
            </li>
          </ul>
        </div>
      </aside>
    </main>
  </div>
</template>

<style scoped>
.experiment-page {
  display: flex;
  flex-direction: column;
  height: 100vh;
  background: #070b14;
  overflow: hidden;
  font-family: 'Segoe UI', 'Helvetica Neue', Tahoma, Geneva, Verdana, sans-serif;
}

.top-bar {
  flex: 0 0 auto;
  height: 64px;
  padding: 0 1.5rem;
  display: flex;
  align-items: center;
  border-bottom: 1px solid #1e293b;
  background: rgba(7, 11, 20, 0.95);
  z-index: 30;
}

.title {
  margin: 0;
  font-size: 1.35rem;
  color: #e2e8f0;
}

.main-layout {
  flex: 1 1 auto;
  display: grid;
  grid-template-columns: 320px 1fr 320px;
  gap: 1.25rem;
  padding: 1.25rem;
  min-height: 0;
}

.canvas-section {
  position: relative;
  min-width: 0;
  min-height: 0;
  border-radius: 1rem;
  overflow: hidden;
  background: radial-gradient(circle at center, #0f172a 0%, #070b14 100%);
}

.heart-canvas {
  width: 100%;
  height: 100%;
}

.loading-overlay,
.webgl-error {
  position: absolute;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 1.5rem;
  font-weight: 600;
  text-align: center;
  z-index: 10;
}

.loading-overlay {
  background: rgba(15, 23, 42, 0.85);
  color: #4ade80;
}

.webgl-error {
  background: rgba(15, 23, 42, 0.95);
  color: #ef4444;
}

.hint {
  position: absolute;
  bottom: 1rem;
  left: 1rem;
  background: rgba(15, 23, 42, 0.85);
  border: 1px solid #334155;
  color: #94a3b8;
  padding: 0.5rem 1rem;
  border-radius: 0.5rem;
  font-size: 0.9rem;
  z-index: 20;
  pointer-events: none;
}

.left-panel,
.right-panel {
  flex: 0 0 auto;
  min-width: 0;
  min-height: 0;
  background: rgba(10, 15, 28, 0.98);
  border: 1px solid #1e293b;
  border-radius: 1rem;
  padding: 1.25rem;
  display: flex;
  flex-direction: column;
  gap: 1.25rem;
  overflow-y: auto;
  z-index: 20;
}

.controls-card,
.parts-card,
.info-card,
.empty-card {
  background: rgba(15, 23, 42, 0.8);
  border: 1px solid #334155;
  border-radius: 0.75rem;
  padding: 1.25rem;
}

.info-card,
.empty-card {
  flex: 1 1 auto;
  min-height: 0;
  overflow-y: auto;
}

.parts-card {
  flex: 1 1 auto;
  min-height: 0;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
}

.panel-title {
  margin: 0 0 1rem;
  font-size: 1.05rem;
  color: #e2e8f0;
}

.controls-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 0.75rem;
}

.control-button {
  background: rgba(30, 41, 59, 0.8);
  border: 1px solid #334155;
  color: #e2e8f0;
  padding: 0.65rem 1rem;
  border-radius: 0.5rem;
  cursor: pointer;
  font-size: 0.9rem;
  font-weight: 600;
  transition: background 0.15s ease, border-color 0.15s ease, color 0.15s ease;
}

.control-button:hover {
  background: rgba(51, 65, 85, 0.9);
  border-color: #475569;
}

.control-button.active {
  background: rgba(74, 222, 128, 0.12);
  border-color: #4ade80;
  color: #4ade80;
}

.control-button:disabled,
.control-button.disabled {
  opacity: 0.45;
  cursor: not-allowed;
}

.slider-group {
  margin-top: 0.75rem;
  display: flex;
  flex-direction: column;
  gap: 0.4rem;
}

.slider-group label {
  font-size: 0.85rem;
  color: #94a3b8;
}

.slider-group input[type='range'] {
  width: 100%;
  accent-color: #4ade80;
}

.reset-all {
  width: 100%;
  margin-top: 0.75rem;
  background: rgba(239, 68, 68, 0.15);
  border-color: #ef4444;
  color: #fca5a5;
}

.reset-all:hover {
  background: rgba(239, 68, 68, 0.25);
}

.parts-list {
  list-style: none;
  margin: 0;
  padding: 0;
  display: flex;
  flex-direction: column;
  gap: 0.35rem;
}

.part-item {
  padding: 0.5rem 0.75rem;
  border-radius: 0.5rem;
  background: rgba(30, 41, 59, 0.5);
  color: #e2e8f0;
  font-size: 0.9rem;
  cursor: pointer;
  transition: background 0.15s ease;
}

.part-item:hover {
  background: rgba(51, 65, 85, 0.8);
}

.part-item.active {
  background: rgba(74, 222, 128, 0.15);
  border: 1px solid #4ade80;
  color: #4ade80;
}

.empty-card {
  color: #94a3b8;
  font-size: 0.9rem;
  line-height: 1.5;
}

@media (max-width: 1100px) {
  .main-layout {
    grid-template-columns: 1fr;
    padding: 1rem;
    gap: 1rem;
  }

  .left-panel,
  .right-panel {
    width: 100%;
    max-height: 45vh;
  }

  .controls-grid {
    grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
  }
}
</style>
