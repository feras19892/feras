<script setup lang="ts">
import { ref, onMounted, onUnmounted, watch } from 'vue'
import { useI18n } from '../../../composables/useI18n'
const { t } = useI18n()

const props = defineProps<{
  B: number
  A: number
  theta: number
  running: boolean
  paused: boolean
}>()

const emit = defineEmits<{
  (e: 'probe-placed', flux: number, angle: number): void
}>()

// Polyfill for roundRect
if (typeof CanvasRenderingContext2D !== 'undefined' && !CanvasRenderingContext2D.prototype.roundRect) {
  CanvasRenderingContext2D.prototype.roundRect = function (x: number, y: number, w: number, h: number, r: number) {
    if (w < 2 * r) r = w / 2
    if (h < 2 * r) r = h / 2
    this.beginPath()
    this.moveTo(x + r, y)
    this.arcTo(x + w, y, x + w, y + h, r)
    this.arcTo(x + w, y + h, x, y + h, r)
    this.arcTo(x, y + h, x, y, r)
    this.arcTo(x, y, x + w, y, r)
    this.closePath()
    return this
  }
}

const canvasRef = ref<HTMLCanvasElement | null>(null)
let rafId = 0
let watchdogId = 0
let resizeObserver: ResizeObserver | null = null
let zoom = 1
let panX = 0
let panY = 0
let isPanning = false
let panStart = { x: 0, y: 0 }

// Smooth interpolated values
let targetB = 0.5, currentB = 0.5
let targetA = 0.01, currentA = 0.01
let targetTheta = 0, currentTheta = 0

// Auto-rotation angle (when running)
let autoTheta = 0

// Flux history for graph
let fluxHistory: number[] = []
const FLUX_HISTORY_LEN = 200

// Probe state
type ProbeState = 'idle' | 'dragging' | 'placed'
let probeState: ProbeState = 'idle'
let probePos = { x: 0, y: 0 }
let probeIconPos = { x: 0, y: 0 }
let probeMeasured = { flux: 0, angle: 0 }

function getCanvasPos(e: MouseEvent): { x: number; y: number } {
  const canvas = canvasRef.value!
  const rect = canvas.getBoundingClientRect()
  return { x: e.clientX - rect.left, y: e.clientY - rect.top }
}

function screenToWorld(sx: number, sy: number): { x: number; y: number } {
  const canvas = canvasRef.value!
  const w = canvas.width
  const h = canvas.height
  const tx = (sx - w / 2 - panX) / zoom + w / 2
  const ty = (sy - h / 2 - panY) / zoom + h / 2
  return { x: tx, y: ty }
}

function onWheel(e: WheelEvent) {
  e.preventDefault()
  const delta = e.deltaY > 0 ? 0.9 : 1.1
  zoom = Math.max(0.3, Math.min(5, zoom * delta))
  draw()
}

function onMouseDown(e: MouseEvent) {
  const pos = getCanvasPos(e)

  if (probeState === 'idle') {
    const dx = pos.x - probeIconPos.x
    const dy = pos.y - probeIconPos.y
    if (Math.abs(dx) < 25 && Math.abs(dy) < 25) {
      probeState = 'dragging'
      probePos = screenToWorld(pos.x, pos.y)
      draw()
      return
    }
  }

  if (probeState === 'placed') {
    const canvas = canvasRef.value!
    const sx = (probePos.x - canvas.width / 2) * zoom + canvas.width / 2 + panX
    const sy = (probePos.y - canvas.height / 2) * zoom + canvas.height / 2 + panY
    const dx = pos.x - sx
    const dy = pos.y - sy
    if (Math.abs(dx) < 18 && Math.abs(dy) < 18) {
      probeState = 'dragging'
      draw()
      return
    }
  }

  isPanning = true
  panStart = { x: e.clientX - panX, y: e.clientY - panY }
}

