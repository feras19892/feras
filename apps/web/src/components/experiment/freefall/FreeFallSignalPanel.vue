<script setup lang="ts">
import { ref, watch, onMounted, onUnmounted } from 'vue'

const props = defineProps<{ simState: { t: number; y: number; vy: number } }>()
const canvasRef = ref<HTMLCanvasElement | null>(null)
const wrapRef = ref<HTMLDivElement | null>(null)

let points: { t: number; y: number; vy: number }[] = []

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
  const w = canvas.width, h = canvas.height

  if (props.simState.t === 0) points = []
  points.push({ t: props.simState.t, y: props.simState.y, vy: props.simState.vy })
  if (points.length > 300) points = points.slice(-300)

  ctx.clearRect(0, 0, w, h)
  ctx.fillStyle = '#fffef7'
  ctx.fillRect(0, 0, w, h)

  if (!points.length) {
    ctx.fillStyle = '#64748b'; ctx.font = '14px Segoe UI'; ctx.textAlign = 'center'
    ctx.fillText('الإشارة تظهر هنا بعد بدء السقوط', w / 2, h / 2)
    ctx.textAlign = 'start'; return
  }

  const padL = 44, padR = 10, padT = 28, padB = 34
  const W = w - padL - padR, H = h - padT - padB
  const groundY = padT + H

  const maxT = Math.max(...points.map(p => p.t)) || 1
  const maxY = Math.max(...points.map(p => p.y)) || 1

  // Grid
  ctx.strokeStyle = 'rgba(148,163,184,0.15)'; ctx.lineWidth = 1
  for (let i = 0; i <= 4; i++) { const y = padT + (i / 4) * H; ctx.beginPath(); ctx.moveTo(padL, y); ctx.lineTo(w - padR, y); ctx.stroke() }
  for (let i = 0; i <= 5; i++) { const x = padL + (i / 5) * W; ctx.beginPath(); ctx.moveTo(x, padT); ctx.lineTo(x, h - padB); ctx.stroke() }

  // Ground line
  ctx.strokeStyle = 'rgba(148,163,184,0.4)'; ctx.setLineDash([6, 4])
  ctx.beginPath(); ctx.moveTo(padL, groundY); ctx.lineTo(w - padR, groundY); ctx.stroke(); ctx.setLineDash([])

  // Axes
  ctx.strokeStyle = '#64748b'; ctx.lineWidth = 1.5
  ctx.beginPath(); ctx.moveTo(padL, padT); ctx.lineTo(padL, h - padB); ctx.lineTo(w - padR, h - padB); ctx.stroke()

  // X labels
  ctx.fillStyle = '#475569'; ctx.font = '9px Segoe UI'; ctx.textAlign = 'center'
  for (let i = 0; i <= 5; i++) {
    const tVal = (i / 5) * maxT
    const px = padL + (i / 5) * W
    ctx.fillText(tVal.toFixed(2), px, h - padB + 16)
    ctx.strokeStyle = '#64748b'; ctx.lineWidth = 1
    ctx.beginPath(); ctx.moveTo(px, h - padB); ctx.lineTo(px, h - padB + 4); ctx.stroke()
  }
  ctx.fillStyle = '#475569'; ctx.font = 'bold 10px Segoe UI'
  ctx.fillText('t (s)', padL + W / 2, h - 6)

  // Y labels
  ctx.textAlign = 'right'
  for (let i = 0; i <= 4; i++) {
    const frac = i / 4
    const yVal = frac * maxY
    const py = padT + H - frac * H
    ctx.fillStyle = '#475569'; ctx.font = '9px Segoe UI'
    ctx.fillText(yVal.toFixed(2), padL - 6, py + 4)
    ctx.strokeStyle = '#64748b'; ctx.lineWidth = 1
    ctx.beginPath(); ctx.moveTo(padL - 4, py); ctx.lineTo(padL, py); ctx.stroke()
  }
  ctx.save(); ctx.translate(16, padT + H / 2); ctx.rotate(-Math.PI / 2)
  ctx.fillStyle = '#475569'; ctx.font = 'bold 10px Segoe UI'; ctx.textAlign = 'center'
  ctx.fillText('y (m)', 0, 0); ctx.restore()

  // y(t) line
  ctx.strokeStyle = '#dc2626'; ctx.lineWidth = 2; ctx.beginPath()
  points.forEach((p, i) => {
    const px = padL + (p.t / maxT) * W
    const py = padT + H - (p.y / maxY) * H
    if (i === 0) ctx.moveTo(px, py); else ctx.lineTo(px, py)
  })
  ctx.stroke()

  // v(t) line
  ctx.strokeStyle = '#5B8DB8'; ctx.lineWidth = 1; ctx.beginPath()
  const maxVy = Math.max(...points.map(p => Math.abs(p.vy))) || 1
  points.forEach((p, i) => {
    const px = padL + (p.t / maxT) * W
    const py = padT + H / 2 - (p.vy / maxVy) * (H * 0.35)
    if (i === 0) ctx.moveTo(px, py); else ctx.lineTo(px, py)
  })
  ctx.stroke()
}

watch(() => [props.simState.t, props.simState.y, props.simState.vy], draw, { flush: 'post' })

let resizeObs: ResizeObserver | null = null
onMounted(() => {
  if (wrapRef.value) {
    resizeObs = new ResizeObserver(() => { resizeCanvas(); draw() })
    resizeObs.observe(wrapRef.value)
  }
  draw()
})
onUnmounted(() => { if (resizeObs) resizeObs.disconnect() })

defineExpose({ draw })
</script>

<template>
  <div class="chart-wrap" ref="wrapRef">
    <canvas ref="canvasRef" />
  </div>
</template>

<style scoped>
.chart-wrap { flex: 1; min-height: 0; position: relative; }
.chart-wrap canvas { position: absolute; inset: 0; width: 100%; height: 100%; background: #fffef7; border-radius: 8px; border: 1px solid #2D3645; }
</style>
