<script setup lang="ts">
import { ref, onMounted, onUnmounted, watch } from 'vue'
import { useI18n } from '../../../composables/useI18n'
const { t } = useI18n()

const props = defineProps<{
  I: number
  N: number
  running: boolean
  paused: boolean
}>()

const emit = defineEmits<{
  (e: 'probe-placed', R: number, B: number): void
}>()

const MU0 = 4 * Math.PI * 1e-7

// Polyfill for roundRect (not supported in all browsers)
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
let phase = 0
let zoom = 1
let panX = 0
let panY = 0
let isPanning = false
let panStart = { x: 0, y: 0 }
let targetI = 0
let currentI = 0
let targetN = 0
let currentN = 0

type ProbeState = 'idle' | 'dragging' | 'placed'
let probeState: ProbeState = 'idle'
let probePos = { x: 0, y: 0 }
let probeMeasured = { R: 0, B: 0 }
let probeIconPos = { x: 0, y: 0 }

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
      const world = screenToWorld(pos.x, pos.y)
      probeState = 'dragging'
      probePos = { x: world.x, y: world.y }
      draw()
      return
    }
  }

  if (probeState === 'placed') {
    const sx = (probePos.x - canvasRef.value!.width / 2) * zoom + canvasRef.value!.width / 2 + panX
    const sy = (probePos.y - canvasRef.value!.height / 2) * zoom + canvasRef.value!.height / 2 + panY
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
    const world = screenToWorld(pos.x, pos.y)
    probePos = world
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
    const canvas = canvasRef.value!
    const cx = canvas.width / 2
    const cy = canvas.height / 2
    const dxPx = probePos.x - cx
    const dyPx = probePos.y - cy
    const distPx = Math.sqrt(dxPx * dxPx + dyPx * dyPx)
    const Rmeters = distPx * (0.05 / 90) // 90px = 0.05m coil radius
    const B = (MU0 * currentN * currentI) / (2 * Math.max(Rmeters, 1e-6))
    probeMeasured = { R: Rmeters, B }
    emit('probe-placed', Rmeters, B)
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

function drawArrow(ctx: CanvasRenderingContext2D, x: number, y: number, dir: 'down' | 'up', color: string, size = 5) {
  ctx.fillStyle = color
  ctx.beginPath()
  if (dir === 'down') {
    ctx.moveTo(x, y + size)
    ctx.lineTo(x - size * 0.8, y - size * 0.6)
    ctx.lineTo(x + size * 0.8, y - size * 0.6)
  } else {
    ctx.moveTo(x, y - size)
    ctx.lineTo(x - size * 0.8, y + size * 0.6)
    ctx.lineTo(x + size * 0.8, y + size * 0.6)
  }
  ctx.closePath()
  ctx.fill()
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

  const isPositive = currentI >= 0
  const dir: 'down' | 'up' = isPositive ? 'down' : 'up'

  // Layout constants
  const coilR = 90
  const coilFlatR = coilR * 0.32
  const wireW = 6
  const genW = 70
  const genH = 40
  const genX = cx - genW / 2
  const genY = h - 80
  const wireLeftX = cx - coilR
  const wireRightX = cx + coilR

  // Background
  ctx.fillStyle = '#0b1220'
  ctx.fillRect(0, 0, w, h)

  ctx.save()
  ctx.translate(w / 2 + panX, h / 2 + panY)
  ctx.scale(zoom, zoom)
  ctx.translate(-w / 2, -h / 2)

  // ── Layer 1: Connecting wires (battery → coil) ──
  ctx.strokeStyle = '#5B8DB8'
  ctx.lineWidth = 3
  ctx.lineCap = 'round'
  ctx.lineJoin = 'round'
  const railY = cy + 45
  ctx.beginPath()
  ctx.moveTo(genX + 10, genY); ctx.lineTo(genX + 10, railY)
  ctx.lineTo(wireLeftX - 15, railY); ctx.lineTo(wireLeftX - 15, cy); ctx.lineTo(wireLeftX, cy)
  ctx.moveTo(genX + genW - 10, genY); ctx.lineTo(genX + genW - 10, railY)
  ctx.lineTo(wireRightX + 15, railY); ctx.lineTo(wireRightX + 15, cy); ctx.lineTo(wireRightX, cy)
  ctx.stroke()

  // ── Layer 2: Magnetic field lines ──
  const fieldColor = (opacity: number) => `rgba(34, 197, 94, ${opacity})`
  const baseLineWidth = 1.5

  // Step 1: Center straight line
  ctx.strokeStyle = fieldColor(0.4)
  ctx.lineWidth = baseLineWidth
  ctx.setLineDash([6, 4])
  ctx.lineDashOffset = phase * (isPositive ? 1 : -1) * 12
  ctx.beginPath()
  ctx.moveTo(cx, cy - coilR * 2.2)
  ctx.lineTo(cx, cy + coilR * 2.2)
  ctx.stroke()
  ctx.setLineDash([])
  drawArrow(ctx, cx, cy - coilFlatR - 3, dir, fieldColor(0.8), 4)

  // Step 2: Crescent lines on both sides - more lines, more curve as they approach wire
  // Number of lines proportional to B = μ₀NI/(2R) — the actual physics law
  // R = 0.05 m (coil radius from experiment params)
  const R_coil = 0.05
  const B_actual = (MU0 * Math.abs(currentI) * currentN) / (2 * R_coil)
  // Reference B at max practical values (I=20A, N=100)
  const B_max = (MU0 * 50 * 50) / (2 * R_coil) // max I=50A, max N=50 (from param panel)
  const B_ratio = Math.min(1, B_actual / B_max)
  const B_vis = Math.sqrt(B_ratio) // sqrt makes small changes more visible
  const numSideLines = Math.max(1, Math.round(1 + B_vis * 7)) // 1 (weak) → 8 (strong)
  for (let i = 0; i < numSideLines; i++) {
    const t = (i + 1) / (numSideLines + 1) // 0 < t < 1
    // Offset from center: increases toward wire
    const offset = coilR * t * 0.9
    // Curve amount: small near center, large near wire (becomes circle)
    const curve = coilR * 0.3 * t * t
    // Height: full near center, shrinks near wire (circle is compact)
    const lineH = coilR * (2.2 - t * 1.4)
    const opacity = 0.4 - t * 0.1

    ctx.strokeStyle = fieldColor(opacity)
    ctx.lineWidth = baseLineWidth
    ctx.setLineDash([6, 4])
    ctx.lineDashOffset = phase * (isPositive ? 1 : -1) * 12

    // Right side
    ctx.beginPath()
    ctx.moveTo(cx + offset + curve, cy - lineH)
    ctx.bezierCurveTo(
      cx + offset - curve, cy - lineH * 0.5,
      cx + offset - curve, cy + lineH * 0.5,
      cx + offset + curve, cy + lineH
    )
    ctx.stroke()

    // Left side (mirror)
    ctx.beginPath()
    ctx.moveTo(cx - offset - curve, cy - lineH)
    ctx.bezierCurveTo(
      cx - offset + curve, cy - lineH * 0.5,
      cx - offset + curve, cy + lineH * 0.5,
      cx - offset - curve, cy + lineH
    )
    ctx.stroke()
    ctx.setLineDash([])

    // Arrows
    drawArrow(ctx, cx + offset, cy - coilFlatR - 3, dir, fieldColor(0.7), 4)
    drawArrow(ctx, cx - offset, cy - coilFlatR - 3, dir, fieldColor(0.7), 4)
  }

  // Step 3: Full circles at wire tips - count proportional to B
  const numCircles = Math.max(1, Math.round(1 + B_vis * 5)) // 1 (weak) → 6 (strong)
  for (let i = 0; i < numCircles; i++) {
    const r = 8 + i * 7
    const opacity = 0.4
    ctx.strokeStyle = fieldColor(opacity)
    ctx.lineWidth = baseLineWidth
    ctx.setLineDash([6, 4])
    ctx.lineDashOffset = phase * (isPositive ? 1 : -1) * 12

    ctx.beginPath()
    ctx.arc(wireLeftX, cy, r, 0, Math.PI * 2)
    ctx.stroke()

    ctx.beginPath()
    ctx.arc(wireRightX, cy, r, 0, Math.PI * 2)
    ctx.stroke()
    ctx.setLineDash([])

    const ay = isPositive ? cy - r : cy + r
    drawArrow(ctx, wireLeftX, ay, dir, fieldColor(0.8), 4)
    drawArrow(ctx, wireRightX, ay, dir, fieldColor(0.8), 4)
  }

  // ── Layer 3: Circular coil (3D perspective) ──
  // Back half (dim)
  ctx.strokeStyle = 'rgba(100,116,139,.35)'
  ctx.lineWidth = wireW
  ctx.lineCap = 'round'
  ctx.beginPath()
  ctx.ellipse(cx, cy, coilR, coilFlatR, 0, Math.PI, Math.PI * 2)
  ctx.stroke()

  // Front half (copper)
  const coilGrad = ctx.createLinearGradient(cx - coilR, 0, cx + coilR, 0)
  coilGrad.addColorStop(0, '#8B5E3C')
  coilGrad.addColorStop(0.2, '#C8895A')
  coilGrad.addColorStop(0.5, '#E8A87C')
  coilGrad.addColorStop(0.7, '#C8895A')
  coilGrad.addColorStop(1, '#8B5E3C')
  ctx.strokeStyle = coilGrad
  ctx.lineWidth = wireW
  ctx.beginPath()
  ctx.ellipse(cx, cy, coilR, coilFlatR, 0, 0, Math.PI)
  ctx.stroke()

  // Multi-turn stacking
  if (currentN > 1) {
    const spacing = Math.min(3, 30 / currentN)
    const turns = Math.min(Math.round(currentN), 12)
    for (let n = 1; n < turns; n++) {
      const oy = n * spacing
      ctx.strokeStyle = `rgba(100,116,139,${Math.max(0.12, 0.35 - n * 0.025)})`
      ctx.lineWidth = wireW * 0.8
      ctx.beginPath()
      ctx.ellipse(cx, cy - oy, coilR, coilFlatR, 0, Math.PI, Math.PI * 2)
      ctx.stroke()
      ctx.strokeStyle = `rgba(200,137,90,${Math.max(0.18, 0.45 - n * 0.025)})`
      ctx.beginPath()
      ctx.ellipse(cx, cy - oy, coilR, coilFlatR, 0, 0, Math.PI)
      ctx.stroke()
    }
  }

  // ── Layer 4: Current arrows on coil wire ──
  const arrowCount = 6
  const arrowSpeed = 0.3
  const arrowSize = 6
  for (let i = 0; i < arrowCount; i++) {
    const angle = (i / arrowCount) * Math.PI * 2 + phase * (isPositive ? arrowSpeed : -arrowSpeed)
    if (Math.sin(angle) < -0.1) continue
    const ax = cx + coilR * Math.cos(angle)
    const ay = cy + coilFlatR * Math.sin(angle)
    ctx.fillStyle = isPositive ? 'rgba(245,158,11,.7)' : 'rgba(59,130,246,.7)'
    const d = isPositive ? 1 : -1
    const tanX = -Math.sin(angle) * d
    const tanY = Math.cos(angle) * 0.32 * d
    const len = arrowSize
    ctx.beginPath()
    ctx.moveTo(ax + tanX * len, ay + tanY * len)
    ctx.lineTo(ax - tanX * len * 0.4 + tanY * len * 0.6, ay - tanY * len * 0.4 - tanX * len * 0.6)
    ctx.lineTo(ax - tanX * len * 0.4 - tanY * len * 0.6, ay - tanY * len * 0.4 + tanX * len * 0.6)
    ctx.closePath()
    ctx.fill()
  }

  // ── Layer 5: Battery ──
  ctx.fillStyle = '#1E2530'
  ctx.strokeStyle = '#5B8DB8'
  ctx.lineWidth = 2
  ctx.beginPath()
  ctx.roundRect(genX, genY, genW, genH, 6)
  ctx.fill(); ctx.stroke()
  ctx.fillStyle = '#f59e0b'
  ctx.font = '16px sans-serif'
  ctx.textAlign = 'center'
  ctx.fillText('🔋', genX + genW / 2 - 10, genY + 22)
  ctx.fillStyle = '#94a3b8'
  ctx.font = '8px sans-serif'
  ctx.fillText(t('experiments.emCanvasGenerator'), genX + genW / 2 + 12, genY + 22)
  ctx.fillStyle = isPositive ? '#f59e0b' : '#3b82f6'
  ctx.font = 'bold 12px monospace'
  ctx.fillText(`I = ${currentI.toFixed(1)} A`, genX + genW / 2, genY - 8)

  // ── Layer 6: Labels & indicators ──
  ctx.fillStyle = '#a855f7'
  ctx.font = '11px sans-serif'
  ctx.textAlign = 'center'
  ctx.fillText(`N = ${Math.round(currentN)} ${t('experiments.genTurns')}`, cx, cy - coilFlatR - 15)

  // Radius indicator
  ctx.strokeStyle = 'rgba(168,85,247,.25)'
  ctx.lineWidth = 1
  ctx.setLineDash([3, 3])
  ctx.beginPath()
  ctx.moveTo(cx, cy); ctx.lineTo(cx + coilR, cy)
  ctx.stroke()
  ctx.setLineDash([])
  ctx.fillStyle = 'rgba(168,85,247,.5)'
  ctx.font = '9px sans-serif'
  ctx.fillText('R', cx + coilR / 2, cy - 4)

  // Center point
  ctx.fillStyle = '#22c55e'
  ctx.beginPath()
  ctx.arc(cx, cy, 3, 0, Math.PI * 2)
  ctx.fill()
  ctx.fillStyle = '#64748b'
  ctx.font = '9px sans-serif'
  ctx.fillText(t('experiments.emCanvasCoilCenter'), cx, cy + 16)

  ctx.restore()

  // Probe icon (screen space)
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
    ctx.fillText('📡', probeIconPos.x, probeIconPos.y + 7)

    ctx.fillStyle = '#a855f7'
    ctx.font = '8px sans-serif'
    ctx.fillText(t('experiments.emCanvasHallProbe'), probeIconPos.x, probeIconPos.y + 35)
    ctx.fillStyle = '#64748b'
    ctx.font = '7px sans-serif'
    ctx.fillText(t('experiments.emProbeDragHint'), probeIconPos.x, probeIconPos.y + 45)
  }

  if (probeState === 'dragging' || probeState === 'placed') {
    const sx = (probePos.x - w / 2) * zoom + w / 2 + panX
    const sy = (probePos.y - h / 2) * zoom + h / 2 + panY

    // Line from center to probe (distance indicator)
    const wireScreenX = (cx - w / 2) * zoom + w / 2 + panX
    const wireScreenY = (cy - h / 2) * zoom + h / 2 + panY
    ctx.strokeStyle = 'rgba(168,85,247,.3)'
    ctx.lineWidth = 1
    ctx.setLineDash([2, 4])
    ctx.beginPath()
    ctx.moveTo(wireScreenX, wireScreenY)
    ctx.lineTo(sx, sy)
    ctx.stroke()
    ctx.setLineDash([])

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
    ctx.fillText('📡', sx, sy + 6)

    if (probeState === 'placed') {
      const Rcm = probeMeasured.R * 100
      const BuT = probeMeasured.B * 1e6

      ctx.fillStyle = 'rgba(168,85,247,.1)'
      ctx.strokeStyle = 'rgba(168,85,247,.3)'
      ctx.lineWidth = 1
      ctx.beginPath()
      ctx.roundRect(sx + 20, sy - 25, 140, 50, 6)
      ctx.fill()
      ctx.stroke()

      ctx.fillStyle = '#a855f7'
      ctx.font = 'bold 10px monospace'
      ctx.textAlign = 'left'
      ctx.fillText(`R = ${Rcm.toFixed(1)} cm`, sx + 26, sy - 8)
      ctx.fillText(`B = ${BuT.toFixed(2)} μT`, sx + 26, sy + 8)
      ctx.fillStyle = '#64748b'
      ctx.font = '7px sans-serif'
      ctx.fillText(t('experiments.emCanvasStableRecord'), sx + 26, sy + 20)
    }

    if (probeState === 'dragging') {
      ctx.fillStyle = '#a855f7'
      ctx.font = '9px sans-serif'
      ctx.textAlign = 'center'
      ctx.fillText(t('experiments.emCanvasReleaseToMeasure'), sx, sy + 28)
    }
  }

  ctx.fillStyle = '#64748b'
  ctx.font = '10px sans-serif'
  ctx.textAlign = 'left'
  ctx.fillText(`🔍 ${zoom.toFixed(1)}x  |  ${t('experiments.emZoomHint')}`, 10, h - 8)
}

