<script setup lang="ts">
import { computed } from 'vue'
import { useI18n } from '../../../../composables/useI18n'
import type { ThermalExpansionTrial } from '../../../../composables/thermal-expansion/useThermalExpansionTrials'
const { t } = useI18n()
const props = defineProps<{ trials: ThermalExpansionTrial[] }>()

const pts = computed(() => props.trials.map(t => ({ x: t.t1, y: t.deltaL * 1000, label: `#${t.id}` })))
const xMin = computed(() => pts.value.length ? Math.min(...pts.value.map(p => p.x)) - 10 : 50)
const xMax = computed(() => pts.value.length ? Math.max(...pts.value.map(p => p.x)) + 10 : 120)
const yMin = computed(() => pts.value.length ? Math.min(...pts.value.map(p => p.y)) - 0.05 : 0)
const yMax = computed(() => pts.value.length ? Math.max(...pts.value.map(p => p.y)) + 0.05 : 0.5)

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
      <circle v-for="p in pts" :key="p.label" :cx="mapX(p.x, 300)" :cy="mapY(p.y, 200)" r="4" fill="#5B8DB8" />
    </svg>
    <p v-else class="empty">{{ t('experiments.chartNeedTrials') }}</p>
  </div>
</template>
<style scoped>
.chart-panel { display:flex; align-items:center; justify-content:center; }
.empty { color:#64748b; font-size:.75rem; text-align:center; }
</style>
