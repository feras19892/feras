<script setup lang="ts">
import { ref, watch, onMounted, onUnmounted } from 'vue'
import type { FreeFallParams } from '../../../modules/physics/experiments/freefall/useFreeFallPhysics'
import type { FreeFallState } from '../../../modules/physics/experiments/freefall/useFreeFallPhysics'

const props = defineProps<{
  params: FreeFallParams
  simState: FreeFallState
}>()

const canvasRef = ref<HTMLCanvasElement | null>(null)
let cssW = 400, cssH = 400

function draw() {
  const c = canvasRef.value
  if (!c) return
  const ctx = c.getContext('2d')
  if (!ctx) return
  const w = cssW, h = cssH

  // Gradient background
  const bgGrad = ctx.createLinearGradient(0, 0, 0, h)
  bgGrad.addColorStop(0, '#0c1220')
  bgGrad.addColorStop(1, '#151e32')
  ctx.fillStyle = bgGrad
  ctx.fillRect(0, 0, w, h)

  // Scale based on params.h so ball starts at top and falls to bottom
  const magnetBottom = 22
  const groundY = h - 24
  const scale = (groundY - magnetBottom) / props.params.h
  const leftX = w * 0.4

  // Vertical rod / column
  ctx.fillStyle = '#2a3a52'
  ctx.fillRect(leftX - 3, magnetBottom, 6, groundY - magnetBottom)
  // Rod highlight
  ctx.fillStyle = '#3d5470'
  ctx.fillRect(leftX - 1, magnetBottom, 2, groundY - magnetBottom)

  // Electromagnet with metallic glow
  const magGrad = ctx.createLinearGradient(leftX - 18, 0, leftX + 18, 0)
  magGrad.addColorStop(0, '#1a365d')
  magGrad.addColorStop(0.3, '#5B8DB8')
  magGrad.addColorStop(0.7, '#5B8DB8')
  magGrad.addColorStop(1, '#1a365d')
  ctx.fillStyle = magGrad
  ctx.fillRect(leftX - 18, 6, 36, 14)
  // Magnet glow
  ctx.shadowColor = 'rgba(91,141,184,0.4)'
  ctx.shadowBlur = 12
  ctx.strokeStyle = '#8bb8d8'
  ctx.lineWidth = 1
  ctx.strokeRect(leftX - 18, 6, 36, 14)
  ctx.shadowBlur = 0
  // Magnet coils detail
  ctx.strokeStyle = 'rgba(26,54,93,0.6)'
  ctx.lineWidth = 1
  for (let i = -14; i < 16; i += 4) {
    ctx.beginPath()
    ctx.moveTo(leftX + i, 6)
    ctx.lineTo(leftX + i, 20)
    ctx.stroke()
  }

  // Height ruler with ticks
  ctx.strokeStyle = 'rgba(148,163,184,0.25)'
  ctx.lineWidth = 1.5
  ctx.beginPath()
  ctx.moveTo(leftX + 24, groundY)
  ctx.lineTo(leftX + 24, magnetBottom)
  ctx.stroke()
  // Ruler ticks
  const rulerH = groundY - magnetBottom
  const tickCount = 5
  ctx.fillStyle = 'rgba(148,163,184,0.4)'
  ctx.font = '9px monospace'
  ctx.textAlign = 'left'
  for (let i = 0; i <= tickCount; i++) {
    const ty = groundY - (i / tickCount) * rulerH
    ctx.strokeStyle = 'rgba(148,163,184,0.3)'
    ctx.lineWidth = 1
    ctx.beginPath()
    ctx.moveTo(leftX + 24, ty)
    ctx.lineTo(leftX + 32, ty)
    ctx.stroke()
  }

  // Ball shadow on ground (grows as ball falls)
  const ballY = groundY - props.simState.y * scale
  const fallProgress = 1 - (ballY - magnetBottom) / (groundY - magnetBottom)
  if (fallProgress > 0) {
    const shadowAlpha = Math.min(0.35, fallProgress * 0.4)
    const shadowW = 6 + fallProgress * 10
    const shadowH = 2 + fallProgress * 3
    ctx.fillStyle = `rgba(0,0,0,${shadowAlpha})`
    ctx.beginPath()
    ctx.ellipse(leftX, groundY + 3, shadowW, shadowH, 0, 0, Math.PI * 2)
    ctx.fill()
  }

  // 3D Ball with radial gradient
  const ballGrad = ctx.createRadialGradient(leftX - 3, ballY - 3, 1, leftX, ballY, 10)
  ballGrad.addColorStop(0, '#fdba74')
  ballGrad.addColorStop(0.4, '#f97316')
  ballGrad.addColorStop(1, '#9a3412')
  ctx.fillStyle = ballGrad
  ctx.beginPath()
  ctx.arc(leftX, ballY, 10, 0, Math.PI * 2)
  ctx.fill()
  // Ball outer glow
  ctx.shadowColor = 'rgba(249,115,22,0.3)'
  ctx.shadowBlur = 8
  ctx.strokeStyle = '#c2410c'
  ctx.lineWidth = 1.5
  ctx.beginPath()
  ctx.arc(leftX, ballY, 10, 0, Math.PI * 2)
  ctx.stroke()
  ctx.shadowBlur = 0
  // Highlight dot
  ctx.fillStyle = 'rgba(255,255,255,0.5)'
  ctx.beginPath()
  ctx.arc(leftX - 3, ballY - 3, 3, 0, Math.PI * 2)
  ctx.fill()

  // Metallic ground pad
  const floorGrad = ctx.createLinearGradient(0, groundY, 0, groundY + 10)
  floorGrad.addColorStop(0, '#334155')
  floorGrad.addColorStop(0.5, '#475569')
  floorGrad.addColorStop(1, '#1e293b')
  ctx.fillStyle = floorGrad
  ctx.fillRect(leftX - 45, groundY, 90, 10)
  // Floor edge highlight
  ctx.fillStyle = 'rgba(148,163,184,0.3)'
  ctx.fillRect(leftX - 45, groundY, 90, 1)
  // Floor grid pattern
  ctx.strokeStyle = 'rgba(148,163,184,0.1)'
  ctx.lineWidth = 1
  for (let i = -40; i < 45; i += 8) {
    ctx.beginPath()
    ctx.moveTo(leftX + i, groundY)
    ctx.lineTo(leftX + i + 4, groundY + 10)
    ctx.stroke()
  }

  // Electronic digital clock display
  const clockW = 140
  const clockH = 42
  const clockX = w - clockW - 14
  const clockY = groundY - clockH - 10

  // Clock bezel
  ctx.fillStyle = '#1a2332'
  ctx.strokeStyle = '#2d3e52'
  ctx.lineWidth = 2
  roundRect(ctx, clockX, clockY, clockW, clockH, 6)
  ctx.fill()
  ctx.stroke()

  // Clock inner screen (LCD dark)
  ctx.fillStyle = '#0d1520'
  roundRect(ctx, clockX + 4, clockY + 4, clockW - 8, clockH - 8, 4)
  ctx.fill()

  // LCD grid dots (subtle)
  ctx.fillStyle = 'rgba(91,141,184,0.06)'
  for (let gx = clockX + 8; gx < clockX + clockW - 8; gx += 3) {
    for (let gy = clockY + 8; gy < clockY + clockH - 8; gy += 3) {
      ctx.fillRect(gx, gy, 1, 1)
    }
  }

  // Time value
  const timeStr = props.simState.t.toFixed(3)
  ctx.font = 'bold 18px monospace'
  ctx.textAlign = 'center'
  ctx.textBaseline = 'middle'
  // Glow shadow
  ctx.shadowColor = '#5B8DB8'
  ctx.shadowBlur = 10
  ctx.fillStyle = '#5B8DB8'
  ctx.fillText(timeStr, clockX + clockW / 2, clockY + clockH / 2 - 2)
  ctx.shadowBlur = 0

  // Unit label
  ctx.font = '9px sans-serif'
  ctx.fillStyle = 'rgba(91,141,184,0.5)'
  ctx.fillText('t (s)', clockX + clockW / 2, clockY + clockH - 6)

  // Running indicator LED
  const ledX = clockX + 12
  const ledY = clockY + 10
  ctx.beginPath()
  ctx.arc(ledX, ledY, 3, 0, Math.PI * 2)
  if (props.simState.running && !props.simState.paused) {
    ctx.fillStyle = '#22c55e'
    ctx.shadowColor = '#22c55e'
    ctx.shadowBlur = 6
  } else if (props.simState.paused) {
    ctx.fillStyle = '#fbbf24'
    ctx.shadowColor = '#fbbf24'
    ctx.shadowBlur = 4
  } else {
    ctx.fillStyle = '#475569'
    ctx.shadowBlur = 0
  }
  ctx.fill()
  ctx.shadowBlur = 0

  // LED label
  ctx.font = '7px sans-serif'
  ctx.fillStyle = 'rgba(148,163,184,0.5)'
  ctx.textAlign = 'left'
  ctx.fillText('REC', ledX + 6, ledY + 2)
}

