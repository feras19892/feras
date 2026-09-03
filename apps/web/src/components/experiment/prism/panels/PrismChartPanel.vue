<script setup lang="ts">
import { useI18n } from '@/composables/useI18n';
const { t, direction } = useI18n();
import { computed } from 'vue'

import type { PrismTrial } from '../../../../composables/prism/usePrismTrials'





interface Props {
  trials: PrismTrial[]
  slope: number
  intercept: number
  rSquared: number
}

const props = defineProps<Props>()

// Plot n vs 1/λ² (Cauchy's equation: n = A + B/λ² → n = intercept + slope·x where x = 1/λ²)
const chartPoints = computed(() => props.trials
  .filter(t => t.deviation !== null)
  .map((t) => ({ invLambdaSq: 1 / (t.wavelength * t.wavelength), n: t.n })))

const chartBounds = computed(() => {
  const pts = chartPoints.value
  if (pts.length === 0) return { xMin: 2e-6, xMax: 7e-6, yMin: 1.3, yMax: 2.5 }
  const xs = pts.map(p => p.invLambdaSq)
  const ys = pts.map(p => p.n)
  const xMin = Math.min(...xs)
  const xMax = Math.max(...xs)
  const yMin = Math.min(...ys)
  const yMax = Math.max(...ys)
  const dx = Math.max(1e-9, xMax - xMin)
  const dy = Math.max(1e-6, yMax - yMin)
  return {
    xMin: xMin - dx * 0.08,
    xMax: xMax + dx * 0.08,
    yMin: yMin - dy * 0.12,
    yMax: yMax + dy * 0.12,
  }
})

const svgPad = { left: 48, right: 15, top: 15, bottom: 40 }
const svgW = 320
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

function fmtSci(val: number): string {
  if (val === 0) return '0'
  const exp = Math.floor(Math.log10(Math.abs(val)))
  if (exp >= -2 && exp <= 3) return val.toFixed(3)
  const mant = val / Math.pow(10, exp)
  return `${mant.toFixed(2)}e${exp}`
}
</script>

