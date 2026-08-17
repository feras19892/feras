<script setup lang="ts">
import { computed, ref } from 'vue';
import { useRouter } from 'vue-router';
import * as THREE from 'three';
import { useI18n } from '../../../composables/useI18n';
import { useHeartGLB } from '../../../composables/biology/useHeartGLB';
import type { HeartPart } from '../../../composables/biology/useHeartGLB';
import type { HotspotState } from '../../../types/biology.types';
import InfoPanel from './InfoPanel.vue';
import HeartToolbar from './HeartToolbar.vue';

const props = defineProps<{
  parts: HeartPart[];
}>();

const router = useRouter();
const { t } = useI18n();
const goBack = (): void => {
  router.push('/biology/anatomy');
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

const meshToPartId: Record<string, string> = Object.fromEntries(
  Object.entries(partIdToMeshName).map(([partId, meshName]) => [meshName, partId])
);

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

        <HeartToolbar
          :x-ray-mode="xRayMode"
          :inside-view="insideView"
          :cross-section-mode="crossSectionMode"
          :heartbeat-enabled="heartbeatEnabled"
          :blood-flow-enabled="bloodFlowEnabled"
          :auto-rotate="autoRotate"
          :is-exploded="isExploded"
          @toggle-x-ray="toggleXRay"
          @toggle-inside-view="toggleInsideView"
          @toggle-cross-section="toggleCrossSection"
          @toggle-heartbeat="toggleHeartbeat"
          @toggle-blood-flow="toggleBloodFlow"
          @toggle-auto-rotate="toggleAutoRotate"
          @reset-camera="resetCamera"
          @reset-all="onResetAll"
        />

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

<style scoped src="./heart-experiment.css"></style>
