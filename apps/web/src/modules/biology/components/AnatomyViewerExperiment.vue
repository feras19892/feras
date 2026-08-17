<script setup lang="ts">
import { computed, ref } from 'vue';
import { useRouter } from 'vue-router';
import * as THREE from 'three';
import { useI18n } from '../../../composables/useI18n';
import type { AnatomyOrganData, AnatomyOrganPart } from '../../../services/anatomy-viewer-data';
import type { HotspotState } from '../../../types/biology.types';
import InfoPanel from './InfoPanel.vue';
import StageStepper from './StageStepper.vue';

const props = defineProps<{
  organData: AnatomyOrganData;
}>();

const router = useRouter();
const { t } = useI18n();
const currentPartIndex = ref(0);
const isLoading = ref(true);

const part = computed<AnatomyOrganPart>(() => props.organData.parts[currentPartIndex.value]);

const sketchfabEmbedUrl = computed(() => {
  const uid = props.organData.sketchfabUid;
  if (!uid) return '';
  return `https://sketchfab.com/models/${uid}/embed?autostart=1&internal=1&tracking=0&ui_ar=0&ui_infos=0&ui_snapshots=1&ui_stop=0&ui_theatre=1&ui_watermark=0&ui_help=0&ui_settings=0&ui_annotations=0&ui_hint=0&ui_inspector=0`;
});

const hotspot = computed<HotspotState>(() => ({
  partId: part.value.id,
  label: t(part.value.titleKey),
  description: t(part.value.descriptionKey),
  longDescription: part.value.longDescriptionKey ? t(part.value.longDescriptionKey) : undefined,
  facts: part.value.factsKeys?.map((key) => t(key)),
  position: new THREE.Vector3(0, 0, 0),
}));

const partItems = computed(() =>
  props.organData.parts.map((p) => ({
    id: p.id,
    label: t(p.titleKey),
    description: t(p.descriptionKey),
  }))
);

const setPart = (index: number): void => {
  currentPartIndex.value = Math.max(0, Math.min(props.organData.parts.length - 1, index));
  isLoading.value = true;
};

const nextPart = (): void => {
  setPart(currentPartIndex.value + 1);
};

const previousPart = (): void => {
  setPart(currentPartIndex.value - 1);
};

const isFirst = computed(() => currentPartIndex.value === 0);
const isLast = computed(() => currentPartIndex.value === props.organData.parts.length - 1);

const goBack = (): void => {
  router.push('/biology/anatomy');
};

const onIframeLoad = (): void => {
  isLoading.value = false;
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
        <h1 class="experiment-title">{{ t(organData.titleKey) }}</h1>
        <p class="experiment-subtitle">{{ t(organData.subtitleKey) }}</p>
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
          :key="organData.sketchfabUid"
          :src="sketchfabEmbedUrl"
          class="sketchfab-embed"
          allow="autoplay; fullscreen; xr-spatial-tracking"
          allowfullscreen
          loading="eager"
          @load="onIframeLoad"
        />

        <div class="model-attribution">
          <span>3D Model on Sketchfab</span>
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
            {{ t('biology.partsListTitle') }}
          </h3>
          <StageStepper
            :model-value="currentPartIndex"
            :stages="partItems"
            :aria-label="t('biology.partsListTitle')"
            @update:model-value="setPart"
          />
          <div class="stage-actions">
            <button
              class="action-button"
              :disabled="isFirst"
              @click="previousPart"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M15 18l-6-6 6-6" />
              </svg>
              {{ t('biology.previousStage') }}
            </button>
            <button
              class="action-button primary"
              :disabled="isLast"
              @click="nextPart"
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
@import './experiment-styles.css';

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

@media (max-width: 900px) {
  .experiment-body {
    grid-template-columns: 1fr;
  }

  .side-panel {
    max-height: 50vh;
  }
}
</style>
