<script setup lang="ts">
import { ref, onMounted, onUnmounted, watch } from 'vue'
import { useI18n } from '../../../composables/useI18n'
import {
  drawWires, drawFieldLines, drawCoil,
  drawCurrentArrows, drawBatteryAndLabels,
} from './circular-coil-helpers'
import { createProbeState } from './circular-coil-probe'
import { drawProbe, computeProbeReading } from './circular-coil-probe-draw'

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
let currentI = 0
let currentN = 0

const probe = createProbeState()

function getCanvasPos(e: MouseEvent): { x: number; y: number } {
  const canvas = canvasRef.value!
  const rect = canvas.getBoundingClientRect()
  return { x: e.clientX - rect.left, y: e.clientY - rect.top }
}

function screenToWorld(sx: number, sy: number): { x: number; y: number } {
  const w = cssW, h = cssH
  return { x: (sx - w / 2 - panX) / zoom + w / 2, y: (sy - h / 2 - panY) / zoom + h / 2 }
}

function onWheel(e: WheelEvent) {
  e.preventDefault()
  zoom = Math.max(0.3, Math.min(5, zoom * (e.deltaY > 0 ? 0.9 : 1.1)))
  draw()
}

function onMouseDown(e: MouseEvent) {
  const pos = getCanvasPos(e)
  if (probe.state === 'idle') {
    if (Math.abs(pos.x - probe.iconPos.x) < 25 && Math.abs(pos.y - probe.iconPos.y) < 25) {
      probe.state = 'dragging'
      probe.pos = screenToWorld(pos.x, pos.y)
      draw(); return
    }
  }
  if (probe.state === 'placed') {
    const sx = (probe.pos.x - cssW / 2) * zoom + cssW / 2 + panX
    const sy = (probe.pos.y - cssH / 2) * zoom + cssH / 2 + panY
    if (Math.abs(pos.x - sx) < 18 && Math.abs(pos.y - sy) < 18) {
      probe.state = 'dragging'; draw(); return
    }
  }
  isPanning = true
  panStart = { x: e.clientX - panX, y: e.clientY - panY }
}

function onMouseMove(e: MouseEvent) {
  if (probe.state === 'dragging') {
    probe.pos = screenToWorld(...Object.values(getCanvasPos(e)) as [number, number])
    draw(); return
  }
  if (!isPanning) return
  panX = e.clientX - panStart.x; panY = e.clientY - panStart.y; draw()
}

function onMouseUp() {
  if (probe.state === 'dragging') {
    probe.state = 'placed'
    const canvas = canvasRef.value!
    const reading = computeProbeReading(probe.pos, cssW, cssH, currentI, currentN)
    probe.measured = reading
    emit('probe-placed', reading.R, reading.B)
    draw()
  }
  isPanning = false
}

function onDoubleClick() { zoom = 1; panX = 0; panY = 0; draw() }

function draw() {
  const canvas = canvasRef.value; if (!canvas) return
  const ctx = canvas.getContext('2d'); if (!ctx) return
  if (cssW === 0 || cssH === 0) return
  const w = cssW, h = cssH, cx = w / 2, cy = h / 2
  const isPositive = currentI >= 0
  const coilR = 90, coilFlatR = coilR * 0.32, wireW = 6, genW = 70
  const genX = cx - genW / 2, genY = h - 80
  const wireLeftX = cx - coilR, wireRightX = cx + coilR, railY = cy + 45

  ctx.fillStyle = '#0b1220'; ctx.fillRect(0, 0, w, h)
  ctx.save()
  ctx.translate(w / 2 + panX, h / 2 + panY); ctx.scale(zoom, zoom); ctx.translate(-w / 2, -h / 2)
  drawWires(ctx, genX, genY, genW, wireLeftX, wireRightX, cy, railY)
  drawFieldLines(ctx, cx, cy, coilR, coilFlatR, wireLeftX, wireRightX, phase, isPositive, currentI, currentN)
  drawCoil(ctx, cx, cy, coilR, coilFlatR, wireW, currentN)
  drawCurrentArrows(ctx, cx, cy, coilR, coilFlatR, phase, isPositive)
  drawBatteryAndLabels(ctx, genX, genY, genW, cx, cy, coilR, coilFlatR, currentI, currentN, isPositive, t)
  ctx.restore()
  drawProbe(ctx, w, h, cx, cy, zoom, panX, panY, probe, currentI, currentN, t)
}

function loop() {
  try {
    if (props.running && !props.paused) phase += 0.02
    currentI += (props.I - currentI) * 0.3
    currentN += (props.N - currentN) * 0.3
    draw()
  } catch (e) { console.error('loop error:', e) }
  rafId = requestAnimationFrame(loop)
}

function resize() {
  const canvas = canvasRef.value; if (!canvas) return
  const parent = canvas.parentElement; if (!parent) return
  const dpr = window.devicePixelRatio || 1
  cssW = parent.clientWidth; cssH = parent.clientHeight
  canvas.width = cssW * dpr; canvas.height = cssH * dpr
  canvas.style.width = cssW + 'px'; canvas.style.height = cssH + 'px'
  const ctx = canvas.getContext('2d'); if (ctx) ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
  draw()
}

onMounted(() => {
  resize(); window.addEventListener('resize', resize)
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
  if (parent) { resizeObserver = new ResizeObserver(() => { resize() }); resizeObserver.observe(parent) }
  watchdogId = window.setInterval(() => { if (rafId === 0 && canvasRef.value) rafId = requestAnimationFrame(loop) }, 2000)
})

onUnmounted(() => {
  cancelAnimationFrame(rafId); rafId = 0
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
  if (probe.state === 'placed') {
    const canvas = canvasRef.value; if (!canvas) return
    const reading = computeProbeReading(probe.pos, cssW, cssH, currentI, currentN)
    probe.measured = reading
    emit('probe-placed', reading.R, reading.B)
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
