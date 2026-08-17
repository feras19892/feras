<script setup lang="ts">
import { ref, onMounted, onUnmounted, watch } from 'vue'
import { useI18n } from '../../../composables/useI18n'
import {
  E_CHARGE, E_MASS, R_MAX_VIS,
  computePhysics, drawHelmholtzCoil,
  drawFieldIndicators, drawTube, drawElectronGun, drawLabels,
} from './lorentz-helpers'

const { t } = useI18n()

const props = defineProps<{
  V: number
  I: number
  N: number
  R: number
  running: boolean
  paused: boolean
}>()

const emit = defineEmits<{
  (e: 'probe-placed', r: number): void
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

let currentTubeR = 150

let targetV = 200
let currentV_val = 200
let targetI = 1.0
let currentI = 1.0
let targetN = 130
let currentN = 130

let particleAngle = 0
let particleTrail: { x: number; y: number }[] = []

type ProbeState = 'idle' | 'dragging' | 'placed'
let probeState: ProbeState = 'idle'
let probePos = { x: 0, y: 0 }
let probeMeasured = { r: 0 }
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
    const cx = canvas.width / 2
    const cy = canvas.height / 2
    const dxPx = probePos.x - cx
    const dyPx = probePos.y - cy
    const distPx = Math.sqrt(dxPx * dxPx + dyPx * dyPx)
    const tt = distPx / (currentTubeR * 0.92)
    const Rmeters = Math.min(R_MAX_VIS, Math.max(0, tt * tt * R_MAX_VIS))
    probeMeasured = { r: Rmeters }
    emit('probe-placed', Rmeters)
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

function drawBeam(
  ctx: CanvasRenderingContext2D,
  cx: number, cy: number, tubeR: number, visualR: number,
  B_val: number, omega: number, beamOn: boolean,
) {
  const beamColor = 'rgba(34,197,94,'
  const beamGlow = 'rgba(74,222,128,'
  const particleR = 9

  if (beamOn && B_val > 1e-15) {
    ctx.strokeStyle = beamColor + '0.12)'
    ctx.lineWidth = 12
    ctx.beginPath()
    ctx.arc(cx, cy, visualR, 0, Math.PI * 2)
    ctx.stroke()

    ctx.strokeStyle = beamColor + '0.35)'
    ctx.lineWidth = 5
    ctx.beginPath()
    ctx.arc(cx, cy, visualR, 0, Math.PI * 2)
    ctx.stroke()

    ctx.strokeStyle = beamGlow + '0.9)'
    ctx.lineWidth = 2
    ctx.beginPath()
    ctx.arc(cx, cy, visualR, 0, Math.PI * 2)
    ctx.stroke()

    const direction = currentI >= 0 ? 1 : -1
    particleAngle += omega * direction

    const px = cx + visualR * Math.cos(particleAngle)
    const py = cy + visualR * Math.sin(particleAngle)

    particleTrail.push({ x: px, y: py })
    if (particleTrail.length > 100) particleTrail.shift()

    for (let i = 0; i < particleTrail.length - 1; i++) {
      const alpha = (i / particleTrail.length) * 0.8
      ctx.strokeStyle = beamGlow + alpha + ')'
      ctx.lineWidth = 4
      ctx.beginPath()
      ctx.moveTo(particleTrail[i].x, particleTrail[i].y)
      ctx.lineTo(particleTrail[i + 1].x, particleTrail[i + 1].y)
      ctx.stroke()
    }

    const pulseR = particleR + Math.sin(phase * 3) * 2
    ctx.fillStyle = beamGlow + '0.25)'
    ctx.beginPath()
    ctx.arc(px, py, pulseR * 3, 0, Math.PI * 2)
    ctx.fill()

    ctx.fillStyle = beamGlow + '0.5)'
    ctx.beginPath()
    ctx.arc(px, py, pulseR * 1.8, 0, Math.PI * 2)
    ctx.fill()

    ctx.fillStyle = '#aaffaa'
    ctx.beginPath()
    ctx.arc(px, py, pulseR, 0, Math.PI * 2)
    ctx.fill()

    ctx.strokeStyle = 'rgba(168,85,247,.5)'
    ctx.lineWidth = 1.5
    ctx.setLineDash([5, 5])
    ctx.beginPath()
    ctx.moveTo(cx, cy)
    ctx.lineTo(px, py)
    ctx.stroke()
    ctx.setLineDash([])
    ctx.fillStyle = 'rgba(168,85,247,.9)'
    ctx.font = 'bold 12px monospace'
    ctx.textAlign = 'center'
    ctx.fillText('r', (cx + px) / 2, (cy + py) / 2 - 7)

  } else if (beamOn && B_val <= 1e-15) {
    const gunTop = cy + tubeR * 0.7
    const beamTop = cy - tubeR * 0.7
    ctx.strokeStyle = beamColor + '0.12)'
    ctx.lineWidth = 12
    ctx.beginPath()
    ctx.moveTo(cx, gunTop)
    ctx.lineTo(cx, beamTop)
    ctx.stroke()

    ctx.strokeStyle = beamColor + '0.35)'
    ctx.lineWidth = 5
    ctx.beginPath()
    ctx.moveTo(cx, gunTop)
    ctx.lineTo(cx, beamTop)
    ctx.stroke()

    ctx.strokeStyle = beamGlow + '0.9)'
    ctx.lineWidth = 2
    ctx.beginPath()
    ctx.moveTo(cx, gunTop)
    ctx.lineTo(cx, beamTop)
    ctx.stroke()

    particleAngle += 0.04
    const py = gunTop - ((particleAngle * 30) % (gunTop - beamTop))

    ctx.fillStyle = beamGlow + '0.25)'
    ctx.beginPath()
    ctx.arc(cx, py, particleR * 3, 0, Math.PI * 2)
    ctx.fill()

    ctx.fillStyle = '#aaffaa'
    ctx.beginPath()
    ctx.arc(cx, py, particleR, 0, Math.PI * 2)
    ctx.fill()

    ctx.fillStyle = '#64748b'
    ctx.font = 'bold 10px sans-serif'
    ctx.textAlign = 'center'
    ctx.fillText(t('experiments.emCanvasBeamStraight'), cx, cy - tubeR * 0.5)
  } else {
    if (B_val > 1e-15) {
      ctx.strokeStyle = 'rgba(34,197,94,0.08)'
      ctx.lineWidth = 2
      ctx.setLineDash([8, 8])
      ctx.beginPath()
      ctx.arc(cx, cy, visualR, 0, Math.PI * 2)
      ctx.stroke()
      ctx.setLineDash([])
    }
    ctx.fillStyle = '#64748b'
    ctx.font = 'bold 12px sans-serif'
    ctx.textAlign = 'center'
    ctx.fillText(t('experiments.emCanvasHeatFilament'), cx, cy - 10)
    ctx.font = '10px sans-serif'
    ctx.fillStyle = '#475569'
    ctx.fillText(t('experiments.emCanvasBeamAppears'), cx, cy + 8)
  }
}

function drawProbe(
  ctx: CanvasRenderingContext2D,
  w: number, h: number, cx: number, cy: number,
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
    ctx.fillText('📏', probeIconPos.x, probeIconPos.y + 7)
    ctx.font = '8px sans-serif'
    ctx.fillText(t('experiments.emCanvasRulerMeasure'), probeIconPos.x, probeIconPos.y + 35)
    ctx.fillStyle = '#64748b'
    ctx.font = '7px sans-serif'
    ctx.fillText(t('experiments.emProbeDragHint'), probeIconPos.x, probeIconPos.y + 45)
  }

  if (probeState === 'dragging' || probeState === 'placed') {
    const sx = (probePos.x - w / 2) * zoom + w / 2 + panX
    const sy = (probePos.y - h / 2) * zoom + h / 2 + panY

    const centerScreenX = (cx - w / 2) * zoom + w / 2 + panX
    const centerScreenY = (cy - h / 2) * zoom + h / 2 + panY
    ctx.strokeStyle = 'rgba(168,85,247,.4)'
    ctx.lineWidth = 1.5
    ctx.setLineDash([4, 4])
    ctx.beginPath()
    ctx.moveTo(centerScreenX, centerScreenY)
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
    ctx.fillText('📏', sx, sy + 6)

    if (probeState === 'placed') {
      const rVal = probeMeasured.r
      ctx.fillStyle = 'rgba(168,85,247,.1)'
      ctx.strokeStyle = 'rgba(168,85,247,.3)'
      ctx.lineWidth = 1
      ctx.beginPath()
      ctx.ellipse(cx, cy, rVal * zoom, rVal * zoom, 0, 0, Math.PI * 2)
      ctx.fill()
      ctx.stroke()

      ctx.fillStyle = '#1E2530'
      ctx.strokeStyle = 'rgba(168,85,247,.5)'
      ctx.lineWidth = 1
      ctx.beginPath()
      ctx.roundRect(sx + 20, sy - 20, 140, 40, 6)
      ctx.fill()
      ctx.stroke()

      ctx.fillStyle = '#a855f7'
      ctx.font = 'bold 10px monospace'
      ctx.textAlign = 'left'
      ctx.fillText(`r = ${rVal.toExponential(2)} m`, sx + 26, sy - 4)
      ctx.fillText(`r = ${(rVal * 100).toFixed(2)} cm`, sx + 26, sy + 10)
      ctx.fillStyle = '#64748b'
      ctx.font = '7px sans-serif'
      ctx.fillText(t('experiments.emCanvasStableRecord'), sx + 26, sy + 22)
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

  const { B_val, v_val, r_val } = computePhysics(currentV_val, currentI, currentN, props.R)
  const Fm_val = E_CHARGE * v_val * B_val

  const tubeR = Math.min(w, h) * 0.28
  currentTubeR = tubeR
  const coilR_px = tubeR * 1.15
  const coilFlatR = coilR_px * 0.28
  const coilOffset = tubeR * 0.55

  let visualR: number
  if (!isFinite(r_val) || r_val > R_MAX_VIS) {
    visualR = tubeR * 0.95
  } else {
    const tt = Math.sqrt(r_val / R_MAX_VIS)
    visualR = Math.max(8, tt * tubeR * 0.92)
  }

  const omega = B_val > 1e-15 ? Math.min(0.12, Math.max(0.02, Math.abs(E_CHARGE * B_val / E_MASS) * 5e-19)) : 0.03
  const beamOn = props.running && !props.paused

  ctx.fillStyle = '#0b1220'
  ctx.fillRect(0, 0, w, h)

  ctx.save()
  ctx.translate(w / 2 + panX, h / 2 + panY)
  ctx.scale(zoom, zoom)
  ctx.translate(-w / 2, -h / 2)

  drawHelmholtzCoil(ctx, cx - coilOffset, cy, coilR_px, coilFlatR, currentN, currentI)
  drawHelmholtzCoil(ctx, cx + coilOffset, cy, coilR_px, coilFlatR, currentN, currentI)

  drawTube(ctx, cx, cy, tubeR)

  drawFieldIndicators(ctx, cx, cy, tubeR, visualR, B_val, currentI)

  drawBeam(ctx, cx, cy, tubeR, visualR, B_val, omega, beamOn)

  drawElectronGun(ctx, cx, cy, tubeR, props.running, t('experiments.emCanvasGun'))

  drawLabels(ctx, w, h, currentV_val, currentI, currentN, B_val, v_val, r_val, Fm_val, beamOn, t)

  ctx.restore()

  drawProbe(ctx, w, h, cx, cy)
}

function loop() {
  try {
    if (props.running && !props.paused) {
      phase += 0.02
    }

    targetV = props.V
    targetI = props.I
    targetN = props.N
    currentV_val += (targetV - currentV_val) * 0.3
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

watch(() => [props.V, props.I, props.N], () => {
  particleTrail = []
})

watch(() => props.running, (running) => {
  if (!running) {
    particleTrail = []
    particleAngle = 0
  }
})
</script>

<template>
  <canvas ref="canvasRef" class="lorentz-canvas" />
</template>

<style scoped>
.lorentz-canvas { width: 100%; height: 100%; display: block; cursor: grab; }
.lorentz-canvas:active { cursor: grabbing; }
</style>
