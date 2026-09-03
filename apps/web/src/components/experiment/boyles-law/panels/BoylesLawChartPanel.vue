<script setup lang="ts">
import { useI18n } from '@/composables/useI18n';
const { t, direction } = useI18n();
import { computed } from 'vue'

import type { BoylesLawTrial } from '../../../../composables/boyles-law/useBoylesLawTrials'





const props = defineProps<{ trials: BoylesLawTrial[] }>()

const chartPoints = computed(() => props.trials
  .filter(tr => tr.v > 0 && tr.p > 0)
  .map(tr => ({ x: tr.v, y: tr.p })))

const chartBounds = computed(() => {
  const pts = chartPoints.value
  if (pts.length === 0) return { xMin: 0.2, xMax: 2.2, yMin: 0, yMax: 4 }
  const xs = pts.map(p => p.x), ys = pts.map(p => p.y)
  return { xMin: 0, xMax: Math.max(...xs, 2.2) * 1.1, yMin: 0, yMax: Math.max(...ys, 3) * 1.1 }
})

const svgW = 300, svgH = 200
const pad = { l: 44, r: 14, t: 14, b: 34 }
const pw = svgW - pad.l - pad.r, ph = svgH - pad.t - pad.b
function toX(v: number) {
  const b = chartBounds.value
  return pad.l + ((v - b.xMin) / (b.xMax - b.xMin)) * pw
}
function toY(v: number) {
  const b = chartBounds.value
  return svgH - pad.b - ((v - b.yMin) / (b.yMax - b.yMin)) * ph
}

// Hyperbola curve: P = k/V where k = avg PV
const curvePts = computed(() => {
  const k = props.trials.length ? (props.trials.reduce((s, tr) => s + tr.pv, 0) / props.trials.length) : 1
  const b = chartBounds.value
  const pts: string[] = []
  for (let v = b.xMin; v <= b.xMax; v += (b.xMax - b.xMin) / 40) {
    const p = k / v
    if (p >= b.yMin && p <= b.yMax) pts.push(`${toX(v)},${toY(p)}`)
  }
  return pts.length > 1 ? `M ${pts.join(' L ')}` : ''
})
</script>
<template>
  <div class="panel-body">
    <div v-if="chartPoints.length >= 2" class="chart-box">
      <svg :viewBox="`0 0 ${svgW} ${svgH}`" class="reg-chart">
        <template v-for="i in 5" :key="'xg'+i">
          <line :x1="toX(chartBounds.xMin + (chartBounds.xMax-chartBounds.xMin)*(i-1)/4)" :y1="toY(chartBounds.yMin)" :y2="toY(chartBounds.yMax)" stroke="rgba(255,255,255,0.08)" stroke-width="1"/>
          <text :x="toX(chartBounds.xMin + (chartBounds.xMax-chartBounds.xMin)*(i-1)/4)" :y="svgH-8" fill="rgba(255,255,255,0.3)" font-size="9" text-anchor="middle">{{ (chartBounds.xMin + (chartBounds.xMax-chartBounds.xMin)*(i-1)/4).toFixed(1) }}</text>
        </template>
        <template v-for="i in 5" :key="'yg'+i">
          <line :x1="toX(chartBounds.xMin)" :x2="toX(chartBounds.xMax)" :y1="toY(chartBounds.yMin + (chartBounds.yMax-chartBounds.yMin)*(i-1)/4)" :y2="toY(chartBounds.yMin + (chartBounds.yMax-chartBounds.yMin)*(i-1)/4)" stroke="rgba(255,255,255,0.08)" stroke-width="1"/>
          <text :x="pad.l-4" :y="toY(chartBounds.yMin + (chartBounds.yMax-chartBounds.yMin)*(i-1)/4)+3" fill="rgba(255,255,255,0.3)" font-size="9" text-anchor="end">{{ (chartBounds.yMin + (chartBounds.yMax-chartBounds.yMin)*(i-1)/4).toFixed(1) }}</text>
        </template>
        <line :x1="toX(chartBounds.xMin)" :y1="toY(chartBounds.yMin)" :x2="toX(chartBounds.xMax)" :y2="toY(chartBounds.yMin)" stroke="rgba(255,255,255,0.3)" stroke-width="1"/>
        <line :x1="toX(chartBounds.xMin)" :y1="toY(chartBounds.yMin)" :x2="toX(chartBounds.xMin)" :y2="toY(chartBounds.yMax)" stroke="rgba(255,255,255,0.3)" stroke-width="1"/>
        <path v-if="curvePts" :d="curvePts" fill="none" stroke="rgba(245,158,11,.4)" stroke-width="1.5" stroke-dasharray="4 2"/>
        <g v-for="(p,i) in chartPoints" :key="i">
          <circle :cx="toX(p.x)" :cy="toY(p.y)" r="4" fill="#22c55e"/>
          <title>{{ `V=${p.x.toFixed(2)}L, P=${p.y.toFixed(2)}atm` }}</title>
        </g>
      </svg>
      <div class="axis-labels">
        <span class="axis-x">V (L)</span>
        <span class="axis-y">P (atm)</span>
      </div>
    </div>
    <p v-else class="center">{{ t('experiments.needTwoTrials') }}</p>
  </div>
</template>
<style scoped>
.panel-body { padding:.45rem; display:flex; flex-direction:column; gap:.35rem; }
.center { text-align:center; color:#475569; font-size:.75rem; padding:.5rem; }
.chart-box { display:flex; flex-direction:column; gap:.3rem; }
.reg-chart { width:100%; height:160px; background:#0d1117; border-radius:5px; border:1px solid #2D3645; }
.axis-labels { display:flex; justify-content:space-between; font-size:.68rem; color:#8B95A5; }
.axis-x { direction:ltr; }
.axis-y { direction:ltr; }
</style>
