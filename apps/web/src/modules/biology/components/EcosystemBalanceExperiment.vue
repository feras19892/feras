<script setup lang="ts">
import { useI18n } from '@/composables/useI18n';
import BiologyHelpModal from '../../../components/experiment/biology/BiologyHelpModal.vue';
const { t } = useI18n();
import { computed, nextTick, onMounted, reactive, ref, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import * as THREE from 'three';

import { useEcosystem3D } from '../../../composables/biology/useEcosystem3D';
import type { EcosystemModelId, EcosystemPhase, ModelParam } from '../../../composables/biology/useEcosystem3D';
import { useBiologyTracking } from '../../../composables/biology/useBiologyTracking';
import type { HotspotState } from '../../../types/biology.types';
import InfoPanel from './InfoPanel.vue';
import BiologyReportButton from './BiologyReportButton.vue';
import BiologyGoals from './BiologyGoals.vue';
import { useFullscreen } from '../../../composables/shared/useFullscreen';
import { resolveExperimentId } from '../../../composables/useExperimentId';

const router = useRouter();
const route = useRoute();
const experimentId = computed(() =>
  resolveExperimentId('biology', route.path.split('/').filter(Boolean).pop() ?? ''),
);

const tracking = useBiologyTracking();

const containerRef = ref<HTMLDivElement | null>(null);
const chartRef = ref<HTMLCanvasElement | null>(null);
const {
  isRunning,
  isLoading,
  error,
  autoRotate,
  speed,
  iteration,
  phase,
  hasRun,
  activeModel,
  currentModel,
  models,
  params,
  initials,
  counts,
  chartHistory,
  chartTick,
  toggleRun,
  setInitials,
  setModel,
  reset,
  toggleAutoRotate,
  resetCamera,
  screenshot,
} = useEcosystem3D(containerRef);

/** النماذج التي جرّبها الطالب خلال الجلسة — لهدف "جرّب أكثر من نموذج". */
const visitedModels = reactive(new Set<EcosystemModelId>(['predator-prey']));

function applyInitials(): void {
  setInitials(initials.value);
  tracking.trackTool('initial-conditions');
}

function onRun(): void {
  toggleRun();
  if (isRunning.value) tracking.trackTool('simulation');
}

function onSelectModel(id: EcosystemModelId): void {
  if (id === activeModel.value) return;
  setModel(id);
  visitedModels.add(id);
  selectedPart.value = 'model';
  tracking.trackTool(`model-${id}`);
  void nextTick(drawChart);
}

/** يعرض قيمة المعامل بعدد خانات يناسب دقة شريط التمرير. */
function formatParam(p: ModelParam): string {
  const v = params[p.key] ?? p.def;
  if (p.step < 0.01) return v.toFixed(3);
  if (p.step < 1) return v.toFixed(2);
  return String(Math.round(v));
}

function onParamChange(): void {
  tracking.trackTool('model-parameters');
}

watch(speed, (v) => {
  if (v !== 1) tracking.trackTool('speed-control');
});
watch(autoRotate, (v) => {
  if (v) tracking.trackTool('auto-rotate');
});
watch(
  phase,
  (p) => {
    if (p === 'balance') tracking.trackStage('ecosystem-balance');
    else if (p === 'cycles') tracking.trackStage('ecosystem-cycles');
    else if (p === 'crash') tracking.trackStage('ecosystem-crash');
    else if (p === 'extinction') tracking.trackStage('ecosystem-extinction');
    else if (p === 'exclusion') tracking.trackStage('ecosystem-exclusion');
  },
  { immediate: true },
);

const selectedPart = ref<string>('model');

const PHASE_KEYS: Record<EcosystemPhase, string> = {
  initial: 'biology.ecosystemPhaseInitial',
  balance: 'biology.ecosystemPhaseBalance',
  cycles: 'biology.ecosystemPhaseCycles',
  crash: 'biology.ecosystemPhaseCrash',
  extinction: 'biology.ecosystemPhaseExtinction',
  exclusion: 'biology.ecosystemPhaseExclusion',
};

/** مفاتيح وصف كل نوع في لوحة المعلومات. */
const SPECIES_INFO: Record<string, { name: string; info: string; long: string; facts: [string, string, string] }> = {
  rabbit: {
    name: 'biology.ecosystemPreyName',
    info: 'biology.ecosystemPreyInfo',
    long: 'biology.ecosystemPreyLong',
    facts: ['biology.ecosystemPreyFact1', 'biology.ecosystemPreyFact2', 'biology.ecosystemPreyFact3'],
  },
  fox: {
    name: 'biology.ecosystemPredatorName',
    info: 'biology.ecosystemPredatorInfo',
    long: 'biology.ecosystemPredatorLong',
    facts: ['biology.ecosystemPredatorFact1', 'biology.ecosystemPredatorFact2', 'biology.ecosystemPredatorFact3'],
  },
  plant: {
    name: 'biology.ecosystemPlantName',
    info: 'biology.ecosystemPlantInfo',
    long: 'biology.ecosystemPlantLong',
    facts: ['biology.ecosystemPlantFact1', 'biology.ecosystemPlantFact2', 'biology.ecosystemPlantFact3'],
  },
  deer: {
    name: 'biology.ecosystemDeerName',
    info: 'biology.ecosystemDeerInfo',
    long: 'biology.ecosystemDeerLong',
    facts: ['biology.ecosystemDeerFact1', 'biology.ecosystemDeerFact2', 'biology.ecosystemDeerFact3'],
  },
};

function selectPart(id: string): void {
  selectedPart.value = id;
  const sp = SPECIES_INFO[id];
  const labelKey = sp ? sp.name : currentModel.value.nameKey;
  tracking.trackPart(id, t(labelKey));
}

const hotspot = computed<HotspotState>(() => {
  const sp = SPECIES_INFO[selectedPart.value];
  if (sp) {
    return {
      partId: selectedPart.value,
      label: t(sp.name),
      description: t(sp.info),
      longDescription: t(sp.long),
      facts: sp.facts.map((k) => t(k)),
      position: new THREE.Vector3(0, 0, 0),
    };
  }
  const m = currentModel.value;
  return {
    partId: `model-${m.id}`,
    label: t(m.nameKey),
    description: t(m.descKey),
    longDescription: t(m.descKey),
    facts: m.factKeys.map((k) => t(k)),
    position: new THREE.Vector3(0, 0, 0),
  };
});

const goals = computed(() => [
  { id: 'runSimulation', label: t('biology.goalRunSimulation'), completed: hasRun.value },
  { id: 'reachBalance', label: t('biology.ecosystemGoalReachBalance'), completed: phase.value === 'balance' },
  {
    id: 'causeExtinction',
    label: t('biology.ecosystemGoalExtinction'),
    completed: phase.value === 'extinction' || phase.value === 'crash' || phase.value === 'exclusion',
  },
  {
    id: 'tryModels',
    label: t('biology.ecosystemGoalTryModels'),
    completed: visitedModels.size >= 2,
  },
]);

const helpParts = computed(() =>
  currentModel.value.species.map((sp) => ({ id: sp.id, nameKey: sp.nameKey })),
);

const goBack = (): void => {
  void router.push('/biology/ecology');
};

/** يرسم منحنيات أعداد الأنواع عبر الزمن على لوحة Canvas ثنائية الأبعاد. */
function drawChart(): void {
  const c = chartRef.value;
  if (!c) return;
  const w = c.clientWidth;
  const h = c.clientHeight;
  if (!w || !h) return;
  const dpr = Math.min(window.devicePixelRatio || 1, 2);
  const pw = Math.round(w * dpr);
  const ph = Math.round(h * dpr);
  if (c.width !== pw || c.height !== ph) {
    c.width = pw;
    c.height = ph;
  }
  const ctx = c.getContext('2d');
  if (!ctx) return;
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  ctx.clearRect(0, 0, w, h);
  ctx.fillStyle = 'rgba(15, 23, 42, 0.6)';
  ctx.fillRect(0, 0, w, h);

  const data = chartHistory;
  if (data.length < 2) {
    ctx.fillStyle = '#64748b';
    ctx.font = '11px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(t('biology.ecosystemChartHint'), w / 2, h / 2);
    return;
  }

  let max = 1;
  for (const row of data) for (const v of row) if (v > max) max = v;

  const padL = 8;
  const padR = 8;
  const padT = 14;
  const padB = 8;
  const iw = w - padL - padR;
  const ih = h - padT - padB;

  ctx.strokeStyle = 'rgba(51, 65, 85, 0.55)';
  ctx.lineWidth = 1;
  for (const f of [0.25, 0.5, 0.75]) {
    const y = padT + ih * (1 - f);
    ctx.beginPath();
    ctx.moveTo(padL, y);
    ctx.lineTo(padL + iw, y);
    ctx.stroke();
  }

  ctx.fillStyle = '#94a3b8';
  ctx.font = '10px sans-serif';
  ctx.textAlign = 'left';
  ctx.fillText(String(Math.round(max)), padL + 2, padT - 3);

  const species = currentModel.value.species;
  const n = data.length;
  for (let si = 0; si < species.length; si += 1) {
    ctx.strokeStyle = species[si].css;
    ctx.lineWidth = 1.7;
    ctx.beginPath();
    for (let i = 0; i < n; i += 1) {
      const x = padL + iw * (i / (n - 1));
      const y = padT + ih * (1 - Math.min((data[i][si] ?? 0) / max, 1));
      if (i === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    }
    ctx.stroke();
  }
}

watch(chartTick, drawChart);
watch(activeModel, () => void nextTick(drawChart));
onMounted(() => void nextTick(drawChart));

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
        <h1 class="experiment-title">{{ t('biology.ecosystemTitle') }}</h1>
        <p class="experiment-subtitle">{{ t('biology.ecosystemSubtitle') }}</p>
      </div>
      <BiologyReportButton
        :experiment-id="experimentId"
        :experiment-name="t('biology.ecosystemTitle')"
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
          <path d="M8 3v3a2 2 0 0 1-2 2H3m18 0h-3a2 2 0 0 1 2-2V3m0 18v-3a2 2 0 0 1 2 2v3" />
        </svg>
      </button>
    </header>

    <main class="experiment-body">
      <aside class="side-panel info-side">
        <div class="info-card">
          <InfoPanel :hotspot="hotspot" />
        </div>
        <div class="eco-controls card-block">
          <h3 class="control-title">{{ t('biology.ecosystemControlsTitle') }}</h3>

          <label class="sim-label">{{ t('biology.ecosystemModelLabel') }}</label>
          <div class="model-tabs">
            <button
              v-for="m in models"
              :key="m.id"
              class="model-tab"
              :class="{ active: activeModel === m.id }"
              @click="onSelectModel(m.id)"
            >
              {{ t(m.nameKey) }}
            </button>
          </div>

          <label class="sim-label section-label">{{ t('biology.ecosystemInitialsTitle') }}</label>
          <template v-for="(sp, i) in currentModel.species" :key="sp.id">
            <label class="sim-label">
              {{ t(sp.nameKey) }}: <strong>{{ initials[i] }}</strong>
            </label>
            <input
              v-model.number="initials[i]"
              type="range"
              :min="sp.initMin"
              :max="sp.initMax"
              :step="sp.initStep"
              class="sim-slider"
              @change="applyInitials"
            />
          </template>

          <div class="sim-buttons">
            <button class="eco-run-btn primary" @click="onRun">
              <svg v-if="!isRunning" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <polygon points="5 3 19 12 5 21 5 3" />
              </svg>
              <svg v-else width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <rect x="6" y="4" width="4" height="16" /><rect x="14" y="4" width="4" height="16" />
              </svg>
              {{ isRunning ? t('biology.ecosystemPause') : t('biology.ecosystemRun') }}
            </button>
            <button class="eco-run-btn" @click="reset">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M23 4v6h-6M1 20v-6h6" />
                <path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15" />
              </svg>
              {{ t('biology.ecosystemResetLabel') }}
            </button>
          </div>

          <label class="sim-label">
            {{ t('biology.ecosystemSpeedLabel') }}: <strong>{{ speed }}×</strong>
          </label>
          <input v-model.number="speed" type="range" min="0.5" max="2" step="0.25" class="sim-slider" />

          <div class="phase-chip" :data-phase="phase">
            <span class="phase-label">{{ t('biology.ecosystemPhaseLabel') }}</span>
            <span class="phase-value">{{ t(PHASE_KEYS[phase]) }}</span>
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
        <div class="eco-stats-overlay">
          <div v-for="(sp, i) in currentModel.species" :key="sp.id" class="eco-stat-chip">
            <span class="chip-dot" :style="{ background: sp.css }" />
            <span class="chip-label">{{ t(sp.nameKey) }}</span>
            <span class="chip-value">{{ counts[i] ?? 0 }}</span>
          </div>
          <div class="eco-stat-chip">
            <span class="chip-label">{{ t('biology.ecosystemStepLabel') }}</span>
            <span class="chip-value">{{ iteration }}</span>
          </div>
        </div>

        <!-- منحنى الأعداد عبر الزمن — شريط أسفل المجسم -->
        <div class="eco-chart-overlay">
          <div class="eco-chart-head">
            <span class="eco-chart-title">{{ t('biology.ecosystemChartTitle') }}</span>
            <span class="eco-chart-dots">
              <span v-for="sp in currentModel.species" :key="sp.id" class="eco-chart-dot" :style="{ background: sp.css }" />
            </span>
          </div>
          <canvas ref="chartRef" class="eco-chart-canvas" />
        </div>

        <!-- أدوات تحكم الكاميرا -->
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
          <button class="tool-btn" :title="t('biology.resetCameraLabel')" @click.stop="resetCamera">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M23 4v6h-6M1 20v-6h6" />
              <path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15" />
            </svg>
          </button>
        </div>
      </section>

      <aside class="side-panel parts-side">
        <div class="parts-card">
          <h2 class="panel-title">{{ t('biology.ecosystemSpeciesTitle') }}</h2>
          <ul class="parts-list">
            <li
              class="part-item"
              :class="{ active: selectedPart === 'model' }"
              @click="selectPart('model')"
            >
              <span class="part-dot" style="background: #38bdf8" />
              <span class="part-icon">⚖️</span>
              <span class="part-name">{{ t(currentModel.nameKey) }}</span>
            </li>
            <li
              v-for="(sp, i) in currentModel.species"
              :key="sp.id"
              class="part-item"
              :class="{ active: selectedPart === sp.id }"
              @click="selectPart(sp.id)"
            >
              <span class="part-dot" :style="{ background: sp.css }" />
              <span class="part-icon">{{ sp.icon }}</span>
              <span class="part-name">{{ t(sp.nameKey) }}</span>
              <span class="part-temp">{{ counts[i] ?? 0 }}</span>
            </li>
          </ul>
          <div class="eco-params">
            <h3 class="legend-title">{{ t('biology.ecosystemParamsTitle') }}</h3>
            <template v-for="p in currentModel.params" :key="p.key">
              <label class="sim-label">
                {{ t(p.labelKey) }}: <strong>{{ formatParam(p) }}</strong>
              </label>
              <input
                v-model.number="params[p.key]"
                type="range"
                :min="p.min"
                :max="p.max"
                :step="p.step"
                class="sim-slider"
                @change="onParamChange"
              />
            </template>
          </div>
          <div class="eco-legend">
            <h3 class="legend-title">{{ t('biology.ecosystemLegendTitle') }}</h3>
            <div v-for="sp in currentModel.species" :key="sp.id" class="legend-row">
              <span class="legend-dot" :style="{ background: sp.css }"></span> {{ t(sp.nameKey) }}
            </div>
            <div class="legend-row"><span class="legend-dot" style="background:#334155"></span> {{ t('biology.ecosystemHabitatLabel') }}</div>
          </div>
        </div>
      </aside>
    </main>
  <BiologyHelpModal
    :open="helpOpen"
    :context="{ topic: experimentId ?? '', titleKey: 'biology.ecosystemTitle', subtitleKey: 'biology.ecosystemSubtitle', parts: helpParts }"
    @close="helpOpen = false"
  />
  </div>
</template>
<style scoped src="./glb-experiment.css"></style>
<style scoped>
.card-block {
  background: rgba(15, 23, 42, 0.8);
  border: 1px solid #334155;
  border-radius: 0.75rem;
  padding: 1rem;
}

.control-title {
  margin: 0 0 0.75rem;
  font-size: 0.95rem;
  color: #e2e8f0;
  font-weight: 700;
}

.sim-label {
  display: block;
  font-size: 0.8rem;
  color: #94a3b8;
  font-weight: 600;
  margin-top: 0.35rem;
}
.sim-label strong { color: #e2e8f0; }

.section-label {
  margin-top: 0.85rem;
  padding-top: 0.6rem;
  border-top: 1px solid rgba(51, 65, 85, 0.5);
  text-transform: uppercase;
  letter-spacing: 0.03em;
  font-size: 0.72rem;
}

.model-tabs {
  display: flex;
  flex-wrap: wrap;
  gap: 0.35rem;
  margin: 0.4rem 0 0.2rem;
}
.model-tab {
  background: rgba(30, 41, 59, 0.8);
  border: 1px solid #334155;
  color: #cbd5e1;
  padding: 0.32rem 0.6rem;
  border-radius: 999px;
  cursor: pointer;
  font-size: 0.72rem;
  font-weight: 600;
  transition: all 0.15s ease;
}
.model-tab:hover { background: rgba(51, 65, 85, 0.9); }
.model-tab.active {
  background: rgba(56, 189, 248, 0.16);
  border-color: rgba(56, 189, 248, 0.55);
  color: #38bdf8;
}

.sim-slider {
  width: 100%;
  accent-color: #4ade80;
  cursor: pointer;
}

.sim-buttons {
  display: flex;
  gap: 0.5rem;
  margin: 0.75rem 0 0.5rem;
}

.eco-run-btn {
  display: flex;
  align-items: center;
  gap: 0.4rem;
  flex: 1;
  justify-content: center;
  background: rgba(30, 41, 59, 0.8);
  border: 1px solid #334155;
  color: #e2e8f0;
  padding: 0.55rem 0.6rem;
  border-radius: 0.5rem;
  cursor: pointer;
  font-size: 0.8rem;
  font-weight: 600;
  transition: all 0.15s ease;
}
.eco-run-btn:hover:not(:disabled) { background: rgba(51, 65, 85, 0.9); }
.eco-run-btn.primary {
  background: rgba(74, 222, 128, 0.14);
  border-color: rgba(74, 222, 128, 0.45);
  color: #4ade80;
}
.eco-run-btn.primary:hover { background: rgba(74, 222, 128, 0.24); }

.phase-chip {
  margin-top: 0.75rem;
  display: flex;
  align-items: center;
  justify-content: space-between;
  border-radius: 0.5rem;
  padding: 0.5rem 0.7rem;
  background: rgba(15, 23, 42, 0.7);
  border: 1px solid #334155;
}
.phase-label { font-size: 0.72rem; color: #94a3b8; text-transform: uppercase; }
.phase-value { font-size: 0.85rem; font-weight: 700; color: #4ade80; }
.phase-chip[data-phase='crash'] .phase-value,
.phase-chip[data-phase='extinction'] .phase-value { color: #ef4444; }
.phase-chip[data-phase='cycles'] .phase-value { color: #facc15; }
.phase-chip[data-phase='exclusion'] .phase-value { color: #a78bfa; }

.eco-chart-overlay {
  position: absolute;
  bottom: 0.75rem;
  inset-inline: 1rem;
  background: rgba(15, 23, 42, 0.85);
  border: 1px solid #334155;
  border-radius: 0.6rem;
  padding: 0.35rem 0.6rem 0.45rem;
  backdrop-filter: blur(8px);
  z-index: 6;
}
.eco-chart-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 0.15rem;
}
.eco-chart-title { font-size: 0.68rem; color: #94a3b8; font-weight: 700; text-transform: uppercase; letter-spacing: 0.03em; }
.eco-chart-dots { display: flex; gap: 0.35rem; }
.eco-chart-dot { width: 8px; height: 8px; border-radius: 50%; box-shadow: 0 0 5px currentColor; }
.eco-chart-canvas {
  width: 100%;
  height: 84px;
  display: block;
  border-radius: 0.4rem;
}

.eco-params {
  margin-top: 0.85rem;
  padding-top: 0.75rem;
  border-top: 1px solid rgba(51, 65, 85, 0.5);
}

/* إبعاد شريط أدوات الكاميرا عن منحنى الأعداد */
.canvas-section .floating-toolbar {
  bottom: auto;
  top: 1rem;
  left: auto;
  inset-inline-start: 1rem;
  transform: none;
}

.eco-stats-overlay {
  position: absolute;
  top: 1rem;
  inset-inline-end: 1rem;
  display: flex;
  gap: 0.6rem;
  z-index: 5;
}
.eco-stat-chip {
  display: flex;
  flex-direction: column;
  align-items: center;
  background: rgba(15, 23, 42, 0.85);
  border: 1px solid #334155;
  border-radius: 0.5rem;
  padding: 0.5rem 0.75rem;
  backdrop-filter: blur(8px);
  min-width: 74px;
}
.chip-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  margin-bottom: 0.2rem;
  box-shadow: 0 0 6px currentColor;
}
.chip-label { font-size: 0.62rem; color: #94a3b8; text-transform: uppercase; }
.chip-value { font-size: 1.25rem; font-weight: 700; color: #e2e8f0; }

.eco-legend {
  margin-top: 1rem;
  padding-top: 0.75rem;
  border-top: 1px solid rgba(51, 65, 85, 0.5);
}
.legend-title { font-size: 0.75rem; color: #94a3b8; margin: 0 0 0.5rem; text-transform: uppercase; letter-spacing: 0.03em; }
.legend-row { display: flex; align-items: center; gap: 0.4rem; font-size: 0.78rem; color: #cbd5e1; margin-bottom: 0.25rem; }
.legend-dot { width: 10px; height: 10px; border-radius: 50%; flex-shrink: 0; }

.part-icon { font-size: 1.05rem; }
.part-temp { font-size: 0.78rem; color: #facc15; font-weight: 700; }
</style>
