<script setup lang="ts">
import { useI18n } from '@/composables/useI18n';
import BiologyHelpModal from '../../../components/experiment/biology/BiologyHelpModal.vue';
import { computed, ref, watch, onUnmounted } from 'vue';
import { useRouter } from 'vue-router';

import { useBiologyTracking } from '../../../composables/biology/useBiologyTracking';
import { useBiologyScreenshot } from '../../../composables/biology/useBiologyScreenshot';
import BiologyReportButton from './BiologyReportButton.vue';
import BiologyGoals from './BiologyGoals.vue';
import { useFullscreen } from '../../../composables/shared/useFullscreen';
import { useRoute } from 'vue-router';
import { resolveExperimentId } from '../../../composables/useExperimentId';

const { t } = useI18n();
const router = useRouter();
const route = useRoute();
const experimentId = computed(() => resolveExperimentId('biology', route.path.split('/').filter(Boolean).pop() ?? ''));

interface DnaSample {
  id: string;
  nameKey: string;
  fragments: number[];
  color: string;
}

const samples: DnaSample[] = [
  { id: 'ladder', nameKey: 'biology.gelSample.ladder', fragments: [100, 200, 500, 1000, 2000, 5000], color: '#94a3b8' },
  { id: 'sample-a', nameKey: 'biology.gelSample.sampleA', fragments: [300, 800, 1500], color: '#4ade80' },
  { id: 'sample-b', nameKey: 'biology.gelSample.sampleB', fragments: [150, 450, 1200, 3000], color: '#22d3ee' },
  { id: 'sample-c', nameKey: 'biology.gelSample.sampleC', fragments: [600, 2500], color: '#facc15' },
];

const isRunning = ref(false);
const hasRun = ref(false);
const voltage = ref(80);
const runTime = ref(0);
const selectedBand = ref<{ sample: string; bp: number; lane: number } | null>(null);

const tracking = useBiologyTracking();
const { containerRef, getScreenshot } = useBiologyScreenshot();

let timerId: ReturnType<typeof setInterval> | null = null;

watch(voltage, (v) => { if (v > 0) tracking.trackTool('voltage-control'); });

const goals = computed(() => [
  { id: 'runGel', label: t('biology.goalRunSimulation'), completed: hasRun.value },
  { id: 'identifyBands', label: t('biology.gelGoalIdentify'), completed: selectedBand.value !== null },
]);

/** موضع الشريط (نسبة مئوية من أعلى الجل) — الأصغر يهاجر أبعد */
function bandTargetPosition(bp: number): number {
  const logBp = Math.log10(bp);
  const minLog = Math.log10(100);
  const maxLog = Math.log10(5000);
  return 8 + (1 - (logBp - minLog) / (maxLog - minLog)) * 82;
}

/** الموضع الحالي للشريط — يعتمد على وقت التشغيل والجهد */
function bandCurrentPosition(bp: number): number {
  if (!hasRun.value && !isRunning.value) return 3;
  const target = bandTargetPosition(bp);
  // سرعة الهجرة تعتمد على الجهد وحجم القطعة (الأصغر أسرع)
  const speed = (voltage.value / 100) * (1 / Math.log10(bp));
  const progress = Math.min(1, (runTime.value / 45) * speed * 10);
  return 3 + (target - 3) * progress;
}

async function runGel(): Promise<void> {
  if (isRunning.value) return;
  isRunning.value = true;
  hasRun.value = true;
  runTime.value = 0;
  tracking.trackTool('simulation');
  tracking.trackStage('gel-run');

  if (timerId) clearInterval(timerId);
  timerId = setInterval(() => {
    runTime.value += 0.5;
    if (runTime.value >= 60) {
      stopGel();
    }
  }, 500);
}

function stopGel(): void {
  isRunning.value = false;
  if (timerId) { clearInterval(timerId); timerId = null; }
}

function resetGel(): void {
  stopGel();
  hasRun.value = false;
  runTime.value = 0;
  selectedBand.value = null;
}

function onBandClick(sampleId: string, bp: number, lane: number): void {
  selectedBand.value = { sample: sampleId, bp, lane };
  tracking.trackPart(`band-${bp}`, `${bp}bp`);
}

