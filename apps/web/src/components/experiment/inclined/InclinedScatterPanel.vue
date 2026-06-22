<script setup lang="ts">
import { useI18n } from '../../../composables/useI18n'
import { ref, watch, onMounted, onUnmounted } from 'vue'
import type { InclinedTrial } from '../../../composables/inclined/useInclinedTrials'
import { calculateInclinedSummary } from '../../../composables/inclined/inclinedUtils'

const { t } = useI18n()
const props = defineProps<{
  trials: InclinedTrial[]
}>()

const canvasRef = ref<HTMLCanvasElement | null>(null)
const wrapRef = ref<HTMLDivElement | null>(null)

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

  if (props.trials.length < 1) {
    ctx.fillStyle = '#64748b'; ctx.font = '13px Segoe UI'; ctx.textAlign = 'center'
    ctx.fillText(t('experiments.recordAtLeastOne'), W / 2, H / 2)
    ctx.textAlign = 'start'; return
  }

  const ts = props.trials.map(t => t.timeOfArrival)
  const ss = props.trials.map(t => t.length)
  const tMin = 0, tMax = Math.max(...ts)
  const sMax = Math.max(...ss)
  const tSpan = Math.max(1e-9, tMax - tMin), sSpan = Math.max(1e-9, sMax)

  const padL = 52, padR = 16, padT = 18, padB = 36
  const iW = W - padL - padR, iH = H - padT - padB

  // axes
  ctx.strokeStyle = '#94a3b8'; ctx.lineWidth = 1
  ctx.beginPath(); ctx.moveTo(padL, padT); ctx.lineTo(padL, padT + iH); ctx.lineTo(padL + iW, padT + iH); ctx.stroke()

  // theoretical parabola: s = ½·a·t² (using first trial params)
  const first = props.trials[0]
  const summary = calculateInclinedSummary(first.thetaDeg, first.length, first.mass, 9.81, first.mu)
  const a = summary.acceleration
  ctx.strokeStyle = '#dc2626'; ctx.lineWidth = 2; ctx.beginPath()
  for (let i = 0; i <= 100; i++) {
    const t = (i / 100) * tMax
    const s = 0.5 * a * t * t
    const px = padL + (t / tSpan) * iW
    const py = padT + iH - (s / sSpan) * iH
    if (i === 0) ctx.moveTo(px, py); else ctx.lineTo(px, py)
  }
  ctx.stroke()

  // points
  ctx.fillStyle = '#2563eb'
  for (let i = 0; i < ts.length; i++) {
    const px = padL + ((ts[i] - tMin) / tSpan) * iW
    const py = padT + iH - ((ss[i] - 0) / sSpan) * iH
    ctx.beginPath(); ctx.arc(px, py, 3, 0, 2 * Math.PI); ctx.fill()
  }

  // labels
  ctx.fillStyle = '#475569'; ctx.font = '11px Segoe UI'; ctx.textAlign = 'center'
  ctx.fillText('t (s)', padL + iW / 2, H - 4)
  ctx.save(); ctx.translate(12, padT + iH / 2); ctx.rotate(-Math.PI / 2)
  ctx.fillText('s (m)', 0, 0); ctx.restore()
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
  <div class="chart-wrap" ref="wrapRef">
    <canvas ref="canvasRef" />
  </div>
</template>

<style scoped>
.chart-wrap { width: 100%; flex: 1; min-height: 0; position: relative; }
.chart-wrap canvas { position: absolute; inset: 0; width: 100%; height: 100%; background: #fffef7; border-radius: 8px; border: 1px solid #2D3645; }
</style>
