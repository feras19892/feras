<script setup lang="ts">
import { useI18n } from '@/composables/useI18n';
import BiologyHelpModal from '../../../components/experiment/biology/BiologyHelpModal.vue';
import { computed, ref, watch } from 'vue';
import { useRouter } from 'vue-router';
import * as THREE from 'three';

import { useCrispr3D } from '../../../composables/biology/useCrispr3D';
import type { CrisprStageName } from '../../../composables/biology/useCrispr3D';
import { useBiologyTracking } from '../../../composables/biology/useBiologyTracking';
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
  currentStageIndex,
  isRunning,
  error,
  isLoading,
  autoRotate,
  setStage,
  nextStage,
  previousStage,
  runFullSequence,
  resetSimulation,
  toggleAutoRotate,
  resetCamera,
  screenshot,
} = useCrispr3D(containerRef);

const STAGES: CrisprStageName[] = ['guide', 'scan', 'cut', 'repair'];

const STAGE_INFO: Record<CrisprStageName, { titleKey: string; descriptionKey: string; longDescriptionKey: string; factsKeys: string[]; icon: string }> = {
  guide: {
    titleKey: 'biology.crisprStage.guide.title',
    descriptionKey: 'biology.crisprStage.guide.description',
    longDescriptionKey: 'biology.crisprStage.guide.longDescription',
    factsKeys: ['biology.crisprStage.guide.fact1', 'biology.crisprStage.guide.fact2', 'biology.crisprStage.guide.fact3'],
    icon: '🧭',
  },
  scan: {
    titleKey: 'biology.crisprStage.scan.title',
    descriptionKey: 'biology.crisprStage.scan.description',
    longDescriptionKey: 'biology.crisprStage.scan.longDescription',
    factsKeys: ['biology.crisprStage.scan.fact1', 'biology.crisprStage.scan.fact2', 'biology.crisprStage.scan.fact3'],
    icon: '🔍',
  },
  cut: {
    titleKey: 'biology.crisprStage.cut.title',
    descriptionKey: 'biology.crisprStage.cut.description',
    longDescriptionKey: 'biology.crisprStage.cut.longDescription',
    factsKeys: ['biology.crisprStage.cut.fact1', 'biology.crisprStage.cut.fact2', 'biology.crisprStage.cut.fact3'],
    icon: '✂️',
  },
  repair: {
    titleKey: 'biology.crisprStage.repair.title',
    descriptionKey: 'biology.crisprStage.repair.description',
    longDescriptionKey: 'biology.crisprStage.repair.longDescription',
    factsKeys: ['biology.crisprStage.repair.fact1', 'biology.crisprStage.repair.fact2', 'biology.crisprStage.repair.fact3'],
    icon: '🧬',
  },
};

const currentStage = computed<CrisprStageName>(() => STAGES[currentStageIndex.value]);

const tracking = useBiologyTracking();
watch(currentStageIndex, (idx) => {
  const s = STAGES[idx];
  if (!s) return;
  tracking.trackStage(s);
  tracking.trackPart(s, t(STAGE_INFO[s].titleKey));
}, { immediate: true });

watch(isRunning, (v) => { if (v) tracking.trackTool('simulation'); });
watch(autoRotate, (v) => { if (v) tracking.trackTool('auto-rotate'); });

const info = computed(() => STAGE_INFO[currentStage.value]);

const hotspot = computed<HotspotState>(() => ({
  partId: currentStage.value,
  label: t(info.value.titleKey),
  description: t(info.value.descriptionKey),
  longDescription: t(info.value.longDescriptionKey),
  facts: info.value.factsKeys.map((key) => t(key)),
  position: new THREE.Vector3(0, 0, 0),
}));

const visitedStages = computed(() => new Set(tracking.stagesVisited.value));
const goals = computed(() => [
  {
    id: 'visitAllStages',
    label: t('biology.goalVisitAllStages'),
    completed: visitedStages.value.size >= STAGES.length,
  },
  {
    id: 'runFullSequence',
    label: t('biology.crisprGoalFullSequence'),
    completed: visitedStages.value.size >= STAGES.length && tracking.toolsUsed.value.includes('simulation'),
  },
]);

