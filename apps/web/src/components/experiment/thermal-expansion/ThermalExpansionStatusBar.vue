<script setup lang="ts">
import { useI18n } from '@/composables/useI18n';
const { t } = useI18n();
import { computed } from 'vue'

import { ALPHA } from '../../../composables/thermal-expansion/useThermalExpansionCalculations'





const props = defineProps<{
  running: boolean
  paused: boolean
  material: string
  L0: number
  t0: number
  t1: number
  currentT: number
  dL: number
  phase?: string
}>()
const alpha = computed(() => ALPHA[props.material] ?? 16.5)
const phaseAr = (p?: string) => {
  const map: Record<string, string> = { ready: 'جاهز', heating: 'تسخين', done: 'توازن' }
  return map[p ?? ''] ?? p ?? ''
}
</script>
<template>
  <div class="status-bar">
    <span class="dot" :class="running ? (paused ? 'paused' : 'run') : 'off'" />
    <span>{{ running ? (paused ? t('experiments.statusPaused') : t('experiments.statusRunning')) : t('experiments.statusIdle') }}</span>
    <span class="sep">|</span>
    <span class="badge phase">{{ phaseAr(phase) }}</span>
    <span class="sep">|</span>
    <span>{{ material }} α={{ alpha.toFixed(1) }}×10⁻⁶/K</span>
    <span class="sep">|</span>
    <span>L₀={{ L0.toFixed(2) }} m</span>
    <span class="sep">|</span>
    <span class="badge temp">t={{ currentT.toFixed(1) }}°C</span>
    <span class="sep">|</span>
    <span>ΔL={{ (dL * 1000).toFixed(2) }} mm</span>
  </div>
</template>
<style scoped>
.status-bar { display:flex; align-items:center; gap:.5rem; padding:.25rem .7rem; background:#0d1117; border-top:1px solid #1e2530; font-size:.72rem; color:#8B95A5; flex-shrink:0; }
.dot { width:7px; height:7px; border-radius:50%; background:#475569; }
.dot.run { background:#22c55e; }
.dot.paused { background:#f59e0b; }
.sep { color:#2D3645; }
.badge { border-radius:4px; padding:.06rem .3rem; font-weight:600; font-size:.68rem; }
.badge.phase { background:rgba(91,141,184,.1); color:#5B8DB8; border:1px solid rgba(91,141,184,.2); }
.badge.temp { background:rgba(245,158,11,.1); color:#fbbf24; border:1px solid rgba(245,158,11,.2); }
</style>
