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
const goBack = (): void => {
  window.history.back();
};
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
    partId: part.id,
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
        {{ t('biology.backToAnatomySection') }}
      </button>
      <div class="header-content">
        <h1 class="experiment-title">{{ t('biology.heartTitle') }}</h1>
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
        <div v-if="hotspot" class="info-card">
          <InfoPanel :hotspot="hotspot" />
        </div>
        <div v-else-if="!isLoading" class="empty-card">
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
        <div ref="containerRef" class="heart-canvas" />

        <div v-if="isLoading" class="loading-overlay" role="status">
          <div class="spinner" />
          <span>{{ t('biology.loadingModel') }}</span>
        </div>
        <div v-if="error" class="webgl-error" role="alert">{{ error }}</div>

        <div class="floating-toolbar">
          <button
            class="tool-btn"
            :class="{ active: xRayMode }"
            :title="t('biology.xRayMode')"
            @click.stop="toggleXRay"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7z" />
              <circle cx="12" cy="12" r="3" />
            </svg>
          </button>
          <button
            class="tool-btn"
            :class="{ active: insideView }"
            :title="t('biology.insideView')"
            @click.stop="toggleInsideView"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
              <polyline points="9 22 9 12 15 12 15 22" />
            </svg>
          </button>
          <button
            class="tool-btn"
            :class="{ active: crossSectionMode }"
            :title="t('biology.crossSection')"
            @click.stop="toggleCrossSection"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M3 12h18M3 6h18M3 18h18" />
            </svg>
          </button>
          <button
            class="tool-btn"
            :class="{ active: heartbeatEnabled }"
            :title="t('biology.enableHeartbeat')"
            @click.stop="toggleHeartbeat"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
            </svg>
          </button>
          <button
            class="tool-btn"
            :class="{ active: bloodFlowEnabled, disabled: isExploded }"
            :disabled="isExploded"
            :title="t('biology.showBloodFlow')"
            @click.stop="toggleBloodFlow"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M12 2.69l5.66 5.66a8 8 0 1 1-11.31 0z" />
            </svg>
          </button>
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
          <div class="tool-divider" />
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
            @click.stop="onResetAll"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M3 6h18M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
            </svg>
          </button>
        </div>

        <div v-if="crossSectionMode" class="floating-slider">
          <label>{{ t('biology.crossSectionOffset') }}</label>
          <input type="range" min="-3" max="3" step="0.05" :value="crossSectionOffset" @input="onSliderInput" />
        </div>

        <div class="floating-slider">
          <label>{{ t('biology.explodeLabel') }}</label>
          <input type="range" min="0" max="1.5" step="0.05" :value="explodeFactor" @input="onExplodeInput" />
        </div>
      </section>

      <aside class="side-panel parts-side">
        <div v-if="partList.length" class="parts-card">
          <h2 class="panel-title">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <line x1="8" y1="6" x2="21" y2="6" />
              <line x1="8" y1="12" x2="21" y2="12" />
              <line x1="8" y1="18" x2="21" y2="18" />
              <line x1="3" y1="6" x2="3.01" y2="6" />
              <line x1="3" y1="12" x2="3.01" y2="12" />
              <line x1="3" y1="18" x2="3.01" y2="18" />
            </svg>
            {{ t('biology.partsListTitle') }}
          </h2>
          <ul class="parts-list">
            <li
              v-for="part in partList"
              :key="part.id"
              class="part-item"
              :class="{ active: activePart?.id === part.id }"
              @click="onSelectPart(part.id)"
            >
              <span class="part-dot" />
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
  margin: 0;
  color: #4ade80;
  font-weight: 700;
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

.info-side .info-card,
.info-side .empty-card {
  flex: 1;
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

.parts-card {
  flex: 1 1 auto;
  min-height: 0;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
}

.panel-title {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin: 0 0 1rem;
  font-size: 1rem;
  color: #e2e8f0;
  font-weight: 600;
}

.parts-list {
  list-style: none;
  margin: 0;
  padding: 0;
  display: flex;
  flex-direction: column;
  gap: 0.3rem;
  overflow-y: auto;
  flex: 1;
}

.part-item {
  display: flex;
  align-items: center;
  gap: 0.6rem;
  padding: 0.55rem 0.75rem;
  border-radius: 0.5rem;
  background: rgba(30, 41, 59, 0.4);
  color: #cbd5e1;
  font-size: 0.88rem;
  cursor: pointer;
  transition: all 0.15s ease;
  border: 1px solid transparent;
}

.part-item:hover {
  background: rgba(51, 65, 85, 0.7);
}

.part-item.active {
  background: rgba(74, 222, 128, 0.12);
  border-color: rgba(74, 222, 128, 0.4);
  color: #4ade80;
}

.part-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: #475569;
  flex-shrink: 0;
  transition: background 0.15s ease;
}

.part-item.active .part-dot {
  background: #4ade80;
  box-shadow: 0 0 8px rgba(74, 222, 128, 0.6);
}

.canvas-section {
  position: relative;
  min-height: 500px;
  border: 1px solid #1e293b;
  border-radius: 1rem;
  overflow: hidden;
  background: radial-gradient(ellipse at center, #0f172a 0%, #0a0f1c 100%);
}

.heart-canvas {
  width: 100%;
  height: 100%;
  min-height: 500px;
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

.tool-btn.danger {
  color: #fca5a5;
}

.tool-btn.danger:hover {
  background: rgba(239, 68, 68, 0.15);
  color: #ef4444;
}

.tool-btn:disabled {
  opacity: 0.45;
  cursor: not-allowed;
}

.tool-divider {
  width: 1px;
  height: 24px;
  background: #334155;
  margin: 0 0.2rem;
}

.floating-slider {
  position: absolute;
  left: 50%;
  transform: translateX(-50%);
  display: flex;
  align-items: center;
  gap: 0.5rem;
  background: rgba(15, 23, 42, 0.92);
  backdrop-filter: blur(12px);
  border: 1px solid #334155;
  border-radius: 0.6rem;
  padding: 0.4rem 0.75rem;
  z-index: 14;
}

.floating-slider:nth-of-type(1) {
  bottom: 5rem;
}

.floating-slider:nth-of-type(2) {
  bottom: 6.5rem;
}

.floating-slider label {
  font-size: 0.8rem;
  color: #94a3b8;
  white-space: nowrap;
}

.floating-slider input[type='range'] {
  width: 120px;
  accent-color: #4ade80;
}

@media (max-width: 1100px) {
  .experiment-body {
    grid-template-columns: 1fr;
  }

  .side-panel {
    max-height: 45vh;
  }

  .floating-toolbar {
    flex-wrap: wrap;
    justify-content: center;
  }
}
</style>