function loop() {
  try {
    if (props.running && !props.paused) {
      phase += 0.02
    }
    
    // Smooth parameter transitions
    targetI = props.I
    targetN = props.N
    currentI += (targetI - currentI) * 0.3
    currentN += (targetN - currentN) * 0.3
    
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
  resize()
  window.addEventListener('resize', resize)
  const canvas = canvasRef.value
  if (canvas) {
    canvas.addEventListener('wheel', onWheel, { passive: false })
    canvas.addEventListener('mousedown', onMouseDown)
    canvas.addEventListener('mousemove', onMouseMove)
    canvas.addEventListener('mouseup', onMouseUp)
    canvas.addEventListener('mouseleave', onMouseUp)
    canvas.addEventListener('dblclick', onDoubleClick)
  }
  rafId = requestAnimationFrame(loop)
  
  // ResizeObserver: detect container size changes (layout shifts from panels)
  const parent = canvas?.parentElement
  if (parent) {
    resizeObserver = new ResizeObserver(() => {
      resize()
    })
    resizeObserver.observe(parent)
  }
  
  // Watchdog: restart loop if it somehow stops
  watchdogId = window.setInterval(() => {
    if (rafId === 0 && canvasRef.value) {
      rafId = requestAnimationFrame(loop)
    }
  }, 2000)
})

onUnmounted(() => {
  cancelAnimationFrame(rafId)
  rafId = 0
  if (watchdogId) clearInterval(watchdogId)
  if (resizeObserver) resizeObserver.disconnect()
  window.removeEventListener('resize', resize)
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

watch(() => [props.I, props.N], () => {
  if (probeState === 'placed') {
    const canvas = canvasRef.value
    if (!canvas) return
    const cx = canvas.width / 2
    const cy = canvas.height / 2
    const dxPx = probePos.x - cx
    const dyPx = probePos.y - cy
    const distPx = Math.sqrt(dxPx * dxPx + dyPx * dyPx)
    const Rmeters = distPx * (0.05 / 90) // 90px = 0.05m coil radius
    const B = (MU0 * currentN * currentI) / (2 * Math.max(Rmeters, 1e-6))
    probeMeasured = { R: Rmeters, B }
    emit('probe-placed', Rmeters, B)
  }
})
</script>

<template>
  <canvas ref="canvasRef" class="coil-canvas" />
</template>

<style scoped>
.coil-canvas { width: 100%; height: 100%; display: block; cursor: grab; }
.coil-canvas:active { cursor: grabbing; }
</style>