function onMouseMove(e: MouseEvent) {
  if (probeState === 'dragging') {
    const pos = getCanvasPos(e)
    probePos = screenToWorld(pos.x, pos.y)
    draw()
    return
  }
  if (!isPanning) return
  panX = e.clientX - panStart.x
  panY = e.clientY - panStart.y
  draw()
}

function onMouseUp() {
  if (probeState === 'dragging') {
    probeState = 'placed'
    const angle = props.running ? autoTheta : currentTheta
    const flux = currentB * currentA * Math.cos(angle)
    probeMeasured = { flux, angle }
    emit('probe-placed', flux, angle)
    draw()
  }
  isPanning = false
}

function onDoubleClick() {
  zoom = 1
  panX = 0
  panY = 0
  draw()
}

function getEffectiveTheta(): number {
  return props.running ? autoTheta : currentTheta
}

function drawArrow(ctx: CanvasRenderingContext2D, x: number, y: number, angle: number, color: string, size = 8) {
  ctx.fillStyle = color
  ctx.save()
  ctx.translate(x, y)
  ctx.rotate(angle)
  ctx.beginPath()
  ctx.moveTo(size, 0)
  ctx.lineTo(-size * 0.6, -size * 0.5)
  ctx.lineTo(-size * 0.3, 0)
  ctx.lineTo(-size * 0.6, size * 0.5)
  ctx.closePath()
  ctx.fill()
  ctx.restore()
}

let fluxMaxCached = 0
function fluxMaxDisplay(): number {
  return fluxMaxCached
}

