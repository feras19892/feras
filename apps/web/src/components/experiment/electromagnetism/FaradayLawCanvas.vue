<script setup lang="ts">
import { ref, onMounted, onUnmounted, watch } from 'vue'
import { useI18n } from '../../../composables/useI18n'
const { t } = useI18n()

const props = defineProps<{
  B: number
  N: number
  A: number
  v: number
  R: number
  d: number
  running: boolean
  paused: boolean
  mode: 'faraday' | 'lenz'
}>()

const emit = defineEmits<{
  (e: 'probe-placed', emf: number, i: number, flux: number, direction: string): void
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
let _phase = 0
let zoom = 1
let panX = 0
let panY = 0
let isPanning = false
let panStart = { x: 0, y: 0 }

// Smooth interpolated values
let targetB = 0.5, currentB = 0.5
let targetN = 100, currentN = 100
let targetA = 0.01, currentA = 0.01
let targetV = 1.0, currentV = 1.0
let targetR = 10, currentR = 10
let targetD = 0.05, currentD = 0.05

// Magnet position (in meters, relative to coil center)
let magnetX = -0.3
let magnetDir = 1

// EMF history for graph
let emfHistory: number[] = []
const EMF_HISTORY_LEN = 200

// Probe state
type ProbeState = 'idle' | 'dragging' | 'placed'
let probeState: ProbeState = 'idle'
let probePos = { x: 0, y: 0 }
let probeIconPos = { x: 0, y: 0 }
let probeMeasured = { emf: 0, i: 0, flux: 0, direction: 'opposing' }

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
    // Measure EMF at probe position (map x position to magnet position)
    const canvas = canvasRef.value!
    const w = canvas.width
    const h = canvas.height
    const cx = w / 2
    const scale = Math.min(w, h) / 600
    // Map probe x to physical x: magnetPxX = cx + magnetX * 600 * scale
    const physX = (probePos.x - cx) / (600 * scale)
    const velocity = currentV * magnetDir
    const flux = currentB * currentA / (1 + (physX / Math.max(currentD, 1e-6)) ** 2)
    const dFluxDx = -2 * currentB * currentA * physX /
      (Math.max(currentD, 1e-6) ** 2 * (1 + (physX / Math.max(currentD, 1e-6)) ** 2) ** 2)
    const emf = -currentN * dFluxDx * velocity
    const i = emf / Math.max(currentR, 1e-6)
    const direction = dFluxDx * velocity > 0 ? 'opposing' : 'assisting'
    probeMeasured = { emf: Math.abs(emf), i: Math.abs(i), flux, direction }
    emit('probe-placed', Math.abs(emf), Math.abs(i), flux, direction)
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

function computePhysics(x: number) {
  const d = Math.max(currentD, 1e-6)
  const velocity = currentV * magnetDir
  const flux = currentB * currentA / (1 + (x / d) ** 2)
  const dFluxDx = -2 * currentB * currentA * x / (d * d * (1 + (x / d) ** 2) ** 2)
  const emf = -currentN * dFluxDx * velocity
  const i = emf / Math.max(currentR, 1e-6)
  const direction = dFluxDx * velocity > 0 ? 'opposing' : 'assisting'
  return { flux, emf, i, direction }
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
  const cy = h / 2

  const { emf, i, direction } = computePhysics(magnetX)

  // Layout
  const scale = Math.min(w, h) / 600
  const coilR = Math.max(10, Math.min(300, Math.sqrt(Math.max(currentA, 1e-6) / Math.PI) * 1500 * scale))  // coil radius in px, clamped
  const magnetW = 30 * scale
  const magnetH = 80 * scale
  const magnetPxX = cx + magnetX * 600 * scale  // magnet position in px

  // Background
  ctx.fillStyle = '#0b1220'
  ctx.fillRect(0, 0, w, h)

  ctx.save()
  ctx.translate(w / 2 + panX, h / 2 + panY)
  ctx.scale(zoom, zoom)
  ctx.translate(-w / 2, -h / 2)

  // ── Layer 1: Magnetic field lines around magnet ──
  if (currentB > 0.01) {
    const fieldAlpha = Math.min(0.4, currentB * 0.3)
    ctx.strokeStyle = `rgba(59,130,246,${fieldAlpha})`
    ctx.lineWidth = 1.5
    // Dipole field lines (simplified loops)
    for (let r = 1; r <= 4; r++) {
      const ringR = r * 25 * scale
      ctx.beginPath()
      ctx.ellipse(magnetPxX, cy, ringR, ringR * 0.6, 0, 0, Math.PI * 2)
      ctx.stroke()
    }
    // Field direction arrows
    ctx.fillStyle = `rgba(59,130,246,${fieldAlpha * 1.5})`
    drawArrow(ctx, magnetPxX + 50 * scale, cy - 15 * scale, 0, `rgba(59,130,246,${fieldAlpha * 1.5})`, 5)
    drawArrow(ctx, magnetPxX - 50 * scale, cy + 15 * scale, Math.PI, `rgba(59,130,246,${fieldAlpha * 1.5})`, 5)
  }

  // ── Layer 2: Coil (vertical, seen from side) ──
  const coilW = 20 * scale
  // Back half
  ctx.strokeStyle = 'rgba(200,137,90,0.3)'
  ctx.lineWidth = 3
  ctx.beginPath()
  ctx.ellipse(cx, cy, coilW, coilR, 0, Math.PI / 2, Math.PI * 3 / 2)
  ctx.stroke()

  // Front half (copper)
  const grad = ctx.createLinearGradient(cx - coilW, 0, cx + coilW, 0)
  grad.addColorStop(0, '#8B5E3C')
  grad.addColorStop(0.5, '#D49A6E')
  grad.addColorStop(1, '#8B5E3C')
  ctx.strokeStyle = grad
  ctx.lineWidth = 4
  ctx.beginPath()
  ctx.ellipse(cx, cy, coilW, coilR, 0, -Math.PI / 2, Math.PI / 2)
  ctx.stroke()

  // Multi-turn winding lines
  const numTurnsVis = Math.min(Math.max(3, Math.round(currentN / 15)), 12)
  for (let n = 0; n < numTurnsVis; n++) {
    const t = n / Math.max(1, numTurnsVis - 1)
    const yOffset = (t - 0.5) * coilR * 1.8
    const alpha = 0.2 + Math.abs(t - 0.5) * 0.3
    ctx.strokeStyle = `rgba(200,137,90,${alpha})`
    ctx.lineWidth = 2
    ctx.beginPath()
    ctx.ellipse(cx, cy + yOffset, coilW * 0.8, coilR * 0.15, 0, 0, Math.PI * 2)
    ctx.stroke()
  }

  // ── Layer 2.5: Induced field (Lenz's law — only in lenz mode) ──
  if (Math.abs(emf) > 1e-10 && props.mode === 'lenz') {
    const inducedAlpha = Math.min(0.5, Math.abs(i) * 20)
    const inducedColor = direction === 'opposing'
      ? `rgba(239,68,68,${inducedAlpha})`
      : `rgba(34,197,94,${inducedAlpha})`
    ctx.strokeStyle = inducedColor
    ctx.lineWidth = 2
    for (let r = 1; r <= 3; r++) {
      const ringR = r * 20 * scale
      ctx.beginPath()
      ctx.ellipse(cx, cy, ringR, ringR * 0.5, 0, 0, Math.PI * 2)
      ctx.stroke()
    }
    const fieldDir = direction === 'opposing' ? -1 : 1
    drawArrow(ctx, cx + 40 * scale, cy - 12 * scale, fieldDir > 0 ? 0 : Math.PI, inducedColor, 5)
    drawArrow(ctx, cx - 40 * scale, cy + 12 * scale, fieldDir > 0 ? Math.PI : 0, inducedColor, 5)
  }

  // ── Layer 3: Bar magnet ──
  const magLeft = magnetPxX - magnetW / 2
  const magTop = cy - magnetH / 2
  // North pole (red, top half)
  const nGrad = ctx.createLinearGradient(magLeft, magTop, magLeft + magnetW, magTop + magnetH / 2)
  nGrad.addColorStop(0, '#dc2626')
  nGrad.addColorStop(0.5, '#ef4444')
  nGrad.addColorStop(1, '#dc2626')
  ctx.fillStyle = nGrad
  ctx.fillRect(magLeft, magTop, magnetW, magnetH / 2)
  // South pole (blue, bottom half)
  const sGrad = ctx.createLinearGradient(magLeft, magTop + magnetH / 2, magLeft + magnetW, magTop + magnetH)
  sGrad.addColorStop(0, '#2563eb')
  sGrad.addColorStop(0.5, '#3b82f6')
  sGrad.addColorStop(1, '#2563eb')
  ctx.fillStyle = sGrad
  ctx.fillRect(magLeft, magTop + magnetH / 2, magnetW, magnetH / 2)
  // Border
  ctx.strokeStyle = '#1e2530'
  ctx.lineWidth = 2
  ctx.strokeRect(magLeft, magTop, magnetW, magnetH)
  // N/S labels
  ctx.fillStyle = '#fff'
  ctx.font = `bold ${12 * scale}px sans-serif`
  ctx.textAlign = 'center'
  ctx.fillText('N', magnetPxX, magTop + magnetH * 0.3)
  ctx.fillText('S', magnetPxX, magTop + magnetH * 0.8)

  // Velocity arrow
  if (props.running && !props.paused && currentV > 0.01) {
    const arrowLen = 30 * scale * (currentV / 2)
    drawArrow(ctx, magnetPxX + magnetDir * (magnetW / 2 + arrowLen), cy,
      magnetDir > 0 ? 0 : Math.PI, '#22c55e', 8)
    ctx.fillStyle = '#22c55e'
    ctx.font = `bold ${10 * scale}px monospace`
    ctx.textAlign = 'center'
    ctx.fillText(`v=${currentV.toFixed(1)}m/s`, magnetPxX + magnetDir * (magnetW / 2 + arrowLen + 20), cy - 5)
  }

  // ── Layer 4: EMF graph (bottom of canvas) ──
  const graphH = 80
  const graphY = h - graphH - 20
  const graphW = w - 60
  const graphX = 30

  // Graph background
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

    // Fill positive area (opposing) in red — only in lenz mode
    if (props.mode === 'lenz') {
    ctx.fillStyle = 'rgba(239,68,68,0.15)'
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

    // Fill negative area (assisting) in green
    ctx.fillStyle = 'rgba(34,197,94,0.15)'
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
    }
  }

  // Graph label
  ctx.fillStyle = '#f59e0b'
  ctx.font = 'bold 10px monospace'
  ctx.textAlign = 'left'
  ctx.fillText(props.mode === 'lenz' ? t('experiments.emCanvasLenzLaw') : t('experiments.emCanvasFaradayLaw'), graphX + 5, graphY + 12)
  if (props.mode === 'lenz') {
    ctx.fillStyle = '#ef4444'
    ctx.font = '8px sans-serif'
    ctx.fillText(t('experiments.emCanvasOpposingRed'), graphX + graphW - 80, graphY + 12)
    ctx.fillStyle = '#22c55e'
    ctx.fillText(t('experiments.emCanvasAssistingGreen'), graphX + graphW - 35, graphY + 12)
  }
  ctx.fillStyle = '#64748b'
  ctx.font = '8px sans-serif'
  ctx.fillText(`peak: ${emfMaxDisplay().toExponential(2)} V`, graphX + 5, graphY + graphH - 5)

  // ── Layer 5: Current direction indicator on coil ──
  if (Math.abs(emf) > 1e-8) {
    const currentDir = emf > 0 ? 1 : -1
    const intensity = Math.min(1, Math.abs(i) * 10)
    ctx.fillStyle = `rgba(245,158,11,${0.3 + intensity * 0.5})`
    ctx.font = 'bold 11px sans-serif'
    ctx.textAlign = 'center'
    const dirText = currentDir > 0 ? `⇈ ${t('experiments.emCanvasInducedCurrent')}` : `⇊ ${t('experiments.emCanvasInducedCurrent')}`
    ctx.fillText(dirText, cx, cy - coilR - 15)
    // Lenz direction label — only in lenz mode
    if (props.mode === 'lenz') {
      ctx.fillStyle = direction === 'opposing' ? '#ef4444' : '#22c55e'
      ctx.font = 'bold 10px sans-serif'
      ctx.fillText(direction === 'opposing' ? t('experiments.emCanvasOpposingLenz') : t('experiments.emCanvasAssistingLenz'), cx, cy - coilR - 30)
    }
  }

  // ── Layer 6: Labels (screen space — fixed, not affected by zoom/pan) ──
  ctx.restore()

  // Background panel for labels
  ctx.fillStyle = 'rgba(15,22,40,0.85)'
  ctx.strokeStyle = 'rgba(100,116,139,0.2)'
  ctx.lineWidth = 1
  ctx.beginPath()
  ctx.roundRect(8, 8, 175, 140, 8)
  ctx.fill()
  ctx.stroke()

  ctx.fillStyle = '#3b82f6'
  ctx.font = 'bold 13px monospace'
  ctx.textAlign = 'left'
  ctx.fillText(`B = ${currentB.toFixed(2)} T`, 16, 30)
  ctx.fillStyle = '#a855f7'
  ctx.fillText(`N = ${Math.round(currentN)} ${t('experiments.genTurns')}`, 16, 50)
  ctx.fillStyle = '#22c55e'
  ctx.fillText(`v = ${currentV.toFixed(2)} m/s`, 16, 70)
  ctx.fillStyle = '#f59e0b'
  ctx.fillText(`R = ${currentR.toFixed(0)} Ω`, 16, 90)
  ctx.fillStyle = '#ef4444'
  ctx.font = 'bold 14px monospace'
  ctx.fillText(`EMF = ${emf.toExponential(2)} V`, 16, 112)
  ctx.fillStyle = '#f59e0b'
  ctx.font = 'bold 13px monospace'
  ctx.fillText(`I = ${i.toExponential(2)} A`, 16, 132)

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
      const boxH = props.mode === 'lenz' ? 110 : 90
      ctx.fillStyle = 'rgba(15,22,40,0.92)'
      ctx.strokeStyle = '#a855f7'
      ctx.lineWidth = 2
      ctx.beginPath()
      ctx.roundRect(sx + 22, sy - 40, 220, boxH, 8)
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
      if (props.mode === 'lenz') {
        ctx.fillStyle = probeMeasured.direction === 'opposing' ? '#ef4444' : '#22c55e'
        ctx.font = 'bold 12px sans-serif'
        ctx.fillText(probeMeasured.direction === 'opposing' ? t('experiments.emCanvasOpposingLenz') : t('experiments.emCanvasAssistingLenz'), sx + 30, sy + 58)
      }
    }
  }

  // Zoom indicator
  ctx.fillStyle = '#64748b'
  ctx.font = '10px sans-serif'
  ctx.textAlign = 'left'
  ctx.fillText(`🔍 ${zoom.toFixed(1)}x  |  ${t('experiments.emZoomHint')}`, 10, h - 8)
}

