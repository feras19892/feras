<script setup lang="ts">
import { useI18n } from '@/composables/useI18n';
const { t } = useI18n();
import { ref, onMounted, onUnmounted, watch } from 'vue'

import {


  computeTorquePhysics, drawFieldLinesVertical, drawRotationAxis,
  drawCoil, drawNormalAndTorque, drawLabelsPanel,
} from './torque-helpers'




const props = defineProps<{
  I: number
  N: number
  a: number
  b: number
  bField: number
  theta: number
  running: boolean
  paused: boolean
}>()

const emit = defineEmits<{
  (e: 'probe-placed', theta: number, tau: number): void
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
let canvasEl: HTMLCanvasElement | null = null
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

let targetI = 2.0, currentI = 2.0
let targetN = 50, currentN = 50
let targetA_dim = 0.10, currentA_dim = 0.10
let targetB_dim = 0.08, currentB_dim = 0.08
let targetB = 0.1, currentB_val = 0.1
let targetTheta = 90, currentTheta = 90

let coilAngle = 0
let coilAngVel = 0

type ProbeState = 'idle' | 'dragging' | 'placed'
let probeState: ProbeState = 'idle'
let probePos = { x: 0, y: 0 }
let probeIconPos = { x: 0, y: 0 }
let probeMeasured = { theta: 0, tau: 0 }

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
    const _canvas = canvasRef.value!
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
    const cx = canvas.width / 2
    const cy = canvas.height / 2
    const dx = probePos.x - cx
    const dy = probePos.y - cy
    const angleRad = Math.atan2(dx, -dy)
    let angleDeg = angleRad * 180 / Math.PI
    if (angleDeg < 0) angleDeg += 360
    if (angleDeg > 180) angleDeg = 360 - angleDeg
    angleDeg = Math.min(180, Math.max(0, angleDeg))
    const A_val = currentA_dim * currentB_dim
    const mu_val = currentN * currentI * A_val
    const tau_val = mu_val * currentB_val * Math.sin(angleDeg * Math.PI / 180)
    probeMeasured = { theta: angleDeg, tau: tau_val }
    emit('probe-placed', angleDeg, tau_val)
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
    ctx.fillText(t('experiments.emCanvasAngleMeasure'), probeIconPos.x, probeIconPos.y + 35)
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
      ctx.fillStyle = 'rgba(168,85,247,.1)'
      ctx.strokeStyle = 'rgba(168,85,247,.3)'
      ctx.lineWidth = 1
      ctx.beginPath()
      ctx.roundRect(sx + 20, sy - 20, 150, 40, 6)
      ctx.fill()
      ctx.stroke()

      ctx.fillStyle = '#a855f7'
      ctx.font = 'bold 10px monospace'
      ctx.textAlign = 'left'
      ctx.fillText(`θ = ${probeMeasured.theta.toFixed(1)}°`, sx + 26, sy - 4)
      ctx.fillText(`τ = ${probeMeasured.tau.toExponential(2)} N·m`, sx + 26, sy + 10)
      ctx.fillStyle = '#64748b'
      ctx.font = '7px sans-serif'
      ctx.fillText(t('experiments.emCanvasStableRecord'), sx + 26, sy + 22)
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

  const { mu_val, tau_val } = computeTorquePhysics(currentN, currentI, currentA_dim, currentB_dim, currentB_val, currentTheta)

  const scale = Math.min(w, h) / 600
  const coilW = Math.max(20, currentA_dim * 800 * scale)
  const coilH = Math.max(20, currentB_dim * 800 * scale)

  ctx.fillStyle = '#0b1220'
  ctx.fillRect(0, 0, w, h)

  ctx.save()
  ctx.translate(w / 2 + panX, h / 2 + panY)
  ctx.scale(zoom, zoom)
  ctx.translate(-w / 2, -h / 2)

  drawFieldLinesVertical(ctx, w, h, cx, cy, currentB_val, t)
  drawRotationAxis(ctx, cx, cy, h, t)

  const thetaRad = currentTheta * Math.PI / 180
  const displayAngle = props.running && !props.paused ? coilAngle : thetaRad

  drawCoil(ctx, cx, cy, coilW, coilH, displayAngle, currentN, currentI, props.running)
  drawNormalAndTorque(ctx, cx, cy, coilH, displayAngle, tau_val, currentTheta)
  drawLabelsPanel(ctx, w, currentI, currentN, currentB_val, currentA_dim, currentB_dim, mu_val, tau_val, props.running, props.paused, t)

  ctx.restore()

  drawProbe(ctx, w, h)
}

function loop() {
  try {
    if (props.running && !props.paused) {
      _phase += 0.02
      const A_val = currentA_dim * currentB_dim
      const mu_val = currentN * currentI * A_val
      const thetaRad = coilAngle
      const tau_val = mu_val * currentB_val * Math.sin(thetaRad)
      const I_rot = Math.max(currentN * 0.01 * (currentA_dim ** 2 + currentB_dim ** 2) / 12, 1e-8)
      const alpha = -tau_val / I_rot
      const clampedAlpha = Math.max(-100, Math.min(100, alpha))
      coilAngVel += clampedAlpha * 0.016
      coilAngVel *= 0.995
      coilAngVel = Math.max(-10, Math.min(10, coilAngVel))
      coilAngle += coilAngVel * 0.016
      if (!isFinite(coilAngle)) { coilAngle = 0; coilAngVel = 0 }
      if (coilAngle > Math.PI) coilAngle -= Math.PI
      if (coilAngle < 0) coilAngle += Math.PI
    }

    targetI = props.I
    targetN = props.N
    targetA_dim = props.a
    targetB_dim = props.b
    targetB = props.bField
    targetTheta = props.theta
    currentI += (targetI - currentI) * 0.3
    currentN += (targetN - currentN) * 0.3
    currentA_dim += (targetA_dim - currentA_dim) * 0.3
    currentB_dim += (targetB_dim - currentB_dim) * 0.3
    currentB_val += (targetB - currentB_val) * 0.3
    currentTheta += (targetTheta - currentTheta) * 0.3

    if (!props.running || props.paused) {
      coilAngle = currentTheta * Math.PI / 180
    }

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
  canvasEl = canvas
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
  if (canvasEl) {
    canvasEl.removeEventListener('wheel', onWheel)
    canvasEl.removeEventListener('mousedown', onMouseDown)
    canvasEl.removeEventListener('mousemove', onMouseMove)
    canvasEl.removeEventListener('mouseup', onMouseUp)
    canvasEl.removeEventListener('mouseleave', onMouseUp)
    canvasEl.removeEventListener('dblclick', onDoubleClick)
    canvasEl = null
  }
})

watch(() => [props.I, props.N, props.a, props.b, props.bField, props.theta], () => {
  if (!props.running) {
    coilAngle = props.theta * Math.PI / 180
    coilAngVel = 0
  }
})

watch(() => props.running, (running) => {
  if (running) {
    coilAngle = props.theta * Math.PI / 180
    coilAngVel = 0
  } else {
    coilAngVel = 0
  }
})
</script>

<template>
  <canvas ref="canvasRef" class="torque-canvas" />
</template>

<style scoped>
.torque-canvas { width: 100%; height: 100%; display: block; cursor: grab; }
</style>