function draw() {
  const canvas = canvasRef.value
  if (!canvas) return
  const ctx = canvas.getContext('2d')
  if (!ctx) return
  if (canvas.width === 0 || canvas.height === 0) return

  const w = canvas.width
  const h = canvas.height
  const cx = w / 2
  const cy = h / 2 - 40

  const scale = Math.min(w, h) / 600
  const theta = getEffectiveTheta()
  const flux = currentB * currentA * Math.cos(theta)

  // Background
  ctx.fillStyle = '#0b1220'
  ctx.fillRect(0, 0, w, h)

  ctx.save()
  ctx.translate(w / 2 + panX, h / 2 + panY)
  ctx.scale(zoom, zoom)
  ctx.translate(-w / 2, -h / 2)

  // ── Layer 1: Magnetic field lines (horizontal, left to right) ──
  if (currentB > 0.01) {
    const fieldAlpha = Math.min(0.5, currentB * 0.35)
    ctx.strokeStyle = `rgba(59,130,246,${fieldAlpha})`
    ctx.lineWidth = 1.5
    const numLines = 9
    const fieldSpread = 250 * scale
    for (let l = 0; l < numLines; l++) {
      const yOffset = (l - (numLines - 1) / 2) * (fieldSpread / numLines)
      const y = cy + yOffset
      ctx.beginPath()
      ctx.moveTo(40, y)
      ctx.lineTo(w - 40, y)
      ctx.stroke()
      // Arrows
      if (l % 2 === 0) {
        const ax = cx
        ctx.fillStyle = `rgba(59,130,246,${fieldAlpha * 1.5})`
        ctx.beginPath()
        ctx.moveTo(ax + 5, y - 3)
        ctx.lineTo(ax + 5, y + 3)
        ctx.lineTo(ax + 10, y)
        ctx.closePath()
        ctx.fill()
      }
    }
  }

  // ── Layer 2: Coil (rotating, seen from side) ──
  // The coil is a circle/ellipse. When tilted at angle theta, it appears as an ellipse
  // with minor axis = coilR * |cos(theta)| (foreshortening)
  const coilR = Math.max(15, Math.sqrt(Math.max(currentA, 1e-6) / Math.PI) * 1200 * scale)
  const minorAxis = coilR * Math.abs(Math.cos(theta))
  const isFront = Math.cos(theta) >= 0

  // Coil fill (semi-transparent to show field lines through it)
  ctx.fillStyle = `rgba(200,137,90,${0.08 + 0.15 * Math.abs(Math.cos(theta))})`
  ctx.strokeStyle = isFront ? '#D49A6E' : 'rgba(200,137,90,0.5)'
  ctx.lineWidth = 3
  ctx.beginPath()
  ctx.ellipse(cx, cy, coilR, Math.max(2, minorAxis), 0, 0, Math.PI * 2)
  ctx.fill()
  ctx.stroke()

  // Multi-turn winding lines (horizontal lines across the ellipse)
  const numTurnsVis = 6
  for (let n = 0; n < numTurnsVis; n++) {
    const t = n / Math.max(1, numTurnsVis - 1)
    const yOffset = (t - 0.5) * minorAxis * 1.8
    const y = cy + yOffset
    const halfW = coilR * Math.sqrt(Math.max(0, 1 - (yOffset / minorAxis) ** 2))
    ctx.strokeStyle = `rgba(200,137,90,${0.2 + Math.abs(t - 0.5) * 0.3})`
    ctx.lineWidth = 1.5
    ctx.beginPath()
    ctx.moveTo(cx - halfW, y)
    ctx.lineTo(cx + halfW, y)
    ctx.stroke()
  }

  // ── Layer 3: Normal vector to coil plane ──
  // The normal vector rotates with the coil. At theta=0, it's vertical (perpendicular to field).
  // Actually: theta is the angle between B (horizontal) and the normal.
  // So normal direction = theta from horizontal.
  const normalLen = coilR + 30 * scale
  const normalAngle = theta // angle from horizontal (B direction)
  const nx = cx + normalLen * Math.cos(normalAngle)
  const ny = cy - normalLen * Math.sin(normalAngle)
  ctx.strokeStyle = '#22c55e'
  ctx.lineWidth = 2
  ctx.setLineDash([])
  ctx.beginPath()
  ctx.moveTo(cx, cy)
  ctx.lineTo(nx, ny)
  ctx.stroke()
  drawArrow(ctx, nx, ny, normalAngle, '#22c55e', 7)
  ctx.fillStyle = '#22c55e'
  ctx.font = `bold ${10 * scale}px sans-serif`
  ctx.textAlign = 'center'
  ctx.fillText('n', nx + 12, ny - 5)

  // ── Layer 4: B vector (horizontal arrow) ──
  const bLen = 60 * scale * currentB
  ctx.strokeStyle = '#3b82f6'
  ctx.lineWidth = 2
  ctx.beginPath()
  ctx.moveTo(cx, cy)
  ctx.lineTo(cx + bLen, cy)
  ctx.stroke()
  drawArrow(ctx, cx + bLen, cy, 0, '#3b82f6', 8)
  ctx.fillStyle = '#3b82f6'
  ctx.font = `bold ${10 * scale}px sans-serif`
  ctx.textAlign = 'center'
  ctx.fillText('B', cx + bLen + 12, cy - 5)

  // ── Layer 5: Angle arc between B and n ──
  if (Math.abs(theta) > 0.05) {
    ctx.strokeStyle = '#f59e0b'
    ctx.lineWidth = 1.5
    ctx.beginPath()
    const arcR = 30 * scale
    ctx.arc(cx, cy, arcR, 0, -normalAngle, normalAngle < 0)
    ctx.stroke()
    ctx.fillStyle = '#f59e0b'
    ctx.font = `bold ${9 * scale}px sans-serif`
    ctx.textAlign = 'center'
    const midAngle = -normalAngle / 2
    ctx.fillText('θ', cx + (arcR + 10) * Math.cos(midAngle), cy + (arcR + 10) * Math.sin(midAngle) - 3)
  }

  // ── Layer 6: Labels (screen space — fixed, not affected by zoom/pan) ──
  ctx.restore()

  // Background panel for labels
  ctx.fillStyle = 'rgba(15,22,40,0.85)'
  ctx.strokeStyle = 'rgba(100,116,139,0.2)'
  ctx.lineWidth = 1
  ctx.beginPath()
  ctx.roundRect(8, 8, 175, 115, 8)
  ctx.fill()
  ctx.stroke()

  ctx.fillStyle = '#3b82f6'
  ctx.font = 'bold 13px monospace'
  ctx.textAlign = 'left'
  ctx.fillText(`B = ${currentB.toFixed(2)} T`, 16, 30)
  ctx.fillStyle = '#a855f7'
  ctx.fillText(`A = ${(currentA * 10000).toFixed(0)} cm²`, 16, 50)
  ctx.fillStyle = '#f59e0b'
  const thetaDisp = theta % (2 * Math.PI)
  ctx.fillText(`θ = ${(thetaDisp * 180 / Math.PI).toFixed(1)}°`, 16, 70)
  ctx.fillStyle = '#22c55e'
  ctx.fillText(`cos θ = ${Math.cos(theta).toFixed(3)}`, 16, 90)
  ctx.fillStyle = '#ef4444'
  ctx.font = 'bold 14px monospace'
  ctx.fillText(`Φ = ${flux.toExponential(3)} Wb`, 16, 112)

  // Status indicator
  ctx.textAlign = 'right'
  if (props.running && !props.paused) {
    ctx.fillStyle = '#22c55e'
    ctx.font = 'bold 12px sans-serif'
    ctx.fillText(t('experiments.emSimActive'), w - 15, 25)
  } else {
    ctx.fillStyle = '#64748b'
    ctx.font = 'bold 12px sans-serif'
    ctx.fillText(t('experiments.emSimStopped'), w - 15, 25)
  }

  // ── Layer 7: Flux graph (bottom of canvas, screen space) ──
  const graphH = 80
  const graphY = h - graphH - 20
  const graphW = w - 60
  const graphX = 30

  ctx.fillStyle = 'rgba(15,22,40,0.8)'
  ctx.strokeStyle = 'rgba(100,116,139,0.3)'
  ctx.lineWidth = 1
  ctx.beginPath()
  ctx.roundRect(graphX, graphY, graphW, graphH, 6)
  ctx.fill()
  ctx.stroke()

  // Zero line
  ctx.strokeStyle = 'rgba(100,116,139,0.2)'
  ctx.beginPath()
  ctx.moveTo(graphX, graphY + graphH / 2)
  ctx.lineTo(graphX + graphW, graphY + graphH / 2)
  ctx.stroke()

  // Flux curve
  if (fluxHistory.length > 1) {
    let maxFlux = 0.001
    for (let j = 0; j < fluxHistory.length; j++) {
      const absVal = Math.abs(fluxHistory[j])
      if (absVal > maxFlux) maxFlux = absVal
    }
    // Fill positive
    ctx.fillStyle = 'rgba(59,130,246,0.15)'
    ctx.beginPath()
    ctx.moveTo(graphX, graphY + graphH / 2)
    for (let j = 0; j < fluxHistory.length; j++) {
      const px = graphX + (j / FLUX_HISTORY_LEN) * graphW
      const py = graphY + graphH / 2 - Math.max(0, fluxHistory[j] / maxFlux) * (graphH / 2 - 5)
      ctx.lineTo(px, py)
    }
    ctx.lineTo(graphX + (fluxHistory.length / FLUX_HISTORY_LEN) * graphW, graphY + graphH / 2)
    ctx.closePath()
    ctx.fill()

    // Fill negative
    ctx.fillStyle = 'rgba(239,68,68,0.15)'
    ctx.beginPath()
    ctx.moveTo(graphX, graphY + graphH / 2)
    for (let j = 0; j < fluxHistory.length; j++) {
      const px = graphX + (j / FLUX_HISTORY_LEN) * graphW
      const py = graphY + graphH / 2 - Math.min(0, fluxHistory[j] / maxFlux) * (graphH / 2 - 5)
      ctx.lineTo(px, py)
    }
    ctx.lineTo(graphX + (fluxHistory.length / FLUX_HISTORY_LEN) * graphW, graphY + graphH / 2)
    ctx.closePath()
    ctx.fill()

    // Curve
    ctx.strokeStyle = '#3b82f6'
    ctx.lineWidth = 2
    ctx.beginPath()
    for (let j = 0; j < fluxHistory.length; j++) {
      const px = graphX + (j / FLUX_HISTORY_LEN) * graphW
      const py = graphY + graphH / 2 - (fluxHistory[j] / maxFlux) * (graphH / 2 - 5)
      if (j === 0) ctx.moveTo(px, py)
      else ctx.lineTo(px, py)
    }
    ctx.stroke()
  }

  // Graph label
  ctx.fillStyle = '#3b82f6'
  ctx.font = 'bold 10px monospace'
  ctx.textAlign = 'left'
  ctx.fillText(t('experiments.emCanvasFluxGraph'), graphX + 5, graphY + 12)
  ctx.fillStyle = '#64748b'
  ctx.font = '8px sans-serif'
  ctx.fillText(`peak: ${fluxMaxDisplay().toExponential(3)} Wb`, graphX + 5, graphY + graphH - 5)

  // ── Layer 8: Probe (screen space) ──
  probeIconPos = { x: w - 50, y: 50 }

  if (probeState === 'idle') {
    ctx.fillStyle = 'rgba(168,85,247,.15)'
    ctx.strokeStyle = '#a855f7'
    ctx.lineWidth = 2
    ctx.setLineDash([3, 3])
    ctx.beginPath()
    ctx.roundRect(probeIconPos.x - 22, probeIconPos.y - 22, 44, 44, 8)
    ctx.fill()
    ctx.stroke()
    ctx.setLineDash([])

    ctx.fillStyle = '#a855f7'
    ctx.font = '20px sans-serif'
    ctx.textAlign = 'center'
    ctx.fillText('📐', probeIconPos.x, probeIconPos.y + 7)
    ctx.font = '8px sans-serif'
    ctx.fillText(t('experiments.emCanvasMeasureFlux'), probeIconPos.x, probeIconPos.y + 35)
    ctx.fillStyle = '#64748b'
    ctx.font = '7px sans-serif'
    ctx.fillText(t('experiments.emProbeDragHint'), probeIconPos.x, probeIconPos.y + 45)
  }

  if (probeState === 'dragging' || probeState === 'placed') {
    const sx = (probePos.x - w / 2) * zoom + w / 2 + panX
    const sy = (probePos.y - h / 2) * zoom + h / 2 + panY

    ctx.fillStyle = '#1E2530'
    ctx.strokeStyle = '#a855f7'
    ctx.lineWidth = 2
    ctx.beginPath()
    ctx.roundRect(sx - 16, sy - 16, 32, 32, 6)
    ctx.fill()
    ctx.stroke()

    ctx.fillStyle = '#a855f7'
    ctx.font = '16px sans-serif'
    ctx.textAlign = 'center'
    ctx.fillText('📐', sx, sy + 6)

    if (probeState === 'placed') {
      ctx.fillStyle = 'rgba(15,22,40,0.92)'
      ctx.strokeStyle = '#a855f7'
      ctx.lineWidth = 2
      ctx.beginPath()
      ctx.roundRect(sx + 22, sy - 35, 210, 70, 8)
      ctx.fill()
      ctx.stroke()

      ctx.fillStyle = '#a855f7'
      ctx.font = 'bold 10px sans-serif'
      ctx.textAlign = 'left'
      ctx.fillText(t('experiments.emProbeMeasure'), sx + 30, sy - 18)

      ctx.fillStyle = '#ef4444'
      ctx.font = 'bold 13px monospace'
      ctx.fillText(`Φ = ${probeMeasured.flux.toExponential(3)} Wb`, sx + 30, sy + 2)
      ctx.fillStyle = '#f59e0b'
      ctx.fillText(`θ = ${(probeMeasured.angle * 180 / Math.PI).toFixed(1)}°`, sx + 30, sy + 24)
    }
  }

  // Zoom indicator
  ctx.fillStyle = '#64748b'
  ctx.font = '10px sans-serif'
  ctx.textAlign = 'left'
  ctx.fillText(`🔍 ${zoom.toFixed(1)}x  |  ${t('experiments.emZoomHint')}`, 10, h - 8)
}

