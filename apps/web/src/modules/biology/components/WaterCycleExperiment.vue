<script setup lang="ts">
import { useI18n } from '@/composables/useI18n';
import BiologyHelpModal from '../../../components/experiment/biology/BiologyHelpModal.vue';
const { t } = useI18n();
import { computed, ref, watch } from 'vue';
import { useRouter } from 'vue-router';
import * as THREE from 'three';

import { waterCycleStages, waterCycleExperiment } from '../../../services/ecology-data';
import type { EcologyStage } from '../../../services/ecology-data';
import { useBiologyTracking } from '../../../composables/biology/useBiologyTracking';
import { useBiologyScreenshot } from '../../../composables/biology/useBiologyScreenshot';
import type { HotspotState } from '../../../types/biology.types';
import InfoPanel from './InfoPanel.vue';
import StageStepper from './StageStepper.vue';
import { useRoute } from 'vue-router';
import BiologyReportButton from './BiologyReportButton.vue';
import BiologyGoals from './BiologyGoals.vue';
import { resolveExperimentId } from '../../../composables/useExperimentId';
import { useFullscreen } from '../../../composables/shared/useFullscreen';

const router = useRouter();
const route = useRoute();
const experimentId = computed(() => resolveExperimentId('biology', route.path.split('/').filter(Boolean).pop() ?? ''));

const currentStageIndex = ref(0);
const error = ref<string | null>(null);

const tracking = useBiologyTracking();
const { containerRef, getScreenshot } = useBiologyScreenshot();
watch(currentStageIndex, (idx) => {
  const s = waterCycleStages[idx];
  if (!s) return;
  tracking.trackStage(s.id);
  tracking.trackPart(s.id, t(s.titleKey));
}, { immediate: true });

const stage = computed(() => waterCycleStages[currentStageIndex.value]);

const hotspot = computed<HotspotState>(() => ({
  partId: stage.value.id,
  label: t(stage.value.titleKey),
  description: t(stage.value.descriptionKey),
  longDescription: t(stage.value.longDescriptionKey),
  facts: stage.value.factsKeys.map((key) => t(key)),
  position: new THREE.Vector3(0, 0, 0),
}));

const stageItems = computed(() =>
  waterCycleStages.map((s) => ({ id: s.id, label: t(s.titleKey), description: t(s.descriptionKey) }))
);

const visitedStageIds = computed(() => new Set(tracking.stagesVisited.value));
const goals = computed(() => [
  {
    id: 'visitAllStages',
    label: t('biology.goalVisitAllStages'),
    completed: visitedStageIds.value.size >= waterCycleStages.length,
  },
]);

const nextStage = (): void => {
  currentStageIndex.value = Math.min(waterCycleStages.length - 1, currentStageIndex.value + 1);
};

const previousStage = (): void => {
  currentStageIndex.value = Math.max(0, currentStageIndex.value - 1);
};

const isFirstStage = computed(() => currentStageIndex.value === 0);
const isLastStage = computed(() => currentStageIndex.value === waterCycleStages.length - 1);

