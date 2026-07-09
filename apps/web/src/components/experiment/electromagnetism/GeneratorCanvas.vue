<script setup lang="ts">
import { ref, onMounted, onUnmounted, watch } from 'vue'
import { useI18n } from '../../../composables/useI18n'
const { t } = useI18n()

const props = defineProps<{
  B: number
  N: number
  A: number
  omega: number
  R: number
  running: boolean
  paused: boolean
}>()

const emit = defineEmits<{
  (e: 'probe-placed', emf: number, i: number, flux: number, angle: number): void
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
let targetN = 100, currentN = 100
let targetA = 0.01, currentA = 0.01
let targetOmega = 10, currentOmega = 10
let targetR = 10, currentR = 10

// Rotation angle
let theta = 0

// EMF history for graph
let emfHistory: number[] = []
const EMF_HISTORY_LEN = 200

// Probe state
type ProbeState = 'idle' | 'dragging' | 'placed'
let probeState: ProbeState = 'idle'
let probePos = { x: 0, y: 0 }
let probeIconPos = { x: 0, y: 0 }
let probeMeasured = { emf: 0, i: 0, flux: 0, angle: 0 }

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
    // Measure at current rotation angle
    const flux = currentN * currentB * currentA * Math.cos(theta)
    const emf = currentN * currentB * currentA * currentOmega * Math.sin(theta)
    const i = emf / Math.max(currentR, 1e-6)
    probeMeasured = { emf: Math.abs(emf), i: Math.abs(i), flux, angle: theta }
    emit('probe-placed', Math.abs(emf), Math.abs(i), flux, theta)
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

function computePhysics(angle: number) {
  const flux = currentN * currentB * currentA * Math.cos(angle)
  const emf = currentN * currentB * currentA * currentOmega * Math.sin(angle)
  const i = emf / Math.max(currentR, 1e-6)
  return { flux, emf, i }
}

let emfMaxCached = 0
function emfMaxDisplay(): number {
  return emfMaxCached
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
  const cy = h / 2 - 40 // shift up to make room for graph

  const { flux, emf, i } = computePhysics(theta)

  const scale = Math.min(w, h) / 600

  // Background
  ctx.fillStyle = '#0b1220'
  ctx.fillRect(0, 0, w, h)

  ctx.save()
  ctx.translate(w / 2 + panX, h / 2 + panY)
  ctx.scale(zoom, zoom)
  ctx.translate(-w / 2, -h / 2)

  // ── Layer 1: Magnet poles (N on left, S on right) ──
  const poleW = 50 * scale
  const poleH = 120 * scale
  const gap = 140 * scale // gap between poles

  // North pole (left, red)
  const nGrad = ctx.createLinearGradient(cx - gap / 2 - poleW, 0, cx - gap / 2, 0)
  nGrad.addColorStop(0, '#dc2626')
  nGrad.addColorStop(0.5, '#ef4444')
  nGrad.addColorStop(1, '#dc2626')
  ctx.fillStyle = nGrad
  ctx.fillRect(cx - gap / 2 - poleW, cy - poleH / 2, poleW, poleH)
  ctx.strokeStyle = '#1e2530'
  ctx.lineWidth = 2
  ctx.strokeRect(cx - gap / 2 - poleW, cy - poleH / 2, poleW, poleH)
  ctx.fillStyle = '#fff'
  ctx.font = `bold ${16 * scale}px sans-serif`
  ctx.textAlign = 'center'
  ctx.fillText('N', cx - gap / 2 - poleW / 2, cy + 5)

  // South pole (right, blue)
  const sGrad = ctx.createLinearGradient(cx + gap / 2, 0, cx + gap / 2 + poleW, 0)
  sGrad.addColorStop(0, '#2563eb')
  sGrad.addColorStop(0.5, '#3b82f6')
  sGrad.addColorStop(1, '#2563eb')
  ctx.fillStyle = sGrad
  ctx.fillRect(cx + gap / 2, cy - poleH / 2, poleW, poleH)
  ctx.strokeStyle = '#1e2530'
  ctx.strokeRect(cx + gap / 2, cy - poleH / 2, poleW, poleH)
  ctx.fillStyle = '#fff'
  ctx.fillText('S', cx + gap / 2 + poleW / 2, cy + 5)

  // ── Layer 2: Magnetic field lines (left to right between poles) ──
  if (currentB > 0.01) {
    const fieldAlpha = Math.min(0.5, currentB * 0.35)
    ctx.strokeStyle = `rgba(59,130,246,${fieldAlpha})`
    ctx.lineWidth = 1.5
    const numLines = 7
    for (let l = 0; l < numLines; l++) {
      const yOffset = (l - (numLines - 1) / 2) * (poleH / numLines) * 0.8
      const y = cy + yOffset
      ctx.beginPath()
      ctx.moveTo(cx - gap / 2, y)
      ctx.lineTo(cx + gap / 2, y)
      ctx.stroke()
      // Arrow on field line
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

  // ── Layer 3: Rotating coil (seen edge-on, rotating around vertical axis) ──
  // The coil is a rectangle of width w_coil and height h_coil
  // When viewed at angle theta, the projected width = w_coil * |cos(theta)|
  const coilW = Math.max(20, Math.sqrt(Math.max(currentA, 1e-6)) * 800 * scale)
  const coilH = Math.max(20, Math.sqrt(Math.max(currentA, 1e-6)) * 800 * scale)
  const projW = coilW * Math.abs(Math.cos(theta))
  const isFront = Math.cos(theta) >= 0

  // Coil rectangle
  ctx.strokeStyle = isFront ? '#D49A6E' : 'rgba(200,137,90,0.4)'
  ctx.lineWidth = 3
  ctx.beginPath()
  ctx.rect(cx - projW / 2, cy - coilH / 2, projW, coilH)
  ctx.stroke()

  // Multi-turn winding lines
  const numTurnsVis = Math.min(Math.max(3, Math.round(currentN / 20)), 8)
  for (let n = 0; n < numTurnsVis; n++) {
    const t = n / Math.max(1, numTurnsVis - 1)
    const yOffset = (t - 0.5) * coilH * 0.9
    ctx.strokeStyle = `rgba(200,137,90,${0.2 + Math.abs(t - 0.5) * 0.3})`
    ctx.lineWidth = 1.5
    ctx.beginPath()
    ctx.moveTo(cx - projW / 2, cy + yOffset)
    ctx.lineTo(cx + projW / 2, cy + yOffset)
    ctx.stroke()
  }

  // Rotation axis (vertical dashed line)
  ctx.strokeStyle = 'rgba(168,85,247,0.3)'
  ctx.lineWidth = 1
  ctx.setLineDash([4, 4])
  ctx.beginPath()
  ctx.moveTo(cx, cy - coilH / 2 - 20)
  ctx.lineTo(cx, cy + coilH / 2 + 20)
  ctx.stroke()
  ctx.setLineDash([])

  // Rotation arrow (curved)
  ctx.strokeStyle = '#a855f7'
  ctx.lineWidth = 2
  ctx.beginPath()
  ctx.arc(cx, cy + coilH / 2 + 30, 15 * scale, 0.2, Math.PI * 1.5)
  ctx.stroke()
  // Arrowhead
  const arrAngle = Math.PI * 1.5
  const arrX = cx + 15 * scale * Math.cos(arrAngle)
  const arrY = cy + coilH / 2 + 30 + 15 * scale * Math.sin(arrAngle)
  ctx.fillStyle = '#a855f7'
  ctx.beginPath()
  ctx.moveTo(arrX, arrY)
  ctx.lineTo(arrX - 6, arrY - 3)
  ctx.lineTo(arrX - 3, arrY + 5)
  ctx.closePath()
  ctx.fill()
  ctx.font = `bold ${9 * scale}px monospace`
  ctx.textAlign = 'center'
  ctx.fillText(`ω=${currentOmega.toFixed(1)}`, cx, cy + coilH / 2 + 55)

  // ── Layer 4: Current direction indicators on coil sides ──
  if (Math.abs(emf) > 1e-8) {
    const currentDir = emf > 0 ? 1 : -1
    const intensity = Math.min(1, Math.abs(i) * 10)
    // Left side: current goes up or down
    ctx.fillStyle = `rgba(245,158,11,${0.4 + intensity * 0.5})`
    ctx.font = `bold ${11 * scale}px sans-serif`
    ctx.textAlign = 'center'
    const leftSym = currentDir > 0 ? '↑' : '↓'
    const rightSym = currentDir > 0 ? '↓' : '↑'
    ctx.fillText(leftSym, cx - projW / 2 - 12, cy)
    ctx.fillText(rightSym, cx + projW / 2 + 12, cy)
  }

  ctx.restore()

  // ── Layer 5: Labels (screen space — fixed, not affected by zoom/pan) ──
  // Background panel for labels
  ctx.fillStyle = 'rgba(15,22,40,0.85)'
  ctx.strokeStyle = 'rgba(100,116,139,0.2)'
  ctx.lineWidth = 1
  ctx.beginPath()
  ctx.roundRect(8, 8, 175, 160, 8)
  ctx.fill()
  ctx.stroke()

  ctx.fillStyle = '#3b82f6'
  ctx.font = 'bold 13px monospace'
  ctx.textAlign = 'left'
  ctx.fillText(`B = ${currentB.toFixed(2)} T`, 16, 30)
  ctx.fillStyle = '#a855f7'
  ctx.fillText(`N = ${Math.round(currentN)} ${t('experiments.genTurns')}`, 16, 50)
  ctx.fillStyle = '#22c55e'
  ctx.fillText(`ω = ${currentOmega.toFixed(1)} rad/s`, 16, 70)
  ctx.fillStyle = '#f59e0b'
  ctx.fillText(`R = ${currentR.toFixed(0)} Ω`, 16, 90)
  ctx.fillStyle = '#ef4444'
  ctx.font = 'bold 14px monospace'
  ctx.fillText(`EMF = ${emf.toExponential(2)} V`, 16, 112)
  ctx.fillStyle = '#f59e0b'
  ctx.fillText(`I = ${i.toExponential(2)} A`, 16, 132)
  ctx.fillStyle = '#3b82f6'
  ctx.fillText(`Φ = ${flux.toExponential(2)} Wb`, 16, 152)

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

  // ── Layer 6: EMF graph (bottom of canvas, screen space) ──
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

  // EMF curve
  if (emfHistory.length > 1) {
    let maxEmf = 0.001
    for (let j = 0; j < emfHistory.length; j++) {
      const absVal = Math.abs(emfHistory[j])
      if (absVal > maxEmf) maxEmf = absVal
    }
    // Fill positive area
    ctx.fillStyle = 'rgba(239,68,68,0.12)'
    ctx.beginPath()
    ctx.moveTo(graphX, graphY + graphH / 2)
    for (let j = 0; j < emfHistory.length; j++) {
      const px = graphX + (j / EMF_HISTORY_LEN) * graphW
      const py = graphY + graphH / 2 - Math.max(0, emfHistory[j] / maxEmf) * (graphH / 2 - 5)
      ctx.lineTo(px, py)
    }
    ctx.lineTo(graphX + (emfHistory.length / EMF_HISTORY_LEN) * graphW, graphY + graphH / 2)
    ctx.closePath()
    ctx.fill()

    // Fill negative area
    ctx.fillStyle = 'rgba(34,197,94,0.12)'
    ctx.beginPath()
    ctx.moveTo(graphX, graphY + graphH / 2)
    for (let j = 0; j < emfHistory.length; j++) {
      const px = graphX + (j / EMF_HISTORY_LEN) * graphW
      const py = graphY + graphH / 2 - Math.min(0, emfHistory[j] / maxEmf) * (graphH / 2 - 5)
      ctx.lineTo(px, py)
    }
    ctx.lineTo(graphX + (emfHistory.length / EMF_HISTORY_LEN) * graphW, graphY + graphH / 2)
    ctx.closePath()
    ctx.fill()

    // Curve
    ctx.strokeStyle = '#f59e0b'
    ctx.lineWidth = 2
    ctx.beginPath()
    for (let j = 0; j < emfHistory.length; j++) {
      const px = graphX + (j / EMF_HISTORY_LEN) * graphW
      const py = graphY + graphH / 2 - (emfHistory[j] / maxEmf) * (graphH / 2 - 5)
      if (j === 0) ctx.moveTo(px, py)
      else ctx.lineTo(px, py)
    }
    ctx.stroke()
  }

  // Graph label
  ctx.fillStyle = '#f59e0b'
  ctx.font = 'bold 10px monospace'
  ctx.textAlign = 'left'
  ctx.fillText(t('experiments.emCanvasAcGenerator'), graphX + 5, graphY + 12)
  ctx.fillStyle = '#ef4444'
  ctx.font = '8px sans-serif'
  ctx.fillText(t('experiments.emCanvasPositive'), graphX + graphW - 70, graphY + 12)
  ctx.fillStyle = '#22c55e'
  ctx.fillText(t('experiments.emCanvasNegative'), graphX + graphW - 30, graphY + 12)
  ctx.fillStyle = '#64748b'
  ctx.font = '8px sans-serif'
  ctx.fillText(`peak: ${emfMaxDisplay().toExponential(2)} V`, graphX + 5, graphY + graphH - 5)

  // ── Layer 7: Probe (screen space) ──
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
    ctx.fillText(t('experiments.emCanvasMeasureEmf'), probeIconPos.x, probeIconPos.y + 35)
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
      ctx.roundRect(sx + 22, sy - 40, 220, 90, 8)
      ctx.fill()
      ctx.stroke()

      ctx.fillStyle = '#a855f7'
      ctx.font = 'bold 10px sans-serif'
      ctx.textAlign = 'left'
      ctx.fillText(t('experiments.emProbeMeasure'), sx + 30, sy - 22)

      ctx.fillStyle = '#ef4444'
      ctx.font = 'bold 13px monospace'
      ctx.fillText(`EMF = ${probeMeasured.emf.toExponential(2)} V`, sx + 30, sy - 4)
      ctx.fillStyle = '#f59e0b'
      ctx.fillText(`I = ${probeMeasured.i.toExponential(2)} A`, sx + 30, sy + 16)
      ctx.fillStyle = '#3b82f6'
      ctx.fillText(`Φ = ${probeMeasured.flux.toExponential(2)} Wb`, sx + 30, sy + 36)
      ctx.fillStyle = '#a855f7'
      ctx.font = 'bold 11px sans-serif'
      ctx.fillText(`θ = ${(probeMeasured.angle % (2 * Math.PI)).toFixed(2)} rad`, sx + 30, sy + 56)
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
      theta += currentOmega * dt
      if (theta > Math.PI * 4) theta -= Math.PI * 2 // keep manageable

      const { emf } = computePhysics(theta)
      emfHistory.push(emf)
      if (emfHistory.length > EMF_HISTORY_LEN) emfHistory.shift()

      emfMaxCached = Math.max(emfMaxCached, Math.abs(emf))
    }

    // Smooth parameter transitions
    targetB = props.B
    targetN = props.N
    targetA = props.A
    targetOmega = props.omega
    targetR = props.R
    currentB += (targetB - currentB) * 0.3
    currentN += (targetN - currentN) * 0.3
    currentA += (targetA - currentA) * 0.3
    currentOmega += (targetOmega - currentOmega) * 0.3
    currentR += (targetR - currentR) * 0.3

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

watch(() => [props.B, props.N, props.A, props.omega, props.R], () => {
  emfHistory = []
  emfMaxCached = 0
})

watch(() => props.running, (running) => {
  if (running) {
    theta = 0
    emfHistory = []
    emfMaxCached = 0
  } else {
    emfHistory = []
  }
})
</script>

<template>
  <canvas ref="canvasRef" class="generator-canvas" />
</template>

<style scoped>
.generator-canvas { width: 100%; height: 100%; display: block; cursor: grab; }
</style>
