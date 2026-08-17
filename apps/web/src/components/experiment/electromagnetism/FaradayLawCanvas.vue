<script setup lang="ts">
import { ref, onMounted, onUnmounted, watch } from 'vue'
import { useI18n } from '../../../composables/useI18n'
import {
  drawArrow, computeFaradayPhysics, drawFieldLines, drawCoil,
  drawInducedField, drawBarMagnet, drawEmfGraph, drawLabelsPanel,
} from './faraday-helpers'

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
let _phase = 0
let zoom = 1
let panX = 0
let panY = 0
let isPanning = false
let panStart = { x: 0, y: 0 }

let targetB = 0.5, currentB = 0.5
let targetN = 100, currentN = 100
let targetA = 0.01, currentA = 0.01
let targetV = 1.0, currentV = 1.0
let targetR = 10, currentR = 10
let targetD = 0.05, currentD = 0.05

let magnetX = -0.3
let magnetDir = 1

let emfHistory: number[] = []
const EMF_HISTORY_LEN = 200
let emfMaxCached = 0

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
    const canvas = canvasRef.value!
    const w = canvas.width
    const cx = w / 2
    const scale = Math.min(w, canvas.height) / 600
    const physX = (probePos.x - cx) / (600 * scale)
    const { emf, i, flux, direction } = computeFaradayPhysics(
      physX, currentB, currentN, currentA, currentV, currentR, currentD, magnetDir,
    )
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

  const { emf, i, direction } = computeFaradayPhysics(
    magnetX, currentB, currentN, currentA, currentV, currentR, currentD, magnetDir,
  )

  const scale = Math.min(w, h) / 600
  const coilR = Math.max(10, Math.min(300, Math.sqrt(Math.max(currentA, 1e-6) / Math.PI) * 1500 * scale))
  const magnetW = 30 * scale
  const magnetH = 80 * scale
  const magnetPxX = cx + magnetX * 600 * scale

  ctx.fillStyle = '#0b1220'
  ctx.fillRect(0, 0, w, h)

  ctx.save()
  ctx.translate(w / 2 + panX, h / 2 + panY)
  ctx.scale(zoom, zoom)
  ctx.translate(-w / 2, -h / 2)

  drawFieldLines(ctx, magnetPxX, cy, scale, currentB)

  const coilW = 20 * scale
  drawCoil(ctx, cx, cy, coilW, coilR, currentN)

  drawInducedField(ctx, cx, cy, scale, emf, i, direction, props.mode === 'lenz')

  drawBarMagnet(ctx, magnetPxX, cy, magnetW, magnetH, scale)

  if (props.running && !props.paused && currentV > 0.01) {
    const arrowLen = 30 * scale * (currentV / 2)
    drawArrow(ctx, magnetPxX + magnetDir * (magnetW / 2 + arrowLen), cy,
      magnetDir > 0 ? 0 : Math.PI, '#22c55e', 8)
    ctx.fillStyle = '#22c55e'
    ctx.font = `bold ${10 * scale}px monospace`
    ctx.textAlign = 'center'
    ctx.fillText(`v=${currentV.toFixed(1)}m/s`, magnetPxX + magnetDir * (magnetW / 2 + arrowLen + 20), cy - 5)
  }

  drawEmfGraph(ctx, w, h, emfHistory, emfMaxCached, EMF_HISTORY_LEN, props.mode === 'lenz', t)

  if (Math.abs(emf) > 1e-8) {
    const currentDir = emf > 0 ? 1 : -1
    const intensity = Math.min(1, Math.abs(i) * 10)
    ctx.fillStyle = `rgba(245,158,11,${0.3 + intensity * 0.5})`
    ctx.font = 'bold 11px sans-serif'
    ctx.textAlign = 'center'
    const dirText = currentDir > 0 ? `⇈ ${t('experiments.emCanvasInducedCurrent')}` : `⇊ ${t('experiments.emCanvasInducedCurrent')}`
    ctx.fillText(dirText, cx, cy - coilR - 15)
    if (props.mode === 'lenz') {
      ctx.fillStyle = direction === 'opposing' ? '#ef4444' : '#22c55e'
      ctx.font = 'bold 10px sans-serif'
      ctx.fillText(direction === 'opposing' ? t('experiments.emCanvasOpposingLenz') : t('experiments.emCanvasAssistingLenz'), cx, cy - coilR - 30)
    }
  }

  ctx.restore()

  drawLabelsPanel(ctx, w, currentB, currentN, currentV, currentR, emf, i, props.running, props.paused, t)

  drawProbe(ctx, w, h)
}

function loop() {
  try {
    if (props.running && !props.paused) {
      _phase += 0.02
      const dt = 0.016
      magnetX += magnetDir * currentV * dt
      if (magnetX > 0.35) { magnetX = 0.35; magnetDir = -1 }
      if (magnetX < -0.35) { magnetX = -0.35; magnetDir = 1 }
      const { emf } = computeFaradayPhysics(
        magnetX, currentB, currentN, currentA, currentV, currentR, currentD, magnetDir,
      )
      emfHistory.push(emf)
      if (emfHistory.length > EMF_HISTORY_LEN) emfHistory.shift()
      emfMaxCached = Math.max(emfMaxCached, Math.abs(emf))
    }

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