const goBack = (): void => { void router.push('/biology/biotechnology'); };

onUnmounted(() => { if (timerId) clearInterval(timerId); });

const { isFullscreen, toggleFullscreen } = useFullscreen();
const helpOpen = ref(false);

const GEL_WIDTH = 520;
const GEL_HEIGHT = 380;
const LANE_WIDTH = 110;
const LANE_START = 30;
const BAND_HEIGHT = 8;

function bandX(laneIndex: number): number {
  return LANE_START + laneIndex * LANE_WIDTH + LANE_WIDTH / 2;
}

function bandY(bp: number): number {
  return (bandCurrentPosition(bp) / 100) * (GEL_HEIGHT - 40) + 20;
}

const ladderLabels = computed(() => samples[0].fragments.map((bp) => ({
  bp,
  y: (bandTargetPosition(bp) / 100) * (GEL_HEIGHT - 40) + 20,
})));
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
        <h1 class="experiment-title">{{ t('biology.gelElectrophoresisTitle') }}</h1>
        <p class="experiment-subtitle">{{ t('biology.gelElectrophoresisSubtitle') }}</p>
      </div>
      <BiologyReportButton
        :experiment-id="experimentId"
        :experiment-name="t('biology.gelElectrophoresisTitle')"
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
          <h3 class="gel-info-title">{{ t('biology.gelElectrophoresisTitle') }}</h3>
          <p class="gel-info-text">{{ t('biology.gelElectrophoresisDescription') }}</p>
        </div>

        <div class="gel-controls-panel">
          <div class="gel-voltage-display">
            <span class="volt-label">{{ t('biology.gelVoltage') }}</span>
            <span class="volt-value">{{ voltage }}V</span>
          </div>
          <input v-model.number="voltage" type="range" min="50" max="150" step="10" class="gel-slider" />
          <div class="gel-run-time" v-if="isRunning || hasRun">
            <span class="time-label">{{ t('biology.gelRunTime') }}</span>
            <span class="time-value">{{ runTime.toFixed(1) }}s</span>
          </div>
          <div class="gel-buttons">
            <button class="gel-btn primary" :disabled="isRunning" @click="runGel">
              <svg v-if="!isRunning" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <polygon points="5 3 19 12 5 21 5 3" />
              </svg>
              <span v-else class="mini-spinner" />
              {{ isRunning ? t('biology.gelRunning') : t('biology.gelRun') }}
            </button>
            <button v-if="isRunning" class="gel-btn" @click="stopGel">
              ⏸ {{ t('biology.gelStop') }}
            </button>
            <button class="gel-btn" :disabled="isRunning" @click="resetGel">
              🔄 {{ t('biology.gelReset') }}
            </button>
          </div>
        </div>

        <BiologyGoals v-if="goals.length" :title="t('biology.goalsTitle')" :goals="goals" />

        <div v-if="selectedBand" class="gel-band-info">
          <h4 class="band-info-title">{{ t('biology.gelBandInfo') }}</h4>
          <div class="band-info-row">
            <span>{{ t('biology.gelFragmentSize') }}:</span>
            <strong>{{ selectedBand.bp }} bp</strong>
          </div>
          <div class="band-info-row">
            <span>{{ t('biology.gelSampleLabel') }}:</span>
            <strong>{{ selectedBand.sample }}</strong>
          </div>
        </div>
      </aside>

      <section ref="containerRef" class="canvas-section gel-stage">
        <svg :viewBox="`0 0 ${GEL_WIDTH} ${GEL_HEIGHT}`" class="gel-svg" role="img" :aria-label="t('biology.gelElectrophoresisTitle')">
          <defs>
            <linearGradient id="gelBg" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stop-color="#0c1e3a" />
              <stop offset="100%" stop-color="#0a1628" />
            </linearGradient>
            <filter id="bandGlow">
              <feGaussianBlur stdDeviation="1.5" result="blur" />
              <feMerge>
                <feMergeNode in="blur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
          </defs>

          <!-- خلفية الجل -->
          <rect x="0" y="0" :width="GEL_WIDTH" :height="GEL_HEIGHT" fill="url(#gelBg)" rx="8" />

          <!-- القنوات (lanes) -->
          <g v-for="(s, li) in samples" :key="'lane-' + s.id">
            <rect
              :x="LANE_START + li * LANE_WIDTH + 4"
              y="15"
              :width="LANE_WIDTH - 8"
              :height="GEL_HEIGHT - 30"
              fill="rgba(30, 41, 59, 0.15)"
              stroke="rgba(51, 65, 85, 0.3)"
              stroke-width="0.5"
            />
            <!-- الآبار (wells) -->
            <rect
              :x="LANE_START + li * LANE_WIDTH + 12"
              y="8"
              :width="LANE_WIDTH - 24"
              height="10"
              fill="#1e293b"
              stroke="#475569"
              stroke-width="1"
              rx="2"
            />
            <text
              :x="LANE_START + li * LANE_WIDTH + LANE_WIDTH / 2"
              y="6"
              text-anchor="middle"
              fill="#94a3b8"
              font-size="8"
              font-weight="600"
            >{{ t(s.nameKey) }}</text>
          </g>

          <!-- تسميات السلم (ladder) على اليسار -->
          <g v-for="label in ladderLabels" :key="'lbl-' + label.bp">
            <line
              :x1="LANE_START + LANE_WIDTH + 2"
              :x2="LANE_START + LANE_WIDTH + 8"
              :y1="label.y"
              :y2="label.y"
              stroke="#475569"
              stroke-width="0.5"
            />
            <text
              :x="LANE_START + LANE_WIDTH + 12"
              :y="label.y + 3"
              fill="#64748b"
              font-size="7"
            >{{ label.bp }}bp</text>
          </g>

          <!-- الأشرطة (bands) -->
          <g v-for="(s, li) in samples" :key="'bands-' + s.id">
            <rect
              v-for="(frag, fi) in s.fragments"
              :key="'band-' + s.id + '-' + fi"
              :x="LANE_START + li * LANE_WIDTH + 8"
              :y="bandY(frag) - BAND_HEIGHT / 2"
              :width="LANE_WIDTH - 16"
              :height="BAND_HEIGHT"
              :fill="s.color"
              :opacity="hasRun || isRunning ? 0.85 : 0"
              filter="url(#bandGlow)"
              rx="2"
              class="gel-band-rect"
              :class="{ selected: selectedBand?.sample === s.id && selectedBand?.bp === frag }"
              @click="onBandClick(s.id, frag, li)"
            />
          </g>

          <!-- أقطاب كهربائية -->
          <g class="gel-electrode-top">
            <line x1="0" y1="2" :x2="GEL_WIDTH" y2="2" stroke="#3b82f6" stroke-width="2" opacity="0.6" />
            <text :x="GEL_WIDTH / 2" y="1" text-anchor="middle" fill="#3b82f6" font-size="8" dy="-2">−</text>
          </g>
          <g class="gel-electrode-bottom">
            <line x1="0" :y1="GEL_HEIGHT - 2" :x2="GEL_WIDTH" :y2="GEL_HEIGHT - 2" stroke="#ef4444" stroke-width="2" opacity="0.6" />
            <text :x="GEL_WIDTH / 2" :y="GEL_HEIGHT - 4" text-anchor="middle" fill="#ef4444" font-size="8">+</text>
          </g>

          <!-- تيار كهربائي متحرك -->
          <g v-if="isRunning">
            <circle
              v-for="i in 6"
              :key="'current-' + i"
              class="gel-current-particle"
              :style="{ animationDelay: (i * 0.3) + 's' }"
              :cx="80 + i * 70"
              :cy="GEL_HEIGHT - 10"
              r="2"
              fill="#facc15"
              opacity="0.6"
            />
          </g>
        </svg>

        <div v-if="!hasRun && !isRunning" class="gel-hint">
          {{ t('biology.gelHint') }}
        </div>
      </section>
    </main>
  <BiologyHelpModal
    :open="helpOpen"
    :context="{ topic: experimentId ?? '', titleKey: 'biology.gelElectrophoresisTitle', subtitleKey: 'biology.gelElectrophoresisSubtitle', parts: samples.map((s) => ({ id: s.id, nameKey: s.nameKey })) }"
    @close="helpOpen = false"
  />
  </div>
