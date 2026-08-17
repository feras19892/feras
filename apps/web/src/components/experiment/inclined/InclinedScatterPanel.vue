<script setup lang="ts">
import { useI18n } from '../../../composables/useI18n'
import { computed, ref, watch, onMounted, onUnmounted } from 'vue'
import type { InclinedTrial } from '../../../composables/inclined/useInclinedTrials'
import { linearRegression } from '../spring/linearRegression'

const { t } = useI18n()
const props = defineProps<{
  trials: InclinedTrial[]
}>()

const canvasRef = ref<HTMLCanvasElement | null>(null)
const wrapRef = ref<HTMLDivElement | null>(null)

// Focus on smooth-surface trials (mu ≈ 0) for the a = g·sinθ linear relation
const validTrials = computed(() => props.trials.filter(tr => tr.mu < 0.05))

const xs = computed(() => validTrials.value.map(tr => Math.sin(tr.thetaDeg * Math.PI / 180)))
const ys = computed(() => validTrials.value.map(tr => tr.acceleration))
const fit = computed(() => linearRegression(xs.value, ys.value))

function resizeCanvas() {
  const canvas = canvasRef.value
  const wrap = wrapRef.value
  if (!canvas || !wrap) return
  const w = wrap.clientWidth
  const h = wrap.clientHeight
  if (canvas.width !== w || canvas.height !== h) {
    canvas.width = w
    canvas.height = h
  }
}

function draw() {
  const canvas = canvasRef.value
  if (!canvas) return
  resizeCanvas()
  const ctx = canvas.getContext('2d')
  if (!ctx) return
  const W = canvas.width, H = canvas.height
  ctx.clearRect(0, 0, W, H)
  ctx.fillStyle = '#fffef7'
  ctx.fillRect(0, 0, W, H)

  if (validTrials.value.length < 2) {
    ctx.fillStyle = '#64748b'; ctx.font = '13px Segoe UI'; ctx.textAlign = 'center'
    ctx.fillText(t('experiments.recordAtLeastTwoSmooth'), W / 2, H / 2)
    ctx.textAlign = 'start'; return
  }

  const xMin = Math.min(...xs.value), xMax = Math.max(...xs.value)
  const yMin = Math.min(...ys.value), yMax = Math.max(...ys.value)
  const xSpan = Math.max(1e-9, xMax - xMin), ySpan = Math.max(1e-9, yMax - yMin)

  const padL = 52, padR = 16, padT = 18, padB = 36
  const iW = W - padL - padR, iH = H - padT - padB

  // Grid
  ctx.strokeStyle = 'rgba(148,163,184,0.15)'; ctx.lineWidth = 1
  ctx.fillStyle = '#94a3b8'; ctx.font = '9px sans-serif'; ctx.textAlign = 'center'; ctx.textBaseline = 'top'
  for (let i = 0; i <= 4; i++) {
    const t = i / 4
    const x = padL + iW * t
    const xVal = xMin + (xMax - xMin) * t
    ctx.beginPath(); ctx.moveTo(x, padT); ctx.lineTo(x, H - padB); ctx.stroke()
    ctx.fillText(xVal.toFixed(2), x, H - padB + 4)
  }
  ctx.textAlign = 'right'; ctx.textBaseline = 'middle'
  for (let i = 0; i <= 4; i++) {
    const t = i / 4
    const y = H - padB - iH * t
    const yVal = yMin + (yMax - yMin) * t
    ctx.beginPath(); ctx.moveTo(padL, y); ctx.lineTo(W - padR, y); ctx.stroke()
    ctx.fillText(yVal.toFixed(2), padL - 4, y)
  }

  // Regression line: a = slope·sinθ + intercept  (theory: a = g·sinθ)
  if (fit.value) {
    ctx.strokeStyle = '#f97316'; ctx.lineWidth = 2
    ctx.beginPath()
    for (let i = 0; i <= 80; i++) {
      const xFit = xMin + (xMax - xMin) * (i / 80)
      const yFit = fit.value.slope * xFit + fit.value.intercept
      const px = padL + ((xFit - xMin) / xSpan) * iW
      const py = padT + iH - ((yFit - yMin) / ySpan) * iH
      if (i === 0) ctx.moveTo(px, py)
      else ctx.lineTo(px, py)
    }
    ctx.stroke()
  }

  // Points
  ctx.fillStyle = '#3b82f6'
  for (let i = 0; i < xs.value.length; i++) {
    const px = padL + ((xs.value[i] - xMin) / xSpan) * iW
    const py = padT + iH - ((ys.value[i] - yMin) / ySpan) * iH
    ctx.beginPath(); ctx.arc(px, py, 4, 0, 2 * Math.PI); ctx.fill()
  }

  // Axes
  ctx.strokeStyle = '#64748b'; ctx.lineWidth = 1.5
  ctx.beginPath(); ctx.moveTo(padL, H - padB); ctx.lineTo(W - padR, H - padB); ctx.stroke()
  ctx.beginPath(); ctx.moveTo(padL, padT); ctx.lineTo(padL, H - padB); ctx.stroke()

  // Labels
  ctx.fillStyle = '#94a3b8'; ctx.font = 'bold 10px sans-serif'; ctx.textAlign = 'center'; ctx.textBaseline = 'top'
  ctx.fillText('sin(θ)', W / 2, H - 12)
  ctx.save(); ctx.translate(10, H / 2); ctx.rotate(-Math.PI / 2); ctx.textAlign = 'center'; ctx.fillText('a (m/s²)', 0, 0); ctx.restore()
}

