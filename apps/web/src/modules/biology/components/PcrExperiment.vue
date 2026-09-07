<script setup lang="ts">
import { useI18n } from '@/composables/useI18n';
import BiologyHelpModal from '../../../components/experiment/biology/BiologyHelpModal.vue';
import { computed, ref, watch } from 'vue';
import { useRouter } from 'vue-router';
import * as THREE from 'three';

import { usePcr3D } from '../../../composables/biology/usePcr3D';
import { useBiologyTracking } from '../../../composables/biology/useBiologyTracking';
import { pcrStages, pcrExperiment } from '../../../services/pcr-data';
import type { HotspotState } from '../../../types/biology.types';
import InfoPanel from './InfoPanel.vue';
import BiologyReportButton from './BiologyReportButton.vue';
import BiologyGoals from './BiologyGoals.vue';
import { useFullscreen } from '../../../composables/shared/useFullscreen';
import { useRoute } from 'vue-router';
import { resolveExperimentId } from '../../../composables/useExperimentId';

const { t } = useI18n();
const router = useRouter();
const route = useRoute();
const experimentId = computed(() => resolveExperimentId('biology', route.path.split('/').filter(Boolean).pop() ?? ''));

const containerRef = ref<HTMLDivElement | null>(null);
const {
  currentPhaseIndex,
  cycleCount,
  isRunning,
  error,
  isLoading,
  autoRotate,
  temperature,
  setPhase,
  nextPhase,
  previousPhase,
  runCycle,
  resetSimulation,
  toggleAutoRotate,
  resetCamera,
  screenshot,
} = usePcr3D(containerRef);

const tracking = useBiologyTracking();
watch(currentPhaseIndex, (idx) => {
  const s = pcrStages[idx];
  if (!s) return;
  tracking.trackStage(s.id);
  tracking.trackPart(s.id, t(s.titleKey));
}, { immediate: true });

watch(isRunning, (v) => { if (v) tracking.trackTool('simulation'); });
watch(autoRotate, (v) => { if (v) tracking.trackTool('auto-rotate'); });

const stage = computed(() => pcrStages[currentPhaseIndex.value]);

const hotspot = computed<HotspotState>(() => ({
  partId: stage.value.id,
  label: t(stage.value.titleKey),
  description: t(stage.value.descriptionKey),
  longDescription: t(stage.value.longDescriptionKey),
  facts: stage.value.factsKeys.map((key) => t(key)),
  position: new THREE.Vector3(0, 0, 0),
}));

const stageItems = computed(() =>
  pcrStages.map((s) => ({ id: s.id, label: `${s.icon} ${t(s.titleKey)}`, description: t(s.descriptionKey) })),
);

const visitedStageIds = computed(() => new Set(tracking.stagesVisited.value));
const goals = computed(() => [
  {
    id: 'visitAllStages',
    label: t('biology.goalVisitAllStages'),
    completed: visitedStageIds.value.size >= pcrStages.length,
  },
  {
    id: 'runCycles',
    label: t('biology.pcrGoalCycles'),
    completed: cycleCount.value >= 3,
  },
]);

const dnaCopies = computed(() => Math.pow(2, cycleCount.value));
const isFirstStage = computed(() => currentPhaseIndex.value === 0);
const isLastStage = computed(() => currentPhaseIndex.value === pcrStages.length - 1);