</template>

<style scoped src="./glb-experiment.css"></style>
<style scoped>
.gel-stage {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 1rem;
  overflow-y: auto;
  position: relative;
}
.gel-svg {
  width: 100%;
  max-width: 560px;
  border-radius: 0.75rem;
  border: 1px solid #334155;
}
.gel-band-rect {
  cursor: pointer;
  transition: opacity 0.3s ease, y 0.5s linear;
}
.gel-band-rect:hover { opacity: 1 !important; filter: brightness(1.3); }
.gel-band-rect.selected { stroke: #fff; stroke-width: 1.5; opacity: 1 !important; }

.gel-current-particle {
  animation: gel-current 1.5s linear infinite;
}
@keyframes gel-current {
  0% { transform: translateY(0); opacity: 0.6; }
  100% { transform: translateY(-360px); opacity: 0; }
}

.gel-info-title { margin: 0 0 0.5rem; color: #4ade80; font-size: 1rem; }
.gel-info-text { margin: 0; color: #cbd5e1; font-size: 0.85rem; line-height: 1.5; }

.gel-controls-panel {
  background: rgba(30, 41, 59, 0.6);
  border: 1px solid #334155;
  border-radius: 0.6rem;
  padding: 0.85rem;
  margin-top: 0.75rem;
}
.gel-voltage-display {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 0.5rem;
}
.volt-label { font-size: 0.78rem; color: #94a3b8; }
.volt-value { font-size: 1.2rem; font-weight: 700; color: #facc15; }
.gel-slider {
  width: 100%;
  -webkit-appearance: none;
  height: 6px;
  background: rgba(15, 23, 42, 0.8);
  border-radius: 3px;
  outline: none;
  margin-bottom: 0.5rem;
}
.gel-slider::-webkit-slider-thumb {
  -webkit-appearance: none;
  width: 18px; height: 18px;
  background: #facc15;
  border-radius: 50%;
  cursor: pointer;
}
.gel-run-time {
  display: flex;
  justify-content: space-between;
  margin-bottom: 0.5rem;
  font-size: 0.8rem;
}
.time-label { color: #94a3b8; }
.time-value { color: #4ade80; font-weight: 700; }
.gel-buttons { display: flex; gap: 0.5rem; flex-wrap: wrap; }
.gel-btn {
  display: flex;
  align-items: center;
  gap: 0.35rem;
  background: rgba(30, 41, 59, 0.8);
  border: 1px solid #334155;
  color: #e2e8f0;
  padding: 0.5rem 0.85rem;
  border-radius: 0.4rem;
  cursor: pointer;
  font-size: 0.82rem;
  font-weight: 600;
  transition: all 0.15s ease;
  flex: 1;
  justify-content: center;
}
.gel-btn:hover:not(:disabled) { background: rgba(51, 65, 85, 0.9); border-color: #475569; }
.gel-btn.primary { background: rgba(74, 222, 128, 0.15); border-color: rgba(74, 222, 128, 0.4); color: #4ade80; }
.gel-btn.primary:hover:not(:disabled) { background: rgba(74, 222, 128, 0.25); }
.gel-btn:disabled { opacity: 0.4; cursor: not-allowed; }

.mini-spinner {
  width: 14px; height: 14px;
  border: 2px solid rgba(74, 222, 128, 0.3);
  border-top-color: #4ade80;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}
@keyframes spin { to { transform: rotate(360deg); } }

.gel-band-info {
  background: rgba(15, 23, 42, 0.6);
  border: 1px solid rgba(74, 222, 128, 0.3);
  border-radius: 0.5rem;
  padding: 0.75rem;
  margin-top: 0.75rem;
}
.band-info-title { margin: 0 0 0.5rem; font-size: 0.85rem; color: #4ade80; }
.band-info-row { display: flex; justify-content: space-between; font-size: 0.8rem; color: #cbd5e1; margin-bottom: 0.25rem; }

.gel-hint {
  position: absolute;
  bottom: 1rem;
  inset-inline-start: 50%;
  transform: translateX(-50%);
  background: rgba(15, 23, 42, 0.9);
  border: 1px solid #334155;
  border-radius: 0.5rem;
  padding: 0.5rem 1rem;
  color: #94a3b8;
  font-size: 0.82rem;
  white-space: nowrap;
}
</style>
