<script setup lang="ts">
import { ref, watch, onMounted, onUnmounted } from 'vue'

import type { FreeFallTrial } from '../../../composables/freefall/useFreeFallTrials'

const props = defineProps<{ trials: FreeFallTrial[] }>()
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

  if (props.trials.length < 2) {
    ctx.fillStyle = '#64748b'; ctx.font = '13px Segoe UI'; ctx.textAlign = 'center'
    ctx.fillText('سجل قياستان على الأقل', W / 2, H / 2)
    ctx.textAlign = 'start'; return
  }

  const xs = props.trials.map(t => t.timeSquaredSec2)
  const ys = props.trials.map(t => t.heightMeters)
  const xMin = Math.min(...xs), xMax = Math.max(...xs)
  const yMin = Math.min(...ys), yMax = Math.max(...ys)
  const xSpan = Math.max(1e-9, xMax - xMin), ySpan = Math.max(1e-9, yMax - yMin)

  const padL = 52, padR = 16, padT = 18, padB = 36
  const iW = W - padL - padR, iH = H - padT - padB

  // axes
  ctx.strokeStyle = '#94a3b8'; ctx.lineWidth = 1
  ctx.beginPath(); ctx.moveTo(padL, padT); ctx.lineTo(padL, padT + iH); ctx.lineTo(padL + iW, padT + iH); ctx.stroke()

  // points
  ctx.fillStyle = '#2563eb'
  for (let i = 0; i < xs.length; i++) {
    const px = padL + ((xs[i] - xMin) / xSpan) * iW
    const py = padT + iH - ((ys[i] - yMin) / ySpan) * iH
    ctx.beginPath(); ctx.arc(px, py, 3, 0, 2 * Math.PI); ctx.fill()
  }

  // regression line
  const n = xs.length
  const sx = xs.reduce((a, b) => a + b, 0)
  const sy = ys.reduce((a, b) => a + b, 0)
  const sxx = xs.reduce((a, x) => a + x * x, 0)
  const sxy = xs.reduce((a, x, i) => a + x * ys[i], 0)
  const slope = (n * sxy - sx * sy) / (n * sxx - sx * sx)
  const intercept = (sy - slope * sx) / n

  ctx.strokeStyle = '#dc2626'; ctx.lineWidth = 2
  ctx.beginPath()
  const y0 = slope * xMin + intercept, y1 = slope * xMax + intercept
  ctx.moveTo(padL, padT + iH - ((y0 - yMin) / ySpan) * iH)
  ctx.lineTo(padL + iW, padT + iH - ((y1 - yMin) / ySpan) * iH)
  ctx.stroke()

  // labels
  ctx.fillStyle = '#475569'; ctx.font = '11px Segoe UI'; ctx.textAlign = 'center'
  ctx.fillText('t² (s²)', padL + iW / 2, H - 4)
  ctx.save(); ctx.translate(12, padT + iH / 2); ctx.rotate(-Math.PI / 2)
  ctx.fillText('h (m)', 0, 0); ctx.restore()
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
