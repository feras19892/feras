<script setup lang="ts">
import { computed } from 'vue'
import { useI18n } from '../../../../composables/useI18n'
import type { CalorimetryTrial } from '../../../../composables/calorimetry/useCalorimetryTrials'
const { t } = useI18n()
const props = defineProps<{ trials: CalorimetryTrial[] }>()

const pts = computed(() => props.trials.map(tr => ({ x: tr.tMetal, y: tr.tf, label: `#${tr.id}` })))
const xMin = computed(() => pts.value.length ? Math.min(...pts.value.map(p => p.x)) - 10 : 80)
const xMax = computed(() => pts.value.length ? Math.max(...pts.value.map(p => p.x)) + 10 : 120)
const yMin = computed(() => pts.value.length ? Math.min(...pts.value.map(p => p.y)) - 2 : 20)
const yMax = computed(() => pts.value.length ? Math.max(...pts.value.map(p => p.y)) + 2 : 40)

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
    <svg v-if="trials.length >= 2" viewBox="0 0 300 200" style="width:100%;height:200px;background:#0d1117;border-radius:5px;border:1px solid #2D3645;">
      <text x="150" y="12" text-anchor="middle" fill="#8B95A5" font-size="10">Tf vs T_metal</text>
      <template v-for="i in 5" :key="'xg'+i">
        <line :x1="30 + (i-1)*62.5" y1="20" :x2="30 + (i-1)*62.5" y2="180" stroke="rgba(255,255,255,0.06)" stroke-width="1"/>
        <text :x="30 + (i-1)*62.5" y="192" text-anchor="middle" fill="rgba(255,255,255,0.3)" font-size="8">{{ Math.round(xMin + (xMax-xMin)*(i-1)/4) }}</text>
      </template>
      <template v-for="i in 5" :key="'yg'+i">
        <line x1="30" :y1="180 - (i-1)*40" x2="280" :y2="180 - (i-1)*40" stroke="rgba(255,255,255,0.06)" stroke-width="1"/>
        <text x="26" :y="180 - (i-1)*40 + 3" text-anchor="end" fill="rgba(255,255,255,0.3)" font-size="8">{{ (yMin + (yMax-yMin)*(i-1)/4).toFixed(0) }}</text>
      </template>
      <line x1="30" y1="180" x2="280" y2="180" stroke="rgba(255,255,255,0.3)" stroke-width="1" />
      <line x1="30" y1="20" x2="30" y2="180" stroke="rgba(255,255,255,0.3)" stroke-width="1" />
      <text x="150" y="198" text-anchor="middle" fill="#64748b" font-size="9">T_metal (°C)</text>
      <text x="8" y="100" text-anchor="middle" fill="#64748b" font-size="9" transform="rotate(-90, 8, 100)">Tf (°C)</text>
      <g v-for="p in pts" :key="p.label">
        <circle :cx="mapX(p.x, 300)" :cy="mapY(p.y, 200)" r="4" fill="#5B8DB8" />
        <title>{{ `T_metal=${p.x.toFixed(1)}°C, Tf=${p.y.toFixed(1)}°C` }}</title>
      </g>
      <line v-if="trend" :x1="mapX(xMin, 300)" :y1="mapY(trend.m * xMin + trend.b, 200)" :x2="mapX(xMax, 300)" :y2="mapY(trend.m * xMax + trend.b, 200)" stroke="rgba(245,158,11,0.6)" stroke-width="1.5" stroke-dasharray="5,3" />
      <text v-for="p in pts" :key="p.label + 'l'" :x="mapX(p.x, 300)" :y="mapY(p.y, 200) - 8" text-anchor="middle" fill="#8B95A5" font-size="8">{{ p.label }}</text>
    </svg>
    <p v-else class="empty">{{ t('experiments.chartNeedTrials') }}</p>
  </div>
</template>
<style scoped>
.chart-panel { display:flex; align-items:center; justify-content:center; padding:.3rem; }
.empty { color:#64748b; font-size:.75rem; text-align:center; }
</style>