function roundRect(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number) {
  ctx.beginPath()
  ctx.moveTo(x + r, y)
  ctx.arcTo(x + w, y, x + w, y + h, r)
  ctx.arcTo(x + w, y + h, x, y + h, r)
  ctx.arcTo(x, y + h, x, y, r)
  ctx.arcTo(x, y, x + w, y, r)
  ctx.closePath()
}

function resizeCanvas() {
  const canvas = canvasRef.value
  if (!canvas) return
  const rect = canvas.getBoundingClientRect()
  const dpr = window.devicePixelRatio || 1
  cssW = Math.max(rect.width, 100); cssH = Math.max(rect.height, 100)
  canvas.width = cssW * dpr; canvas.height = cssH * dpr
  canvas.style.width = cssW + 'px'; canvas.style.height = cssH + 'px'
  const ctx = canvas.getContext('2d'); if (ctx) ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
  draw()
}

let resizeObs: ResizeObserver | null = null

watch(() => [props.simState.t, props.simState.y, props.simState.vy, props.params.h], draw, { immediate: true })

function captureSnapshot() {
  return canvasRef.value?.toDataURL('image/png')
}

defineExpose({ captureSnapshot })

onMounted(() => {
  resizeCanvas()
  resizeObs = new ResizeObserver(() => resizeCanvas())
  if (canvasRef.value) resizeObs.observe(canvasRef.value)
})

onUnmounted(() => {
  resizeObs?.disconnect()
  resizeObs = null
})
</script>

<template>
  <canvas ref="canvasRef" width="480" height="360" style="width:100%;height:100%;background:#0b0f15;border-radius:10px;border:1px solid #1e293b;" />
</template>
