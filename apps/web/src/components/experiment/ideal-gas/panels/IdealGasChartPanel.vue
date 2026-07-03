<script setup lang="ts">
import { computed } from 'vue'
import { useI18n } from '../../../../composables/useI18n'
import type { IdealGasTrial } from '../../../../composables/ideal-gas/useIdealGasTrials'

const { t } = useI18n()
const props = defineProps<{ trials: IdealGasTrial[] }>()

interface PlotData { minX: number; maxX: number; minY: number; maxY: number; data: IdealGasTrial[] }
const pts = computed<PlotData | null>(() => {
  if (props.trials.length < 2) return null
  const xs = props.trials.map(t => t.V)
  const ys = props.trials.map(t => t.P)
  const minX = Math.min(...xs), maxX = Math.max(...xs)
  const minY = Math.min(...ys), maxY = Math.max(...ys)
  const padX = (maxX - minX) * 0.1 || 1, padY = (maxY - minY) * 0.1 || 1
  return { minX: minX - padX, maxX: maxX + padX, minY: minY - padY, maxY: maxY + padY, data: props.trials }
})

function toSvg(trial: IdealGasTrial) {
  const p = pts.value!
  const x = ((trial.V - p.minX) / (p.maxX - p.minX)) * 280 + 10
  const y = 180 - ((trial.P - p.minY) / (p.maxY - p.minY)) * 160
  return `${x},${y}`
}
</script>

<template>
  <div class="chart-panel">
    <svg v-if="pts" viewBox="0 0 300 200" class="chart-svg">
      <text x="150" y="15" text-anchor="middle" fill="#8B95A5" font-size="10">P-V Diagram</text>
      <line x1="30" y1="180" x2="290" y2="180" stroke="#2D3645" stroke-width="1" />
      <line x1="30" y1="20" x2="30" y2="180" stroke="#2D3645" stroke-width="1" />
      <text x="160" y="195" text-anchor="middle" fill="#64748b" font-size="8">V (m³)</text>
      <text x="10" y="100" text-anchor="middle" fill="#64748b" font-size="8" transform="rotate(-90 10 100)">P (Pa)</text>
      <polyline :points="pts.data.map(toSvg).join(' ')" fill="none" stroke="#5B8DB8" stroke-width="2" />
      <circle v-for="(trial,i) in pts.data" :key="i" :cx="toSvg(trial).split(',')[0]" :cy="toSvg(trial).split(',')[1]" r="3" fill="#fbbf24" />
    </svg>
    <p v-else class="empty">{{ t('experiments.chartNeedTrials') }}</p>
  </div>
</template>

<style scoped>
.chart-panel { padding:.5rem; }
.chart-svg { width:100%; height:auto; }
.empty { color:#64748b; font-size:.75rem; text-align:center; }
</style>