let emfMaxCached = 0
function emfMaxDisplay(): number {
  return emfMaxCached
}

function loop() {
  try {
    if (props.running && !props.paused) {
      _phase += 0.02

      // Move magnet
      const dt = 0.016
      magnetX += magnetDir * currentV * dt

      // Bounce at limits
      if (magnetX > 0.35) {
        magnetX = 0.35
        magnetDir = -1
      }
      if (magnetX < -0.35) {
        magnetX = -0.35
        magnetDir = 1
      }

      // Compute EMF and push to history
      const { emf } = computePhysics(magnetX)
      emfHistory.push(emf)
      if (emfHistory.length > EMF_HISTORY_LEN) emfHistory.shift()

      // Track max EMF
      emfMaxCached = Math.max(emfMaxCached, Math.abs(emf))
    }

    // Smooth parameter transitions
    targetB = props.B
    targetN = props.N
    targetA = props.A
    targetV = props.v
    targetR = props.R
    targetD = props.d
    currentB += (targetB - currentB) * 0.3
    currentN += (targetN - currentN) * 0.3
    currentA += (targetA - currentA) * 0.3
    currentV += (targetV - currentV) * 0.3
    currentR += (targetR - currentR) * 0.3
    currentD += (targetD - currentD) * 0.3

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

watch(() => [props.B, props.N, props.A, props.v, props.R, props.d], () => {
  emfHistory = []
  emfMaxCached = 0
})

watch(() => props.running, (running) => {
  if (running) {
    magnetX = -0.3
    magnetDir = 1
    emfHistory = []
    emfMaxCached = 0
  } else {
    emfHistory = []
  }
})
</script>

<template>
  <canvas ref="canvasRef" class="faraday-canvas" />
</template>

<style scoped>
.faraday-canvas { width: 100%; height: 100%; display: block; cursor: grab; }
</style>
