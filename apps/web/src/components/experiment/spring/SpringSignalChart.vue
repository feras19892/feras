<script setup lang="ts">
import { ref, watch, onMounted, onUnmounted } from 'vue'

interface SignalPoint { t: number; x: number }

const props = defineProps<{
  series: SignalPoint[]
  params: { mass: number; k: number; amplitude: number }
  simT: number
}>()

const chartRef = ref<HTMLCanvasElement | null>(null)
const wrapRef = ref<HTMLDivElement | null>(null)

function resizeCanvas() {
  const canvas = chartRef.value
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
  const canvas = chartRef.value
  if (!canvas) return
  resizeCanvas()
  const ctx = canvas.getContext('2d')
  if (!ctx) return
  const w = canvas.width, h = canvas.height

  ctx.clearRect(0, 0, w, h)
  ctx.fillStyle = '#fffef7'
  ctx.fillRect(0, 0, w, h)

  const padL = 44, padR = 10, padT = 28, padB = 34
  const W = w - padL - padR, H = h - padT - padB
  const midY = padT + H / 2

  const series = props.series
  if (!series.length) {
    ctx.fillStyle = '#64748b'; ctx.font = '14px Segoe UI'; ctx.textAlign = 'center'
    ctx.fillText('الإشارة تظهر هنا بعد بدء المحاكاة', w / 2, h / 2)
    ctx.textAlign = 'start'; return
  }

  const omega = props.params.mass > 0 ? Math.sqrt(props.params.k / props.params.mass) : 1
  const period = (2 * Math.PI) / omega
  const windowSec = Math.min(10, Math.max(0.5, 3 * period))
  const tNow = props.simT
  const tStart = Math.max(0, tNow - windowSec)
  const tEnd = tNow
  if (tEnd <= tStart + 1e-9) return

  const visible = series.filter(p => p.t >= tStart && p.t <= tEnd)
  const maxAbsX = visible.length > 0 ? Math.max(0.001, ...visible.map(p => Math.abs(p.x))) : Math.max(0.001, props.params.amplitude)
  const yScale = (H * 0.40) / maxAbsX

  // Grid
  ctx.strokeStyle = 'rgba(148,163,184,0.15)'; ctx.lineWidth = 1
  for (let i = 0; i <= 4; i++) { const y = padT + (i / 4) * H; ctx.beginPath(); ctx.moveTo(padL, y); ctx.lineTo(w - padR, y); ctx.stroke() }
  for (let i = 0; i <= 5; i++) { const x = padL + (i / 5) * W; ctx.beginPath(); ctx.moveTo(x, padT); ctx.lineTo(x, h - padB); ctx.stroke() }

  // Center line
  ctx.strokeStyle = 'rgba(148,163,184,0.4)'; ctx.setLineDash([6, 4])
  ctx.beginPath(); ctx.moveTo(padL, midY); ctx.lineTo(w - padR, midY); ctx.stroke(); ctx.setLineDash([])

  // Axes
  ctx.strokeStyle = '#64748b'; ctx.lineWidth = 1.5
  ctx.beginPath(); ctx.moveTo(padL, padT); ctx.lineTo(padL, h - padB); ctx.lineTo(w - padR, h - padB); ctx.stroke()

  // X labels
  ctx.fillStyle = '#475569'; ctx.font = '9px Segoe UI'; ctx.textAlign = 'center'
  for (let i = 0; i <= 5; i++) {
    const tVal = tStart + (i / 5) * (tEnd - tStart)
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
    const frac = (i / 4) * 2 - 1
    const xVal = frac * maxAbsX
    const py = midY - frac * maxAbsX * yScale
    ctx.fillStyle = '#475569'; ctx.font = '9px Segoe UI'
    ctx.fillText(xVal.toFixed(3), padL - 6, py + 4)
    ctx.strokeStyle = '#64748b'; ctx.lineWidth = 1
    ctx.beginPath(); ctx.moveTo(padL - 4, py); ctx.lineTo(padL, py); ctx.stroke()
  }
  ctx.save(); ctx.translate(16, midY); ctx.rotate(-Math.PI / 2)
  ctx.fillStyle = '#475569'; ctx.font = 'bold 10px Segoe UI'; ctx.textAlign = 'center'
  ctx.fillText('x (m)', 0, 0); ctx.restore()

  // Signal line
  if (visible.length >= 2) {
    ctx.strokeStyle = '#dc2626'; ctx.lineWidth = 2; ctx.beginPath()
    visible.forEach((p, i) => {
      const tNorm = (p.t - tStart) / (tEnd - tStart)
      const px = padL + tNorm * W
      const py = midY - p.x * yScale
      if (i === 0) ctx.moveTo(px, py); else ctx.lineTo(px, py)
    })
    ctx.stroke()
  }

  // Title
  ctx.fillStyle = '#475569'; ctx.font = 'bold 11px Segoe UI'; ctx.textAlign = 'left'
  ctx.fillText('x(t)', padL, padT - 10)
}

watch(() => [props.series, props.simT, props.params.mass, props.params.k], draw, { flush: 'post' })

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
    <canvas ref="chartRef" />
  </div>
</template>

<style scoped>
.chart-wrap { flex: 1; min-height: 0; position: relative; }
.chart-wrap canvas { position: absolute; inset: 0; width: 100%; height: 100%; background: #fffef7; border-radius: 8px; border: 1px solid #2D3645; }
</style>
