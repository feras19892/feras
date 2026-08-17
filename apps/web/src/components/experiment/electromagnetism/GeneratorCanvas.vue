<script setup lang="ts">
import { ref, onMounted, onUnmounted, watch } from 'vue'
import { useI18n } from '../../../composables/useI18n'
import {
  computeGeneratorPhysics, drawMagnetPoles, drawFieldLines,
  drawRotatingCoil, drawCurrentIndicators, drawLabelsPanel, drawEmfGraph,
} from './generator-helpers'

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
let zoom = 1
let panX = 0
let panY = 0
let isPanning = false
let panStart = { x: 0, y: 0 }

let targetB = 0.5, currentB = 0.5
let targetN = 100, currentN = 100
let targetA = 0.01, currentA = 0.01
let targetOmega = 10, currentOmega = 10
let targetR = 10, currentR = 10

let theta = 0
let emfHistory: number[] = []
const EMF_HISTORY_LEN = 200
let emfMaxCached = 0

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
      probeState = 'dragging'
      probePos = screenToWorld(pos.x, pos.y)
      draw()
      return
    }
  }
  if (probeState === 'placed') {
    const canvas = canvasRef.value!
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

function drawProbe(
  ctx: CanvasRenderingContext2D,
  w: number, h: number,
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
  const cy = h / 2 - 40

  const { flux, emf, i } = computeGeneratorPhysics(theta, currentN, currentB, currentA, currentOmega, currentR)
  const scale = Math.min(w, h) / 600

  ctx.fillStyle = '#0b1220'
  ctx.fillRect(0, 0, w, h)

  ctx.save()
  ctx.translate(w / 2 + panX, h / 2 + panY)
  ctx.scale(zoom, zoom)
  ctx.translate(-w / 2, -h / 2)

  const { gap, poleH } = drawMagnetPoles(ctx, cx, cy, scale)
  drawFieldLines(ctx, cx, cy, scale, gap, poleH, currentB)
  const { projW } = drawRotatingCoil(ctx, cx, cy, scale, theta, currentA, currentOmega)
  drawCurrentIndicators(ctx, cx, cy, scale, projW, emf, i)

  ctx.restore()

  drawLabelsPanel(ctx, w, currentB, currentN, currentOmega, currentR, emf, i, flux, props.running, props.paused, t)
  drawEmfGraph(ctx, w, h, emfHistory, emfMaxCached, EMF_HISTORY_LEN, t)
  drawProbe(ctx, w, h)
}

function loop() {
  try {
    if (props.running && !props.paused) {
      const dt = 0.016
      theta += currentOmega * dt
      if (theta > Math.PI * 4) theta -= Math.PI * 2
      const { emf } = computeGeneratorPhysics(theta, currentN, currentB, currentA, currentOmega, currentR)
      emfHistory.push(emf)
      if (emfHistory.length > EMF_HISTORY_LEN) emfHistory.shift()
      emfMaxCached = Math.max(emfMaxCached, Math.abs(emf))
    }

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
  const dpr = window.devicePixelRatio || 1
  cssW = parent.clientWidth; cssH = parent.clientHeight
  canvas.width = cssW * dpr; canvas.height = cssH * dpr
  canvas.style.width = cssW + 'px'; canvas.style.height = cssH + 'px'
  const ctx = canvas.getContext('2d'); if (ctx) ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
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