function loop() {
  try {
    if (props.running && !props.paused) {
      const dt = 0.016
      autoTheta += 1.0 * dt // slow auto-rotation
      if (autoTheta > Math.PI * 2) autoTheta -= Math.PI * 2

      const flux = currentB * currentA * Math.cos(autoTheta)
      fluxHistory.push(flux)
      if (fluxHistory.length > FLUX_HISTORY_LEN) fluxHistory.shift()

      fluxMaxCached = Math.max(fluxMaxCached, Math.abs(flux))
    }

    // Smooth parameter transitions
    targetB = props.B
    targetA = props.A
    targetTheta = props.theta
    currentB += (targetB - currentB) * 0.3
    currentA += (targetA - currentA) * 0.3
    currentTheta += (targetTheta - currentTheta) * 0.3

    draw()
  } catch (e) {
    console.error('loop error:', e)
  }
  rafId = requestAnimationFrame(loop)
}

function resize() {
  const canvas = canvasRef.value
  if (!canvas) return
  const parent = canvas.parentElement
  if (!parent) return
  canvas.width = parent.clientWidth
  canvas.height = parent.clientHeight
  draw()
}

onMounted(() => {
  const canvas = canvasRef.value
  if (!canvas) return
  resize()
  canvas.addEventListener('wheel', onWheel, { passive: false })
  canvas.addEventListener('mousedown', onMouseDown)
  canvas.addEventListener('mousemove', onMouseMove)
  canvas.addEventListener('mouseup', onMouseUp)
  canvas.addEventListener('mouseleave', onMouseUp)
  canvas.addEventListener('dblclick', onDoubleClick)
  rafId = requestAnimationFrame(loop)

  const parent = canvas.parentElement
  if (parent) {
    resizeObserver = new ResizeObserver(() => { resize() })
    resizeObserver.observe(parent)
  }

  watchdogId = window.setInterval(() => {
    if (rafId === 0 && canvasRef.value) {
      rafId = requestAnimationFrame(loop)
    }
  }, 2000)
})

onUnmounted(() => {
  cancelAnimationFrame(rafId)
  rafId = 0
  clearInterval(watchdogId)
  if (resizeObserver) {
    resizeObserver.disconnect()
    resizeObserver = null
  }
  const canvas = canvasRef.value
  if (canvas) {
    canvas.removeEventListener('wheel', onWheel)
    canvas.removeEventListener('mousedown', onMouseDown)
    canvas.removeEventListener('mousemove', onMouseMove)
    canvas.removeEventListener('mouseup', onMouseUp)
    canvas.removeEventListener('mouseleave', onMouseUp)
    canvas.removeEventListener('dblclick', onDoubleClick)
  }
})

watch(() => [props.B, props.A, props.theta], () => {
  if (!props.running) {
    fluxHistory = []
    fluxMaxCached = 0
  }
})

watch(() => props.running, (running) => {
  if (running) {
    autoTheta = 0
    fluxHistory = []
    fluxMaxCached = 0
  } else {
    fluxHistory = []
  }
})
</script>

<template>
  <canvas ref="canvasRef" class="flux-canvas" />
</template>

<style scoped>
.flux-canvas { width: 100%; height: 100%; display: block; cursor: grab; }
</style>
