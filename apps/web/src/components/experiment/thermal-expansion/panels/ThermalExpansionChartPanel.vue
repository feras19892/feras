<script setup lang="ts">
import { useI18n } from '@/composables/useI18n';
const { t } = useI18n();
import { computed } from 'vue'

import type { ThermalExpansionTrial } from '../../../../composables/thermal-expansion/useThermalExpansionTrials'





const props = defineProps<{ trials: ThermalExpansionTrial[] }>()

const pts = computed(() => props.trials.map(tr => ({ x: tr.t1, y: tr.deltaL * 1000, label: `#${tr.id}` })))
const xMin = computed(() => pts.value.length ? Math.min(...pts.value.map(p => p.x)) - 10 : 50)
const xMax = computed(() => pts.value.length ? Math.max(...pts.value.map(p => p.x)) + 10 : 120)
const yMin = computed(() => pts.value.length ? Math.min(...pts.value.map(p => p.y)) - 0.05 : 0)
const yMax = computed(() => pts.value.length ? Math.max(...pts.value.map(p => p.y)) + 0.05 : 0.5)

const trend = computed(() => {
  if (pts.value.length < 2) return null
  const n = pts.value.length
  const sx = pts.value.reduce((s, p) => s + p.x, 0)
  const sy = pts.value.reduce((s, p) => s + p.y, 0)
  const sxy = pts.value.reduce((s, p) => s + p.x * p.y, 0)
  const sxx = pts.value.reduce((s, p) => s + p.x * p.x, 0)
  const m = (n * sxy - sx * sy) / (n * sxx - sx * sx)
  const b = (sy - m * sx) / n
  return { m, b }
})

function mapX(v: number, W: number) { return 40 + (v - xMin.value) / (xMax.value - xMin.value) * (W - 60) }
function mapY(v: number, H: number) { return H - 30 - (v - yMin.value) / (yMax.value - yMin.value) * (H - 50) }
</script>
<template>
  <div class="chart-panel">
    <svg v-if="trials.length >= 2" viewBox="0 0 300 200" style="width:100%;height:200px;">
      <text x="150" y="12" text-anchor="middle" fill="#8B95A5" font-size="10">ΔL vs t₁</text>
      <line x1="30" y1="180" x2="280" y2="180" stroke="#2D3645" stroke-width="1" />
      <line x1="30" y1="20" x2="30" y2="180" stroke="#2D3645" stroke-width="1" />
      <text x="150" y="198" text-anchor="middle" fill="#64748b" font-size="9">t₁ (°C)</text>
      <text x="8" y="100" text-anchor="middle" fill="#64748b" font-size="9" transform="rotate(-90, 8, 100)">ΔL (mm)</text>
      <line v-if="trend" :x1="mapX(xMin, 300)" :y1="mapY(trend.m * xMin + trend.b, 200)" :x2="mapX(xMax, 300)" :y2="mapY(trend.m * xMax + trend.b, 200)" stroke="rgba(245,158,11,0.6)" stroke-width="1.5" stroke-dasharray="5,3" />
      <circle v-for="p in pts" :key="p.label" :cx="mapX(p.x, 300)" :cy="mapY(p.y, 200)" r="4" fill="#5B8DB8" />
    </svg>
    <p v-else class="empty">{{ t('experiments.chartNeedTrials') }}</p>
  </div>
</template>
<style scoped>
.chart-panel { display:flex; align-items:center; justify-content:center; }
.empty { color:#64748b; font-size:.75rem; text-align:center; }
</style>
