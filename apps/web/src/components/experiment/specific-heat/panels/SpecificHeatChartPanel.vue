<script setup lang="ts">
import { useI18n } from '@/composables/useI18n';
const { direction } = useI18n();
import { computed } from 'vue'
import type { SpecificHeatTrial } from '../../../../composables/specific-heat/useSpecificHeatTrials'


const props = defineProps<{
  trials: SpecificHeatTrial[]
  regressionSlope: number
  regressionIntercept: number
  rSquared: number
}>()

const chartPoints = computed(() => props.trials
  .filter(tr => tr.cExtracted > 0 && tr.finalTemp > tr.waterTemp)
  .map(tr => ({
    x: tr.waterMass * 1000, // m_w in grams
    y: tr.metalTemp - tr.finalTemp, // Tm - Tf
  })))

const chartBounds = computed(() => {
  const pts = chartPoints.value
  if (pts.length === 0) return { xMin: 100, xMax: 350, yMin: 0, yMax: 100 }
  const xs = pts.map(p => p.x), ys = pts.map(p => p.y)
  return { xMin: 100, xMax: Math.max(...xs, 300) * 1.15, yMin: 0, yMax: Math.max(...ys, 50) * 1.15 }
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
</script>
<template>
  <div class="panel-body">
    <div v-if="chartPoints.length >= 2" class="chart-box">
      <svg :viewBox="`0 0 ${svgW} ${svgH}`" class="reg-chart">
        <template v-for="i in 5" :key="'xg'+i">
          <line :x1="toX(chartBounds.xMin + (chartBounds.xMax-chartBounds.xMin)*(i-1)/4)" :y1="toY(chartBounds.yMin)" :y2="toY(chartBounds.yMax)" stroke="rgba(255,255,255,0.08)" stroke-width="1"/>
          <text :x="toX(chartBounds.xMin + (chartBounds.xMax-chartBounds.xMin)*(i-1)/4)" :y="svgH-8" fill="rgba(255,255,255,0.3)" font-size="9" text-anchor="middle">{{ Math.round(chartBounds.xMin + (chartBounds.xMax-chartBounds.xMin)*(i-1)/4) }}</text>
        </template>
        <template v-for="i in 5" :key="'yg'+i">
          <line :x1="toX(chartBounds.xMin)" :x2="toX(chartBounds.xMax)" :y1="toY(chartBounds.yMin + (chartBounds.yMax-chartBounds.yMin)*(i-1)/4)" :y2="toY(chartBounds.yMin + (chartBounds.yMax-chartBounds.yMin)*(i-1)/4)" stroke="rgba(255,255,255,0.08)" stroke-width="1"/>
          <text :x="pad.l-4" :y="toY(chartBounds.yMin + (chartBounds.yMax-chartBounds.yMin)*(i-1)/4)+3" fill="rgba(255,255,255,0.3)" font-size="9" text-anchor="end">{{ Math.round(chartBounds.yMin + (chartBounds.yMax-chartBounds.yMin)*(i-1)/4) }}</text>
        </template>
        <line :x1="toX(chartBounds.xMin)" :y1="toY(chartBounds.yMin)" :x2="toX(chartBounds.xMax)" :y2="toY(chartBounds.yMin)" stroke="rgba(255,255,255,0.3)" stroke-width="1"/>
        <line :x1="toX(chartBounds.xMin)" :y1="toY(chartBounds.yMin)" :x2="toX(chartBounds.xMin)" :y2="toY(chartBounds.yMax)" stroke="rgba(255,255,255,0.3)" stroke-width="1"/>
        <g v-for="(p,i) in chartPoints" :key="i">
          <circle :cx="toX(p.x)" :cy="toY(p.y)" r="4" fill="#22c55e"/>
          <title>{{ `m_w=${p.x.toFixed(0)}g, ΔT=${p.y.toFixed(1)}°C` }}</title>
        </g>
        <line v-if="Number.isFinite(regressionSlope) && chartPoints.length>=2"
              :x1="toX(chartBounds.xMin)" :y1="toY(regressionSlope*chartBounds.xMin+regressionIntercept)"
              :x2="toX(chartBounds.xMax)" :y2="toY(regressionSlope*chartBounds.xMax+regressionIntercept)"
              stroke="#fbbf24" stroke-width="1.5"/>
      </svg>
      <div class="reg-summary">
        <span class="reg-badge">Slope = {{ regressionSlope.toFixed(3) }}</span>
        <span class="reg-badge">R² = {{ rSquared.toFixed(4) }}</span>
      </div>
      <div class="axis-labels">
        <span class="axis-x">X: m_w (g)</span>
        <span class="axis-y">Y: T_m − T_f (°C)</span>
      </div>
    </div>
    <p v-else class="center">سجل تجربتين على الأقل لإظهار الرسم</p>
  </div>
</template>
<style scoped>
.panel-body { padding:.45rem; display:flex; flex-direction:column; gap:.35rem; }
.center { text-align:center; color:#475569; font-size:.75rem; padding:.5rem; }
.chart-box { display:flex; flex-direction:column; gap:.3rem; }
.reg-chart { width:100%; height:160px; background:#0d1117; border-radius:5px; border:1px solid #2D3645; }
.reg-summary { display:flex; gap:.4rem; flex-wrap:wrap; }
.reg-badge { background:#1a2332; border:1px solid #2D3645; border-radius:5px; padding:.2rem .4rem; font-size:.72rem; color:#5B8DB8; font-family:monospace; }
.axis-labels { display:flex; justify-content:space-between; font-size:.68rem; color:#8B95A5; }
.axis-x { direction:ltr; }
.axis-y { direction:ltr; }
</style>