<template>
  <div class="panel-body">
    <div class="card-header">
      <h4>&#x1F4C8; {{ t('prism.chartTitle') || 'n vs 1/λ²' }}</h4>
    </div>
    <div v-if="chartPoints.length >= 2" class="chart-box">
      <svg :viewBox="`0 0 ${svgW} ${svgH}`" class="reg-chart">
        <!-- Grid lines -->
        <template v-for="i in 5" :key="'xg' + i">
          <line :x1="toSvgX(chartBounds.xMin + (chartBounds.xMax - chartBounds.xMin) * (i - 1) / 4)"
                :y1="toSvgY(chartBounds.yMin)" :y2="toSvgY(chartBounds.yMax)"
                stroke="rgba(255,255,255,0.08)" stroke-width="1"/>
        </template>
        <template v-for="i in 5" :key="'yg' + i">
          <line :x1="toSvgX(chartBounds.xMin)" :x2="toSvgX(chartBounds.xMax)"
                :y1="toSvgY(chartBounds.yMin + (chartBounds.yMax - chartBounds.yMin) * (i - 1) / 4)"
                :y2="toSvgY(chartBounds.yMin + (chartBounds.yMax - chartBounds.yMin) * (i - 1) / 4)"
                stroke="rgba(255,255,255,0.08)" stroke-width="1"/>
        </template>
        <!-- Axes -->
        <line :x1="toSvgX(chartBounds.xMin)" :y1="toSvgY(chartBounds.yMin)" :x2="toSvgX(chartBounds.xMax)" :y2="toSvgY(chartBounds.yMin)" stroke="rgba(255,255,255,0.3)" stroke-width="1"/>
        <line :x1="toSvgX(chartBounds.xMin)" :y1="toSvgY(chartBounds.yMin)" :x2="toSvgX(chartBounds.xMin)" :y2="toSvgY(chartBounds.yMax)" stroke="rgba(255,255,255,0.3)" stroke-width="1"/>
        <!-- X labels -->
        <text v-for="i in 5" :key="'xl' + i" :x="toSvgX(chartBounds.xMin + (chartBounds.xMax - chartBounds.xMin) * (i - 1) / 4)" :y="svgH - 8" fill="#8B95A5" font-size="8" text-anchor="middle">{{ fmtSci(chartBounds.xMin + (chartBounds.xMax - chartBounds.xMin) * (i - 1) / 4) }}</text>
        <!-- Y labels -->
        <text v-for="i in 5" :key="'yl' + i" :x="svgPad.left - 6" :y="toSvgY(chartBounds.yMin + (chartBounds.yMax - chartBounds.yMin) * (i - 1) / 4) + 3" fill="#8B95A5" font-size="8" text-anchor="end">{{ (chartBounds.yMin + (chartBounds.yMax - chartBounds.yMin) * (i - 1) / 4).toFixed(3) }}</text>
        <!-- Axis titles -->
        <text :x="svgW / 2" :y="svgH - 2" fill="#8B95A5" font-size="9" text-anchor="middle">1/λ² (nm⁻²)</text>
        <text x="8" :y="svgH / 2" fill="#8B95A5" font-size="9" text-anchor="middle" transform="rotate(-90 8,${svgH / 2})">n</text>
        <!-- Points -->
        <g v-for="(p, i) in chartPoints" :key="i">
          <circle :cx="toSvgX(p.invLambdaSq)" :cy="toSvgY(p.n)" r="4" fill="#22c55e"/>
        </g>
        <!-- Regression line: n = slope·x + intercept -->
        <line v-if="Number.isFinite(slope) && chartPoints.length >= 2"
              :x1="toSvgX(chartBounds.xMin)"
              :y1="toSvgY(slope * chartBounds.xMin + intercept)"
              :x2="toSvgX(chartBounds.xMax)"
              :y2="toSvgY(slope * chartBounds.xMax + intercept)"
              stroke="#fbbf24" stroke-width="1.5"/>
      </svg>
      <div class="reg-summary">
        <span class="reg-badge">B (slope) = {{ slope.toExponential(3) }}</span>
        <span class="reg-badge">A (intercept) = {{ intercept.toFixed(4) }}</span>
        <span class="reg-badge">R² = {{ rSquared.toFixed(4) }}</span>
      </div>
      <div class="cauchy-equation">
        n = <b>{{ intercept.toFixed(3) }}</b> + <b>{{ slope.toExponential(3) }}</b> / λ²
      </div>
    </div>
    <div v-else class="empty">{{ t('prism.emptyChart') }}</div>
  </div>
</template>

<style scoped>
.panel-body { display: flex; flex-direction: column; gap: .4rem; font-size: .82rem; }
.card-header { display:flex; justify-content:space-between; align-items:center; margin:0 0 .3rem; flex-wrap:wrap; gap:.3rem; }
.card-header h4 { margin:0; font-size:.82rem; color:#D1D7E0; font-weight:700; }
.empty { text-align: center; color: #475569; font-size: .8rem; padding: .5rem; }
.reg-summary { display: flex; gap: .4rem; margin-top: .4rem; flex-wrap: wrap; }
.reg-badge { padding: .15rem .4rem; border-radius: 999px; background: rgba(34,197,94,0.1); border: 1px solid rgba(34,197,94,0.2); color: #22c55e; font-size: .7rem; font-weight: 700; font-family: monospace; }
.cauchy-equation { font-size: .78rem; color: #5B8DB8; background: rgba(91,141,184,.08); padding: .3rem .5rem; border-radius: 6px; border: 1px solid rgba(91,141,184,.2); text-align: center; direction: ltr; }
.chart-box { display: flex; flex-direction: column; align-items: center; width: 100%; }
.reg-chart { width: 100%; height: clamp(180px, 34vh, 520px); }
</style>
