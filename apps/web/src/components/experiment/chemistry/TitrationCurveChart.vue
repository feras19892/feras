<script setup lang="ts">
import { useI18n } from '@/composables/useI18n';
const { t } = useI18n();
import { computed } from 'vue';
import type { TitrationReading } from '../../../composables/chemistry/experiments';

const props = defineProps<{
  readings: TitrationReading[];
}>();

const W = 280;
const H = 160;
const PAD = 28;

const maxVol = computed(() => {
  if (props.readings.length === 0) return 50;
  return Math.max(...props.readings.map(r => r.volume), 10);
});

const points = computed(() => {
  if (props.readings.length < 2) return '';
  const xScale = (W - PAD * 2) / maxVol.value;
  const yScale = (H - PAD * 2) / 14;
  return props.readings
    .map(r => {
      const x = PAD + r.volume * xScale;
      const ph = r.ph ?? 7;
      const y = H - PAD - ph * yScale;
      return `${x.toFixed(1)},${y.toFixed(1)}`;
    })
    .join(' ');
});

const lastReading = computed(() => props.readings[props.readings.length - 1] || null);

const equivalencePoint = computed(() => {
  if (props.readings.length < 3) return null;
  let maxJump = 0;
  let eqIdx = -1;
  for (let i = 1; i < props.readings.length; i++) {
    const ph1 = props.readings[i].ph ?? 7;
    const ph0 = props.readings[i - 1].ph ?? 7;
    const jump = ph1 - ph0;
    if (jump > maxJump) { maxJump = jump; eqIdx = i; }
  }
  if (eqIdx < 0 || maxJump < 0.5) return null;
  return props.readings[eqIdx];
});

const eqX = computed(() => {
  if (!equivalencePoint.value) return 0;
  return PAD + equivalencePoint.value.volume * ((W - PAD * 2) / maxVol.value);
});
const eqY = computed(() => {
  if (!equivalencePoint.value) return 0;
  return H - PAD - (equivalencePoint.value.ph ?? 7) * ((H - PAD * 2) / 14);
});

const xTicks = computed(() => {
  const ticks: number[] = [];
  const step = maxVol.value <= 20 ? 5 : maxVol.value <= 50 ? 10 : 20;
  for (let v = 0; v <= maxVol.value; v += step) ticks.push(v);
  return ticks;
});

const yTicks = [0, 2, 4, 6, 7, 8, 10, 12, 14];
</script>

<template>
  <div class="titration-chart-wrapper">
    <div class="chart-header">
      <span class="chart-title">{{ t('chemistryLab.titrationCurve') }}</span>
      <span v-if="lastReading" class="chart-latest">
        pH: {{ lastReading.ph !== null ? lastReading.ph.toFixed(2) : '--' }} | {{ lastReading.volume.toFixed(1) }}mL
      </span>
    </div>
    <svg :viewBox="`0 0 ${W} ${H}`" class="titration-svg" xmlns="http://www.w3.org/2000/svg">
      <!-- Grid lines -->
      <g class="grid">
        <line
          v-for="yt in yTicks"
          :key="'y' + yt"
          :x1="PAD" :x2="W - PAD"
          :y1="H - PAD - yt * ((H - PAD * 2) / 14)"
          :y2="H - PAD - yt * ((H - PAD * 2) / 14)"
          stroke="#f1f5f9" stroke-width="1"
        />
      </g>
      <!-- Axes -->
      <line :x1="PAD" :y1="H - PAD" :x2="W - PAD" :y2="H - PAD" stroke="#94a3b8" stroke-width="1.5" />
      <line :x1="PAD" :y1="PAD" :x2="PAD" :y2="H - PAD" stroke="#94a3b8" stroke-width="1.5" />
      <!-- Y labels -->
      <text
        v-for="yt in yTicks"
        :key="'yl' + yt"
        :x="PAD - 6" :y="H - PAD - yt * ((H - PAD * 2) / 14) + 3"
        text-anchor="end" font-size="8" fill="#64748b"
      >{{ yt }}</text>
      <!-- X labels -->
      <text
        v-for="xt in xTicks"
        :key="'xl' + xt"
        :x="PAD + xt * ((W - PAD * 2) / maxVol)" :y="H - PAD + 12"
        text-anchor="middle" font-size="8" fill="#64748b"
      >{{ xt }}</text>
      <!-- Axis titles -->
      <text :x="W / 2" :y="H - 4" text-anchor="middle" font-size="8" fill="#475569" font-weight="600">{{ t('chemistryLab.volumeML') }}</text>
      <text :x="8" :y="H / 2" text-anchor="middle" font-size="8" fill="#475569" font-weight="600" transform="rotate(-90 8 {{ H / 2 }})">pH</text>
      <!-- Equivalence point marker -->
      <g v-if="equivalencePoint">
        <line :x1="eqX" :y1="PAD" :x2="eqX" :y2="H - PAD" stroke="#10b981" stroke-width="1" stroke-dasharray="3,3" opacity="0.5" />
        <line :x1="PAD" :y1="eqY" :x2="W - PAD" :y2="eqY" stroke="#10b981" stroke-width="1" stroke-dasharray="3,3" opacity="0.5" />
        <circle :cx="eqX" :cy="eqY" r="4" fill="#10b981" stroke="#fff" stroke-width="1.5" />
        <text :x="eqX + 6" :y="eqY - 6" font-size="8" fill="#059669" font-weight="700">Eq</text>
      </g>
      <!-- Curve -->
      <polyline
        v-if="points"
        :points="points"
        fill="none"
        stroke="#3b82f6"
        stroke-width="2"
        stroke-linejoin="round"
        stroke-linecap="round"
      />
      <!-- Data points -->
      <g v-if="readings.length >= 2">
        <circle
          v-for="(r, i) in readings"
          :key="i"
          :cx="PAD + r.volume * ((W - PAD * 2) / maxVol)"
          :cy="H - PAD - (r.ph ?? 7) * ((H - PAD * 2) / 14)"
          r="2"
          fill="#3b82f6"
        />
      </g>
      <!-- Empty state -->
      <text v-if="readings.length < 2" :x="W / 2" :y="H / 2" text-anchor="middle" font-size="9" fill="#94a3b8">
        {{ t('chemistryLab.chartNeedsData') }}
      </text>
    </svg>
  </div>
</template>

<style scoped>
.titration-chart-wrapper {
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(8px);
  border: 1px solid #e2e8f0;
  border-radius: 0.75rem;
  padding: 0.5rem 0.6rem;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
  width: 300px;
  z-index: 20;
}
.chart-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 0.25rem;
}
.chart-title {
  font-size: 0.72rem;
  font-weight: 700;
  color: #1e293b;
}
.chart-latest {
  font-size: 0.65rem;
  color: #3b82f6;
  font-weight: 600;
  font-variant-numeric: tabular-nums;
}
.titration-svg {
  width: 100%;
  height: auto;
  display: block;
}
</style>
