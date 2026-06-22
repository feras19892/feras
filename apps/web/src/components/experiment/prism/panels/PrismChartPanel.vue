<script setup lang="ts">
import { computed } from 'vue'
import { useI18n } from '../../../../composables/useI18n'
import type { PrismTrial } from '../../../../composables/prism/usePrismTrials'

const { t } = useI18n()

interface Props {
  trials: PrismTrial[]
  slope: number
  intercept: number
  rSquared: number
}

const props = defineProps<Props>()

const chartPoints = computed(() => props.trials
  .filter(t => t.deviation !== null)
  .map((t) => ({ wavelength: t.wavelength, deviation: t.deviation as number })))

const chartBounds = computed(() => {
  const pts = chartPoints.value
  if (pts.length === 0) return { xMin: 380, xMax: 700, yMin: 0, yMax: 60 }
  const xs = pts.map(p => p.wavelength)
  const ys = pts.map(p => p.deviation)
  const xMin = Math.min(...xs)
  const xMax = Math.max(...xs)
  const yMin = Math.min(...ys)
  const yMax = Math.max(...ys)
  const dx = Math.max(1, xMax - xMin)
  const dy = Math.max(1e-6, yMax - yMin)
  return {
    xMin: xMin - dx * 0.08,
    xMax: xMax + dx * 0.08,
    yMin: Math.max(0, yMin - dy * 0.12),
    yMax: yMax + dy * 0.12,
  }
})

const svgPad = { left: 40, right: 15, top: 15, bottom: 35 }
const svgW = 300
const svgH = 200

const plotW = computed(() => svgW - svgPad.left - svgPad.right)
const plotH = computed(() => svgH - svgPad.top - svgPad.bottom)

const xScale = computed(() => {
  const dx = chartBounds.value.xMax - chartBounds.value.xMin
  return dx > 0 ? plotW.value / dx : 1
})

const yScale = computed(() => {
  const dy = chartBounds.value.yMax - chartBounds.value.yMin
  return dy > 0 ? plotH.value / dy : 1
})

function toSvgX(val: number) {
  return svgPad.left + (val - chartBounds.value.xMin) * xScale.value
}

function toSvgY(val: number) {
  return svgH - svgPad.bottom - (val - chartBounds.value.yMin) * yScale.value
}
</script>

<template>
  <div class="panel-body">
    <div v-if="chartPoints.length >= 2" class="chart-box">
      <svg viewBox="0 0 300 200" class="reg-chart">
        <line :x1="toSvgX(chartBounds.xMin)" :y1="toSvgY(chartBounds.yMin)" :x2="toSvgX(chartBounds.xMax)" :y2="toSvgY(chartBounds.yMin)" stroke="rgba(255,255,255,0.3)" stroke-width="1"/>
        <line :x1="toSvgX(chartBounds.xMin)" :y1="toSvgY(chartBounds.yMin)" :x2="toSvgX(chartBounds.xMin)" :y2="toSvgY(chartBounds.yMax)" stroke="rgba(255,255,255,0.3)" stroke-width="1"/>
        <text x="150" y="195" fill="#8B95A5" font-size="10" text-anchor="middle">λ (nm)</text>
        <text x="10" y="100" fill="#8B95A5" font-size="10" text-anchor="middle" transform="rotate(-90 10 100)">δ (deg)</text>
        <g v-for="(p, i) in chartPoints" :key="i">
          <circle :cx="toSvgX(p.wavelength)" :cy="toSvgY(p.deviation)" r="4" fill="#22c55e"/>
        </g>
        <line v-if="Number.isFinite(slope) && chartPoints.length >= 2" :x1="toSvgX(chartBounds.xMin)" :y1="toSvgY(slope * chartBounds.xMin + intercept)" :x2="toSvgX(chartBounds.xMax)" :y2="toSvgY(slope * chartBounds.xMax + intercept)" stroke="#fbbf24" stroke-width="1.5"/>
      </svg>
      <div class="reg-summary">
        <span class="reg-badge">{{ t('prism.slope') }} = {{ slope.toFixed(3) }}</span>
        <span class="reg-badge">R² = {{ rSquared.toFixed(4) }}</span>
      </div>
    </div>
    <div v-else class="empty">{{ t('prism.emptyChart') }}</div>
  </div>
</template>

<style scoped>
.panel-body { display: flex; flex-direction: column; gap: .4rem; font-size: .82rem; }
.empty { text-align: center; color: #475569; font-size: .8rem; padding: .5rem; }
.reg-summary { display: flex; gap: .4rem; margin-top: .4rem; flex-wrap: wrap; }
.reg-badge { padding: .15rem .4rem; border-radius: 999px; background: rgba(34,197,94,0.1); border: 1px solid rgba(34,197,94,0.2); color: #22c55e; font-size: .7rem; font-weight: 700; font-family: monospace; }
.chart-box { display: flex; flex-direction: column; align-items: center; width: 100%; }
.reg-chart { width: 100%; height: clamp(180px, 34vh, 520px); }
</style>
