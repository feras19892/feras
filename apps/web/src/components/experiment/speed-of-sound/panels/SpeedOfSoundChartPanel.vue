<script setup lang="ts">
import { computed } from 'vue'
import { useI18n } from '../../../../composables/useI18n'
import type { SpeedOfSoundTrial } from '../../../../composables/speed-of-sound/useSpeedOfSoundTrials'
const { t } = useI18n()

interface Props {
  trials: SpeedOfSoundTrial[]
  regressionSlope: number
  regressionIntercept: number
  rSquared: number
  waveformData: { x: number; y: number }[]
}
const props = defineProps<Props>()

// L vs 1/f scatter plot points
const chartPoints = computed(() => props.trials
  .filter(tr => tr.frequency > 0)
  .map(tr => ({ invF: 1 / tr.frequency, L: tr.tubeLength })))

const chartBounds = computed(() => {
  const pts = chartPoints.value
  if (pts.length === 0) return { xMin: 0, xMax: 0.005, yMin: 0, yMax: 1.0 }
  const xs = pts.map(p => p.invF)
  const ys = pts.map(p => p.L)
  const xMin = 0
  const xMax = Math.max(...xs) * 1.1
  const yMin = 0
  const yMax = Math.max(...ys) * 1.15
  return { xMin, xMax, yMin, yMax }
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
    <!-- L vs 1/f Regression Chart -->
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
        <text v-for="i in 5" :key="'xl' + i" :x="toSvgX(chartBounds.xMin + (chartBounds.xMax - chartBounds.xMin) * (i - 1) / 4)" :y="svgH - 8" fill="#8B95A5" font-size="8" text-anchor="middle">
          {{ (chartBounds.xMin + (chartBounds.xMax - chartBounds.xMin) * (i - 1) / 4).toExponential(1) }}
        </text>
        <!-- Y labels -->
        <text v-for="i in 5" :key="'yl' + i" :x="svgPad.left - 6" :y="toSvgY(chartBounds.yMin + (chartBounds.yMax - chartBounds.yMin) * (i - 1) / 4) + 3" fill="#8B95A5" font-size="8" text-anchor="end">
          {{ (chartBounds.yMin + (chartBounds.yMax - chartBounds.yMin) * (i - 1) / 4).toFixed(2) }}
        </text>
        <!-- Axis titles -->
        <text :x="svgW / 2" :y="svgH - 2" fill="#8B95A5" font-size="9" text-anchor="middle">1/f (1/Hz)</text>
        <text x="8" :y="svgH / 2" fill="#8B95A5" font-size="9" text-anchor="middle" transform="rotate(-90 8,${svgH / 2})">L (m)</text>
        <!-- Points -->
        <g v-for="(p, i) in chartPoints" :key="i">
          <circle :cx="toSvgX(p.invF)" :cy="toSvgY(p.L)" r="4" fill="#22c55e"/>
        </g>
        <!-- Regression line: L = slope·(1/f) + intercept -->
        <line v-if="Number.isFinite(regressionSlope) && chartPoints.length >= 2"
              :x1="toSvgX(chartBounds.xMin)"
              :y1="toSvgY(regressionSlope * chartBounds.xMin + regressionIntercept)"
              :x2="toSvgX(chartBounds.xMax)"
              :y2="toSvgY(regressionSlope * chartBounds.xMax + regressionIntercept)"
              stroke="#fbbf24" stroke-width="1.5"/>
      </svg>
      <div class="reg-summary">
        <span class="reg-badge">Slope = {{ regressionSlope.toFixed(4) }}</span>
        <span class="reg-badge">R² = {{ rSquared.toFixed(4) }}</span>
      </div>
    </div>
    <!-- Fallback waveform -->
    <div v-else-if="waveformData.length" class="mini-chart">
      <svg viewBox="0 0 100 40" preserveAspectRatio="none" class="chart-svg">
        <polyline
          :points="waveformData.map((p, i) => `${(i / (waveformData.length - 1)) * 100},${20 - p.y / 3}`).join(' ')"
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