const isFirst = computed(() => currentStageIndex.value === 0);
const isLast = computed(() => currentStageIndex.value === STAGES.length - 1);

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
        <h1 class="experiment-title">{{ t('biology.crisprTitle') }}</h1>
        <p class="experiment-subtitle">{{ t('biology.crisprSubtitle') }}</p>
      </div>
      <BiologyReportButton
        :experiment-id="experimentId"
        :experiment-name="t('biology.crisprTitle')"
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
        <BiologyGoals v-if="goals.length" :title="t('biology.goalsTitle')" :goals="goals" />
      </aside>

      <section class="canvas-section">
        <div ref="containerRef" class="cell-canvas" />

        <div v-if="isLoading" class="loading-overlay" role="status">
          <div class="spinner" />
          <span>{{ t('biology.loadingModel') }}</span>
        </div>
        <div v-if="error" class="webgl-error" role="alert">{{ error }}</div>

        <!-- مؤشر المرحلة -->
        <div class="crispr-stage-indicator">
          <span class="stage-icon">{{ info.icon }}</span>
          <span class="stage-name">{{ t(info.titleKey) }}</span>
        </div>

        <!-- أدوات -->
        <div class="floating-toolbar">
          <button class="tool-btn" :class="{ active: autoRotate }" :title="t('biology.autoRotate')" @click.stop="toggleAutoRotate">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M21 12a9 9 0 1 1-9-9c2.52 0 4.93 1 6.74 2.74L21 8" />
              <path d="M21 3v5h-5" />
            </svg>
          </button>
          <button class="tool-btn" :title="t('biology.resetCameraLabel')" @click.stop="resetCamera">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M23 4v6h-6M1 20v-6h6" />
              <path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15" />
            </svg>
          </button>
          <div class="tool-divider" />
          <button class="tool-btn" :title="t('biology.previousStage')" :disabled="isFirst || isRunning" @click.stop="previousStage">◀</button>
          <button class="tool-btn" :title="t('biology.nextStage')" :disabled="isLast || isRunning" @click.stop="nextStage">▶</button>
        </div>

        <!-- أزرار التشغيل -->
        <div class="crispr-run-controls">
          <button class="crispr-run-btn primary" :disabled="isRunning" @click="runFullSequence">
            <svg v-if="!isRunning" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <polygon points="5 3 19 12 5 21 5 3" />
            </svg>
            <span v-else class="mini-spinner" />
            {{ isRunning ? t('biology.crisprRunning') : t('biology.crisprRunFull') }}
          </button>
          <button class="crispr-run-btn" :disabled="isRunning" @click="resetSimulation">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M23 4v6h-6M1 20v-6h6" />
              <path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15" />
            </svg>
            {{ t('biology.crisprReset') }}
          </button>
        </div>
      </section>

      <aside class="side-panel parts-side">
        <div class="parts-card">
          <h2 class="panel-title">{{ t('biology.crisprStageLabel') }}</h2>
          <ul class="parts-list">
            <li
              v-for="(s, i) in STAGES"
              :key="s"
              class="part-item"
              :class="{ active: i === currentStageIndex }"
              @click="!isRunning && setStage(i)"
            >
              <span class="part-dot" />
              <span class="part-icon">{{ STAGE_INFO[s].icon }}</span>
              <span class="part-name">{{ t(STAGE_INFO[s].titleKey) }}</span>
            </li>
          </ul>

          <div class="crispr-legend">
            <h3 class="legend-title">{{ t('biology.crisprLegendTitle') }}</h3>
            <div class="legend-row"><span class="legend-dot" style="background:#8b5cf6"></span> Cas9</div>
            <div class="legend-row"><span class="legend-dot" style="background:#06b6d4"></span> gRNA</div>
            <div class="legend-row"><span class="legend-dot" style="background:#ef4444"></span> {{ t('biology.crisprCutSite') }}</div>
            <div class="legend-row"><span class="legend-dot" style="background:#22c55e"></span> {{ t('biology.crisprRepair') }}</div>
          </div>
        </div>
      </aside>
    </main>
  <BiologyHelpModal
    :open="helpOpen"
    :context="{ topic: experimentId ?? '', titleKey: 'biology.crisprTitle', subtitleKey: 'biology.crisprSubtitle', parts: STAGES.map((s) => ({ id: s, nameKey: STAGE_INFO[s].titleKey })) }"
    @close="helpOpen = false"
  />
  </div>
</template>

<style scoped src="./glb-experiment.css"></style>
<style scoped>
.crispr-stage-indicator {
  position: absolute;
  top: 1rem;
  inset-inline-start: 1rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  background: rgba(15, 23, 42, 0.85);
  border: 1px solid #334155;
  border-radius: 0.5rem;
  padding: 0.5rem 0.85rem;
  backdrop-filter: blur(8px);
  z-index: 5;
}
.stage-icon { font-size: 1.3rem; }
.stage-name { font-size: 0.9rem; font-weight: 600; color: #a78bfa; }

.crispr-run-controls {
  position: absolute;
  bottom: 1rem;
  inset-inline-start: 50%;
  transform: translateX(-50%);
  display: flex;
  gap: 0.6rem;
  z-index: 5;
}
.crispr-run-btn {
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
.crispr-run-btn:hover:not(:disabled) { background: rgba(30, 41, 59, 0.95); border-color: #475569; }
.crispr-run-btn.primary { background: rgba(167, 139, 250, 0.15); border-color: rgba(167, 139, 250, 0.5); color: #a78bfa; }
.crispr-run-btn.primary:hover:not(:disabled) { background: rgba(167, 139, 250, 0.25); }
.crispr-run-btn:disabled { opacity: 0.4; cursor: not-allowed; }

.mini-spinner {
  width: 16px; height: 16px;
  border: 2px solid rgba(167, 139, 250, 0.3);
  border-top-color: #a78bfa;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}
@keyframes spin { to { transform: rotate(360deg); } }

.crispr-legend {
  margin-top: 1rem;
  padding-top: 0.75rem;
  border-top: 1px solid rgba(51, 65, 85, 0.5);
}
.legend-title { font-size: 0.75rem; color: #94a3b8; margin: 0 0 0.5rem; text-transform: uppercase; letter-spacing: 0.03em; }
.legend-row { display: flex; align-items: center; gap: 0.4rem; font-size: 0.78rem; color: #cbd5e1; margin-bottom: 0.25rem; }
.legend-dot { width: 10px; height: 10px; border-radius: 50%; flex-shrink: 0; }
.part-name { flex: 1; }
</style>
