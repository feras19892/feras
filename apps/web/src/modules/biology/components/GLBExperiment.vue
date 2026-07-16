<script setup lang="ts">
import { computed, ref, watch } from 'vue';
import { useRouter } from 'vue-router';
import * as THREE from 'three';
import { useI18n } from '../../../composables/useI18n';
import { useGLBModel } from '../../../composables/biology/useGLBModel';
import type { ModelPart } from '../../../composables/biology/useGLBModel';
import type { HotspotState } from '../../../types/biology.types';
import InfoPanel from './InfoPanel.vue';

const props = defineProps<{
  modelPath: string;
  titleKey: string;
  subtitleKey: string;
  backRoute: string;
  backLabelKey: string;
  parts: ModelPart[];
  modelColor?: string;
}>();

const router = useRouter();
const { t } = useI18n();
const containerRef = ref<HTMLDivElement | null>(null);
const {
  error,
  isLoading,
  selectedPartId,
  xRayMode,
  crossSectionMode,
  crossSectionOffset,
  insideView,
  getWorldPosition,
  highlight,
  pickPart,
  focusOn,
  resetCamera,
  toggleXRay,
  toggleCrossSection,
  setCrossSectionOffset,
  toggleInsideView,
  resetAll,
} = useGLBModel(containerRef, props.modelPath, props.parts, props.modelColor);

const onCrossSectionInput = (event: Event): void => {
  const value = Number((event.target as HTMLInputElement).value);
  setCrossSectionOffset(value);
};

const goBack = (): void => {
  router.push(props.backRoute);
};

const selectedPart = computed<ModelPart | null>(() => {
  if (!selectedPartId.value) return null;
  return props.parts.find((p) => p.id === selectedPartId.value) ?? null;
});

const hotspot = computed<HotspotState | null>(() => {
  if (!selectedPart.value) return null;
  const part = selectedPart.value;
  return {
    organelleId: part.id,
    label: t(part.nameKey),
    description: t(part.descriptionKey),
    longDescription: part.longDescriptionKey ? t(part.longDescriptionKey) : undefined,
    facts: part.factsKeys?.map((key: string) => t(key)),
    position: new THREE.Vector3(...part.position),
  };
});

const markerLabels = computed(() =>
  Object.fromEntries(props.parts.map((p) => [p.id, t(p.nameKey)]))
);

const handleCanvasClick = (event: PointerEvent): void => {
  const id = pickPart(event.clientX, event.clientY);
  select(id);
};

const select = (id: string | null): void => {
  selectedPartId.value = id;
  highlight(id);
  if (!id) {
    resetCamera();
    return;
  }
  const worldPos = getWorldPosition(id);
  if (worldPos) {
    focusOn(worldPos, 5);
  }
};

watch(selectedPartId, (id) => highlight(id));
</script>

<template>
  <div class="experiment-page">
    <header class="experiment-header">
      <button class="back-button" @click="goBack">
        {{ t(props.backLabelKey) }}
      </button>
      <h1 class="experiment-title">{{ t(props.titleKey) }}</h1>
      <p class="experiment-subtitle">{{ t(props.subtitleKey) }}</p>
    </header>

    <main class="experiment-body">
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
              {{ xRayMode ? t('biology.disableXray') : t('biology.enableXray') }}
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
              :class="{ active: crossSectionMode }"
              @click="toggleCrossSection"
            >
              {{ crossSectionMode ? t('biology.exitCrossSection') : t('biology.crossSection') }}
            </button>
            <button type="button" class="control-button" @click="resetCamera">
              {{ t('biology.resetCameraLabel') }}
            </button>
          </div>

          <div v-if="crossSectionMode" class="slider-group">
            <label for="cross-section-slider">{{ t('biology.crossSectionOffset') }}</label>
            <input
              id="cross-section-slider"
              type="range"
              min="-4"
              max="4"
              step="0.1"
              :value="crossSectionOffset"
              @input="onCrossSectionInput"
            />
          </div>

          <button type="button" class="control-button reset-all" @click="resetAll">
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

      <section class="canvas-section" @click="handleCanvasClick">
        <div ref="containerRef" class="cell-canvas" />
        <div v-if="isLoading" class="loading-overlay" role="status">
          {{ t('biology.loadingModel') }}
        </div>
        <div v-if="error" class="webgl-error" role="alert">
          {{ error }}
        </div>
      </section>

      <aside class="right-panel">
        <div class="parts-card">
          <h2 class="panel-title">{{ t('biology.partsListTitle') }}</h2>
          <ul class="parts-list">
            <li
              v-for="part in parts"
              :key="part.id"
              class="part-item"
              :class="{ active: part.id === selectedPartId }"
              @click.stop="select(part.id)"
            >
              {{ markerLabels[part.id] }}
            </li>
          </ul>
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
  grid-template-columns: 320px 1fr 320px;
  gap: 1.25rem;
  flex: 1;
  min-height: 0;
  padding: 0;
}

.canvas-section {
  position: relative;
  min-height: 480px;
  border: 1px solid #334155;
  border-radius: 1rem;
  overflow: hidden;
  background: rgba(15, 23, 42, 0.5);
  cursor: pointer;
}

.loading-overlay {
  position: absolute;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 1.5rem;
  background: rgba(15, 23, 42, 0.85);
  color: #4ade80;
  font-weight: 600;
  text-align: center;
  z-index: 10;
}

.webgl-error {
  position: absolute;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 1.5rem;
  background: rgba(15, 23, 42, 0.95);
  color: #ef4444;
  font-weight: 600;
  text-align: center;
  z-index: 20;
}

.cell-canvas {
  width: 100%;
  height: 100%;
  min-height: 480px;
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

.slider-group {
  margin-top: 0.75rem;
  display: flex;
  flex-direction: column;
  gap: 0.35rem;
  color: #94a3b8;
  font-size: 0.85rem;
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

.parts-card .part-item {
  padding: 0.5rem 0.75rem;
  border-radius: 0.5rem;
  background: rgba(30, 41, 59, 0.5);
  color: #e2e8f0;
  font-size: 0.9rem;
  cursor: pointer;
  transition: background 0.15s ease;
}

.parts-card .part-item:hover {
  background: rgba(51, 65, 85, 0.8);
}

.parts-card .part-item.active {
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
  .experiment-body {
    grid-template-columns: 1fr;
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