const goBack = (): void => {
  void router.push('/biology/ecology');
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
        {{ t('biology.backToEcologySection') }}
      </button>
      <div class="header-content">
        <h1 class="experiment-title">{{ t(waterCycleExperiment.titleKey) }}</h1>
        <p class="experiment-subtitle">{{ t(waterCycleExperiment.subtitleKey) }}</p>
      </div>
      <BiologyReportButton
        :experiment-id="experimentId"
        :experiment-name="t(waterCycleExperiment.titleKey)"
        :tracking="tracking"
        :get-screenshot="getScreenshot"
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

      <section ref="containerRef" class="canvas-section wc-stage">
        <svg class="wc-scene" viewBox="0 0 800 450" role="img" :aria-label="t(stage.titleKey)">
          <defs>
            <linearGradient id="skyGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stop-color="#38bdf8" />
              <stop offset="55%" stop-color="#1e3a5f" />
              <stop offset="100%" stop-color="#0f172a" />
            </linearGradient>
            <linearGradient id="seaGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stop-color="#0ea5e9" />
              <stop offset="100%" stop-color="#0c4a6e" />
            </linearGradient>
            <linearGradient id="sunGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stop-color="#facc15" />
              <stop offset="100%" stop-color="#f59e0b" />
            </linearGradient>
            <radialGradient id="sunGlow" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stop-color="#facc15" stop-opacity="0.65" />
              <stop offset="70%" stop-color="#f59e0b" stop-opacity="0.2" />
              <stop offset="100%" stop-color="#f59e0b" stop-opacity="0" />
            </radialGradient>
            <linearGradient id="mountainGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stop-color="#64748b" />
              <stop offset="100%" stop-color="#1e293b" />
            </linearGradient>
            <linearGradient id="snowGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stop-color="#f8fafc" />
              <stop offset="100%" stop-color="#cbd5e1" />
            </linearGradient>
            <linearGradient id="cloudGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stop-color="#ffffff" />
              <stop offset="100%" stop-color="#e2e8f0" />
            </linearGradient>
            <linearGradient id="riverGrad" x1="1" y1="0" x2="0" y2="0">
              <stop offset="0%" stop-color="#0ea5e9" />
              <stop offset="100%" stop-color="#38bdf8" />
            </linearGradient>
            <filter id="dropShadow" x="-20%" y="-20%" width="140%" height="140%">
              <feDropShadow dx="1" dy="2" stdDeviation="2" flood-color="#000" flood-opacity="0.45" />
            </filter>
            <marker id="arrowHead" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="5" markerHeight="5" orient="auto-start-reverse">
              <path d="M 0 0 L 10 5 L 0 10 L 2 5 z" fill="#38bdf8" />
            </marker>
            <marker id="arrowHeadActive" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="5" markerHeight="5" orient="auto-start-reverse">
              <path d="M 0 0 L 10 5 L 0 10 L 2 5 z" fill="#facc15" />
            </marker>
          </defs>

          <rect x="0" y="0" width="800" height="450" fill="url(#skyGrad)" />

          <g class="wc-sun">
            <circle class="wc-sun-glow" cx="690" cy="70" r="80" fill="url(#sunGlow)" opacity="0.5" />
            <circle class="wc-sun-core" cx="690" cy="70" r="32" fill="url(#sunGrad)" />
            <g class="wc-sun-rays" stroke="#facc15" stroke-width="3" stroke-linecap="round" opacity="0.9">
              <line x1="690" y1="28" x2="690" y2="5" />
              <line x1="690" y1="112" x2="690" y2="135" />
              <line x1="648" y1="70" x2="625" y2="70" />
              <line x1="732" y1="70" x2="755" y2="70" />
              <line x1="660" y1="40" x2="643" y2="23" />
              <line x1="720" y1="100" x2="737" y2="117" />
              <line x1="660" y1="100" x2="643" y2="117" />
              <line x1="720" y1="40" x2="737" y2="23" />
            </g>
          </g>

          <rect class="wc-sea" x="0" y="335" width="340" height="115" fill="url(#seaGrad)" />
          <path d="M0 335 Q 60 325 120 335 T 240 335 T 340 335 V 450 H0 Z" fill="#7dd3fc" opacity="0.12" />
          <path d="M0 360 Q 70 350 140 360 T 280 360 T 340 360 V 450 H0 Z" fill="#38bdf8" opacity="0.08" />

          <g class="wc-mountain" filter="url(#dropShadow)">
            <polygon points="330,335 540,80 740,335" fill="url(#mountainGrad)" />
            <path d="M 505 110 L 540 80 L 575 110 L 540 95 Z" fill="url(#snowGrad)" />
          </g>
          <g class="wc-mountain" filter="url(#dropShadow)">
            <polygon points="600,335 710,180 790,335" fill="url(#mountainGrad)" />
            <path d="M 685 205 L 710 180 L 735 205 L 710 192 Z" fill="url(#snowGrad)" />
          </g>

          <path class="wc-river" d="M 580 335 C 540 365 490 395 430 405 S 330 420 230 425 C 150 430 80 435 20 440 S 0 445 0 447" stroke="url(#riverGrad)" stroke-width="12" fill="none" stroke-linecap="round" stroke-linejoin="round" filter="url(#dropShadow)" />

          <g class="wc-cloud" :class="{ 'wc-active': currentStageIndex === 1 }" filter="url(#dropShadow)">
            <ellipse cx="370" cy="100" rx="110" ry="42" fill="url(#cloudGrad)" />
            <ellipse cx="290" cy="115" rx="65" ry="32" fill="#f1f5f9" opacity="0.9" />
            <ellipse cx="450" cy="115" rx="70" ry="34" fill="#e2e8f0" opacity="0.9" />
            <ellipse cx="370" cy="78" rx="55" ry="24" fill="#ffffff" opacity="0.75" />
          </g>

          <g v-show="currentStageIndex === 0" class="wc-evaporation-group" :class="{ 'wc-active': currentStageIndex === 0 }">
            <circle v-for="i in 8" :key="'v' + i" class="wc-vapor" :style="{ animationDelay: (i * 0.45) + 's' }" :cx="50 + i * 35" :cy="335" r="6" fill="#e0f2fe" />
          </g>

          <g v-show="currentStageIndex === 1" class="wc-condensation-cloud">
            <ellipse cx="370" cy="100" rx="110" ry="42" fill="url(#cloudGrad)" opacity="0.55" />
            <ellipse cx="290" cy="115" rx="65" ry="32" fill="#f1f5f9" opacity="0.5" />
            <ellipse cx="450" cy="115" rx="70" ry="34" fill="#e2e8f0" opacity="0.5" />
            <ellipse cx="370" cy="78" rx="55" ry="24" fill="#ffffff" opacity="0.45" />
          </g>

          <g v-show="currentStageIndex === 2" class="wc-rain-group" :class="{ 'wc-active': currentStageIndex === 2 }">
            <line v-for="i in 14" :key="'r' + i" class="wc-rain" :style="{ animationDelay: (i * 0.12) + 's' }" :x1="265 + i * 12" :y1="145" :x2="258 + i * 12" :y2="185" stroke="#7dd3fc" stroke-width="2.5" stroke-linecap="round" />
          </g>

          <g v-show="currentStageIndex === 3" class="wc-collection-group" :class="{ 'wc-active': currentStageIndex === 3 }">
            <path class="wc-river-flow" d="M 580 335 C 540 365 490 395 430 405 S 330 420 230 425 C 150 430 80 435 20 440 S 0 445 0 447" stroke="#a5f3fc" stroke-width="5" fill="none" stroke-linecap="round" stroke-dasharray="8 16" pathLength="100" />
          </g>

          <g class="wc-arrows">
            <path class="wc-arrow" :class="{ 'wc-active-arrow': currentStageIndex === 0 }" :marker-end="currentStageIndex === 0 ? 'url(#arrowHeadActive)' : 'url(#arrowHead)'" d="M 110 320 C 160 235 240 160 305 145" />
            <path class="wc-arrow" :class="{ 'wc-active-arrow': currentStageIndex === 1 }" :marker-end="currentStageIndex === 1 ? 'url(#arrowHeadActive)' : 'url(#arrowHead)'" d="M 300 150 Q 360 190 420 150" />
            <path class="wc-arrow" :class="{ 'wc-active-arrow': currentStageIndex === 2 }" :marker-end="currentStageIndex === 2 ? 'url(#arrowHeadActive)' : 'url(#arrowHead)'" d="M 430 140 Q 500 190 600 160" />
            <path class="wc-arrow" :class="{ 'wc-active-arrow': currentStageIndex === 3 }" :marker-end="currentStageIndex === 3 ? 'url(#arrowHeadActive)' : 'url(#arrowHead)'" d="M 580 335 C 540 365 490 395 430 405 S 330 420 230 425 C 150 430 80 435 20 440 S 0 445 0 447" />
          </g>

          <g class="wc-labels">
            <text x="90" y="280" class="wc-label" text-anchor="start">{{ t('biology.waterCycle.evaporation.title') }}</text>
            <text x="360" y="210" class="wc-label" text-anchor="middle">{{ t('biology.waterCycle.condensation.title') }}</text>
            <text x="520" y="230" class="wc-label" text-anchor="middle">{{ t('biology.waterCycle.precipitation.title') }}</text>
            <text x="240" y="390" class="wc-label" text-anchor="middle">{{ t('biology.waterCycle.collection.title') }}</text>
          </g>
        </svg>

        <div v-if="error" class="webgl-error" role="alert">{{ error }}</div>
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
            {{ t('biology.waterCycleStageLabel') }}
          </h2>
          <StageStepper
            :model-value="currentStageIndex"
            :stages="stageItems"
            :aria-label="t('biology.waterCycleStageLabel')"
            @update:model-value="(i: number) => currentStageIndex = i"
          />
          <div class="stage-actions">
            <button class="action-button" :disabled="isFirstStage" @click="previousStage">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M15 18l-6-6 6-6" />
              </svg>
              {{ t('biology.previousStage') }}
            </button>
            <button class="action-button primary" :disabled="isLastStage" @click="nextStage">
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
    :context="{ topic: 'water-cycle', titleKey: waterCycleExperiment.titleKey, subtitleKey: waterCycleExperiment.subtitleKey, parts: waterCycleStages.map((s) => ({ id: s.id, nameKey: s.titleKey })) }"
    @close="helpOpen = false"
  />
  </div>
</template>

<style scoped src="./glb-experiment.css"></style>
<style scoped>
.wc-stage {
  padding: 0.5rem;
  display: flex;
  justify-content: center;
  align-items: center;
  width: 100%;
  overflow: hidden;
}

.wc-scene {
  width: 100%;
  max-width: 900px;
  height: auto;
  display: block;
  border-radius: 0.85rem;
  border: 1px solid #334155;
  background: #0f172a;
}

.wc-sun {
  filter: drop-shadow(0 0 12px rgba(250, 204, 21, 0.6));
}

.wc-sun-core {
  fill: url(#sunGrad);
}

.wc-sun-glow {
  transform-box: fill-box;
  transform-origin: center;
  animation: wc-pulse 4s ease-in-out infinite alternate;
  opacity: 0.5;
}

.wc-sun-rays {
  transform-box: fill-box;
  transform-origin: center;
  animation: wc-spin 24s linear infinite;
}

.wc-sea {
  fill: url(#seaGrad);
}

.wc-mountain {
  fill: url(#mountainGrad);
  filter: url(#dropShadow);
}

.wc-river {
  fill: none;
  stroke: url(#riverGrad);
  filter: url(#dropShadow);
}

.wc-cloud {
  transform-box: fill-box;
  transform-origin: center;
}

.wc-cloud.wc-active {
  animation: wc-pulse 2s ease-in-out infinite;
}

.wc-condensation-cloud {
  transform-box: fill-box;
  transform-origin: center;
  animation: wc-pulse 2.2s ease-in-out infinite;
  pointer-events: none;
}

.wc-arrow {
  fill: none;
  stroke: #38bdf8;
  stroke-width: 3;
  stroke-linecap: round;
  stroke-linejoin: round;
  opacity: 0.85;
  transition: all 0.3s ease;
  filter: drop-shadow(0 2px 4px rgba(0, 0, 0, 0.45));
}

.wc-arrow.wc-active-arrow {
  stroke: #facc15;
  stroke-width: 4.5;
  opacity: 1;
  filter: drop-shadow(0 0 5px rgba(250, 204, 21, 0.9));
}

.wc-label {
  font-family: system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
  font-size: 14px;
  font-weight: 700;
  fill: #f8fafc;
  filter: drop-shadow(0 1px 3px rgba(0, 0, 0, 0.85));
  pointer-events: none;
}

.wc-vapor {
  opacity: 0;
  transform-box: fill-box;
  animation: wc-rise 2.8s ease-in infinite;
}

.wc-active .wc-vapor {
  opacity: 0.95;
  animation-duration: 2.2s;
}

.wc-rain {
  opacity: 0;
  transform-box: fill-box;
  animation: wc-fall 1.1s linear infinite;
}

.wc-river-flow {
  opacity: 0.9;
  animation: wc-flow 1.8s linear infinite;
}

.wc-active .wc-river-flow {
  opacity: 1;
  filter: drop-shadow(0 0 4px rgba(165, 243, 252, 0.8));
}

@keyframes wc-rise {
  0% { opacity: 0; transform: translateY(0) scale(0.8); }
  15% { opacity: 0.8; }
  80% { opacity: 0.3; }
  100% { opacity: 0; transform: translateY(-170px) scale(1.15); }
}

@keyframes wc-fall {
  0% { opacity: 0; transform: translate(0, 0); }
  15% { opacity: 0.9; }
  85% { opacity: 0.9; }
  100% { opacity: 0; transform: translate(-14px, 120px); }
}

@keyframes wc-flow {
  0% { stroke-dashoffset: 0; }
  100% { stroke-dashoffset: -100; }
}

@keyframes wc-pulse {
  0%, 100% { transform: scale(1); }
  50% { transform: scale(1.08); }
}

@keyframes wc-spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
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

.action-button:disabled {
  opacity: 0.4;
  cursor: not-allowed;
}
</style>