const goBack = (): void => { void router.push('/biology/biotechnology'); };
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
        {{ t('biology.backToBiotechnologySection') }}
      </button>
      <div class="header-content">
        <h1 class="experiment-title">{{ t(pcrExperiment.titleKey) }}</h1>
        <p class="experiment-subtitle">{{ t(pcrExperiment.subtitleKey) }}</p>
      </div>
      <BiologyReportButton
        :experiment-id="experimentId"
        :experiment-name="t(pcrExperiment.titleKey)"
        :tracking="tracking"
        :get-screenshot="screenshot"
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
        <div class="pcr-temp-card">
          <div class="temp-label">{{ t('biology.pcrTemperature') }}</div>
          <div class="temp-bar-wrap">
            <div class="temp-bar-fill" :style="{ height: ((temperature - 20) / 80) * 100 + '%' }" />
          </div>
          <div class="temp-value" :class="{ hot: temperature > 80, warm: temperature > 50 && temperature <= 80, cool: temperature <= 50 }">
            {{ temperature }}°C
          </div>
        </div>
        <BiologyGoals v-if="goals.length" :title="t('biology.goalsTitle')" :goals="goals" />
      </aside>

      <section class="canvas-section">
        <div ref="containerRef" class="cell-canvas" />

        <div v-if="isLoading" class="loading-overlay" role="status">
          <div class="spinner" />
          <span>{{ t('biology.loadingModel') }}</span>
        </div>
        <div v-if="error" class="webgl-error" role="alert">{{ error }}</div>

        <!-- إحصائيات عائمة -->
        <div class="pcr-stats-overlay">
          <div class="pcr-stat-chip">
            <span class="chip-label">{{ t('biology.pcrCycle') }}</span>
            <span class="chip-value">{{ cycleCount }}</span>
          </div>
          <div class="pcr-stat-chip">
            <span class="chip-label">{{ t('biology.pcrCopies') }}</span>
            <span class="chip-value">{{ dnaCopies }}</span>
          </div>
        </div>

        <!-- أدوات تحكم -->
        <div class="floating-toolbar">
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
          <div class="tool-divider" />
          <button class="tool-btn" :title="t('biology.previousStage')" :disabled="isFirstStage || isRunning" @click.stop="previousPhase">◀</button>
          <button class="tool-btn" :title="t('biology.nextStage')" :disabled="isLastStage || isRunning" @click.stop="nextPhase">▶</button>
        </div>

        <!-- أزرار التشغيل -->
        <div class="pcr-run-controls">
          <button class="pcr-run-btn primary" :disabled="isRunning" @click="runCycle">
            <svg v-if="!isRunning" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <polygon points="5 3 19 12 5 21 5 3" />
            </svg>
            <span v-else class="mini-spinner" />
            {{ isRunning ? t('biology.pcrRunning') : t('biology.pcrRunCycle') }}
          </button>
          <button class="pcr-run-btn" :disabled="isRunning" @click="resetSimulation">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M23 4v6h-6M1 20v-6h6" />
              <path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15" />
            </svg>
            {{ t('biology.pcrReset') }}
          </button>
        </div>
      </section>

      <aside class="side-panel parts-side">
        <div class="parts-card">
          <h2 class="panel-title">{{ t(pcrExperiment.stageLabelKey) }}</h2>
          <ul class="parts-list">
            <li
              v-for="(s, i) in pcrStages"
              :key="s.id"
              class="part-item"
              :class="{ active: i === currentPhaseIndex }"
              @click="!isRunning && setPhase(i)"
            >
              <span class="part-dot" />
              <span class="part-icon">{{ s.icon }}</span>
              <span class="part-name">{{ t(s.titleKey) }}</span>
              <span class="part-temp">{{ s.temperature }}°C</span>
            </li>
          </ul>

          <div class="pcr-legend">
            <h3 class="legend-title">{{ t('biology.pcrLegendTitle') }}</h3>
            <div class="legend-row"><span class="legend-dot" style="background:#4ade80"></span> A — Adenine</div>
            <div class="legend-row"><span class="legend-dot" style="background:#ef4444"></span> T — Thymine</div>
            <div class="legend-row"><span class="legend-dot" style="background:#3b82f6"></span> G — Guanine</div>
            <div class="legend-row"><span class="legend-dot" style="background:#facc15"></span> C — Cytosine</div>
            <div class="legend-row"><span class="legend-dot" style="background:#f59e0b"></span> Primer</div>
          </div>
        </div>
      </aside>
    </main>
  <BiologyHelpModal
    :open="helpOpen"
    :context="{ topic: experimentId ?? '', titleKey: pcrExperiment.titleKey, subtitleKey: pcrExperiment.subtitleKey, parts: pcrStages.map((s) => ({ id: s.id, nameKey: s.titleKey })) }"
    @close="helpOpen = false"
  />
  </div>
