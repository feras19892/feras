<script setup lang="ts">
import { ref, onMounted, onUnmounted, watch } from 'vue'
import { useI18n } from '../../../composables/useI18n'
import {
  MU0, drawSolenoidWires, drawSolenoidFieldLines, drawSolenoidCoils,
  drawSolenoidCurrentArrows, drawSolenoidBatteryAndLabels,
} from './solenoid-helpers'

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
let cssW = 800, cssH = 400
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
  const w = cssW, h = cssH
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
    const sx = (probePos.x - cssW / 2) * zoom + cssW / 2 + panX
    const sy = (probePos.y - cssH / 2) * zoom + cssH / 2 + panY
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
    const cx = cssW / 2
    const dxPx = Math.abs(probePos.x - cx)
    const Lmeters = dxPx * (0.2 / 180)
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

function drawProbe(
  ctx: CanvasRenderingContext2D,
  w: number, h: number,
  cx: number, cy: number,
) {
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

function draw() {
  const canvas = canvasRef.value
  if (!canvas) return
  const ctx = canvas.getContext('2d')
  if (!ctx) return
  if (cssW === 0 || cssH === 0) return

  const w = cssW
  const h = cssH
  const cx = w / 2
  const cy = h / 2

  const isPositive = currentI >= 0

  const solenoidLen = 180
  const solenoidR = 50
  const solenoidFlatR = solenoidR * 0.35
  const wireW = 5
  const genW = 70
  const genX = cx - genW / 2
  const genY = h - 80
  const solenoidLeftX = cx - solenoidLen / 2
  const solenoidRightX = cx + solenoidLen / 2
  const railY = cy + 70

  ctx.fillStyle = '#0b1220'
  ctx.fillRect(0, 0, w, h)

  ctx.save()
  ctx.translate(w / 2 + panX, h / 2 + panY)
  ctx.scale(zoom, zoom)
  ctx.translate(-w / 2, -h / 2)

  drawSolenoidWires(ctx, genX, genY, genW, solenoidLeftX, solenoidRightX, cy, railY)
  drawSolenoidFieldLines(ctx, cx, cy, solenoidLeftX, solenoidRightX, solenoidLen, solenoidR, solenoidFlatR, phase, isPositive, currentI, currentN)
  const { turns, turnSpacing } = drawSolenoidCoils(ctx, solenoidLeftX, cy, solenoidLen, solenoidR, solenoidFlatR, wireW, currentN)
  drawSolenoidCurrentArrows(ctx, solenoidLeftX, cy, solenoidLen, solenoidR, solenoidFlatR, turnSpacing, turns, phase, isPositive)
  drawSolenoidBatteryAndLabels(ctx, genX, genY, genW, cx, cy, solenoidLeftX, solenoidRightX, solenoidFlatR, currentI, currentN, isPositive, t)

  ctx.restore()

  drawProbe(ctx, w, h, cx, cy)
}

function loop() {
  try {
    if (props.running && !props.paused) {
      phase += 0.02
    }
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
  const dpr = window.devicePixelRatio || 1
  cssW = parent.clientWidth; cssH = parent.clientHeight
  canvas.width = cssW * dpr; canvas.height = cssH * dpr
  canvas.style.width = cssW + 'px'; canvas.style.height = cssH + 'px'
  const ctx = canvas.getContext('2d'); if (ctx) ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
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

  const parent = canvas?.parentElement
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
    const cx = cssW / 2
    const dxPx = Math.abs(probePos.x - cx)
    const Lmeters = dxPx * (0.2 / 180)
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