watch(() => [props.trials.length], draw, { flush: 'post' })

let resizeObs: ResizeObserver | null = null
onMounted(() => {
  if (wrapRef.value) {
    resizeObs = new ResizeObserver(() => { resizeCanvas(); draw() })
    resizeObs.observe(wrapRef.value)
  }
  draw()
})
onUnmounted(() => { if (resizeObs) resizeObs.disconnect() })
</script>

<template>
  <div class="scatter-panel">
    <div class="card-header">
      <h4>&#x1F4C8; {{ t('experiments.scatterAccelerationVsSin') }}</h4>
    </div>
    <div class="chart-wrap" ref="wrapRef">
      <canvas ref="canvasRef" />
    </div>
    <div class="scatter-footer">
      <div v-if="fit" class="fit-readout">
        <span>slope = {{ fit.slope.toFixed(4) }}</span>
        <span>b = {{ fit.intercept.toFixed(4) }}</span>
        <span>R² = {{ fit.r2.toFixed(4) }}</span>
      </div>
      <div v-if="fit" class="g-calc">
        a = g·sin(θ) &nbsp;→&nbsp; <b>g = slope ≈ {{ fit.slope.toFixed(2) }} m/s²</b>
      </div>
      <div v-else-if="validTrials.length < 2" class="hint">
        {{ t('experiments.needTwoSmoothTrials') }}
      </div>
    </div>
  </div>
</template>

<style scoped>
.scatter-panel { background:#1E2530; border-radius:8px; padding:.6rem; border:1px solid #2D3645; display:flex; flex-direction:column; height:100%; }
.card-header { display:flex; justify-content:space-between; align-items:center; margin:0 0 .3rem; flex-wrap:wrap; gap:.3rem; }
.card-header h4 { margin:0; font-size:.82rem; color:#D1D7E0; font-weight:700; }
.chart-wrap { width: 100%; flex: 1; min-height: 0; position: relative; }
.chart-wrap canvas { position: absolute; inset: 0; width: 100%; height: 100%; background: #fffef7; border-radius: 8px; border: 1px solid #2D3645; }
.scatter-footer { display:flex; flex-direction:column; gap:.3rem; margin-top:.4rem; }
.fit-readout { display:flex; gap:.5rem; font-size:.72rem; font-family:monospace; color:#D1D7E0; flex-wrap:wrap; }
.fit-readout span { background:#252D3A; padding:.15rem .3rem; border-radius:4px; border:1px solid #2D3645; }
.g-calc { font-size:.75rem; color:#22c55e; background:rgba(34,197,94,.08); padding:.25rem .4rem; border-radius:4px; border:1px solid rgba(34,197,94,.2); }
.hint { font-size:.72rem; color:#f59e0b; }
</style>
