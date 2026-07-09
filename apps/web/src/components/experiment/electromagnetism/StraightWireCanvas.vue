<script setup lang="ts">
import { ref, onMounted, onUnmounted, watch } from 'vue'
import { useI18n } from '../../../composables/useI18n'
const { t } = useI18n()

const props = defineProps<{
  I: number
  running: boolean
  paused: boolean
}>()

const emit = defineEmits<{
  (e: 'probe-placed', r: number, B: number): void
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

type ProbeState = 'idle' | 'dragging' | 'placed'
let probeState: ProbeState = 'idle'
let probePos = { x: 0, y: 0 }
let probeMeasured = { r: 0, B: 0 }
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
    const dxPx = Math.abs(probePos.x - cx)
    const rMeters = dxPx * (0.05 / 100) // 100px = 0.05m reference distance
    const B = (MU0 * currentI) / (2 * Math.PI * Math.max(rMeters, 1e-6))
    probeMeasured = { r: rMeters, B }
    emit('probe-placed', rMeters, B)
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

function draw() {
  const canvas = canvasRef.value
  if (!canvas) return
  const ctx = canvas.getContext('2d')
  if (!ctx) return
  if (canvas.width === 0 || canvas.height === 0) return

  const w = canvas.width
  const h = canvas.height

  ctx.fillStyle = '#0b1220'
  ctx.fillRect(0, 0, w, h)

  ctx.save()
  ctx.translate(w / 2 + panX, h / 2 + panY)
  ctx.scale(zoom, zoom)
  ctx.translate(-w / 2, -h / 2)

  const cx = w / 2
  const cy = h / 2

  const isPositive = currentI >= 0
  const absI = Math.abs(currentI)

  const wireLen = h * 0.35
  const wireY1 = cy - wireLen / 2
  const wireY2 = cy + wireLen / 2
  const wireW = 12

  const genW = 80
  const genH = 44
  const genX = cx - genW / 2
  const genY = 30
  const genBottom = genY + genH

  const loopRightX = cx + Math.min(120, w * 0.2)
  const loopBottomY = wireY2 + 50

  ctx.strokeStyle = '#5B8DB8'
  ctx.lineWidth = 3
  ctx.lineCap = 'round'
  ctx.lineJoin = 'round'

  ctx.beginPath()
  ctx.moveTo(cx, genBottom)
  ctx.lineTo(cx, wireY1)
  ctx.stroke()

  ctx.beginPath()
  ctx.moveTo(cx, wireY2)
  ctx.lineTo(cx, loopBottomY)
  ctx.lineTo(loopRightX, loopBottomY)
  ctx.lineTo(loopRightX, genY + genH / 2)
  ctx.lineTo(genX + genW, genY + genH / 2)
  ctx.stroke()

  ctx.fillStyle = '#1E2530'
  ctx.strokeStyle = '#5B8DB8'
  ctx.lineWidth = 2
  ctx.beginPath()
  ctx.roundRect(genX, genY, genW, genH, 6)
  ctx.fill()
  ctx.stroke()

  ctx.fillStyle = '#f59e0b'
  ctx.font = '18px sans-serif'
  ctx.textAlign = 'center'
  ctx.fillText('🔋', genX + genW / 2 - 12, genY + 22)
  ctx.fillStyle = '#94a3b8'
  ctx.font = '9px sans-serif'
  ctx.fillText(t('experiments.emCanvasGenerator'), genX + genW / 2 + 12, genY + 22)

  const grad = ctx.createLinearGradient(cx - wireW / 2, 0, cx + wireW / 2, 0)
  grad.addColorStop(0, '#6B7280')
  grad.addColorStop(0.3, '#B8C0CC')
  grad.addColorStop(0.5, '#E8EDF2')
  grad.addColorStop(0.7, '#B8C0CC')
  grad.addColorStop(1, '#6B7280')
  ctx.fillStyle = grad
  ctx.strokeStyle = '#475569'
  ctx.lineWidth = 1
  ctx.beginPath()
  ctx.roundRect(cx - wireW / 2, wireY1, wireW, wireLen, 4)
  ctx.fill()
  ctx.stroke()

  ctx.fillStyle = '#64748b'
  ctx.font = '10px sans-serif'
  ctx.textAlign = 'right'
  ctx.fillText(t('experiments.emCanvasMetalRod'), cx - wireW / 2 - 6, cy + 3)

  const arrowCount = Math.max(3, Math.floor(wireLen / 40))
  const arrowSpacing = wireLen / (arrowCount + 1)

  for (let i = 1; i <= arrowCount; i++) {
    const offset = ((phase * (25 + absI * 3)) % wireLen + wireLen) % wireLen
    const ayAnim = wireY1 + ((arrowSpacing * i + offset) % wireLen)

    ctx.fillStyle = isPositive ? 'rgba(245,158,11,.85)' : 'rgba(59,130,246,.85)'
    ctx.beginPath()
    ctx.moveTo(cx, ayAnim - 5)
    ctx.lineTo(cx - 4, ayAnim + 3)
    ctx.lineTo(cx + 4, ayAnim + 3)
    ctx.closePath()
    ctx.fill()
  }

  const wireTopLen = wireY1 - genBottom
  const topArrowCount = Math.max(2, Math.floor(wireTopLen / 40))
  for (let i = 1; i <= topArrowCount; i++) {
    const offset = ((phase * (25 + absI * 3)) % wireTopLen + wireTopLen) % wireTopLen
    const ayAnim = genBottom + ((wireTopLen / (topArrowCount + 1) * i + offset) % wireTopLen)
    if (ayAnim > wireY1 - 5) continue

    ctx.fillStyle = isPositive ? 'rgba(245,158,11,.6)' : 'rgba(59,130,246,.6)'
    ctx.beginPath()
    ctx.moveTo(cx, ayAnim + 4)
    ctx.lineTo(cx - 3, ayAnim - 2)
    ctx.lineTo(cx + 3, ayAnim - 2)
    ctx.closePath()
    ctx.fill()
  }

  const wireBotLen = loopBottomY - wireY2
  const botArrowCount = Math.max(2, Math.floor(wireBotLen / 40))
  for (let i = 1; i <= botArrowCount; i++) {
    const offset = ((phase * (25 + absI * 3)) % wireBotLen + wireBotLen) % wireBotLen
    const ayAnim = wireY2 + ((wireBotLen / (botArrowCount + 1) * i + offset) % wireBotLen)
    if (ayAnim > loopBottomY - 5) continue

    ctx.fillStyle = isPositive ? 'rgba(245,158,11,.6)' : 'rgba(59,130,246,.6)'
    ctx.beginPath()
    ctx.moveTo(cx, ayAnim + 4)
    ctx.lineTo(cx - 3, ayAnim - 2)
    ctx.lineTo(cx + 3, ayAnim - 2)
    ctx.closePath()
    ctx.fill()
  }

  ctx.fillStyle = isPositive ? '#f59e0b' : '#3b82f6'
  ctx.font = 'bold 13px monospace'
  ctx.textAlign = 'center'
  ctx.fillText(`I = ${currentI.toFixed(1)} A`, genX + genW / 2, genY - 10)

  // Field rings: count scales with B = μ₀I/(2πr)
  const B_actual = (MU0 * absI) / (2 * Math.PI * 0.05) // at reference r=0.05m
  const B_max = (MU0 * 50) / (2 * Math.PI * 0.05) // max I=50A
  const B_ratio = Math.min(1, B_actual / B_max)
  const B_vis = Math.sqrt(B_ratio)
  const maxRings = Math.max(2, Math.round(2 + B_vis * 6)) // 2 (weak) → 8 (strong)
  const baseRingR = 40
  for (let i = 0; i < maxRings; i++) {
    const ringR = baseRingR * (i + 1)
    if (ringR > Math.min(w, h) / 2.5) break

    const opacity = Math.max(0.08, 0.5 - i * 0.08)
    ctx.strokeStyle = `rgba(34, 197, 94, ${opacity})`
    ctx.lineWidth = 1.5
    ctx.setLineDash([5, 5])
    ctx.lineDashOffset = phase * (isPositive ? 1 : -1) * (15 + absI * 2)

    ctx.beginPath()
    ctx.ellipse(cx, cy, ringR, ringR * 0.35, 0, 0, Math.PI * 2)
    ctx.stroke()
  }
  ctx.setLineDash([])

  ctx.restore()

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

    const wireScreenX = (cx - w / 2) * zoom + w / 2 + panX
    ctx.strokeStyle = 'rgba(168,85,247,.3)'
    ctx.lineWidth = 1
    ctx.setLineDash([2, 4])
    ctx.beginPath()
    ctx.moveTo(wireScreenX, 0)
    ctx.lineTo(wireScreenX, h)
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
      const rCm = probeMeasured.r * 100
      const BuT = probeMeasured.B * 1e6

      ctx.fillStyle = 'rgba(168,85,247,.1)'
      ctx.strokeStyle = 'rgba(168,85,247,.3)'
      ctx.lineWidth = 1
      ctx.beginPath()
      ctx.roundRect(sx + 20, sy - 25, 130, 50, 6)
      ctx.fill()
      ctx.stroke()

      ctx.fillStyle = '#a855f7'
      ctx.font = 'bold 10px monospace'
      ctx.textAlign = 'left'
      ctx.fillText(`r = ${rCm.toFixed(1)} cm`, sx + 26, sy - 8)
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
    currentI += (targetI - currentI) * 0.3
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

  // ResizeObserver
  const parent = canvas?.parentElement
  if (parent) {
    resizeObserver = new ResizeObserver(() => { resize() })
    resizeObserver.observe(parent)
  }

  // Watchdog
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

watch(() => [props.I], () => {
  if (probeState === 'placed') {
    const canvas = canvasRef.value
    if (!canvas) return
    const cx = canvas.width / 2
    const dxPx = Math.abs(probePos.x - cx)
    const rMeters = dxPx * (0.05 / 100) // 100px = 0.05m
    const B = (MU0 * currentI) / (2 * Math.PI * Math.max(rMeters, 1e-6))
    probeMeasured = { r: rMeters, B }
    emit('probe-placed', rMeters, B)
  }
})
</script>

<template>
  <canvas ref="canvasRef" class="wire-canvas" />
</template>

<style scoped>
.wire-canvas { width: 100%; height: 100%; display: block; cursor: grab; }
.wire-canvas:active { cursor: grabbing; }
</style>
