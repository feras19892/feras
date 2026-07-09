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
  (e: 'probe-placed', L: number, B: number): void
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
let probeMeasured = { L: 0, B: 0 }
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
    const _cy = canvas.height / 2
    const dxPx = Math.abs(probePos.x - cx)
    const Lmeters = dxPx * (0.2 / 180) // 180px = 0.2m solenoid length
    const B = (MU0 * currentN * currentI) / Math.max(Lmeters, 1e-6)
    probeMeasured = { L: Lmeters, B }
    emit('probe-placed', Lmeters, B)
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

function drawArrow(ctx: CanvasRenderingContext2D, x: number, y: number, dir: 'right' | 'left', color: string, size = 5) {
  ctx.fillStyle = color
  ctx.beginPath()
  if (dir === 'right') {
    ctx.moveTo(x + size, y)
    ctx.lineTo(x - size * 0.6, y - size * 0.8)
    ctx.lineTo(x - size * 0.6, y + size * 0.8)
  } else {
    ctx.moveTo(x - size, y)
    ctx.lineTo(x + size * 0.6, y - size * 0.8)
    ctx.lineTo(x + size * 0.6, y + size * 0.8)
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
  const dir: 'right' | 'left' = isPositive ? 'right' : 'left'

  // Layout constants
  const solenoidLen = 180
  const solenoidR = 50
  const solenoidFlatR = solenoidR * 0.35
  const wireW = 5
  const genW = 70
  const genH = 40
  const genX = cx - genW / 2
  const genY = h - 80
  const solenoidLeftX = cx - solenoidLen / 2
  const solenoidRightX = cx + solenoidLen / 2

  // Background
  ctx.fillStyle = '#0b1220'
  ctx.fillRect(0, 0, w, h)

  ctx.save()
  ctx.translate(w / 2 + panX, h / 2 + panY)
  ctx.scale(zoom, zoom)
  ctx.translate(-w / 2, -h / 2)

  // ── Layer 1: Connecting wires (battery → solenoid) ──
  ctx.strokeStyle = '#5B8DB8'
  ctx.lineWidth = 3
  ctx.lineCap = 'round'
  ctx.lineJoin = 'round'
  const railY = cy + 70
  ctx.beginPath()
  ctx.moveTo(genX + 10, genY); ctx.lineTo(genX + 10, railY)
  ctx.lineTo(solenoidLeftX - 10, railY); ctx.lineTo(solenoidLeftX - 10, cy); ctx.lineTo(solenoidLeftX, cy)
  ctx.moveTo(genX + genW - 10, genY); ctx.lineTo(genX + genW - 10, railY)
  ctx.lineTo(solenoidRightX + 10, railY); ctx.lineTo(solenoidRightX + 10, cy); ctx.lineTo(solenoidRightX, cy)
  ctx.stroke()

  // ── Layer 2: Magnetic field lines (inside and outside solenoid) ──
  // Number of lines proportional to B = μ₀NI/L — the actual physics law
  const fieldColor = (opacity: number) => `rgba(34, 197, 94, ${opacity})`
  const baseLineWidth = 1.5

  // B calculation using actual physics law
  const L_coil = 0.2 // solenoid length in meters (180px = 0.2m)
  const B_actual = (MU0 * Math.abs(currentI) * currentN) / L_coil
  const B_max = (MU0 * 50 * 500) / L_coil // max I=50A, max N=500 (from param panel)
  const B_ratio = Math.min(1, B_actual / B_max)

  // Inside solenoid: straight parallel lines, count scales with B (sqrt for better visual range)
  const B_vis = Math.sqrt(B_ratio) // sqrt makes small changes more visible
  const totalLines = Math.max(2, Math.round(2 + B_vis * 10)) // 2 (weak) → 12 (strong)
  const lineSpacing = (solenoidFlatR * 0.6) / Math.max(totalLines - 1, 1)
  for (let i = 0; i < totalLines; i++) {
    const offset = (i - (totalLines - 1) / 2) * lineSpacing
    const opacity = 0.4
    
    ctx.strokeStyle = fieldColor(opacity)
    ctx.lineWidth = baseLineWidth
    ctx.setLineDash([8, 4])
    ctx.lineDashOffset = phase * (isPositive ? 1 : -1) * 15

    ctx.beginPath()
    ctx.moveTo(solenoidLeftX, cy + offset)
    ctx.lineTo(solenoidRightX, cy + offset)
    ctx.stroke()
    ctx.setLineDash([])
    
    // Arrow inside
    const arrowX = solenoidLeftX + solenoidLen / 2
    drawArrow(ctx, arrowX, cy + offset, dir, fieldColor(0.8), 5)
  }

  // Outside solenoid: curved dipole-like field lines, count scales with B
  const outerLineCount = Math.max(1, Math.round(1 + B_vis * 6)) // 1 (weak) → 7 (strong)
  for (let i = 0; i < outerLineCount; i++) {
    const outerR = solenoidR + 20 + i * 25
    const opacity = 0.2
    
    ctx.strokeStyle = fieldColor(opacity)
    ctx.lineWidth = 1.2
    ctx.setLineDash([6, 4])
    ctx.lineDashOffset = phase * (isPositive ? 1 : -1) * 10

    // Top field line - exits left, curves over top, enters right
    ctx.beginPath()
    ctx.moveTo(solenoidLeftX, cy - solenoidFlatR)
    ctx.bezierCurveTo(
      solenoidLeftX - outerR, cy - solenoidFlatR - outerR * 0.8,
      solenoidRightX + outerR, cy - solenoidFlatR - outerR * 0.8,
      solenoidRightX, cy - solenoidFlatR
    )
    ctx.stroke()

    // Bottom field line
    ctx.beginPath()
    ctx.moveTo(solenoidRightX, cy + solenoidFlatR)
    ctx.bezierCurveTo(
      solenoidRightX + outerR, cy + solenoidFlatR + outerR * 0.8,
      solenoidLeftX - outerR, cy + solenoidFlatR + outerR * 0.8,
      solenoidLeftX, cy + solenoidFlatR
    )
    ctx.stroke()
    
    ctx.setLineDash([])
  }

  // ── Layer 3: Solenoid coils (3D perspective) ──
  const turns = Math.min(Math.round(currentN), 15)
  const turnSpacing = solenoidLen / turns

  for (let n = 0; n < turns; n++) {
    const tx = solenoidLeftX + n * turnSpacing + turnSpacing / 2
    
    // Back half (dim)
    ctx.strokeStyle = 'rgba(100,116,139,.4)'
    ctx.lineWidth = wireW
    ctx.lineCap = 'round'
    ctx.beginPath()
    ctx.ellipse(tx, cy, solenoidR * 0.3, solenoidFlatR, 0, Math.PI, Math.PI * 2)
    ctx.stroke()

    // Front half (copper)
    const coilGrad = ctx.createLinearGradient(tx - solenoidR * 0.3, 0, tx + solenoidR * 0.3, 0)
    coilGrad.addColorStop(0, '#8B5E3C')
    coilGrad.addColorStop(0.3, '#C8895A')
    coilGrad.addColorStop(0.5, '#E8A87C')
    coilGrad.addColorStop(0.7, '#C8895A')
    coilGrad.addColorStop(1, '#8B5E3C')
    ctx.strokeStyle = coilGrad
    ctx.lineWidth = wireW
    ctx.beginPath()
    ctx.ellipse(tx, cy, solenoidR * 0.3, solenoidFlatR, 0, 0, Math.PI)
    ctx.stroke()
  }

  // ── Layer 4: Current arrows on coils ──
  const arrowCount = Math.min(turns, 8)
  const arrowSpeed = 0.4
  const arrowSize = 5
  for (let i = 0; i < arrowCount; i++) {
    const tx = solenoidLeftX + (i / arrowCount) * solenoidLen + turnSpacing / 2
    const angle = phase * (isPositive ? arrowSpeed : -arrowSpeed)
    const ax = tx + solenoidR * 0.3 * Math.cos(angle)
    const ay = cy + solenoidFlatR * Math.sin(angle)
    
    if (Math.sin(angle) < -0.2) continue
    
    ctx.fillStyle = isPositive ? 'rgba(245,158,11,.7)' : 'rgba(59,130,246,.7)'
    const d = isPositive ? 1 : -1
    const tanX = -Math.sin(angle) * d
    const tanY = Math.cos(angle) * 0.35 * d
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
  ctx.fillText(`N = ${Math.round(currentN)} ${t('experiments.genTurns')}`, cx, cy - solenoidFlatR - 25)

  // Length indicator
  ctx.strokeStyle = 'rgba(168,85,247,.25)'
  ctx.lineWidth = 1
  ctx.setLineDash([3, 3])
  ctx.beginPath()
  ctx.moveTo(solenoidLeftX, cy + solenoidFlatR + 20)
  ctx.lineTo(solenoidRightX, cy + solenoidFlatR + 20)
  ctx.stroke()
  ctx.setLineDash([])
  
  // End markers
  ctx.strokeStyle = 'rgba(168,85,247,.4)'
  ctx.lineWidth = 1
  ctx.beginPath()
  ctx.moveTo(solenoidLeftX, cy + solenoidFlatR + 15)
  ctx.lineTo(solenoidLeftX, cy + solenoidFlatR + 25)
  ctx.moveTo(solenoidRightX, cy + solenoidFlatR + 15)
  ctx.lineTo(solenoidRightX, cy + solenoidFlatR + 25)
  ctx.stroke()
  
  ctx.fillStyle = 'rgba(168,85,247,.5)'
  ctx.font = '9px sans-serif'
  ctx.fillText('L', cx, cy + solenoidFlatR + 32)

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
      const Lcm = probeMeasured.L * 100
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
      ctx.fillText(`L = ${Lcm.toFixed(1)} cm`, sx + 26, sy - 8)
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
  
  // ResizeObserver: detect container size changes
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
    const dxPx = Math.abs(probePos.x - cx)
    const Lmeters = dxPx * (0.2 / 180) // 180px = 0.2m solenoid length
    const B = (MU0 * currentN * currentI) / Math.max(Lmeters, 1e-6)
    probeMeasured = { L: Lmeters, B }
    emit('probe-placed', Lmeters, B)
  }
})
</script>

<template>
  <canvas ref="canvasRef" class="solenoid-canvas" />
</template>

<style scoped>
.solenoid-canvas { width: 100%; height: 100%; display: block; cursor: grab; }
.solenoid-canvas:active { cursor: grabbing; }
</style>
