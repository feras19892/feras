<script setup lang="ts">
import { computed, ref } from 'vue';
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
  parts?: ModelPart[];
  modelGenerator?: () => THREE.Object3D;
  modelEnhancer?: (model: THREE.Object3D) => void;
}>();

const router = useRouter();
const { t } = useI18n();
const containerRef = ref<HTMLDivElement | null>(null);
const {
  error,
  isLoading,
  selectedPartId,
  hoveredPartId,
  xRayMode,
  crossSectionMode,
  crossSectionOffset,
  autoRotate,
  highlight,
  setHovered,
  resetCamera,
  toggleXRay,
  toggleCrossSection,
  setCrossSectionOffset,
  toggleAutoRotate,
  screenshot,
  resetAll,
} = useGLBModel(containerRef, props.modelPath, props.parts ?? [], props.modelGenerator, props.modelEnhancer);

const goBack = (): void => {
  router.push(props.backRoute);
};

const selectedPart = computed<ModelPart | null>(() => {
  if (!selectedPartId.value) return null;
  return (props.parts ?? []).find((p) => p.id === selectedPartId.value) ?? null;
});

const hotspot = computed<HotspotState | null>(() => {
  if (!selectedPart.value) return null;
  const part = selectedPart.value;
  return {
    partId: part.id,
    label: t(part.nameKey),
    description: t(part.descriptionKey),
    longDescription: part.longDescriptionKey ? t(part.longDescriptionKey) : undefined,
    facts: part.factsKeys?.map((key: string) => t(key)),
    position: new THREE.Vector3(...part.position),
  };
});

const markerLabels = computed(() =>
  Object.fromEntries((props.parts ?? []).map((p) => [p.id, t(p.nameKey)])),
);

const onPointerDown = (_event: PointerEvent): void => {
  // placeholder for future drag detection
};

const select = (id: string | null): void => {
  highlight(id);
  if (!id) resetCamera();
};

const onCrossSectionInput = (event: Event): void => {
  setCrossSectionOffset(Number((event.target as HTMLInputElement).value));
};

const downloadScreenshot = (): void => {
  const dataUrl = screenshot();
  if (!dataUrl) return;
  const link = document.createElement('a');
  link.href = dataUrl;
  link.download = 'anatomy-screenshot.png';
  link.click();
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
        {{ t(props.backLabelKey) }}
      </button>
      <div class="header-content">
        <h1 class="experiment-title">{{ t(props.titleKey) }}</h1>
        <p class="experiment-subtitle">{{ t(props.subtitleKey) }}</p>
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

      <section
        class="canvas-section"
        @pointerdown="onPointerDown"
      >
        <div ref="containerRef" class="cell-canvas" />

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
            class="tool-btn"
            :title="t('biology.screenshot')"
            @click.stop="downloadScreenshot"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z" />
              <circle cx="12" cy="13" r="4" />
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

        <div v-if="crossSectionMode" class="floating-slider">
          <label>{{ t('biology.crossSectionOffset') }}</label>
          <input
            type="range"
            min="-4"
            max="4"
            step="0.1"
            :value="crossSectionOffset"
            @input="onCrossSectionInput"
          />
        </div>
      </section>

      <aside v-if="parts && parts.length" class="side-panel parts-side">
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
            {{ t('biology.partsListTitle') }}
          </h2>
          <ul class="parts-list">
            <li
              v-for="part in parts"
              :key="part.id"
              class="part-item"
              :class="{ active: part.id === selectedPartId, hovered: part.id === hoveredPartId }"
              @click.stop="select(part.id)"
              @mouseenter="setHovered(part.id)"
              @mouseleave="setHovered(null)"
            >
              <span class="part-dot" />
              {{ markerLabels[part.id] }}
            </li>
          </ul>
        </div>
      </aside>
    </main>
  </div>
</template>

<style scoped src="./glb-experiment.css"></style>