</template>

<style scoped src="./glb-experiment.css"></style>
<style scoped>
.pcr-temp-card {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.5rem;
  background: rgba(30, 41, 59, 0.6);
  border: 1px solid #334155;
  border-radius: 0.6rem;
  padding: 0.75rem;
  margin-top: 0.75rem;
}
.temp-label { font-size: 0.72rem; color: #94a3b8; text-transform: uppercase; letter-spacing: 0.04em; }
.temp-bar-wrap {
  width: 18px;
  height: 120px;
  background: rgba(15, 23, 42, 0.8);
  border: 1px solid #334155;
  border-radius: 9px;
  overflow: hidden;
  display: flex;
  align-items: flex-end;
}
.temp-bar-fill {
  width: 100%;
  background: linear-gradient(0deg, #22c55e, #facc15, #ef4444);
  transition: height 0.6s ease;
  border-radius: 9px;
}
.temp-value { font-size: 1.1rem; font-weight: 700; }
.temp-value.hot { color: #ef4444; text-shadow: 0 0 8px rgba(239,68,68,0.4); }
.temp-value.warm { color: #facc15; }
.temp-value.cool { color: #22c55e; }

.pcr-stats-overlay {
  position: absolute;
  top: 1rem;
  inset-inline-end: 1rem;
  display: flex;
  gap: 0.6rem;
  z-index: 5;
}
.pcr-stat-chip {
  display: flex;
  flex-direction: column;
  align-items: center;
  background: rgba(15, 23, 42, 0.85);
  border: 1px solid #334155;
  border-radius: 0.5rem;
  padding: 0.5rem 0.75rem;
  backdrop-filter: blur(8px);
}
.chip-label { font-size: 0.65rem; color: #94a3b8; text-transform: uppercase; }
.chip-value { font-size: 1.3rem; font-weight: 700; color: #4ade80; }

.pcr-run-controls {
  position: absolute;
  bottom: 1rem;
  inset-inline-start: 50%;
  transform: translateX(-50%);
  display: flex;
  gap: 0.6rem;
  z-index: 5;
}
.pcr-run-btn {
  display: flex;
  align-items: center;
  gap: 0.4rem;
  background: rgba(15, 23, 42, 0.9);
  border: 1px solid #334155;
  color: #e2e8f0;
  padding: 0.6rem 1.1rem;
  border-radius: 0.5rem;
  cursor: pointer;
  font-size: 0.85rem;
  font-weight: 600;
  transition: all 0.15s ease;
  backdrop-filter: blur(8px);
}
.pcr-run-btn:hover:not(:disabled) { background: rgba(30, 41, 59, 0.95); border-color: #475569; }
.pcr-run-btn.primary { background: rgba(74, 222, 128, 0.15); border-color: rgba(74, 222, 128, 0.5); color: #4ade80; }
.pcr-run-btn.primary:hover:not(:disabled) { background: rgba(74, 222, 128, 0.25); }
.pcr-run-btn:disabled { opacity: 0.4; cursor: not-allowed; }

.mini-spinner {
  width: 16px; height: 16px;
  border: 2px solid rgba(74, 222, 128, 0.3);
  border-top-color: #4ade80;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}
@keyframes spin { to { transform: rotate(360deg); } }

.pcr-legend {
  margin-top: 1rem;
  padding-top: 0.75rem;
  border-top: 1px solid rgba(51, 65, 85, 0.5);
}
.legend-title { font-size: 0.75rem; color: #94a3b8; margin: 0 0 0.5rem; text-transform: uppercase; letter-spacing: 0.03em; }
.legend-row { display: flex; align-items: center; gap: 0.4rem; font-size: 0.78rem; color: #cbd5e1; margin-bottom: 0.25rem; }
.legend-dot { width: 10px; height: 10px; border-radius: 50%; flex-shrink: 0; }

.part-name { flex: 1; }
.part-temp { font-size: 0.72rem; color: #facc15; font-weight: 600; }
</style>
