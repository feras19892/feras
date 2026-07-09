<script setup lang="ts">
import { computed } from 'vue'
import { useI18n } from '../../../../composables/useI18n'
import type { InterferenceTrial } from '../../../../composables/interference/useInterferenceTrials'
const { t } = useI18n()

interface Props {
  trials: InterferenceTrial[]
  regressionSlope: number
  regressionIntercept: number
  rSquared: number
  intensityPattern: { xMm: number; intensity: number }[]
}
const props = defineProps<Props>()

// Δy vs 1/d scatter for trials
const chartPoints = computed(() => props.trials
  .filter(t => t.fringeSpacing > 0)
  .map(t => ({ invD: 1 / t.slitDistance, deltaY: t.fringeSpacing })))

const chartBounds = computed(() => {
  const pts = chartPoints.value
  if (pts.length === 0) return { xMin: 0, xMax: 50, yMin: 0, yMax: 100 }
  const xs = pts.map(p => p.invD)
  const ys = pts.map(p => p.deltaY)
  const xMax = Math.max(...xs) * 1.05
  const yMax = Math.max(...ys) * 1.15
  return { xMin: 0, xMax, yMin: 0, yMax }
})

const svgW = 300, svgH = 200
const svgPad = { left: 44, right: 14, top: 14, bottom: 34 }
const plotW = svgW - svgPad.left - svgPad.right
const plotH = svgH - svgPad.top - svgPad.bottom

function toSvgX(val: number) {
  const b = chartBounds.value
  return svgPad.left + ((val - b.xMin) / (b.xMax - b.xMin)) * plotW
}
function toSvgY(val: number) {
  const b = chartBounds.value
  return svgH - svgPad.bottom - ((val - b.yMin) / (b.yMax - b.yMin)) * plotH
}
</script>

<template>
  <div class="panel-body">
    <!-- Δy vs 1/d Regression Chart -->
    <div v-if="chartPoints.length >= 2" class="chart-box">
      <svg :viewBox="`0 0 ${svgW} ${svgH}`" class="reg-chart">
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
        <line :x1="toSvgX(chartBounds.xMin)" :y1="toSvgY(chartBounds.yMin)" :x2="toSvgX(chartBounds.xMax)" :y2="toSvgY(chartBounds.yMin)" stroke="rgba(255,255,255,0.3)" stroke-width="1"/>
        <line :x1="toSvgX(chartBounds.xMin)" :y1="toSvgY(chartBounds.yMin)" :x2="toSvgX(chartBounds.xMin)" :y2="toSvgY(chartBounds.yMax)" stroke="rgba(255,255,255,0.3)" stroke-width="1"/>
        <text v-for="i in 5" :key="'xl' + i" :x="toSvgX(chartBounds.xMin + (chartBounds.xMax - chartBounds.xMin) * (i - 1) / 4)" :y="svgH - 8" fill="#8B95A5" font-size="8" text-anchor="middle">
          {{ (chartBounds.xMin + (chartBounds.xMax - chartBounds.xMin) * (i - 1) / 4).toFixed(1) }}
        </text>
        <text v-for="i in 5" :key="'yl' + i" :x="svgPad.left - 6" :y="toSvgY(chartBounds.yMin + (chartBounds.yMax - chartBounds.yMin) * (i - 1) / 4) + 3" fill="#8B95A5" font-size="8" text-anchor="end">
          {{ (chartBounds.yMin + (chartBounds.yMax - chartBounds.yMin) * (i - 1) / 4).toFixed(0) }}
        </text>
        <text :x="svgW / 2" :y="svgH - 2" fill="#8B95A5" font-size="9" text-anchor="middle">1/d (1/mm)</text>
        <text x="8" :y="svgH / 2" fill="#8B95A5" font-size="9" text-anchor="middle" transform="rotate(-90 8,${svgH / 2})">Δy (mm)</text>
        <g v-for="(p, i) in chartPoints" :key="i">
          <circle :cx="toSvgX(p.invD)" :cy="toSvgY(p.deltaY)" r="4" fill="#22c55e"/>
        </g>
        <line v-if="Number.isFinite(regressionSlope) && chartPoints.length >= 2"
              :x1="toSvgX(chartBounds.xMin)"
              :y1="toSvgY(regressionSlope * chartBounds.xMin + regressionIntercept)"
              :x2="toSvgX(chartBounds.xMax)"
              :y2="toSvgY(regressionSlope * chartBounds.xMax + regressionIntercept)"
              stroke="#fbbf24" stroke-width="1.5"/>
      </svg>
      <div class="reg-summary">
        <span class="reg-badge">Slope = {{ regressionSlope.toFixed(3) }}</span>
        <span class="reg-badge">R² = {{ rSquared.toFixed(4) }}</span>
      </div>
    </div>
    <!-- Fallback intensity pattern -->
    <div v-else-if="intensityPattern.length" class="mini-chart">
      <svg viewBox="0 0 100 40" preserveAspectRatio="none" class="chart-svg">
        <polyline
          :points="intensityPattern.map((p, i) => `${(i / (intensityPattern.length - 1)) * 100},${40 - p.intensity * 35}`).join(' ')"
          fill="none" stroke="#5B8DB8" stroke-width="0.5"
        />
      </svg>
    </div>
    <p v-else class="empty">{{ t('experiments.noData') }}</p>
  </div>
</template>

<style scoped>
.panel-body { font-size: .8rem; }
.chart-box { display: flex; flex-direction: column; gap: .3rem; }
.reg-chart { width: 100%; height: 180px; background: #0d1117; border-radius: 5px; border: 1px solid #2D3645; }
.reg-summary { display: flex; gap: .4rem; flex-wrap: wrap; }
.reg-badge { background: #1a2332; border: 1px solid #2D3645; border-radius: 5px; padding: .2rem .4rem; font-size: .72rem; color: #5B8DB8; font-family: monospace; }
.mini-chart { height: 100px; background: #0d1117; border-radius: 5px; border: 1px solid #2D3645; padding: .3rem; }
.chart-svg { width: 100%; height: 100%; }
.empty { color: #64748b; text-align: center; padding: 1rem; }
</style>
